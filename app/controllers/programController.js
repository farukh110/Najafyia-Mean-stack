var Program = require('../models/program.js');
var ProgramSubCategory = require('../models/programSubCategory.js');
var ProgramType = require('../models/programType.js');
var ObjectID = require('mongodb').ObjectID;

//generating hash using for password encryption
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);

const cacheHelper = require('../utilities/cacheHelper');
const constants = require('../constants');
const logHelper = require('../utilities/logHelper');
const PROGRAM_LIST = "ProgramList";

//Create New Program
module.exports.addProgram = function (req, res) {
    try {
        var program = new Program({
            programName: req.body.programName,
            programPriority: req.body.programPriority,
            programType: req.body.programType,
            programDescription: req.body.programDescription,
            slug: req.body.slug,
            programSubCategory: req.body.subCategories || null,
            imageLink: req.body.imageLink,
            donationProcess: req.body.donationProcess,
            isSyed: req.body.isSyed || false,
            countryOfZiyarat: req.body.countryOfZiyarat || null,
            isActive: true,
            created: Date.now(),
            updated: Date.now(),
            createdBy: 'NA',
            updatedBy: 'NA',
            language: req.body.userLang
        })
        program.save(function (error) {
            if (error) {
                res.status(400).json(error);
                // throw error;
            } else {
                const cacheKey = `${PROGRAM_LIST}_${program.language}_${program.programType}`;                
                cacheHelper.deleteCache(cacheKey);
                res.json('Program created Sucessfully');
            }
        })

    } catch (error) {
        res.status(400).json(error);
    }
}
// Delete Program
module.exports.deleteProgram = function (req, res) {
    try {
        Program.findById(req.params.Id, function (err, program) {
            program.isActive = !(program.isActive);
            program.save(function (err, program) {
                if (!err) {
                    const cacheKey = `${PROGRAM_LIST}_${program.language}_${program.programType}`;
                    cacheHelper.deleteCache(cacheKey);
                                       
                    let response = {
                        message: "Program Deleted Sucessfully",
                        id: program._id
                    };
                    res.status(200).send(response);
                }
            });
        });
    } catch (ex) {
        res.send(ex);
    }
}
// all related Programs list
module.exports.RelatedProgramList = function (req, res) {
    Program.find({
        programType: req.body.programTypeId,
        // _id: {$ne: req.body.id},
        language: req.body.userLang
    }, function (err, Programs) {
        if (err != undefined) {
            res.send(err);
        }
        res.send(Programs);
    });
}
// all Programs list
module.exports.ProgramList = async function (req, res) {
    let id = req.params.programTypeId;
    let query = {
        language: req.params.userLang
    };
    if (id != undefined) {
        const cacheKey = `${PROGRAM_LIST}_${req.params.userLang}_${id}`;
        let cachedValue = cacheHelper.getCache(cacheKey);

        if (cachedValue == undefined) {
            if (id.indexOf('-') && id.length !== 24) {
                query.slug = id;
            } else {
                query._id = id;
            }
            const programType = await ProgramType.findOne(query);
            if (programType) {
                id = programType._id
            }
            Program.find({
                programType: id,
                language: req.params.userLang
            }, { programPriority: 0, updated: 0, createdBy: 0, __v: 0, isSyed: 0, countryOfZiyarat: 0 }).populate("programType")
                .populate({
                    path: 'programSubCategory',
                    match: { isActive: true },
                    populate: {
                        path: 'sdoz',
                        model: 'sdoz'
                    }
                })
                .populate({
                    path: 'programSubCategory',
                    match: { isActive: true },
                    populate: {
                        path: 'countryOfZiyarat',
                        model: 'country'
                    }
                })
                .populate({
                    path: 'programSubCategory',
                    match: { isActive: true },
                    populate: {
                        path: 'sahms',
                        model: 'sahms'
                    }
                })
                .populate({
                    path: 'donationProcess',
                    populate: {
                        path: 'donationDuration',
                        model: 'donationduration'
                    }
                }).sort({
                    programPriority: 1
                }).exec(function (err, Programs) {
                    if (err != undefined) {
                        return res.send(err);
                    }
                    cacheHelper.setCache(cacheKey, Programs);
                    res.status(200).send(Programs);
                });
        }
        else {
            res.status(200).send(cachedValue);
        }
    } else {
        Program.find({}).populate("programType").populate("programSubCategory").sort({
            programPriority: 1
        }).exec(function (err, Programs) {
            if (err != undefined) {
                res.send(err);
            }
            res.status(200).send(Programs);

        });
    }
}

module.exports.programListByLang = function (req, res) {
    Program.find({
        'language': req.params.userLang
    }).populate("programType").populate("programSubCategory").exec(function (err, Programs) {
        if (err != undefined) {
            res.send(err);
        }
        res.status(200).send(Programs);

    });
}

// update program
module.exports.updateProgram = function (req, res) {
    Program.findOne({
        _id: req.body.id
    }).populate('donationProcess').exec((err, program) => {
        if (program) {
            program.programName = req.body.programName || program.programName;
            program.programPriority = req.body.programPriority || program.programPriority;
            program.programDescription = req.body.programDescription || program.programDescription;
            program.isSyed = req.body.isSyed || (program.isSyed == undefined);
            program.slug = req.body.slug && req.body.slug.split(" ").join("-").toLowerCase();
            program.programSubCategory = req.body.programSubCategory || program.programSubCategory;
            program.imageLink = req.body.imageLink || program.imageLink;
            program.donationProcess[0].isRecurring = req.body.donationProcess.isRecurring || (program.donationProcess[0].isRecurring == undefined);
            program.donationProcess[0].isDuration = req.body.donationProcess.isDuration || (program.donationProcess[0].isDuration == undefined);
            program.donationProcess[0].isCount = req.body.donationProcess.isCount || false;
            program.donationProcess[0].isYearAround = req.body.donationProcess.isYearAround || false;
            program.donationProcess[0].isMarhomeenName = req.body.donationProcess.isMarhomeenName || false;
            program.donationProcess[0].isCalendar = req.body.donationProcess.isCalendar || false;
            program.donationProcess[0].isOtherFieldForNiyaz = req.body.donationProcess.isOtherFieldForNiyaz || false;
            program.donationProcess[0].isOtherFieldForRP = req.body.donationProcess.isOtherFieldForRP || false;
            program.donationProcess[0].isSyed = req.body.donationProcess.isSyed || false;
            program.donationProcess[0].isAmount = req.body.donationProcess.isAmount || false;
            program.donationProcess[0].isMinimumAmount = req.body.donationProcess.isMinimumAmount || false;
            program.donationProcess[0].durationStartDate = req.body.donationProcess.durationStartDate || program.donationProcess[0].durationStartDate;
            program.donationProcess[0].durationEndDate = req.body.donationProcess.durationEndDate || program.donationProcess[0].durationEndDate;
            program.donationProcess[0].countMin = req.body.donationProcess.countMin || program.donationProcess[0].countMin;
            program.donationProcess[0].countMax = req.body.donationProcess.countMax || program.donationProcess[0].countMax;
            program.donationProcess[0].interval = req.body.donationProcess.interval || program.donationProcess[0].interval;
            program.donationProcess[0].amount = req.body.donationProcess.amount || program.donationProcess[0].amount;
            program.donationProcess[0].minimumAmount = req.body.donationProcess.minimumAmount || program.donationProcess[0].minimumAmount;
            program.donationProcess[0].donationDuration = req.body.donationProcess.donationDurations || program.donationProcess.donationDuration;
            program.isSyed = req.body.isSyed || program.isSyed;
            program.countryOfZiyarat = req.body.countryOfZiyarat || program.countryOfZiyarat;
            program.updated = Date.now();
            program.updatedBy = 'NA';
            program.save((perr, program) => {
                if (perr) {
                    res.status(500).send(perr);
                } else {
                    program.donationProcess[0].save(function (serr) {
                        if (serr) {
                            res.status(500).send(serr)
                        } else {                    
                            const cacheKey = `${PROGRAM_LIST}_${program.language}_${program.programType}`;
                            cacheHelper.deleteCache(cacheKey);
                            res.json('Program updated Sucessfully');
                        }
                    });
                }
            });
        } else {
            if (err) res.status(500).send(err);
        }
    });
}
//select program by id
module.exports.ProgramById = function (req, res) {
    let query = {};
    if (req.params.Id.length == 24 && req.params.Id.indexOf('-') < 0) {
        query = {
            _id: req.params.Id
        };
    } else {
        query = {
            slug: req.params.Id,
            language: req.query.lang || 'ENG'
        };
    }
    Program.find(query)
        // Program.find({slug: req.params.Id})
        //.populate('programSubCategory')
        .populate({
            path: 'programSubCategory',
            populate: {
                path: 'sdoz',
                model: 'sdoz'
            }
        })
        .populate({
            path: 'programSubCategory',
            populate: {
                path: 'countryOfZiyarat',
                model: 'country'
            }
        })
        .populate({
            path: 'programSubCategory',
            populate: {
                path: 'sahms',
                model: 'sahms'
            }
        })
        .populate({
            path: 'donationProcess',
            populate: {
                path: 'donationDuration',
                model: 'donationduration'
            }
        })
        .exec(function (err, Program) {
            if (Program && Program.length && Program[0].programSubCategory && Program[0].programSubCategory.length) {
                Program[0].programSubCategory = Program[0].programSubCategory.filter(c => c.isActive);
            }
            res.status(200).send(Program);
        });
}


module.exports.ProgramOfSubCategories = function (req, res) {

    Program.find({
        programSubCategory: req.params.subCategoryId
    }).populate("programType")
        //.populate("programSubCategory")
        .populate({
            path: 'programSubCategory',
            populate: {
                path: 'sdoz',
                model: 'sdoz'
            }
        })
        .populate({
            path: 'programSubCategory',
            populate: {
                path: 'countryOfZiyarat',
                model: 'country'
            }
        })
        .populate({
            path: 'programSubCategory',
            populate: {
                path: 'sahms',
                model: 'sahms'
            }
        })
        .populate({
            path: 'donationProcess',
            populate: {
                path: 'donationDuration',
                model: 'donationduration'
            }
        }).exec(function (err, Programs) {
            if (err != undefined) {
                res.send(err);
            }
            res.status(200).send(Programs);

        });
}

module.exports.KhumsSubProgramList = function (req, res) {

    Program.find({
        programName: req.params.programName,
        language: req.params.userLang
    })
        //.populate('programSubCategory')
        .populate({
            path: 'programSubCategory',
            populate: {
                path: 'sdoz',
                model: 'sdoz'
            }
        }).find({
            'isActive': true
        })
        .populate({
            path: 'programSubCategory',
            populate: {
                path: 'countryOfZiyarat',
                model: 'country'
            }
        })
        .populate({
            path: 'donationProcess',
            populate: {
                path: 'donationDuration',
                model: 'donationduration'
            }
        })
        .exec(function (err, Program) {

            res.status(200).send(Program);
        });
}


//select program by id
module.exports.ProgramByIdAndLang = function (req, res) {
    let query = {};
    if (req.params.Id.length == 24 && req.params.Id.indexOf(' ') < 0) {
        query = {
            _id: req.params.Id
        };
    } else {
        query = {
            slug: req.params.Id,
            language: req.query.language || 'ENG'
        };
    }
    Program.find(query)
        //.populate('programSubCategory')
        .populate("programType")
        .populate({
            path: 'programSubCategory',
            populate: {
                path: 'sdoz',
                model: 'sdoz'
            }
        }).find({
            'isActive': true
        })
        .populate({
            path: 'programSubCategory',
            populate: {
                path: 'countryOfZiyarat',
                model: 'country'
            },
            populate: {
                path: 'sahms',
                model: 'sahms'
            },
        })
        .populate({
            path: 'donationProcess',
            populate: {
                path: 'donationDuration',
                model: 'donationduration'
            }
        })
        .exec(function (err, Program) {

            res.status(200).send(Program);
        });
}