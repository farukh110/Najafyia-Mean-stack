const logHelper = require('../utilities/logHelper');
const constants = require('../constants');
const FILE_NAME = constants.LogLiterals.EMAIL_NOTIFICATION_CONTROLLER;

const emailNotificationService = require('../services/emailNotificationService');
module.exports.sendOrphanSponsorshipNotification = async function (req, res) {
    try {

        const methodName = "sendOrphanSponsorshipNotification()"
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: Method is starting from controller `);

        await emailNotificationService.sendOrphanSponsorshipNotification();
        res.status(200).send("OK")
    }
    catch (err) {
       
        res.status(400).send(err.message);
    }
}

module.exports.sendSadaqahRenewalSponsorshipNotification = async function (req, res) {
    try {
        const methodName = "sendSadaqahRenewalSponsorshipNotification()"
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: Method is starting from controller `);

        await emailNotificationService.sendEmailNotificationForSadaqahSponosrshipRenewal();
        res.status(200).send("OK")
    }
    catch (err) {
        res.status(400).send(err.message);
    }
}