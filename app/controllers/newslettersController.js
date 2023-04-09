var Newsletters = require('../models/newsletters.js');
var ObjectID = require('mongodb').ObjectID;
var emailTemplate = require('../../public/js/emailTemplates.js');
var emailTrans = require('../../public/js/emailTransporter.js');
const configuration = require("../../config/configuration.js");
//add subscription
module.exports.addSubscription = function (req, res) {
    Newsletters.findOne({ email: req.body.email }, (err, newsletter) => {
        if (newsletter) {
            return res.status(409).send({
                message: 'You have already subscribed!'
            });
        } else {
            var newsletters = new Newsletters({
                firstName: req.body.firstName || null,
                lastName: req.body.lastName || null,
                email: req.body.email || null,
                country: req.body.country || null,
                subscription: true,
                isActive: true,
                language: req.body.language
            })
            newsletters.save(function (error) {
                if (error) {
                    throw error;
                } else {
                    var name = req.body.firstName + ' ' + req.body.lastName;
                    var subject = "";
                    var html = "";

                    // I changed language from 'ENG' to 'English', 'FRN' to 'Français', 'ARB' to 'عربى'
                    // for binding NEWSLETTER language values with controller

                    if (req.body.language == 'English') {
                        subject = configuration.email.subjectPrefixEng_Frn+' | Newsletter Subscription';
                        html = emailTemplate.newsLetterSubsEng()
                            .replace('[Name]', name)
                    }
                    else if (req.body.language == 'Français') {
                        subject = configuration.email.subjectPrefixEng_Frn+' | Newsletter Subscription FRN';
                        html = emailTemplate.newsLetterSubsFrn()
                            .replace('[Name]', name)
                    }
                    else if (req.body.language == 'عربى') {
                        subject = 'النشرة الاخبارية';
                        html = emailTemplate.newsLetterSubsArb()
                            .replace('[Name]', name)
                    }

                    var options = {
                        from: configuration.email.fromTextEng,
                        to: req.body.email,
                        subject: subject || '',
                        html: JSON.parse(html || '')
                    };
                    emailTrans.trans().sendMail(options, (err, suc) => {
                        if (err) {
                            console.log('News Letter Email error.')
                            res.status(500).send('error')
                        } else {
                            console.log('News Letter Email sent.')
                            res.status(200).send('Sent')
                        }
                    });
                    res.json('Subscription activated Successfully!');
                }
            })
        }
    });
}
//deactivate subscription
module.exports.deactivateSubscription = function (req, res) {
    Newsletters.findOne({ email: req.body.email }, (err, newsletter) => {
        if (newsletter) {
            newsletter.firstName = req.body.firstName || newsletter.firstName;
            newsletter.lastName = req.body.lastName || newsletter.lastName;
            newsletter.email = req.body.email || newsletter.email;
            newsletter.country = req.body.country || newsletter.country;
            newsletter.subscription = false;
            newsletter.updated = Date.now();
            newsletter.language = req.body.language || newsletter.language;
            newsletter.save((err, user) => {
                if (err) {
                    res.status(500).send('Failed to UnSubscribe')
                }
                res.json('Subscription deactivated Successfully!');
            });
        } else {
            return res.status(404).send({
                message: 'Subscription not found!'
            })
        }
    });
}
// list subscription
module.exports.getSubscribesList = function (req, res) {
    Newsletters.find({}, (err, newsLetterList) => {
        if (!err) res.status(200).send(newsLetterList);
        else res.status(400).send('err fetching contact list')

    });
}