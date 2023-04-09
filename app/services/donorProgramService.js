var donorPrograms = require('../models/donorPrograms');
var dbHelper = require('../utilities/databaseHelper');
const logHelper = require('../utilities/logHelper');
var constants = require('../constants');
const mongoose = require('mongoose');
const configuration = require('../../config/configuration');
var tokens = require('../tokenData');
const dateHelper = require('../utilities/dateHelper');
const stripeAPIHelper = require('../utilities/stripeAPIHelper');
const paymentService = require('../services/paymentService');
const emailService = require('../services/emailService');
const databaseHelper = require('../utilities/databaseHelper');
const genericHelper = require('../utilities/genericHelper');
const currencyController = require("../controllers/currencyController.js");
const currencyService = require("../services/currencyService.js");


//getLatestRateForProgram
module.exports = {
    getLatestRateForProgram
}
module.exports.getdonorProgramsListByUser = async function (userId,language, res) {
    const methodName = "getdonorProgramsListByUser";
    try {

        let donorObject = await dbHelper.getItem(constants.Database.Collections.DONR.dataKey, { user: userId }, { _id: 1 });

        let sortQ = { updated: -1 };
        let query = { "donor.donorId": mongoose.Types.ObjectId(donorObject._id), "isRecurringProgram": true };

        let resp = await dbHelper.getManyItems(constants.Database.Collections.DON_PRG.dataKey, query, undefined, sortQ);

        let listOfProgramNameWithSlug = [];

        if (resp) {
            for (let index = 0; index < resp.length; index++) {
                let donorProgramObject = resp[index];
                let donorProgramDetails = await dbHelper.getItems(constants.Database.Collections.DON_PRG_DET.dataKey, { "donorProgram._id": donorProgramObject._id });
                if (donorProgramDetails) {
                    let donorProgramDetailObject = getFailedPaymentDetail(donorProgramDetails, constants.PaymentStatus.Unpaid);
                    if (donorProgramObject.lastPaymentStatus == constants.PaymentStatus.Unpaid && donorProgramDetailObject) {
                        resp[index].updateCardUrl = configuration.changeCardDetails.pageUrl.replace(`[${tokens.common.DONOR_PROGRAM_DETAIL_ID}]`, donorProgramDetailObject._id);
                        resp[index].showUpdateCardLink = true;
                    }
                    else {
                        resp[index].showUpdateCardLink = false;
                    }

                    // If donorProgramDetail have only one entry 
                    if (donorProgramDetails.length == 1) {
                        resp[index].invoiceLink = donorProgramDetails[0].invoiceLink.substring(donorProgramDetails[0].invoiceLink.indexOf('/', 0), donorProgramDetails[0].invoiceLink.length);
                        resp[index].showInvoiceLink = true;
                    }
                    else if (donorProgramDetails.length > 1) {
                        resp[index].showInstallmentPlanLink = true;
                    }

                    let nextUnpaidPaymentDetails = getNextPaymentDetail(donorProgramDetails, constants.PaymentStatus.Unpaid);
                    if (nextUnpaidPaymentDetails) {
                        resp[index].nextBillingDate = nextUnpaidPaymentDetails.installmentDate;
                        resp[index].isAllPaid = false;
                    }
                    else{
                        resp[index].isAllPaid = true;
                        // All payments are paid for monthly and autorenew selection is on
                        if(donorProgramDetails.length > 0 && donorProgramObject.paymentPlan.Name == constants.PaymentPlans.MONTHLY)
                        {
                            donorProgramDetails.sort(function (a, b) {
                                return b.installmentNo - a.installmentNo;
                            });

                            resp[index].nextBillingDate = dateHelper.createUTCDate(dateHelper.addMonthsInDate(donorProgramDetails[0].installmentDate, 1, true));
                        }
                        else if(donorProgramDetails.length > 0 && donorProgramObject.paymentPlan.Name == constants.PaymentPlans.GIVE_ONCE)
                        {
                            donorProgramDetails.sort(function (a, b) {
                                return b.installmentDate - a.installmentDate;
                            });

                            resp[index].nextBillingDate = dateHelper.createUTCDate(dateHelper.addMonthsInDate(donorProgramDetails[0].installmentDate, 12, true));
                        }
                    }

                    let currentDate = dateHelper.createUTCDate(Date.now());
                    resp[index].disableAutoRenew = currentDate > resp[index].endDate ? true : false;

                    if(resp[index].program.programDetails.slug == constants.ProgramSlugs.orphanSponsorship){
                        if (currentDate > resp[index].endDate && currentDate < dateHelper.createUTCDate(dateHelper.addDaysInDate(resp[index].endDate, configuration.aytamunaReport.gracePeriodDays, true))) {
                            resp[index].subscriptionStatus = constants.SubscriptionStatus.GracePeriod;
                        }
                        else if(currentDate < resp[index].endDate)
                        {
                            resp[index].daysLeft = dateHelper.getDiffBetweenTwoDates(currentDate,resp[index].endDate,constants.MomentDateDifferenceUnits.Days);
                        }
                    }

                    if(resp[index].program.programDetails.slug == constants.ProgramSlugs.SadaqahADay && (resp[index].cancellationDate && resp[index].cancellationDate < resp[index].endDate && resp[index].endDate > currentDate))
                    {
                        resp[index].subscriptionStatus =  constants.SubscriptionStatus.Cancelled;
                    }

                    if(resp[index].program.programDetails.slug)
                    {
                        resp[index].program.programDetails.programName = await getUpdatedProgramNameByLanguage(resp[index].program.programDetails.slug,language,listOfProgramNameWithSlug);

                    }
                }


            }

            if(resp.length > 0)
            {
                return resp;
            }
            else
            {
                resp = [];
                resp.push({ "showMessage" : true});
                return resp;
            }

        }
    }
    catch (ex) {
        logHelper.logError(`${constants.LogLiterals.DONOR_PROGRAM_SERVICE}: ${methodName}: Error`, ex);
    }
}
module.exports.cancelSubscription = async function (req, res) {
    const methodName = "cancelSubscription";

    try {
        var stripeSubscriptionID = req.params.stripeSubscriptionId;
        if(stripeSubscriptionID)
        {
            let UpdateObj = {
                cancellationDate: dateHelper.createUTCDate(Date.now()),
                subscriptionStatus : constants.SubscriptionStatus.Inactive,
                cancelledBy : constants.SubscriptionCancelledBy.Donor
            };

            let donorProgram = await dbHelper.updateItem(constants.Database.Collections.DON_PRG.dataKey, { "stripeSubscriptionId": stripeSubscriptionID, isRecurringProgram: true, isRecurringProgram: { $exists: true } }, UpdateObj);

            var response = await stripeAPIHelper.retrieveSubscription(stripeSubscriptionID);

            if(response && response.status && response.status != constants.Stripe.SubscriptionStatuses.Canceled)
            {
                var response = await stripeAPIHelper.cancelSubscription(stripeSubscriptionID);

                logHelper.logInfo(`${constants.LogLiterals.DONOR_PROGRAM_SERVICE}: ${methodName}: Response received from stripe when canceling subscription with subscription ID ${stripeSubscriptionID}`, response);
            }

            await sendCancelationEmail(donorProgram.donor.donorName,donorProgram.endDate,donorProgram.donor.donoremail,donorProgram.donor.donorId);
            
            return true;

        }
    }
    catch (ex) {
        logHelper.logError(`${constants.LogLiterals.DONOR_PROGRAM_SERVICE}: ${methodName}: Error`, ex);
        return false;
    }
}
module.exports.toggleAutoRenewal = async function (req, res) {
    const methodName = "toggleAutoRenewal";
    let autoRenew = req.params.autoRenewFlag == 'true';
    let filterForQuery = {
        _id: req.params.donorProgramID
    };

    let payload = {
        isAutoRenewal: autoRenew
    };

    try {
        let donorProgramObject = await dbHelper.updateItem(constants.Database.Collections.DON_PRG.dataKey, filterForQuery, payload);
        if (donorProgramObject) {

            let subscriptionFromStripe = await stripeAPIHelper.retrieveSubscription(donorProgramObject.stripeSubscriptionId);
            logHelper.logInfo(`${constants.LogLiterals.DONOR_PROGRAM_SERVICE}: ${methodName}: Response received from stripe for subscription details for stripe subscription with ID ${donorProgramObject.stripeSubscriptionId}`, subscriptionFromStripe);


            if (subscriptionFromStripe && subscriptionFromStripe.status && subscriptionFromStripe.status == constants.Stripe.SubscriptionStatuses.Active) {
                let stripeResponse;
                let isSubscriptionPaused = subscriptionFromStripe.pause_collection != null;
                // Pause collection on stripe on auto renew unselect from UI
                if (!autoRenew && !isSubscriptionPaused) {
                    let donorProgramDetails = await dbHelper.getItems(constants.Database.Collections.DON_PRG_DET.dataKey, { "donorProgram._id": donorProgramObject._id }, { installmentNo: 1, installmentDate: 1 });

                    if (donorProgramDetails && donorProgramDetails.length > 0) {
                        // Sorting descending on installment number 
                        donorProgramDetails.sort(function (a, b) {
                            return b.installmentNo - a.installmentNo;
                        });

                        // Selecting last installment date from donorProgramDetails list
                        let lastInstallmentDate = donorProgramDetails[0].installmentDate;
                        let currentDate = dateHelper.createUTCDate(Date.now());

                        if (currentDate > lastInstallmentDate && currentDate <= donorProgramObject.endDate) {
                            // Going to pause collection when subscription  last payment is paid and end date is not reached yet
                            let parameter = {

                                pause_collection:
                                {
                                    behavior: constants.Stripe.PauseCollectionBehavior.Draft

                                }
                            };
                            stripeResponse = await stripeAPIHelper.updateSubscription(donorProgramObject.stripeSubscriptionId, parameter);
                            logHelper.logInfo(`${constants.LogLiterals.DONOR_PROGRAM_SERVICE}: ${methodName}: Response received from stripe when pausing stripe subscription with ID ${donorProgramObject.stripeSubscriptionId}`, stripeResponse);
                        }
                    }
                }
                else if (autoRenew && isSubscriptionPaused) {
                    // Resuming paused collection and charging any unpaid invoices which are drafted during paused duration
                    let parameter = {

                        pause_collection: ''
                    };

                    //Resuming paused subscription
                    stripeResponse = await stripeAPIHelper.updateSubscription(donorProgramObject.stripeSubscriptionId, parameter);
                    logHelper.logInfo(`${constants.LogLiterals.DONOR_PROGRAM_SERVICE}: ${methodName}: Response received from stripe when resuming stripe subscription with ID ${donorProgramObject.stripeSubscriptionId}`, stripeResponse);

                    // Charging unpaid draft invoices against the subscription ID
                    let payInvoiceResponse = await paymentService.payDraftInvoices(donorProgramObject.stripeSubscriptionId);
                    logHelper.logInfo(`${constants.LogLiterals.DONOR_PROGRAM_SERVICE}: ${methodName}: Response received from stripe when charging draft invoices which are present for subscription ID ${donorProgramObject.stripeSubscriptionId}`, payInvoiceResponse);

                }
            }

        }

        return donorProgramObject;
    }
    catch (ex) {
        logHelper.logError(`${constants.LogLiterals.DONOR_PROGRAM_SERVICE}: ${methodName}: Error`, ex);
    }
}
module.exports.insertDonorProgram = async function (req, res) {
    const methodName = "insertDonorProgram() in donorProgramServicejs";
    try {

        await dbHelper.insertItem(donorPrograms, req.body);
    }
    catch (ex) {
        logHelper.logError(`${constants.LogLiterals.DONOR_PROGRAM_SERVICE}: ${methodName}: Error`, ex);
    }
}
module.exports.getDonorProgramDetail = async function (donorProgramID) {
    const methodName = "getDonorProgramDetail() in donorProgramServicejs";
    var cumulativeAmount = 0;
    var totalAmountToPaid;
    var remainingAmount = 0;
    try {
        let donorProgramDetails = await dbHelper.getItems(constants.Database.Collections.DON_PRG_DET.dataKey, { "donorProgram._id": mongoose.Types.ObjectId(donorProgramID) });
        let donorProgram = await dbHelper.getItems(constants.Database.Collections.DON_PRG.dataKey, { "_id": mongoose.Types.ObjectId(donorProgramID) }, { currency: 1, totalSubscriptionAmount: 1, paymentPlan: 1, program : 1 });

        if (donorProgramDetails && donorProgram) {
            let program = await databaseHelper.getItem(constants.Database.Collections.PRGM.dataKey, { _id: mongoose.Types.ObjectId(donorProgram[0].program.programDetails._id) }, { donationProcess: 1 });
            let donationProcess = await databaseHelper.getItem(constants.Database.Collections.DON_PROC.dataKey, { _id: program.donationProcess[0] }, { subscriptionDetail: 1 });
            let noOfMonths = donationProcess.subscriptionDetail.duration.numOfMonths;

            totalAmountToPaid = donorProgram[0].totalSubscriptionAmount;
            for (let index = 0; index < donorProgramDetails.length; index++) {
                if( (donorProgramDetails[index].installmentNo - 1) %  noOfMonths == 0)
                {
                    totalAmountToPaid = donorProgramDetails[index].installmentNo == 1 ? (donorProgram[0].totalSubscriptionAmount) :  (donorProgramDetails[index].amount * noOfMonths);
                    cumulativeAmount = 0;
                }

                cumulativeAmount = cumulativeAmount + donorProgramDetails[index].amount;
                if (donorProgram[0].paymentPlan.Name == constants.PaymentPlans.MONTHLY) {
                    remainingAmount = totalAmountToPaid - cumulativeAmount;
                }

                donorProgramDetails[index].remainingAmount = remainingAmount;
                donorProgramDetails[index].currency = donorProgram[0].currency;
                if (donorProgramDetails[index].paymentStatus == constants.PaymentStatus.Paid && donorProgramDetails[index].invoiceLink != "") {
                    var substringAtIndex = donorProgramDetails[index].invoiceLink.indexOf('/', 0);
                    donorProgramDetails[index].invoiceLink = donorProgramDetails[index].invoiceLink.substring(substringAtIndex, donorProgramDetails[index].invoiceLink.length);
                }
            }
            return donorProgramDetails;
        }
    }
    catch (ex) {
        logHelper.logError(`${constants.LogLiterals.DONOR_PROGRAM_SERVICE}: ${methodName}: Error`, ex);
    }
}
function getFailedPaymentDetail(donorProgramDetail, paymentStatus) {
    return donorProgramDetail.find(function (el) {
        return el.paymentStatus === paymentStatus && el.paymentIntentId != null;
    });
}
function getNextPaymentDetail(donorProgramDetail, paymentStatus) {
    let paidDonorProgramDetail = donorProgramDetail.filter(function (el) {
        return el.paymentStatus === paymentStatus;
    });

    paidDonorProgramDetail.sort(function (a, b) {
        return a.installmentNo - b.installmentNo;
    });

    return paidDonorProgramDetail[0];
}
module.exports.getSponsorshipPlanRatesCurrencyWise = async function (req, res) {
    const methodName = "getSponsorshipPlanRatesCurrencyWise";
    try {
        let slug = req.query.slug;
        if (slug) {
            logHelper.logInfo(`donorProgramService: ${methodName}:  `);
            let resp = await getLatestRateForProgram(slug);
            res.status(200).send(resp);
        }
        else {
            res.status(200).send('no slug received');
        }
    }
    catch (ex) {
        logHelper.logError(` donorProgramService: ${methodName} : `, ex);
    }
}
async function getLatestRateForProgram(orphanSlug) {
    const methodName = "getLatestRateForProgram";
    try {
        logHelper.logInfo(`donorProgramService: ${methodName}:  `);
        let program = await databaseHelper.getItem(constants.Database.Collections.PRGM.dataKey, { slug: orphanSlug, language: constants.Languages.English.code }, { donationProcess: 1 });
        if (program) {
            let donationProc = await databaseHelper.getItem(constants.Database.Collections.DON_PROC.dataKey, { _id: program.donationProcess[0] }, { subscriptionDetail: 1, amount: 1 });
            if (donationProc) {
                let currencies = await currencyService.getAllCurrencies();
                if (currencies && currencies.length > 0) {
                   // currencies.push({ name: 'USD', rate: '1', symbol: '$' });
                    let numOfMonths = donationProc.subscriptionDetail.duration.numOfMonths ? donationProc.subscriptionDetail.duration.numOfMonths : 12;
                    let programBaseAmount = donationProc.amount;
                    let paymentPlan = [];
                    for (let j = 0; j < donationProc.subscriptionDetail.paymentPlan.length; j++) {
                        paymentPlan[j] = donationProc.subscriptionDetail.paymentPlan[j].Name;
                    }
                    let resultObj = {}
                    for (let k = 0; k < paymentPlan.length; k++) {
                        resultObj[paymentPlan[k]] = {}
                    }
                    for (let i = 0; i < currencies.length; i++) {
                        let fixedAmount;
                        // if (currencies[i].name == constants.Currencies.UnitedStateDollar) {
                        //     fixedAmount = Math.round(programBaseAmount).toFixed(2);
                        // } else {
                        //     fixedAmount = Math.round(genericHelper.currencyConversionFormula(currencies[i].rate * programBaseAmount)).toFixed(2);
                        // }
                        fixedAmount = Math.round(genericHelper.currencyConversionFormula(currencies[i].rate * programBaseAmount)).toFixed(2);
                        let amountPerOrphanPerMonth = Math.ceil((fixedAmount) / numOfMonths).toFixed(2); // monthly amount 
                        for (let k = 0; k < paymentPlan.length; k++) {
                            let amount = fixedAmount;
                            if (k > 0) {
                                amount = amountPerOrphanPerMonth
                            }
                            resultObj[paymentPlan[k]][currencies[i].name] = amount;

                        }

                    }
                    return resultObj;
                }


            }

        }

        return null;


    }
    catch (ex) {
        logHelper.logError(` donorProgramService: ${methodName} : `, ex);
        return null;
    }

}

async function getProgramNameByLanguage(programSlug,language)
{
    const methodName = "getProgramNameByLanguage";
    try{
        let program = await dbHelper.getItem(constants.Database.Collections.PRGM.dataKey, { slug: programSlug , language :  language}, { programName: 1 });
        if(program)
        {
            return program.programName;
        }
    }
    catch(ex)
    {
        logHelper.logError(` donorProgramService: ${methodName} : `, ex);
    }
}

async function getUpdatedProgramNameByLanguage(programSlug,language,listOfProgramNameWithSlug){
    var programName;
    var currentProgramObject = listOfProgramNameWithSlug.find(function (item) {
        return (item.slug == programSlug);
    });
    if(currentProgramObject)
    {
        programName = currentProgramObject.programName;
    }
    else
    {
        var object = {
            "slug" : programSlug,
            "programName" : await getProgramNameByLanguage(programSlug,language)
        }
        programName = object.programName;
        listOfProgramNameWithSlug.push(object);
    }
    return programName;
}

async function sendCancelationEmail(donorName,endedDate,donoremail,donorId) {
    const methodName = 'sendCancelationEmail';
    try{
        let dynamicFields = [];
        let language;

        if(donorId)
        {
            let donorObject = await databaseHelper.getItem(constants.Database.Collections.DONR.dataKey,
                {
                    _id: donorId
                },{user: 1});

            if(donorObject && donorObject.user)
            {
                let userObject = await databaseHelper.getItem(constants.Database.Collections.USR.dataKey,
                    {
                        _id: donorObject.user[0]
                    },{language: 1});

                    language = userObject.language;
            }

        }


        endedDate = language == constants.Languages.Arabic.code ? dateHelper.getDateInSpecificFormat(endedDate, true, 'DD-MMM-YY', constants.Languages.Arabic.locale) : language == constants.Languages.French.code ? dateHelper.getDateInSpecificFormat(endedDate, true, 'DD-MMM-YY', constants.Languages.French.locale) : dateHelper.getDateInSpecificFormat(endedDate, true, 'DD-MMM-YY');
        
        var emailTemplateName = `${constants.emailTemplates.SUBSCRIPTION_MANUAL_CANCELLED_EMAIL_FOR_SADAQAH_A_DAY}_${language}`;

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
        logHelper.logError(`donorProgramService: ${methodName}: Error while sending email`, error);
    }
}
