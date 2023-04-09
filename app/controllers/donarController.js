var Donar = require('../models/donar.js');
var User = require('../models/user.js');
var GuestUser = require('../models/guestUser.js');

var ObjectID = require('mongodb').ObjectID;
var nodemailer = require('nodemailer');
var async = require('async');
var crypto = require('crypto');
var mongoose = require('mongoose');
var AccountDetails = require('../models/accountDetails.js');
//generating hash using for password encryption
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);

//Create Donar
module.exports.addDonar = function (req, res) {
    const email = req.body.email;
    try {
        Donar.findOne({ email }, (dErr, donor) => {
            if (dErr) res.status(400).send(dErr);
            if (donor) {             
                User.findOne({ email }, (uErr, user) => {
                    if (uErr) res.status(400).send(uErr);
                    if (user) {                  
                        donor.update({ $set: { user: [user._id], donarName: req.body.fullName } }, (duErr) => {
                            if (duErr) res.status(400).send(duErr);
                            else {
                                GuestUser.remove({ email }, e => {
                                    if (e) res.status(400).send(e);
                                    else {                                
                                        res.status(200).json(donor);
                                        // if (req.body.accountDetail != undefined) {
                                        //     donor.accountDetails = [];
                                        //     let accountdetails = req.body.accountDetail;
                                        //     var accountDetail = new AccountDetails({
                                        //         accountHolderName: accountdetails.accountHolderName,
                                        //         expiryMonth: accountdetails.expiryMonth,
                                        //         expiryYear: accountdetails.expiryYear,
                                        //         CVC: accountdetails.CVC,
                                        //         cardNumber: accountdetails.cardNumber
                                        //     });
                                        //     // accountDetail.save(function (err, accountDetail) {
                                        //     //     donor.accountDetails.push(accountDetail);
                                        //         donor.save(function (error, donar) {
                                        //             if (error) {
                                        //                 throw error;
                                        //                 // return res.status(409).send("Sorry, this user already exists");
                                        //             } else {
                                        //                 res.status(200).json(donar);
                                        //                 // res.redirect('/login');
                                        //             }
                                        //         })
                                        //     // });
                                        // } else res.status(200).json(newDonor);

                                    };
                                })
                            }
                        })
                    } else {
                        res.status(200).send(donor);                      
                    }
                });
            } else {
                var newDonor = new Donar({
                    donarName: req.body.fullName || req.body.email.split('@')[0],
                    email: req.body.email,
                    mobile: req.body.mobile,
                    address: req.body.address || "",
                    user: req.body.user,
                    country: req.body.country,
                    // customerId : req.body.email
                });
                newDonor.accountDetails = [];
                let accountdetails = req.body.accountDetail;            
                if (req.body.accountDetail != undefined) {                  
                    // var accountDetail = new AccountDetails({
                    //     accountHolderName: accountdetails.accountHolderName,
                    //     expiryMonth: accountdetails.expiryMonth,
                    //     expiryYear: accountdetails.expiryYear,
                    //     CVC: accountdetails.CVC,
                    //     cardNumber: accountdetails.cardNumber
                    // });
                    // accountDetail.save(function (err, accountDetail) {
                    //     newDonor.accountDetails.push(accountDetail);
                    newDonor.save(function (error, dnr) {
                        if (error) {
                            res.status(500).send(error);
                            // return res.status(409).send("Sorry, this user already exists");
                        } else {
                            res.status(200).json(dnr);
                            // res.redirect('/login');
                        }
                    })
                    // });
                } else {
                    newDonor.save(function (error, dnr) {
                        if (error) {
                            // return res.status(409).send("Sorry, this user already exists");
                            res.status(500).send(error);
                                        } else {                      
                            res.status(200).json(dnr);
                            // res.redirect('/login');
                        }
                    })
                }
            }
        })
    } catch (error) {
        res.status(500).send(error);
    }

}
// update Donar
module.exports.updateDonar = function (req, res) {
    Donar.findById(req.body._id, (err, donar) => {
        if (err) {
            res.status(500).send(err);
        } else {
            // let accountDetail = new AccountDetails({
            //     accountHolderName: req.body.accountDetail.accountHolderName,
            //     cardNumber: req.body.accountDetail.cardNumber,
            //     expiryMonth: req.body.accountDetail.expiryMonth,
            //     expiryYear: req.body.accountDetail.expiryYear,
            //     CVC: req.body.accountDetail.CVC
            // });
            // accountDetail.save(function (err) {
            //     if (err) {

            //     }
            // });
            donar.donarName = req.body.fullName || (req.body.accountDetail && req.body.accountDetail.accountHolderName) || donar.donarName;
            donar.email = req.body.email || donar.email;
            donar.mobile = req.body.mobile || donar.mobile;
            donar.countryCode = req.body.countryCode || donar.countryCode;
            donar.address = req.body.address || donar.address;
            // donar.accountDetails.push(accountDetail);
            donar.save((err, donar) => {
                if (err) {
                    res.status(500).send(err)
                } else {
                    res.json('Donor updated Successfully');
                }
            });
        }

    });
}
// Delete Donar
module.exports.deleteDonar = function (req, res) {
    Donar.findByIdAndRemove(req.query.DonarId, function (err, Donar) {
        let response = {
            message: "Donar Deleted Sucessfully",
            id: Donar._id
        };
        res.status(200).send(response);
    });
}
//Find Donor by Id
module.exports.donarById = function (req, res) {
    if (req.params.id == undefined) {
        res.status(200).send("No donar");
    } else {
        var id = new ObjectID(req.params.id);

        Donar.findOne({ user: id }).populate('accountDetails').exec(function (err, donar) {
            res.status(200).send(donar);
        });
    }
}
//Get Donar Details by ID
module.exports.donarDetailsById = function (req, res) {
    if (req.params.id == undefined) {
        res.status(200).send("No donar");
    } else {
        var id = new ObjectID(req.params.id);

        Donar.findOne({ accountdetails: id }).populate('accountDetails').exec(function (err, donar) {
            res.status(200).send(donar);
        });
    }
}