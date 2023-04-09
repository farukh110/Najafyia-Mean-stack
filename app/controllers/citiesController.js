var Cities = require('../models/cities.js');
var ObjectID = require('mongodb').ObjectID;

//generating hash using for password encryption
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);

// all Countries list
module.exports.CountryList = function (req, res) {
    Country.find({
    }, function (err, CountryList) {
        if (err != undefined) {
            res.send(err);
        }
        res.status(200).send(CountryList);
    });
}