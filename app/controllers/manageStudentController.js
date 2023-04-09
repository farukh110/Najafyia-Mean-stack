var ObjectID = require('mongodb').ObjectID;
var Donar = require('../models/donar.js');
var Donation = require('../models/donation.js');
var StudentSponsorship = require('../models/studentSponsorship.js');
var DonationRecurring = require('../models/donationRecurring.js');
var DateDiff = require('date-diff');
var Student = require('../models/studentProfile.js');
var Request = require("request");
var configuration = require('../../config/configuration');
var smsHelper = require('../utilities/smsHelper');

module.exports.getStudentsRecurring = function (req, res) {
    if (req.session.role && (req.session.role.indexOf("super admin") >= 0 || req.session.role.indexOf("admin") >= 0)) {
        DonationRecurring.find({ student: { $exists: true }, 'student.language': req.query.language }).sort({ created: -1 })
            .populate({ path: 'donationDuration', model: 'donationduration' })
            .populate({ path: "donar", model: "donar" })
            .exec(function (err, data) {
                try {
                    if (data && data.length) {
                        // let dataByDonor = data.filter(o => {
                        //     return o.donar && o.donar.length && o.donar[0]._id === new ObjectID(req.session._id);
                        // });
                        res.status(200).send(data);
                    } else res.status(200).send([]);
                } catch (error) {
                    res.status(400).send(error);
                }

            });
    } else {
        Donar.findOne({ user: req.session._id }, function (err, donr) {
            if (err) return res.status(400).send(err);
            if (donr) {
                DonationRecurring.find({ student: { $exists: true }, donar: donr._id }).sort({ created: -1 })
                    .populate({ path: 'donationDuration', model: 'donationduration' })
                    .populate({ path: "donar", model: "donar" })
                    .exec(function (err, data) {
                        try {
                            if (data && data.length) {
                                // let dataByDonor = data.filter(o => {
                                //     return o.donar && o.donar.length && o.donar[0]._id === new ObjectID(req.session._id);
                                // });
                                res.status(200).send(data);
                            } else res.status(200).send([]);
                        } catch (error) {
                            res.status(400).send(error);
                        }

                    });
            } else res.status(400).send("No Students Found")
        })
    }

    // Donar.findOne({ user: req.session._id }, function (err, donar) {
    //     if (donar) {
    //         DonationRecurring.find({ donor: donar._id}, {student: {$exists:1}}).sort({ created: -1 }).populate({
    //             path: "donationdetails",
    //             populate: [{ path: 'program', populate: { path: 'programType' } }, { path: 'programSubCategory' }]
    //         }).exec(function (err, donations) {
    //             if(donations){
    //                 if (donations.length) {
    //                     var donationList = [];
    //                     for (let i = 0; i < donations.length; i++) {
    //                         donations[i].donationdetails.forEach(element => {
    //                             donationList.push(element);
    //                         })
    //                     }
    //                     res.status(200).json(donationList);
    //                 }else{
    //                     res.status(200).json([]);
    //                 }
    //             }
    //         });
    //     }
    //     else if(!err && !donar){
    //         res.status(200).json([]);
    //     }
    // });



    // DonationRecurring.find({ student: { $exists: true} })
    //     .populate({ path: 'donationDuration', model: 'donationduration' })
    //     .populate({ path: "donar", model: "donar" })
    //     .exec(function (err, data) {
    //         if(data && data.length){
    //             res.status(200).send(data);
    //         }

    //     });
}

module.exports.changeStudent = function (req, res) { // always (req.body[0]: new Student & req.body[1]: donation recurring)
    try {
        DonationRecurring.findOne({ 'student.studentId': req.body[0].studentId, freezed: false }, function (dErr, dRes) {
            if (dRes && dRes.student) {
                res.status(400).json("Student Already Occupied");
            } else {
                DonationRecurring.findOneAndUpdate({ _id: new ObjectID(req.body[1]._id) }, {
                    $set: {
                        isChanged: true,
                    }
                }, function (err) {
                    if (err) {
                        throw err;
                    }
                    else {
                        var startDate = new Date(req.body[1].startDate);
                        var nextDonationDate = new Date(startDate.setMonth(startDate.getMonth() + 1));
                        var endDate = req.body[1].endDate

                        let donationRecurringNew = new DonationRecurring({
                            donationDetails: req.body[1].donationDetails,
                            program: req.body[1].program,
                            programSubCategory: req.body[1].programSubCategory,
                            donationDuration: req.body[1].donationDuration,
                            donar: req.body[1].donar,
                            customerId: req.body[1].customerId,
                            count: req.body[1].count,
                            nextDonationDate: nextDonationDate,
                            amount: req.body[1].amount,
                            isActive: true,
                            student: req.body[0],
                            endDate: endDate,
                            freezedDate: new Date(),
                            startDate: req.body[1].startDate,
                            changeRef: {
                                referenceId: new ObjectID(req.body[1]._id),
                                studentName: req.body[1].student.studentName,
                                studentId: req.body[1].student.studentId,
                                startDate: req.body[1].startDate,
                                endDate: req.body[1].endDate,
                                nextDonationDate: req.body[1].nextDonationDate,
                                freezedDate: req.body[1].freezedDate
                            }
                        });
                        donationRecurringNew.save(function (err) {
                            if (err) {
                                throw err;
                            }
                            else {
                                StudentSponsorship.update({ donationdetails: req.body[1].donationDetails._id }, { $set: { isChanged: true, } }, (usErr, usRes) => {
                                    if (usErr) throw usErr;
                                    else {
                                        StudentSponsorship.findOne({ donationdetails: req.body[1].donationDetails._id }, function (oldSpnErr, oldSpns) {
                                            let paymentDate = oldSpns.paymentDate;
                                            var studentSponsorship = new StudentSponsorship({
                                                startDate: req.body[1].startDate,
                                                endDate: new Date(endDate),
                                                sponsorshipAmount: req.body[1].amount,
                                                students: [req.body[0]._id],
                                                donationdetails: [req.body[1].donationDetails._id],
                                                donar: req.body[1].donar,

                                                paymentDate: paymentDate
                                            });
                                            studentSponsorship.save(function (err) {
                                                if (err) {
                                                    throw err;
                                                }
                                                else {
                                                    res.status(200).send();
                                                }
                                            });
                                        });
                                    }
                                })
                            }

                        });


                    }
                });
            }
        })


    }
    catch (ex) {

    }
}

module.exports.cancelStudent = function (req, res) {
    DonationRecurring.findOneAndUpdate({ _id: req.body._id }, {
        $set: {
            freezedDate: new Date(),
            freezed: true,
        }
    }).populate({
        path: 'donar', populate: {
            path: 'user'
        }
    }).exec(function (err, data) {
        if (err) {
            console.log(err);
        }
        else {
            var priority;
            Student.findOne({}).sort({ priority: -1 }).exec(function (err, student) {
                priority = student.priority + 1;

                Student.update(
                    { studentId: req.body.student.studentId },
                    { $set: { priority: priority } },
                    { multi: true },
                    function (err, numberAffected) {
                        if (err) {
                            throw err;
                        }
                        else {
                            if (data && data.donar && data.donar.length && data.donar[0].user && data.donar[0].user.length && data.donar[0].user[0].language == "FRN") {
                                if (data.donar[0].user[0].mobile) {
                                    let msg = "\x53\x41\x2C\x0A\x49\x6E\x66\x6F\x20\x3A\x20\x76\x6F\x74\x72\x65\x20\x70\x61\x72\x72\x61\x69\x6E\x61\x67\x65\x20\x44\x41\x5A\x20\x61\x20\xC3\xA9\x74\xC3\xA9\x20\x61\x6E\x6E\x75\x6C\xC3\xA9\x20\x70\x6F\x75\x72\x20\x6E\x6F\x6E\x2D\x70\x61\x69\x65\x6D\x65\x6E\x74\x2E\x0A\x4E\x46";
                                    smsHelper.sendSMS(data.donar[0].user[0].mobile, msg);
                                }
                            }
                            else if (data && data.donar && data.donar.length && data.donar[0].user && data.donar[0].user.length && data.donar[0].user[0].language == "ARB") {
                                if (data.donar[0].user[0].mobile) {
                                    let msg = "%u0627%u0644%u0633%u0644%u0627%u0645%20%u0639%u0644%u064A%u0643%u0645%2C%20%u064A%u0624%u0633%u0641%u0646%u0627%20%u0625%u0628%u0644%u0627%u063A%u0643%u0645%20%u0628%u0625%u0644%u063A%u0627%u0621%20%u0631%u0639%u0627%u064A%u062A%u0643%u0645%20%u0644%u0644%u064A%u062A%u064A%u0645%20%u0628%u0633%u0628%u0628%20%u0639%u062F%u0645%20%u0627%u0644%u062F%u0641%u0639.%20%u064A%u0631%u062C%u0649%20%u0627%u0644%u0627%u062A%u0635%u0627%u0644%20%u0628%u0646%u0627%20%u0625%u0630%u0627%20%u0643%u0646%u062A%20%u062A%u0631%u063A%u0628%20%u0641%u064A%20%u0631%u0639%u0627%u064A%u0629%20%u064A%u062A%u064A%u0645%20%u0622%u062E%u0631.%20%u0645%u0624%u0633%u0633%u0629%20%u0627%u0644%u0623%u0646%u0648%u0627%u0631%20%u0627%u0644%u0646%u062C%u0641%u064A%u0629"
                                    smsHelper.sendSMS(data.donar[0].user[0].mobile, msg);
                                }
                            } else {
                                if (data.donar[0].user[0].mobile) {
                                    let msg = "Salamun Alaykum, Unfortunately, your DAZ student sponsorship has been cancelled due to non-payment. Please contact us if you wish to sponsor another student. \n Najafyia Foundation"
                                    smsHelper.sendSMS(data.donar[0].user[0].mobile, msg);
                                }
                            }
                        }
                        res.status(200).send();

                    });
            });
        }
    });
}