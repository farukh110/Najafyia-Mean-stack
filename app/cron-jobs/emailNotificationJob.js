var configuration = require('../../config/configuration');
var constants = require('../constants');
var schedule = require('node-schedule');
var logHelper = require('../utilities/logHelper');
var emailNotificationService = require('../../app/services/emailNotificationService');
const FILE_NAME = constants.LogLiterals.EMAIL_NOTIFICATION_SERVICE

function orphanSponsorshipNotification() {
 let methodName = 'orphanSponsorshipNotification(job)';
  try {

    logHelper.logInfo(`${FILE_NAME}: ${methodName}: Job first line`);
    emailNotificationService.sendOrphanSponsorshipNotification();

  }
  catch (ex) {
    logHelper.logError(`${FILE_NAME}: ${methodName}: Error in job`, ex);
  }
}

module.exports.initializeJob = async function () {

  let methodName = 'EmailNotificationInitializeJob';

  logHelper.logInfo(`${FILE_NAME}: ${methodName}: initializeJob: Initializing schedule jobs`);

  /** 1) execute this job every day (Orphan Sponsorship Notification)**/
  schedule.scheduleJob(configuration.SendOrphanSponsorshipNotification.jobExecutionTime, function () {
    try {

      orphanSponsorshipNotification();

    } catch (ex) {
      logHelper.logError(`${FILE_NAME}: ${methodName}: Error in job`, ex);
    }
  });

  /** 2) execute this job every month (Outstanding report send to Finance**/
  schedule.scheduleJob(configuration.OutstandingNotification.jobExecutionTime, function () {
    try {
      OutstandingReportSender();

    } catch (ex) {
      logHelper.logError(`${FILE_NAME}: ${methodName}: Error in job`, ex);
    }
  });
  /** 3) execute this job every day (Sadaqah Sponsorship Renewal Notification)**/
  schedule.scheduleJob(configuration.SendSadaqahRenewalSponsorshipNotification.jobExecutionTime, function () {
    try {
      sadaqahRenewalSponsorshipNotification();
    } catch (ex) {
      logHelper.logError(`${FILE_NAME}: ${methodName}: Error in job`, ex);
    }
  });

}

async function OutstandingReportSender() {
 let  methodName = 'OutstandingReportSender()';
  try {

    logHelper.logInfo(`${FILE_NAME}: ${methodName}: Job first line`);
    await emailNotificationService.sendOutstandingReport();
  }
  catch (ex) {
    logHelper.logError(`${FILE_NAME}: ${methodName}: Error in job`, ex);
  }
}

async function sadaqahRenewalSponsorshipNotification() {
 let  methodName = 'sadaqahRenewalSponsorshipNotification(job)';
  try {
    logHelper.logInfo(`${FILE_NAME}: ${methodName}: Job first line`);
    await emailNotificationService.sendEmailNotificationForSadaqahSponosrshipRenewal();
  }
  catch (ex) {
    logHelper.logError(`${FILE_NAME}: ${methodName}: Error in job`, ex);
  }
}

