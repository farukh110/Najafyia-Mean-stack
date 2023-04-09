var nodemailer = require('nodemailer');
var configuration = require('../../config/configuration');
var logHelper = require('../../app/utilities/logHelper');
var constants = require('../../app/constants');
let methodName = '';


module.exports = {
    // Najafyia SMTP
    trans: function () {
        var trans = nodemailer.createTransport({
            host: configuration.email.host,
            secure: configuration.email.secure,
            port: configuration.email.port,
            auth: {
                user: configuration.email.userName,
                pass: configuration.email.passWord
            },
            tls: {
                rejectUnauthorized: configuration.email.rejectUnauthorized
            }
        });
        return trans;
    },
    sendEmail: async function (options) {
        return new Promise((resolve, reject) => {
            if (configuration.developmentSetting.enableEmailsService) {
                try {
                    methodName = constants.LogLiterals.SEND_Email_METHOD_withPromise;
                    this.trans().sendMail(options, function (err, suc) {
                        if (err) {
                            logHelper.logError(`${constants.LogLiterals.Email_Transporter}: ${methodName}: Request error`, err);
                            reject(err);
                        }
                        if (suc) {
                            logHelper.logInfo(`${constants.LogLiterals.Email_Transporter}: ${methodName}: Email sent to  ${options.to} having success Message`, suc);
                            resolve(suc);
                        }
                    });

                }
                catch (ex) {
                    reject(ex);
                    logHelper.logError(`${constants.LogLiterals.Email_Transporter}: ${methodName}:  Error`, ex);

                }
            }
            else {
                console.log("Email Options", options);
                resolve(true);
            }

        });
    }
}