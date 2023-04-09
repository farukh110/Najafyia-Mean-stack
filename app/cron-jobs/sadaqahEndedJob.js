var configuration = require('../../config/configuration');
var constants = require('../constants');
var schedule = require('node-schedule');
var logHelper = require('../utilities/logHelper');
var sadaqahService = require('../../app/services/sadaqahService');
const dateHelper = require('../utilities/dateHelper');




function performSadaqahSubscriptionEndedWork() {
    methodName = 'performSadaqahSubscriptionEndedWork()';
    try {
      
      sadaqahService.performSadaqahSubscriptionEndedWork(dateHelper.createUTCDate(Date.now()));
    }
    catch (ex) {
      logHelper.logError(`${constants.LogLiterals.SADAQAH_SUBSCRIPTION_ENDED_JOB}: ${methodName}: Error`, ex);
    }
  }                        


module.exports.initializeJob = async function () {
    /** Perform subscription ended for sadaqah**/
    schedule.scheduleJob(configuration.sadaqah.sadaqahCutOffTime.sadaqahSubscriptionEnd, function () {
      methodName = 'SchedulerPerformSadaqahSubscriptionEndedWork()';
      try 
      {
        logHelper.logInfo(`${constants.LogLiterals.SADAQAH_SUBSCRIPTION_ENDED_JOB}: ${methodName}: Starting schedule to end Sadaqah A day subscription`);
  
        performSadaqahSubscriptionEndedWork();

        logHelper.logInfo(`${constants.LogLiterals.SADAQAH_SUBSCRIPTION_ENDED_JOB}: ${methodName}: Ending schedule to end Sadaqah A day subscription`);
      } catch (ex) {
        logHelper.logError(`${constants.LogLiterals.SADAQAH_SUBSCRIPTION_ENDED_JOB}: ${methodName}: Error`, ex);
      }
    });
}