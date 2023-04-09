var Occasion = require('../models/occasions.js');
var ObjectID = require('mongodb').ObjectID;

//generating hash using for password encryption
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);

//Create New Occasion
module.exports.addOccasion = function (req, res) {
    var occasion = new Occasion({
        occasionName: req.body.occasionName,
        programType: req.body.programType || null,
        program: req.body.program || null,
        programSubCategory: req.body.programSubCategory || null,
        fixedAmount: req.body.fixedAmount,
        language : req.body.userLang,
        isActive: true,
        created: Date.now(),
        updated: Date.now(),
        createdBy: 'NA',
        updatedBy: 'NA'
    })
    occasion.save(function (error) {
        if (error) {
            throw error;
        }
        else {
            res.json('Occasion created Sucessfully');
        }
    })
}
// All Occasions List
module.exports.OccasionList = function (req, res) {
    Occasion.find({language: req.params.lang})
        .populate("programType")
        .populate("program")
        .populate("programSubCategory").exec(function (err, Occasion) {
        res.status(200).send(Occasion);
    });
}
//Get All Active Occasions
module.exports.ActiveOccasionsList = function (req, res) {
    Occasion.find({ isActive: true }, function (err, Occasions) {
        if (err != undefined) {
            res.send(err);
        }
        res.status(200).send(Occasions);
    });
}
// Delete Occasion
module.exports.deleteOccasion = function (req, res) {
    try {
        Occasion.findById(req.params.Id, function (err, occasion) {
            occasion.isActive = !(occasion.isActive);
            occasion.save(function (err, occasion) {

                let response = {
                    message: "Occasion Deleted Sucessfully",
                    id: occasion._id
                };
                res.status(200).send(response);
            });
        });
    }
    catch (ex) {
        res.send(ex);
    }
}
module.exports.OccasionById = function (req, res) {
    Occasion.findOne({ _id: req.params.Id }).populate("programType").populate("program")
        .populate("programSubCategory").exec(function (err, Occasion) {
            res.status(200).send(Occasion);
        });
}

module.exports.OccasionBySubCategory = function (req, res) {
    Occasion.find({ programSubCategory : req.params.subCategoryId })
        .populate("programType")
        .populate("program")
        .populate("programSubCategory").exec(function (err, Occasion) {
        res.status(200).send(Occasion);
    });
}
//Update Occasion 
module.exports.updateOccasion = function (req, res) {
    Occasion.findOne({ _id: req.body.id }).exec((err, occasion) => {
        if (err) {
            res.status(500).send(err);
        } else {
            occasion.occasionName = req.body.occasionName || occasion.occasionName;
            occasion.programType = req.body.programType || occasion.programType;
            occasion.program = req.body.program || occasion.program;
            occasion.programSubCategory = req.body.programSubCategory || occasion.programSubCategory;
            occasion.fixedAmount = req.body.fixedAmount || occasion.fixedAmount;
            occasion.updatedBy = 'NA';
            occasion.save((err, Occasion) => {
                if (err) {
                    res.status(500).send(err)
                }
                res.json('Occasion updated Sucessfully');
            });
        }
    });
}

//Get Ocassion By Sub Category
module.exports.getBySubCat = function (req, res) {
    Occasion.find({ isActive: true})
    .populate("programType")
    .populate("program")
    .populate("programSubCategory")
    .find({ 'programSubCategory': req.params.Id})
    .exec(function (err, Occasion) {
        res.status(200).send(Occasion);
    });
}