var OrphanScholarship = require('../models/orphanScholarships.js');
var Donar = require('../models/donar.js');
var Orphan = require('../models/orphan.js');
var User = require('../models/user.js');
var ObjectID = require('mongodb').ObjectID;

//Create New Program
module.exports.addOrphanScholarship = function (req, res) {
    var os = new OrphanScholarship({
        donar: req.body.donar,
        donationdetails: req.body.donationdetails,
        orphans: req.body.orphans,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        paymentDate: req.body.paymentDate,
        created: Date.now(),
        updated: Date.now(),
        createdBy: 'NA',
        updatedBy: 'NA'
    })
    os.save(function (error) {
        if (error) {
            throw error;
        }
        else {
            res.json('Orphan scholarship created sucessfully');
        }
    })
}
// get orphan by donar id
module.exports.getOrphanListByDonarId = function (req, res) {
    Donar.findOne({ user: req.session._id }, function (err, donarObj) {
        if (donarObj) {
            OrphanScholarship.find({ donar: donarObj._id })
                .populate({
                    path: "orphans",
                    model: "orphan"
                })
                .populate({
                    path: "donationdetails",
                    model: "donationDetail"
                }).exec(function (err, studentSponsor) {
                    if (studentSponsor) {
                        res.status(200).send(studentSponsor);
                    } else {
                        res.status(500).send("Orphan does not exist!");
                    }
                });
        }
    });
}
// get orphan by id
module.exports.getOrphanById = function (req, res) {
    Orphan.findById(req.params.Id, function (err, student) {
        res.status(200).send(student);
    });
}