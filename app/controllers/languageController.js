var Languages = require('../models/languages.js');
var ObjectID = require('mongodb').ObjectID;

//generating hash using for password encryption
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);

// all Languages list
module.exports.LanguagesList = function (req, res) {
    Languages.find({
    }, function (err, LanguagesList) {
        if (err != undefined) {
            res.send(err);
        }
        res.status(200).send(LanguagesList);
    });
}