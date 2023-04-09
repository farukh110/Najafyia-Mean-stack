var configuration = require('../../config/configuration');
var logHelper = require('../utilities/logHelper');
var Request = require("request");
var constants = require('../constants');
let methodName = '';


module.exports = {
    sendSMS: (to, msg, callbackFunc) => {
        try {
            logHelper.logInfo("Start sending sms");
            methodName = constants.LogLiterals.SEND_SMS_METHOD;

            let recipient = String(to);
            recipient = recipient.replace(/^0+/, '+') ;
            if (configuration.developmentSetting.enableSmsService) {
                let smsUrl = `${configuration.sms.apiUrl}?action=${configuration.sms.action}&user=${configuration.sms.userName}&password=${configuration.sms.password}&from=${configuration.sms.from}&to=${recipient}&text=${encodeURIComponent(msg)}`;
                smsUrl = encodeURI(smsUrl);
                Request.get(smsUrl, (error, response, body) => {
                    try {
                        if (error) {
                            logHelper.logError(`${constants.LogLiterals.SMS_HELPER}: ${methodName}: Request error`, error);
                        }
                        else {
                            logHelper.logInfo(`${constants.LogLiterals.SMS_HELPER}: ${methodName}: SMS sent to ${to}`, msg);
                        }
                        if (callbackFunc)
                            callbackFunc(error, response, body);
                    }
                    catch (err) {
                        logHelper.logErrorToFile(`${constants.LogLiterals.SMS_HELPER}: ${methodName}: Error`, err);
                    }
                });
            }
            else {
                console.log("To:", to);
                console.log("Message:", msg);
                if (callbackFunc)
                    callbackFunc(null, {}, {});
            }
        }
        catch (ex) {
            logHelper.logError(`${constants.LogLiterals.SMS_HELPER}: ${methodName}: Error`, ex);
        }
    },
    sendSmsAsync: async function (to, msg) {
        return new Promise((resolve, reject) => {
            this.sendSMS(to, msg, function (err, suc) {
                if (err) {

                    reject(err);
                }
                if (suc) {

                    resolve(suc);
                }
            });
        });
    }
}