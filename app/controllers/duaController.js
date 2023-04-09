var Dua = require('../models/dua.js');
var ObjectID = require('mongodb').ObjectID;

//generating hash using for password encryption
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);

//Create New Dua
module.exports.addDua = function (req, res) {
    var dua = new Dua({
        duaName: req.body.duaName,
        occasion: req.body.occasion || null,
        fixedAmount: req.body.fixedAmount,
        language: req.body.userLang,
        isActive: true,
        created: Date.now(),
        updated: Date.now(),
        createdBy: 'NA',
        updatedBy: 'NA'
    })
    dua.save(function (error) {
        if (error) {
            throw error;
        }
        else {
            res.json('Dua created Sucessfully');
        }
    })
}
// All Dua List
module.exports.DuaList = function (req, res) {
    Dua.find({ language: req.params.lang }).populate({
        path: 'occasion', populate: {
            path: 'programSubCategory',
            model: 'programSubCategory'
        }
    }).exec(function (err, dua) {
        if (err != undefined) {
            res.send(err);
        }
        res.status(200).send(dua);
    });
}

// Delete Dua
module.exports.deleteDua = function (req, res) {
    try {
        Dua.findById(req.params.Id, function (err, dua) {
            dua.isActive = !(dua.isActive);
            dua.save(function (err, occasion) {

                let response = {
                    message: "Dua Deleted Sucessfully",
                    id: dua._id
                };
                res.status(200).send(response);
            });
        });
    }
    catch (ex) {
        res.send(ex);
    }
}
//Get Dua By Id
module.exports.DuaById = function (req, res) {
    Dua.findOne({ _id: req.params.Id })
        .populate("occasion").exec(function (err, Occasion) {
            res.status(200).send(Occasion);
        });
}
//Update Dua 
module.exports.updateDua = function (req, res) {
    Dua.findOne({ _id: req.body.id }).exec((err, dua) => {
        if (err) {
            res.status(500).send(err);
        } else {
            dua.occasion = req.body.occasion || dua.occasion;
            dua.duaName = req.body.duaName || dua.duaName;
            dua.fixedAmount = req.body.fixedAmount || dua.fixedAmount;
            dua.updatedBy = 'NA';
            dua.save((err, Dua) => {
                if (err) {
                    res.status(500).send(err)
                }
                res.json('Dua updated Sucessfully');
            });
        }
    });
}

//Get Dua By Ocassion
module.exports.getByOcassion = function (req, res) {
    Dua.find({ isActive: true })
        .populate("occasion")
        .find({ 'occasion': req.params.Id })
        .exec(function (err, Occasion) {
            res.status(200).send(Occasion);
        });
}