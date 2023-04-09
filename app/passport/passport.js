var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var loginController = require('../controllers/loginController');
var User = require('../models/user');
var Donar = require('../models/donar.js');
var session = require('express-session');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectID = require('mongodb').ObjectID;

var options = {
    successRedirect: '/#/socialLoginSucess',
    failureRedirect: '/#/home'
};


//generating hash using for password encryption
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
var userDetail = {};

module.exports = function (app, passport) {

    app.use(passport.initialize());
    app.use(passport.session());
    app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: true, cookie: { secure: false } }));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    // *********** FACEBOOK LOGIN ***********///
    passport.use(new FacebookStrategy({
        clientID: '647670479137175',
        clientSecret: 'edd20440c01f62c3b004fb2c6ac82875',
        //server
        //callbackURL: "https://110.93.228.234:8443/auth/facebook/callback",
        //local
        callbackURL: "https://najafyia.com/auth/facebook/callback",
        profileFields: ['id', 'name', 'address', 'emails', 'gender', 'location', 'displayName', 'photos']
    },
        function (accessToken, refreshToken, profile, done) {
            console.log(profile);
            User.findOne({ email: profile._json.email }).select('username password email').exec(function (err, user) {
                if (err) done(err);

                if (user && user != null) {
                    done(null, profile);
                } else {
                    var user = new User({
                        userName: profile._json.email,
                        fullName: profile._json.first_name + " " + profile._json.last_name,
                        password: bcrypt.hashSync(profile.id, salt),
                        email: profile._json.email,
                        mobile: profile._json.mobile,
                        gender: profile._json.gender,
                        role: 'donor',
                        language: 'ENG',

                    });
                    user.save(function (err, res) {
                        if (err) {
                            done(err);
                        }
                        else {
                            var donar = new Donar({
                                donarName: profile._json.first_name + " " + profile._json.last_name,
                                email: profile._json.email,
                                mobile: profile._json.mobile,
                                address: profile._json.address,
                                user: new ObjectID(res.id),
                                country: profile._json.country,
                                accountDetails: []
                            });
                            donar.save(function (err, res) {
                                if (err) {
                                    return done(err);
                                }
                                else {
                                    done(null, profile);
                                }
                            })
                        }
                    });
                }
            });
        }
    ));

    /*  app.get('/auth/facebook/callback', passport.authenticate('facebook', options), function (req, res) {
           console.log(res);
           res.redirect('/')
       });*/

    app.get('/auth/facebook/callback', passport.authenticate('facebook'), function (req, res) {
        res.redirect('/#/socialLoginSucess/' + req.user._json.email + "/true");
    });

    app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' })
    );
    // *********** FACEBOOK LOGIN ***********///

    // ******************  GOOGLE LOGIN **********************//
    passport.use(new GoogleStrategy({
        //new clientId
        //129230968676-vcvva2ba6qb4tfog0a0cc0g5tlaqc9cm.apps.googleusercontent.com
        //old client
        //991846047396-87seed4gbmh16ps6stprhe4efkrrgbll.apps.googleusercontent.com
        clientID: '1031878176382-as7b4hok51j1dv1lmk6bn33q6ji9h0hr.apps.googleusercontent.com',
        clientSecret: 'ZV6lcjIcKaj-Eeif551Fmgo9-',
        //new secret
        //jzGHVPXYdR09QAWI6Vg466i-
        //old secret
        //q1KgC3bFfpFUwhxNEYCqrQir
        callbackURL: "https://najafyia.com/auth/google/callback",
        //https://110.93.228.234.xip.io:8443/auth/google/callback
        //https://110.93.228.234:8443/auth/google/callback
        includeEmail: true
    },
        function (accessToken, refreshToken, profile, done) {
            User.findOne({ email: profile._json.emails[0].value }).select('username password email').exec(function (err, user) {
                if (err) done(err);

                if (user && user != null) {
                    done(null, profile);
                } else {
                    var user = new User({
                        userName: profile._json.emails[0].value,
                        fullName: profile._json.displayName,
                        password: bcrypt.hashSync(profile.id, salt),
                        email: profile._json.emails[0].value,
                        gender: profile._json.gender,
                        role: 'donar'
                    });

                    user.save(function (err, res, user) {
                        if (err) {
                            done(err);
                        }
                        else {
                            var donar = new Donar({
                                donarName: profile._json.displayName,
                                email: profile._json.emails[0].value,
                                mobile: profile._json.mobile,
                                address: profile._json.address,
                                user: new ObjectID(user.id),
                                country: profile._json.country,
                                accountDetails: []
                            });
                            donar.save(function (error, donar) {
                                if (err) {
                                    return done(err);
                                }
                                else {
                                    done(null, profile);
                                }
                            })
                        }
                    });
                }
            });
            done(null, profile);
        }
    ));

    app.get('/auth/google',
        passport.authenticate('google', {
            scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile']
        }));
    // app.get('/auth/google/callback', passport.authenticate('google', options));

    app.get('/auth/google/callback', passport.authenticate('google'), function (req, res) {
        res.redirect('/#/socialLoginSucess/' + req.user._json.emails[0].value + "/true");

    });


    // ******************  GOOGLE LOGIN **********************//

    // ****************** TWITTER LOGIN **********************//
    // passport.use(new TwitterStrategy({
    //     consumerKey: 'uFNW0nOuIxyu5jqUUAmpRu9Bg',
    //     consumerSecret: 'AZ5BjDU7HPAGM433n3unfaGewLvrQGQVTTxEFlNyAFy8ISt1Sj',
    //     callbackURL: 'http://localhost:3000/auth/twitter/callback',
    //     includeEmail: true
    // },
    //     function (token, tokenSecret, profile, done) {
    //         console.log(profile);
    //         User.findOne({ email: profile._json.email }).select('username password email').exec(function (err, user) {
    //             if (err) done(err);

    //             if (user && user != null) {
    //                 done(null, user);
    //             } else {
    //                 var user = new User({
    //                     userName: profile._json.screen_name,
    //                     fullName: profile._json.name,
    //                     password: bcrypt.hashSync(profile.id, salt),
    //                     email: profile._json.email,
    //                     mobile: profile._json.mobile,
    //                     gender: profile._json.gender,
    //                     address: profile._json.location,
    //                     role: 'Customer'
    //                 })
    //                 user.save(function (err, res) {
    //                     if (err) {
    //                         res.status(500).send(err)
    //                     }
    //                 });
    //             }
    //         });
    //         done(null, profile);
    //     }
    // ));


    // app.get('/auth/twitter', passport.authenticate('twitter'));
    // app.get('/auth/twitter/callback', passport.authenticate('twitter', options));
    // ******************  TWITTER LOGIN **********************//

    return passport;
}