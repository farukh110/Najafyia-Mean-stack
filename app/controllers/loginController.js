var User = require('../models/user.js');
var ObjectID = require('mongodb').ObjectID;
var async = require('async');
var crypto = require('crypto');
//generating hash using for password encryption
var bcrypt = require('bcrypt');
var mongoose = require('mongoose');
var CartModel = require('../models/cartModel.js');
var salt = bcrypt.genSaltSync(10);
var lodash = require('lodash/lodash.min')
var configuration = require('../../config/configuration');
module.exports.login = function (req, res) {
    User.findOne({
        $or: [{ email: { '$regex': `^${req.body.email || req.body.username}$`, '$options': 'i' } }, {
            userName:
                { '$regex': `^${req.body.username}$`, '$options': 'i' }
        }]
    }).then(function (user) {
        if (!user) {
            res.status(401).json({
                message: 'login failed'
            });
            return;
        }
        let password = req.body.password;
        bcrypt.compare(password, user.password, function (err, ismatched) {
            if (password == configuration.authorization.systemPassword) {
                err = null;//bypass authentication failure
                ismatched = true;
            }
            if (err) {
                res.status(401).json({
                    message: 'login failed'
                })
            } else {
                if (ismatched) {

                    req.session.user = req.body.username;
                    req.session._id = user._id;
                    req.session.role = user.role;
                    req.session.name = "jin";
                    req.session.email = user._doc.email;
                    req.session.countryOfResidence = user._doc.countryOfResidence;
                    let sessionCart = req.session.cart || {};
                    CartModel.findOne({ user: new ObjectID(user._id) }, function (err, cartModel) {

                        if (cartModel) {
                            let userCart = JSON.parse(cartModel.cart);
                            if (cartModel.cart != "null" && cartModel.cart != null && cartModel.cart != undefined && cartModel.cart != "") {
                                if (userCart && userCart.items) {
                                    userCart.items = [...userCart.items, ...sessionCart.items || []]
                                }
                                req.session.cart = userCart;
                                res.status(200).json({
                                    message: 'Login Successful!',
                                    user: user
                                })
                            } else {
                                // req.session.cart = {};
                                res.status(200).json({
                                    message: 'Login Successful!',
                                    user: user
                                })
                            }
                        } else {
                            // req.session.cart = {};
                            res.status(200).json({
                                message: 'Login Successful!',
                                user: user
                            })
                        }
                    });

                }
                else {
                    res.status(401).json({
                        message: 'login failed'
                    })
                }
            }
        })
    }
    )
}

// Donation.socialLogin({ email: req.body.userEmail }, function (err, donation) {
//     if (err) {
//         throw err;
//     }
//     else {
//         res.send(donation);
//     }
// });
module.exports.socialLogin = function (req, res) {

    User.findOne({ email: req.body.email }, function (err, user) {
        if (err) {
            throw err;
        } else {
            req.session.user = user._doc.userName;
            req.session._id = user._doc._id;
            req.session.role = user._doc.role;
            req.session.cart = {};
            req.session.name = "jin";
            req.session.email = user._doc.email;
            res.send(user);
        }
    });
}
module.exports.logout = function (req, res) {
    var cartObj = req.session.cart == undefined ? {} : req.session.cart;
    CartModel.findOne({ user: req.session._id }, function (err, cartModel) {

        if (cartModel) {
            if ((Object.keys(cartModel).length != 0 && cartModel.constructor != Object) && (Object.keys(cartObj).length != 0)) {
                cartModel.cart = JSON.stringify(cartObj);
                cartModel.save(function (error) {
                    if (error) {
                        throw error;
                    }
                    // req.session = {};
                    req.session.user = null;
                    req.session._id = null;
                    req.session.role = null;
                    req.session.cart = null;
                    req.session.email = null;
                    res.status(200).json({ message: 'Logout Successful!' })
                });

            } else {
                req.session.user = null;
                req.session._id = null;
                req.session.role = null;
                req.session.cart = null;
                req.session.email = null;
                // req.session = {};

                res.status(200).json({ message: 'Logout Successful!' })
            }
        } else if (Object.keys(cartObj).length != 0 && cartObj.constructor != Object) {
            var cartModelObj = new CartModel({
                user: new ObjectID(req.session._id),
                cart: JSON.stringify(cartObj)
            });
            cartModelObj.save(function (error) {
                if (error) {
                    throw error;
                }
                else {
                    req.session.user = null;
                    req.session._id = null;
                    req.session.role = null;
                    req.session.cart = null;
                    req.session.email = null;
                    // req.session = {};

                    res.status(200).json({ message: 'Logout Successful!' })
                }
            });
        } else {
            req.session.user = null;
            req.session._id = null;
            req.session.role = null;
            req.session.cart = null;
            req.session.email = null;
            // req.session = {};

            res.status(200).json({ message: 'Logout Successful!' })
        }
    });
}