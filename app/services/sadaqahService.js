var configuration = require('../../config/configuration');
var constants = require('../constants');
var ObjectID = require('mongodb').ObjectID;

//Utilities
const currencyService = require('../services/currencyService.js');
const logHelper = require('../utilities/logHelper');
const databaseHelper = require('../utilities/databaseHelper');
const dateHelper = require('../utilities/dateHelper');
const genericHelper = require("../utilities/genericHelper");
const apiHelper = require('../utilities/apiRequestHelper');
const exchangeRateHelper = require('../utilities/exchangeRateHelper');
const stripeApiHelper = require('../utilities/stripeAPIHelper');
const emailService = require('../services/emailService.js');
var tokens = require('../tokenData');

//Models
var donationDuration = require('../models/donationDuration.js');
var program = require('../models/program.js');
var donationDetail = require('../models/donationDetail.js');
var country = require('../models/country.js');
var sadaqahDetails = require('../models/sadaqahDetail.js');
var currency = require('../models/currency.js');
var donor = require('../models/donar.js');

//Custom Models
let resSadaqahDetails = require('../models/custom/resSadaqahDetails');

//Global Varaiable
var daysInMonth = 30;
let donationDurationList;
let programIds;
let donorDetails = [];
let DAY_START_TIME = 'T00:00:00.000Z';
let DAY_END_TIME = 'T23:59:59.000Z';
let HOURS_IN_DAY = 24;


module.exports.calculateSadaqah = async function (sadaqahDate, useDatabaseValues, deleteExistingDonations) {
    methodName = 'calculateSadaqah()';
    let donationDetailToProcess = [];
    let currencyRates = [];
    let countryData = [];
    let listofCountries = [];
    let currentUTCDate;
    let sadaqahUTCDate;
    try {
        currentUTCDate = new Date(new Date().toUTCString());

        //sadaqahDate is configurable from environment varaiable
        sadaqahUTCDate = sadaqahDate;

        await getDonationDurationFromDB();

        await getSadaqahADayProgramIds();

        await setEndDateofDonationDetail();

        donationDetailToProcess = await getDonationDetailItemsToProcess(listofCountries, sadaqahUTCDate, currentUTCDate);

        currencyRates = await populateCurrencyRate(useDatabaseValues, sadaqahUTCDate);// Get and update currency rates in database

        countryData = await populateCountryData(listofCountries, useDatabaseValues, sadaqahUTCDate);

        //Actual calculation logic to be performed if any record qualified for calculation
        if (donationDetailToProcess.length > 0) {
            logHelper.logInfo(`${constants.LogLiterals.SADAQAH_SERVICE}: ${methodName}: Start performing calculation for selected sadaqah entries `);

            if (deleteExistingDonations) {
                await deleteExistingSadaqahDetailRecords(sadaqahUTCDate);
            }

            await createSadaqahDetailList(donationDetailToProcess, currencyRates, countryData, sadaqahUTCDate, deleteExistingDonations);

            logHelper.logInfo(`${constants.LogLiterals.SADAQAH_SERVICE}: ${methodName}: Sucessfully performed the calculaton job `);
        }
        else {
            logHelper.logInfo("No transaction is qualified for sadaqah calculation for date:" + sadaqahUTCDate);
        }

    }
    catch (ex) {
        logHelper.logError(`${constants.LogLiterals.SADAQAH_SERVICE}: ${methodName}: Error`, ex);
        return false;
    }

    return true;
};

async function getDonationDetailItemsToProcess(listofCountries, sadaqahUTCDate, currentUTCDate) {
    const methodName = "updateSadaqahDonationStatus";
    logHelper.logInfo(`${constants.LogLiterals.SADAQAH_SERVICE}: ${methodName}: Preparing to update donar sadaqah donation status.`);
    let donationDetailItem;
    let selectedDonationDetailItems = [];

    // Filter to get those records which have sadaqah-a-day program id and sadaqah date is between start date and end date
    const dtStart = sadaqahUTCDate + DAY_START_TIME;
    const dtEnd = sadaqahUTCDate + DAY_START_TIME;
    let filterForDonation = {
        program: {
            $in: programIds
        },
        $and: [{ created: { $lt: new Date(dtStart) } }, {
            endDate
                : { $gte: new Date(dtEnd) }
        }]
    };
    var donationsOfSadaqah = await databaseHelper.getManyItems(donationDetail, filterForDonation);

    for (let i = 0; i < donationsOfSadaqah.length; i++) {
        donationDetailItem = await checkAndUpdateDonationDetailStatus(donationsOfSadaqah[i], listofCountries, currentUTCDate);

        if (donationDetailItem != false && donationDetailItem != undefined && donationDetailItem.length != 0) {
            selectedDonationDetailItems.push(donationDetailItem);
        }
    }

    logHelper.logInfo(`${constants.LogLiterals.SADAQAH_SERVICE}: ${methodName}: Sucessfully updated donar sadaqah donation status of ${selectedDonationDetailItems.length} rows.`);

    return selectedDonationDetailItems

}

async function checkAndUpdateDonationDetailStatus(donationDetailItem, listofCountries, currentUTCDate) {
    const methodName = "checkAndUpdateDonationDetailStatus";
    let filterForQuery = {
        _id: donationDetailItem._id
    };

    let payload = {
        lastReadByJobAt: currentUTCDate
    };

    if (donationDetailItem && donationDetailItem.countryOfResidence && donationDetailItem.countryOfResidence.length > 0) {
        listofCountries.push(donationDetailItem.countryOfResidence[0].toString());
    }
    else {
        logHelper.logError(`${constants.LogLiterals.SADAQAH_SERVICE}: ${methodName}: Error : Country not found in donationDetail record with id ${donationDetailItem._id} `);
        return false;// Skip this record for sadaqah calculation
    }

    return await databaseHelper.updateItem(donationDetail, filterForQuery, payload);
}

async function getSunsetAndSunriseTime(listofCountries, sadaqahUTCDate) {
    const methodName = 'getSunsetAndSunriseTime';
    let sunsriseSunsetObject;
    let sunriseSunsetResponse = [];
    let countryInfoFromDB;
    listofCountries = listofCountries.filter(function (item, pos) {
        return listofCountries.indexOf(item) == pos;
    });

    countryInfoFromDB = await getCountryFromDB(listofCountries);
    try {

        for (let index = 0; index < countryInfoFromDB.length; index++) {
            var apiResponseObject = await CallSunriseSunsetAPI(countryInfoFromDB[index].latitude, countryInfoFromDB[index].longitude, 0, dateHelper.getDateInSpecificFormat(sadaqahUTCDate, false, 'YYYY-MM-DD'));

            if (apiResponseObject.status == 'OK') {
                sunsriseSunsetObject = {
                    countryId: countryInfoFromDB[index]._id.toString(),
                    countryName: countryInfoFromDB[index].name,
                    sunriseUTCDate: apiResponseObject.results.sunrise,
                    sunsetUTCDate: apiResponseObject.results.sunset
                };

                sunriseSunsetResponse.push(sunsriseSunsetObject);
            }
        }

        return sunriseSunsetResponse;
    }
    catch (err) {
        logHelper.logError(`${constants.LogLiterals.SADAQAH_SERVICE}: ${methodName}: Error : sunrise sunset data not received from api`, err);
        return sunriseSunsetResponse;
    }
}

async function getCurrencyRateFromAPI(sadaqahUTCDate) {
    const methodName = 'getCurrencyRateFromAPI';
    let exchangeRateApiUrl;
    let currencyRatesFromAPI;

    try {
        // exchangeRateApiUrl = `${configuration.exchangeRate.apiUrl}${dateHelper.getDateInSpecificFormat(sadaqahUTCDate, true, 'YYYY-MM-DD')}?access_key=${configuration.exchangeRate.apiKey}&symbols=${constants.Currencies.BritishPound},${constants.Currencies.Euro}&base=${constants.Currencies.UnitedStateDollar}`;

        // const response = await apiHelper.sendRequest(exchangeRateApiUrl, apiHelper.HTTPMethods.GET, null, null);

        /// dynamic currency change to be applied
        const response = await exchangeRateHelper.getCurrencyRates(dateHelper.getDateInSpecificFormat(sadaqahUTCDate, false, 'YYYY-MM-DD'));

        currencyRatesFromAPI = {
            from: constants.Currencies.UnitedStateDollar,
            date: sadaqahUTCDate,
            rates: response
            // rates: [
            //     {
            //         currencyCode: constants.Currencies.Euro,
            //         amount : response.rates.EUR,//euro equivalent of 1 USD
            //         amountInverse : 1/response.rates.EUR// dollar equivalent of 1 euro
            //     },
            //     {
            //         currencyCode: constants.Currencies.BritishPound,
            //         amount : response.rates.GBP,//pound equivalent of 1 USD
            //         amountInverse : 1/response.rates.GBP// dollar equivalent of 1 pound
            //     }
            // ]
        };
        return currencyRatesFromAPI;

    }
    catch (err) {
        logHelper.logError(`${constants.LogLiterals.SADAQAH_SERVICE}: ${methodName}: Error : currency rate data not received from api`,
            err);
        return undefined;
    }

}

async function CallSunriseSunsetAPI(latitude, longitude, format, date) {
    let sunriseSunsetApiUrl = `${configuration.sunriseSunset.apiUrl}json?lat=${latitude}&lng=${longitude}&formatted=${format}&date=${date}`;

    const response = await apiHelper.sendRequest(sunriseSunsetApiUrl, apiHelper.HTTPMethods.GET, null, null);

    return response;
}

async function createSadaqahDetailList(donationDetailToProcess, currencyRates, countryData, sadaqahUTCDate, deleteExistingDonations) {
    let sadaqahDetailsObject;
    for (let index = 0; index < donationDetailToProcess.length; index++) {

        //Current object to insert/update in sadaqahDetails
        sadaqahDetailsObject = await getSadaqahDetailObjectByDonationDetail(donationDetailToProcess[index], currencyRates, countryData, sadaqahUTCDate);

        //#region Sunrise
        sadaqahDetailsObject.type = constants.SunRotation.sunrise;
        sadaqahDetailsObject.gmtHour = parseInt(dateHelper.getDateInSpecificFormat(sadaqahDetailsObject.countryOfResidence.sunrise, true, 'HH'));
        sadaqahDetailsObject.gmtHourPlusOne = parseInt(sadaqahDetailsObject.gmtHour) == 23 ? 0 : parseInt(sadaqahDetailsObject.gmtHour) + 1;
        sadaqahDetailsObject.time = sadaqahDetailsObject.countryOfResidence.sunrise;

        const strDtFr = sadaqahUTCDate + DAY_START_TIME;
        const strDtTo = sadaqahUTCDate + DAY_END_TIME;
        let filterForSadaqaRecord = {
            'donor._id': ObjectID(sadaqahDetailsObject.donor._id),
            type: constants.SunRotation.sunrise,
            isDeleted: false,
            $and: [{ sadaqahDate: { $lte: new Date(strDtTo) } }, {
                sadaqahDate
                    : { $gte: new Date(strDtFr) }
            }],
            'donationDetail._id': sadaqahDetailsObject.donationDetail._id
        };
        //created or update sadaqahDetail for sunrise
        await createSadqaDetailRecord(sadaqahDetailsObject, filterForSadaqaRecord, deleteExistingDonations);

        //#endregion



        //#region Sunset
        sadaqahDetailsObject.type = constants.SunRotation.sunset;

        sadaqahDetailsObject.gmtHour = parseInt(dateHelper.getDateInSpecificFormat(sadaqahDetailsObject.countryOfResidence.sunset, true, 'H'));
        sadaqahDetailsObject.gmtHourPlusOne = parseInt(sadaqahDetailsObject.gmtHour) == 23 ? 0 : parseInt(sadaqahDetailsObject.gmtHour) + 1;
        sadaqahDetailsObject.time = sadaqahDetailsObject.countryOfResidence.sunset;

        filterForSadaqaRecord.type = constants.SunRotation.sunset;

        //created or update sadaqahDetail for sunset
        await createSadqaDetailRecord(sadaqahDetailsObject, filterForSadaqaRecord, deleteExistingDonations);

        //#endregion

    }
}

//#region

async function getSadaqahDetailObjectByDonationDetail(currentDonationDetail, currencyRates, countryData, sadaqahUTCDate) {
    let sadaqahDetailsObject = {};
    var donationDurationObject;
    var currencyObject;
    var noOfDays;

    sadaqahDetailsObject.donationDetail = { _id: currentDonationDetail._id, otherPersonalityName: currentDonationDetail.otherPersonalityName };

    sadaqahDetailsObject.donor = await getDonorInfo(currentDonationDetail.donation.donor[0]);

    sadaqahDetailsObject.sadaqahDate = sadaqahUTCDate;


    sadaqahDetailsObject.countryOfResidence = filtercountryInfo(currentDonationDetail.countryOfResidence[0].toString(), countryData);

    if (currentDonationDetail.additionalData && currentDonationDetail.additionalData.stripeSubscriptionId) {
        noOfDays = dateHelper.getDiffBetweenTwoDates(dateHelper.getDateInSpecificFormat(currentDonationDetail.created, true, 'YYYY-MM-DD'), dateHelper.getDateInSpecificFormat(currentDonationDetail.endDate, true, 'YYYY-MM-DD'), constants.MomentDateDifferenceUnits.Days);
        sadaqahDetailsObject.months = 1;// always one for recurring program as we are inserting new entry of sadaqahDetail on subsequent payments
    }
    else if (currentDonationDetail.otherPersonalityName) {
        donationDurationObject = filterDonationDuration(currentDonationDetail.otherPersonalityName);
        noOfDays = donationDurationObject.noOfMonths * 30;
        sadaqahDetailsObject.months = donationDurationObject.noOfMonths;
    }


    // dynamic currency change to be applied here 

    if (currentDonationDetail.donation.currencyTitle != constants.Currencies.UnitedStateDollar) {
        currencyObject = getCurrencyRateInUSDDollar(currentDonationDetail.donation.currencyTitle, currencyRates);
        sadaqahDetailsObject.rate = currencyObject.rateFromApi;
        // if (currentDonationDetail.donation.currencyTitle == constants.Currencies.Euro) {
        //     sadaqahDetailsObject.amountEUR = calculateSadaqahAmount(currentDonationDetail.amount, parseInt(donationDurationObject.noOfMonths), 1);
        // }
        // else if (currentDonationDetail.donation.currencyTitle == constants.Currencies.BritishPound) {
        //     sadaqahDetailsObject.amountGBP = calculateSadaqahAmount(currentDonationDetail.amount, parseInt(donationDurationObject.noOfMonths), 1);
        // }
        sadaqahDetailsObject.sadaqahAmount = calculateSadaqahAmount(currentDonationDetail.amount, parseInt(noOfDays), currencyObject.rateFromApi);
    }
    else {
        sadaqahDetailsObject.rate = 0;// zero when currency is dollar
        //  sadaqahDetailsObject.amountUSD = calculateSadaqahAmount(currentDonationDetail.amount, parseInt(donationDurationObject.noOfMonths), 1);
        sadaqahDetailsObject.sadaqahAmount = calculateSadaqahAmount(currentDonationDetail.amount, parseInt(noOfDays), 1);
    }
    sadaqahDetailsObject.donorCurrency = {
        currencyCode: currentDonationDetail.donation.currencyTitle,
        amount: calculateSadaqahAmount(currentDonationDetail.amount, parseInt(noOfDays), 1)
    }
    sadaqahDetailsObject.days = parseInt(noOfDays);


    return sadaqahDetailsObject;
}

async function createSadqaDetailRecord(sadaqahDetailsObject, filterForSadaqaRecord, deleteExistingDonations) {
    let sadaqahDetailsObjectFromDB = await databaseHelper.getSingleItem(sadaqahDetails, filterForSadaqaRecord);

    if (!sadaqahDetailsObjectFromDB) {
        //Insert
        await databaseHelper.insertItem(sadaqahDetails, sadaqahDetailsObject);
    }
    else {
        //check if need to soft delete existing sadaqahDetails record
        if (deleteExistingDonations) {
            await databaseHelper.insertItem(sadaqahDetails, sadaqahDetailsObject);
        }
        else {
            //update existing sadaqa detail record
            await databaseHelper.updateItem(sadaqahDetails, { _id: sadaqahDetailsObjectFromDB._id }, sadaqahDetailsObject, false);
        }
    }
}
function filtercountryInfo(countryID, countryInfoFromDB) {
    return countryInfoFromDB.find(function (item) {
        return (item._id.toString() === countryID);
    });
}

function filterSunriseSunsetData(countryInfoListFromAPI, countryID) {
    return countryInfoListFromAPI.find(function (item) {
        return (item.countryId === countryID);
    });
}

function filterDonationDuration(name) {
    return donationDurationList.find(function (el) {
        return el.donationDurationName === name;
    });
}

function getCurrencyRateInUSDDollar(baseCurrency, currencyRateFromDB) {
    return currencyRateFromDB.find(function (el) {
        return el.name === baseCurrency;
    });
}

function getCurrencyRateObjectFromApiList(currencyRatesFromAPI, baseCurrencyCode) {
    return currencyRatesFromAPI.rates.find(function (el) {
        return el.currencyCode === baseCurrencyCode;
    });
}

async function getDonorInfo(donorId) {
    const methodName = 'getDonorInfo';
    var objectFromDB;
    var selectedDonorObject = donorDetails.find(function (el) {
        return el._id.toString() === donorId.toString();
    });


    if (selectedDonorObject == undefined || selectedDonorObject.length == 0) {

        //get donor details from db
        objectFromDB = await databaseHelper.getManyItems(donor, { _id: donorId }, { _id: 1, donarName: 1 });

        if (objectFromDB != undefined) {
            var dbObj = {
                _id: objectFromDB[0]._id,
                donarName: objectFromDB[0].donarName
            }
            donorDetails.push(dbObj);
            return dbObj;
            ;
        }
        else {
            logHelper.logError(`${constants.LogLiterals.SADAQAH_SERVICE}: ${methodName}: Error : Could not found donor in donar table with ID ${donorId}`);
            return undefined;
        }
    }
    else {
        return selectedDonorObject;
    }
}

//#endregion

async function populateCurrencyRate(useDatabaseValues, sadaqahUTCDate) {
    var currencyRatesFromAPI = await getCurrencyRateFromAPI(sadaqahUTCDate);// Get currency rates equilance of 1 USD dollar from API

    let currencyDb = await currencyService.getAllCurrencies();
    if (useDatabaseValues) {
        if (currencyRatesFromAPI != undefined && currencyRatesFromAPI.rates != undefined && currencyRatesFromAPI.rates.length > 0) {
            for (let index = 0; index < currencyRatesFromAPI.rates.length; index++) {
                let payload = {
                    rateFromApi: currencyRatesFromAPI.rates[index].amount
                };
                await databaseHelper.updateItem(currency, { name: currencyRatesFromAPI.rates[index].currencyCode }, payload);


            }
        }
    }

    var currencyRatesFromDB = await getCurrencyRateFromDB();// Get currency rates from database

    currencyRatesFromDB = currencyRatesFromDB.filter(curr => curr.name != constants.Currencies.UnitedStateDollar);


    currencyRatesFromDB = currencyRatesFromDB.filter(curr => curr.name != constants.Currencies.UnitedStateDollar);
    if (!useDatabaseValues && currencyRatesFromAPI != undefined && currencyRatesFromAPI.rates != undefined
        && currencyRatesFromAPI.rates.length > 0) {
        for (let index = 0; index < currencyRatesFromDB.length; index++) {
            var currencyObject = getCurrencyRateObjectFromApiList(currencyRatesFromAPI, currencyRatesFromDB[index].name);
            currencyRatesFromDB[index].rateFromApi = currencyObject.amount;
        }
    }

    return currencyRatesFromDB;
}

async function getCurrencyRateFromDB() {
    return await databaseHelper.getManyItems(currency, {}, { name: 1, rateFromApi: 1 });
}

async function getCountryFromDB(listofCountries) {
    return await databaseHelper.getManyItems(country, {
        _id: {
            $in: listofCountries
        }
    });
}

async function getDonationDurationFromDB() {
    donationDurationList = await databaseHelper.getManyItems(donationDuration, {}, { donationDurationName: 1, noOfMonths: 1 });
}

async function populateCountryData(listofCountries, useDatabaseValues, sadaqahUTCDate) {
    var countryInfoFromDB;
    var sunriseSunsetResponse = await getSunsetAndSunriseTime(listofCountries, sadaqahUTCDate);//Get sunrise and sunrise time of countries from api

    if (useDatabaseValues) {
        //Updated sunrise and sunset time in database for the selected countries
        if (sunriseSunsetResponse != undefined && sunriseSunsetResponse.length > 0) {
            for (let index = 0; index < sunriseSunsetResponse.length; index++) {
                let payload = {
                    sunrise: sunriseSunsetResponse[index].sunriseUTCDate,
                    sunset: sunriseSunsetResponse[index].sunsetUTCDate
                };
                await databaseHelper.updateItem(country, { _id: sunriseSunsetResponse[index].countryId }, payload, true);
            }
        }
    }

    countryInfoFromDB = await getCountryFromDB(listofCountries);
    if (!useDatabaseValues && sunriseSunsetResponse != undefined && sunriseSunsetResponse.length > 0) {
        for (let index = 0; index < countryInfoFromDB.length; index++) {
            var countryObject = filterSunriseSunsetData(sunriseSunsetResponse, countryInfoFromDB[index]._id.toString());
            countryInfoFromDB[index].sunrise = countryObject.sunriseUTCDate;
            countryInfoFromDB[index].sunset = countryObject.sunsetUTCDate;
        }
    }

    return countryInfoFromDB;
}

async function deleteExistingSadaqahDetailRecords(sadaqahUTCDate) {
    const strDtFr = sadaqahUTCDate + DAY_START_TIME;
    const strDtTo = sadaqahUTCDate + DAY_END_TIME;
    let query = {
        isDeleted: false,
        $and: [{ sadaqahDate: { $lte: new Date(strDtTo) } }, {
            sadaqahDate
                : { $gte: new Date(strDtFr) }
        }]
    };

    await databaseHelper.updateManyItems(sadaqahDetails, query, { isDeleted: true });
}

function calculateSadaqahAmount(totalamount, noOfDays, currencyRate) {
    // divided currencyRate by one to get inverse currency rate
    // divide total result by 2 for segregation of sunrise and sinset
    return ((totalamount / (noOfDays)) * (1 / currencyRate)) / 2;
}

// Setting correct endDate for each DonationDetail record of sadaqa-a-day
async function setEndDateofDonationDetail() {
    let daysToAdd = 0;
    let startDate = new Date();
    let endDate = new Date();
    let donationDurationItem;
    let payload = {
        isEndDateUpdated: true
    };
    let filterForDonation = {
        program: {
            $in: programIds
        },
        $or: [{ isEndDateUpdated: false }, { isEndDateUpdated: null }]
    };

    let projection = {
        _id: 1,
        otherPersonalityName: 1,
        amount: 1,
        created: 1
    };

    var donationsToUpdateEndDate = await databaseHelper.getManyItems(donationDetail, filterForDonation, projection);
    if (donationsToUpdateEndDate) {
        for (let index = 0; index < donationsToUpdateEndDate.length; index++) {
            // Set end date only if otherPersonalityName have value (Old records before recurring)
            if (donationsToUpdateEndDate[index].otherPersonalityName) {
                donationDurationItem = filterDonationDuration(donationsToUpdateEndDate[index].otherPersonalityName);// otherPersonalityName have duration name like Monthly, Quaterly, Yearly etc
                if (donationsToUpdateEndDate[index].amount <= 60)
                    donationDurationItem = { noOfMonths: 1 };//setting default to monthly in case of amount less than equal to 60
                if (donationDurationItem != undefined) {

                    daysToAdd = (donationDurationItem.noOfMonths * daysInMonth);//Not adding extra one day

                    startDate = new Date(donationsToUpdateEndDate[index].created).toUTCString();

                    endDate = dateHelper.addDaysInDate(startDate, daysToAdd, true);

                    payload.endDate = endDate;

                    await databaseHelper.updateItem(donationDetail, { _id: donationsToUpdateEndDate[index]._id }, payload);
                }
                else {
                    logHelper.logError(`${constants.LogLiterals.SADAQAH_SERVICE}: ${methodName}: Error : ${donationsToUpdateEndDate[index].otherPersonalityName} is not a valid donation duration`, donationsToUpdateEndDate[index]);
                }
            }
        }
    }
}

async function getSadaqahADayProgramIds() {
    // Set filter to get Programs with slug name 'sadaqah-a-day'
    let filter = { slug: constants.ProgramSlugs.SadaqahADay };

    // Get all language entries of sadaqah a day program
    var sadaqahProgram = await databaseHelper.getManyItems(program, filter, { _id: 1 });

    programIds = sadaqahProgram.map(item => item._id); // Create array list of program ids
}

// dynamic currency changesss
module.exports.insertSadaqahDetails = async function (req, res) {
    const methodName = "insertSadaqahDetails";
    try {

        var objSadaqahDet = {
            donationDetail: { _id: req.body.donationDetail.object._id, otherPersonalityName: req.body.donationDetail.object.otherPersonalityName },
            donor: { _id: req.body.donor.object._id, donarName: req.body.donor.object.donorName },
            countryOfResidence: { _id: req.body.countryOfResidence.object._id },//add country name
            sadaqahDate: Date.now(),
            gmtHour: req.body.gmtHour,
            gmtHourPlusOne: req.body.gmtHourPlusOne,
            type: req.body.type,
            amountUSD: req.body.amountUSD,
            amountEUR: req.body.amountEUR,
            amountGBP: req.body.amountGBP,
            sadaqahAmount: req.body.sadaqahAmount,
            rate: req.body.rate,
            time: Date.now(),
            created: Date.now(),
            donorCurrency: req.body.donorCurrency
            //updated// add updated
        };

        let resp = await databaseHelper.insertItem(sadaqahDetails, objSadaqahDet);

        return resp;
    }
    catch (ex) {
        logHelper.logError(`${constants.LogLiterals.SADAQAH_SERVICE}: ${methodName}: Error`, ex);
    }
};

//TODO: FOr Later use to give listing of sadqa details without grouping
// module.exports.getSadaqahDetails = async function (filter) {
//     const methodName = "getSadaqahDetails";
//     try {

//         let filterClause = {};
//         //let searchPayload = {};
//         // searchPayload = {
//         //     sadaqahDate: 1,
//         //     gmtHour: 1,
//         //     gmtHourPlusOne: 1,
//         //     amountUSD: 1,
//         //     amountEUR: 1,
//         //     amountGBP: 1,
//         //     rate: 1,
//         //     type: 1,
//         //     sadaqahAmount: 1,
//         //     donationDetail: { otherPersonalityName: 1 },
//         //     donor: { donarName: 1 },
//         // }

//         if (filter) {
//             filterClause = makeJSONfilter(filter);
//         }
//         filterClause.isDeleted = false;

//        
//         let sadaqhDetails = await databaseHelper.getManyItems(saqadahDetails, filterClause, searchPayload);

//         if (sadaqhDetails) {
//             sadaqhDetails = sadaqhDetails.map(item => {
//                 item.gmtHourPlusOne = item._id;
//                 item.sadaqahAmount = item.sadaqahAmount ? parseFloat(item.sadaqahAmount) : 0;
//                 item.roundedSadaqahAmount = Math.ceil(item.sadaqahAmount);
//                 return item
//             })
//             resSadaqahDetails.totalSum = sadaqhDetails.sum("sadaqahAmount"),
//                 resSadaqahDetails.totalRoundedSum = sadaqhDetails.sum("roundedSadaqahAmount")
//             resSadaqahDetails.totalRecords = sadaqhDetails.length;
//         }
//         resSadaqahDetails.sadaqahData = sadaqhDetails;

//         return resSadaqahDetails;

//     }
//     catch (ex) {
//         logHelper.logError(`${constants.LogLiterals.SADAQAH_SERVICE}: ${methodName}: Error`, ex);
//         console.log(ex)
//     }
// };
Array.prototype.sum = function (prop) {
    var total = 0
    for (var i = 0, _len = this.length; i < _len; i++) {
        total += this[i][prop]
    }
    return total
}

module.exports.getSadaqahDetailsReport = async function (filter) {
    const methodName = "getSadaqahDetailsReport";
    try {

        let filterClause = {};
        if (filter) {
            filterClause = makeJSONfilter(filter);
        }
        filterClause.isDeleted = false;
        let groupPayload = [
            {
                $match: filterClause,
            },
            {
                $group: {
                    _id: "$gmtHourPlusOne",
                    sadaqahAmount: {
                        $sum: "$sadaqahAmount"
                    }
                }
            },
            {
                $project: {
                    sadaqahAmount: 1
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]
        let sadaqhDetails = await databaseHelper.getAggregateItems(sadaqahDetails, groupPayload);

        if (sadaqhDetails) {
            sadaqhDetails = sadaqhDetails.map(item => {
                item.gmtHourPlusOne = item._id;
                item.actualSadaqahAmount = item.sadaqahAmount ? parseFloat(item.sadaqahAmount) : 0;
                item.sadaqahAmount = Math.ceil(item.sadaqahAmount);
                return item
            })
        }

        for (let index = 0; index < HOURS_IN_DAY; index++) {
            var selectedDonorObject = sadaqhDetails.find(function (el) {
                return el._id === index;
            });
            if (!selectedDonorObject) {
                sadaqhDetails.push({
                    _id: index,
                    sadaqahAmount: 0,
                    gmtHourPlusOne: index,
                    actualSadaqahAmount: 0
                });
            }
        }

        sadaqhDetails.sort(function (a, b) {
            return parseFloat(a.gmtHourPlusOne) - parseFloat(b.gmtHourPlusOne);
        });

        resSadaqahDetails.sadaqahData = sadaqhDetails;
        resSadaqahDetails.totalSadaqahAmount = sadaqhDetails ? sadaqhDetails.sum("sadaqahAmount") : 0;
        resSadaqahDetails.totalActualSadaqahAmount = sadaqhDetails ? sadaqhDetails.sum("actualSadaqahAmount") : 0;
        resSadaqahDetails.totalRecords = sadaqhDetails ? sadaqhDetails.length : 0;
        return resSadaqahDetails;
    }
    catch (ex) {
        logHelper.logError(`${constants.LogLiterals.SADAQAH_SERVICE}: ${methodName}: Error`, ex);
        console.log(ex)
    }
};
function makeJSONfilter(request) {
    const methodName = "makeJSONfilter";
    try {

        let filterClause = {};

        for (i = 0; i < request.length; i++) {
            if (request[i].type == "date") {
                let createdFilter = {};
                const strDate = request[i].val ? request[i].val.split('T')[0] : null;
                if (strDate) {
                    const strDtFr = strDate + DAY_START_TIME;
                    const strDtTo = strDate + DAY_END_TIME;

                    createdFilter[constants.Operators.GreaterThanAndEqualTo] = new Date(strDtFr);
                    createdFilter[constants.Operators.LessThanAndEqualTo] = new Date(strDtTo);
                    filterClause[request[i].key] = createdFilter;
                }
            }
            else {
                filterClause[request[i].key] = request[i].val;
            }

        }

        return filterClause;
    }
    catch (ex) {
        logHelper.logError(`${constants.LogLiterals.SADAQAH_SERVICE}: ${methodName}: Error`, ex);
    }
}

module.exports.getApplicableDonationsForSadaqahReminder = async function () {
    const methodName = "getApplicableDonationsForSadaqahReminder";
    try {
        logHelper.logInfo(`${constants.LogLiterals.SADAQAH_SERVICE}: ${methodName}: getting applicable donar list`);

        let dateNow = dateHelper.getDateNow(true);
        let startDate = dateHelper.resetTimeToDayStart(dateNow);
        let endDate = dateHelper.resetTimeToDayEnd(dateNow);
        let programId = await getProgramIdsBasedOnSlug(constants.ProgramSlugs.SadaqahADay);
        let programArray = [];
        if (programId && programId.length > 0) {

            for (let k = 0; k < programId.length; k++) {
                let temp = {
                    program: programId[k]._id
                };
                programArray.push(temp);
            }

            let filterQuery = {
                $or: programArray,
                "additionalData.stripeSubscriptionId": { $exists: false },
                "endDate": { $gte: startDate, $lte: endDate }
            };

            let donationDetails = await databaseHelper.getItems(constants.Database.Collections.DON_DET.dataKey, filterQuery, { "donation": 1,endDate:1 });
            let links  = [];
            if(donationDetails)
            {
                for(let i = 0 ; i < donationDetails.length ; i++){
                    let dId = donationDetails[i].donation._id; 
                   let donorId = donationDetails[i].donation.donor[0];

                   let documentPathSplit = donationDetails[i].donation.documentPath.split('-')
                   let language = documentPathSplit[1]

                    let renewLinkPlan1 = configuration.app.appUrl + 'api/renewal/sadaqah?dId='+dId+'&plan=1' ;
                    let renewLinkPlan2 = configuration.app.appUrl + 'api/renewal/sadaqah?dId='+dId+'&plan=2';
                    let renewLinkPlan3 = configuration.app.appUrl + 'api/renewal/sadaqah?dId='+dId+'&plan=3' ;
                    let tempObj = {
                        donationId : dId,
                        donorId:donorId,
                        language:language,
                        endDate:donationDetails[i].endDate,
                        currency:donationDetails[i].donation.currency,
                        renewalLinks : {
                            plan1:renewLinkPlan1,
                            plan2:renewLinkPlan2,
                            plan3:renewLinkPlan3
                        }
                    }
                    links.push(tempObj);
                    
                }
                return links;
            }
        }
        return null;
    }
    catch (ex) {
        logHelper.logError(`${constants.LogLiterals.SADAQAH_SERVICE}: ${methodName}: Error`, ex);
        return null;
    }
}

async function getProgramIdsBasedOnSlug(slug) {
    const methodName = "getProgramIdsBasedOnSlug";
    try {
        let result = await databaseHelper.getItems(constants.Database.Collections.PRGM.dataKey, { slug: slug }, { _id: 1 });
        return result;
    }
    catch (ex) {
        logHelper.logError(`${constants.LogLiterals.SADAQAH_SERVICE}: ${methodName}: Error`, ex);
    }
}
module.exports.performSadaqahSubscriptionEndedWork = async function (executionDate) {

    try {
        let donorProgramList = await getDonorProgramOfSadaqah();

        await performCancelationWork(donorProgramList,executionDate);

        return true;

    }
    catch (ex) {
        logHelper.logError(`${constants.LogLiterals.SADAQAH_SERVICE}: ${methodName}: Error`, ex);
        return false;
    }
}

async function getDonorProgramOfSadaqah() {

    let filter = { 
        "program.programDetails.slug": constants.ProgramSlugs.SadaqahADay,
         "stripeSubscriptionId" : { $exists: true },
         "isRecurringProgram" : true,
         "lastPaymentStatus" : constants.PaymentStatus.Unpaid,
         "subscriptionStatus" : constants.SubscriptionStatus.Active,
         "cancellationDate" : null
    };

    var sadaqahDonorProgram = await databaseHelper.getItems(constants.Database.Collections.DON_PRG.dataKey, filter, { _id: 1, endDate : 1, stripeSubscriptionId  : 1, donor : 1 });

    return sadaqahDonorProgram;
}

async function performCancelationWork(donorProgramList,executionDate) {
    const methodName = 'performCancelationWork';
    let userLanguage = [];
    try{
        for(let index = 0; index < donorProgramList.length; index++)
        {
            var donorProgram = donorProgramList[index];
            let filter = { 
                 "stripeSubscriptionId" : donorProgram.stripeSubscriptionId,
                 "paymentStatus" : constants.PaymentStatus.Unpaid,
                 "donorProgram._id" : donorProgram._id
            };
            var donorProgramDetailObject= await databaseHelper.getItem(constants.Database.Collections.DON_PRG_DET.dataKey, filter, { _id: 1, installmentDate : 1 });

            if(donorProgramDetailObject)
            {
                var installmentDueDate = dateHelper.createUTCDate(donorProgram.endDate);
                var gracePeriodEndDate = dateHelper.createUTCDate(dateHelper.addDaysInDate(installmentDueDate, configuration.sadaqah.gracePeriodDays, true));
                var jobExecutionDate = dateHelper.createUTCDate(executionDate);
                var currentDate = dateHelper.createUTCDate(Date.now());
                //Grace period ends and need to end subscription
                if(jobExecutionDate > gracePeriodEndDate && jobExecutionDate <= currentDate)
                {
                    //Update donorProgram to mark subscription inactive
                    let updatedDonorProgram =await databaseHelper.updateItem(constants.Database.Collections.DON_PRG.dataKey,{_id: donorProgram._id},{subscriptionStatus : constants.SubscriptionStatus.Inactive, cancellationDate : currentDate, cancelledBy : constants.SubscriptionCancelledBy.Job});

                    //Cancel Subscription on stripe
                    let response = await stripeApiHelper.cancelSubscription(donorProgram.stripeSubscriptionId);

                    logHelper.logInfo(`${constants.LogLiterals.SADAQAH_SERVICE}: ${methodName}: Response receive of subscription cancelation on stripe `,response);

                    //Send email to subscriber/customer
                    await sendEmailForCancelation(donorProgram.donor.donorName,donorProgram.endDate,donorProgram.donor.donoremail,userLanguage,donorProgram.donor.donorId);

                }
            }
        }
    }
    catch(error)
    {
        logHelper.logError(`${constants.LogLiterals.SADAQAH_SERVICE}: ${methodName}: Error`, error);
    }
}

async function sendEmailForCancelation(donorName,endedDate,donoremail,userLanguage,donorId) {
    const methodName = 'sendEmailForCancelation';
    try{
        let dynamicFields = [];
        let language = await getUserLanguage(userLanguage,donorId);
        endedDate = language == constants.Languages.Arabic.code ? dateHelper.getDateInSpecificFormat(endedDate, true, 'DD-MMM-YY', constants.Languages.Arabic.locale) : language == constants.Languages.French.code ? dateHelper.getDateInSpecificFormat(endedDate, true, 'DD-MMM-YY', constants.Languages.French.locale) : dateHelper.getDateInSpecificFormat(endedDate, true, 'DD-MMM-YY');
        
        var emailTemplateName = `${constants.emailTemplates.SUBSCRIPTION_AUTO_CANCELLED_EMAIL_FOR_SADAQAH_A_DAY}_${language}`;

        dynamicFields.push({
            keyName: tokens.common.DONOR_NAME,
            value: donorName
        });

        dynamicFields.push({
            keyName: tokens.common.SUBSCRIPTION_END_DATE,
            value: endedDate
        });

        dynamicFields.push({
            keyName: tokens.emailTemplate.APP_URL,
            value: configuration.app.appUrl
        });

        var emailResponse = await emailService.sendEmailByTemplate(emailTemplateName,dynamicFields,undefined,donoremail);

        logHelper.logInfo(`${constants.LogLiterals.SADAQAH_SERVICE}: ${methodName}: Response receive when sending cancelation email for sadaqah`, emailResponse);

    }
    catch(error)
    {
        logHelper.logError(`${constants.LogLiterals.SADAQAH_SERVICE}: ${methodName}: Error while sending email`, ex);
    }
}

async function  getUserLanguage(userLanguage,donorId)
{
    var language;
    var selectedUserLanguage = userLanguage.find(function (el) {
        return el.donorID === donorId;
    });

    if(selectedUserLanguage)
    {
        language = selectedUserLanguage.language;
    }
    else
    {
        if(donorId)
        {
            let donorObject = await databaseHelper.getSingleItem(constants.Database.Collections.DONR.dataKey,
                {
                    _id: donorId
                },{user: 1});

            if(donorObject && donorObject.user)
            {
                let userObject = await databaseHelper.getSingleItem(constants.Database.Collections.USR.dataKey,
                    {
                        _id: donorObject.user[0]
                    },{language: 1});

                    userLanguage.push({
                        donorID: donorId,
                        language: userObject.language
                    });

                    language = userObject.language;
            }

        }
        
    }

    return language;
} 



