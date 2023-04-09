/* Import constants and helper functions */
const logHelper = require('../utilities/logHelper');
const databaseHelper = require('../utilities/databaseHelper');
const configuration = require('../../config/configuration');
const constants = require('../constants');
const dateHelper = require('../utilities/dateHelper');
var FILE_NAME = "SUBSEQUENT_PAYMENT_SERVICE";
const genericHelper = require('../utilities/genericHelper');
var ObjectID = require('mongodb').ObjectID;
var tokens = require('../tokenData');
var arabicDigit = require('arabic-digits');
var emailService = require('../services/emailService.js');
const stripeAPIHelper = require('../utilities/stripeAPIHelper');
const paymentService = require('../services/paymentService');
const donorProgramService = require('../services/donorProgramService.js');

module.exports = {

    performInvoicePaid,
    performInvoicePaymentFailed,
    perfromCustomerSubscriptionUpdated,
    performCustomerSubscriptionCancelled,
    correctSubsequentPaymentMissingData,
    performComputationForDraftInvoices

};




//#region Export Functions start

async function performInvoicePaid(invoiceObj) {

    installmentNumber = 1;
    //perform check if payment is not first and already recorded 
    let performWork = await verifyPaymentToBeRecorded(invoiceObj.subscription, invoiceObj.payment_intent);

    if (performWork) {

        let donProg = await databaseHelper.getItem(constants.Database.Collections.DON_PRG.dataKey, { "stripeSubscriptionId": invoiceObj.subscription, isRecurringProgram: true, isRecurringProgram: { $exists: true } });
        if (donProg) {
            let program = await databaseHelper.getItem(constants.Database.Collections.PRGM.dataKey, { _id: donProg.program.programDetails._id }, { slug: 1 });
            if (program) {
                if (program && program.slug) {
                    switch (program.slug) {
                        case constants.ProgramSlugs.orphanSponsorship:
                            await perfromInvoicePaidWorkForOrphanSponsorship(invoiceObj);
                            break;

                        case constants.ProgramSlugs.SadaqahADay:

                            await perfromInvoicePaidWorkForSadqahADay(invoiceObj, donProg);
                            break;


                        default:

                    }
                }
            }

        }





    }
    else {
        try {
            let performRenewalWork = await verifyIfRenewal(invoiceObj.subscription, invoiceObj.payment_intent, false);

            if (performRenewalWork.state) {
                noOfInstallment = performRenewalWork.data.donationItem.body.noOfInstallments;
                if (performRenewalWork.oldCase) {
                    // update Donation with new startDate
                    let doantionId = performRenewalWork.data.donationItem.body.renewalID.match(/(.{1,24})/g);

                    await databaseHelper.updateItem(constants.Database.Collections.DONATN.dataKey, {
                        _id: ObjectID(doantionId[0])
                    }, { stripeSubscriptionStartDate: performRenewalWork.data.donationItem.body.stripeSubscriptionStartDate });



                    let insertedDp = await insertDonorProgramForRenewal(performRenewalWork.data.donationItem, invoiceObj);
                    if (insertedDp) {
                        // var b = performRenewalWork.data.donationItem.body.renewalID.match(/(.{1,24})/g);
                        await perfromUpdationOfsupscriptionId(null, invoiceObj.subscription, true, doantionId[0]);

                        await perfromRenewalNextTenureWork(invoiceObj, performRenewalWork.data.donationItem);
                    }

                }
                else {


                    let subId = await databaseHelper.getItem(constants.Database.Collections.DON_PRG.dataKey, { _id: ObjectID(performRenewalWork.data.donationItem.body.donProgId) }
                        , { stripeSubscriptionId: 1 });

                    await perfromUpdationOfsupscriptionId(subId.stripeSubscriptionId, invoiceObj.subscription, false);
                    // update new subscription id in all objects 
                    // update donationRecurring , donorProgram , DPD, Dontaion , DOnationDetail

                    await perfromRenewalNextTenureWork(invoiceObj);
                }

                await verifyIfRenewal(invoiceObj.subscription, invoiceObj.payment_intent, true);
            }
        }
        catch (ex) {
            logHelper.logError(`${FILE_NAME}: performInvoicePaid :  caught in else of perfrom renewal work `, ex);
        }


    }
}


async function performInvoicePaymentFailed(invoiceObj) {
    let recordFailedpayment = await recordFailureForRenewals(invoiceObj);

    if (recordFailedpayment) {

        let donProg = await databaseHelper.getItem(constants.Database.Collections.DON_PRG.dataKey, { "stripeSubscriptionId": invoiceObj.subscription, isRecurringProgram: true, isRecurringProgram: { $exists: true } });
        if (donProg) {
            let program = await databaseHelper.getItem(constants.Database.Collections.PRGM.dataKey, { _id: donProg.program.programDetails._id }, { slug: 1 });
            if (program) {
                if (program && program.slug) {
                    switch (program.slug) {
                        case constants.ProgramSlugs.orphanSponsorship:
                            await perfromInvoiceFailureWorkOrphanSponosrship(invoiceObj);
                            break;

                        case constants.ProgramSlugs.SadaqahADay:
                            await perfromInvoiceFailureWorkSadqahADay(invoiceObj, donProg);
                            break;


                        default:

                    }
                }
            }

        }

    }

}

async function perfromCustomerSubscriptionUpdated(subscriptionObj) {

    if (subscriptionObj.status == constants.Stripe.SubscriptionStatuses.UnPaid) {
        //if unpaid email to operation team, store stripestatus
        // email to customer regarding unpaid invoice
    }

    if (subscriptionObj.metadata[constants.Stripe.MetaDataVariables.ResumeSubscriptionAt]) {
        await perfromSubscriptionUpdateWithBillingAnchor(subscriptionObj, constants.Stripe.MetaDataVariables.ResumeSubscriptionAt);
    }

    if (subscriptionObj.metadata[constants.Stripe.MetaDataVariables.DisableAutoAdvanceDate]) {
        await perfromSubscriptionUpdateWithBillingAnchor(subscriptionObj, constants.Stripe.MetaDataVariables.ResumeSubscriptionAt);
    }
    //storing stripe status 
    await updateDPwithSubscriptionStatus(subscriptionObj);

}


async function performCustomerSubscriptionCancelled(subscriptionObj) {


    let donProg = await databaseHelper.getItem(constants.Database.Collections.DON_PRG.dataKey, { "stripeSubscriptionId": subscriptionObj.id, isRecurringProgram: true, isRecurringProgram: { $exists: true } });
    if (donProg) {
        let program = await databaseHelper.getItem(constants.Database.Collections.PRGM.dataKey, { _id: donProg.program.programDetails._id }, { slug: 1 });
        if (program) {
            if (program && program.slug) {
                switch (program.slug) {
                    case constants.ProgramSlugs.orphanSponsorship:
                        // Update Donor Program with Status inactive 
                        await updateDPwithSubscriptionStatus(subscriptionObj);
                        // update payment schedule for current and future objects 
                        await updateDonationRecWithCancellationFuturePayments(subscriptionObj);
                        // update email donor to notify of cancellation 
                        break;

                    case constants.ProgramSlugs.SadaqahADay:
                        // Update Donor Program with Status inactive 
                        await updateDPwithSubscriptionStatus(subscriptionObj);
                        break;


                    default:

                }
            }
        }

    }


}


async function perfromRenewalNextTenureWork(invoiceObj, donationItem) {
    const methodName = "perfromRenewalNextTenureWork";
    try {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: checking if payment needs to perfrom renewal cases `);

        let res = await createPaymentScheduleForNextTenure(invoiceObj, donationItem);
        if (res && res.flag) {

            //updating Donor Programs
            let updatedDProg = await updateDonorProgram(invoiceObj, true, res.endDate);
            let itemLength = noOfInstallment ? noOfInstallment : 1;

            let invoiceNumbers = [];

            let numm = await paymentService.getInvoiceNumber();
            invoiceNumbers.push(numm);

            for (let jj = 1; jj < itemLength; jj++) {
                let newInvNum = paymentService.recieptNumberGenerator(invoiceNumbers[jj - 1]);
                invoiceNumbers.push(newInvNum);
            }
            // creating Installment Plan for Tenure     
            await createDonationProgramDetailsForNextTenure(invoiceObj, updatedDProg, res.noOfMonths, res.installmentNumber, invoiceNumbers);

            invoiceNum = invoiceNumbers[0];
            for (let jk = 0; jk < itemLength; jk++) {
                // Recording New Donation
                let newDonation = await insertInDonation(invoiceObj, updatedDProg);

                // Inserting new Donation Detail
                let donationDetail = await insertInDonationDetails(invoiceObj, updatedDProg, newDonation);

                let paid_at = genericHelper.convertUnixDateToISOfomrat(invoiceObj.status_transitions.paid_at);

                // Send email to donor with attached invoice receipt
                await sendEmailWithReceipt(newDonation.invoiceNo, invoiceObj.subscription, paid_at, newDonation, donationDetail.installmentNumber, true, genericHelper.convertUnixDateToISOfomrat(invoiceObj.created), constants.ProgramSlugs.orphanSponsorship);

                if (itemLength != (jk + 1)) {
                    invoiceNum = invoiceNumbers[jk + 1];
                    installmentNumber = (installmentNumber + 1);
                }
            }


        }

    }
    catch (ex) {
        logHelper.logError(`${FILE_NAME}: ${methodName}: `, ex);

    }

}

async function perfromUpdationOfsupscriptionId(oldSubscriptionId, newSubscriptionId, oldCase, donationId) {
    const methodName = "perfromUpdationOfsupscriptionId";
    try {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: checking if payment needs to perfrom renewal cases `);

        if (oldCase) {
            // update donationRecurring 

            let updateObj = {
                stripeSubscriptionId: newSubscriptionId
            };

            await databaseHelper.updateManyItems(constants.Database.Collections.DON_REC.dataKey, {
                "donationDetails.donation._id": ObjectID(donationId), freezed: false
            }, updateObj);

        }
        else {
            // update donation recuuring , donor program , donor program detail , 
            //donation , donationDetail  = in additonal detail 

            let stripeSubscriptionHistory = [];
            let oldSub = {
                stripeSubscriptionId: oldSubscriptionId,
                date: Date()
            }
            stripeSubscriptionHistory.push(oldSub);

            let updateObj = {
                stripeSubscriptionId: newSubscriptionId,
                stripeSubscriptionHistory: stripeSubscriptionHistory
            };

            await databaseHelper.updateItem(constants.Database.Collections.DON_PRG.dataKey, { stripeSubscriptionId: oldSubscriptionId, isRecurringProgram: true, isRecurringProgram: { $exists: true } }, updateObj);

            await databaseHelper.updateManyItems(constants.Database.Collections.DON_PRG_DET.dataKey, { stripeSubscriptionId: oldSubscriptionId }, updateObj);

            await databaseHelper.updateManyItems(constants.Database.Collections.DON_REC.dataKey, { stripeSubscriptionId: oldSubscriptionId, freezed: false }, updateObj);

            // doantion and donation detail need to be fetched and then updated
            await updateDonationAndDonationDetailStripeSubecription(oldSubscriptionId, newSubscriptionId);

        }

    }
    catch (ex) {
        logHelper.logError(`${FILE_NAME}: ${methodName}: `, ex);
    }
}


async function updateDonationAndDonationDetailStripeSubecription(oldsubscriptionId, newSubscriptionId) {

    const methodName = "updateDonationAndDonationDetailStripeSubecription";
    try {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: checking if payment needs to perfrom renewal cases `);

        let donations = await databaseHelper.getItems(constants.Database.Collections.DONATN.dataKey, { "additionalData.stripeSubscriptionId": oldsubscriptionId }, { additionalData: 1, _id: 1 });

        for (let k = 0; k < donations.length; k++) {

            let stripeSubscriptionHistory = [];
            let oldSub = {
                stripeSubscriptionId: oldSubscriptionId,
                date: Date()
            }
            stripeSubscriptionHistory.push(oldSub);
            let additonalData = donations[k].additionalData;
            additonalData.stripeSubscriptionId = newSubscriptionId;
            additonalData.stripeSubscriptionHistory = stripeSubscriptionHistory;

            await databaseHelper.updateItem(constants.Database.Collections.DONATN.dataKey, { _id: donations[k]._id }, { additionalData: additonalData });


        }

        let donationDetails = await databaseHelper.getItems(constants.Database.Collections.DON_DET.dataKey, { "additionalData.stripeSubscriptionId": oldsubscriptionId }, { additionalData: 1, _id: 1 });

        for (let k = 0; k < donationDetails.length; k++) {

            let stripeSubscriptionHistory = [];
            let oldSub = {
                stripeSubscriptionId: oldSubscriptionId,
                date: Date()
            }
            stripeSubscriptionHistory.push(oldSub);
            let additonalData = donationDetails[k].additionalData;
            additonalData.stripeSubscriptionId = newSubscriptionId;
            additonalData.stripeSubscriptionHistory = stripeSubscriptionHistory;

            await databaseHelper.updateItem(constants.Database.Collections.DON_DET.dataKey, { _id: donationDetails[k]._id }, { additionalData: additonalData });


        }



    }
    catch (ex) {
        logHelper.logError(`${FILE_NAME}: ${methodName}: `, ex);
    }
}


async function insertDonorProgramForRenewal(donationItem, invoiceObj) {
    const methodName = "insertDonorProgramForRenewal";
    try {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: inserting into Donor Program  `);

        try {
            var doantionIds = donationItem.body.renewalID.match(/(.{1,24})/g);

            let donationId = doantionIds[0]; // get donation ID here 
            let purchaseDatetime, paymentIntentId;
            let objDonation = await databaseHelper.getItem(constants.Database.Collections.DONATN.dataKey, { _id: ObjectID(donationId) });
            if (!objDonation)
                throw new Error("No donation found for the provided parameter");
            purchaseDatetime = objDonation.created; //donationItem.body.stripeSubscriptionStartDate;//   objDonation.created; // get date from doantionObjectHere
            paymentIntentId = invoiceObj.payment_intent; //objDonation.payment_intent_id;
            logHelper.logInfo(`${FILE_NAME}: renewOrphanSponsorshipWithoutPayment: Started processing successful payment`, paymentIntentId);
            let currentCartItems = donationItem.body.items.filter(cItem => cItem.stripeDetail.payment_intent.id === paymentIntentId);
            if (!currentCartItems || (currentCartItems && currentCartItems.length == 0)) {
                logHelper.logInfo(`${FILE_NAME}: onPaymentSucceeded: No cart items found to process`, paymentIntentId);
                return;
            }
            let stripeSubscriptionId = invoiceObj.subscription;//currentCartItems[0].stripeDetail.subscription.id;
            let stripeInvoiceId = invoiceObj.id; //currentCartItems[0].stripeDetail.invoice.id;

            const recurringProgram = currentCartItems.find(cItem => cItem.isRecurringProgram == true);
            let additionalData = {
                stripeSubscriptionId: stripeSubscriptionId,
            };
            if (recurringProgram) {
                additionalData.isRecurringProgram = recurringProgram.isRecurringProgram;
                additionalData.isAutoRenew = recurringProgram.isAutoRenew;
                additionalData.paymentPlan = recurringProgram.paymentPlan;
            }
            else {
                additionalData.isRecurringProgram = false;
                additionalData.paymentPlan = currentCartItems[0].paymentPlan;
            }

            //Step 5) update Donation entry , additional data
            // let newUpdatedDonation = await databaseHelper.updateItem(constants.Database.Collections.DONATN.dataKey, { _id: new ObjectID(objDonation._id) }, { additionalData: additionalData });
            // objDonation.additionalData = additionalData;
            //Step 6) Add entry to Donor Program
            let NO_OF_MONTHS = 0;
            for (let i = 0; i < currentCartItems.length; i++) {
                let cartItem = currentCartItems[i];
                //await Promise.all(currentCartItems.map(async function (cartItem) {
                try {
                    let START_DATE, END_DATE;
                    // ********** Calculation of start date, number of months and end date
                    START_DATE = purchaseDatetime;
                    const donationProcess = cartItem.program.donationProcess[0];
                    const subscriptionDetail = donationProcess ? donationProcess.subscriptionDetail : null;
                    if (subscriptionDetail && !subscriptionDetail.startImmediately) {
                        START_DATE = dateHelper.getStartOfNextMonth(START_DATE).toISOString();
                    }

                    NO_OF_MONTHS = paymentService.getNumberOfMonthsByProgram(cartItem, subscriptionDetail);

                    START_DATE = dateHelper.addMonthsInDate(START_DATE, NO_OF_MONTHS);


                    // while(END_DATE <= Date()){
                    END_DATE = dateHelper.addMonthsInDate(START_DATE, NO_OF_MONTHS);
                    // }

                    //Need to subtract 1 day from End Date.
                    END_DATE = dateHelper.subtractDaysFromDate(END_DATE, 1, null, null);

                    // ********** Calculation of start date, number of months and end date

                    let additionalMetadata = await paymentService.getAdditionalMetaInfo(cartItem);

                    // **************** Calculate Subscription Amount **************** 
                    let SUBSCRIPTION_AMOUNT;
                    if (cartItem && cartItem.paymentPlan && cartItem.paymentPlan.Name) {
                        SUBSCRIPTION_AMOUNT = (cartItem.paymentPlan.Name == constants.PaymentPlans.GIVE_ONCE) ? cartItem.totalAmount : cartItem.totalAmount * NO_OF_MONTHS;
                    }
                    else {
                        cartItem.totalAmount
                    }

                    const CHARGE = await stripeAPIHelper.retrieveCharge(invoiceObj.charge);
                    const charges = CHARGE ? CHARGE : { payment_method_details: { card: {} }, payment_method: "" };
                    const newInsertedDonorProgram = await paymentService.insertDonorProgram(cartItem, donationItem, START_DATE, END_DATE, additionalMetadata, stripeSubscriptionId, charges, purchaseDatetime, NO_OF_MONTHS, SUBSCRIPTION_AMOUNT);

                    return newInsertedDonorProgram;

                    //Orphan Scholorship


                }
                catch (err) {
                    logHelper.logError(`${FILE_NAME}: ${methodName}: Error in cart items loop`, err);
                    return null;
                    //throw new Error(err.message);
                }
            }
            //));  //end of main for loop 
        }
        catch (err) {
            logHelper.logError(`${FILE_NAME}: ${methodName}: Main method try catch :Error`, err);
            return null;
            //throw new Error(err.message);
        }

    }
    catch (ex) {
        logHelper.logError(`${FILE_NAME}: ${methodName}: `, ex);
        return null;
    }
}


async function recordFailureForRenewals(invoiceObj) {
    const methodName = "recordFailureForRenewals";
    try {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: checking if failure is for renwal case `);

        let filter = { "body.items.stripeDetail.subscription.id": invoiceObj.subscription, state: constants.Database.DonationItem.State.NotStarted, "body.items.stripeDetail.payment_intent.id": invoiceObj.payment_intent, $or: [{ "body.renewalID": { $exists: true } }, { "body.donProgId": { $exists: true } }] }

        let existingItem = await databaseHelper.getItem(constants.Database.Collections.DON_ITEM.dataKey, filter);

        if (existingItem) {
            return false;
        }
        else {
            // return that to perform normal processing
            return true;
        }
    }
    catch (exx) {
        logHelper.logError(`${FILE_NAME}: ${methodName}: `, exx);
        return null;
    }
}


async function verifyIfRenewal(subscriptionId, paymentIntentId, completed) {
    const methodName = "verifyIfRenewal";
    try {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: checking if payment needs to perfrom renewal cases `);

        let resp = {
            state: false,
            data: {},
            oldCase: false
        };

        let filter = { "body.items.stripeDetail.subscription.id": subscriptionId, state: completed ? constants.Database.DonationItem.State.InProcess : constants.Database.DonationItem.State.NotStarted, "body.items.stripeDetail.payment_intent.id": paymentIntentId, $or: [{ "body.renewalID": { $exists: true } }, { "body.donProgId": { $exists: true } }] }

        let updateObj = { state: completed ? constants.Database.DonationItem.State.Processed : constants.Database.DonationItem.State.InProcess };

        let donationItem = await databaseHelper.updateItem(constants.Database.Collections.DON_ITEM.dataKey, filter, updateObj);

        if (donationItem) {
            selectedLanguage = donationItem.body.selectedLang;
            stripeSubscriptionStartDate = donationItem.body.stripeSubscriptionStartDate;
            resp.state = true;
            resp.data.donationItem = donationItem;
            resp.oldCase = donationItem.body.donProgId ? false : true;

        }
        return resp;
    }
    catch (ex) {
        logHelper.logError(`${FILE_NAME}: ${methodName}: `, ex);
        return resp;
    }
}


async function performComputationForDraftInvoices(invoiceObj) {
    const methodName = "performComputationForDraftInvoices";
    try {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: performing computaion for draft invoices if price has been changed  `);

        if (invoiceObj.object == 'invoice') {

            // perfroming to chceck if the received object has this flag , so we can updat the invoice collection status 
            let disableAutoAdvanceDate = invoiceObj.lines.data[0].metadata[constants.Stripe.MetaDataVariables.DisableAutoAdvanceDate] ? genericHelper.convertUnixDateToISOfomrat(invoiceObj.lines.data[0].metadata[constants.Stripe.MetaDataVariables.DisableAutoAdvanceDate]) : null;

            let date, currentDate;
            if (disableAutoAdvanceDate) {
                date = dateHelper.getDateInSpecificFormat(disableAutoAdvanceDate, false, 'DD-MM-YYYY');
                currentDate = dateHelper.getDateInSpecificFormat(dateHelper.getDateNow(true), false, 'DD-MM-YYYY');
            }
            if (disableAutoAdvanceDate && date == currentDate) {
                await stripeAPIHelper.updateStripeInvoice(invoiceObj.id, { auto_advance: false });
            }
            else {

                // flag to perfrom unpause and addition of timeStamp to metadata
                let pauseCollection = false;

                // identifying if this invoice is applicable for action to be performed 
                let performWork = await verifyDraftInvoiceToBeHandled(invoiceObj.subscription, invoiceObj.payment_intent);

                if (performWork) {
                    // else update price on the below entities if rate has been changed

                    // Identifying if there is a price difference and needs to be perfrom updation  
                    let response = await checkPriceDifference(invoiceObj);

                    if (response.isPriceDifferent) {

                        // updating description on stripe
                        await stripeAPIHelper.updateStripeInvoice(invoiceObj.id, { description: 'Current invoice is being voided as it was billed on an outdated rate' });

                        // finalizing invoice so it can be voided
                        let finalizedInv = await stripeAPIHelper.finalizeStripeInvoice(invoiceObj.id, { auto_advance: false });

                        if (finalizedInv) {
                            // setting invoice to void so new invoice can be made instead  on new rate 
                            let voidInvoice = await stripeAPIHelper.voidStripeInvoice(invoiceObj.id);
                            if (voidInvoice) {
                                let item = {
                                    currency: {
                                        title: response.data.currency.code,
                                        symbol: response.data.currency.symbol
                                    },
                                    isRecurringProgram: true,
                                    totalAmount: response.data.updatedCurrencyWiseRates[response.data.DonorProgram.paymentPlan.Name][response.data.currency.code],
                                    count: response.data.DonorProgram.program.programDetails.additionalMetaData.value.length,
                                    paymentPlan: response.data.DonorProgram.paymentPlan,
                                    program: response.data.DonorProgram.program.programDetails
                                };
                                //2) update subscription 
                                const subscription = await stripeAPIHelper.retrieveSubscription(invoiceObj.subscription);
                                if (subscription) {

                                    // resuming subscription if it is paused , as stripe doesn't alloq such updation to subscription in pause mode 
                                    if (subscription.pause_collection) {
                                        pauseCollection = true;
                                        await paymentService.resumeStripeSubscription(subscription.id);
                                    }

                                    let obj = subscription.metadata;
                                    let size = (Number(Object.keys(obj).length) / 2);

                                    //updating meta data 
                                    let met = paymentService.addProgramMetadata(size + 1, item, obj);

                                    // new price item
                                    let itemObj = paymentService.getItemPrice(item);
                                    itemObj.id = subscription.items.data[0].id;

                                    // adding timpestamp to metadata to identify on invocie if its 'auto_collection' needs to be turned off.
                                    if (pauseCollection) {
                                        met[constants.Stripe.MetaDataVariables.DisableAutoAdvanceDate] = dateHelper.getDateNow(true);
                                    }

                                    let subscriptionUpdateObj = {
                                        items: [itemObj],
                                        proration_behavior: 'none',
                                        metadata: met,
                                       // billing_cycle_anchor: 'now'
                                    };
                                    const updatedSubscription = await stripeAPIHelper.updateSubscription(invoiceObj.subscription, subscriptionUpdateObj);
                                    if (updatedSubscription) {

                                        // setting subscription status to pause again if it was paused before we started work 
                                        // if (pauseCollection) {
                                        //     await paymentService.pauseStripeSubscription(subscription.id);
                                        // }

                                        let subscriptionAmountHistory = response.data.DonorProgram.subscriptionAmountHistory ? response.data.DonorProgram.subscriptionAmountHistory : [];
                                        subscriptionAmountHistory.push({
                                            updatedDate: dateHelper.getDateNow(true),
                                            Monthly_Amount: response.data.updatedCurrencyWiseRates[constants.PaymentPlans.MONTHLY][response.data.currency.code],
                                            Give_Once_Amount: response.data.updatedCurrencyWiseRates[constants.PaymentPlans.GIVE_ONCE][response.data.currency.code],
                                            currency: response.data.currency
                                        });

                                        let dPUpdateObj = {
                                            subscriptionAmountHistory: subscriptionAmountHistory
                                        };
                                        //3) update Donor Program with some charge history
                                        await databaseHelper.updateItem(constants.Database.Collections.DON_PRG.dataKey, { _id: response.data.DonorProgram._id }, dPUpdateObj);


                                        // update new price to donationRecurring 


                                        let donRecItems = await databaseHelper.getItems(constants.Database.Collections.DON_REC.dataKey, { "stripeSubscriptionId": invoiceObj.subscription, freezed: false }, { stripeSubscriptionId: 1, subscriptionAmountHistory: 1, amount: 1 });
                                        // let orphanCount  = response.data.DonorProgram.program.programDetails.additionalMetaData.value.length;
                                        // let perOrphanAmount = Number(invoiceObj.total) / orphanCount ;

                                        for (let jk = 0; jk < donRecItems.length; jk++) {

                                            let subscriptionAmountHistory1 = donRecTemp.subscriptionAmountHistory ? donRecTemp.subscriptionAmountHistory : [];
                                            subscriptionAmountHistory1.push({
                                                updatedDate: dateHelper.getDateNow(true),
                                                Monthly_Amount: response.data.updatedCurrencyWiseRates[constants.PaymentPlans.MONTHLY][response.data.currency.code],
                                                Give_Once_Amount: response.data.updatedCurrencyWiseRates[constants.PaymentPlans.GIVE_ONCE][response.data.currency.code],
                                                currency: response.data.currency,
                                                oldRate: donRecTemp.amount
                                            });

                                            let donRecUpdateObj = {
                                                amount: item.totalAmount,
                                                subscriptionAmountHistory: subscriptionAmountHistory1
                                            };

                                            await databaseHelper.updateItem(constants.Database.Collections.DON_REC.dataKey, { "stripeSubscriptionId": invoiceObj.subscription, _id: donRecItems[jk]._id }, donRecUpdateObj);



                                        }



                                    }

                                }
                            }
                        }
                    }
                }
            }
        }
    }
    catch (ex) {
        logHelper.logError(`${FILE_NAME}: ${methodName}: `, ex);
    }
}


//#endregion Export Functions End


//#region  invoice Draft work 

async function verifyDraftInvoiceToBeHandled(subscriptionId, paymentIntentId) {
    const methodName = "verifyDraftInvoiceToBeHandled";
    try {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: checking if payment action needs to be perfromed against the received draft invoice `);


        // check payment intent , it should not exist in donation item
        if (paymentIntentId) {
            let donationItem = await databaseHelper.getItem(constants.Database.Collections.DON_ITEM.dataKey,
                { "body.items.stripeDetail.payment_intent.id": paymentIntentId });

            if (donationItem)
                return false;
        }

        // query donorProgram to check if subscription even exists or not 
        let donorProgram = await databaseHelper.getItem(constants.Database.Collections.DON_PRG.dataKey, { "stripeSubscriptionId": subscriptionId, isRecurringProgram: true, isRecurringProgram: { $exists: true }, "program.programDetails.slug": constants.ProgramSlugs.orphanSponsorship });  //

        if (donorProgram) {
            // query donarProgramDetail with this subscription id and get count of unpaid entries
            // if unpaid exist , then we do nothing.

            let donaProgDetailExist = await databaseHelper.getItem(constants.Database.Collections.DON_PRG_DET.dataKey, {
                "stripeSubscriptionId": subscriptionId,
                "paymentStatus": constants.PaymentStatus.Unpaid,
            });
            if (donaProgDetailExist) {
                return false;
            } else {
                // Identify if the received invoice is applicable for changing of rate ( is this invoice a renewal first invoice )
                let invoiceList = await stripeAPIHelper.retrieveInvoiceList({ subscription: subscriptionId });
                if (invoiceList && invoiceList.data.length > 0) {
                    let donationProcess = await databaseHelper.getItem(constants.Database.Collections.PRGM.dataKey, { _id: donorProgram.program.programDetails._id }, { donationProcess: 1 });
                    let subscriptionDetail = await databaseHelper.getItem(constants.Database.Collections.DON_PROC.dataKey, { _id: donationProcess.donationProcess[0] }, { subscriptionDetail: 1 });
                    let durationInMonths = subscriptionDetail.subscriptionDetail.duration.numOfMonths;
                    let billingIntervalMonths = constants.MonthUnitMapping[donorProgram.paymentPlan.billingDetail.interval] * donorProgram.paymentPlan.billingDetail.interval_count;
                    let modValue = durationInMonths / billingIntervalMonths;
                    let filteredInvoiceList = invoiceList.data.filter(item => item.status != constants.Stripe.InoviceStatuses.Void);
                    let count = filteredInvoiceList.length - 1;

                    if (count % modValue == 0) {
                        return true;
                    }
                }

            }
        } else {
            return false;
        }

        return false;

    }
    catch (ex) {
        logHelper.logError(`${FILE_NAME}: ${methodName}: `, ex);
        return false;
    }
}


async function checkPriceDifference(invoiceObj) {
    const methodName = "priceNeedstoBeUpdated";

    let responseDto = {
        isPriceDifferent: false,
        data: {},
        message: ""
    };
    try {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: checking if there is a price difference in current and already sponsored  `);

        let donorProgram = await databaseHelper.getItem(constants.Database.Collections.DON_PRG.dataKey, { "stripeSubscriptionId": invoiceObj.subscription, isRecurringProgram: true, isRecurringProgram: { $exists: true } }, { currency: 1, paymentPlan: 1, program: 1, subscriptionAmountHistory: 1, _id: 1 });

        let updatedCurrencyWiseRates = await donorProgramService.getLatestRateForProgram(constants.ProgramSlugs.orphanSponsorship);

        let currency = constants.CurrencyCompleteMapping.find(curr => curr.symbol == donorProgram.currency);
        let currentAmount = Number(updatedCurrencyWiseRates[donorProgram.paymentPlan.Name][currency.code]);

        if (Number((invoiceObj.total) / 100) != currentAmount) {

            responseDto.isPriceDifferent = true;
            responseDto.data['DonorProgram'] = donorProgram;
            responseDto.data['updatedCurrencyWiseRates'] = updatedCurrencyWiseRates;
            responseDto.data['currency'] = currency;


            return responseDto;
        }
        return responseDto;
    }
    catch (ex) {
        logHelper.logError(`${FILE_NAME}: ${methodName}: `, ex);
        return responseDto;
    }
}

//#endregion 



//#region Successful Invoice.Paid Processing start

let installmentNumber = 1;
let invoiceNum;
let selectedLanguage;
let stripeSubscriptionStartDate;
let noOfInstallment;

//perform check if payment is not first and already recorded 
async function verifyPaymentToBeRecorded(subscriptionId, paymentIntentId) {
    const methodName = "verifyPaymentToBeRecorded";
    try {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: checking if payment is already recorded in Database `);

        let donationItem = await databaseHelper.getItem(constants.Database.Collections.DON_ITEM.dataKey,
            { "body.items.stripeDetail.payment_intent.id": paymentIntentId });

        if (donationItem)
            return false;

        let donaProgDetailExist = await databaseHelper.getItem(constants.Database.Collections.DON_PRG_DET.dataKey, {
            "stripeSubscriptionId": subscriptionId,
            "paymentIntentId": paymentIntentId,
            "paymentStatus": constants.PaymentStatus.Paid,
            "installmentNo": { $ne: 1 },

        });
        if (donaProgDetailExist)
            return false;

        return true;

    }
    catch (ex) {
        logHelper.logError(`${FILE_NAME}: ${methodName}: `, ex);
        return null;
    }
}

//update Donation Program Details 
async function updateDonorProgramDetails(invoiceObj, isFailedPayment) {

    const methodName = "updateDonorProgramDetails";
    try {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: Updating Donor Program Details with Subsequent Payment `);

        let queryDate = genericHelper.convertUnixDateToISOfomrat(invoiceObj.created);
        let startDate = dateHelper.getStartOfMonth(queryDate).toISOString();
        let endDate = dateHelper.getEndOfMonth(queryDate).toISOString();

        let donationItemBody = await databaseHelper.getItem(constants.Database.Collections.DON_ITEM.dataKey, { "body.items.stripeDetail.subscription.id": invoiceObj.subscription }, { "body.selectedLang": 1 });

        selectedLanguage = donationItemBody.body.selectedLang;

        let statusTransition = {
            finalized_at: invoiceObj.status_transitions.finalized_at ? genericHelper.convertUnixDateToISOfomrat(invoiceObj.status_transitions.finalized_at) : invoiceObj.status_transitions.finalized_at,
            marked_uncollectible_at: invoiceObj.status_transitions.marked_uncollectible_at,
            paid_at: invoiceObj.status_transitions.paid_at ? genericHelper.convertUnixDateToISOfomrat(invoiceObj.status_transitions.paid_at) : invoiceObj.status_transitions.paid_at,
            voided_at: invoiceObj.status_transitions.voided_at
        }

        let stripeChargeHistoryObj = {
            paymentStatus: invoiceObj.paid ? constants.PaymentStatus.Paid : constants.PaymentStatus.Unpaid,
            nextPaymentAttempt: invoiceObj.next_payment_attempt,
            attemptCount: invoiceObj.attempt_count,
            status_Transition: statusTransition
        };

        let Items = await databaseHelper.getItem(constants.Database.Collections.DON_PRG_DET.dataKey, { "installmentDate": { $gte: startDate, $lte: endDate }, "stripeSubscriptionId": invoiceObj.subscription }, { installmentNo: 1, stripeChargeHistory: 1 });

        if (Items) {

            let UpdateDPDObj = {};

            if (isFailedPayment) {

                let UpdateObj = {

                    comments: 'Payment Failed for ' + Items.installmentNo,
                    stripeInvoiceId: invoiceObj.id,
                    paymentIntentId: invoiceObj.payment_intent,
                    updated: dateHelper.createUTCDate(Date.now()),
                    stripeChargeHistory: Items.stripeChargeHistory ? Items.stripeChargeHistory : []
                };

                UpdateDPDObj = UpdateObj;
            }
            else {
                invoiceNum = await paymentService.getInvoiceNumber();

                let UpdateObj = {
                    paymentDate: genericHelper.convertUnixDateToISOfomrat(invoiceObj.status_transitions.paid_at),
                    paymentStatus: invoiceObj.paid ? constants.PaymentStatus.Paid : constants.PaymentStatus.Unpaid,
                    paymentIntentId: invoiceObj.payment_intent,
                    comments: invoiceObj.collection_method + ' for installment number ' + Items.installmentNo,
                    stripeInvoiceId: invoiceObj.id,
                    invoiceLink: `public/pdf/Reciept-${selectedLanguage}-${invoiceNum}.pdf`, // get invoice path when ready 
                    updated: dateHelper.createUTCDate(Date.now()),
                    stripeChargeHistory: Items.stripeChargeHistory ? Items.stripeChargeHistory : []
                };
                UpdateDPDObj = UpdateObj;
            }


            UpdateDPDObj.stripeChargeHistory.push(stripeChargeHistoryObj);
            let response = await databaseHelper.updateItem(constants.Database.Collections.DON_PRG_DET.dataKey, { "installmentDate": { $gte: startDate, $lte: endDate }, "stripeSubscriptionId": invoiceObj.subscription }, UpdateDPDObj);

            if (response) {
                installmentNumber = response.installmentNo;
                return true;

            }
        }


        return false;
    }
    catch (ex) {
        logHelper.logError(`${FILE_NAME}: ${methodName}: `, ex);
        return null;
    }

}


async function sendEmailWithReceipt(invoiceNo, stripeSubscriptionId, paymentDate, newDonation, installmentNumber, isRenewal, installmentDate, programSlug) {

    try {
        let orphanIds;

        var donationItemObject = await databaseHelper.getItem(constants.Database.Collections.DON_ITEM.dataKey, {

            "body.items.stripeDetail.subscription.id": stripeSubscriptionId
        });

        donationItemObject.body.items = donationItemObject.body.items.filter(obj => obj.stripeDetail.subscription.id == stripeSubscriptionId && obj.isRecurringProgram == true);

        donationItemObject.body.amount = donationItemObject.body.items[0].totalAmount;

        var donationRecurringList = await databaseHelper.getItems(constants.Database.Collections.DON_REC.dataKey, {

            stripeSubscriptionId: stripeSubscriptionId,
            freezed: false
        }, { "orphan._id": 1 });

        if (donationRecurringList && donationRecurringList.length > 0) {
            orphanIds = donationRecurringList.map(x => { return x.orphan._id });
        }

        if (donationItemObject.body.items[0].orphans) {
            donationItemObject.body.items[0].orphans = orphanIds;
        }


        var donorProgramDetails = await databaseHelper.getItems(constants.Database.Collections.DON_PRG_DET.dataKey, {

            stripeSubscriptionId: stripeSubscriptionId,
            "donorProgram.program.slug": programSlug
        }, { installmentNo: 1 });

        var totalInstallments = donorProgramDetails && donorProgramDetails.length > 0 ? donorProgramDetails.length : 0;

        var emailTemplateName;
        var slugName = programSlug.toUpperCase().replace(/-/g, "_");
        emailTemplateName = isRenewal ? `${constants.emailTemplates.SUCCESSFUL_RENEWAL_PAYMENT_EMAIL}_${donationItemObject.body.selectedLang}` : `${constants.emailTemplates.SUCCESSFUL_SUBSEQUENT_PAYMENT_EMAIL}_${slugName}_${donationItemObject.body.selectedLang}`;

        await paymentService.sendEmailWithReciept(donationItemObject, invoiceNo, paymentDate, newDonation, installmentNumber, totalInstallments, emailTemplateName, installmentDate);
    }
    catch (ex) {
    }

}

async function perfromInvoicePaidWorkForOrphanSponsorship(invoiceObj) {
    const methodName = "perfromInvoicePaidWorkForOrphanSponsorship";
    try {
        let currentSchedulePayment = await updateDonorProgramDetails(invoiceObj);

        if (currentSchedulePayment) {

            //update Donor Program  
            let updatedDProg = await updateDonorProgram(invoiceObj); // code done without test

            //update Donation Recurring  
            let PauseSubscriptionOnStripe = await updateDonationRecurring(invoiceObj); // code done without test

            //Insert in Donation 
            let newDonation = await insertInDonation(invoiceObj, updatedDProg);

            //Insert in Donation Details
            let donationDetail = await insertInDonationDetails(invoiceObj, updatedDProg, newDonation);


            //Need to convert unix datetime to ISO date format (11 May 2021)
            let paid_at = genericHelper.convertUnixDateToISOfomrat(invoiceObj.status_transitions.paid_at);

            // Send email to donor with attached invoice receipt

            await sendEmailWithReceipt(newDonation.invoiceNo, invoiceObj.subscription, paid_at, newDonation, donationDetail.installmentNumber, false, genericHelper.convertUnixDateToISOfomrat(invoiceObj.created), constants.ProgramSlugs.orphanSponsorship);

            if (updatedDProg && !updatedDProg.isAutoRenewal && PauseSubscriptionOnStripe) {
                paymentService.handleSubscriptionOnStripe(null, true, invoiceObj.subscription);

            }
        }

        // // if tweleth payment 

        if (!currentSchedulePayment) {

            // ensure updated subscription id in all tables 
            // insert where does not exist 

            // creating schedule for next Year for Each Entity
            await perfromRenewalNextTenureWork(invoiceObj);
        }
    }
    catch (ex) {
        logHelper.logError(`${FILE_NAME}: ${methodName}: `, ex);
        return null;
    }
}


async function perfromInvoicePaidWorkForSadqahADay(invoiceObj, donProg) {
    const methodName = "perfromInvoicePaidWorkForSadqahADay";
    try {

        let donProgramDetail = await createOrUpdateDonorProgramDetails(invoiceObj, false, donProg);

        if (donProgramDetail) {

            let endDate = dateHelper.addMonthsInDate(dateHelper.getDateNow(true), 1);
            //update Donor Program  
            let updatedDProg = await updateDonorProgram(invoiceObj, true, endDate); // code done without test

            //Insert in Donation 
            let newDonation = await insertInDonation(invoiceObj, updatedDProg);
            //Insert in Donation Details
            let donationDetail = await insertInDonationDetails(invoiceObj, updatedDProg, newDonation);

            //Need to convert unix datetime to ISO date format (11 May 2021)
            let paid_at = genericHelper.convertUnixDateToISOfomrat(invoiceObj.status_transitions.paid_at);

            // Send email to donor with attached invoice receipt
            await sendEmailWithReceipt(newDonation.invoiceNo, invoiceObj.subscription, paid_at, newDonation, donationDetail.installmentNumber, false, paid_at, constants.ProgramSlugs.SadaqahADay);

        }

    }
    catch (ex) {
        logHelper.logError(`${FILE_NAME}: ${methodName}: `, ex);
        return null;
    }
}


//create or updateDonorProgramDetail for Sadqah 

async function createOrUpdateDonorProgramDetails(invoiceObj, isFailedPayment, updatedDProg) {

    const methodName = "createOrUpdateDonorProgramDetails";

    let isProgDetailsExist = false;
    try {

        let donationItemBody = await databaseHelper.getItem(constants.Database.Collections.DON_ITEM.dataKey, { "body.items.stripeDetail.subscription.id": invoiceObj.subscription }, { "body.selectedLang": 1 })


        let donorProgram = {
            _id: updatedDProg._id //new ObjectID(newInsertedDonorProgram._id)
            ,
            program:
            {
                _id: updatedDProg.program.programDetails._id, //new ObjectID(newInsertedDonorProgram.program.programDetails._id),
                programName: updatedDProg.program.programDetails.programName,
                slug: updatedDProg.program.programDetails.slug,
            }
        }

        selectedLanguage = donationItemBody.body.selectedLang;

        let statusTransition = {
            finalized_at: invoiceObj.status_transitions.finalized_at ? genericHelper.convertUnixDateToISOfomrat(invoiceObj.status_transitions.finalized_at) : invoiceObj.status_transitions.finalized_at,
            marked_uncollectible_at: invoiceObj.status_transitions.marked_uncollectible_at,
            paid_at: invoiceObj.status_transitions.paid_at ? genericHelper.convertUnixDateToISOfomrat(invoiceObj.status_transitions.paid_at) : invoiceObj.status_transitions.paid_at,
            voided_at: invoiceObj.status_transitions.voided_at
        }

        let stripeChargeHistoryObj = {
            paymentStatus: invoiceObj.paid ? constants.PaymentStatus.Paid : constants.PaymentStatus.Unpaid,
            nextPaymentAttempt: invoiceObj.next_payment_attempt,
            attemptCount: invoiceObj.attempt_count,
            status_Transition: statusTransition
        };

        let existingDpd = await databaseHelper.getItem(constants.Database.Collections.DON_PRG_DET.dataKey, { "stripeSubscriptionId": invoiceObj.subscription, stripeInvoiceId: invoiceObj.id, paymentIntentId: invoiceObj.payment_intent }, { installmentNo: 1, stripeChargeHistory: 1 });

        if (existingDpd) {
            isProgDetailsExist = true;
        }

        let oldItem = await databaseHelper.getItem(constants.Database.Collections.DON_PRG_DET.dataKey, { "stripeSubscriptionId": invoiceObj.subscription, "paymentIntentId": { $ne: invoiceObj.payment_intent }, }, { installmentNo: 1, stripeChargeHistory: 1 }, { sort: { _id: -1 } });


        let donorProgramDetailObj = {};

        if (isFailedPayment) {

            let dpdObj = {
                installmentNo: oldItem.installmentNo ? (oldItem.installmentNo + 1) : 2,
                installmentDate: genericHelper.convertUnixDateToISOfomrat(invoiceObj.created),
                paymentDate: null,
                paymentStatus: constants.PaymentStatus.Unpaid,
                paymentIntentId: invoiceObj.payment_intent,
                comments: 'Payment Failed for ' + (oldItem.installmentNo + 1),
                stripeInvoiceId: invoiceObj.id,
                invoiceLink: '',
                amount: Number((invoiceObj.total / 100)),
                stripeSubscriptionId: invoiceObj.subscription,
                donorProgram: donorProgram,
                stripeChargeHistory: existingDpd && existingDpd.stripeChargeHistory ? existingDpd.stripeChargeHistory : []
            };

            donorProgramDetailObj = dpdObj;
        }
        else {
            invoiceNum = await paymentService.getInvoiceNumber();

            let dpdObj = {
                installmentNo: oldItem.installmentNo ? (oldItem.installmentNo + 1) : 2,
                installmentDate: dateHelper.getDateNow(true), //genericHelper.convertUnixDateToISOfomrat(invoiceObj.created) ,
                paymentDate: genericHelper.convertUnixDateToISOfomrat(invoiceObj.status_transitions.paid_at),
                paymentStatus: invoiceObj.paid ? constants.PaymentStatus.Paid : constants.PaymentStatus.Unpaid,
                paymentIntentId: invoiceObj.payment_intent,
                comments: invoiceObj.collection_method + ' for installment number ' + (oldItem.installmentNo + 1),
                stripeInvoiceId: invoiceObj.id,
                invoiceLink: `public/pdf/Reciept-${selectedLanguage}-${invoiceNum}.pdf`, // get invoice path when ready
                amount: Number((invoiceObj.total / 100)),
                stripeSubscriptionId: invoiceObj.subscription,
                donorProgram: donorProgram,

                stripeChargeHistory: existingDpd && existingDpd.stripeChargeHistory ? existingDpd.stripeChargeHistory : []
            };
            donorProgramDetailObj = dpdObj;
        }

        donorProgramDetailObj.stripeChargeHistory.push(stripeChargeHistoryObj);
        donorProgramDetailObj.updated = dateHelper.getDateNow(true);

        installmentNumber = oldItem.installmentNo ? (oldItem.installmentNo + 1) : 2;

        if (isProgDetailsExist) {
            let updated = await databaseHelper.updateItem(constants.Database.Collections.DON_PRG_DET.dataKey, { _id: existingDpd._id }, donorProgramDetailObj);

            // add code here for pause collection behaviour for changing billing anchor 
            if (invoiceObj.paid) {
                await perfromInstDateResetSadaqahADay(invoiceObj);
                //await updateBillingnachorwithMetaData(invoiceObj);
            }
            return updated;
        }
        else {
            donorProgramDetailObj.created = dateHelper.getDateNow(true);
            let inserted = await databaseHelper.insertItem(constants.Database.Collections.DON_PRG_DET.dataKey, donorProgramDetailObj);
            return inserted;
        }

    }
    catch (ex) {
        logHelper.logError(`${FILE_NAME}: ${methodName}: `, ex);
        return null;
    }



}


async function perfromInvoiceFailureWorkOrphanSponosrship(invoiceObj) {
    const methodName = "perfromInvoiceFailureWorkOrphanSponosrship";

    try {
        //update last status and Payment Date in donorProgram
        let updatedDProg = await updateDonorProgram(invoiceObj);

        // update donor Program Detail accordingly with fields match 
        let updatedDonorProgramDetails = await updateDonorProgramDetails(invoiceObj, true);

        if (!updatedDonorProgramDetails) {
            // create next tenure schdeule here 

            let res = await createPaymentScheduleForNextTenure(invoiceObj);
            if (res && res.flag) {

                updatedDProg = await updateDonorProgram(invoiceObj, true, res.endDate);

                await createDonationProgramDetailsForNextTenure(invoiceObj, updatedDProg, res.noOfMonths, res.installmentNumber);

                await updateDonorProgramDetails(invoiceObj, true);

            }

        }
        //  update refrenced Payment Schdule item in Donation Recurring and mark payable By akhyar , unpaid  and etc 
        await updateDonationRecurring(invoiceObj, true);

        //   Email the customer regarding Failed Payment 
        // email donor update card details
        await sendPaymentFailureEmail(invoiceObj.subscription, genericHelper.convertUnixDateToISOfomrat(invoiceObj.created), constants.ProgramSlugs.orphanSponsorship);

    } catch (ex) {
        logHelper.logError(`${FILE_NAME}: ${methodName}: `, ex);
        return null;
    }


}


async function perfromInvoiceFailureWorkSadqahADay(invoiceObj) {
    const methodName = "perfromInvoiceFailureWorkSadqahADay";

    try {
        //update last status and Payment Date in donorProgram
        let updatedDProg = await updateDonorProgram(invoiceObj);

        // update donor Program Detail accordingly with fields match 
        await createOrUpdateDonorProgramDetails(invoiceObj, true, updatedDProg);


        await sendPaymentFailureEmail(invoiceObj.subscription, genericHelper.convertUnixDateToISOfomrat(invoiceObj.created), constants.ProgramSlugs.SadaqahADay);

    } catch (ex) {
        logHelper.logError(`${FILE_NAME}: ${methodName}: `, ex);
        return null;
    }


}

async function perfromInstDateResetSadaqahADay(invoiceObj) {
    const methodName = "perfromInstDateResetSadaqahADay";
    try {

        let createdDate, paidDate;

        createdDate = dateHelper.getDateInSpecificFormat(genericHelper.convertUnixDateToISOfomrat(invoiceObj.created), false, 'DD-MM-YYYY');
        paidDate = dateHelper.getDateInSpecificFormat(genericHelper.convertUnixDateToISOfomrat(invoiceObj.status_transitions.paid_at), false, 'DD-MM-YYYY');

        if (createdDate != paidDate) {
            // pause subscription until paid_at + 1 month 

            const retrieveSubscription = await stripeAPIHelper.retrieveSubscription(invoiceObj.subscription);

            if (retrieveSubscription) {

                const resumeAtDate = dateHelper.convertDateToUnix(dateHelper.addMonthsInDate(genericHelper.convertUnixDateToISOfomrat(invoiceObj.status_transitions.paid_at), 1));

                let metaData = retrieveSubscription.metadata;

                metaData[constants.Stripe.MetaDataVariables.ResumeSubscriptionAt] = resumeAtDate;

                let subscriptionUpdateObj = {
                    pause_collection: {
                        behavior: constants.Stripe.PauseCollectionBehavior.Void,
                        resumes_at: resumeAtDate
                    },
                    metadata: metaData
                };

                await paymentService.pauseStripeSubscription(invoiceObj.subscription, constants.Stripe.PauseCollectionBehavior.Void, resumeAtDate, metaData);

            }
        }
        return null;


    } catch (ex) {
        logHelper.logError(`${FILE_NAME}: ${methodName}: `, ex);
        return null;

    }

}


async function perfromSubscriptionUpdateWithBillingAnchor(subscriptionObj, metaVariable) {
    const methodName = "perfromSubscriptionUpdateWithBillingAnchor";
    try {

        let metaVariableValue = genericHelper.convertUnixDateToISOfomrat(subscriptionObj.metadata[metaVariable]);

        let date, currentDate;
        if (metaVariableValue) {
            date = dateHelper.getDateInSpecificFormat(metaVariableValue, false, 'DD-MM-YYYY');
            currentDate = dateHelper.getDateInSpecificFormat(dateHelper.getDateNow(true), false, 'DD-MM-YYYY');
        }
        if (metaVariableValue && date == currentDate) {

            let metaData = subscriptionObj.metadata;
            // delete metaData[metaVariable];
            metaData.resumeSubscriptionAt = null;
            let subscriptionUpdateObj = {
                proration_behavior: 'none',
                billing_cycle_anchor: 'now',
                pause_collection: null,
                metadata: metaData
            };
            if (metaVariable == constants.Stripe.MetaDataVariables.DisableAutoAdvanceDate) {
                subscriptionUpdateObj.pause_collection = {
                    behavior: constants.Stripe.PauseCollectionBehavior.Draft
                }
            }
            await stripeAPIHelper.updateSubscription(subscriptionObj.id, subscriptionUpdateObj);
        }

    } catch (ex) {
        logHelper.logError(`${FILE_NAME}: ${methodName}: `, ex);
        return null;

    }
}






//update Donor Program  

async function updateDonorProgram(invoiceObj, changeEndDate, endDate) {

    const methodName = "updateDonorProgram";
    try {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: Updating Donor Program with Subsequent Payment `);


        const CHARGE = await stripeAPIHelper.retrieveCharge(invoiceObj.charge);
        let UpdateObj = {

            lastPaymentStatus: invoiceObj.paid ? constants.PaymentStatus.Paid : constants.PaymentStatus.Unpaid,
            lastPaymentDate: invoiceObj.status_transitions.paid_at ? new Date(genericHelper.convertUnixDateToISOfomrat(invoiceObj.status_transitions.paid_at)).toISOString() : dateHelper.createUTCDate(Date.now()),
            "donor.cardDetail": CHARGE ? CHARGE.payment_method_details.card : {},
            "donor.paymentMethodId": CHARGE ? CHARGE.payment_method : ''

        };
        if (changeEndDate) {
            UpdateObj.endDate = endDate;
        }
        let updatedDonorProgram = await databaseHelper.updateItem(constants.Database.Collections.DON_PRG.dataKey, { "stripeSubscriptionId": invoiceObj.subscription, isRecurringProgram: true, isRecurringProgram: { $exists: true } }, UpdateObj);



        return updatedDonorProgram;

    }
    catch (ex) {
        logHelper.logError(`${FILE_NAME}: ${methodName}: `, ex);
        return null;
    }

}
//update Donation Recurring  
async function updateDonationRecurring(invoiceObj, isPaymentFailed) {

    const methodName = "updateDonationRecurring";
    try {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: Updating Donation Recurring with Subsequent Payment `);

        let donRecItems = await databaseHelper.getItems(constants.Database.Collections.DON_REC.dataKey, { "stripeSubscriptionId": invoiceObj.subscription, freezed: false }, { stripeSubscriptionId: 1, paymentSchedule: 1, noOfPaymentsRemaining: 1, updated: 1 });
        let needToPauseSubscription = false;
        if (donRecItems) {

            for (let j = 0; j < donRecItems.length; j++) {

                let queryDate = genericHelper.convertUnixDateToISOfomrat(invoiceObj.created);
                let startDate = dateHelper.getStartOfMonth(queryDate).toISOString();
                let endDate = dateHelper.getEndOfMonth(queryDate).toISOString();

                let paySchedule = donRecItems[j].paymentSchedule;
                let filteredPS = paySchedule.filter(schedule => schedule.installmentDate >= startDate && schedule.installmentDate <= endDate);


                let index = -1;

                if (filteredPS.length > 0) {

                    let failedString = "";

                    if (!isPaymentFailed) {
                        filteredPS[0].status = constants.PaymentStatus.Paid; //invoiceObj.status;
                        filteredPS[0].paymentDate = genericHelper.convertUnixDateToISOfomrat(invoiceObj.status_transitions.paid_at);
                        filteredPS[0].paidBy = constants.PayableBy.Donor;
                        filteredPS[0].invoiceId = invoiceObj.id;
                        filteredPS[0].paymentIntentId = invoiceObj.payment_intent;
                    }
                    else {
                        filteredPS[0].invoiceId = invoiceObj.id;
                        filteredPS[0].paymentIntentId = invoiceObj.payment_intent;
                        filteredPS[0].payableBy = constants.PayableBy.Akhyar;
                        failedString = "  Received with a Payment Failure ";
                    }

                    let attemptHistory = {
                        date: dateHelper.getDateNow(true), //genericHelper.convertUnixDateToISOfomrat(invoiceObj.status_transitions.paid_at),
                        status: invoiceObj.status,
                        comment: 'Installment number  ' + filteredPS[0].installmentNo + failedString
                    };

                    if (filteredPS[0].attemptHistory && Array.isArray(filteredPS[0].attemptHistory)) {
                        filteredPS[0].attemptHistory.push(attemptHistory);
                    }
                    else {
                        let Arr = [];
                        if (filteredPS[0].attemptHistory != null) {
                            Arr.push(filteredPS[0].attemptHistory);
                        }
                        Arr.push(attemptHistory);
                        filteredPS[0].attemptHistory = Arr;

                    }

                    index = paySchedule.findIndex(schedule => schedule.installmentDate >= startDate && schedule.installmentDate <= endDate);

                    // paySchedule[index] = filteredPS[0]; was this missing ? if yes? how has it been working yet

                    let updateObj = {
                        updated: Date.now(),
                        paymentSchedule: paySchedule,
                        noOfPaymentsRemaining: isPaymentFailed ? donRecItems[j].noOfPaymentsRemaining : donRecItems[j].noOfPaymentsRemaining - 1

                    };

                    await databaseHelper.updateItem(constants.Database.Collections.DON_REC.dataKey, { "stripeSubscriptionId": invoiceObj.subscription, _id: donRecItems[j]._id },
                        updateObj);

                    if (index == paySchedule.length - 1) {
                        needToPauseSubscription = true;
                    }



                }
            }
            return needToPauseSubscription;
        }
    }
    catch (ex) {
        logHelper.logError(`${FILE_NAME}: ${methodName}: `, ex);

    }
}
//Insert in Donation 
async function insertInDonation(invoiceObj, updatedDonorProgram) {

    const methodName = "insertInDonation";
    try {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: inserting in Donation with Subsequent Payment `);

        let additionalData = {
            stripeSubscriptionId: invoiceObj.subscription,
            isRecurringProgram: updatedDonorProgram.isRecurringProgram,
            isAutoRenew: updatedDonorProgram.isAutoRenewal,
            paymentPlan: updatedDonorProgram.paymentPlan
        };


        if (invoiceNum == null || invoiceNum == undefined) {
            invoiceNum = await paymentService.getInvoiceNumber();
        }
        let objDonation = {

            invoiceNo: invoiceNum,
            donor: updatedDonorProgram.donor.donorId,
            chargeId: invoiceObj.charge,
            customerId: invoiceObj.customer,
            totalAmount: Number((invoiceObj.total / 100)),//parseInt(updatedDonorProgram.totalAmount).toFixed(2),
            isActive: true, // keeping as defualt 
            isKhums: false, // keeping as default 
            documentPath: `public/pdf/Reciept-${selectedLanguage}-${invoiceNum}.pdf`, // get invoice path here for pdf 
            created: invoiceObj.status_transitions.paid_at ? genericHelper.convertUnixDateToISOfomrat(invoiceObj.status_transitions.paid_at) : Date.now(),
            updated: Date.now(),
            currency: updatedDonorProgram.currency, // get currency Symbol here 
            currencyTitle: invoiceObj.currency.toUpperCase(),
            createdBy: 'NA',
            updatedBy: 'NA',
            payment_intent_id: invoiceObj.payment_intent,
            endDate: updatedDonorProgram.endDate,
            additionalData: additionalData
        };

        let resp = await databaseHelper.insertItem(constants.Database.Collections.DONATN.dataKey, objDonation);
        return resp;


    }
    catch (ex) {
        logHelper.logError(`${FILE_NAME}: ${methodName}: `, ex);
        return null;
    }


}

//Insert in Donation Details
async function insertInDonationDetails(invoiceObj, updatedDonorProgram, objDonation) {

    const methodName = "insertInDonationDetails";
    try {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: inserting in Donation Details with Subsequent Payment `);


        const countryName = await databaseHelper.getItem(constants.Database.Collections.DON_ITEM.dataKey, { "body.items.stripeDetail.subscription.id": invoiceObj.subscription }, { "body.country": 1 });
        // "body.items.stripeDetail.subscription.id": subscriptionId || "-1"

        const countryNameToFetch = typeof (countryName.body.country) == "string" ? countryName.body.country : countryName.body.country.name;
        const donorCountry = await paymentService.getDonorCountry(countryNameToFetch);

        let additionalData = {
            stripeSubscriptionId: invoiceObj.subscription,
            isRecurringProgram: updatedDonorProgram.isRecurringProgram,
            isAutoRenew: updatedDonorProgram.isAutoRenewal,
            paymentPlan: updatedDonorProgram.paymentPlan
        };

        let objDonDetail = {
            amount: Number((invoiceObj.total / 100)),// parseInt(updatedDonorProgram.totalAmount).toFixed(2),
            donation: objDonation, // get this 
            program: updatedDonorProgram.program.programDetails._id,
            programSubCategory: [],
            chargeId: invoiceObj.charge,
            sdoz: [],
            isSyed: false,
            fitrahSubType: [],
            sahm: [],
            isActive: true,
            isRecurring: true,
            autoRenew: false,
            count: updatedDonorProgram.program.programDetails.additionalMetaData ? updatedDonorProgram.program.programDetails.additionalMetaData.value.length : 1,
            countryOfResidence: donorCountry._id,//countryId, // get this 
            created: invoiceObj.status_transitions.paid_at ? genericHelper.convertUnixDateToISOfomrat(invoiceObj.status_transitions.paid_at) : Date.now(),
            updated: Date.now(),
            createdBy: 'NA',
            updatedBy: 'NA',
            comments: "Installment Number " + installmentNumber ? installmentNumber : 1,
            endDate: updatedDonorProgram.endDate,
            installmentNumber: installmentNumber ? installmentNumber : 1, // set installment Number Here getting from where 
            additionalData: additionalData


        };

        let updatedDonDetails = await databaseHelper.insertItem(constants.Database.Collections.DON_DET.dataKey, objDonDetail);



        if (updatedDonDetails) {
            await databaseHelper.updateItem(constants.Database.Collections.DONATN.dataKey, { _id: objDonation._id }, { donationdetails: updatedDonDetails._id });
        }

        return updatedDonDetails;

    }
    catch (ex) {
        logHelper.logError(`${FILE_NAME}: ${methodName}: `, ex);
        return null;
    }






}

//Insert New Tenure Payment Schedule 
async function createPaymentScheduleForNextTenure(invoiceObj, donationItem) {
    const methodName = "createPaymentScheduleForNextTenure";
    try {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: Create Schedule For next Tenure `);
        let objDonationRecurring = {};
        // get donor program detail with same subscription id and MaxId

        let Items = await databaseHelper.getItem(constants.Database.Collections.DON_PRG_DET.dataKey, { "stripeSubscriptionId": invoiceObj.subscription }, { installmentNo: 1, donorProgram: 1, amount: 1 }, { sort: { _id: -1 } });

        let programId;

        let donProgram = await databaseHelper.getItem(constants.Database.Collections.DON_PRG.dataKey, { "stripeSubscriptionId": invoiceObj.subscription, isRecurringProgram: true, isRecurringProgram: { $exists: true } }, { installmentNo: 1, program: 1, totalAmount: 1, paymentPlan: 1, endDate: 1 }, { sort: { _id: -1 } });

        let installmentDate;
        let itemLength = noOfInstallment ? noOfInstallment : 1;
        let additionalData = {};
        if (Items) {
            programId = Items.donorProgram.program._id;
            installmentDate = genericHelper.convertUnixDateToISOfomrat(invoiceObj.created);
            itemLength = 1;
            installmentNumber = Items.installmentNo + 1;

        }
        else {
            programId = donProgram.program.programDetails._id;
            installmentDate = stripeSubscriptionStartDate;

            let cartItem = donationItem.body.items.filter(cItem => cItem.isRecurringProgram == true);
            cartItem = cartItem[0];
            additionalData = {
                donor:
                {
                    _id: new ObjectID(donationItem.body.donar._id),
                    donorName: donationItem.body.donar.donarName,
                    donoremail: donationItem.body.donar.email,
                },
                program:
                {
                    _id: new ObjectID(cartItem.program._id),
                    programName: cartItem.program.programName,
                    slug: cartItem.program.slug,
                },
                currency:
                {
                    currencySymbol: donationItem.body.paymentCurrency,
                    currencyTitle: donationItem.body.paymentTitle,
                },
                paymentPlan: cartItem.paymentPlan.Name
            }
        }
        let donationProcess = await databaseHelper.getItem(constants.Database.Collections.PRGM.dataKey, { _id: programId }, { donationProcess: 1 });
        let duration = await databaseHelper.getItem(constants.Database.Collections.DON_PROC.dataKey, { _id: donationProcess.donationProcess[0] }, { subscriptionDetail: 1 });
        let donationRecurring = await databaseHelper.getItems(constants.Database.Collections.DON_REC.dataKey, { "stripeSubscriptionId": invoiceObj.subscription, freezed: false }, { paymentSchedule: 1, orphan: 1, student: 1 });


        let noOfMonths = duration.subscriptionDetail.duration.numOfMonths;
        let END_DATE = Items ? dateHelper.addMonthsInDate(donProgram.endDate, noOfMonths) : donProgram.endDate;
        let noOfInstallments = noOfMonths / donProgram.paymentPlan.billingDetail.interval_count; // from donor program

        let resp = {
            flag: false,
            endDate: END_DATE,
            noOfMonths: noOfInstallments,
            installmentNumber: Items ? Items.installmentNo : 0

        }

        for (let j = 0; j < donationRecurring.length; j++) {

            objDonationRecurring.noOfPaymentsRemaining = (donProgram.paymentPlan.Name == constants.PaymentPlans.GIVE_ONCE) ? 0 : noOfInstallments - 1;
            objDonationRecurring.endDate = END_DATE;
            let paymentsSchedule = donationRecurring[j].paymentSchedule ? donationRecurring[j].paymentSchedule : [];
            let installmentCount = donationRecurring[j].paymentSchedule ? donationRecurring[j].paymentSchedule.length : 0;
            for (let i = 0; i < noOfInstallments; i++) {

                let count = donProgram.program.programDetails.additionalMetaData.value.length;

                let tempAmount = (donProgram.paymentPlan.Name == constants.PaymentPlans.GIVE_ONCE) ?  Number((invoiceObj.total / 100) / (count * noOfMonths)) :  Number((invoiceObj.total / 100) / count);
                //(donProgram.paymentPlan.Name == constants.PaymentPlans.GIVE_ONCE) ? donProgram.totalAmount / (count * noOfMonths) : donProgram.totalAmount / count;

                let paySchedule =
                {
                    installmentNo: installmentCount + (i + 1),
                    amount: tempAmount,
                    roundUpAmount: Math.ceil(tempAmount),
                    payableBy: constants.PayableBy.Donor,
                    isActive: true,
                    comment: 'Installment number ' + (installmentCount + (i + 1)),
                    installmentDate: dateHelper.addMonthsInDate(installmentDate, i),
                }
                if (i < itemLength || donProgram.paymentPlan.Name == constants.PaymentPlans.GIVE_ONCE) {

                    paySchedule.invoiceId = invoiceObj.id;
                    paySchedule.paymentIntentId = invoiceObj.payment_intent;
                    paySchedule.status = constants.PaymentStatus.Paid;//invoiceObj.status;
                    paySchedule.paymentDate = genericHelper.convertUnixDateToISOfomrat(invoiceObj.status_transitions.paid_at);
                    paySchedule.paidBy = constants.PayableBy.Donor;
                    paySchedule.attemptHistory =
                        [{
                            date: genericHelper.convertUnixDateToISOfomrat(invoiceObj.status_transitions.paid_at),
                            status: constants.PaymentStatus.Paid,
                            comment: 'Installment number' + (i + 1),
                        }]
                }
                else {

                    paySchedule.status = constants.PaymentStatus.Unpaid;
                    paySchedule.paymentDate = null;
                    paySchedule.paidBy = null;
                    paySchedule.attemptHistory = null;
                    paySchedule.invoiceId = '';
                    paySchedule.paymentIntentId = '';
                    paySchedule.attemptHistory = [];
                }
                paymentsSchedule.push(paySchedule);
            }
            objDonationRecurring.paymentSchedule = paymentsSchedule;
            if (!Items) {
                objDonationRecurring.additionalData = additionalData;
            }
            await databaseHelper.updateItem(constants.Database.Collections.DON_REC.dataKey, { "stripeSubscriptionId": invoiceObj.subscription, _id: donationRecurring[j]._id },
                objDonationRecurring);

            let sposorshipType = donationRecurring[j].orphan ? constants.SponsorshipType.Orphan : constants.SponsorshipType.Student;

            if (sposorshipType) {
                await updateEndDateForStudentOrOrphan(sposorshipType, END_DATE, donationRecurring[j].orphan ? donationRecurring[j].orphan : donationRecurring[j].student);
            }
            resp.flag = true;
        }
        return resp;
    }
    catch (ex) {
        logHelper.logError(`${FILE_NAME}: ${methodName}: `, ex);
        return null;
    }



}
//Insert New Tenure Donation Program Details 
async function createDonationProgramDetailsForNextTenure(invoiceObj, updatedDProg, noOfMonths, installmentNo, invoiceNumbers) {
    const methodName = "createDonationProgramDetailsForNextTenure";
    try {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: Create Donation program details  For next Tenure `);
        let installmentDate;
        let itemLength = noOfInstallment ? noOfInstallment : 1;
        if (stripeSubscriptionStartDate) {
            installmentDate = stripeSubscriptionStartDate;
        }
        else {
            installmentDate = genericHelper.convertUnixDateToISOfomrat(invoiceObj.created);
            itemLength = 1;
        }

        let objDonorProgramDetails = {};

        let donorProgram = {
            _id: updatedDProg._id //new ObjectID(newInsertedDonorProgram._id)
            ,
            program:
            {
                _id: updatedDProg.program.programDetails._id, //new ObjectID(newInsertedDonorProgram.program.programDetails._id),
                programName: updatedDProg.program.programDetails.programName,
                slug: updatedDProg.program.programDetails.slug,
            }
        }

        if (!updatedDProg.isRecurringProgram
            || (updatedDProg.isRecurringProgram && updatedDProg.paymentPlan.Name == constants.PaymentPlans.GIVE_ONCE))
            noOfMonths = 1;//add only one entry for non recurring program and for GIVE once program
        for (let i = 0; i < noOfMonths; i++) {
            try {
                if (noOfMonths > 1)
                    objDonorProgramDetails.installmentNo = installmentNo + (i + 1);
                if (i < itemLength) {
                    //first installment payment
                    objDonorProgramDetails.installmentDate = installmentDate;
                    objDonorProgramDetails.paymentDate = genericHelper.convertUnixDateToISOfomrat(invoiceObj.status_transitions.paid_at);
                    objDonorProgramDetails.paymentStatus = invoiceObj.paid ? constants.PaymentStatus.Paid : constants.PaymentStatus.Unpaid; //invoiceObj.status;
                    objDonorProgramDetails.paymentIntentId = invoiceObj.payment_intent;
                    objDonorProgramDetails.comments = 'Installment number ' + (installmentNo + (i + 1));
                    objDonorProgramDetails.stripeInvoiceId = invoiceObj.id;
                    objDonorProgramDetails.invoiceLink = invoiceNumbers ? `public/pdf/Reciept-${selectedLanguage}-${invoiceNumbers[i]}.pdf` : '';
                    let stripeChargeHistoryObj = {
                        paymentStatus: invoiceObj.paid ? constants.PaymentStatus.Paid : constants.PaymentStatus.Unpaid,//invoiceObj.status,
                        nextPaymentAttempt: invoiceObj.next_payment_attempt,
                        attemptCount: invoiceObj.attempt_count,
                        status_Transition: invoiceObj.status_transitions
                    };
                    objDonorProgramDetails.stripeChargeHistory = [stripeChargeHistoryObj];
                }
                else {
                    objDonorProgramDetails.installmentDate = dateHelper.addMonthsInDate(installmentDate, i);
                    objDonorProgramDetails.paymentDate = null;
                    objDonorProgramDetails.paymentStatus = constants.PaymentStatus.Unpaid;
                    objDonorProgramDetails.paymentIntentId = null;
                    objDonorProgramDetails.comments = '';
                    objDonorProgramDetails.stripeInvoiceId = '';
                    objDonorProgramDetails.invoiceLink = '';
                    objDonorProgramDetails.stripeChargeHistory = [];
                }
                objDonorProgramDetails.created = Date.now();
                objDonorProgramDetails.updated = Date.now();
                objDonorProgramDetails.amount = Number((invoiceObj.total / 100));//updatedDProg.totalAmount;

                objDonorProgramDetails.stripeSubscriptionId = invoiceObj.subscription;
                objDonorProgramDetails.donorProgram = donorProgram;
                await databaseHelper.insertItem(constants.Database.Collections.DON_PRG_DET.dataKey, objDonorProgramDetails);
            }
            catch (err) {
                logHelper.logError(`${FILE_NAME}: insertDonorProgramDetails : `, err);
            }
        }

    }
    catch (ex) {
        logHelper.logError(`${FILE_NAME}: ${methodName}: `, ex);
        return null;
    }


}
//  Update Sponorship end date for student or Orphan
async function updateEndDateForStudentOrOrphan(sposorshipType, endDate, sponssoredEntity) {

    const methodName = "updateEndDateForStudentOrOrphan";
    try {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: update endDate For sposnosrhips`);


        if (sposorshipType == constants.SponsorshipType.Orphan) {
            // update orphan sponsorship with end date 
            await databaseHelper.updateItem(constants.Database.Collections.ORP_SCH.dataKey, { orphans: sponssoredEntity }, { endDate: endDate });

        }
        else {
            // update student sponsorship with end date 
            await databaseHelper.updateItem(constants.Database.Collections.STU_SCH.dataKey, { students: sponssoredEntity }, { endDate: endDate });
        }

    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: insertDonorProgramDetails : `, err);
    }
}
//#endregion Successful Invoice.Paid Processing End


//#region CustomerSubscriptionCancelled Processing start   


//if cancelled, mark donor program inactive, future payments as inactive, store stripestatus 


// Update Donor Program with Status inactive 
async function updateDPwithSubscriptionStatus(subscriptionObj) {

    const methodName = "updateDPwithSubscriptionCancel";
    try {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: update Donor Program For changing subscription status to cancel`);

        let UpdateObj = {
            stripeSubscriptionStatus: subscriptionObj.status
        };
        await databaseHelper.updateItem(constants.Database.Collections.DON_PRG.dataKey, { "stripeSubscriptionId": subscriptionObj.id, isRecurringProgram: true, isRecurringProgram: { $exists: true } }, UpdateObj);
    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: updateDPwithSubscriptionStatus : `, err);
    }
}
// update payment schedule for current and future objects 
async function updateDonationRecWithCancellationFuturePayments(subscriptionObj) {

    const methodName = "updateDonationRecWithCancellationFuturePayments";
    try {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: update Payment Schedules for future pending payments `);

        let donRecItems = await databaseHelper.getItems(constants.Database.Collections.DON_REC.dataKey, { "stripeSubscriptionId": subscriptionObj.id, freezed: false }, { stripeSubscriptionId: 1, paymentSchedule: 1, updated: 1 });

        if (donRecItems) {

            for (let j = 0; j < donRecItems.length; j++) {

                let queryDate = Date.now();
                let startDate = dateHelper.getStartOfMonth(queryDate).toISOString();

                let paySchedule = donRecItems[j].paymentSchedule;
                let filteredPS = paySchedule.filter(schedule => schedule.installmentDate >= startDate);
                let index = -1;

                if (filteredPS.length > 0) {

                    for (let k = 0; k < filteredPS.length; k++) {

                        filteredPS[k].isActive = false;
                        filteredPS[k].comment = filteredPS[k].comment + ' ,Subscription cancelled from stripe ';
                        index = filteredPS[k].installmentNo - 1;
                        paySchedule[index] = filteredPS[k];
                    }

                    let updateObj = {
                        updated: Date.now(),
                        paymentSchedule: paySchedule

                    };

                    await databaseHelper.updateItem(constants.Database.Collections.DON_REC.dataKey, { "stripeSubscriptionId": subscriptionObj.id, _id: donRecItems[j]._id },
                        updateObj);


                }
            }
        }


    }
    catch (err) {

        logHelper.logError(`${FILE_NAME}: insertDonorProgramDetails : `, err);
    }
}
// update email donor to notify of cancellation 

//#endregion CustomerSubscriptionCancelled Processing End


async function sendPaymentFailureEmail(stripeSubscriptionId, installmentDate, programSlug) {
    const methodName = "sendPaymentFailureEmail";

    let dynamicFields = [];
    try {

        var emailTemplateName;
        let billingAmount;
        let paymentDueDate;
        let gracePeriodEndDate;
        let currentInstallment;
        let totalInstallments;

        var donationItem = await databaseHelper.getItem(constants.Database.Collections.DON_ITEM.dataKey, {

            "body.items.stripeDetail.subscription.id": stripeSubscriptionId
        });

        let language = donationItem.body.selectedLang;

        donationItem.body.items = donationItem.body.items.filter(obj => obj.stripeDetail.subscription.id == stripeSubscriptionId && obj.isRecurringProgram == true);

        var donationRecurring = await databaseHelper.getItems(constants.Database.Collections.DON_REC.dataKey, {

            "stripeSubscriptionId": stripeSubscriptionId,
            freezed: false
        });

        var donorProgramDetails = await databaseHelper.getItems(constants.Database.Collections.DON_PRG_DET.dataKey, {

            stripeSubscriptionId: stripeSubscriptionId,
            "donorProgram.program.slug": programSlug
        }, { installmentNo: 1, _id: 1, installmentDate: 1, paymentStatus: 1, amount: 1 });

        var donorProgram = await databaseHelper.getItem(constants.Database.Collections.DON_PRG.dataKey, {

            "stripeSubscriptionId": stripeSubscriptionId, isRecurringProgram: true, isRecurringProgram: { $exists: true }
        });

        let cardInfo = donorProgram.donor.cardDetail.last4;
        let donorName = donorProgram.donor.donorName;

        let paymentPlan = donationItem.body.items[0].paymentPlan;

        let paymentPlanName;
        if (paymentPlan && paymentPlan.value) {
            paymentPlanName = paymentPlan.value[language];
        }

        let programName = getProgramNameWithSubCategory(donationItem.body.items[0]);

        let changeCardDetailUrl = configuration.changeCardDetails.pageUrl;

        if (donationRecurring && donationRecurring.length > 0 && programSlug == constants.ProgramSlugs.orphanSponsorship) {

            totalInstallments = donorProgramDetails && donorProgramDetails.length > 0 ? donorProgramDetails.length : 0;

            var lastUnpaidPaymentSchedule = donationRecurring[0].paymentSchedule.filter(function (el) {
                return (el.status == constants.PaymentStatus.Unpaid && el.payableBy == constants.PayableBy.Akhyar);
            });
            //sort descending by Installment No
            lastUnpaidPaymentSchedule.sort(function (a, b) {
                return b.installmentNo - a.installmentNo
            });

            paymentDueDate = (lastUnpaidPaymentSchedule && lastUnpaidPaymentSchedule.length > 0) ? lastUnpaidPaymentSchedule[0].installmentDate : '';

            gracePeriodEndDate = dateHelper.createUTCDate(dateHelper.addDaysInDate(paymentDueDate, configuration.aytamunaReport.gracePeriodDays, true));


            //Amount was wrong showing in Installment Detail grid
            //let billingAmount = (lastUnpaidPaymentSchedule && lastUnpaidPaymentSchedule.length > 0) ? lastUnpaidPaymentSchedule[0].amount : 0;

            // billingAmount = language == constants.Languages.Arabic.code ? `${donationItem.body.items[0].currency.symbol} ${arabicDigit.toArabic(parseInt(billingAmount), false)}` : `${donationItem.body.items[0].currency.symbol} ${parseInt(billingAmount)}`

            // Get Orphans List
            let orphanList;
            if (donationRecurring && donationRecurring.length > 0) {
                orphanList = donationRecurring.map(x => { return x.orphan });
            }

            currentInstallment = (lastUnpaidPaymentSchedule && lastUnpaidPaymentSchedule.length > 0) ? lastUnpaidPaymentSchedule[0].installmentNo : 0;

            donorProgramDetails = donorProgramDetails.filter(obj => obj.installmentNo == currentInstallment);

            dynamicFields.push({
                keyName: tokens.installments.INSTALLMENT,
                value: getInstallmentText(language, currentInstallment, totalInstallments, installmentDate, false)
            });

            dynamicFields.push({
                keyName: tokens.emailTemplate.ORPHANS_LIST,
                value: orphanList && orphanList.length > 0 ? paymentService.insertOrphanDataInReceipt(orphanList, language) : ''
            });
        }
        else if (programSlug == constants.ProgramSlugs.SadaqahADay) {
            donorProgramDetails = donorProgramDetails.filter(obj => obj.paymentStatus == constants.PaymentStatus.Unpaid);

            currentInstallment = donorProgramDetails[0].installmentNo;

            paymentDueDate = donorProgram.endDate;

            gracePeriodEndDate = dateHelper.createUTCDate(dateHelper.addDaysInDate(paymentDueDate, configuration.sadaqah.gracePeriodDays, true));

            dynamicFields.push({
                keyName: tokens.installments.INSTALLMENT,
                value: getInstallmentText(language, currentInstallment, totalInstallments, installmentDate, true)
            });

        }

        // Handle date to be translated in selected language
        paymentDueDate = language == constants.Languages.Arabic.code ?
            dateHelper.getDateInSpecificFormat(paymentDueDate, false, 'LL', constants.Languages.Arabic.locale) :
            language == constants.Languages.French.code ?
                dateHelper.getDateInSpecificFormat(paymentDueDate, false, 'LL', constants.Languages.French.locale) :
                dateHelper.getDateInSpecificFormat(paymentDueDate, false, 'Do MMM YYYY', constants.Languages.English.locale);

        gracePeriodEndDate = language == constants.Languages.Arabic.code ?
            dateHelper.getDateInSpecificFormat(gracePeriodEndDate, false, 'LL', constants.Languages.Arabic.locale) :
            language == constants.Languages.French.code ?
                dateHelper.getDateInSpecificFormat(gracePeriodEndDate, false, 'LL', constants.Languages.French.locale) :
                dateHelper.getDateInSpecificFormat(gracePeriodEndDate, false, 'Do MMM YYYY', constants.Languages.English.locale);

        billingAmount = (donorProgramDetails && donorProgramDetails.length > 0) ? donorProgramDetails[0].amount : 0;

        billingAmount = language == constants.Languages.Arabic.code ? `${donationItem.body.items[0].currency.symbol} ${arabicDigit.toArabic(parseInt(billingAmount), false)}` : `${donationItem.body.items[0].currency.symbol} ${parseInt(billingAmount)}`;


        changeCardDetailUrl = changeCardDetailUrl.replace(`[${tokens.common.DONOR_PROGRAM_DETAIL_ID}]`, donorProgramDetails[0]._id);

        var slugName = programSlug.toUpperCase().replace(/-/g, "_");
        emailTemplateName = `${constants.emailTemplates.FAILED_SUBSEQUENT_PAYMENT_EMAIL}_${slugName}_${language}`;

        dynamicFields.push({
            keyName: tokens.emailTemplate.PROGRAM_NAME,
            value: programName
        });

        dynamicFields.push({
            keyName: tokens.common.DONOR_NAME,
            value: donorName
        });

        dynamicFields.push({
            keyName: tokens.emailTemplate.APP_URL,
            value: configuration.app.appUrl
        });

        dynamicFields.push({
            keyName: tokens.emailTemplate.UPDATE_CARD_URL,
            value: changeCardDetailUrl
        });

        dynamicFields.push({
            keyName: tokens.emailTemplate.PAYMENT_PLAN,
            value: paymentPlanName
        });

        dynamicFields.push({
            keyName: tokens.emailTemplate.CARD_INFO,
            value: cardInfo
        });

        dynamicFields.push({
            keyName: tokens.emailTemplate.BILLING_AMOUNT,
            value: billingAmount
        });

        dynamicFields.push({
            keyName: tokens.emailTemplate.GRACE_PERIOD_END_DATE,
            value: gracePeriodEndDate
        });

        dynamicFields.push({
            keyName: tokens.emailTemplate.PAYMENT_DUE_DATE,
            value: paymentDueDate
        });

        var emailResponse = await emailService.sendEmailByTemplate(emailTemplateName, dynamicFields, undefined, donationItem.body.donarEmailWithoutLogin || donationItem.body.donarEmail);
    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: ${methodName}:`, err);
        console.log("err..", err);
    }
}
function getInstallmentText(language, installmentNo, totalInstallments, installmentDate, isLifeTimeSubscription) {

    // return language == constants.Languages.Arabic.code ? `<br /> <i>(رقم القسط ${arabicDigit.toArabic(installmentNo)} من ${arabicDigit.toArabic(totalInstallments)}&nbsp;||&nbsp;شهر التقسيط: ${dateHelper.getDateInSpecificFormat(installmentDate, true, 'MMMM-YY', constants.Languages.Arabic.locale)})</i>` : language == constants.Languages.French.code ? `<br /> <i>(N° VRSMT: ${installmentNo} sur ${totalInstallments}&nbsp;||&nbsp;Mois VRSMT: ${dateHelper.getDateInSpecificFormat(installmentDate, true, 'MMMM-YY', constants.Languages.French.locale)})</i>` : `<br /> <i>(Inst. No: ${installmentNo} of ${totalInstallments}&nbsp;||&nbsp;Inst. Month: ${dateHelper.getDateInSpecificFormat(installmentDate, true, 'MMMM-YY')})</i> `;

    let textToReturn;
    if (language == constants.Languages.Arabic.code) {
        textToReturn = isLifeTimeSubscription == true ? `<br /> <i>(رقم القسط ${arabicDigit.toArabic(installmentNo)}&nbsp;||&nbsp;شهر التقسيط: ${dateHelper.getDateInSpecificFormat(installmentDate, true, 'MMMM-YY', constants.Languages.Arabic.locale)})</i>` : `<br /> <i>(رقم القسط ${arabicDigit.toArabic(installmentNo)} من ${arabicDigit.toArabic(totalInstallments)}&nbsp;||&nbsp;شهر التقسيط: ${dateHelper.getDateInSpecificFormat(installmentDate, true, 'MMMM-YY', constants.Languages.Arabic.locale)})</i>`;
    }
    else if (language == constants.Languages.French.code) {
        textToReturn = isLifeTimeSubscription == true ? `<br /> <i>(N° VRSMT: ${installmentNo}&nbsp;||&nbsp;Mois VRSMT: ${dateHelper.getDateInSpecificFormat(installmentDate, true, 'MMMM-YY', constants.Languages.French.locale)})</i>` : `<br /> <i>(N° VRSMT: ${installmentNo} sur ${totalInstallments}&nbsp;||&nbsp;Mois VRSMT: ${dateHelper.getDateInSpecificFormat(installmentDate, true, 'MMMM-YY', constants.Languages.French.locale)})</i>`;
    }
    else {
        textToReturn = isLifeTimeSubscription == true ? `<br /> <i>(Inst. No: ${installmentNo}&nbsp;||&nbsp;Inst. Month: ${dateHelper.getDateInSpecificFormat(installmentDate, true, 'MMMM-YY')})</i>` : `<br /> <i>(Inst. No: ${installmentNo} of ${totalInstallments}&nbsp;||&nbsp;Inst. Month: ${dateHelper.getDateInSpecificFormat(installmentDate, true, 'MMMM-YY')})</i>`;
    }

    return textToReturn;
}
function getProgramNameWithSubCategory(cartItem) {
    let result;
    if (cartItem && cartItem.program) {
        let program = cartItem.program;
        if (cartItem.otherFieldForNiyaz) {
            result = `${program.programName} - ${cartItem.otherFieldForNiyaz}`;
        }
        else if (cartItem.otherPersonalityName) {
            result = `${program.programName} - ${cartItem.otherPersonalityName}`;
        }
        else if (cartItem.programSubCategory && cartItem.programSubCategory.programSubCategoryName) {
            if (cartItem.marhomeenName) {
                result = `${program.programName} - ${cartItem.programSubCategory.programSubCategoryName || ''} - ${cartItem.marhomeenName || ''}`;
            }
            else {
                result = `${program.programName} - ${cartItem.programSubCategory.programSubCategoryName || ''}`;
            }
        } else {
            result = `${program.programName}`;
        }
    } else {
        result = '---'
    }

    return result;
}
async function correctSubsequentPaymentMissingData(invoiceObj) {

    const methodName = "correctSubsequentPaymentMissingData";
    try {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}:  correct missing data `);

        let updatedDProg = await updateDonorProgram(invoiceObj);

        //Get donation
        let newDonation = await databaseHelper.getItem(constants.Database.Collections.DONATN.dataKey, { "additionalData.stripeSubscriptionId": invoiceObj.subscription }, {}, { sort: { _id: -1 } });
        /* get donation object here */ //await insertInDonation(invoiceObj, updatedDProg);

        //Insert in Donation Details
        let donationDetail = await insertInDonationDetails(invoiceObj, updatedDProg, newDonation);

        //Need to convert unix datetime to ISO date format (11 May 2021)
        let paid_at = genericHelper.convertUnixDateToISOfomrat(invoiceObj.status_transitions.paid_at);

        // Send email to donor with attached invoice receipt
        await sendEmailWithReceipt(newDonation.invoiceNo, invoiceObj.subscription, paid_at, newDonation, donationDetail.installmentNumber, false, genericHelper.convertUnixDateToISOfomrat(invoiceObj.created), constants.ProgramSlugs.orphanSponsorship);

    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: correctSubsequentPaymentMissingData : `, err);
    }
}