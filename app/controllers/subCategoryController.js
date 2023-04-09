var ProgramSubCategory = require('../models/programSubCategory.js');
var ObjectID = require('mongodb').ObjectID;

//generating hash using for password encryption
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);

//Create User
module.exports.addprogramSubCategory = function (req, res) {
    var programSubCategory = new ProgramSubCategory({
        programSubCategoryName: req.body.programSubCategoryName,
        created: Date.now(),
        updated: Date.now(),
        createdBy: 'NA',
        updatedBy: 'NA',
        language: req.body.userLang

    });
    programSubCategory.save(function (error, programSubCategory) {
        if (error) {
            throw error;
        }
        else {
            res.send(programSubCategory);
        }
    })

}
// update programSubCategory
module.exports.updateprogramSubCategory = function (req, res) {
    programSubCategory.findById(req.body.id, (err, programSubCategory) => {
        if (err) {
            res.status(500).send(err);
        }
        else {
            programSubCategory.programSubCategoryName = req.body.title || programSubCategory.programSubCategoryName;
            programSubCategory.programSubCategoryContent = req.body.content || programSubCategory.programSubCategoryContent;
            programSubCategory.updated = Date.now();
            programSubCategory.save((err, user) => {
                if (err) {
                    res.status(500).send(err)
                }
                res.json('programSubCategory updated Sucessfully');
            });
        }

    });
}
// Delete programSubCategory
module.exports.deleteprogramSubCategory = function (req, res) {
    try {
        programSubCategory.findByIdAndRemove(req.params.Id, function (err, programSubCategory) {
            let response = {
                message: "programSubCategory Deleted Sucessfully",
                id: programSubCategory._id
            };
            res.status(200).send(response);
        });
    }
    catch (ex) {
        res.send(ex);
    }
}
//select all programSubCategorys
module.exports.programSubCategoryList = function (req, res) {

    programSubCategory.find({}, function (err, programSubCategorys) {
        res.status(200).send(programSubCategorys);
    });
}
//select programSubCategory by id
module.exports.programSubCategoryById = function (req, res) {

    programSubCategory.findById(req.params.Id, function (err, programSubCategorys) {
        res.status(200).send(programSubCategorys);
    });

};
