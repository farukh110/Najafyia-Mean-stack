var sahms = require('../models/sahms.js');
var ObjectID = require('mongodb').ObjectID;

//generating hash using for password encryption
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
// all Countries list
module.exports.sahmsList = function (req, res) {

    sahms.find({language: req.query.language || "ENG"}, function (err, sahmsList) {
        if (err != undefined) {
            res.send(err);
        }
        res.status(200).send(sahmsList);
    });
}