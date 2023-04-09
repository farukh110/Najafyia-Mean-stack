var configuration = require('../../config/configuration');
var constants = require('../constants');
var schedule = require('node-schedule');
var logHelper = require('../utilities/logHelper');
var aytamunaReportService = require('../../app/services/aytamunaReportService');


function updateStatusForAytamunaReport() {
    methodName = 'updateStatusForAytamunaReport()';
    try {
      
      aytamunaReportService.updateStatusForAytamunaReport(new Date(new Date().toUTCString()));
    }
    catch (ex) {
      logHelper.logError(`${constants.LogLiterals.AYTAMUNA_REPORT_JOB}: ${methodName}: Error`, ex);
    }
  }                        


module.exports.initializeJob = async function () {
    const startMessage = `${constants.LogLiterals.AYTAMUNA_REPORT_JOB}: initializeJob: Initializing schedule jobs  `;
    logHelper.logInfo(startMessage);

    /** execute this job every day**/
    schedule.scheduleJob(configuration.aytamunaReport.jobExecutionTime, function () {
      methodName = 'SchedulerUpdateStatusForAytamunaReport()';
      try 
      {
        logHelper.logInfo(`${constants.LogLiterals.AYTAMUNA_REPORT_JOB}: ${methodName}: Schedule for updating statuses at DonationRecurring for aytamuna report starts`);
  
        updateStatusForAytamunaReport();

        logHelper.logInfo(`${constants.LogLiterals.AYTAMUNA_REPORT_JOB}: ${methodName}: Schedule for updating statuses at DonationRecurring for aytamuna report ends`);
      } catch (ex) {
        logHelper.logError(`${constants.LogLiterals.AYTAMUNA_REPORT_JOB}: ${methodName}: Error`, ex);
      }
    });
}