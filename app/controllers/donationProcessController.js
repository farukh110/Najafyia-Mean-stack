var DonationProcess = require('../models/donationProcess.js');
var ObjectID = require('mongodb').ObjectID;

//generating hash using for password encryption
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);

//Create Donation Process
module.exports.addDonationProcess = function (req, res) {
    var donationProcess = new DonationProcess({
        isRecurring: req.body.isRecurring || false,
        donationDuration: req.body.donationDurations || undefined,
        isDuration: req.body.isDuration || false,
        isYearAround: req.body.isYearAround || false,
        isMarhomeenName: req.body.isMarhomeenName || false,
        isCalendar: req.body.isCalendar || false,
        isOtherFieldForNiyaz: req.body.isOtherFieldForNiyaz || false,
        isOtherFieldForRP: req.body.isOtherFieldForRP || false,
        durationStartDate: req.body.durationStartDate || undefined,
        durationEndDate: req.body.durationEndDate || undefined,
        isCount: req.body.isCount || false,
        countMin: req.body.countMin || undefined,
        countMax: req.body.countMax || undefined,
        interval: req.body.interval || undefined,
        isSyed: req.body.isSyed || false,
        isAmount: req.body.isAmount || false,
        isMinimumAmount: req.body.isMinimumAmount || false,
        minimumAmount: req.body.minimumAmount || 0,
        amount: req.body.amount || 0
    })
    donationProcess.save(function (error, donationProcess) {
        if (error) {
            throw error;
        } else {
            res.send(donationProcess);
        }
    })
}
// update DonationProcess
module.exports.updateDonationProcess = function (req, res) {
    DonationProcess.findById(req.body.id, (err, DonationProcess) => {
        if (err) {
            res.status(500).send(err);
        } else {
            DonationProcess.DonationProcessName = req.body.title || DonationProcess.DonationProcessName;
            DonationProcess.DonationProcessContent = req.body.content || DonationProcess.DonationProcessContent;
            DonationProcess.updated = Date.now();
            DonationProcess.save((err, user) => {
                if (err) {
                    res.status(500).send(err)
                }
                res.json('Donation Process updated Sucessfully');
            });
        }
    });
}
// Delete DonationProcess
module.exports.deleteDonationProcess = function (req, res) {
    try {
        DonationProcess.findByIdAndRemove(req.params.Id, function (err, DonationProcess) {
            let response = {
                message: "DonationProcess Deleted Sucessfully",
                id: DonationProcess._id
            };
            res.status(200).send(response);
        });
    }
    catch (ex) {
        res.send(ex);
    }
}
//select all DonationProcesss
module.exports.DonationProcessList = function (req, res) {
    DonationProcess.find({}, function (err, DonationProcesss) {
        res.status(200).send(DonationProcesss);
    });
}
//select DonationProcess by id
module.exports.DonationProcessById = function (req, res) {
    DonationProcess.findById(req.params.Id, function (err, DonationProcesss) {
        res.status(200).send(DonationProcesss);
    });
}