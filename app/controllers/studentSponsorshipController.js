var StudentSponsorship = require('../models/studentSponsorship.js');
var Donar = require('../models/donar.js');
var User = require('../models/user.js');
var ObjectID = require('mongodb').ObjectID;

//Create New Program
module.exports.addStudentSponsorship = function (req, res) {
    var studentSp = new StudentSponsorship({
        donar: req.body.donar,
        donationdetails: req.body.donationdetails,
        students: req.body.students,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        paymentDate: req.body.paymentDate,
        created: Date.now(),
        updated: Date.now(),
        createdBy: 'NA',
        updatedBy: 'NA'
    })
    studentSp.save(function (error) {
        if (error) {
            throw error;
        }
        else {
            res.json('Student Sponsorship created successfully');
        }
    })
}

// get student by donar id
module.exports.getStudentsListByDonarId = function (req, res) {
    Donar.findOne({ user: req.session._id }, function (err, donarObj) {
        if (donarObj) {
            StudentSponsorship.find({ donar: donarObj._id })
                .populate({
                    path: "students",
                    model: "studentprofile",
                    populate: [{ path: 'nationality', model: "country" }, { path: 'motherTongue', model: "languages" }]
                })
                .populate({
                    path: "donationdetails",
                    model: "donationDetail"
                }).exec(function (err, studentSponsor) {
                    if (studentSponsor) {
                        res.status(200).send(studentSponsor);
                    } else {
                        res.status(500).send("Student does not exist!");
                    }
                });
        }
    });
}


// get student by id
module.exports.getStudentById = function (req, res) {
    StudentSponsorship.findById(req.params.Id, function (err, student) {
        res.status(200).send(student);
    });
}