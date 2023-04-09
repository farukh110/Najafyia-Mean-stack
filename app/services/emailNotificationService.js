const logHelper = require('../utilities/logHelper');
const databaseHelper = require('../utilities/databaseHelper');
const configuration = require('../../config/configuration');
const constants = require('../constants');
const dateHelper = require('../utilities/dateHelper');
const dataService = require('../services/dataService')
var _ = require('lodash');
var emailService = require('../services/emailService')
var tokens = require('../tokenData');
const paymentService = require('../services/paymentService');
var ObjectID = require('mongodb').ObjectID;
const donorProgramService = require('../services/donorProgramService.js');
var moment = require('moment');
var apiRequestHelper = require('../utilities/apiRequestHelper')

const sadaqahService = require('../services/sadaqahService.js');

const FILE_NAME = constants.LogLiterals.EMAIL_NOTIFICATION_SERVICE

module.exports = {
    sendOrphanSponsorshipNotification,
    sendOutstandingReport,
    sendEmailNotificationForSadaqahSponosrshipRenewal
};

async function sendOrphanSponsorshipNotification() {

    methodName = 'sendOrphanSponsorshipNotification()';
    logHelper.logInfo(`${FILE_NAME}: ${methodName}: Method is starting`);

    try {

        let configurationData = await dataService.getConfigSettings(constants.Universal.OrphanSponsorshipsReminders);

        //will use the single method and pass the flag true or false for isBefore

        if (configuration.Notifications.EnableBeforeNotification) {
            logHelper.logInfo(`${FILE_NAME}: ${methodName}: EnableBeforeNotification`);
            await sendEmailNotificationForOrphanSponsorship(configurationData, true);
        }

        if (configuration.Notifications.EnableAfterNotification) {
            logHelper.logInfo(`${FILE_NAME}: ${methodName}: EnableAfterNotification`);
            await sendEmailNotificationForOrphanSponsorship(configurationData, false);
        }

        return true;
    }
    catch (ex) {
        logHelper.logError(`${FILE_NAME}: ${methodName}: Error`, ex);
        return false;
    }
}

async function sendEmailNotificationForOrphanSponsorship(configurationData, isBefore) {
    const methodName = 'sendEmailNotificationForOrphanSponsorship()';

    logHelper.logInfo(`${FILE_NAME}: ${methodName}: Method is starting`);

    let dynamicFields = [];

    let templateName;
    let completeTemplateName;
    let donorName;
    let donorEmail;
    let reminderNo;
    let programSlug = constants.ProgramSlugs.orphanSponsorship;
    let needToSendEmail = false;
    let renewalLinkMonthly;
    let renewalLinkYearly;
    let isVisibleOnce = true;
    let isVisibleMonthly = true;
    try {

        //Get data from donation recurring
        var donationRecurringData = await getDataFromDonationRecurring(isBefore);

        let keyToGroup = 'donationDetails.donation._id';
        var groupedDonationRecurring = await groupByDonationRecurring(donationRecurringData, keyToGroup);

        //Make the array of donationDetails.donation._id
        let groupedDonationRecurringArray = Object.keys(groupedDonationRecurring);

        for (let i = 0; i < groupedDonationRecurringArray.length; i++) {

            //Replace long variable to short one
            let currentDonRecr = groupedDonationRecurring[groupedDonationRecurringArray[i]][0];

            //First step: To check either this donation/subscription is from old flow or new flow
            currentDonRecr.isNewFlow = currentDonRecr.paymentSchedule ? true : false;

            let objExtractedData = await extractData(groupedDonationRecurring, groupedDonationRecurringArray, i)

            if (currentDonRecr.isNewFlow) {

                //If new flow then check last paymet status must be paid and Auto renewal = off
                var donorPrgData = await getDonorProgram(currentDonRecr.stripeSubscriptionId, programSlug)

                if (donorPrgData == false) { needToSendEmail = true; }
                else { needToSendEmail = false; break; }

                var donorPrgDetData = await getDonorProgramDetail(currentDonRecr.stripeSubscriptionId)

                renewalLinkYearly = configuration.app.appUrl + '/renewOrphanSponsorshipSubscription?dpd=' + donorPrgDetData._id
                renewalLinkMonthly = renewalLinkYearly + '&isMonthly=1'

                let plan = currentDonRecr.additionalData.paymentPlan

                if (plan == constants.PaymentPlans.MONTHLY) { isVisibleOnce = false }
                else { isVisibleMonthly = false }
            }
            else {
                renewalLinkYearly = configuration.app.appUrl + 'renewOrphanSponsorships?sid=' + groupedDonationRecurringArray[i]
                renewalLinkMonthly = renewalLinkYearly + '&isMonthly=1'
            }

            var donorData = await getDonorInformation(objExtractedData.donorId);

            donorName = donorData.donarName || "";
            let donorEmail = (donorData && donorData.email) ? donorData.email : ''
            objExtractedData.donorName = donorName;

            var notificationData = await getNotificationStatusInfo(objExtractedData.donationId, isBefore, programSlug);

            if (notificationData && notificationData.length == 0) {

                //Means no notification has been sent now

                if (isBefore) {
                    reminderNo = configurationData.value.orphanSponsorshipReminders.BerforeEnd[0].reminderNo
                    templateName = configurationData.value.orphanSponsorshipReminders.BerforeEnd[0].templateName
                }
                else {
                    reminderNo = configurationData.value.orphanSponsorshipReminders.AfterEnd[0].reminderNo
                    templateName = configurationData.value.orphanSponsorshipReminders.AfterEnd[0].templateName
                }

                needToSendEmail = true;
            }
            else {

                // Subsequent reminders are being sent
                let intervalData = await retreiveReminderNotificationData(notificationData, configurationData, objExtractedData, reminderNo, templateName, isBefore);

                reminderNo = intervalData.reminderNo
                templateName = intervalData.templateName
                needToSendEmail = intervalData.needToSendEmail
            }

            if (needToSendEmail) {
                completeTemplateName = `${templateName}_${reminderNo}_${objExtractedData.language}`

                // Get Orphans List
                let orphanList = await getOrphanListFromObject(groupedDonationRecurring, groupedDonationRecurringArray, i);

                //Replace dynamic values
                dynamicFields = await replaceDynamicValues(objExtractedData, orphanList, renewalLinkMonthly, renewalLinkYearly, isVisibleOnce, isVisibleMonthly, programSlug);

                var emailResponse = await emailService.sendEmailByTemplate(completeTemplateName, dynamicFields, undefined, donorEmail);

                // insert data in notification status collection

                let insertNotificationStatus = await insertInNotificationStatus(reminderNo, completeTemplateName, emailResponse, objExtractedData.donationId, programSlug, isBefore, donorEmail);
            }
        }

        return true;
    }
    catch (err) {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: Error.. `, err);
    }
}

async function retreiveReminderNotificationData(notificationData, configurationData, objExtractedData, reminderNo, templateName, isBefore) {
    const methodName = 'retreiveReminderNotificationData()';
    logHelper.logInfo(`${FILE_NAME}: ${methodName}: Method is starting`);

    let intervalData = {};
    let currentDate = new Date().getUTCDate();

    try {

        let alreadySentReminderNumber = notificationData[0].additionalData.reminder;
        let nextReminderToBeSend = alreadySentReminderNumber + 1;
        let intervalCalculation = alreadySentReminderNumber * configurationData.value.orphanSponsorshipReminders.ReminderInterval;
        let lastSentDate = new Date(notificationData[0].created);
        let addNumberOfDaysInLastSent = lastSentDate.getDate() + intervalCalculation;

        if (addNumberOfDaysInLastSent <= currentDate && currentDate <= objExtractedData.endDate) {
            reminderNo = nextReminderToBeSend
            if (isBefore) {
                templateName = configurationData.value.orphanSponsorshipReminders.BerforeEnd[nextReminderToBeSend - 1].templateName
            }
            else {
                templateName = configurationData.value.orphanSponsorshipReminders.AfterEnd[nextReminderToBeSend - 1].templateName
            }

            //Reminders number is from 1 and Array starts from 0 thatswhy nextReminderToBeSend - 1 in above logic

            needToSendEmail = true;

            intervalData.alreadySentReminderNumber = alreadySentReminderNumber
            intervalData.nextReminderToBeSend = nextReminderToBeSend
            intervalData.intervalCalculation = intervalCalculation
            intervalData.lastSentDate = lastSentDate
            intervalData.addNumberOfDaysInLastSent = addNumberOfDaysInLastSent
            intervalData.reminderNo = reminderNo
            intervalData.templateName = templateName
            intervalData.needToSendEmail = needToSendEmail

        }
        else { needToSendEmail = false; }


    }
    catch (err) {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: Error... `, err);
    }

    return intervalData;
}

async function replaceDynamicValues(objExtractedData, orphanList, renewalLinkMonthly, renewalLinkYearly, isVisibleOnce, isVisibleMonthly, programSlug) {
    const methodName = 'replaceDynamicValues()';
    logHelper.logInfo(`${FILE_NAME}: ${methodName}: Method is starting`);

    let dynamicFields = [];

    try {

        //Grace Period end date 
        let gracePeriodDays = configuration.aytamunaReport.gracePeriodDays
        let gracePeriodEndDate = dateHelper.addDaysInDate(objExtractedData.endDate, gracePeriodDays, true)

        //Rate work
        let ratewithCurrency = await sponsorshipAmount(objExtractedData, programSlug);

        dynamicFields.push({
            keyName: tokens.emailTemplate.ORPHANS_LIST,
            value: orphanList && orphanList.length > 0 ? paymentService.insertOrphanDataInReceipt(orphanList, objExtractedData.language) : ''
        });

        dynamicFields.push({
            keyName: tokens.common.DONOR_NAME,
            value: objExtractedData.donorName
        });

        dynamicFields.push({
            keyName: tokens.common.END_DATE,
            value: moment(new Date(objExtractedData.endDate)).format("DD-MMM-YYYY")
        });

        dynamicFields.push({
            keyName: tokens.common.MONTHLY,
            value: ratewithCurrency.amountPerMonth
        });

        dynamicFields.push({
            keyName: tokens.common.YEARLY,
            value: ratewithCurrency.amountPerYear
        });

        dynamicFields.push({
            keyName: tokens.common.RENEWAL_LINK_MONTHLY,
            value: renewalLinkMonthly
        });

        dynamicFields.push({
            keyName: tokens.common.RENEWAL_LINK_YEARLY,
            value: renewalLinkYearly
        });

        dynamicFields.push({
            keyName: tokens.emailTemplate.APP_URL,
            value: configuration.app.appUrl
        });
        dynamicFields.push({
            keyName: tokens.emailTemplate.GRACE_PERIOD_END_DATE,
            value: moment(new Date(gracePeriodEndDate)).format("DD-MMM-YYYY")
        });

        dynamicFields.push({
            keyName: tokens.common.ISVISIBLE + tokens.common.ONCE,
            value: isVisibleOnce
        });

        dynamicFields.push({
            keyName: tokens.common.ISVISIBLE + tokens.common.MONTHLY,
            value: isVisibleMonthly
        });

    }
    catch (err) {

        logHelper.logInfo(`${FILE_NAME}: ${methodName}: Error... `, err);
    }

    return dynamicFields;
}
async function getOrphanListFromObject(groupedDonationRecurring, groupedDonationRecurringArray, i) {
    const methodName = 'getOrphanListFromObject()';
    logHelper.logInfo(`${FILE_NAME}: ${methodName}: Method is starting`);
    let orphanList
    try {
        if (groupedDonationRecurring[groupedDonationRecurringArray[i]] &&
            groupedDonationRecurring[groupedDonationRecurringArray[i]].length > 0) {

            orphanList = groupedDonationRecurring[groupedDonationRecurringArray[i]].map(x => { return x.orphan });
        }

    }
    catch (err) {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: Error... `, err);
    }
    return orphanList;
}
async function sponsorshipAmount(objExtractedData, programSlug) {
    const methodName = 'sponsorshipAmount()';
    logHelper.logInfo(`${FILE_NAME}: ${methodName}: Method is starting`);

    try {
        let ratewithCurrency = await donorProgramService.getLatestRateForProgram(programSlug);

        let amountPerYear = objExtractedData.currency + ratewithCurrency[constants.PaymentPlans.GIVE_ONCE][objExtractedData.currencyTitle] + ' for a year'

        let amountPerMonth = objExtractedData.currency + ratewithCurrency[constants.PaymentPlans.MONTHLY][objExtractedData.currencyTitle] + ' per month for a year'

        ratewithCurrency.amountPerMonth = amountPerMonth;
        ratewithCurrency.amountPerYear = amountPerYear;

        return ratewithCurrency;
    }
    catch (err) {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: `, err);
    }
}

async function extractData(groupedDonationRecurring, groupedDonationRecurringArray, i) {
    const methodName = 'extractData()';
    logHelper.logInfo(`${FILE_NAME}: ${methodName}: Method is starting`);
    try {
        let objDonRecur = groupedDonationRecurring[groupedDonationRecurringArray[i]][0];
        let donorId = objDonRecur.donar;
        let endDate = objDonRecur.endDate;
        let donationId = groupedDonationRecurringArray[i];
        let currency = objDonRecur.donationDetails.donation.currency
        let currencyTitle = objDonRecur.donationDetails.donation.currencyTitle

        let documentPath = objDonRecur.donationDetails.donation.documentPath
        let documentPathSplit = documentPath.split('-')
        let language = documentPathSplit[1]

        objExtractedData = {
            donorId: donorId,
            endDate: endDate,
            donationId: donationId,
            currency: currency,
            currencyTitle: currencyTitle,
            language: language,
        }


    }
    catch (err) {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: `, err);
    }

    return objExtractedData;
}
async function groupByDonationRecurring(donationRecurringData, keyToGroup) {

    const methodName = 'groupByDonationRecurring()';
    logHelper.logInfo(`${FILE_NAME}: ${methodName}: Method is starting`);

    try {

        // Two syntex for it

        //syntex 01
        var groupedDonationRecurring = _.mapValues(_.groupBy(donationRecurringData, keyToGroup),
            clist => clist.map(don => _.omit(don, keyToGroup)));

        //syntex 02
        //var groupedDonationRecurring = _.groupBy(donationRecurringData, keyToGroup);

        return groupedDonationRecurring;
    }
    catch (err) {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: `, err);
    }
}

async function insertInNotificationStatus(reminderNo, completeTemplateName, emailResponse, donationId, programSlug, isBefore, donorEmail) {
    const methodName = 'insertInNotificationStatus()';
    logHelper.logInfo(`${FILE_NAME}: ${methodName}: Method is starting`);

    try {
        let objAdditionalData = {
            reminder: reminderNo,
            templateName: completeTemplateName,
            type: (isBefore) ? constants.ReminderTypes.Before : constants.ReminderTypes.After,
            emailResponse: emailResponse,
            donorEmail: donorEmail
        };

        let objNotificationStatus = {
            donationId: donationId,
            program: programSlug,
            additionalData: objAdditionalData
        };

        let insertNotificationStatus = await databaseHelper.insertItem(constants.Database.Collections.NOTIFICATION_STATUS.dataKey, objNotificationStatus);

        return insertNotificationStatus;
    }
    catch (err) {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: Error... `, err);
    }
}
async function getDataFromDonationRecurring(isBefore) {
    const methodName = 'getDataFromDonationRecurring()';

    logHelper.logInfo(`${FILE_NAME}: ${methodName}: Method is starting`);

    let startOfMonth = dateHelper.getStartOfMonth(new Date()).toISOString();
    let endOfMonth = dateHelper.getEndOfMonth(new Date()).toISOString();

    let startOfLastMonth = new Date(startOfMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1)

    let endOfLastMonth = dateHelper.getEndOfMonth(startOfLastMonth).toISOString();

    //Either no Stage Transition. OR If stage transition is present then must not be Ended
    try {
        let query_DON_REC = {
            orphan: { $exists: true },
            freezed: false,
            isActive: true,
            $or: [
                { stageTransition: { $exists: false } },
                { stageTransition: { $exists: true }, stageTransition: { $ne: 'Ended' } },
                { enableNotification: { $exists: false } }, { enableNotification: true }],

        }
        if (isBefore) {
            query_DON_REC.endDate = { $gte: startOfMonth, $lte: endOfMonth };
        }
        else {
            query_DON_REC.endDate = { $gte: startOfLastMonth, $lte: endOfLastMonth };
        }

        console.log("query_DON_REC..", query_DON_REC)
        var payload_DON_REC = {
            donationDetails: 1, endDate: 1, donar: 1, orphan: 1, paymentSchedule: 1, stripeSubscriptionId: 1, additionalData: 1
        }

        var donationRecurringData = await databaseHelper.getItems(constants.Database.Collections.DON_REC.dataKey, query_DON_REC, payload_DON_REC);

        return donationRecurringData;
    }
    catch (err) {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: Error `, err);
    }
}

async function getDonorProgram(stripeSubscriptionId, programSlug) {
    const methodName = 'getDonorProgram()';
    logHelper.logInfo(`${FILE_NAME}: ${methodName}: Method is starting`);

    try {

        // Check last payment status and is auto renew on / off
        // No need to send reminder emails to those donor whose auto renewal is ON / Last Payment Status = Unpaid

        var query_DONR_PRG = {
            stripeSubscriptionId: stripeSubscriptionId,
            isAutoRenewal: false,
            lastPaymentStatus: constants.PaymentStatus.Paid,
            'program.programDetails.slug': programSlug
        }

        var payload_DONR_PRG = {
            isAutoRenewal: 1, lastPaymentStatus: 1
        }

        var donorPrgData = await databaseHelper.getItem(constants.Database.Collections.DON_PRG.dataKey, query_DONR_PRG, payload_DONR_PRG);

        return donorPrgData;
    }
    catch (err) {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: Error....`, err);
    }
}

async function getDonorProgramDetail(stripeSubscriptionId) {
    const methodName = 'getDonorProgramDetail()';
    logHelper.logInfo(`${FILE_NAME}: ${methodName}: Method is starting`);

    try {

        var query_DONR_PRG_DET = {
            stripeSubscriptionId: stripeSubscriptionId
        }

        var payload_DONR_PRG_DET = {
            _id: 1
        }

        var SORT_DONR_PRG_DET = { sort: { _id: -1 } }


        var donorPrgDetData = await databaseHelper.getItem(constants.Database.Collections.DON_PRG_DET.dataKey, query_DONR_PRG_DET, payload_DONR_PRG_DET, SORT_DONR_PRG_DET);

        return donorPrgDetData;
    }
    catch (err) {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: Error... `, err);
    }
}

async function getDonorInformation(donorId) {
    const methodName = 'getDonorInformation()';
    logHelper.logInfo(`${FILE_NAME}: ${methodName}: Method is starting`);

    try {

        // Get donor information from donor collection
        var query_DONR = {
            _id: donorId
        }

        var payload_DONR = {
            donarName: 1, email: 1, user: 1
        }

        var donorData = await databaseHelper.getItem(constants.Database.Collections.DONR.dataKey, query_DONR, payload_DONR);

        return donorData;
    }
    catch (err) {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: Error...donorId is..${donorId} `, err);
    }
}

async function getNotificationStatusInfo(donationId, isBefore, programSlug) {
    const methodName = 'getNotificationStatusInfo()' + donationId;
    logHelper.logInfo(`${FILE_NAME}: ${methodName}: Method is starting with input parametrs donationId: ${donationId} `);

    try {

        let type = isBefore ? constants.ReminderTypes.Before : constants.ReminderTypes.After
        // Get Notification Status information
        var query_Notification = {
            donationId: donationId,
            program: programSlug,
            'additionalData.type': type
        }

        var payload_Notification = {
            donationId: 1, program: 1, additionalData: 1, created: 1
        }

        var sort_Notification = { created: -1 };

        var notificationData = await databaseHelper.getItems(constants.Database.Collections.NOTIFICATION_STATUS.dataKey, query_Notification, payload_Notification, sort_Notification);

        return notificationData;
    }
    catch (err) {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: Error...donationId is..${donationId} `, err);
    }
}

async function sendOutstandingReport() {

    methodName = 'sendOutstandingReport()';
    logHelper.logInfo(`${FILE_NAME}: ${methodName}: Method is starting`);
    try {

        // fromDate & toDate expected fromat = YYYY-MM-DD   e.g :2021-04-23 
        let startDate = dateHelper.getStartOfPreviousMonth(new Date()).toISOString();
        let endDate = dateHelper.getEndOfMonth(startDate).toISOString()

        let startDateFilter = dateHelper.getDateInSpecificFormat(startDate, true, 'YYYY-MM-DD', undefined)
        let endDateFilter = dateHelper.getDateInSpecificFormat(endDate, true, 'YYYY-MM-DD', undefined)

        let fileAttachment = []
        fileAttachment = await prepareFileAttachment(false, fileAttachment, startDateFilter, endDateFilter)
        fileAttachment = await prepareFileAttachment(true, fileAttachment, startDateFilter, endDateFilter)

        let dynamicFields = [];

        dynamicFields.push({
            keyName: tokens.emailTemplate.MONTH,
            value: moment(new Date(startDateFilter)).format("MMM-YYYY")
        });

        dynamicFields.push({
            keyName: tokens.emailTemplate.APP_URL,
            value: configuration.app.appUrl
        });

        let templateName = 'OUTSTANDING_REPORT'

        let emailResponse = await emailService.sendEmailByTemplate(templateName, dynamicFields, fileAttachment, null);

        logHelper.logError(`${FILE_NAME}: ${methodName}: emailResponse`, emailResponse);
        return true;
    }
    catch (ex) {
        logHelper.logError(`${FILE_NAME}: ${methodName}: Error`, ex);
        return false;
    }
}

async function prepareFileAttachment(isTransactionDateFilter, fileAttachment, startDateFilter, endDateFilter) {
    methodName = 'prepareFileAttachment()';
    let fileName
    try {

        let url = `${configuration.app.apiUrlReportServer}/reports/SponsorshipsOutstandingReport?fromDate=${startDateFilter}&toDate=${endDateFilter}&isTransactionDateFilter=${isTransactionDateFilter}`

        let headers = {
            'Content-Type': 'application/json',
            'authorizationKey': configuration.authorization.key
        };

        let response = await apiRequestHelper.sendRequest(url, apiRequestHelper.HTTPMethods.GET, headers, null);

        let dataToExport = response.data.records

        if (isTransactionDateFilter) {
            fileName = `Outstanding${startDateFilter}to${endDateFilter}_TransactionDate.csv`
        }
        else {
            fileName = `Outstanding${startDateFilter}to${endDateFilter}_PaymentDueDate.csv`
        }

        let obj = { fileName: fileName, buffer: convertCsv(dataToExport) }

        fileAttachment.push(obj)

        return fileAttachment;
    }
    catch (ex) {
        console.log("exception:  ", ex);
        logHelper.logError(`${FILE_NAME}: ${methodName}: Error in job`, ex);
    }
}

function getHeaderRow(objectRow) {
    methodName = 'getHeaderRow';
    let row = '';
    try {
        for (var key of Object.keys(objectRow)) {
            row += key + ',';
        }
    }
    catch (err) {

        logHelper.logError(`${FILE_NAME}: ${methodName}: Error in job`, ex);
    }
    return row
}

function convertCsv(objArray) {
    methodName = 'convertCsv';
    try {
        var line = '';
        var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
        var str = '';
        str += getHeaderRow(array[0])
        str += line + '\r\n';
        for (var i = 0; i < array.length; i++) {
             line = '';
            for (var index in array[i]) {
                if (line != '') line += ','

                line += array[i][index];
            }

            str += line + '\r\n';
        }
        return str;
    }
    catch (ex) {
        console.log("exce:  ", ex);
        logHelper.logError(`${FILE_NAME}: ${methodName}: Error in job`, ex);
    }
}


async function sendEmailNotificationForSadaqahSponosrshipRenewal() {
    const methodName = 'sendEmailNotificationForSadaqahSponosrshipRenewal()';

    logHelper.logInfo(`${FILE_NAME}: ${methodName}: Method is starting`);

    let dynamicFields = [];

    const templateName =  'SADAQAH_A_DAY_RENEWAL';
    let completeTemplateName;
    let programSlug = constants.ProgramSlugs.SadaqahADay;
    try {

        //Get all donation id json with renewal links 
        // run for loop on length , and generate email for each 
        let renewalLinks = await sadaqahService.getApplicableDonationsForSadaqahReminder();
        if(renewalLinks){

            for(let i =0 ; i < renewalLinks.length ; i++ ){ 

                let donorData = await getDonorInformation(renewalLinks[i].donorId);
                let donorEmail = (donorData && donorData.email) ? donorData.email : ''
                var notificationData = await getNotificationStatusInfo(renewalLinks[i].donationId, true, programSlug);
                if (notificationData && notificationData.length == 0) {
                    //Means no notification has been sent now       
                    completeTemplateName = `${templateName}_${renewalLinks[i].language}`
    
                const locale =  renewalLinks[i].language == 'ARB'  ? constants.Languages.Arabic.locale : renewalLinks[i].language == 'FRN'  ? constants.Languages.French.locale : constants.Languages.English.locale;
                    let localeEndDate = moment(renewalLinks[i].endDate).locale(locale).format('dddd, MMMM Do YYYY');

                    let  dataForDynamic = {
                        donorName:donorData.donarName || "",
                        endDate:localeEndDate,
                        renewalLinks:renewalLinks[i].renewalLinks,
                        currency:renewalLinks[i].currency
                    };

                    //Replace dynamic values
                    dynamicFields = await replaceDynamicValuesForSadaqahADay(dataForDynamic);
                    var emailResponse =  await emailService.sendEmailByTemplate(completeTemplateName, dynamicFields, undefined, donorEmail);
    
                    // insert data in notification status collection
    
                    let insertNotificationStatus = await insertInNotificationStatus(1, completeTemplateName, emailResponse, renewalLinks[i].donationId, programSlug, true, donorEmail);
                }
                
            }
        }
        return true;
    }
    catch (err) {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: Error.. `, err);
    }
}


async function replaceDynamicValuesForSadaqahADay(data){
    const methodName = 'replaceDynamicValuesForSadaqahADay()';
    logHelper.logInfo(`${FILE_NAME}: ${methodName}: Method is starting`);

    let dynamicFields = [];
    try{
        const buttonTextSuffix = ' sadaqah per day'
     
        dynamicFields.push({
            keyName: tokens.common.DONOR_NAME,
            value: data.donorName
        });

        dynamicFields.push({
            keyName: tokens.sadaqahRenewalEmail.SUBSCRIPTION_END_DATE,
            value: data.endDate
        });

        dynamicFields.push({
            keyName: tokens.sadaqahRenewalEmail.BUTTON_TEXT_1,
            value: data.currency+'  1'+buttonTextSuffix 
        });

        dynamicFields.push({
            keyName: tokens.sadaqahRenewalEmail.BUTTON_TEXT_2,
            value: data.currency+'  2'+buttonTextSuffix
        });

        dynamicFields.push({
            keyName: tokens.sadaqahRenewalEmail.BUTTON_TEXT_3,
            value: data.currency+'  3'+buttonTextSuffix
        });


        dynamicFields.push({
            keyName: tokens.sadaqahRenewalEmail.BUTTON_LINK_1,
            value: data.renewalLinks.plan1
        });

        dynamicFields.push({
            keyName: tokens.sadaqahRenewalEmail.BUTTON_LINK_2,
            value: data.renewalLinks.plan2
        });

        dynamicFields.push({
            keyName: tokens.sadaqahRenewalEmail.BUTTON_LINK_3,
            value: data.renewalLinks.plan3
        });

}
catch (err) {
    logHelper.logInfo(`${FILE_NAME}: ${methodName}: Error.. `, err);
}


return dynamicFields;

}