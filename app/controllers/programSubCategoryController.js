var ProgramSubCategory = require('../models/programSubCategory.js');
var ObjectID = require('mongodb').ObjectID;

//generating hash using for password encryption
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
const cacheHelper = require('../utilities/cacheHelper');
const PROGRAM_LIST = "ProgramList";

//Create Program sub Category
module.exports.addProgramSubCategory = function (req, res) {
    var programSubCategory = new ProgramSubCategory({
        programSubCategoryName: req.body.programSubcategoryName,
        programType: req.body.programType,
        description: req.body.description,
        slug: req.body.slug && req.body.slug.split(" ").join("-").toLowerCase(),
        imageLink: req.body.imageLink,
        isActive: true,
        isLanding: req.body.isLanding || false,
        isCountryFoZiyarat: req.body.isCountryFoZiyarat || false,
        isSDOZ: req.body.isSDOZ || false,
        isFirtahSubType: req.body.isFirtahSubType || false,
        isSahm: req.body.isSahm || false,
        sahms: req.body.sahms || null,
        countryOfZiyarat: req.body.countryOfZiyarat || null,
        sdoz: req.body.sdoz || null,
        fitrahSubTypes: req.body.fitrahSubTypes || null,
        isFixedAmount: req.body.isFixedAmount || null,
        fixedAmount: req.body.fixedAmount || null,
        created: Date.now(),
        updated: Date.now(),
        createdBy: 'NA',
        language: req.body.userLang,
        updatedBy: 'NA'
    })
    programSubCategory.save(function (error) {
        if (error) {
            res.json('Program Subcategory not created Sucessfully');
        }
        else {
            res.json('Program Subcategory created Sucessfully');
        }
    })
}

// Delete Program sub Category
module.exports.deleteProgramSubCategory = function (req, res) {
    try {
        ProgramSubCategory.findById(req.params.Id, function (err, programSubCategory) {
            programSubCategory.isActive = !programSubCategory.isActive || false;
            programSubCategory.save(function (err, result) {
                if (!err) {                    
                    const cacheKey = `${PROGRAM_LIST}_${programSubCategory.language}_${programSubCategory.programType}`;
                    cacheHelper.deleteCache(cacheKey);
                }
                let response = {
                    message: "Program SubCategory Deleted Sucessfully",
                    id: programSubCategory._id
                };
                res.status(200).send(response);
            })           
        });
    }
    catch (ex) {
        res.send(ex);
    }

}
// all Program sub Category list
module.exports.ProgramSubCategoryList = function (req, res) {
    var programTypeID = req.params.programTypeID;
    if (programTypeID == undefined) {
        ProgramSubCategory.find({
            isActive: true ,
            language: req.params.userLang
        }, function (err, programSubCategories) {
            if (err != undefined) {
                res.send(err);
            }
            res.status(200).send(programSubCategories);
        });
    }
    else {
        ProgramSubCategory.find({
            programType: programTypeID,
            isActive: true,
            language: req.params.userLang
        }, function (err, programSubCategories) {
            if (err != undefined) {
                res.send(err);
            }
            res.status(200).send(programSubCategories);
        });
    }

}
// all Program sub Category list
module.exports.ProgramSubCategoryWithInActiveList = function (req, res) {
    var programTypeID = req.params.programTypeID;
    if (!programTypeID) {
        ProgramSubCategory.find({language : req.params.userLang}, function (err, programSubCategories) {
            if (err) {
                res.send(err);
            }
            res.status(200).send(programSubCategories);
        });
    }
    else {
        ProgramSubCategory.find({programType: programTypeID,language : req.params.userLang}, function (err, programSubCategories) {
            if (err) {
                res.send(err);
            }
            res.status(200).send(programSubCategories);

        });
    }
}
// update Program sub Category
module.exports.updateProgramSubCategory = function (req, res) {
    ProgramSubCategory.findById(req.body.id, (err, programSubCategory) => {
        if (err) {
            res.status(500).send(err);
        }
        else {
            programSubCategory.programSubCategoryName = req.body.programSubcategoryName || programSubCategory.programSubCategoryName;
            programSubCategory.programPriority = req.body.programPriority || programSubCategory.programPriority;
            programSubCategory.programType = req.body.programType || programSubCategory.programType;
            programSubCategory.slug = (req.body.slug && req.body.slug.split(" ").join("-").toLowerCase()) || programSubCategory.slug;
            programSubCategory.description = req.body.description || programSubCategory.description;
            programSubCategory.isLanding = req.body.isLanding || (programSubCategory.isLanding == undefined);
            programSubCategory.imageLink = req.body.imageLink || programSubCategory.imageLink;
            programSubCategory.isCountryFoZiyarat = req.body.isCountryFoZiyarat || (programSubCategory.isCountryFoZiyarat == undefined);
            programSubCategory.isSDOZ = req.body.isSDOZ || (programSubCategory.isSDOZ == undefined);
            programSubCategory.sdoz = req.body.sdoz || programSubCategory.sdoz;
            programSubCategory.fitrahSubTypes = req.body.fitrahSubTypes || programSubCategory.fitrahSubTypes;
            programSubCategory.isFirtahSubType = (req.body.isFirtahSubType == false || req.body.isFirtahSubType)? req.body.isFirtahSubType : programSubCategory.isFirtahSubType;
            programSubCategory.countryOfZiyarat = req.body.countryOfZiyarat || programSubCategory.countryOfZiyarat;
            programSubCategory.isSahm = req.body.isSahm || (programSubCategory.isSahm == undefined)
            programSubCategory.sahms = req.body.sahms || programSubCategory.sahms;
            programSubCategory.isFixedAmount = req.body.isFixedAmount || (programSubCategory.isFixedAmount == undefined)
            programSubCategory.fixedAmount = req.body.fixedAmount || programSubCategory.fixedAmount;
            programSubCategory.updated = Date.now();
            programSubCategory.updatedBy = 'NA';
            programSubCategory.amountBasedOnCountry = req.body.amountBasedOnCountry ;
            programSubCategory.countryWiseAmount = req.body.countryWiseAmount ;
            programSubCategory.save((err, programSubCategory) => {
                if (err) {
                    res.json('Program Subcategory not updated Sucessfully');
                }else {                    
                    const cacheKey = `${PROGRAM_LIST}_${programSubCategory.language}_${programSubCategory.programType}`;
                    cacheHelper.deleteCache(cacheKey);
                    res.json('Program Subcategory updated Sucessfully');
                }

            });
        }
    });
}
//select Program sub Category by id
module.exports.ProgramSubCategoryById = function (req, res) {
    let query = {};
    query = req.params.Id.indexOf('-') < 0?{_id: req.params.Id}:{slug: req.params.Id, language: req.query.lang || 'ENG'};
    ProgramSubCategory.findOne(query)
        .populate("programType")
        .populate("countryOfZiyarat")
        .populate("sdoz").populate("sahms")
        .exec(function (err, ProgramSubCategory) {
            res.status(200).send(ProgramSubCategory);
        });
}

module.exports.ProgramSubCategory = function (req, res) {

    ProgramSubCategory.find({language : req.params.userLang})
        .populate("programType")
        .populate("countryOfZiyarat")
        .populate("sdoz").populate("sahms")
        .exec(function (err, ProgramSubCategory) {
            res.status(200).send(ProgramSubCategory);
        });
}