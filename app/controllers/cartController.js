var Cart = require('../models/cart.js');
var CartItem = require('../models/cartItem.js');
var _ = require('lodash/core');
var nodemailer = require('nodemailer');
var CartModel = require('../models/cartModel.js');
var ObjectID = require('mongodb').ObjectID;
var Orphans = require('../models/orphanScholarships');
var Students = require('../models/studentSponsorship');
const databaseHelper = require('../utilities/databaseHelper');
const logHelper = require('../utilities/logHelper');

module.exports.checkSponsorships = async function (req, res) {
    if (req.body.items && req.body.items.length) {
        let studentIds = req.body.items.map(item => item.students)[0];
        let orphanIds = req.body.items.map(item => item.orphans)[0];
        try {
            let result = { proceedFurther: true, idsToRemoved: [] };
            if (orphanIds && orphanIds.length) {
                orphanIds = orphanIds.map(id => ObjectID(id));
                orphans = await Orphans.find({ orphans: { $in: orphanIds }, isChanged: { $exists: false } });
                if (orphans && orphans.length) {
                    result = { proceedFurther: false, idsToRemoved: orphans.map(s => s.orphans) };
                }
            }
            if (studentIds && studentIds.length) {
                studentIds = studentIds.map(id => ObjectID(id));
                students = await Students.find({ students: { $in: studentIds }, isChanged: { $exists: false } });
                if (students && students.length) {
                    result = { proceedFurther: false, idsToRemoved: [...result.idsToRemoved, ...students.map(s => s.students)] };
                }
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json(error);
        }
    } else {
        res.status(200).json({ proceedFurther: true })
    }
}
// all Cart list
module.exports.addToCart = function (req, res) {
    var obj = new Object();
    obj.program = req.body.program;
    obj.programSubCategory = req.body.programSubCategory;
    obj.donationDuration = req.body.donationDuration;
    obj.totalAmount = req.body.totalAmount;
    obj.userName = req.body.userName;
    obj.isRecurring = req.body.isRecurring;

    obj.autoRenew = false;

    obj.isRecurringProgram = req.body.isRecurringProgram ? req.body.isRecurringProgram : false;
    obj.isAutoRenew = req.body.isAutoRenew;
    obj.paymentPlan = req.body.paymentPlan;
    obj.totalSubscriptionAmount = req.body.totalSubscriptionAmount


    obj.occasion = req.body.occasion;
    obj.dua = req.body.dua;
    obj.marhomeenName = req.body.marhomeenName;
    obj.calendarForSacrifice = req.body.calendarForSacrifice;
    obj.sdoz = req.body.sdoz;
    obj.descend = req.body.descend;
    obj.fitrahSubType = req.body.fitrahSubType;
    obj.sahm = req.body.sahm;
    obj.otherPersonalityName = req.body.otherPersonalityName;
    obj.orphans = req.body.orphans;
    obj.paymentDate = req.body.paymentDate;
    obj.startDate = req.body.startDate;
    obj.endDate = req.body.endDate;
    obj.students = req.body.students;
    obj.count = req.body.count;
    obj.countryOfResidence = req.body.countryOfResidence;
    obj.paymentType = req.body.paymentType;
    obj.occasion = req.body.occasion;
    obj.dua = req.body.dua;
    obj.currency = req.body.currency;
    obj.comment = req.body.comment;
    obj.otherFieldForNiyaz = req.body.otherFieldForNiyaz;
    obj.performLocation = req.body.performLocation;
    obj.aqiqaChildName = req.body.aqiqaChildName;
    obj.orphanIds = req.body.orphanIds;
    obj.orphanGiftDescription = req.body.orphanGiftDescription;
    
    var cartObj = new Cart(req.session.cart ? req.session.cart : {});
    cartObj.add(obj);
    req.session.cart = cartObj;
    req.session.save();
    var cartObj2 = new CartModel({ user: req.session._id, cart: JSON.stringify(req.session.cart) });
    if (req.session._id) {
        CartModel.findOne({ user: req.session._id }, (cErr, prevCart) => {
            if (cErr) res.status(400).send(cErr);
            if (prevCart) {
                let oldCart = prevCart && prevCart.cart && JSON.parse(prevCart.cart);
                if (oldCart && oldCart.items && oldCart.items.length) {
                    oldCart.items.push(obj);
                    cartObj.items = oldCart.items;
                }
                req.session.cart = cartObj;
                req.session.save();
                CartModel.update({ user: req.session._id }, { $set: { cart: JSON.stringify(req.session.cart) } }, (e, r) => {
                    if (e) return res.status(503).send(e);
                    else if (r) res.status(201).send("Cart Updated Successfully");

                })
            } else {
                cartObj2.save((e, r) => {
                    if (r) {
                        res.status(201).send("Donation Item added Successfully");
                    };
                    if (e) res.status(503).send(e);
                });
            }
        })
    } else {
        cartObj2.save((e, r) => {
            if (r) {
                res.status(201).send("Donation Item added Successfully");
            };
            if (e) res.status(503).send(e);
        });
    }
    // }
}

module.exports.updateCart = function (req, res) {
    let cartItemstoUpdate = req.body;
    var cartObj = new Cart(req.session.cart ? req.session.cart : {});
    let cartItemsList = cartObj.items;
    cartItemstoUpdate.forEach(function (itemNew, index) {
        if (itemNew) {
            cartItemsList[index].autoRenew = itemNew.autoRenew;
        }
    })
    req.session.cart = cartObj;
    req.session.cart.items = req.body;
    req.session.save();
    // var cartObj2 = new CartModel({ user: req.session._id, cart: JSON.stringify(req.session.cart) });
    if (req.session._id) {
        CartModel.update({ user: req.session._id }, { $set: { cart: JSON.stringify(req.session.cart) } }, (e, r) => {
            if (e) return res.status(503).send(e);
            else if (r) res.status(201).send("Cart Updated Successfully");
            else res.status(201).send("Cart Updated Successfully");
        })
    } else res.status(201).send("Cart Updated Successfully");
}

module.exports.removeMutipleCartItem = async function (req, res) {
    try {
        let resp = 200;
        let cartItems = req.body ? req.body : [];
        for (let i = 0; i < cartItems.length; i++) {
            var obj = new Object();
            obj.program = cartItems[i].program;
            obj.programSubCategory = cartItems[i].programSubCategory;
            obj.totalAmount = cartItems[i].totalAmount;
            obj.userName = cartItems[i].userName;
            obj.isRecurring = cartItems[i].isRecurring;
            obj.index = cartItems[i].index - i;
            let sessionCart = new Cart(req.session.cart);
            if (req.session._id) {
                let findCart = await databaseHelper.getSingleItem(CartModel, { user: req.session._id })
                if (findCart._id) {
                    let oldCart = findCart && findCart.cart && JSON.parse(findCart.cart);
                    let cartObj = new Cart(oldCart ? oldCart : {});
                    if (cartObj.items[obj.index] === sessionCart.items[obj.index]) {
                        cartObj.items.splice(obj.index, 1)
                        cartObj.remove(obj);
                        req.session.cart = cartObj;
                    } else {
                        sessionCart.items.splice(obj.index, 1);
                        sessionCart.remove(obj);
                        req.session.cart = sessionCart;
                    }
                    req.session.save();
                    let updatedCart = await databaseHelper.updateItem(CartModel, { user: req.session._id }, { $set: { cart: JSON.stringify(req.session.cart) } });
                    if (updatedCart._id) {
                        resp = 201;
                    }
                    else {
                        resp = 503;
                    }
                }
                else {
                    res.status(400).send()
                }
            }
            else {
                let cartObj = new Cart(req.session.cart ? req.session.cart : {});
                cartObj.items.splice(obj.index, 1)
                cartObj.remove(obj);
                req.session.cart = cartObj;
                req.session.save();
                resp = 201; //res.status(201).send("Cart Updated Successfully");
            }
        }
        return res.status(resp).send();
    }
    catch (ex) {
        return res.status(resp).send();
    }
}

module.exports.removeCartItem = function (req, res) {

    var obj = new Object();
    obj.program = req.body.cartItem.program;
    obj.programSubCategory = req.body.cartItem.programSubCategory;
    obj.totalAmount = req.body.cartItem.totalAmount;
    obj.userName = req.body.userName;
    obj.isRecurring = req.body.isRecurring;
    obj.index = req.body.index;

    let sessionCart = new Cart(req.session.cart);
    if (req.session._id) {
        CartModel.findOne({ user: req.session._id }, (cErr, prevCart) => {
            if (cErr) res.status(400).send(cErr);
            if (prevCart) {
                let oldCart = prevCart && prevCart.cart && JSON.parse(prevCart.cart);
                let cartObj = new Cart(oldCart ? oldCart : {});
                if (cartObj.items[obj.index] === sessionCart.items[obj.index]) {
                    cartObj.items.splice(obj.index, 1)
                    cartObj.remove(obj);
                    req.session.cart = cartObj;
                } else {
                    sessionCart.items.splice(obj.index, 1);
                    sessionCart.remove(obj);
                    req.session.cart = sessionCart;
                }
                req.session.save();
                CartModel.update({ user: req.session._id }, { $set: { cart: JSON.stringify(req.session.cart) } }, (e, r) => {
                    if (e) return res.status(503).send(e);
                    else if (r) res.status(201).send("Cart Updated Successfully");

                })
            }
        })
    }
    else {
        let cartObj = new Cart(req.session.cart ? req.session.cart : {});
        cartObj.items.splice(obj.index, 1)
        cartObj.remove(obj);
        req.session.cart = cartObj;
        req.session.save();
        res.status(201).send("Cart Updated Successfully");
    }
}
//Get Cart
module.exports.getCart = function (req, res) {
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    // if (req.session._id) {
    //     CartModel.findOne({ user: req.session._id }, (cErr, prevCart) => {
    //         if (cErr) res.status(400).send(cErr);
    //         if (prevCart) {
    //             let oldCart = prevCart && prevCart.cart && JSON.parse(prevCart.cart);
    //             res.status(200).send(oldCart);
    //         } else {
    //             res.status(200).send(cart);
    //         }
    //     })
    // } else
    res.status(200).send(cart);

}

module.exports.clearCart = function (req, res) {
    try {
        CartModel.findOne({
            user: req.session._id
        }, function (err, cartModel) {
            if (cartModel) {
                cartModel.cart = null;
                cartModel.save(function (error) {
                    try {
                        console.log("Step 7:  Clearing user cart");
                        req.session.cart = {};
                        req.session.save();
                    }
                    catch (e) {
                    }
                });
            }
        });
        const redirectUrl = `${req.protocol}://${req.get('host')}`;
        res.redirect(redirectUrl);
    }
    catch (err) {
        console.log(err);
    }
}