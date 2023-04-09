var Orphan = require('../models/orphan.js');
var OrphanScholarships = require('../models/orphanScholarships');
var ObjectID = require('mongodb').ObjectID;
var DonationRecurring = require('../models/donationRecurring.js');
var fs = require('fs');
var logHelper = require('../utilities/logHelper');
var Constants = require('../constants');
const databaseHelper = require("../utilities/databaseHelper.js");
const dateHelper = require('../utilities/dateHelper');
const configuration = require('../../config/configuration');

//Create New Orphan
module.exports.addOrphan = function (req, res) {
    const methodName = 'addOrphan';
    const orphanController = Constants.LogLiterals.ORPHAN_CONTROLLER;
       try {

    var orphan = new Orphan({
        orphanName: req.body.orphanName,
        // contactDetails: req.body.contactDetails,
        // fileNumber: req.body.fileNumber,
        orphanId: req.body.orphanId,
        language: req.body.language,
        // familyName: req.body.familyName || null,
        isActive: req.body.isActive,
        isSyed: req.body.isSyed || false,
        descent: req.body.isSyed === "true" ? 'Syed' : 'Non-Syed',
        imageLink: req.body.imageLink,
        gender: req.body.gender,
        country: req.body.country.name,
        // startingDate: req.body.startingDate,
        // endingDate: req.body.endingDate,
        city: req.body.city || null,
        fatherName: req.body.fatherName || null,
        motherName: req.body.motherName || null,
        causeOfDeath: req.body.causeOfDeath || null,
        dateOfBirth: req.body.dateOfBirth || null,
        created: Date.now(),
        updated: Date.now(),
        createdBy: req.session._id,
        updatedBy: req.session._id,
    })
    orphan.save(function (error) {
        if (error) {
            throw error;
        }
        else {
            res.json('Orphan Added Sucessfully');
        }

    })
}
         catch (error) {
            logHelper.logError(`${orphanController}: ${methodName}: Error on find`, err);
            throw error;
        }
}

// All Orphans List
module.exports.OrphanList = function (req, res) {
    DonationRecurring.find({ orphan: { $exists: true }, freezed: false, endDate: { $gte: new Date() } }, function (err, donationRecurringList) {
        if (donationRecurringList) {
            let sponOrphanIds = [];
            donationRecurringList.forEach(function (dr) {
                sponOrphanIds.push(dr._doc.orphan.orphanId);
            });
            Orphan.find({ language: req.query.language }).exec((err, orphans) => {
                if (err) res.status(500).send(err);
                else {
                    if (orphans && orphans.length) {
                        orphans.map(orphan => {
                            if (sponOrphanIds.length && sponOrphanIds.find(id => JSON.stringify(id) == JSON.stringify(orphan.orphanId))) {
                                orphan._doc.isSponsored = true;
                            } else orphan._doc.isSponsored = false;
                            return orphan;
                        });
                        return res.status(200).send(orphans);
                    }
                    else return res.status(200).send([]);
                }
            });
        } else {
            Orphan.find({}, (err, orphans) => {
                if (err) res.status(500).send(err);
                else res.status(200).send(orphans);
            })
        }
    })

}
function convertCsv(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';

    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if (line != '') line += ','

            line += array[i][index];
        }

        str += line + '\r\n';
    }

    return str;
}
module.exports.addOrphanList = function (req, res) {
    let orphans = req.body;

    if (orphans && orphans.length) {
        orphans = orphans.map(orphan => ({
            orphanId: orphan.orphanId,
            orphanName: orphan.orphanName,
            isSyed: true ? orphan.descent === 'Syed' : false,
            descent: orphan.descent,
            dateOfBirth: orphan.dateOfBirth,
            city: orphan.city || null,
            country: orphan.country || null,
            gender: orphan.gender,
            isActive: true,
            priority: 1,
            language: orphan.language,
            created: Date.now(),
            updated: Date.now(),
            causeOfDeath:orphan.causeOfDeath 
        }));
    }
    let bulkOps = [];
    orphans.forEach(s => {
        let upsertDoc = {
            updateOne: {
                filter: { orphanId: s.orphanId, language: s.language },
                update: { '$set': s },
                upsert: true
            }
        };
        bulkOps.push(upsertDoc);
    });
    Orphan.bulkWrite(bulkOps)
        .then(bulkWriteOpResult => {
            const rightNow = new Date();
            const dateNow = rightNow.toISOString().slice(0, 18).replace(/:/g, "-");
            fs.writeFile(`public/orphans/csvs/orphan-list-${dateNow}.csv`, convertCsv(req.body), 'utf8', function (err) {
                if (err) {
                    console.log('Some error occured - file either not saved or corrupted file saved.');
                } else {
                }
            });
            res.status(200).send(bulkWriteOpResult);
        })
        .catch(err => {
            res.status(401).send(err);
        });
}
module.exports.uploadPhotos = function (req, res, next) {
    
    const files = req.files
    if (!files) {
        const error = new Error('Please choose files')
        error.httpStatusCode = 400
        return next(error)
    }
    try {
        files.forEach(f => {
            let orphanId = f.filename.split(".").shift();
            let modifier = { $set: {} };
            let doc = orphanId.split("-");
            if (doc instanceof Array && doc.length > 1) {
                var link = doc[1] === "result" ? "result" : "medical";
                orphanId = orphanId.split("-").shift();
                if (link === "result") {
                    modifier.$set.resultLink = f.filename;
                }
                if (link === "medical") {
                    modifier.$set.medicalLink = f.filename;
                }
            } else {
                modifier.$set.imageLink = f.filename;
            }
            Orphan.update({ orphanId: orphanId }, modifier, { multi: true }, (e, r) => {
                if (e) throw e;
            })

        })
    } catch (error) {
        res.status(500).send("Error Updating Orphan Data");
    }
    res.status(200).send("Successfully Saved")
}
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}
function age(birthday) {
    if (birthday) {
        let bday = new Date(birthday);
        var ageDifMs = Date.now() - bday.getTime();
        var ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }
}
//Orphan List By Count
module.exports.OrphanListByCount = function (req, res) {
    // we are getting list from donation reccuring of the orphans who have sponsership and their sponsership is also not freezed
    var sponOrphanIds = []
    DonationRecurring.find({ orphan: { $exists: true }, freezed: false }, function (err, donationRecurringList) {
        if (donationRecurringList) {
            donationRecurringList.forEach(function (dr) {
                sponOrphanIds.push(dr._doc.orphan.orphanId);
            });
            var syed = req.params.Syed;
            var gender = req.params.Gender;

            let searchQueryObj = {
                orphanId: { $nin: sponOrphanIds },
                isActive: true,
                language: req.query.language
            };

            if (syed != "Any") {

                syed = syed == "true" ? true : false;
                searchQueryObj.descent = syed ? /^syed$/i : { $regex: `.*Non-Syed.*`, $options: "i" }
            }
            if (gender != "Any") {
                searchQueryObj.gender = req.params.Gender
            }

            searchQueryObj['$or'] = [{ orphanReservedTill: { $exists: true, $lte: dateHelper.getDateNow(true) } }, { orphanReservedTill: { $exists: false } }];
            Orphan.find(searchQueryObj).exec(function (err, orphans) {
                if (err) return res.status(400).send("Error Fetching Students")
                if (!(orphans && orphans.length)) {
                    return res.status(404).send("No Student Found");
                }
                else {
                    let femaleOrphansGrade6 = [];
                    let maleOrphansGrade6 = [];
                    let femaleOrphansGrade12 = [];
                    let maleOrphansGrade12 = [];
                    let resArr = [];
                    const count = (req.params.Id || 1) * 3;
                    // Suppose count is 2 then student = 6 (3 grade <= 6 && 3 grade > 6 3 male 3 female)
                    for (let i = 0; i < orphans.length; i++) {
                        let orp = orphans[i];
                        // if (req.params.Gender === "Female") {
                        if (orp.gender === "Female" && age(orp.dateOfBirth) <= 5) femaleOrphansGrade6.push(orp);
                        if (orp.gender === "Female" && age(orp.dateOfBirth) > 5 && age(orp.dateOfBirth) <= 11) femaleOrphansGrade12.push(orp);
                        //  } else {
                        if (orp.gender === "Male" && age(orp.dateOfBirth) <= 5) maleOrphansGrade6.push(orp);
                        if (orp.gender === "Male" && age(orp.dateOfBirth) > 5 && age(orp.dateOfBirth) <= 11) maleOrphansGrade12.push(orp);
                        //  }
                    }
                    resArr = resArr.concat(maleOrphansGrade6)
                        .concat(shuffle(femaleOrphansGrade6))
                        .concat(shuffle(femaleOrphansGrade12))
                        .concat(shuffle(maleOrphansGrade12));
                    resArr = shuffle(resArr);
                    let priorityOrphans = orphans.filter(or => or.priority > 1);
                    let lowPriorityOrphans = resArr.filter(or => or.priority <= 1);
                    resArr = [...priorityOrphans, ...lowPriorityOrphans];
                    // resArr = resArr.slice(0, count).sort((a, b) => a.priority || 0 - b.priority || 0);
                    // resArr = resArr.slice(0, count > 25 ? 25 : count);
                    res.status(200).send(resArr);
                }
            });
        }
    });
};
//Get Orphan By Id
module.exports.OrphanById = function (req, res) {
    Orphan.find({ _id: req.params.Id }).exec(function (err, Orphan) {
        res.status(200).send(Orphan);
    });
}
// Delete Orphan
module.exports.deleteOrphan = function (req, res) {
    try {
        let isActive = req.query.isActive === "true" ? true : false;
        Orphan.update({ orphanId: req.params.Id }, { $set: { isActive: !isActive } }, { multi: true }, function (err, resp) {
            if (resp) {
                let response = {
                    message: "Orphan Deleted Successfully",
                };
                res.status(200).send(response);
            }
        });
    }
    catch (ex) {
        res.send(ex);
    }
}
//Update Oprhan 
module.exports.updateOrphan = function (req, res) {
    const methodName = Constants.LogLiterals.UPDATE_ORPHAN;
    const orphanController = Constants.LogLiterals.ORPHAN_CONTROLLER;

    try {
        Orphan.findOne({ _id: req.body.id }).exec((err, orphan) => {
            try {
                if (err) {
                    logHelper.logError(`${orphanController}: ${methodName}: Error on find`, err, true);
                    res.status(500).send(err);
                }
                else {
                    orphan.orphanName = req.body.orphanName || orphan.orphanName;
                    orphan.orphanId = req.body.orphanId || orphan.orphanId;
                    orphan.familyName = req.body.familyName || orphan.familyName;
                    orphan.fileNumber = req.body.fileNumber || orphan.fileNumber;
                    orphan.gender = req.body.gender || orphan.gender;
                    orphan.isSyed = req.body.isSyed == undefined ? orphan.isSyed : req.body.isSyed;
                    orphan.contactDetails = req.body.contactDetails || orphan.contactDetails;
                    orphan.country = req.body.country ? req.body.country.name : req.body.name;
                    orphan.city = req.body.city || orphan.city;
                    orphan.descent = req.body.isSyed ? 'SYED' : 'NON-SYED',
                        orphan.fatherName = req.body.fatherName || orphan.fatherName;
                    orphan.motherName = req.body.motherName || orphan.motherName;
                    orphan.imageLink = req.body.imageLink || orphan.imageLink;
                    orphan.dateOfBirth = req.body.dateOfBirth || orphan.dateOfBirth;
                    orphan.causeOfDeath = req.body.causeOfDeath || orphan.causeOfDeath;
                    orphan.startingDate = req.body.startingDate || orphan.startingDate,
                        orphan.endingDate = req.body.endingDate || orphan.endingDate,
                        orphan.updated = Date.now();
                    orphan.updatedBy = 'NA';
                    orphan.save((err, Orphan) => {
                        if (err) {
                            logHelper.logError(`${orphanController}: ${methodName}: Error on save`, err, true);
                            res.status(500).send(err)
                        } else {
                            logHelper.logError(`${orphanController}: ${methodName}: Orphan updated Sucessfully`, orphan);
                            res.json('Orphan updated Sucessfully');
                        }
                    });
                }
            }
            catch (exc) {
                logHelper.logError(`${orphanController}: ${methodName}: Error after find`, exc ? exc.message : exc, true);
                res.status(500).send(exc)
            }
        });
    }
    catch (ex) {
        logHelper.logError(`${orphanController}: ${methodName}: Error`, ex, true);
        res.status(500).send(ex);
    }
}

module.exports.OrphanListWithPriority = function (req, res) {

    // we are getting list from donation reccuring of the orphans who have sponsership and their sponsership is also not freezed
    var sponOrphanIds = []
    DonationRecurring.find({ orphan: { $exists: true }, freezed: false, }, function (drErr, donationRecurringList) {
        if (drErr != null) {
            res.send(drErr);
        }

        if (donationRecurringList) {
            donationRecurringList.forEach(function (dr) {
                sponOrphanIds.push(dr._doc.orphan.orphanId);
            });
        }

        Orphan.find({ $and: [{ isActive: true }, { orphanId: { $nin: sponOrphanIds }, }, { language: req.query.language }, { priority: { $gte: 1 } }] })
            .sort({ priority: 1 })
            .exec(function (err, Orphans) {
                if (err != undefined) {
                    res.send(err);
                }
                res.status(200).send(Orphans);
            });

    });
}

module.exports.OrphanListWithNoPriority = function (req, res) {

    // we are getting list from donation reccuring of the orphans who have sponsership and their sponsership is also not freezed
    var sponOrphanIds = []
    DonationRecurring.find({ orphan: { $exists: true }, freezed: false }, function (drErr, donationRecurringList) {
        if (drErr != null) {
            res.send(err);
        }

        if (donationRecurringList) {
            donationRecurringList.forEach(function (dr) {
                sponOrphanIds.push(dr._doc.orphan.orphanId);
            });
        }

        Orphan.find({ $and: [{ isActive: true }, { orphanId: { $nin: sponOrphanIds } }, { priority: { $lte: 1 } }] })
            .exec(function (err, Orphans) {
                if (err != undefined) {
                    res.send(err);
                }
                res.status(200).send(Orphans);
            });
    });
}


module.exports.updateSelectedOrphan = async function (req, res) {

    try {
        logHelper.logInfo(`OrphanController: updateSelectedOrphan:  `);
        let receivedArrayId = req.body;
        let filterQuery = {
            _id: { $in: receivedArrayId }
        };
        let payLoad = {
            orphanReservedTill: dateHelper.addInDate(dateHelper.getDateNow(true), configuration.orphanHold.ThresholdPeriod, Constants.DateUnit.Minutes)
        };
        let updateOrphan = await databaseHelper.updateManyItems(Constants.Database.Collections.ORPN.dataKey, filterQuery, payLoad);
        if (updateOrphan && updateOrphan.nModified > 0) {
            return res.status(200).send(true);
        }
        return res.status(500).send(false);


    } catch (ex) {
        logHelper.logError(` OrphanController: updateSelectedOrphan : `, ex);
        return res.status(500).send(ex);
    }


}


module.exports.getSelectedOrphansStatus = async function (req, res) {

    try {
        logHelper.logInfo(`OrphanController: getSelectedOrphanStatus:  `);

        let receivedArrayId = Array.isArray(req.query.oprhanArray) ? req.query.oprhanArray : [req.query.oprhanArray];
        let selectedOrphanIds = []

        let filterOrphan = {
            isActive: true,
            language: req.query.language,
            _id: { $in: receivedArrayId }
        };
        let orphanstoCheck = await databaseHelper.getItems(Constants.Database.Collections.ORPN.dataKey, filterOrphan, { _id: 1, orphanId: 1 });
        if (orphanstoCheck && orphanstoCheck.length == receivedArrayId.length) {
            for (let a = 0; a < orphanstoCheck.length; a++) {
                selectedOrphanIds.push(orphanstoCheck[a].orphanId);
            }
            let filterDonRec = {
                orphan: { $exists: true },
                freezed: false,
                "orphan.orphanId": { $in: selectedOrphanIds }

            };
            let orphanFreezed = await databaseHelper.getItems(Constants.Database.Collections.DON_REC.dataKey, filterDonRec);
            if (orphanFreezed) {
                return res.status(200).send(orphanFreezed);
            }
        }
        else {
            return res.status(200).send([{}]);
        }
        return res.status(500).send(false);

    } catch (ex) {
        logHelper.logError(` OrphanController: getSelectedOrphanStatus : `, ex);
        return res.status(500).send(ex);
    }


}