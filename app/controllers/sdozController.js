var SDOZ = require('../models/sdoz.js');
var ObjectID = require('mongodb').ObjectID;

//generating hash using for password encryption
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
// all Countries list
module.exports.sdozList = function (req, res) {

    SDOZ.find({
    }, function (err, sdozList) {
        if (err != undefined) {
            res.send(err);
        }
        res.status(200).send(sdozList);
    });
}