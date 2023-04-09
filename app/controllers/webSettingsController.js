var WebSettings = require('../models/webSettings.js');
var ObjectID = require('mongodb').ObjectID;

//add and update representative
module.exports.saveWebSettings = function (req, res) {
    if (req.body._id) {
        WebSettings.findById(req.body._id, (err, webSetting) => {
            if (webSetting) {
                webSetting.webTitle = req.body.webTitle || webSetting.webTitle;
                webSetting.copyRights = req.body.copyRights || webSetting.copyRights;
                webSetting.phone = req.body.phone || webSetting.phone;
                webSetting.email = req.body.email || webSetting.email;
                webSetting.image = req.body.image || webSetting.image;
                webSetting.socialMedia = req.body.socialMedia || webSetting.socialMedia;
                webSetting.updated = Date.now();
                webSetting.save((err, user) => {
                    if (err) {
                        res.status(500).send(err)
                    }
                    res.json('Web Settings updated Successfully!');
                });
            }
            else {
                return res.status(404).send({
                    message: 'Web Settings not found!'
                })
            }
        });
    } else {
        var webSetting = new WebSettings({
            webTitle: req.body.webTitle,
            copyRights: req.body.copyRights || null,
            phone: req.body.phone || null,
            email: req.body.email || null,
            image: req.body.image || null,
            socialMedia: req.body.socialMedia || null,
            isActive: true
        })
        webSetting.save(function (error) {
            if (error) {
                res.status(500).send(error.message);
            }
            else {
                res.json('Web Settings saved Successfully!');
            }
        })
    }
}
// get page content
module.exports.getWebSettings = function (req, res) {
    WebSettings.find({}, function (err, webSetting) {
        if (webSetting && webSetting.length > 0) {
            res.status(200).send(webSetting[0]);
        } else {
            res.status(500).send('No Setting Found!');
        }
    });
}