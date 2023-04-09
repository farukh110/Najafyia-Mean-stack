var configuration = require('../../config/configuration');
var ziyaratService = require('../../app/services/ziyaratService');
var Ziyarat = require('../models/ziyarat.js');
const databaseHelper = require('../utilities/databaseHelper');
var schedule = require('node-schedule');
var genericHelp = require("../utilities/genericHelper");
let methodName = '';
var logHelper = require('../utilities/logHelper');
var constants = require('../constants');
var configSetting = require("../models/configSetting.js");

function StartEmailNotificationProcess() {
  methodName = 'StartEmailNotificationProcess()';
  try {
    logHelper.logInfo(`${constants.LogLiterals.ZIYARAT_NOTIFICATION_JOB}: ${methodName}: Starting Email/ SMS sending notifiaction process from schedule `);
    ziyaratService.startEmailandSmsProcess();
  }
  catch (ex) {
    logHelper.logError(`${constants.LogLiterals.ZIYARAT_NOTIFICATION_JOB}: ${methodName}: Error`, ex);
  }
}

function sendZaireenListToConsultant() {
  methodName = 'sendZaireenListToConsultant()';
  try {
    logHelper.logInfo(`${constants.LogLiterals.ZIYARAT_NOTIFICATION_JOB}: ${methodName}: Emailing List to consultants `);
    ziyaratService.sendZaireenList();
  }
  catch (ex) {
    logHelper.logError(`${constants.LogLiterals.ZIYARAT_NOTIFICATION_JOB}: ${methodName}: Error`, ex);
  }
}


async function addSendNotificationRequestToQueue() {
  methodName = 'addSendNotificationRequestToQueue()';

  try {
    logHelper.logInfo(`${constants.LogLiterals.ZIYARAT_NOTIFICATION_JOB}: ${methodName}: Creating an entry for job send email/sms job to  be performed `);

    var resDate = await ziyaratService.getThurdayZiyaratDate();
     
    let uid = configuration.ziyarat.botUser.queryString;
    let filter = {
      isSelectedForZiyarat: true,
      isVisited: false,
      isActive: true
    };
    var zaireen = await databaseHelper.getManyItems(Ziyarat, filter);
    let count = 0;
    if (zaireen) { count = zaireen.length; }
    var obj = {
      consultantId: uid,
      totalZaireen: count,
      ziaratDate: resDate.ziyaratDate
    };
    await ziyaratService.InitiateZiyaratEmailProcess(obj);
  }
  catch (ex) {
    logHelper.logError(`${constants.LogLiterals.ZIYARAT_NOTIFICATION_JOB}: ${methodName}: Error`, ex);
  }

}

module.exports.initializeJob = async function () {
  const startMessage = `${constants.LogLiterals.ZIYARAT_NOTIFICATION_JOB}: initializeJob: Initializing schedule jobs  `;
  logHelper.logInfo(startMessage, configuration.ziyarat.ziyaratCutOffTime);

  /** send Zaireen list to consultant on EVERY Thursday 3PM for PRODUCTION**/
  schedule.scheduleJob(configuration.ziyarat.ziyaratCutOffTime.zaireenSelection, function () {
    methodName = 'SchedulerSendZaireenListToConsultant()';
    try {
      logHelper.logInfo(`${constants.LogLiterals.ZIYARAT_NOTIFICATION_JOB}: ${methodName}: Schedule for sending zaireen list to consultant  `);      sendZaireenListToConsultant();
    } catch (ex) {
      logHelper.logError(`${constants.LogLiterals.ZIYARAT_NOTIFICATION_JOB}: ${methodName}: Error`, ex);
    }
  });

  //'0 0 10 * * 5'
  ///** enter zaireen to be notfied in que  */
  schedule.scheduleJob(configuration.ziyarat.ziyaratCutOffTime.enableAutoZaireenNotification, async function () {
    methodName = 'ScheduleraddSendNotificationRequestToQueue()';
    try {
      logHelper.logInfo(`${constants.LogLiterals.ZIYARAT_NOTIFICATION_JOB}: ${methodName}: scheduler running for Entering record in que for notifiaction process  `);

      let query = {
        key: configuration.ziyarat.ziyaratSettingKey
      };
      const config = await databaseHelper.getSingleItem(configSetting, query);
      let enable =config.value.ziyaratProcessAutomate;
      if(enable){
        addSendNotificationRequestToQueue();
      }
    } catch (ex) {
      logHelper.logError(`${constants.LogLiterals.ZIYARAT_NOTIFICATION_JOB}: ${methodName}: Error`, ex);
    }
  });

  /** s start sending notifications to zaireen **/
  schedule.scheduleJob(configuration.ziyarat.ziyaratCutOffTime.sendZaireenNotification, function () {
    methodName = 'SchedulerStartEmailNotification()';
    try {
      logHelper.logInfo(`${constants.LogLiterals.ZIYARAT_NOTIFICATION_JOB}: ${methodName}: scheduler running for starting emails notification process  `);
      StartEmailNotificationProcess();
    } catch (ex) {
      logHelper.logError(`${constants.LogLiterals.ZIYARAT_NOTIFICATION_JOB}: ${methodName}: Error`, ex);
    }
  });



}