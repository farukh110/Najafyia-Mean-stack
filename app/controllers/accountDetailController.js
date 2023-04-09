var AccountDetail = require('../models/accountDetails.js');
var ObjectID = require('mongodb').ObjectID;
var nodemailer = require('nodemailer');
var async = require('async');
var crypto = require('crypto');
var mongoose = require('mongoose');
//generating hash using for password encryption
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);

//Create AccountDetail
module.exports.addAccountDetail = function (req, res) {
    var accountDetail = new AccountDetail({
        accountHolderName: req.body.accountHolderName,
        cardNumber: req.body.cardNumber,
        expiryMonth: req.body.expiryMonth,
        expiryYear: req.body.expiryYear,
        CVC: req.body.cvc
    });
    accountDetail.save(function (error) {
        if (error) {
            res.status(500).send("Account Details already exists.");
        } else {
            res.status(200).json('Account Detail created Sucessfully!');
        }
    })
}
// update AccountDetail
module.exports.updateAccountDetail = function (req, res) {
    AccountDetail.findById(req.query.AccountDetailId, (err, AccountDetail) => {
        if (err) {
            res.status(500).send(err);
        } else {
            AccountDetail.AccountDetailName = req.body.AccountDetailName || AccountDetail.AccountDetailName;
            AccountDetail.fullName = req.body.fullName || AccountDetail.fullName;
            AccountDetail.email = req.body.email || AccountDetail.email;
            AccountDetail.mobile = req.body.mobile || AccountDetail.mobile;
            AccountDetail.gender = req.body.gender || AccountDetail.gender;
            AccountDetail.address = req.body.address || AccountDetail.address;
            AccountDetail.save((err, AccountDetail) => {
                if (err) {
                    res.status(500).send(err)
                }
                res.json('Account Detail updated Sucessfully');
            });
        }
    });
}
// Delete AccountDetail
module.exports.deleteAccountDetail = function (req, res) {
    AccountDetail.findByIdAndRemove(req.query.AccountDetailId, function (err, AccountDetail) {
        let response = {
            message: "AccountDetail Deleted Sucessfully",
            id: AccountDetail._id
        };
        res.status(200).send(response);
    });
}
//Get Account Detail By Id
module.exports.AccountDetailById = function (req, res) {
    var id = new ObjectID(req.params.id);
    AccountDetail.findOne({ user: id }).exec(function (err, AccountDetail) {
        res.status(200).send(AccountDetail);
    });
}