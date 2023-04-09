var fitrahsubtype = require('../models/fitrahsubtype.js');
var ObjectID = require('mongodb').ObjectID;

//generating hash using for password encryption
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);

// all Countries list
module.exports.fitrahsubtypeList = function (req, res) {
    fitrahsubtype.find({
        language: req.query.language || "ENG",
    }, function (err, fitrahsubtypeList) {
        if (err != undefined) {
            res.send(err);
        }
        res.status(200).send(fitrahsubtypeList);
    });
}