/* Import constants and helper functions */
const logHelper = require('../utilities/logHelper');
const stripeAPIHelper = require('../utilities/stripeAPIHelper')
const databaseHelper = require('../utilities/databaseHelper');
const constants = require('../constants');
const dateHelper = require('../utilities/dateHelper');
var FILE_NAME = "ORPHAN_SPONSORSHIP_SERVICE";
const genericHelper = require('../utilities/genericHelper');
var ObjectID = require('mongodb').ObjectID;
const configuration = require('../../config/configuration');
const currencyController = require("../controllers/currencyController.js");
const paymentService = require("../services/paymentService.js");
const donorProgramService = require('../services/donorProgramService.js');
const currencyService = require("../services/currencyService.js");


module.exports = {
    performRenewalForPaymentPlan,
    performRenewalForOneTime,
    updateRateJson
}

async function performRenewalForPaymentPlan(donProgDetId) {
    const methodName = "performRenewalForPaymentPlan";

    let responseDTO = {
        isSuccess: false,
        data: {},
        message: "You are not eligible for this action at the moment , please contact the administrator. Thank you",
        hasDonationItem: false,
        icon: "error"
    }

    try {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: perfrom renewal for subscription for new flow users having atleast one donation program detail`);

        let donProgDetail = await databaseHelper.getItem(constants.Database.Collections.DON_PRG_DET.dataKey, {
            _id: donProgDetId
        }, { stripeSubscriptionId: 1, installmentDate: 1 });

        if (donProgDetail) {
            let stripeSubscriptionId = donProgDetail.stripeSubscriptionId;

            // get stripe subscription status here and check 
            const stripeSubscription = await stripeAPIHelper.retrieveSubscription(stripeSubscriptionId);

            //  call method to check if subscription active on stripe 
            if (stripeSubscription && stripeSubscription.status == constants.Stripe.SubscriptionStatuses.Active) {

                let result = paymentService.handleSubscriptionOnStripe(stripeSubscription, false, null);
                if (result) {
                    responseDTO.isSuccess = true;
                    responseDTO.data = null;
                    responseDTO.message = "Your Orphan Sponsorship has been renewed";
                    responseDTO.hasDonationItem = false;
                    responseDTO.icon = "success";
                    return responseDTO;
                }
            }
            else {
                let existingDonationItem = await databaseHelper.getItem(constants.Database.Collections.DON_ITEM.dataKey, { "body.items.stripeDetail.subscription.id": stripeSubscriptionId }, {}, { sort: { _id: -1 } });
                // create donation item , with end date and rest flags with latest orphans 

                if (existingDonationItem) {

                    if (!existingDonationItem.donProgId) {

                        let updatedDonationItemObj = existingDonationItem;
                        let newdate = dateHelper.resetTimeToDayStart(dateHelper.addMonthsInDate(donProgDetail.installmentDate, 1, true), true);
                        let diff = dateHelper.getDiffBetweenTwoDates(donProgDetail.installmentDate, dateHelper.getDateNow(true), constants.DateUnit.Months);

                        // add filter in query to ensure gettign of right donorProgram
                        let donProg = await databaseHelper.getItem(constants.Database.Collections.DON_PRG.dataKey, {
                            stripeSubscriptionId: stripeSubscriptionId
                        }, { stripeSubscriptionId: 1, _id: 1, endDate: 1 });

                        let difference = dateHelper.getDiffBetweenTwoDates(dateHelper.getDateNow(true), donProg.endDate, constants.DateUnit.Days);

                        /* => To stop user from using link for two reasons 
                               1) User has already perfromed action so he can not perform it more than once 
                               2) User has failed to renew the subscription within the provided grace period and can not perfrom renewal of subscripton anymore
                           => difference between today and sponsorship end date, should be less than or equal to the renewal grace period( eligible to perfrom renewal)  */

                        if (difference <= configuration.Renewal.ThresholdDays) {

                            updatedDonationItemObj.body.stripeSubscriptionStartDate = newdate;
                            updatedDonationItemObj.body.noOfInstallments = diff && diff != 0 ? diff : 1;

                            updatedDonationItemObj.donProgId = donProg._id;
                            let donationRecu = await databaseHelper.getItems(constants.Database.Collections.DON_REC.dataKey, { stripeSubscriptionId: stripeSubscriptionId, freezed: false }, { orphan: 1 });

                            let itemIndex = existingDonationItem.body.items.findIndex(cItem => cItem.program.slug == constants.ProgramSlugs.orphanSponsorship);

                            // update orphans in dontaion item 
                            updatedDonationItemObj.body.items[itemIndex].orphans = [];
                            for (let j = 0; j < donationRecu.length; j++) {
                                updatedDonationItemObj.body.items[itemIndex].orphans.push(ObjectID(donationRecu[j].orphan._id));
                            }
                            updatedDonationItemObj.state = constants.Database.DonationItem.State.NotStarted;
                            delete updatedDonationItemObj._id;

                            const CURRENCY = updatedDonationItemObj.body.paymentTitle;
                            let currencyBasedAmount = await orphanSponsorshipService.updateRateJson(CURRENCY);

                            const PAYMENT_PLAN = updatedDonationItemObj.body.items[itemIndex].paymentPlan.Name;

                            updatedDonationItemObj.body.amount = updatedDonationItemObj.body.items[itemIndex].totalAmount = currencyBasedAmount[CURRENCY][PAYMENT_PLAN].amount * donationRecu.length;
                            updatedDonationItemObj.body.items[itemIndex].count = updatedDonationItemObj.body.items[itemIndex].itemCount = donationRecu.length;
                            updatedDonationItemObj.body.items[itemIndex].totalSubscriptionAmount = currencyBasedAmount[CURRENCY][PAYMENT_PLAN].totalAmount * donationRecu.length;

                            let dontationItemNew = await databaseHelper.insertItem(constants.Database.Collections.DON_ITEM.dataKey, updatedDonationItemObj);
                            responseDTO.isSuccess = true;
                            responseDTO.data.donationItem = dontationItemNew;
                            responseDTO.message = "";
                            responseDTO.hasDonationItem = true;
                            return responseDTO;
                        }
                        else {
                            responseDTO.message = "You are not eligible for this action at the moment , please contact the administrator. Thank you";
                            return responseDTO;
                        }

                    } else {

                        if (existingDonationItem.state == constants.Database.DonationItem.State.NotStarted) {
                            responseDTO.isSuccess = true;
                            responseDTO.data.donationItem = dontationItemNew;
                            responseDTO.message = "";
                            responseDTO.hasDonationItem = true;
                            return responseDTO;
                        } else {
                            responseDTO.message = "You are not eligible for this action at the moment , please contact the administrator. Thank you";
                            return responseDTO;
                        }


                    }
                }
            }
        }
        return responseDTO;

    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: performRenewalForPaymentPlan : `, err);
        return responseDTO;
    }
}

async function performRenewalForOneTime(donItemId, donId) {
    const methodName = "performRenewalForOneTime";

    let responseDTO = {
        isSuccess: false,
        data: {},
        message: "You are not eligible for this action at the moment , please contact the administrator. Thank you",
        hasDonationItem: false
    }
    try {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: perfrom renewal for subscription for old flow users having only donation and dontaion Item`);

        let existingDonationItem = await databaseHelper.getItem(constants.Database.Collections.DON_ITEM.dataKey, { _id: donItemId });
        let donation = await databaseHelper.getItem(constants.Database.Collections.DONATN.dataKey, { _id: ObjectID(donId) });// get donationObject here 
        if (existingDonationItem) {
            let updatedDonationItemObj = existingDonationItem;
            let startDate = dateHelper.resetTimeToDayStart(dateHelper.addMonthsInDate(donation.created, 12, true), true);
            let donationRecu = await databaseHelper.getItems(constants.Database.Collections.DON_REC.dataKey, {
                "donationDetails.donation._id": ObjectID(donId), freezed: false
            });
            let difference = dateHelper.getDiffBetweenTwoDates(dateHelper.getDateNow(true), donationRecu[0].endDate, constants.DateUnit.Days);

            /* => To stop user from using link for two reasons 
                1) User has already perfromed action so he can not perform it more than once 
                2) User has failed to renew the subscription within the provided grace period and can not perfrom renewal of subscripton anymore
            => difference between today and sponsorship end date, should be less than or equal to the renewal grace period( eligible to perfrom renewal)  */

            if (difference <= configuration.Renewal.ThresholdDays) {
                updatedDonationItemObj.body.stripeSubscriptionStartDate = startDate;
                let diff = 1;
                let itemIndex = existingDonationItem.body.items.findIndex(cItem => cItem.program.slug == constants.ProgramSlugs.orphanSponsorship);
                if (existingDonationItem.body.items[itemIndex].paymentPlan.Name == constants.PaymentPlans.MONTHLY) {
                    diff = dateHelper.getDiffBetweenTwoDates(startDate, dateHelper.getDateNow(true), constants.DateUnit.Months);

                    if (Date(dateHelper.addMonthsInDate(updatedDonationItemObj.body.stripeSubscriptionStartDate, diff, true)) <= Date(dateHelper.getDateNow(true))) {
                        diff = diff + 1;
                    }
                }
                updatedDonationItemObj.body.noOfInstallments = diff != 0 ? diff : 1;
                // updatedDonationItemObj.body.items[itemIndex].orphans = [];
                // for (let j = 0; j < donationRecu.length; j++) {
                //     updatedDonationItemObj.body.items[itemIndex].orphans.push(ObjectID(donationRecu[j].orphan._id));
                // }
                updatedDonationItemObj.state = constants.Database.DonationItem.State.NotStarted;
                let dontationItemUpdated = await databaseHelper.updateItem(constants.Database.Collections.DON_ITEM.dataKey, { _id: ObjectID(existingDonationItem._id) }, updatedDonationItemObj);

                responseDTO.isSuccess = true;
                responseDTO.data.donationItem = dontationItemUpdated;
                responseDTO.message = "";
                responseDTO.hasDonationItem = true;

                return responseDTO;
            }
            else {
                responseDTO.message = "You are not eligible for this action at the moment , please contact the administrator. Thank you";
                return responseDTO;
            }
        }
        return responseDTO;
    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: performRenewalForOneTime : `, err);
        return responseDTO;
    }
}


async function updateRateJson(currency) {
    const methodName = "updateRateJson";
    try {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: get exchange rate from api and setting json `);

        let currencyJSon = {};
        let updatedCurrencyWiseRates = await donorProgramService.getLatestRateForProgram(constants.ProgramSlugs.orphanSponsorship);
        let currencies = await currencyService.getAllCurrencies();

        for (let i = 0; i < currencies.length; i++) {
            let name = String(currencies[i].name);
            currencyJSon[name] = {
                'GIVE_ONCE': {
                    amount: parseFloat(updatedCurrencyWiseRates[constants.PaymentPlans.GIVE_ONCE][name]),
                    totalAmount: parseFloat(updatedCurrencyWiseRates[constants.PaymentPlans.GIVE_ONCE][name])
                },
                'MONTHLY': {
                    amount: parseFloat(updatedCurrencyWiseRates[constants.PaymentPlans.MONTHLY][name]),
                    totalAmount: parseFloat(updatedCurrencyWiseRates[constants.PaymentPlans.GIVE_ONCE][name])
                }
            }
        }


        return currencyJSon;
    }
    catch (ex) {
        logHelper.logError(`${FILE_NAME}: updateRateJson : `, ex);

    }

}



