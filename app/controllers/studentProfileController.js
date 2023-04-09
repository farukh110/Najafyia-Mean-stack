var StudentProfile = require('../models/studentProfile.js');
var ObjectID = require('mongodb').ObjectID;
var DonationRecurring = require('../models/donationRecurring.js');
var fs = require('fs');
var bson = require('bson');
const randomNumber = require('./utils');
//Create New Student Profile
module.exports.addStudentProfile = function (req, res) {
    var studentProfile = new StudentProfile({

        studentName: req.body.studentName,
        studentId: req.body.studentId,
        // fileNumber: req.body.fileNumber || null,
        language: req.body.language,
        // startingDate: req.body.startingDate || null,
        // endingDate: req.body.endingDate || null,
        isSyed: req.body.descent === "Syed"? true : false,
        descent: req.body.descent,
        // admissionDate: req.body.admissionDate || null,
        grade: req.body.grade || null,
        dateOfBirth: req.body.dateOfBirth,
        country: req.body.country,
        // motherTongue: req.body.motherTongue || null,
        // religion: req.body.religion,
        // address: req.body.address,
        city: req.body.city || null,
        // birthPlace: req.body.birthPlace || null,
        // motherName: req.body.motherName || null,
        // motherOccupation: req.body.motherOccupation || null,
        // fatherName: req.body.fatherName || null,
        // fatherOccupation: req.body.fatherOccupation || null,
        // medicalCondition: req.body.medicalCondition || null,
        // sponsorName: req.body.sponsorName || null,
        // sponsorEmail: req.body.sponsorEmail || null,
        // sponsorPhone: req.body.sponsorPhone || null,
        gender: req.body.gender,
        isActive: req.body.isActive,
        imageLink: req.body.imageLink,
        // age: req.body.age || null,
        created: Date.now(),
        updated: Date.now(),
        createdBy: 'NA',
        updatedBy: 'NA'
    })
    studentProfile.save(function (error) {
        if (error) {
            if (error.code == '11000') {
                res.json('Duplicate File Number.');
            } else {
                throw error;
            }
        }
        else {
            res.json('Student Profile Added Sucessfully');
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
module.exports.addStudentList = function (req, res) {
    let students = req.body;
    if (students && students.length) {
        students = students.map(student => ({
            studentId: student.studentId,
            studentName: student.studentName,
            isSyed: true ? student.descent === 'Syed' : false,
            grade: student.grade || null,
            descent: student.descent,
            dateOfBirth: student.dateOfBirth,
            city: student.city || null,
            country: student.country || null,
            gender: student.gender,
            isActive: true,
            language: student.language,
            created: Date.now(),
            updated: Date.now(),
            priority: 1,
        }));
    }
    let bulkOps = [];
    students.forEach(s => {
        let upsertDoc = {
            updateOne: {
                filter: { studentId: s.studentId, language: s.language },
                update: { '$set': s },
                upsert: true
            }
        };
        bulkOps.push(upsertDoc);
    });
    StudentProfile.bulkWrite(bulkOps)
        .then(bulkWriteOpResult => {
            const rightNow = new Date();
            const dateNow = rightNow.toISOString().slice(0, 18).replace(/:/g, "-");
            fs.writeFile(`public/daz/csvs/student-list-${dateNow}.csv`, convertCsv(req.body), 'utf8', function (err) {
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

// All Students List
module.exports.StudentsList = function (req, res) {
    DonationRecurring.find({ student: { $exists: true }, freezed: false, endDate: { $gte: new Date() } }, function (derr, donationRecurringList) {
        if (derr) res.status(400).send(err);
        if (donationRecurringList) {
            let studentIds = [];
            donationRecurringList.forEach(function (dr) {
                studentIds.push(dr._doc.student.studentId);
            });
            StudentProfile.find({ language: req.query.language || 'ENG' }).exec((err, students) => {
                if (err) res.status(500).send(err);
                else {
                    if (students && students.length) {
                        students.map(std => {
                            if (studentIds.length && studentIds.find(id => JSON.stringify(id) === JSON.stringify(std.studentId))) {
                                std._doc.isSponsored = true;
                            } else std._doc.isSponsored = false;
                            return std;
                        });
                        return res.status(200).send(students);
                    } else return res.status(200).send([]);
                }
            });
        } else {
            StudentProfile.find({}, (err, students) => {
                if (err) res.status(500).send(err);
                else res.status(200).send(students);
            })
        }
    })

}
// Delete Student
module.exports.deleteStudent = function (req, res) {
    try {
        let isActive = req.params.isActive === "true" ? true : false;
        StudentProfile.update({ studentId: req.params.Id }, { $set: { isActive: !isActive } }, { multi: true }, function (err, resp) {
            if (resp) {
                let response = {
                    message: "Student Deleted Successfully",
                };
                res.status(200).send(response);
            }
        });
    }
    catch (ex) {
        res.send(ex);
    }
}
//Get Student By Id
module.exports.StudentById = function (req, res) {
    StudentProfile.findOne({ _id: req.params.Id }).populate("nationality")
        .populate("motherTongue").exec(function (err, StudentProfile) {
            res.status(200).send(StudentProfile);
        });
}
//Update Oprhan 
module.exports.updateStudent = function (req, res) {
    StudentProfile.findOne({ $or: [{ _id: req.body.id }, { studentId: req.body.studentId }] }).exec((err, student) => {
        if (err) {
            res.status(500).send(err);
        }
        else {
            student._id = req.body._id || student._id,
                student.studentId = req.body.studentId || student.studentId;
            student.studentName = req.body.studentName || student.studentName;
            student.fileNumber = req.body.fileNumber || student.fileNumber;
            student.startingDate = req.body.startingDate || student.startingDate;
            student.endingDate = req.body.endingDate || student.endingDate;
            student.descent = req.body.isSyed?"SYED":"NON-SYED" || student.descent;
            student.admissionDate = req.body.admissionDate || student.admissionDate;
            student.grade = req.body.grade || student.grade;
            student.dateOfBirth = req.body.dateOfBirth || student.dateOfBirth;
            student.nationality = req.body.nationality || student.nationality;
            student.motherTongue = req.body.motherTongue || student.motherTongue;
            student.religion = req.body.religion || student.religion;
            student.address = req.body.address || student.address;
            student.city = req.body.city || student.city;
            student.birthPlace = req.body.birthPlace || student.birthPlace;
            student.motherName = req.body.motherName || student.motherName;
            student.motherOccupation = req.body.motherOccupation || student.motherOccupation;
            student.fatherName = req.body.fatherName || student.fatherName;
            student.fatherOccupation = req.body.fatherOccupation || student.fatherOccupation;
            student.medicalCondition = req.body.medicalCondition || student.medicalCondition;
            student.sponsorName = req.body.sponsorName || student.sponsorName;
            student.sponsorEmail = req.body.sponsorEmail || student.sponsorEmail;
            student.sponsorPhone = req.body.sponsorPhone || student.sponsorPhone;
            student.gender = req.body.gender || student.gender;
            student.age = req.body.age || student.age;
            student.imageLink = req.body.imageLink || student.imageLink;
            student.updated = Date.now();
            student.updatedBy = 'NA';
            student.save((err, StudentProfile) => {
                if (err) {
                    res.status(500).send(err)
                }
                res.json('Student updated Sucessfully');
            });
        }
    });
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
module.exports.StudentListByCount = function (req, res) {
    var sponStudentIds = [];

    DonationRecurring.find({ student: { $exists: true }, freezed: false }, function (derr, donationRecurringList) {
        if (donationRecurringList) {
            donationRecurringList.forEach(function (dr) {
                sponStudentIds.push(dr._doc.student.studentId);
            });
            var syed = req.params.Syed == "true" ? true : false;
            StudentProfile.find({
                studentId: { $nin: sponStudentIds },
                descent: syed ? "Syed" : { $regex: `.*Non-Syed.*`, $options: "i" },
                isActive: true,
                language: req.query.language || 'ENG'
            }).sort({ priority: 1 }).exec(function (err, students) {
                if (err) return res.status(400).send("Error Fetching Students")
                if (!(students && students.length)) {
                    return res.status(404).send("No Student Found");
                }
                else {
                    let femaleStudentsGrade6 = [];
                    let maleStudentsGrade6 = [];
                    let femaleStudentsGrade12 = [];
                    let maleStudentsGrade12 = [];
                    let resArr = [];
                    const count = (req.params.Id || 1) * 3;
                    // Suppose count is 2 then student = 6 (3 grade <= 6 && 3 grade > 6 3 male 3 female)
                    for (let i = 0; i < students.length; i++) {
                        let std = students[i];
                        if (std.gender === "Female" && std.grade <= "6") femaleStudentsGrade6.push(std);
                        if (std.gender === "Male" && std.grade <= "6") maleStudentsGrade6.push(std);
                        if (std.gender === "Female" && std.grade > "6") femaleStudentsGrade12.push(std);
                        if (std.gender === "Male" && std.grade > "6") maleStudentsGrade12.push(std);
                    }
                    resArr = resArr.concat(maleStudentsGrade6.slice(0, Math.round(count / 2)))
                        .concat(shuffle(femaleStudentsGrade6).slice(0, Math.round(count / 2)))
                        .concat(shuffle(femaleStudentsGrade12).slice(0, Math.round(count / 2)))
                        .concat(shuffle(maleStudentsGrade12).slice(0, Math.round(count / 2)));
                    resArr = shuffle(resArr);
                    let priorityStudents = students.filter(std => std.priority > 1);
                    let lowPriorityStudents = resArr.filter(std => std.priority <= 1);
                    resArr = [...priorityStudents, ...lowPriorityStudents];
                    // resArr = resArr.slice(0, count).sort((a, b) => a.priority || 0 - b.priority || 0);
                    resArr = resArr.slice(0, count > 25 ? 25 : count);
                    res.status(200).send(resArr);
                }
            });
        }
        else res.status(400).send("No Students to Fetch");
    });
}
module.exports.StudentListWithPriority = function (req, res) {

    // we are getting list from donation reccuring of the students who have sponsership and their sponsership is also not freezed
    var sponStudentIds = []
    DonationRecurring.find({ student: { $exists: true }, freezed: false }, function (drErr, donationRecurringList) {
        if (donationRecurringList) {
            donationRecurringList.forEach(function (dr) {
                sponStudentIds.push(dr._doc.student.studentId);
            });
        }
        if (drErr != null) {
            res.send(drErr);
        }

        StudentProfile.find({ $and: [{ isActive: true }, { studentId: { $nin: sponStudentIds } }, { language: req.query.language }, { priority: { $exists: true } }] })
            .sort({ priority: 1 })
            .exec(function (err, Students) {
                if (err != undefined) {
                    res.send(err);
                }
                res.status(200).send(Students);
            });
    });
}

module.exports.StudentListWithNoPriority = function (req, res) {

    // we are getting list from donation reccuring of the students who have sponsership and their sponsership is also not freezed
    var sponStudentIds = []
    DonationRecurring.find({ student: { $exists: true }, freezed: false }, function (drErr, donationRecurringList) {
        if (donationRecurringList) {
            donationRecurringList.forEach(function (dr) {
                sponStudentIds.push(dr._doc.student.studentId);
            });
        }
        if (drErr != null) {
            res.send(drErr);
        }

        StudentProfile.find({ $and: [{ isActive: true }, { studentId: { $nin: sponStudentIds } }, { priority: { $lte: 0 } }, { language: req.query.language }] })
            .exec(function (err, Students) {
                if (err != undefined) {
                    res.send(err);
                }
                res.status(200).send(Students);
            });
    });

}