var Logs = require('../models/logs');
var bunyan = require('bunyan');
var logger = null;
const fs = require('fs');
var configuration = require('../../config/configuration');
module.exports.initializeLogger = function () {
    try {
        const dir = configuration.logger.path;
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir);
        let loggerOptions = {
            name: 'NajafyiaApp',
            streams: [{
                type: 'rotating-file',
                path: `${dir}/najafyiaApp.log`,
                period: '1d',   // daily rotation
                count: 3        // keep 3 back copies
            }]
        };
        // if (configuration.app.env === "development")
        //     loggerOptions.streams.push({
        //         stream: process.stdout
        //     })
        logger = bunyan.createLogger(loggerOptions);
        return logger;
    }
    catch (e) {
        //console.log(e);
    }
}
module.exports.logInfo = function (strMsg, dataObject) {
    try {
        this.logInfoToFile(strMsg, getDataObject(dataObject), arguments);
    }
    catch (e) {
        //console.log(e);
    }

}

module.exports.logError = function (strMsg, dataObject) {
    try {
        this.logErrorToFile(strMsg, getDataObject(dataObject), arguments);
    }
    catch (e) {
        //console.log(e);
    }
}
module.exports.logInfoToFile = function (message) {
    try {
        //console.log(message);
        logger.info(message, arguments);
    }
    catch (e) {
        //console.log(e);
    }

}

module.exports.logErrorToFile = function (message) {
    try {
        //console.log(message);
        logger.error(message, arguments);
    }
    catch (e) {
        //  console.log(e);
    }
}
function getDataObject(dataObject) {
    if (typeof dataObject === "object") {
        let temp = JSON.stringify(dataObject);
        if (temp && temp.length > 0) {
            return dataObject;
        }
        else {
            //if type error
            return dataObject.toString();
        }
    }
    return dataObject;
}