var configuration = require('../../config/configuration');
var constants = require('../constants');
var schedule = require('node-schedule');
const databaseHelper = require('../utilities/databaseHelper');
var logHelper = require('../utilities/logHelper');
var sadaqahService = require('../../app/services/sadaqahService');
const dateHelper = require('../utilities/dateHelper');




function calculateSadaqah() {
    methodName = 'calculateSadaqah()';
    try {
      
      logHelper.logInfo(`${constants.LogLiterals.SADAQAH_CALCULATION_JOB}: ${methodName}: Calculating Sadaqah `);
      sadaqahService.calculateSadaqah(dateHelper.addDaysInDate(new Date(new Date().toUTCString()), configuration.sadaqah.sadaqahDayAdjusment, true,"YYYY-MM-DD"),true,true);
    }
    catch (ex) {
      logHelper.logError(`${constants.LogLiterals.SADAQAH_CALCULATION_JOB}: ${methodName}: Error`, ex);
    }
  }                        


module.exports.initializeJob = async function () {
    const startMessage = `${constants.LogLiterals.SADAQAH_CALCULATION_JOB}: initializeJob: Initializing schedule jobs  `;
    logHelper.logInfo(startMessage, configuration.sadaqah.adminEmai);

    /** calculate sadaqa daily after day passes**/
    schedule.scheduleJob(configuration.sadaqah.sadaqahCutOffTime.sadaqahCalculation, function () {
      methodName = 'SchedulerCalculateSadaqah()';
      try 
      {
        logHelper.logInfo(`${constants.LogLiterals.SADAQA_CALCULATION_JOB}: ${methodName}: Schedule for calculating daily sadaqa for eligible donors`);
  
        calculateSadaqah();

        logHelper.logInfo(`${constants.LogLiterals.SADAQA_CALCULATION_JOB}: ${methodName}: Schedule for calculating daily sadaqa ends`);
      } catch (ex) {
        logHelper.logError(`${constants.LogLiterals.SADAQA_CALCULATION_JOB}: ${methodName}: Error`, ex);
      }
    });
}