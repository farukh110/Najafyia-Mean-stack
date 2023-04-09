var User = require('../models/user.js');
var GuestUser = require('../models/guestUser.js');
var Campaign = require('../models/campaign.js');
var DonationRecurring = require('../models/donationRecurring.js');
var Donar = require('../models/donar.js')
var ObjectID = require('mongodb').ObjectID;
const Logs = require('../models/logs');
var nodemailer = require('nodemailer');
var moment = require('moment');
var async = require('async');
var crypto = require('crypto');
var Request = require("request");
var emailTemplate = require('../../public/js/emailTemplates.js');
//generating hash using for password encryption
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
var emailTrans = require('../../public/js/emailTransporter.js');
const emailTemplates = require('../../public/js/emailTemplates.js');
var configuration = require('../../config/configuration');

var transporter = emailTrans.trans();
var smsHelper = require('../utilities/smsHelper');

//Create User
module.exports.addUser = function (req, res) {
    var user = new User({
        userName: req.body.userName,
        fullName: req.body.fullName,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: bcrypt.hashSync(req.body.password, salt),
        countryCode: req.body.countryCode,
        email: req.body.email || null,
        mobile: req.body.mobile || null,
        gender: req.body.gender,
        address: req.body.address || "",
        file: req.body.file || null,
        role: req.body.roles || 'donor',
        language: req.body.language || 'ENG',
        countryOfResidence: req.body.countryOfResidence || null
    });
    User.findOne({
        email: {
            $regex: `^${req.body.email}$`,
            $options: "i"
        }
    }, function (err, userObj) {
        if (userObj) {
            res.status(409).send("Sorry, this user already exists");
            return;
        } else {
            user.save(function (error, user) {
                if (error) {
                    return res.status(error.code == 11000 ? 409 : 400).send("Sorry, this user already exists");
                } else {
                    let subject;
                    let html;
                    if (user.language == "FRN") {
                        if (user.email) {
                            subject = 'Bienvenue à Najafyia Fondation';
                            html = emailTemplate.signUpContentFrn()
                                .replace('[UserEmail]', user.email)
                                .replace('[LOGIN]', `<a href=${process.env.SERVER_URL} + "/#/home">Se connecter</a>`);
                        }
                        if (user.mobile) {
                            let msg = "\x53\x41\x2c\x0a\x42\x69\x65\x6e\x76\x65\x6e\x75\x65\x20\x21\x0a\x56\x6f\x74\x72\x65\x20\x69\x6e\x73\x63\x72\x69\x70\x74\x69\x6f\x6e\x20\x61\x20\xc3\xa9\x74\xc3\xa9\x20\x75\x6e\x20\x73\x75\x63\x63\xc3\xa8\x73\x2e\x0a\x4e\x61\x6a\x61\x66\x79\x69\x61\x20\x46\x6f\x75\x6e\x64\x61\x74\x69\x6f\x6e"
                            smsHelper.sendSMS(user.mobile, msg);
                        }

                    } else if (user.language == "ARB") {
                        if (user.email) {
                            subject = 'أهلا بكم في مؤسسة الأنوار النجفية';
                            html = emailTemplate.signUpContentArb()
                                .replace('[UserEmail]', user.email)
                                .replace('[LOGIN]', `<a href=${process.env.SERVER_URL} + "/#/home">تسجيل الدخول</a>`);

                        }
                        if (user.mobile) {
                            let msg = "\xd9\x86\xd9\x87\xd9\x86\xd8\xa6\xd9\x83\x21\x20\xd9\x84\xd9\x82\xd8\xaf\x20\xd8\xaa\xd9\x85\x20\xd8\xaa\xd8\xb3\xd8\xac\xd9\x8a\xd9\x84\xd9\x83\x20\xd8\xa8\xd9\x86\xd8\xac\xd8\xa7\xd8\xad\x20\xd9\x88\x20\xd9\x8a\xd8\xb3\xd8\xb9\xd8\xaf\xd9\x86\xd8\xa7\x20\xd9\x88\xd8\xac\xd9\x88\xd8\xaf\xd9\x83\x20\xd9\x85\xd8\xb9\xd9\x86\xd8\xa7\x20\xd9\x85\xd8\xa4\xd8\xb3\xd8\xb3\xd8\xa9\x20\xd8\xa7\xd9\x84\xd8\xa3\xd9\x86\xd9\x88\xd8\xa7\xd8\xb1\x20\xd8\xa7\xd9\x84\xd9\x86\xd8\xac\xd9\x81\xd9\x8a\xd8\xa9"
                            smsHelper.sendSMS(user.mobile, msg);
                        }

                    } else {
                        if (user.email) {
                            subject = 'Welcome to Najafyia Foundation';
                            html = emailTemplate.signUpContentEng()
                                .replace('[UserEmail]', user.email)
                                .replace('[LOGIN]', `<a href=${process.env.SERVER_URL} + "/#/home">Login</a>`);
                        }
                        if (user.mobile) {
                            let msg = "Congratulations! Your registration has been successful and we are very pleased to have you on board. Najafyia Foundation"
                            smsHelper.sendSMS(user.mobile, msg);
                        }
                        // res.status(200).send(user);
                    }
                    if (user && user.email) {
                        let options = {
                            from: 'Support@najafyia.org',
                            to: user.email,
                            subject: subject || 'Najafyia Foundation',
                            html: html
                        };
                        transporter.sendMail(options, (err, suc) => {
                            if (err) {

                                Logs.create({
                                    error: {
                                        ...err,
                                        user
                                    }
                                })
                            } else {
                                console.log('New user created... Email  sent.');
                                res.status(200).send(user)
                            }
                        });
                    }

                    // res.redirect('/login');
                }
            })
        }
    })
}
module.exports.addGuestUser = function (req, res) {
    User.findOne({

        $or: [{
            email: {
                $regex: `^${req.body.email}$`,
                $options: "i"
            },
        }, {
            username: {
                $regex: `^${req.body.email}$`,
                $options: "i"
            },
        }]
    }, (userErr, dbUser) => {
        req.session.isGuestUser = true;
        console.log('setting isGuestUser to true' , req.session);
        if (dbUser) res.status(400).send('Sorry, this user already exists');
        else {
            GuestUser.findOne({
                $or: [{
                    email: req.body.email
                }, {
                    username: {
                        $regex: `^${req.body.email}$`,
                        $options: "i"
                    },
                }]
            }, (userErr, gUser) => {
                if (gUser) {
                    Donar.findOne({
                        email: req.body.email
                    }, (err, donar) => {
                        if (err) return res.status(400).send(err);
                        else res.status(409).send(donar);
                    })
                } else {
                    var user = new GuestUser({
                        userName: req.body.userName,
                        fullName: req.body.fullName,
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        password: bcrypt.hashSync(req.body.password || 'najafyia123#', salt),
                        email: req.body.email || null,
                        mobile: req.body.mobile || null,
                        gender: req.body.gender,
                        address: req.body.address || "",
                        file: req.body.file || null,
                        role: req.body.roles || 'donor',
                        language: req.body.language || 'ENG',
                        countryOfResidence: req.body.countryOfResidence || null
                    });
                    user.save(function (error, user) {
                        if (error) {
                            return res.status(400).send(error);
                        } else {
                            res.status(200).send({
                                user,
                                success: true,
                                message: `Welcome ${req.body.fullName}`
                            })
                        }
                    })
                }
            })
        }
    })
}
// update User
module.exports.updateUser = function (req, res) {
    User.findById(req.body._id, (err, user) => {
        if (err) {
            res.status(500).send(err);
        } else {
            user.userName = req.body.userName || user.userName;
            user.fullName = req.body.fullName || user.fullName;
            user.firstName = req.body.firstName || user.firstName;
            user.lastName = req.body.lastName || user.lastName;
            user.password = user.password;
            user.email = req.body.email || user.email;
            //user.role = req.body.roles || 'donor';
            user.mobile = req.body.mobile || user.mobile;
            user.countryCode = req.body.countryCode || user.countryCode;
            user.gender = req.body.gender || user.gender;
            user.address = req.body.address || user.address;
            user.language = req.body.language || user.language;
            user.countryOfResidence = req.body.countryOfResidence || user.countryOfResidence;
            user.file = req.body.file || user.file || null;
            user.save((err, user) => {
                if (err) {
                    res.send(err)
                } else Donar.update({
                    user: req.body._id
                }, {
                    $set: {
                        mobile: req.body.mobile,
                        donarName: req.body.fullName,
                        email: req.body.email,
                        address: req.body.address,
                    }
                }, (dErr, resp) => {
                    if (dErr) res.send(dErr);
                    else res.json('User updated successfully!');
                })
            });
        }

    });
}
// Delete User
module.exports.deleteUser = function (req, res) {
    User.findByIdAndRemove(req.params.userId, function (err, user) {
        if (user) {
            let response = {
                message: "User Deleted Sucessfully",
                id: user._id
            };
            res.status(200).send(response);
        } else res.status(400).send(err);
    });
}
module.exports.getUserList = function (req, res) {
    User.find({}, function (err, user) {
        res.status(200).send(user);
    });
}
module.exports.getSpecificUser = function (req, res) {
    User.findOne({
        _id: req.params.userId
    }, function (err, user) {
        res.status(200).send(user);
    });
}
module.exports.getGuestUserByDonorId = function (req, res) {
    Donar.findOne({
        _id: req.params.userId
    }, function (dErr, donor) {
        if (donor) {
            GuestUser.findOne({
                _id: donor.user
            }, function (err, user) {
                res.status(200).send(user);
            });

        }
    })
}

module.exports.getUser = function (req, res) {
    var token;
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                token = buf.toString('hex');
                done(err, token);
            });
        }
    ])
    User.findOne({
        $or: [{
            email: {
                $regex: `^${req.query.userName}$`,
                $options: "i"
            },
        }, {
            username: {
                $regex: `^${req.query.userName}$`,
                $options: "i"
            },
        }]
    }, function (err, user) {
        if (err) {
            res.status(500).send(err);
        } else {

            if (!user) {
                res.status(400).send({
                    success: false,
                    message: 'email was not found'
                })
            } else {

                // var transporter = nodemailer.createTransport({
                //     service: 'gmail',
                //     auth: {
                //         user: 'ifgowner@gmail.com',
                //         pass: 'binaryvibes'
                //     }
                // });
                let mailOptions = {};
                if (user.language === "ARB") {
                    mailOptions = {
                        from: 'Support@najafyia.org',
                        to: user._doc.email,
                        subject: 'هل نسيت كلمة السر؟',
                        html: emailTemplate.forgotPwdARB(req, token),
                    };
                } else if (user.language === "ENG") {
                    mailOptions = {
                        from: 'Support@najafyia.org',
                        to: user._doc.email,
                        subject: 'Forgot Password?',
                        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                            'https://' + req.headers.host + '/#/reset/' + token + '\n\n' +
                            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                    };
                } else {
                    mailOptions = {
                        from: 'Support@najafyia.org',
                        to: user._doc.email,
                        subject: 'mot de passe oublié?',
                        text: "Vous recevez ceci parce que vous (ou quelqu'un d'autre) avez demandé la réinitialisation du mot de passe de votre compte.\n\n" +
                            "Veuillez cliquer sur le lien suivant ou collez-le dans votre navigateur pour terminer le processus:" +
                            'https://' + req.headers.host + '/#/reset/' + token + '\n\n' +
                            "Si vous ne l'avez pas demandé, veuillez ignorer cet e-mail et votre mot de passe restera inchangé."
                    };
                }
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                        user.resetPasswordToken = token;
                        user.resetPasswordExpires = Date.now() + 3600000;
                        user.save((err, user) => {
                            if (err) {
                                res.status(500).send(err)
                            }
                        });
                        res.status(200).send({
                            success: true,
                            message: 'username has been sent to email'
                        })
                    }
                });
            }
        }
    });
}
module.exports.getLoggedInUserDetails = function (req, res) {
    User.findOne({
        _id: req.session._id
    }, function (err, user) {
        if (user) {
            res.status(200).send(user)
        } else {
            res.status(500).send(err)
        }
    });
}
module.exports.getTodaysCampaign = function (req, res) {

    var fullDate = new Date()
    var twoDigitMonth = ((fullDate.getMonth().length + 1) === 1) ? (fullDate.getMonth() + 1) : '0' + (fullDate.getMonth() + 1);
    var twoDigitDate = fullDate.getDate() <= 9 ? '0' + fullDate.getDate() : fullDate.getDate();
    var currentDate = twoDigitMonth + "/" + twoDigitDate + "/" + fullDate.getFullYear();
    Campaign.find({
        startDate: currentDate
    }, function (err, campaign) {
        if (err != undefined) {
            res.send(err);
        }
        res.status(200).send(campaign);

    });
}
module.exports.getDonarFromUser = function (req, res) {
    Donar.findOne({
        user: {
            '$in': [req.session._id]
        }
    }, function (err, donar) {
        if (err != undefined) {
            res.send(err);
        }
        res.status(200).send(donar);
    });
}
module.exports.getRecurringDonations = function (req, res) {

    var today = new Date();
    var todayIsodate = today.toISOString();

    var twoDaysLater = new Date();
    twoDaysLater.setHours(twoDaysLater.getHours() + 48);
    var twoDaysLaterIsodate = twoDaysLater.toISOString();

    DonationRecurring.find({
        donar: {
            '$in': [req.query.donarId]
        },
        $and: [{
            nextDonationDate: {
                $gte: todayIsodate
            }
        },
        {
            nextDonationDate: {
                $lte: twoDaysLaterIsodate
            }
        }
        ]
    })
        .populate({
            path: 'program',
            model: 'program'
        })
        .exec(function (err, donationRecurring) {
            res.status(200).send(donationRecurring);
        });
}
module.exports.passwordConfirmation = function (req, res) {
    User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
            $gt: Date.now()
        }
    }, function (err, user) {
        if (!user) {
            res.json({
                success: true,
                message: 'Password reset token is invalid or has expired.'
            })

        } else {
            res.json({
                success: true,
                message: user.resetPasswordToken
            })
        }
    });
}
module.exports.updatePassword = function (req, res) {
    User.findOne({
        resetPasswordToken: req.body.resetPasswordToken,
        resetPasswordExpires: {
            $gt: Date.now()
        }
    }, function (err, user) {
        if (err) {
            res.json({
                success: false,
                message: 'err'
            })
        } else if (!user) {
            res.json({
                success: false,
                message: 'Password reset token is invalid or has expired'
            })
        } else {
            user.password = bcrypt.hashSync(req.body.password, salt);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            user.save((err, user) => {
                if (err) {
                    res.json({
                        success: false,
                        message: err
                    })
                } else {
                    let subject;
                    let html;
                    if (user.language == "FRN") {
                        if (user.email) {
                            subject = configuration.email.subjectPrefixEng_Frn+' | Mot de passe réinitialisé';
                            html = emailTemplate.passResetFrn()
                                .replace('[Name]', user.userName);
                        }
                        if (user.mobile) {
                            let msg = "\x53\x41\x2C\x20\x42\x72\x61\x76\x6F\x20\x21\x20\x56\x6F\x75\x73\x20\x61\x76\x65\x7A\x20\x72\xC3\xA9\x69\x6E\x69\x74\x69\x61\x6C\x69\x73\xC3\xA9\x20\x76\x6F\x74\x72\x65\x20\x6D\x6F\x74\x20\x64\x65\x20\x70\x61\x73\x73\x65\x20\x61\x76\x65\x63\x20\x73\x75\x63\x63\xC3\xA8\x73\x2E\x0A\x4E\x46"
                            smsHelper.sendSMS(user.mobile, msg, (error, response, body) => {
                                if (error) {
                                    return console.dir(error);
                                }
                                res.json({
                                    success: true,
                                    message: 'Sms sent to : ' + user._doc.mobile
                                })
                            });
                        }

                    } else if (user.language == "ARB") {
                        if (user.email) {
                            subject = 'إعادة ضبط كلمة المرور';
                            html = emailTemplate.passResetArb()
                                .replace('[Name]', user.userName)
                        }
                        if (user.mobile) {
                            //Text
                            let msg = "%u0627%u0644%u0633%u0644%u0627%u0645%20%u0639%u0644%u064A%u0643%u0645%2C%20%u0646%u0647%u0646%u0626%u0643%21%20%u062A%u0645%20%u0625%u0639%u0627%u062F%u0629%20%u062A%u0639%u064A%u064A%u0646%20%u0643%u0644%u0645%u0629%20%u0627%u0644%u0645%u0631%u0648%u0631%20%u0627%u0644%u062E%u0627%u0635%u0629%20%u0628%u0643%20%u0628%u0646%u062C%u0627%u062D.%20%u0645%u0624%u0633%u0633%u0629%20%u0627%u0644%u0623%u0646%u0648%u0627%u0631%20%u0627%u0644%u0646%u062C%u0641%u064A%u0629"
                            smsHelper.sendSMS(user._doc.mobile ? user._doc.mobile : user.mobile, msg, (error, response, body) => {
                                if (error) {
                                    return console.dir(error);
                                }
                                res.json({
                                    success: true,
                                    message: 'Sms sent to : ' + user._doc.mobile
                                })
                            });
                        }

                    } else {
                        if (user.email) {
                            subject = configuration.email.subjectPrefixEng_Frn+' | Password Reset';
                            html = emailTemplate.passResetEng()
                                .replace('[Name]', user.userName)
                        }
                        if (user.mobile) {
                            //Text
                            let msg = "Salamun Alaykum, Congratulations! Your password has been successfully reset. Najafyia Foundation"
                            smsHelper.sendSMS(user._doc.mobile ? user._doc.mobile : user.mobile, msg, (error, response, body) => {
                                if (error) {
                                    return console.dir(error);
                                }
                                res.json({
                                    success: true,
                                    message: 'Sms sent to : ' + user._doc.mobile
                                })
                            });
                        }

                    }
                    if (user && user.email) {
                        let options = {
                            from: 'Support@najafyia.org',
                            to: user._doc.email,
                            subject: subject || 'Najafyia Foundation',
                            html: JSON.parse(html)
                        };
                        transporter.sendMail(options, (err, suc) => {
                            if (err) {
                                res.status(500).send('error')
                            } else {
                                let successMessage;
                                if (user.language == "ARB") {
                                    successMessage = "لقد تم تغير كلمة السر بنجاح"
                                } else if (user.language == "FRN") {
                                    successMessage = "le mot de passe a été changé avec succès"
                                } else {
                                    successMessage = "password has been changed successfully"
                                }
                                console.log('Email  sent.')
                                res.json({
                                    success: true,
                                    message: successMessage
                                })
                            }
                        });
                    }

                }
            });
        }
    });
}