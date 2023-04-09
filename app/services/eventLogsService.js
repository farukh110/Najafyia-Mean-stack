var logHelper = require('../utilities/logHelper');
var constants = require('../constants');
const databaseHelper = require("../utilities/databaseHelper.js");
const dateHelper = require('../utilities/dateHelper');
const configuration = require('../../config/configuration');

let methodName = '';
module.exports = {
    insertEventLog
}

async function insertEventLog(dataObj) {
    methodName = 'insertEventLog()';
    try {
        const insertedObj = await databaseHelper.insertItem(constants.Database.Collections.EVENT_LOG.dataKey, dataObj);
        if (insertedObj) {
            return true;
        }
        return false;
    }
    catch (ex) {
        logHelper.logError(` eventLogsService : ${methodName}: Error`, ex);
        return false;
    }

};
