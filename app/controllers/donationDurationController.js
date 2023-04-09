var DonationDuration = require('../models/donationDuration.js');
var ObjectID = require('mongodb').ObjectID;

//generating hash using for password encryption
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);

const cacheHelper = require('../utilities/cacheHelper');
const constants = require('../constants');
const logHelper = require('../utilities/logHelper');
const DONATION_DURATION_LIST = "DonationDurationList";

// All Donation Duration list
module.exports.DonationDurationList = function (req, res) {
    let methodName = '';
    try {
        methodName = constants.LogLiterals.DONATION_DURATION_LIST_METHOD;

        const cacheKey = `${DONATION_DURATION_LIST}${req.params.userLang || 'ENG'}`;
        let cachedValue = cacheHelper.getCache(cacheKey);
        if (cachedValue == undefined) {
            DonationDuration.find({ language: req.params.userLang }, function (err, donationDurations) {
                if (err != undefined) {
                    res.send(err);
                }
                else {
                    cacheHelper.setCache(cacheKey, donationDurations);
                    res.status(200).send(donationDurations);
                }
            });
        }
        else {
            res.status(200).send(cachedValue);
        }
    }
    catch (exc) {
        logHelper.logError(`${constants.LogLiterals.DONATION_DURATION_CONTROLLER}: ${methodName}: error`, exc);
    }
}