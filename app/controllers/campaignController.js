var Campaign = require('../models/campaign.js');
var ObjectID = require('mongodb').ObjectID;

//add and update Campaign
module.exports.saveCampaign = function (req, res) {
    if (req.body._id) {
        Campaign.findById(req.body._id, (err, campaign) => {
            if (campaign) {
                if (req.body.isBanner) {
                    campaign.programType = null;
                    campaign.program = null;
                    campaign.programSubCategory = null;
                    campaign.targetAmount = null;
                    campaign.startDate = null;
                    campaign.endDate = null;
                } else {
                    campaign.programType = req.body.programType || campaign.programType;
                    campaign.program = req.body.program || campaign.program;
                    campaign.programSubCategory = req.body.programSubCategory;// || campaign.programSubCategory;
                    campaign.targetAmount = req.body.targetAmount;
                    campaign.startDate = req.body.startDate;
                    campaign.endDate = req.body.endDate;
                }
                campaign.title = req.body.title || campaign.title;
                campaign.description = req.body.description || campaign.description;
                campaign.image = req.body.image || campaign.image;
                campaign.isBanner = req.body.isBanner || false;
                campaign.language = req.body.language || 'ENG';
                campaign.updated = Date.now();
                campaign.displayOrder = req.body.displayOrder || 1;

                campaign.save((err, user) => {
                    if (err) {
                        res.status(500).send(err)
                    }
                    res.json('Campaign updated Successfully!');
                });
            } else {
                return res.status(404).send({
                    message: 'campaign not found!'
                })
            }
        });
    } else {
        Campaign.findById(req.body._id, (err, campaign) => {
            var campaign = new Campaign({
                programType: req.body.programType,
                program: req.body.program,
                programSubCategory: req.body.programSubCategory,
                title: req.body.title || null,
                description: req.body.description || null,
                targetAmount: req.body.targetAmount || null,
                startDate: req.body.startDate || null,
                endDate: req.body.endDate || null,
                image: req.body.image || null,
                isBanner: req.body.isBanner || false,
                language: req.body.language || 'ENG',
                isActive: true,
                displayOrder: req.body.displayOrder || 1
            })
            campaign.save(function (error) {
                if (error) {
                    res.status(500).send(error.message);
                }
                else {
                    res.json('Campaign saved Successfully!');
                }
            })
        });
    }
}
// deActivate campaign
module.exports.deActivateCampaign = function (req, res) {
    try {
        Campaign.findOne({ _id: req.body._id, language: req.body.language }, (err, campaign) => {
            if (campaign) {
                campaign.isActive = req.body.status || false;
                campaign.updated = Date.now();
                campaign.save((err, campaign) => {
                    if (err) {
                        res.status(500).send(err)
                    }
                    var statusMessage = req.body.status == true ? 'Activated' : 'deActivated';
                    res.json('Campaign ' + statusMessage + ' Successfully!');
                });
            } else {
                return res.status(404).send({
                    message: 'Campaign not found!'
                })
            }
        });
    }
    catch (ex) {
        res.send(ex);
    }
}
// delete campaign
module.exports.deleteCampaign = function (req, res) {
    try {
        Campaign.findByIdAndRemove(req.params.Id, function (err, campaign) {
            if (campaign) {
                res.json("Campaign deleted Successfully!");
            } else {
                res.status(500).send("Campaign does not exist!");
            }
        });
    }
    catch (ex) {
        res.send(ex);
    }

}
// get campaign by id
module.exports.getCampaignById = function (req, res) {
    Campaign.findOne({ _id: req.params.Id, language: req.headers.language }, function (err, campaign) {
        res.status(200).send(campaign);
    });
}
// get campaign
module.exports.getCampaignList = function (req, res) {
    Campaign.find({ language: req.headers.language }, function (err, campaign) {
        res.status(200).send(campaign);
    });
}
module.exports.getActiveCampaignList = function (req, res) {
    Campaign.find({ isActive: true, language: req.headers.language }).sort({ displayOrder: 1 }).populate("programType").populate("program").populate("programSubCategory").exec(function (err, campaign) {
        if (campaign) {
            res.status(200).send(campaign);
        } else {
            res.status(500).send("Campaign does not exist!");
        }
    });
}