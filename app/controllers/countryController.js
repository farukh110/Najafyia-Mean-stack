var Country = require('../models/country.js');
var ObjectID = require('mongodb').ObjectID;
var Cities = require('../models/cities.js');
//generating hash using for password encryption
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);

const cacheHelper = require('../utilities/cacheHelper');
const constants = require('../constants');
const logHelper = require('../utilities/logHelper');
const COUNTRY_LIST = "CountryList";

// all Countries list
module.exports.CountryList = function (req, res) {
    let methodName = '';
    try {
        methodName = constants.LogLiterals.COUNTRY_LIST_METHOD;

        let cachedValue = cacheHelper.getCache(COUNTRY_LIST);

        if (cachedValue == undefined) {
            Country.find({
            }, function (err, CountryList) {
                if (err != undefined) {
                    res.send(err);
                } else {
                    cacheHelper.setCache(COUNTRY_LIST, CountryList);
                    res.status(200).send(CountryList);
                }
            });
        }
        else {
            res.status(200).send(cachedValue);
        }
    }
    catch (ex) {
        logHelper.logError(`${constants.LogLiterals.COUNTRY_CONTROLLER}: ${methodName}: error`, ex);
    }
}

module.exports.getCitiesByCountry = function (req, res) {
    if (req.query && req.query) {
        Cities.find({
            country: req.query.code
        }, {}, { sort: { name: 1 } }, function (err, cities) {
            if (err != undefined) {
                res.send(err);
            } else {
                res.status(200).send(cities);
            }
        });
    } else res.status(400).send('Bad Request');
}
