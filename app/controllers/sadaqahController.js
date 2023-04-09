const sadaqahService = require('../services/sadaqahService');
let responseDTO = require('../models/custom/responseDTO');
const constants = require('../constants');
const logHelper = require('../utilities/logHelper');
const databaseHelper = require("../utilities/databaseHelper.js");
var ObjectID = require('mongodb').ObjectID;


module.exports.insertSadaqahDetails = async function (req, res) {

    try {
        await sadaqahService.insertSadaqahDetails(req, res);
    }
    catch (ex) { }
};

module.exports.getSadaqahDetailsReport = async function (req, res) {
    const methodName = "getSadaqahDetailsReport()";
    try {
        let objSadaqhDetails = await sadaqahService.getSadaqahDetailsReport(req.body.filter);
        if (objSadaqhDetails) {
            responseDTO.isSuccess = true;
            responseDTO.data = objSadaqhDetails
            res.status(200).send(responseDTO);
        }
    }
    catch (ex) {
        logHelper.logError(`${constants.LogLiterals.SADAQAH_CONTROLLER}: ${methodName}: Error`, ex);

        responseDTO.isSuccess = false;
        responseDTO.data = null;
        responseDTO.errorMessage = constants.Messages.ErrorMessage;
        res.status(500).send(responseDTO);
    }
};

module.exports.calculateSadaqah = async function (req, res) {
    const methodName = "calculateSadaqah()";
    try {
        const filterPayload = req.body;
        let successFlag = await sadaqahService.calculateSadaqah(filterPayload.sadaqahDate, filterPayload.useDatabaseValues, filterPayload.deleteExistingDonation);
        if (!successFlag)
            throw new Error('An error has occurred while calculating sadaqah')
        responseDTO.isSuccess = successFlag;
        responseDTO.data = successFlag;
        res.status(200).send(responseDTO);
    }
    catch (ex) {
        logHelper.logError(`${constants.LogLiterals.SADAQAH_CONTROLLER}: ${methodName}: Error`, ex);
        responseDTO.isSuccess = false;
        responseDTO.data = ex;
        responseDTO.errorMessage = constants.Messages.ErrorMessage;
        res.status(500).send(responseDTO);
    }
};

module.exports.renewSadaqah = async function (req, res) {

    try {
      const donationId = req.query.dId;
      const plan = req.query.plan;


      const donItem = req.query.donItem ? req.query.donItem : "";
      const donId = req.query.donId ? req.query.donId : "";
      const confirmed = req.query.confirmed ? true : false;

      if (donationId && plan) {
        try {
  
          let donationItemObject;
          if (donationId) {
            const renewalId = donationId + 'Sadaqah_' + plan;
  
            donationItemObject = sadaqahOp;

              donationItemObject.body.amount = 30 *   Number(plan) ;
              donationItemObject.body.items[0].totalAmount = 30 *   Number(plan);

            let renewalDonationItem = await databaseHelper.getItem(constants.Database.Collections.DON_ITEM.dataKey, { "body.renewal_Sadaqah_ID": renewalId }, { "_id": 1, "state": 1 });
            // console.log("renewalDonationItem");
            // console.log(renewalDonationItem);
            if (!renewalDonationItem) {
  
              let donations = await databaseHelper.getItem(constants.Database.Collections.DONATN.dataKey, { _id: ObjectID(donationId) });
              let donationDetails = await databaseHelper.getItem(constants.Database.Collections.DON_DET.dataKey, { _id: ObjectID(donations.donationDetails) });
              let donor = await databaseHelper.getItem(constants.Database.Collections.DONR.dataKey, { "_id": ObjectID(donations.donor[0]) }, {});

              if (donor && donor.user && donor.user[0]) {
                donationItemObject.body.donarEmail = donor.email;
                let donorUser = await databaseHelper.getItem(constants.Database.Collections.USR.dataKey, { "_id": ObjectID(donor.user[0]) }, {});
                if (donorUser) {
                  donationItemObject.body.selectedLang = donorUser.language;
                  donationItemObject.body.country = donorUser.countryOfResidence;
                }
              }
              if (!donationItemObject.body.country) {
                const countryId = donationDetails && donationDetails.countryOfResidence && donationDetails.countryOfResidence.length > 0 ? donationDetails.countryOfResidence[0] : null;
                let donorCountry = null;
                console.log(countryId);
                if (countryId)
                  donorCountry = await databaseHelper.getItem(constants.Database.Collections.CON.dataKey, { "_id": ObjectID(countryId) }, {});
                donationItemObject.body.country = donorCountry;
              }
              //set country, donor details, currency, total amount, language in body
              donationItemObject.body.donar = donor;
              const donation = donationDetails ? donationDetails.donation : null;
              if (donation) {
                donationItemObject.body.paymentCurrency = donation.currency;
                CURRENCY = donationItemObject.body.paymentTitle = donation.currencyTitle;
  
                donationItemObject.body.items[0].currency.title = donation.currencyTitle;
                donationItemObject.body.items[0].currency.symbol = donation.currency;
              }
              donationItemObject.body.renewal_Sadaqah_ID = renewalId;
              //add new donation item
              renewalDonationItem = await databaseHelper.insertItem(constants.Database.Collections.DON_ITEM.dataKey, donationItemObject);
  
            }
            else {
              // check if donation item is processed
              const processedItem = await databaseHelper.getItem(constants.Database.Collections.DON_ITEM.dataKey, { "body.renewal_Sadaqah_ID": { $regex: ".*" + donationId + ".*" }, "state": "Processed" }, { "_id": 1, "state": 1 });
              if (processedItem) {
                renewalDonationItem = null;
              }
             
            }
            if (renewalDonationItem) {

              const redirectUrl = `${req.protocol}://${req.get('host')}/#/middle-work?donItem=${renewalDonationItem._id}&donId=${donationId}&sadaqah=true`;
              console.log('redirectUrl', redirectUrl);
              res.redirect(redirectUrl);
            }
            else {
              let message = 'Something went wrong, please contact administrator. Thank you.';
              let redirectUrl = `${req.protocol}://${req.get('host')}/#/stripe-checkout?message=${message}`;
              res.redirect(redirectUrl);
              // throw new Error("Something went wrong, please contact administrator. Thank you")
  
            }
          }
          else {
            throw new Error("Required parameters are missing")
          }
  
  
        }
        catch (err) {
          logHelper.logError(` sadaqahController: createRenewalDonationItemForSadaqah : `, err);
          res.status(400).send(err.message);
        }
      }



      if (donItem && donId && confirmed) {
        let redirectUrl = '';
        const success_url = encodeURL(`${req.protocol}://${req.get('host')}/#/success-checkout/?donationId=${donItem ? donItem : ''}`);
        req.session.isGuestUser = true;//allowing checkout page to be accessed as guest user
        redirectUrl = `${req.protocol}://${req.get('host')}/#/stripe-checkout?su=${success_url}&di=${donItem ? donItem : ''}`;
    
        res.redirect(redirectUrl);

      }
  
    }
    catch (err) {
      logHelper.logError(` sadaqahController: renewSadaqah : `, err);
      res.status(400).send(err.message);
    }
  
  }
  
  let sadaqahOp = {
  
    "state": "NotStarted",
    "body": {
      "amount": 30,
      "donar": {
        "user": ["60ed4313a77be28fbc6fb4e6"],
        "accountDetails": [],
        "isActive": true,
        "_id": "60ed4316a77be28fbc6fb4e7",
        "donarName": "muhamamd test",
        "email": "tes@test.com",
        "mobile": "+923462749995",
        "address": "",
        "created": "2021-07-13T07:39:02.315Z",
        "updated": "2021-07-13T07:39:26.580Z",
        "__v": 0,
        "stripeCustomerIds": [{
          "currency": "USD",
          "customerId": "cus_JqMxcLkgyE2ZI7"
        }]
      },
      "donarEmail": "tes@test.com",
      "selectedLang": "ENG",
      "items": [{
        "program": {
          "programType": [{
            "isActive": true,
            "created": "2021-07-13T11:21:46.649Z",
            "updated": "2019-12-26T11:02:04.181Z",
            "_id": "5a26519fb585eacb5e87c3bd",
            "language": "ENG",
            "programTypeName": "Sadaqah",
            "slug": "sadaqah",
            "content": "Sadaqah is the Arabic term for charity. It refers to the monetary assistance given to the poor and needy for the sake of Allah (SWT). There are many narrations and Quranic verses that indicate the importance and rewards for giving sadaqah. Money spent in charity is compared in the Holy Quran [2:261] to a seed sown in fertile land which produces seven hundred-fold or more."
          }],
          "programSubCategory": [],
          "donationProcess": [{
            "donationDuration": [{
              "_id": "5a572f8bb585eacb5e87c4ce",
              "donationDurationName": "Monthly",
              "noOfMonths": 1,
              "createdBy": "NA",
              "updatedBy": "NA",
              "updated": "2017-12-21T09:43:15.470Z",
              "created": "2017-12-21T09:43:15.470Z",
              "__v": 0,
              "language": "ENG"
            }, {
              "_id": "5a57300fb585eacb5e87c4cf",
              "donationDurationName": "Quarterly",
              "noOfMonths": 3,
              "createdBy": "NA",
              "updatedBy": "NA",
              "updated": "2017-12-21T09:43:15.470Z",
              "created": "2017-12-21T09:43:15.470Z",
              "__v": 0,
              "language": "ENG"
            }, {
              "_id": "5a573119b585eacb5e87c4d0",
              "donationDurationName": "Half Yearly",
              "noOfMonths": 6,
              "createdBy": "NA",
              "updatedBy": "NA",
              "updated": "2017-12-21T09:43:15.470Z",
              "created": "2017-12-21T09:43:15.470Z",
              "__v": 0,
              "language": "ENG"
            }, {
              "_id": "5a670f5cb585eacb5e87c4d1",
              "donationDurationName": "Yearly",
              "noOfMonths": 12,
              "createdBy": "NA",
              "updatedBy": "NA",
              "updated": "2017-12-21T09:43:15.470Z",
              "created": "2017-12-21T09:43:15.470Z",
              "__v": 0,
              "language": "ENG"
            }],
            "isSyed": false,
            "isMarhomeenName": false,
            "isCalendar": false,
            "isOtherFieldForNiyaz": false,
            "isOtherFieldForRP": false,
            "amount": 30,
            "isActive": true,
            "_id": "5add8e182dbc3f223c1acb82",
            "isRecurring": true,
            "isDuration": false,
            "isYearAround": false,
            "isCount": true,
            "countMin": "1",
            "countMax": "3",
            "interval": "1",
            "isAmount": true,
            "isMinimumAmount": true,
            "minimumAmount": 5,
            "updated": "2018-04-23T07:41:12.417Z",
            "created": "2018-04-23T07:41:12.417Z",
            "__v": 57,
            "durationEndDate": "03/28/2020",
            "durationStartDate": "03/11/2020",
            "subscriptionDetail": {
              "paymentPlan": [{
                "Name": "MONTHLY",
                "value": {
                  "FRN": "Donnez mensuellement",
                  "ARB": "تبرع شهريا",
                  "ENG": "Give Monthly"
                },
                "billingDetail": {
                  "interval": "month",
                  "interval_count": 1
                }
              }],
              "startImmediately": true,
              "duration": {
                "name": "LIFETIME",
                "numOfMonths": 1,
                "value": {
                  "FRN": "Durée de vie",
                  "ARB": "وقت الحياة",
                  "ENG": "Lifetime"
                }
              },
              "cancellationMode": "Allowed",
              "paymentChargeMessage": {
                "value": {
                  "FRN": "Veuillez noter que la <b>[currency][amount]</b> sera déduit mensuellement.",
                  "ARB": "الرجاء ملاحظة أنه سيتم خصم <b> [currency][amount] </ b> شهريًا",
                  "ENG": "Please note that the <b>[currency][amount]</b> will be deducted monthly."
                }
              },
              "cancellationMessage": {
                "value": {
                  "FRN": "Vous pouvez <b>annuler</b> l'abonnement mensuel <b>à tout moment</b>",
                  "ARB": "يمكنك <b> إلغاء </ b> الاشتراك الشهري <b> في أي وقت </ b>",
                  "ENG": "You may <b>cancel</b> the monthly subscription <b>anytime</b>"
                }
              }
            }
          }],
          "created": "2018-04-23T07:41:12.479Z",
          "_id": "5add8e182dbc3f223c1acb83",
          "programName": "Sadaqah a Day",
          "programDescription": "<p>Imam  Ja’far al-Sadiq (as) said: \"Hasten towards charity, the misfortunes do not  exceed it, and whoever takes it out at the beginning of the morning, Allah will  push away the evil of what comes down from heaven on that day. and if he takes  it out at the beginning of the night, Allah will push away the evil of what  comes down from heaven on that night\". </p><p>[Man  la yahdharahul Faqih vol 2 pg 67]</p><p> </p><p>This hadith shows us how important it is to  take out Sadaqah every sunrise and every sunset every single day. The  foundation, after much groundwork has finally been able to provide a service  that makes this possible while making sure it is done in accordance with the  fiqh rulings of all our grand marajae. </p><p>We will take out sadaqah <b>physically</b> on  your behalf at <b>your</b> sunrise and <b>your</b> sunset every day. These  timings will follow the timezone for the country selected at the time of  registration,</p><p><img alt=\"Image title\" class=\"fr-fin fr-dib\" src=\"uploads/105a.png\" width=\"536\"></p><p>By partaking in this unique sadaqah not only  will you receive a generous reward beyond measure, you will also be contributing  towards uplifting the lives of deserving beneficiaries that include orphans and  widows. </p><p>To make it easier for you, you can choose a  predetermined number of days for which time your sadaqah will be carried out. You can select 30 days, 90 days, 180 days or 365 days  from the date of your request.</p><p>Imam Ali (as) mentions “ When you are blessed with sustenance  then give generously” </p><p>[Ghurar ul Hikam]</p>",
          "imageLink": "105.png",
          "isActive": true,
          "updatedBy": "NA",
          "language": "ENG",
          "slug": "sadaqah-a-day",
          "isRecurringProgram": true
        },
        "totalAmount": 30,
        "isRecurring": false,
        "autoRenew": false,
        "isRecurringProgram": true,
        "paymentPlan": {
          "Name": "MONTHLY",
          "value": {
            "FRN": "Donnez mensuellement",
            "ARB": "تبرع شهريا",
            "ENG": "Give Monthly"
          },
          "billingDetail": {
            "interval": "month",
            "interval_count": 1
          }
        },
        "paymentType": "One Time",
        "currency": {
          "title": "USD",
          "symbol": "$",
          "currencyName": "United States Dollar"
        },
        "itemCount": 1,
        "subsIndex": 0
      }],
      "paymentCurrency": "$",
      "paymentTitle": "USD",
      "country": "Pakistan"
    }
  };
  

  function encodeURL(unencoded) {
    return encodeURIComponent(unencoded).replace(/'/g, "%27").replace(/"/g, "%22");
  }

  module.exports.performSadaqahSubscriptionEndedWork = async function (req, res) {
    const methodName = "performSadaqahSubscriptionEndedWork()";
    try {
        const filterPayload = req.body;
        let successFlag = await sadaqahService.performSadaqahSubscriptionEndedWork(filterPayload.executionDate);
        if (!successFlag)
            throw new Error('An error has occurred while performing sadaqah subscription ended work')
        responseDTO.isSuccess = successFlag;
        responseDTO.data = successFlag;
        res.status(200).send(responseDTO);
    }
    catch (ex) {
        logHelper.logError(`${constants.LogLiterals.SADAQAH_CONTROLLER}: ${methodName}: Error`, ex);
        responseDTO.isSuccess = false;
        responseDTO.data = ex;
        responseDTO.errorMessage = constants.Messages.ErrorMessage;
        res.status(500).send(responseDTO);
    }
};




