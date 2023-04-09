var logHelper = require('../utilities/logHelper');
var constants = require('../constants');
const databaseHelper = require("../utilities/databaseHelper.js");
const dateHelper = require('../utilities/dateHelper');
const configuration = require('../../config/configuration');
const eventLoggerService = require("../services/eventLogsService.js");


//Create New Orphan
module.exports.addEventLog = async function (req, res) {
    const methodName = 'addEventLog';
    try {
        let dataObj = req.body;
        let cart = req.session.cart ? req.session.cart : {}
        dataObj.eventData = cart;
        dataObj.agent  =req.headers['user-agent']
        dataObj.sessionId = req.sessionID;
        if (dataObj) {
            const result = await eventLoggerService.insertEventLog(dataObj);
            if (result) {
                res.status(200).send();
            }
        }
        res.status(500).send();
    }
    catch (error) {
        logHelper.logError(` eventLogsContrller: ${methodName}: Error on catch`, error);
        res.status(500).send(error);
    }
}