var PageContent = require('../models/pageContent.js');
var User = require('../models/user');
var ObjectID = require('mongodb').ObjectID;

//add and update page content
module.exports.savePageContent = async function (req, res) {
    if (req.body._id) {
        PageContent.findById(req.body._id, (err, pageContent) => {
            if (pageContent) {
                pageContent.pageName = req.body.pageName || pageContent.pageName;
                pageContent.faqQuestionAnswers = req.body.faqQuestionAnswers || pageContent.faqQuestionAnswers;
                pageContent.faqSupportText = req.body.faqSupportText || pageContent.faqSupportText;
                pageContent.contactGetInTouch = req.body.contactGetInTouch || pageContent.contactGetInTouch;
                pageContent.contactHeadOffice = req.body.contactHeadOffice || pageContent.contactHeadOffice;
                pageContent.contactJoinUsText = req.body.contactJoinUsText || pageContent.contactJoinUsText;
                pageContent.contactSocialMedia = req.body.contactSocialMedia || pageContent.contactSocialMedia;
                pageContent.contactEmailAddress = req.body.contactEmailAddress || pageContent.contactEmailAddress;
                pageContent.homeSlider = req.body.homeSlider || pageContent.homeSlider;
                pageContent.homeCampaignBanners = req.body.homeCampaignBanners || pageContent.homeCampaignBanners;
                pageContent.homeInfoGraphicsBanner = req.body.homeInfoGraphicsBanner || pageContent.homeInfoGraphicsBanner;
                pageContent.homeBanner1 = req.body.homeBanner1 || pageContent.homeBanner1;
                pageContent.homeBanner1CampaignUrl = req.body.campaignUrl || req.body.homeBanner1CampaignUrl || pageContent.homeBanner1CampaignUrl;

                pageContent.homeBanner2 = req.body.homeBanner2 || pageContent.homeBanner2;
                pageContent.homeBanner3 = req.body.homeBanner3 || pageContent.homeBanner3;
                pageContent.titleImage = req.body.titleImage || pageContent.titleImage;
                pageContent.pageDescription = req.body.pageDescription || pageContent.pageDescription;
                pageContent.galleryMedia = req.body.galleryMedia || pageContent.galleryMedia;
                pageContent.language = req.body.language || pageContent.language;
                pageContent.updated = Date.now();
                pageContent.save((err, user) => {
                    if (err) {
                        return res.status(500).send(err)
                    }
                    if (req.body.contactEmailAddress) {
                        User.findOne({ email: req.body.contactEmailAddress }, (uErr, userObj) => {
                            if (uErr) res.status(403).json('User not found, please register user first');
                            if (userObj && userObj.email) {
                                User.update({ email: req.body.contactEmailAddress }, { $set: { contactEmailAddress: req.body.contactEmailAddress } }, function (upErr, upRes) {
                                    if (upErr) res.status(403).json('User not found, please register user first');
                                    else res.json('page content updated Successfully!');
                                })
                            } else {
                                res.status(203).json('User not found, please register user first');
                            }
                        });

                    } else res.json('page content updated Successfully!');
                });
            }
            else {
                return res.status(404).send({
                    message: 'page not found!'
                })
            }
        });
    } else {
        PageContent.findById(req.body._id, (err, pageContent) => {
            if (pageContent) {
                return res.status(409).send({
                    message: 'page name already exist!'
                });
            }
            else {
                var pageContent = new PageContent({
                    pageName: req.body.pageName,
                    faqQuestionAnswers: req.body.faqQuestionAnswers || null,
                    faqSupportText: req.body.faqSupportText || null,
                    contactGetInTouch: req.body.contactGetInTouch || null,
                    contactHeadOffice: req.body.contactHeadOffice || null,
                    contactJoinUsText: req.body.contactJoinUsText || null,
                    contactSocialMedia: req.body.contactSocialMedia || null,
                    contactEmailAddress: req.body.contactEmailAddress || null,
                    homeSlider: req.body.homeSlider || null,
                    homeCampaignBanners: req.body.homeCampaignBanners || null,
                    homeInfoGraphicsBanner: req.body.homeInfoGraphicsBanner || null,
                    homeBanner1: req.body.homeBanner1 || null,
                    homeBanner1CampaignUrl: req.body.campaignUrl || null,
                    homeBanner2: req.body.homeBanner2 || null,
                    homeBanner3: req.body.homeBanner3 || null,
                    titleImage: req.body.titleImage || null,
                    pageDescription: req.body.pageDescription || null,
                    galleryMedia: req.body.galleryMedia || null,
                    language: req.body.language || 'ENG',
                    isActive: true
                })
                pageContent.save(function (error) {
                    if (error) {
                        res.status(500).send(error.message);
                    }
                    else {
                        res.json('page content saved Successfully!');
                    }
                })
            }
        });
    }
}
// update page content
module.exports.updatePageContent = function (req, res) {
    PageContent.findById(req.body._id, (err, pageContent) => {
        if (pageContent) {
            pageContent.pageName = req.body.pageName || pageContent.pageName;
            pageContent.faqQuestionAnswers = req.body.faqQuestionAnswers || pageContent.faqQuestionAnswers;
            pageContent.faqSupportText = req.body.faqSupportText || pageContent.faqSupportText;
            pageContent.contactGetInTouch = req.body.contactGetInTouch || pageContent.contactGetInTouch;
            pageContent.contactHeadOffice = req.body.contactHeadOffice || pageContent.contactHeadOffice;
            pageContent.contactJoinUsText = req.body.contactJoinUsText || pageContent.contactJoinUsText;
            pageContent.contactSocialMedia = req.body.contactSocialMedia || pageContent.contactSocialMedia;
            pageContent.contactEmailAddress = req.body.contactEmailAddress || pageContent.contactEmailAddress;
            pageContent.updated = Date.now();
            pageContent.save((err, user) => {
                if (err) {
                    res.status(500).send(err)
                }
                res.json('page content updated Successfully!');
            });
        } else {
            return res.status(404).send({
                message: 'page not found!'
            })
        }
    });
}
// delete page content
module.exports.deletePageContent = function (req, res) {
    try {
        PageContent.findByIdAndRemove(req.params.Id, function (err, pageContent) {
            let response = {
                message: "page content deleted Successfully!",
                id: pageContent._id
            };
            res.status(200).send(response);
        });
    }
    catch (ex) {
        res.send(ex);
    }

}
// get page content
module.exports.getPageContentByName = function (req, res) {
    PageContent.findOne({ pageName: req.params.pageName, language: req.headers.language }, function (err, pageContent) {
        res.status(200).send(pageContent);
    });
}
module.exports.getAllPageContent = function (req, res) {
    PageContent.find({ language: req.params.language }, function (pErr, pageContent) {
        if (!pErr) {
            res.status(200).send(pageContent);
        }
    })
}