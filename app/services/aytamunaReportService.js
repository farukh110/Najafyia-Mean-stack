
var constants = require('../constants');
var configuration = require('../../config/configuration');

//Utilities
const logHelper = require('../utilities/logHelper');
const databaseHelper = require('../utilities/databaseHelper');
const dateHelper = require('../utilities/dateHelper');
const stripeAPIHelper = require('../utilities/stripeAPIHelper');
const emailService = require('../services/emailService.js');
const paymentService = require('../services/paymentService.js');
var tokens = require('../tokenData');
const { USER_AGENT_SERIALIZED } = require('stripe');
let userLanguage = [];

module.exports.updateStatusForAytamunaReport = async function (currentUTCDate) {
    methodName = 'updateStatusForAytamunaReport()';
    try {

        logHelper.logInfo(`${constants.LogLiterals.AYTAMUNA_REPORT_SERVICE}: ${methodName}: Start performing Status update`);

        await updateStatusUsingPaymentSchedule(currentUTCDate);

        await updateStatusWithoutPaymentSchedule(currentUTCDate);

        logHelper.logInfo(`${constants.LogLiterals.AYTAMUNA_REPORT_SERVICE}: ${methodName}: Successfully completed status update operation`);

    }
    catch (ex) {
        logHelper.logError(`${constants.LogLiterals.AYTAMUNA_REPORT_SERVICE}: ${methodName}: Error`, ex);
        return false;
    }

    return true;
};

//#region Set State Functions
async function updateStatusUsingPaymentSchedule(currentUTCDate) {
    const methodName = 'updateStatusUsingPaymentSchedule()';
    let donationRecurringObject;
    try {
        var query = {

            paymentSchedule: { $exists: true },
            "additionalData.program.slug": constants.ProgramSlugs.orphanSponsorship,
            stageTransition: { $nin: [constants.TransitionStage.End, constants.TransitionStage.Changed] }

        }

        var donationRecurringData = await databaseHelper.getItems(constants.Database.Collections.DON_REC.dataKey, query);
        if (donationRecurringData && donationRecurringData.length > 0) {

            logHelper.logInfo(`${constants.LogLiterals.AYTAMUNA_REPORT_SERVICE}: ${methodName}: New Records : ${donationRecurringData.length} items fetched`);
            for (let index = 0; index < donationRecurringData.length; index++) {
                donationRecurringObject = donationRecurringData[index];
                let lastPaymentSchedule;

                if (donationRecurringObject) {
                    if (donationRecurringObject.paymentSchedule && donationRecurringObject.paymentSchedule.length > 0) {
                        lastPaymentSchedule = donationRecurringObject.paymentSchedule.filter(function (el) {
                            return (el.status == constants.PaymentStatus.Unpaid && el.isActive == true);
                        });

                        // Last Unpaid
                        if (lastPaymentSchedule && lastPaymentSchedule.length > 0) {
                            //ascending sort on installment No
                            lastPaymentSchedule.sort(function (a, b) {
                                return a.installmentNo - b.installmentNo
                            });

                            let paymentScheduleUnpaidObject = lastPaymentSchedule[0];

                            var installmentDate = dateHelper.createUTCDate(paymentScheduleUnpaidObject.installmentDate);
                            //Installment date is not arrived yet
                            if (installmentDate >= currentUTCDate) {
                                var selectedPaidPaymentSchedule = donationRecurringObject.paymentSchedule.find(function (el) {
                                    return (el.status == constants.PaymentStatus.Paid && el.isActive == true);
                                });

                                if (selectedPaidPaymentSchedule) {

                                    if(donationRecurringObject.freezed == false)
                                    {
                                        logHelper.logInfo(`${constants.LogLiterals.AYTAMUNA_REPORT_SERVICE}: ${methodName}: New Records : Setting status to 'Active' when installment date is in future for donationRecurring id ${donationRecurringObject._id}`);

                                        //Update Donation Recurring object to set stage status 'Active' if orphan is not changed
                                        await updateDonationRecurringStatus(donationRecurringObject._id, constants.TransitionStage.Active);
                                    }
                                    else
                                    {
                                        logHelper.logInfo(`${constants.LogLiterals.AYTAMUNA_REPORT_SERVICE}: ${methodName}: New Records : Setting status to 'Changed' when orpahn is changed for donationRecurring id ${donationRecurringObject._id}`);

                                        //Update Donation Recurring object to set stage status 'Changed' if orphan is changed
                                        await updateDonationRecurringStatus(donationRecurringObject._id, constants.TransitionStage.Changed);
                                    }
                                }
                            }
                            else if (installmentDate < currentUTCDate) {
                                await operationDuringAndAfterGracePeriod(currentUTCDate, paymentScheduleUnpaidObject, donationRecurringObject, false, lastPaymentSchedule);

                            }
                        }
                        else {
                            //All installment paid
                            lastPaymentSchedule = donationRecurringObject.paymentSchedule.filter(function (el) {
                                return (el.status == constants.PaymentStatus.Paid && el.isActive == true);
                            });
                            //sort descending by Installment No
                            lastPaymentSchedule.sort(function (a, b) {
                                return b.installmentNo - a.installmentNo
                            });
                            await operationDuringAndAfterGracePeriod(currentUTCDate, lastPaymentSchedule[0], donationRecurringObject, true);

                        }

                    }
                }
            }
        }
    }
    catch (err) {

        logHelper.logInfo(`${constants.LogLiterals.AYTAMUNA_REPORT_SERVICE}: ${methodName}: Error... DonationReciurringId is.. ${donationRecurringObject._id}`, err);
    }
}

async function updateStatusWithoutPaymentSchedule(currentUTCDate) {
    const methodName = 'updateStatusWithoutPaymentSchedule()';
    let programIds = await getOrphanSponsorshipProgramIds();

    var query = {

        paymentSchedule: { $exists: false },
        program: {
            $in: programIds
        },
        stageTransition: { $nin: [constants.TransitionStage.End, constants.TransitionStage.Changed]}

    }

    var donationRecurringData = await databaseHelper.getItems(constants.Database.Collections.DON_REC.dataKey, query);

    if (donationRecurringData && donationRecurringData.length > 0) {

        logHelper.logInfo(`${constants.LogLiterals.AYTAMUNA_REPORT_SERVICE}: ${methodName}: Old Records : ${donationRecurringData.length} items fetched`);

        for (let index = 0; index < donationRecurringData.length; index++) {

            let donationRecurringObject = donationRecurringData[index];
            var onHoldPeriodEnd = dateHelper.createUTCDate(dateHelper.addDaysInDate(donationRecurringObject.endDate, configuration.aytamunaReport.gracePeriodDays, true));

            if ((currentUTCDate > donationRecurringObject.endDate && currentUTCDate <= onHoldPeriodEnd)) {

                logHelper.logInfo(`${constants.LogLiterals.AYTAMUNA_REPORT_SERVICE}: ${methodName}: Old Records : Setting status to 'OnHold' for donationRecurring id ${donationRecurringObject._id}`);

                //Setting 'OnHold' when sponsorship ends and grace period is active
                //Reason for setting 'OnHold' is that we don't want to display this record in aytamuna monthly report
                await updateDonationRecurringStatus(donationRecurringObject._id, constants.TransitionStage.OnHold);
            }
            else if (currentUTCDate > onHoldPeriodEnd) {

                logHelper.logInfo(`${constants.LogLiterals.AYTAMUNA_REPORT_SERVICE}: ${methodName}: Old Records : Setting status to 'Ended' for donationRecurring id ${donationRecurringObject._id}`);

                //Setting 'Ended' when sponsorship ends and grace period is also passed
                //Reason for setting 'Ended' is that we want to display this record in aytamuna monthly report for 'Ended' stage only
                await updateDonationRecurringStatus(donationRecurringObject._id, constants.TransitionStage.End, true);

                if (donationRecurringObject.orphan) {
                    // Set Orphan to inactive
                    await setOrphanInActive(donationRecurringObject.orphan.orphanId);
                }
            }

        }
    }
}
//#endregion

//#region Ended State
async function setOrphanInActive(orphanID) {
    await databaseHelper.updateManyItems(constants.Database.Collections.ORPN.dataKey, {
        orphanId: orphanID
    },
        {
            isActive: false,
        },
        false);
}

async function updatePaymentScheduleIsActiveStatus(currentUTCDate, donationRecurringID, PaymentScheduleUnpaidList) {
    if (PaymentScheduleUnpaidList && PaymentScheduleUnpaidList.length > 0) {
        PaymentScheduleUnpaidList = PaymentScheduleUnpaidList.filter(function (el) {
            return (dateHelper.createUTCDate(el.installmentDate) > currentUTCDate);
        });

        for (let index = 0; index < PaymentScheduleUnpaidList.length; index++) {

            await databaseHelper.updateItem(constants.Database.Collections.DON_REC.dataKey, {
                _id: donationRecurringID,
                "paymentSchedule.installmentNo": PaymentScheduleUnpaidList[index].installmentNo,
            },
                {
                    'paymentSchedule.$.isActive': false
                },
                false);
        }
    }
}

async function operationForStatusEnded(currentUTCDate, donationRecurringObject, lastPaymentSchedule,isAllPaid) {
    const methodName = 'operationForStatusEnded()';
    let language;
    var query = {
        stripeSubscriptionId: donationRecurringObject.stripeSubscriptionId,
        freezed: false
    }

    var orphanList = await databaseHelper.getItems(constants.Database.Collections.DON_REC.dataKey, query, {orphan : 1});
    orphanList = orphanList.map(i => i.orphan) || [];

    await updateDonationRecurringStatus(donationRecurringObject._id, constants.TransitionStage.End, true);

    if (donationRecurringObject.orphan) {
        // Set Orphan to inactive
        await setOrphanInActive(donationRecurringObject.orphan.orphanId);
    }

    //Update future payment schedule to IsActive false
    await updatePaymentScheduleIsActiveStatus(currentUTCDate, donationRecurringObject._id, lastPaymentSchedule);

    //Get donorProgram item
    let donorProgram = await databaseHelper.getSingleItem(constants.Database.Collections.DON_PRG.dataKey,
        {
            stripeSubscriptionId: donationRecurringObject.stripeSubscriptionId,
            isRecurringProgram: true
        });

    if (donorProgram && donorProgram.subscriptionStatus == constants.SubscriptionStatus.Active) {
        //Update DonorProgram Subscription status and cancellation date
        await databaseHelper.updateItem(constants.Database.Collections.DON_PRG.dataKey, {
            _id: donorProgram._id
        },
            {
                subscriptionStatus: constants.SubscriptionStatus.Inactive,
                cancellationDate: Date.now()
            },
            false);


        //Stripe subscription cancelation
        const response = await stripeAPIHelper.cancelSubscription(donationRecurringObject.stripeSubscriptionId);

        logHelper.logInfo(`${constants.LogLiterals.AYTAMUNA_REPORT_SERVICE}: ${methodName}: Response receive from stripe cancelation of subscription ID ${donationRecurringObject.stripeSubscriptionId}`, response);

        var selectedUserLanguage = userLanguage.find(function (el) {
            return el.donorID === donationRecurringObject.additionalData.donor._id;
        });

        if(selectedUserLanguage)
        {
            language = selectedUserLanguage.language;
        }
        else
        {
            if(donationRecurringObject.additionalData && donationRecurringObject.additionalData.donor && donationRecurringObject.additionalData.donor._id)
            {
                let donorObject = await databaseHelper.getSingleItem(constants.Database.Collections.DONR.dataKey,
                    {
                        _id: donationRecurringObject.additionalData.donor._id
                    },{user: 1});

                if(donorObject && donorObject.user)
                {
                    let userObject = await databaseHelper.getSingleItem(constants.Database.Collections.USR.dataKey,
                        {
                            _id: donorObject.user[0]
                        },{language: 1});

                        userLanguage.push({
                            donorID: donationRecurringObject.additionalData.donor._id,
                            language: userObject.language
                        });

                        language = userObject.language;
                }

            }
            
        }

        //Send Email for subscription ended at stripe
        if(donationRecurringObject.additionalData && donationRecurringObject.additionalData.donor && 
            donationRecurringObject.additionalData.donor.donoremail)
        {
            var emailTemplateName;
            let dynamicFields = [];

            if(isAllPaid)
            {
                emailTemplateName = `${constants.emailTemplates.SUBSCRIPTION_ENDED_EMAIL}_${language}`;
            }
            else
            {
                emailTemplateName = `${constants.emailTemplates.SUBSCRIPTION_CANCELLED_EMAIL}_${language}`;
            }

            dynamicFields.push({
                keyName: tokens.common.DONOR_NAME,
                value: donationRecurringObject.additionalData.donor.donorName
            });

            dynamicFields.push({
                keyName: tokens.emailTemplate.ORPHANS_LIST,
                value: orphanList && orphanList.length > 0 ? paymentService.insertOrphanDataInReceipt(orphanList, language) : ''
            });

            dynamicFields.push({
                keyName: tokens.emailTemplate.APP_URL,
                value: configuration.app.appUrl
            });

            var emailResponse = await emailService.sendEmailByTemplate(emailTemplateName,dynamicFields,undefined,donationRecurringObject.additionalData.donor.donoremail);

            console.log('*************** Email ***********');
            console.log(emailResponse);

        }
    }
}
//#region 

//#region General
async function updateDonationRecurringStatus(donationRecurringID, stage, freez) {

    const methodName = "updateDonationRecurringStatus";
    try {
        //Mustafa - 17 May 2021 
        //Making array of stageTransitionHistory

        let todaysDate = Date.now();
        let MonthYear = await dateHelper.getDateInSpecificFormat(todaysDate, false, 'MM-yyyy')


        let filter = { _id: donationRecurringID };
        let payloadHistory = { stageTransitionHistory: 1 };
        var stageHistory = await databaseHelper.getItem(constants.Database.Collections.DON_REC.dataKey, filter, payloadHistory);

        let stageTransitionHistoryArray = stageHistory.stageTransitionHistory ? stageHistory.stageTransitionHistory : [];

        let stageTransitionHistoryNotCurrentMonth = stageTransitionHistoryArray.filter(function (el) {
            return (el.stageTransitionMonthYear != MonthYear);
        });

        let stgHist =
        {
            stageTransition: stage,
            stageTransitionDate: new Date(todaysDate),
            stageTransitionMonthYear: MonthYear
        }


        stageTransitionHistoryNotCurrentMonth.push(stgHist);


        var payload = {
            stageTransition: stage,
            stageTransitionDate: todaysDate,
            stageTransitionHistory: stageTransitionHistoryNotCurrentMonth
        }

        if (freez) {
            payload.freezed = true;
        }

        await databaseHelper.updateItem(constants.Database.Collections.DON_REC.dataKey,
            {
                _id: donationRecurringID
            },
            payload,
            false);
    }
    catch (err) {
        logHelper.logError(`${constants.LogLiterals.AYTAMUNA_REPORT_SERVICE}: ${methodName}: Error`, err);
    }
}
async function operationDuringAndAfterGracePeriod(currentUTCDate, paymentScheduleObject, donationRecurringObject, isAllPaid, lastPaymentSchedule) {
    const methodName = 'operationDuringAndAfterGracePeriod()';

    if (!paymentScheduleObject)
        return;
    try {
        var installmentDate = dateHelper.createUTCDate(paymentScheduleObject.installmentDate);
        var gracePeriodEndDate = dateHelper.createUTCDate(dateHelper.addDaysInDate(installmentDate, configuration.aytamunaReport.gracePeriodDays, true));
        var onHoldPeriodEnd = dateHelper.createUTCDate(dateHelper.addDaysInDate(donationRecurringObject.endDate, configuration.aytamunaReport.gracePeriodDays, true));

        logHelper.logInfo(`${constants.LogLiterals.AYTAMUNA_REPORT_SERVICE}: ${methodName}: Installment Date : ${installmentDate}, Grace period end date : ${gracePeriodEndDate}, On Hold period end date : ${onHoldPeriodEnd}`);

        //This condition is for both paid or unpaid paymentScheduleObject object
        if (currentUTCDate <= gracePeriodEndDate) {
            if(donationRecurringObject.freezed == false)
            {
                logHelper.logInfo(`${constants.LogLiterals.AYTAMUNA_REPORT_SERVICE}: ${methodName}: New Records : Setting status to 'Active' when installment date is in past and grace period is active for donationRecurring id ${donationRecurringObject._id}`);

                //Update Donation Recurring object to set stage status 'Active'
                await updateDonationRecurringStatus(donationRecurringObject._id, constants.TransitionStage.Active);
            }
            else
            {
                logHelper.logInfo(`${constants.LogLiterals.AYTAMUNA_REPORT_SERVICE}: ${methodName}: New Records : Setting status to 'Changed' when orphan is changed for donationRecurring id ${donationRecurringObject._id}`);

                //Update Donation Recurring object to set stage status 'Active'
                await updateDonationRecurringStatus(donationRecurringObject._id, constants.TransitionStage.Changed);
            }
        }
        else if ((currentUTCDate > gracePeriodEndDate)) {

            //When all invoices are paid  
            if (isAllPaid) {
                if (donationRecurringObject.donationDetails && donationRecurringObject.donationDetails.additionalData && donationRecurringObject.donationDetails.additionalData.isAutoRenew == false) {
                    // All invoices are paid and auto renew is not selected
                    //onHoldPeriodEnd : Added grace period days (default 25) in end date of subscription  
                    if ((currentUTCDate >= donationRecurringObject.endDate && currentUTCDate <= onHoldPeriodEnd)) {
                        logHelper.logInfo(`${constants.LogLiterals.AYTAMUNA_REPORT_SERVICE}: ${methodName}: New Records (All paid) : Setting status to 'OnHold' when AutoRenew is false and grace period is active for donationRecurring id ${donationRecurringObject._id}`);

                        //Setting On hold when sponsorship ends and grace period is active
                        //Reason for setting on hold is that akhyar is not paying when sponsorship ends and grace period is active
                        await updateDonationRecurringStatus(donationRecurringObject._id, constants.TransitionStage.OnHold);
                    }
                    else if (currentUTCDate > onHoldPeriodEnd) {

                        logHelper.logInfo(`${constants.LogLiterals.AYTAMUNA_REPORT_SERVICE}: ${methodName}: New Records (All paid) : Setting status to 'Ended' when AutoRenew is false and grace period is passed for donationRecurring id ${donationRecurringObject._id}`);

                        //Setting ended when sponsorship ends and grace period is also passed
                        // Doing all operations requires when setting ended
                        await operationForStatusEnded(currentUTCDate, donationRecurringObject, lastPaymentSchedule,true);
                    }

                }
                else if (donationRecurringObject.donationDetails && donationRecurringObject.donationDetails.additionalData && donationRecurringObject.donationDetails.additionalData.isAutoRenew == true) {
                    //gracePeriodForRecurring : Added one month in current month installment date and then add  grace period days in that
                    var gracePeriodForRecurring = dateHelper.createUTCDate(dateHelper.addDaysInDate(dateHelper.createUTCDate(dateHelper.addMonthsInDate(installmentDate, 1, true)), configuration.aytamunaReport.gracePeriodDays, true));

                    // All invoices are paid and auto renew is selected
                    if (currentUTCDate > installmentDate && currentUTCDate <= gracePeriodForRecurring) {

                        if(donationRecurringObject.freezed == false)
                        {
                            logHelper.logInfo(`${constants.LogLiterals.AYTAMUNA_REPORT_SERVICE}: ${methodName}: New Records (All paid): Setting status to 'Active' when AutoRenew is true and grace period is active for donationRecurring id ${donationRecurringObject._id}`);

                            //Setting Active during grace period of last paid installment
                            //Reason for setting active is that akhyar is paying when sponsorship have auto renew selected
                            await updateDonationRecurringStatus(donationRecurringObject._id, constants.TransitionStage.Active);
                        }
                        else
                        {
                            logHelper.logInfo(`${constants.LogLiterals.AYTAMUNA_REPORT_SERVICE}: ${methodName}: New Records (All paid): Setting status to 'Changed' when orphan is changed for donationRecurring id ${donationRecurringObject._id}`);

                            //Setting Active during grace period of last paid installment
                            //Reason for setting active is that akhyar is paying when sponsorship have auto renew selected
                            await updateDonationRecurringStatus(donationRecurringObject._id, constants.TransitionStage.Changed);
                        }
                    }
                    else if (currentUTCDate > gracePeriodForRecurring) {

                        logHelper.logInfo(`${constants.LogLiterals.AYTAMUNA_REPORT_SERVICE}: ${methodName}: New Records (All paid): Setting status to 'Ended' when AutoRenew is true and grace period is passed for donationRecurring id ${donationRecurringObject._id}`);

                        // Set stage status to Ended of DonationRecurring when all invoice is paid and extra grace period is passed
                        await operationForStatusEnded(currentUTCDate, donationRecurringObject, lastPaymentSchedule,true);
                    }
                }
            }
            else {
                logHelper.logInfo(`${constants.LogLiterals.AYTAMUNA_REPORT_SERVICE}: ${methodName}: New Records : Setting status to 'Ended' when all invoices are not paid and grace period is passed for donationRecurring id ${donationRecurringObject._id}`);

                // Set stage status to Ended of DonationRecurring when invoice is unpaid and grace period is passed
                await operationForStatusEnded(currentUTCDate, donationRecurringObject, lastPaymentSchedule,false);
            }
        }
    }
    catch (err) {
        logHelper.logError(`${constants.LogLiterals.AYTAMUNA_REPORT_SERVICE}: ${methodName}: Error for donationRecurring id ${donationRecurringObject._id}`, err);
    }

}

async function getOrphanSponsorshipProgramIds() {
    // Set filter to get Programs with slug name 'orphan-sponsorship'
    let filter = { slug: constants.ProgramSlugs.orphanSponsorship };

    var orphanSponsorshipProgram = await databaseHelper.getManyItems(constants.Database.Collections.PRGM.dataKey, filter, { _id: 1 });

    var programIds = orphanSponsorshipProgram.map(item => item._id); // Create array list of program ids

    return programIds;
}

//#endregion