var SuggestedDonations = require('../models/suggestedDonations.js');
var ObjectID = require('mongodb').ObjectID;

//add and update Suggested Donation
module.exports.saveSuggestedDonation = function (req, res) {
    if (req.body._id) {
        SuggestedDonations.findById(req.body._id, (err, donation) => {
            if (donation) {
                donation.programType = req.body.programType || donation.programType;
                donation.program = req.body.program || donation.program;
                donation.programSubCategory = req.body.programSubCategory || donation.programSubCategory;
                donation.language = req.body.language || donation.language;
                donation.updated = Date.now();
                donation.save((err, user) => {
                    if (err) {
                        res.status(500).send(err)
                    }
                    res.json('Suggested Donation updated Successfully!');
                });
            }
            else {
                return res.status(404).send({
                    message: 'Suggested Donation not found!'
                })
            }
        });
    } else {
        var suggestedDonation = new SuggestedDonations({
            programType: req.body.programType,
            program: req.body.program,
            programSubCategory: req.body.programSubCategory,
            language:req.body.language,
            isActive: true
        })
        suggestedDonation.save(function (error) {
            if (error) {
                res.status(500).send(error.message);
            }
            else {
                res.json('Suggested Donation saved Successfully!');
            }
        })
    }
}
// delete Suggested Donation
module.exports.deleteSuggestedDonation = function (req, res) {
    try {
        SuggestedDonations.findByIdAndRemove(req.params.Id, function (err, donation) {
            if (donation) {
                res.json("Suggested Donation deleted Successfully!");
            } else {
                res.status(500).send("Suggested Donation does not exist!");
            }
        });
    }
    catch (ex) {
        res.send(ex);
    }

}
// get Suggested Donation List
module.exports.getSuggestedDonations = function (req, res) {
    SuggestedDonations.find({isActive: true, language: req.params.language}).populate("programType").populate("program").populate("programSubCategory").exec(function (err, donation) {
        if (donation) {
            res.status(200).send(donation);
        } else {
            res.status(500).send("Suggested Donations does not exist!");
        }
    });
}