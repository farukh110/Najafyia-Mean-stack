var Donation = require('../models/donation.js');
var DonationDetail = require('../models/donationDetail.js');
var DonationRecurring = require('../models/donationRecurring.js');
var Country = require('../models/country');
var Donar = require('../models/donar.js');
var User = require('../models/user.js');
var Logs = require('../models/logs');
var GuestUser = require('../models/guestUser.js');
var OrphanScholarships = require('../models/orphanScholarships.js');
var StudentSponsorship = require('../models/studentSponsorship.js');
var ObjectID = require('mongodb').ObjectID;
var Cart = require('../models/cart.js');
var CartModel = require('../models/cartModel.js');
var Orphan = require('../models/orphan.js');
var Student = require('../models/studentProfile.js');
var DonationItems = require('../models/donationItems');
var emailTemplate = require('../../public/js/emailTemplates.js');
var emailTrans = require('../../public/js/emailTransporter.js');
var Currency = require('../models/currency');
var genericHelper = require('../utilities/genericHelper');
var moment = require('moment');
var arabicDigit = require('arabic-digits');
// var smtpTransport = require('nodemailer-smtp-transport');
// var xoauth2 = require('xoauth2');
const stripe = require("stripe")(
    process.env.StripeKey
);
const databaseHelper = require('../utilities/databaseHelper.js');
var logHelper = require('../utilities/logHelper');
var Constants = require('../constants');
var configuration = require('../../config/configuration');
const paymentService = require('../services/paymentService')
//generating hash using for password encryption
function insertDonationLog({
    err,
    message,
    data,
    res
}) {
    Logs.create({
        error: {
            ...err,
            items: data.items,
            amount: data.amount
        }
    });
    if (res) {
        res.status(500).json({
            message
        })
    }
}
module.exports.insertDonationInDB = async function (req, res, stripeResponse) {
    try {
        let cart = req.session.cart || req.body;
        if (cart && cart.items && req.body.donar) {
            let invoiceNo = 'AA0001';
            const countryName = req.session.countryOfResidence || req.body.country;
            let country = await Country.findOne({
                $or: [{
                    name: countryName
                },
                {
                    nameARB: countryName
                },
                {
                    nameFRN: countryName
                }
                ]
            });
            if (!country) {
                country = req.body.country;
            }
            const lastDonation = await Donation.findOne({}, {}, {
                sort: {
                    'invoiceNo': -1
                }
            });
            invoiceNo = lastDonation && lastDonation.invoiceNo || invoiceNo;
            let invoiceNum = recieptNumberGenerator(invoiceNo);
            var donation = new Donation({
                invoiceNo: invoiceNum,
                donor: req.body.donar,
                chargeId: req.body.chargeid,
                customerId: req.body.customerid,
                totalAmount: parseInt(req.body.amount).toFixed(2),
                isActive: true,
                isKhums: false,
                documentPath: `public/pdf/Reciept-${req.body.selectedLang}-${invoiceNum}.pdf`,
                created: Date.now(),
                updated: Date.now(),
                currency: req.body.paymentCurrency,
                currencyTitle: req.body.paymentTitle,
                createdBy: 'NA',
                updatedBy: 'NA'
            });
            let donationDetailsSaved = [];
            let donationDetails = cart.items;
            donationDetails.forEach(async function (element) {
                var endDate = Date.now();
                var nextMonth = getNextMonth();
                var startDate = Date.now();
                var noOfPayments = 0;

                if (element.donationDuration) {
                    // Student Sponsorship
                    if (element.program.programName == 'Parrainage scolaire' || element.program.programName == 'Student Sponsorship' || element.program.programName == 'الكفالات الدراسية') {
                        nextMonth = getNextMonth();
                        endDate = new Date(nextMonth.setMonth(nextMonth.getMonth() + element.donationDuration.noOfMonths));
                        endDate = endDate.setDate(endDate.getDate() - 1);
                        noOfPayments = element.donationDuration.noOfMonths - 1;
                    }
                    // Orphan Sponsorship
                    if (element.program.programName == 'Orphan Sponsorship' ||
                        element.program.programName == 'كفالة الأيتام' ||
                        element.program.programName == "Parrainage d'orphelin" ||
                        element.program.programName == 'رعاية الطلاب'
                    ) {
                        nextMonth = getNextMonth(true);
                        startDate = new Date((nextMonth.getMonth() + 1) + '-01-' + nextMonth.getFullYear());
                        const sd = new Date(startDate);
                        endDate = new Date(sd.setMonth(sd.getMonth() + element.donationDuration.noOfMonths - 1));
                        endDate = endDate.setDate(endDate.getDate() - 1);
                        noOfPayments = element.donationDuration.noOfMonths - 1;
                    } else {
                        if (element.donationDuration) {
                            endDate = new Date(new Date((nextMonth.getMonth()) + '-' + new Date().getDate() + '-' + nextMonth.getFullYear()).setMonth(new Date((nextMonth.getMonth()) + '-' + new Date().getDate() + '-' + nextMonth.getFullYear()).getMonth() + (element.donationDuration.noOfMonths - 1))).toDateString();
                            noOfPayments = element.donationDuration.noOfMonths - 1;
                        }
                    }
                } else {
                    if (element.program.programName == 'Higher Education Loans' ||
                        element.program.programName == 'قرض التعليم العالي' ||
                        element.program.programName == 'قروض الدراسات العليا' ||
                        element.program.programName == "Études supérieures") {
                        nextMonth = getNextMonth();
                        if (element.programSubCategory.programSubCategoryName == 'PhD (2.5 Years)' ||
                            element.programSubCategory.programSubCategoryName == 'الدكتوراه (2.5 سنة)' ||
                            element.programSubCategory.programSubCategoryName == 'Doctorat (2.5 Ans)') {
                            endDate = new Date(new Date().setMonth(new Date().getMonth() + 30));
                            noOfPayments = 29;
                        } else if (element.programSubCategory.programSubCategoryName == 'Masters (2 Years)' ||
                            element.programSubCategory.programSubCategoryName == 'سادة 2 سنوات' ||
                            element.programSubCategory.programSubCategoryName == 'الماجستير (2 سنوات)' ||
                            element.programSubCategory.programSubCategoryName == 'Maîtrise (2 Ans)') {
                            endDate = new Date(new Date().setMonth(new Date().getMonth() + 24));
                            noOfPayments = 23;
                        } else {
                            endDate = new Date(new Date().setMonth(new Date().getMonth() + 11));
                            noOfPayments = 11;
                        }
                    } else {
                        if (element.program.programName == 'Parrainage scolaire' || element.program.programName == 'Student Sponsorship' || element.program.programName == 'الكفالات الدراسية') {
                            nextMonth = getNextMonth();
                            endDate = new Date(new Date().setMonth(new Date().getMonth() + 11));
                        }
                        if ((element.program.programName == 'Orphan Sponsorship' ||
                            element.program.programName == 'كفالة الأيتام' ||
                            element.program.programName == `Parrainage d'orphelin` ||
                            element.program.programName == 'رعاية الطلاب')) {
                            nextMonth = getNextMonth(true);
                            startDate = new Date((nextMonth.getMonth() + 1) + '-01-' + nextMonth.getFullYear());
                            const sd = new Date(startDate);
                            endDate = new Date(sd.setMonth(sd.getMonth() + 11));
                        } else {
                            endDate = new Date(new Date((nextMonth.getMonth()) + '-' + new Date().getDate() + '-' + nextMonth.getFullYear()).setMonth(new Date((nextMonth.getMonth()) + '-' + new Date().getDate() + '-' + nextMonth.getFullYear()).getMonth() + 11)).toDateString();
                        }
                        noOfPayments = 11;
                    }
                }
                if (Object.prototype.toString.call(endDate) === "[object Date]") {
                    if (isNaN(endDate.getTime())) {
                        endDate = new Date();
                    }

                } else {
                    endDate = new Date();
                }
                var donationDetail = new DonationDetail({
                    amount: element.totalAmount,
                    donation: donation,
                    program: element.program,
                    programSubCategory: element.programSubCategory,
                    isCampaign: req.body.isCampaign,
                    chargeId: req.body.chargeId,
                    occasion: element.occasion,
                    dua: element.dua,
                    marhomeenName: element.marhomeenName,
                    calendarForSacrifice: element.calendarForSacrifice,
                    sdoz: element.sdoz,
                    isSyed: element.descend,
                    fitrahSubType: element.fitrahSubType,
                    sahm: element.sahm,
                    otherPersonalityName: element.otherPersonalityName,
                    isActive: true,
                    isRecurring: element.isRecurring,
                    autoRenew: element.autoRenew,
                    count: element.count,
                    countryOfResidence: country._id, //element.countryOfResidence
                    created: Date.now(),
                    updated: Date.now(),
                    createdBy: 'NA',
                    updatedBy: 'NA',
                    comments: element.comment,
                    endDate: endDate
                });
                await donationDetail.save(saveDocToMongo);
                donation.donationdetails.push(donationDetail);

                let nextInterval = new Date();

                if (element.program.programName == 'Higher Education Loans' ||
                    element.program.programName == 'قرض التعليم العالي' ||
                    element.program.programName == 'قروض الدراسات العليا' ||
                    element.program.programName == "Prêt pour l'enseignement supérieur") {
                    let nextDatePayment = new Date(nextMonth);
                    nextDatePayment.setMonth(nextDatePayment.getMonth() + 5);
                    nextInterval = new Date(nextDatePayment)
                } else {
                    nextInterval = new Date(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());
                }

                if (element.orphans == undefined && element.students == undefined && element.isRecurring) {
                    let donationRecurring = new DonationRecurring({
                        donationDetails: donationDetail,
                        program: element.program,
                        programSubCategory: element.programSubCategory,
                        donationDuration: element.donationDuration,
                        donar: req.body.donar,
                        customerId: req.body.customerid,
                        count: 1,
                        nextDonationDate: nextInterval,
                        amount: element.totalAmount,
                        isActive: true,
                        endDate: endDate,
                        freezedDate: Date.now(),
                        created: Date.now(),
                        startDate: startDate,
                        noOfPaymentsRemaining: noOfPayments
                    });
                    await donationRecurring.save(saveDocToMongo);
                }

                // }
                //ORPHAN SCHOLARESHIP HERE
                if (element.orphans != undefined) {
                    if (element.orphans.length > 0) {
                        element.orphans.forEach(async function (orphan) {
                            var orphanId = new ObjectID(orphan);
                            const orp = await Orphan.findById(orphanId);
                            orp._id = orphanId; // Some id was in string type, to avoid that this line will help
                            let donationRecurring = new DonationRecurring({
                                donationDetails: donationDetail,
                                program: element.program,
                                programSubCategory: element.programSubCategory,
                                donationDuration: element.donationDuration,
                                donar: req.body.donar,
                                customerId: req.body.customerid,
                                count: 1,
                                nextDonationDate: nextInterval,
                                amount: element.totalAmount / element.orphans.length,
                                isActive: true,
                                orphan: orp,
                                endDate: endDate,
                                freezedDate: Date.now(),
                                created: Date.now(),
                                startDate: startDate,
                                noOfPaymentsRemaining: noOfPayments
                            });
                            await donationRecurring.save();
                            let paymentDate = new Date();
                            if (element.paymentType !== "One Time" && element.paymentType !== "Une fois" && element.paymentType !== "مرة واحدة") {
                                paymentDate = new Date(new Date().getFullYear(), new Date().getMonth() + 11, new Date().getDate())
                            } else paymentDate = endDate;
                            var orphanScholarship = new OrphanScholarships({
                                donar: req.body.donar,
                                donationdetails: donationDetail,
                                startDate: startDate,
                                endDate: endDate,
                                paymentDate: paymentDate,
                                orphans: orphan,
                                currencyTitle: donationDetail.donation.currencyTitle,
                                sponsorshipAmount: element.totalAmount / element.orphans.length
                            });
                            await orphanScholarship.save();
                        });
                    }
                }
                //STUDENT SPONSORSHIP HERE
                if (element.students != undefined) {
                    if (element.students.length > 0) {
                        element.students.forEach(async function (student) {
                            var studentId = new ObjectID(student);
                            const stu = await Student.findById(studentId)
                            stu._id = studentId; // Some id was in string type, to avoid that this line will help
                            let donationRecurring = new DonationRecurring({
                                donationDetails: donationDetail,
                                program: element.program,
                                programSubCategory: element.programSubCategory,
                                donationDuration: element.donationDuration,
                                donar: req.body.donar,
                                customerId: req.body.customerid,
                                count: 1,
                                nextDonationDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                                amount: element.totalAmount / element.students.length,
                                isActive: true,
                                student: stu,
                                endDate: endDate,
                                freezedDate: Date.now(),
                                created: Date.now(),
                                startDate: Date.now(),
                                noOfPaymentsRemaining: noOfPayments
                            });
                            const drResp = await donationRecurring.save();
                            if (drResp) {
                                await Student.update({
                                    studentId: stu.studentId
                                }, {
                                    $set: {
                                        priority: 1
                                    }
                                });
                            }
                            let paymentDate = new Date();
                            if (element.paymentType !== "One Time" && element.paymentType !== "Une fois" && element.paymentType !== "مرة واحدة") {
                                paymentDate = new Date(new Date().getFullYear(), new Date().getMonth() + 5, new Date().getDate())
                            } else paymentDate = endDate;
                            var studentSponsorship = new StudentSponsorship({
                                donar: req.body.donar,
                                donationdetails: donationDetail,
                                startDate: new Date(),
                                endDate: endDate,
                                paymentDate: paymentDate,
                                students: student,
                                currencyTitle: donationDetail.donation.currencyTitle,
                                sponsorshipAmount: element.totalAmount / element.students.length
                            });
                            await studentSponsorship.save();
                        });
                    }
                }
            }, this);
            await donation.save(saveDocToMongo);
            sendEmailWithReciept(req, invoiceNum, 'ND', donation);

            if (!stripeResponse) {
                const cartModel = await CartModel.findOne({
                    user: req.session._id
                });
                if (cartModel) {
                    cartModel.cart = null;
                    await cartModel.save(saveDocToMongo);
                }
                req.session.cart = {};
                req.session.save();
                let message = `Your donation of ${donation.currencyTitle} ${donation.totalAmount} has been successfully processed.`;
                message += "An email receipt has been sent to " + req.session.donarEmailWithoutLogin || req.session.email;
                res.status(200).send({
                    title: 'Success',
                    message
                });
            }
            // res.redirect('/donation/successful/' + message);
        } else {
            if (!stripeResponse) {
                res.status(404).send({
                    title: 'Donation not Found',
                    message: "No Items found in donation, either donation has been performed or the session has been expired please contact info@najafyia.org"
                });
            }
        }
    } catch (error) {
        await insertDonationLog({
            err: error,
            message: error && error.message,
            data: req.body
        })
    }
}
async function saveDocToMongo(err, doc) {
    try {
        if (err) throw err;
        else return doc;
    } catch (error) {
        await insertDonationLog({
            err: error,
            message: error && error.message,
            data: {}
        })
    }
}
async function insertDonationInDB(req, res, stripeResponse) {
    let isProcessed = false;
    let datetime;
    let payment_intent_id;
    try {

        datetime = req.datetime
        payment_intent_id = req.payment_intent_id;

        let cart = req.session.cart || req.body;
        if (cart && cart.items && req.body.donar) {
            let invoiceNo = 'AA0001';
            const countryName = req.session.countryOfResidence || req.body.country;
            let country = await Country.findOne({
                $or: [{
                    name: countryName
                },
                {
                    nameARB: countryName
                },
                {
                    nameFRN: countryName
                }
                ]
            });
            if (!country) {
                country = req.body.country;
            }
            const lastDonation = await Donation.findOne({}, {}, {
                sort: {
                    'invoiceNo': -1
                }
            });
            invoiceNo = lastDonation && lastDonation.invoiceNo || invoiceNo;
            let invoiceNum = recieptNumberGenerator(invoiceNo);
            var donation = new Donation({
                invoiceNo: invoiceNum,
                donor: req.body.donar,
                chargeId: req.body.chargeid,
                customerId: req.body.customerid,
                totalAmount: parseInt(req.body.amount).toFixed(2),
                isActive: true,
                isKhums: false,
                documentPath: `public/pdf/Reciept-${req.body.selectedLang}-${invoiceNum}.pdf`,
                created: datetime,
                updated: datetime,
                currency: req.body.paymentCurrency,
                currencyTitle: req.body.paymentTitle,
                createdBy: 'NA',
                updatedBy: 'NA',
                payment_intent_id: payment_intent_id
            });
            let donationDetailsSaved = [];
            let donationDetails = cart.items;
            donationDetails.forEach(async function (element) {
                var endDate = Date.now();
                var nextMonth = getNextMonth();
                var startDate = datetime;
                var noOfPayments = 0;
                if (element.donationDuration) {
                    // Student Sponsorship
                    if (element.program.slug == 'student-sponsorship') {
                        nextMonth = getNextMonth();
                        endDate = new Date(nextMonth.setMonth(nextMonth.getMonth() + element.donationDuration.noOfMonths));
                        endDate = endDate.setDate(endDate.getDate() - 1);
                        noOfPayments = element.donationDuration.noOfMonths - 1;
                    }
                    // Orphan Sponsorship
                    if (element.program.slug == 'orphan-sponsorship') {
                        nextMonth = getNextMonth(true);
                        startDate = new Date((nextMonth.getMonth() + 1) + '-01-' + nextMonth.getFullYear());
                        const sd = new Date(startDate);
                        endDate = new Date(sd.setMonth(sd.getMonth() + element.donationDuration.noOfMonths - 1));
                        endDate = endDate.setDate(endDate.getDate() - 1);
                        noOfPayments = element.donationDuration.noOfMonths - 1;
                    } else {
                        if (element.donationDuration) {
                            endDate = new Date(new Date((nextMonth.getMonth()) + '-' + new Date().getDate() + '-' + nextMonth.getFullYear()).setMonth(new Date((nextMonth.getMonth()) + '-' + new Date().getDate() + '-' + nextMonth.getFullYear()).getMonth() + (element.donationDuration.noOfMonths - 1))).toDateString();
                            noOfPayments = element.donationDuration.noOfMonths - 1;
                        }
                    }
                } else {
                    if (element.program.slug == 'higher-education-loans') {
                        nextMonth = getNextMonth();
                        if (element.programSubCategory.isPhd) {
                            endDate = new Date(new Date().setMonth(new Date().getMonth() + 30));
                            noOfPayments = 29;
                        } else if (!element.programSubCategory.isPhd) {
                            endDate = new Date(new Date().setMonth(new Date().getMonth() + 24));
                            noOfPayments = 23;
                        } else {
                            endDate = new Date(new Date().setMonth(new Date().getMonth() + 11));
                            noOfPayments = 11;
                        }
                    } else {
                        if (element.program.slug == 'student-sponsorship') {
                            nextMonth = getNextMonth();
                            endDate = new Date(new Date().setMonth(new Date().getMonth() + 11));
                        }
                        if ((element.program.slug == 'orphan-sponsorship')) {
                            nextMonth = getNextMonth(true);
                            startDate = new Date((nextMonth.getMonth() + 1) + '-01-' + nextMonth.getFullYear());
                            const sd = new Date(startDate);
                            endDate = new Date(sd.setMonth(sd.getMonth() + 11));
                        } else {
                            endDate = new Date(new Date((nextMonth.getMonth()) + '-' + new Date().getDate() + '-' + nextMonth.getFullYear()).setMonth(new Date((nextMonth.getMonth()) + '-' + new Date().getDate() + '-' + nextMonth.getFullYear()).getMonth() + 11)).toDateString();
                        }
                        noOfPayments = 11;
                    }
                }
                if (Object.prototype.toString.call(endDate) === "[object Date]") {
                    if (isNaN(endDate.getTime())) {
                        endDate = new Date();
                    }

                } else {
                    endDate = new Date();
                }
                let additionalData ={};
                if (element.performLocation) {
                    additionalData.performLocation = element.performLocation;
                }
                if (element.aqiqaChildName) {
                    additionalData.aqiqaChildName = element.aqiqaChildName;
                }

                if (element.orphanIds) {
                    additionalData.orphanIds = element.orphanIds;
                }

                if(element.orphanGiftDescription){
                    additionalData.orphanGiftDescription = element.orphanGiftDescription;
                }
                        
                var donationDetail = new DonationDetail({
                    amount: element.totalAmount,
                    donation: donation,
                    program: element.program,
                    programSubCategory: element.programSubCategory,
                    isCampaign: req.body.isCampaign,
                    chargeId: req.body.chargeId,
                    occasion: element.occasion,
                    dua: element.dua,
                    marhomeenName: element.marhomeenName,
                    calendarForSacrifice: element.calendarForSacrifice,
                    sdoz: element.sdoz,
                    isSyed: element.descend,
                    fitrahSubType: element.fitrahSubType,
                    sahm: element.sahm,
                    otherPersonalityName: element.otherPersonalityName,
                    isActive: true,
                    isRecurring: element.isRecurring,
                    autoRenew: element.autoRenew,
                    count: element.count,
                    countryOfResidence: country._id, //element.countryOfResidence
                    created: datetime,
                    updated: datetime,
                    createdBy: 'NA',
                    updatedBy: 'NA',
                    comments: element.comment,
                    endDate: endDate,
                    additionalData : additionalData
                });
                await donationDetail.save(saveDocToMongo);
                donation.donationdetails.push(donationDetail);

                let nextInterval = new Date();

                if (element.program.slug == 'higher-education-loans') {
                    let nextDatePayment = new Date(nextMonth);
                    nextDatePayment.setMonth(nextDatePayment.getMonth() + 5);
                    nextInterval = new Date(nextDatePayment)
                } else {
                    nextInterval = new Date(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());
                }

                if (element.orphans == undefined && element.students == undefined && element.isRecurring) {
                    let donationRecurring = new DonationRecurring({
                        donationDetails: donationDetail,
                        program: element.program,
                        programSubCategory: element.programSubCategory,
                        donationDuration: element.donationDuration,
                        donar: req.body.donar,
                        customerId: req.body.customerid,
                        count: 1,
                        nextDonationDate: nextInterval,
                        amount: element.totalAmount,
                        isActive: true,
                        endDate: endDate,
                        freezedDate: Date.now(),
                        created: datetime,
                        startDate: startDate,
                        noOfPaymentsRemaining: noOfPayments
                    });
                    await donationRecurring.save(saveDocToMongo);
                }

                // }
                //ORPHAN SCHOLARESHIP HERE
                if (element.orphans != undefined) {
                    if (element.orphans.length > 0) {
                        element.orphans.forEach(async function (orphan) {
                            var orphanId = new ObjectID(orphan);
                            const orp = await Orphan.findById(orphanId);
                            orp._id = orphanId; // Some id was in string type, to avoid that this line will help
                            let donationRecurring = new DonationRecurring({
                                donationDetails: donationDetail,
                                program: element.program,
                                programSubCategory: element.programSubCategory,
                                donationDuration: element.donationDuration,
                                donar: req.body.donar,
                                customerId: req.body.customerid,
                                count: 1,
                                nextDonationDate: nextInterval,
                                amount: element.totalAmount / element.orphans.length,
                                isActive: true,
                                orphan: orp,
                                endDate: endDate,
                                freezedDate: Date.now(),
                                created: datetime,
                                startDate: startDate,
                                noOfPaymentsRemaining: noOfPayments
                            });
                            await donationRecurring.save();
                            let paymentDate = new Date();
                            if (element.paymentType !== "One Time" && element.paymentType !== "Une fois" && element.paymentType !== "مرة واحدة") {
                                paymentDate = new Date(new Date().getFullYear(), new Date().getMonth() + 11, new Date().getDate())
                            } else paymentDate = endDate;
                            var orphanScholarship = new OrphanScholarships({
                                donar: req.body.donar,
                                donationdetails: donationDetail,
                                startDate: startDate,
                                endDate: endDate,
                                paymentDate: paymentDate,
                                orphans: orphan,
                                currencyTitle: donationDetail.donation.currencyTitle,
                                sponsorshipAmount: element.totalAmount / element.orphans.length
                            });
                            await orphanScholarship.save();
                        });
                    }
                }
                //STUDENT SPONSORSHIP HERE
                if (element.students != undefined) {
                    if (element.students.length > 0) {
                        element.students.forEach(async function (student) {
                            var studentId = new ObjectID(student);
                            const stu = await Student.findById(studentId)
                            stu._id = studentId; // Some id was in string type, to avoid that this line will help
                            let donationRecurring = new DonationRecurring({
                                donationDetails: donationDetail,
                                program: element.program,
                                programSubCategory: element.programSubCategory,
                                donationDuration: element.donationDuration,
                                donar: req.body.donar,
                                customerId: req.body.customerid,
                                count: 1,
                                nextDonationDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                                amount: element.totalAmount / element.students.length,
                                isActive: true,
                                student: stu,
                                endDate: endDate,
                                freezedDate: Date.now(),
                                created: datetime,
                                startDate: Date.now(),
                                noOfPaymentsRemaining: noOfPayments
                            });
                            const drResp = await donationRecurring.save();
                            if (drResp) {
                                await Student.update({
                                    studentId: stu.studentId
                                }, {
                                    $set: {
                                        priority: 1
                                    }
                                });
                            }
                            let paymentDate = new Date();
                            if (element.paymentType !== "One Time" && element.paymentType !== "Une fois" && element.paymentType !== "مرة واحدة") {
                                paymentDate = new Date(new Date().getFullYear(), new Date().getMonth() + 5, new Date().getDate())
                            } else paymentDate = endDate;
                            var studentSponsorship = new StudentSponsorship({
                                donar: req.body.donar,
                                donationdetails: donationDetail,
                                startDate: new Date(),
                                endDate: endDate,
                                paymentDate: paymentDate,
                                students: student,
                                currencyTitle: donationDetail.donation.currencyTitle,
                                sponsorshipAmount: element.totalAmount / element.students.length
                            });
                            await studentSponsorship.save();
                        });
                    }
                }
            }, this);
            await donation.save(saveDocToMongo);
            sendEmailWithReciept(req, invoiceNum, 'ND', donation);

            if (!stripeResponse) {
                const cartModel = await CartModel.findOne({
                    user: req.session._id
                });
                if (cartModel) {
                    cartModel.cart = null;
                    await cartModel.save(saveDocToMongo);
                }
                req.session.cart = {};
                req.session.save();
                let message = `Your donation of ${donation.currencyTitle} ${donation.totalAmount} has been successfully processed.`;
                message += "An email receipt has been sent to " + req.session.donarEmailWithoutLogin || req.session.email;
                res.status(200).send({
                    title: 'Success',
                    message
                });

                isProcessed = true;
            }
            // res.redirect('/donation/successful/' + message);
        } else {
            if (!stripeResponse) {
                res.status(404).send({
                    title: 'Donation not Found',
                    message: "No Items found in donation, either donation has been performed or the session has been expired please contact info@najafyia.org"
                });
            }
        }
    } catch (error) {
        await insertDonationLog({
            err: error,
            message: error && error.message,
            data: req.body
        })
    }
    finally {
        return isProcessed;
    }
}

function getItemName(item) {
    const programName = item.program && item.program.programName;
    const subCat = item.programSubCategory && item.programSubCategory.programSubCategoryName || "";
    return `${programName} ${subCat}`;
}

function getItemImage(item) {
    let progImage = item.program && item.program.imageLink;
    progImage = `https://najafyia.org/uploads/${progImage}`;

    if (item.programSubCategory && item.programSubCategory.imageLink) {
        progImage = `https://najafyia.org/uploads/${item.programSubCategory.imageLink}`;
    }
    return progImage;
}

function getPriceArray(items) {
    if (items && items.length) {

        items = items.map(item => {
            const price_data = {
                currency: item.currency.title.toLowerCase() || 'usd',
                product_data: {
                    name: getItemName(item),
                    description: `(${item.count || 1})` + `(${item.program.programName})` + 'x' + `(${item.currency.symbol})` + `(${item.totalAmount})`
                    // images: [getItemImage(item)],
                },
                unit_amount: item.totalAmount / (item.count || 1) * 100,
            };
            if (item.isRecurring) {
                price_data.recurring = {
                    interval: "month",
                    interval_count: 1
                };
                // price_data.type = "recurring";
            }
            return {
                price_data,
                quantity: item.count || 1,
            }
        });
        return items;
    }
}

function getDescriptionString(items) {
    let str = '';
    let totalAmount = 0;
    if (items && items.length) {
        items.forEach(item => {
            str += `(${item.count || 1})` + `(${item.program.programName})` + 'x' + `(${item.currency.symbol})` + `(${item.totalAmount}) |`;
            totalAmount += Math.round(item.totalAmount);
        });
    }
    return str + `(TOTAL AMOUNT:${items && items[0].currency.symbol} ${totalAmount})`;
}

function createCheckoutSession(checkoutObj, res, dId) {
    const methodName = Constants.LogLiterals.CHECKOUT_SESSION_METHOD;

    stripe.checkout.sessions.create(checkoutObj).then(session => {
        logMessage(`${methodName}: Step1: stripe checkout session created`, checkoutObj);
        res.status(200).json({
            status: 'success',
            session
        });
        if (dId) {
            DonationItems.update({
                _id: dId
            }, {
                $set: {
                    'body.paymentIntent': session.payment_intent
                }
            }, (e, r) => {
                if (r)
                    logMessage(`${methodName}: Payment intent saved to Donation Item`, session ? session.payment_intent : '');
                else
                    logMessage(`${methodName}: Error`, e, true);
            })
        }
    }).catch(e => {
        logMessage(`${methodName}: Error`, e, true);
        res.status(400).json(e)
    }
    );
}
async function updateChargesDescription(chargeId, items) {
    await stripe.charges.update(
        chargeId, {
        description: getDescriptionString(items)
    }
    );
}
function encodeURL(unencoded) {
    return encodeURIComponent(unencoded).replace(/'/g, "%27").replace(/"/g, "%22");
}
module.exports.stripeCheckout = async (req, res) => {
    const methodName = Constants.LogLiterals.STRIPE_CHECKOUT_METHOD;

    try {
        logMessage(`${methodName}: Step1: function invoked`, req.body);

        DonationItems.create({
            body: req.body,
            createdBy: req.session && req.session._id
        }, (err, dres) => {
            if (err) {
                logMessage(`${methodName}: Step2: Donation Items not inserted`, req.body);
            } else {
                logMessage(`${methodName}: Step2: Donation Items created`, req.body);
                const hasRecurring = !!req.body.items.find(item => item.isRecurringProgram)
                if (hasRecurring) {
                    const success_url = encodeURL(`${req.protocol}://${req.get('host')}/#/success-checkout/?donationId=${dres._id}`);
                    res.status(200).json({
                        status: 'success',
                        "checkoutPageUrl": `${req.protocol}://${req.get('host')}/#/stripe-checkout?su=${success_url}&di=${dres._id}`
                    });
                }
                else {
                    let userLang = req.query.lang && req.query.lang.toLowerCase().substr(0, 2);
                    if (userLang === 'ar') {
                        userLang = 'en';
                    }
                    const checkoutObj = {
                        payment_method_types: ['card'],
                        success_url: `${req.protocol}://${req.get('host')}/#/success-checkout/?donationId=${dres._id}&session_id={CHECKOUT_SESSION_ID}`,
                        cancel_url: `${req.protocol}://${req.get('host')}/#/cart`,
                        line_items: getPriceArray(req.body.items),
                        mode: 'payment',
                        locale: userLang || 'en'
                    }
                    const hasRecurring = !!checkoutObj.line_items.find(item => item.price_data.recurring)
                    if (hasRecurring) {
                        checkoutObj.mode = 'subscription';
                    }

                    logMessage(`${methodName}: Step3: checkoutObj set`, req.body);

                    if (req.body.donar && req.body.donar.customerId) {
                        checkoutObj.customer = req.body.donar.customerId;
                        return createCheckoutSession(checkoutObj, res, dres._id);
                    } else {
                        stripe.customers.create({
                            email: req.body.donarEmail
                        }).then(cus => {
                            logMessage(`${methodName}: Step4: customer created`, req.body);
                            checkoutObj.customer = cus.id;
                            return createCheckoutSession(checkoutObj, res, dres._id);
                        });
                    }
                }
            }
        })

    } catch (error) {
        logMessage(`${methodName}: Error`, error, true);
        res.status(500).send(error);
    }
}
module.exports.getDonationStatus = async function (req, res) {
    try {
        if (req.query.sessionId || req.query.id) {
            const session = req.query.sessionId ? await stripe.checkout.sessions.retrieve(req.query.sessionId) : null;
            if ((session && session.payment_status === 'paid')
                || (req.query.id && session == null)) {
                //if no req.query.sessionId then its from custom checkout page
                const donationItem = await DonationItems.findOne({
                    _id: req.query.id
                });
                if (donationItem && donationItem.body) {
                    let message = `Your donation of ${donationItem.body.paymentTitle} ${donationItem.body.amount * (donationItem.body.noOfInstallments ? donationItem.body.noOfInstallments : 1)} has been successfully processed.`;
                    message += "An email receipt has been sent to " + donationItem.body.donarEmail;
                    var transaction = await createTransactionDataForGTM(donationItem);

                    res.status(200).send({
                        title: 'Success',
                        message,
                        transaction
                    });
                    CartModel.findOne({
                        user: req.session._id
                    }, function (err, cartModel) {
                        if (cartModel) {
                            cartModel.cart = null;
                            cartModel.save(function (error) {
                                if (error) {
                                    return insertDonationLog({
                                        err: error,
                                        message: "Payment done but cart was not cleared",
                                        res,
                                        data: req.body
                                    })
                                } else {
                                    try {
                                        console.log("Step 7:  Clearing user cart");
                                        req.session.cart = {};
                                        req.session.save();
                                    }
                                    catch (e) {
                                        logHelper.logErrorToFile("Error in clearing user cart", e)
                                    }
                                }
                            });
                        }
                    });
                } else {
                    res.status(404).send({
                        title: 'Success',
                        message: 'Donation has been already performed Kindly check your email or contact info@najafyia.org'
                    })
                }
            } else {
                res.status(404).send({
                    title: 'Donation not perfomed',
                    message: 'Please contact info@najafyia.org'
                })
            }
        }

    } catch (error) {
        res.status(400).send(error);
    }
}
module.exports.performDonation = async (req, res) => {
    const methodName = Constants.LogLiterals.PERFORM_DONATION_METHOD;
    let _isProcessed = false;
    let payment_intent_id;
    let datetime;
    try {
        //log webhook event details into database
        await databaseHelper.insertItem(Constants.Database.Collections.STRIPE_WH_EV.dataKey, { eventType: req.body.type, eventData: req.body.data });
        if (!req.body.type || (req.body.type && req.body.type != Constants.Stripe.Events.PaymentIntentSucceeded))
            return res.status(200).send("Not Implemented");;//don't process if webhook event isn't payment succeeded 

        // fucntion call here to update default card 
        try {
            await paymentService.setCustomerDefaultPaymentMethod(req.body.data.object.customer, req.body.data.object.payment_method);
        }
        catch (ex) {
            logHelper.logError(`doantionController: performDonation : error :  `, ex);
            return false;
        }

        payment_intent_id = req.body.data && req.body.data.object.id;
        logMessage(`${methodName}: Step1: Inside if condition of PaymentIntentSucceeded. Web hook received`, payment_intent_id);

        if (req.query.error) {
            logMessage(`${methodName}: Error performing Donation`, req.query.error, true);
            return res.status(400).send("Error performing Donation");
        } else {
            logMessage(`${methodName}: Finding Cart Items`, req.body.data ? req.body.data : '');

            let item = await updateDonationItem(
                {
                    'body.paymentIntent': payment_intent_id,
                    'state': Constants.Database.DonationItem.State.NotStarted,
                    'body.renewalID': { $exists: false },
                    'body.donProgId': { $exists: false }
                },
                {
                    'state': Constants.Database.DonationItem.State.InProcess
                });
            if (!item) {
                //new checkout flow
                await onNewCheckoutPaymentSucceeded(req, res);
            }
            else if (item) {

                //Strip is returning datetime in unix format
                datetime = genericHelper.convertUnixDateToISOfomrat(req.body.data.object.created);

                //get fresh copy of donation item
                item = await DonationItems.findOne(
                    {
                        'body.paymentIntent': req.body.data && req.body.data.object.id,
                        'state': Constants.Database.DonationItem.State.InProcess
                    });
                logMessage(`${methodName}: Step2: Getting Stripe Payment Intent`, req.body);

                const paymentIntent = {
                    ...req.body.data.object
                };
                req.body = item.body;
                req.payment_intent_id = payment_intent_id;
                req.datetime = datetime;

                const charges = paymentIntent && paymentIntent.charges && paymentIntent.charges.data && paymentIntent.charges.data.length && paymentIntent.charges.data[0];
                await updateChargesDescription(charges.id, req.body.items);
                if (charges && charges.paid) {
                    logMessage(`${methodName}: Step3,4: Payment was successful now retrieving customer, Checking if donor already exists`, req.body);

                    const donor = await Donar.findOne({
                        customerId: charges.customer
                    });

                    if (donor && donor._id) {
                        logMessage(`${methodName}:  Step5: Donor exists performing donation now -> insertDonationInDB`, req.body);
                        _isProcessed = await insertDonationInDB(req, res, true);
                    } else {
                        logMessage(`${methodName}: Step5: Donor not mapped with customerId updating donor now`, req.body);

                        const dres = await Donar.updateOne({
                            _id: req.body.donar._id
                        }, {
                            $set: {
                                customerId: charges.customer
                            }
                        });
                        if (dres) {
                            logMessage(`${methodName}: Step6: Donor updated perfoming donation -> insertDonationInDB`, req.body);
                            _isProcessed = await insertDonationInDB(req, res, true);
                        }
                    }
                }

                //Update isProcessed flag of donationItem after insertDonation: 

                await updateDonationItem(
                    {
                        _id: item._id
                    },
                    {
                        "state": Constants.Database.DonationItem.State.Processed
                    });
                //-------------------------------------------------------------
                res.status(200).send("Hook recieved");
            }
        }

    } catch (error) {
        logMessage(`${methodName}: Error`, error, true);
        res.status(500).send(error);
    }

}

async function onNewCheckoutPaymentSucceeded(req, res) {
    const methodName = Constants.LogLiterals.PROCESS_SUCCESSFULL_PAYMENT;
    let payment_intent_id = req.body.data && req.body.data.object.id;
    let purchaseDatetime;
    try {
        logMessage(`${methodName}: Finding Cart Items`, req.body.data ? req.body.data : '');
        //TODOKH: address multiple subscription when enabled later

        let item = await updateDonationItem(
            {
                'body.items.stripeDetail.payment_intent.id': payment_intent_id,
                'state': Constants.Database.DonationItem.State.NotStarted,
                'body.renewalID': { $exists: false },
                'body.donProgId': { $exists: false }

            },
            {
                'state': Constants.Database.DonationItem.State.InProcess
            });
        if (item) {
            //Strip is returning datetime in unix format
            purchaseDatetime = genericHelper.convertUnixDateToISOfomrat(req.body.data.object.created);
            //get fresh copy of donation item
            item = await DonationItems.findOne(
                {
                    'body.items.stripeDetail.payment_intent.id': req.body.data && req.body.data.object.id,
                    'state': Constants.Database.DonationItem.State.InProcess
                });

            logMessage(`${methodName}: Step2: Getting Stripe Payment Intent`, req.body);
            const paymentIntent = {
                ...req.body.data.object
            };
            const charges = paymentIntent && paymentIntent.charges && paymentIntent.charges.data && paymentIntent.charges.data.length && paymentIntent.charges.data[0];

            // ************************** New Logic **************************
            if (charges && charges.paid) {
                await paymentService.onPaymentSucceeded(item, charges, purchaseDatetime, payment_intent_id);
            }
            // ************************** New Logic **************************
        }
        res.status(200).send("Hook recieved");
    } catch (error) {
        logMessage(`${methodName}: Error`, error, true);
        res.status(500).send(error);
        // console.log("error", error)
    }
}

async function updateDonationItem(queryObj, newValuesObj) {
    const methodName = 'updateDonationItem';
    logMessage(`${methodName}: Starting updates to donation item`, queryObj, newValuesObj);
    let returnObj = null;
    try {
        //console.log(queryObj, newValuesObj);
        const response = await DonationItems.updateOne(queryObj, {
            $set: newValuesObj
        });

        if (response.n > 0)
            returnObj = response;//if update was successful then return not null object
    }
    catch (e) {
        //  console.log("*&&&&^^",e);
        logMessage(`${methodName}: Error`, e, true);
    }
    //  console.log("**********",returnObj);
    return returnObj;
}

module.exports.createCustomer = function (req, res) {
    //req.session.donarEmailWithoutLogin = req.body.donarEmail || req.session.email;
    stripe.customers.create({
        source: req.body.token
    }).then(function (customer) {
        Donar.update({
            email: req.body.donarEmail
        }, {
            $set: {
                customerId: customer.id
            }
        }, (err, uDonrRes) => {
            if (err) return insertDonationLog({
                err,
                message: 'Error while updating donor, no donation inserted',
                data: req.body,
                res
            });

            if (uDonrRes) {
                stripe.charges.create({
                    amount: req.body.amount * 100,
                    customer: customer.id,
                    currency: req.body.paymentTitle,
                    description: getDescriptionString(req.body.items),
                    statement_descriptor: 'Najafyia.org Donation'
                }, function (sErr, charge) {
                    if (sErr) {
                        let code = sErr.code;
                        if (sErr.raw) {
                            code = sErr.raw.decline_code;
                        }
                        return insertDonationLog({
                            err: sErr,
                            message: `'The transaction has been declined with the error code: ${code}. Please contact the card issuing bank for more details`,
                            data: req.body,
                            res
                        });
                    }
                    if (charge && charge.id) {
                        let data = {
                            chargeid: charge.id,
                            customerid: customerid
                        };
                        CartModel.findOne({
                            user: req.session._id
                        }, function (err, cartModel) {
                            if (cartModel) {
                                cartModel.cart = null;
                                cartModel.save(function (error) {
                                    if (error) {
                                        return insertDonationLog({
                                            err: error,
                                            message: "Payment done but cart was not cleared",
                                            res,
                                            data: req.body
                                        })
                                    }
                                });
                            }
                        });
                    }
                });
            }
        })
    }).catch(err => res.status(400).json(err));
}


var customerid = "";
module.exports.checkOut = function (req, res) {
    customerid = req.body.customerid;
    stripe.charges.create({
        amount: req.body.amount * 100,
        customer: req.body.customerid,
        currency: req.body.paymentCurrency,
        description: getDescriptionString(req.body.items),
        statement_descriptor: 'Najafyia.org Donation'
    }, function (err, charge) {
        if (err) {
            return res.status(500).send(err);
        }
        if (charge && charge.id) {
            let data = {
                chargeid: charge.id,
                customerid: customerid
            };
            CartModel.findOne({
                user: req.session._id
            }, function (err, cartModel) {
                if (cartModel) {
                    cartModel.cart = null;
                    cartModel.save(function (error) {
                        if (error) {
                            throw error;
                        }
                        res.status(200).send(data);
                    });
                } else {
                    res.status(200).send(data);
                }
            });
        } else res.status(500).send('Error while processing the payment');
    });
}
//Create New Donation
module.exports.addOrphanDonation = function (req, res) {
    var donation = new Donation({
        // 5a7ea240179f372a54642d87
        donorId: "5a7ea240179f372a54642d87",
        orphan: req.body.seletedOrphan.roles,
        status: 1,
        commitmentDate: req.body.commitmentDate,
        endDate: req.body.commitmentDate,
        amount: req.body.amount,
        totalAmount: Math.floor(req.body.selectedCount) * Math.floor(req.body.amount),
        isActive: true,
        created: Date.now(),
        updated: Date.now(),
        createdBy: 'NA',
        updatedBy: 'NA'
    });
    donation.save(function (error) {
        if (error) {
            throw error;
        } else {

        }

    });
}

function recieptNumberGenerator(oldNumber) {
    if (oldNumber) {
        let alpha = oldNumber.substr(0, 2);
        let nmbr = oldNumber.replace(/^\D+/g, '');
        if (oldNumber.indexOf('inv') > -1) {
            alpha = "AAI";
        }
        nmbr = parseInt(nmbr) + 1;
        if (nmbr <= 9) nmbr = `${alpha}000${nmbr}`;
        else if (nmbr > 9 && nmbr <= 99) nmbr = `${alpha}00${nmbr}`;
        else if (nmbr > 9 && nmbr > 99 && nmbr <= 999) nmbr = `${alpha}0${nmbr}`;
        else if (nmbr > 9 && nmbr > 99 && nmbr > 999 && nmbr <= 9999) nmbr = `${alpha}${nmbr}`;
        else if (nmbr > 9 && nmbr > 99 && nmbr > 999 && nmbr > 9999) {
            nmbr = 0;
            const lastAlpha = alpha[1].charCodeAt() + 1;
            if (lastAlpha > 90) {
                let firstAlpha = alpha[0].charCodeAt();
                alpha = `${String.fromCharCode(firstAlpha + 1)}A`;
            } else {
                alpha = `${alpha[0]}${String.fromCharCode(lastAlpha)}`;
            }
            nmbr = `${alpha}0001`;
        }
        return nmbr;
    } else return "AA0001";
}

function getNextMonth(getFirstDay) {
    var now = new Date();
    if (now.getMonth() == 11) {
        return new Date(now.getFullYear() + 1, 0, 1);
    } else {
        return new Date(now.getFullYear(), now.getMonth() + 1, getFirstDay ? 1 : now.getDate());
    }
}
//Create New Donation
module.exports.addDonation = function (req, res) {
    let cart = req.session.cart;
    let invoiceNo = 'AA0001';
    Country.findOne({
        $or: [{
            name: req.session.countryOfResidence
        },
        {
            nameARB: req.session.countryOfResidence
        },
        {
            nameFRN: req.session.countryOfResidence
        }
        ]
    }, (err, country) => {
        if (!country) {
            country = req.body.country;
        }
        Donation.findOne({}, {}, {
            sort: {
                'invoiceNo': -1
            }
        }, (dErr, lastDonation) => {
            invoiceNo = lastDonation && lastDonation.invoiceNo || invoiceNo;
            let invoiceNum = recieptNumberGenerator(invoiceNo);
            var donation = new Donation({
                invoiceNo: invoiceNum,
                donor: req.body.donar,
                chargeId: req.body.chargeid,
                customerId: req.body.customerid,
                totalAmount: parseInt(req.body.amount).toFixed(2),
                isActive: true,
                isKhums: false,
                documentPath: `public/pdf/Reciept-${req.body.selectedLang}-${invoiceNum}.pdf`,
                created: Date.now(),
                updated: Date.now(),
                currency: req.body.paymentCurrency,
                currencyTitle: req.body.paymentTitle,
                createdBy: 'NA',
                updatedBy: 'NA'
            });
            // donation.save(function (error) {
            //     if (error) {
            //         throw error;
            //     }

            // });
            let donationDetailsSaved = [];
            let donationDetails = cart.items;
            donationDetails.forEach(function (element) {

                var endDate = Date.now();
                var nextMonth = getNextMonth();
                var startDate = Date.now();
                var noOfPayments = 0;

                if (element.donationDuration) {
                    // Student Sponsorship
                    if (element.program.programName == 'Parrainage scolaire' || element.program.programName == 'Student Sponsorship' || element.program.programName == 'الكفالات الدراسية') {
                        nextMonth = getNextMonth();
                        endDate = new Date(nextMonth.setMonth(nextMonth.getMonth() + element.donationDuration.noOfMonths));
                        endDate = endDate.setDate(endDate.getDate() - 1);
                        noOfPayments = element.donationDuration.noOfMonths - 1;
                    }
                    // Orphan Sponsorship
                    if (element.program.programName == 'Orphan Sponsorship' ||
                        element.program.programName == 'كفالة الأيتام' ||
                        element.program.programName == "Parrainage d'orphelin" ||
                        element.program.programName == 'رعاية الطلاب'
                    ) {
                        nextMonth = getNextMonth(true);
                        startDate = new Date((nextMonth.getMonth() + 1) + '-01-' + nextMonth.getFullYear());
                        const sd = new Date(startDate);
                        endDate = new Date(sd.setMonth(sd.getMonth() + element.donationDuration.noOfMonths - 1));
                        endDate = endDate.setDate(endDate.getDate() - 1);
                        noOfPayments = element.donationDuration.noOfMonths - 1;
                    } else {
                        if (element.donationDuration) {
                            endDate = new Date(new Date((nextMonth.getMonth()) + '-' + new Date().getDate() + '-' + nextMonth.getFullYear()).setMonth(new Date((nextMonth.getMonth()) + '-' + new Date().getDate() + '-' + nextMonth.getFullYear()).getMonth() + (element.donationDuration.noOfMonths - 1))).toDateString();
                            noOfPayments = element.donationDuration.noOfMonths - 1;
                        }
                    }
                } else {
                    if (element.program.programName == 'Higher Education Loans' ||
                        element.program.programName == 'قرض التعليم العالي' ||
                        element.program.programName == 'قروض الدراسات العليا' ||
                        element.program.programName == "Études supérieures") {
                        nextMonth = getNextMonth();
                        if (element.programSubCategory.programSubCategoryName == 'PhD (2.5 Years)' ||
                            element.programSubCategory.programSubCategoryName == 'الدكتوراه (2.5 سنة)' ||
                            element.programSubCategory.programSubCategoryName == 'Doctorat (2.5 Ans)') {
                            endDate = new Date(new Date().setMonth(new Date().getMonth() + 30));
                            noOfPayments = 29;
                        } else if (element.programSubCategory.programSubCategoryName == 'Masters (2 Years)' ||
                            element.programSubCategory.programSubCategoryName == 'سادة 2 سنوات' ||
                            element.programSubCategory.programSubCategoryName == 'الماجستير (2 سنوات)' ||
                            element.programSubCategory.programSubCategoryName == 'Maîtrise (2 Ans)') {
                            endDate = new Date(new Date().setMonth(new Date().getMonth() + 24));
                            noOfPayments = 23;
                        } else {
                            endDate = new Date(new Date().setMonth(new Date().getMonth() + 11));
                            noOfPayments = 11;
                        }
                    } else {
                        if (element.program.programName == 'Parrainage scolaire' || element.program.programName == 'Student Sponsorship' || element.program.programName == 'الكفالات الدراسية') {
                            nextMonth = getNextMonth();
                            endDate = new Date(new Date().setMonth(new Date().getMonth() + 11));
                        }
                        if ((element.program.programName == 'Orphan Sponsorship' ||
                            element.program.programName == 'كفالة الأيتام' ||
                            element.program.programName == `Parrainage d'orphelin` ||
                            element.program.programName == 'رعاية الطلاب')) {
                            nextMonth = getNextMonth(true);
                            startDate = new Date((nextMonth.getMonth() + 1) + '-01-' + nextMonth.getFullYear());
                            const sd = new Date(startDate);
                            endDate = new Date(sd.setMonth(sd.getMonth() + 11));
                        } else {
                            endDate = new Date(new Date((nextMonth.getMonth()) + '-' + new Date().getDate() + '-' + nextMonth.getFullYear()).setMonth(new Date((nextMonth.getMonth()) + '-' + new Date().getDate() + '-' + nextMonth.getFullYear()).getMonth() + 11)).toDateString();
                        }
                        noOfPayments = 11;
                    }
                }

                var donationDetail = new DonationDetail({
                    amount: element.totalAmount,
                    donation: donation,
                    program: element.program,
                    programSubCategory: element.programSubCategory,
                    isCampaign: req.body.isCampaign,
                    chargeId: req.body.chargeId,
                    occasion: element.occasion,
                    dua: element.dua,
                    marhomeenName: element.marhomeenName,
                    calendarForSacrifice: element.calendarForSacrifice,
                    sdoz: element.sdoz,
                    isSyed: element.descend,
                    fitrahSubType: element.fitrahSubType,
                    sahm: element.sahm,
                    otherPersonalityName: element.otherPersonalityName,
                    isActive: true,
                    isRecurring: element.isRecurring,
                    autoRenew: element.autoRenew,
                    count: element.count,
                    countryOfResidence: country._id, //element.countryOfResidence
                    created: Date.now(),
                    updated: Date.now(),
                    createdBy: 'NA',
                    updatedBy: 'NA',
                    comments: element.comment,
                    endDate: endDate
                });
                donationDetail.save(function (err) {
                    if (err) {
                        throw err;
                    }
                });
                donation.donationdetails.push(donationDetail);

                //let today = new Date();
                let nextInterval = new Date();

                // if (element.isRecurring != false && element.isRecurring != undefined) {//if recurring
                if (element.program.programName == 'Higher Education Loans' ||
                    element.program.programName == 'قرض التعليم العالي' ||
                    element.program.programName == 'قروض الدراسات العليا' ||
                    element.program.programName == "Prêt pour l'enseignement supérieur") {
                    // today.setMonth(today.getMonth() + 6);
                    // nextInterval = today;
                    let nextDatePayment = new Date(nextMonth);
                    nextDatePayment.setMonth(nextDatePayment.getMonth() + 5);
                    nextInterval = new Date(nextDatePayment)
                    // nextInterval = new Date((nextMonth.getMonth()) + '-' + new Date().getDate() + '-' + nextMonth.getFullYear()).setMonth(new Date((nextMonth.getMonth()) + '-' + new Date().getDate() + '-' + nextMonth.getFullYear()).getMonth() + 5);
                } else {
                    // today.setMonth(today.getMonth() + 1);
                    // nextInterval = today;
                    // if (element.program.programName == 'Orphan Sponsorship'
                    //     || element.program.programName == 'كفالة الأيتام'
                    //     || element.program.programName == `Parrainage d'orphelin`
                    //     || element.program.programName == 'Student Sponsorship'
                    //     || element.program.programName == 'رعاية الطلاب' || element.program.programName == 'الكفالات الدراسية'
                    //     || element.program.programName == 'Parrainage scolaire'
                    // ) {
                    // nextInterval = new Date((nextMonth.getMonth() + 1) + '-01-' + nextMonth.getFullYear()).setMonth(new Date((nextMonth.getMonth() + 1) + '-01-' + nextMonth.getFullYear()).getMonth() + 1);
                    // nextInterval = new Date(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());
                    // }
                    // if (element.program.programName == 'Étudiants hawza' || element.program.programName == 'Hawzah Students' || element.program.programName == 'طلاب الحوزة') {
                    nextInterval = new Date(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());
                    // }
                    // else {
                    // nextInterval = nextMonth;
                    // }
                }

                if (element.orphans == undefined && element.students == undefined && element.isRecurring) {
                    let donationRecurring = new DonationRecurring({
                        donationDetails: donationDetail,
                        program: element.program,
                        programSubCategory: element.programSubCategory,
                        donationDuration: element.donationDuration,
                        donar: req.body.donar,
                        customerId: req.body.customerid,
                        count: 1,
                        nextDonationDate: nextInterval,
                        amount: element.totalAmount,
                        isActive: true,
                        endDate: endDate,
                        freezedDate: Date.now(),
                        created: Date.now(),
                        startDate: startDate,
                        noOfPaymentsRemaining: noOfPayments
                    });
                    donationRecurring.save(function (err) {
                        if (err) {
                            throw err;
                        }
                    });
                }

                // }
                //ORPHAN SCHOLARESHIP HERE
                if (element.orphans != undefined) {
                    if (element.orphans.length > 0) {
                        element.orphans.forEach(function (orphan) {
                            var orphanId = new ObjectID(orphan);
                            Orphan.findById(orphanId, function (err, orp) {
                                orp._id = orphanId; // Some id was in string type, to avoid that this line will help
                                let donationRecurring = new DonationRecurring({
                                    donationDetails: donationDetail,
                                    program: element.program,
                                    programSubCategory: element.programSubCategory,
                                    donationDuration: element.donationDuration,
                                    donar: req.body.donar,
                                    customerId: req.body.customerid,
                                    count: 1,
                                    nextDonationDate: nextInterval,
                                    amount: element.totalAmount / element.orphans.length,
                                    isActive: true,
                                    orphan: orp,
                                    endDate: endDate,
                                    freezedDate: Date.now(),
                                    created: Date.now(),
                                    startDate: startDate,
                                    noOfPaymentsRemaining: noOfPayments
                                });
                                donationRecurring.save(function (err) {
                                    if (err) {
                                        throw err;
                                    }
                                });
                            });
                            let paymentDate = new Date();
                            if (element.paymentType !== "One Time" && element.paymentType !== "Une fois" && element.paymentType !== "مرة واحدة") {
                                paymentDate = new Date(new Date().getFullYear(), new Date().getMonth() + 11, new Date().getDate())
                            } else paymentDate = endDate;
                            var orphanScholarship = new OrphanScholarships({
                                donar: req.body.donar,
                                donationdetails: donationDetail,
                                startDate: startDate,
                                endDate: endDate,
                                paymentDate: paymentDate,
                                orphans: orphan,
                                currencyTitle: donationDetail.donation.currencyTitle,
                                sponsorshipAmount: element.totalAmount / element.orphans.length
                            });
                            orphanScholarship.save(function (err) {
                                if (err) {
                                    throw err;
                                }
                            });
                        });
                    }
                }
                //STUDENT SPONSORSHIP HERE
                if (element.students != undefined) {
                    if (element.students.length > 0) {
                        element.students.forEach(function (student) {
                            var studentId = new ObjectID(student);
                            Student.findById(studentId, function (err, stu) {
                                stu._id = studentId; // Some id was in string type, to avoid that this line will help
                                let donationRecurring = new DonationRecurring({
                                    donationDetails: donationDetail,
                                    program: element.program,
                                    programSubCategory: element.programSubCategory,
                                    donationDuration: element.donationDuration,
                                    donar: req.body.donar,
                                    customerId: req.body.customerid,
                                    count: 1,
                                    nextDonationDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                                    amount: element.totalAmount / element.students.length,
                                    isActive: true,
                                    student: stu,
                                    endDate: endDate,
                                    freezedDate: Date.now(),
                                    created: Date.now(),
                                    startDate: Date.now(),
                                    noOfPaymentsRemaining: noOfPayments
                                });
                                donationRecurring.save(function (err) {
                                    if (err) {
                                        throw err;
                                    } else {
                                        Student.update({
                                            studentId: stu.studentId
                                        }, {
                                            $set: {
                                                priority: 1
                                            }
                                        }, (sErr, stdRes) => {
                                            if (sErr) throw err;
                                        })
                                    }
                                });
                            });
                            let paymentDate = new Date();
                            if (element.paymentType !== "One Time" && element.paymentType !== "Une fois" && element.paymentType !== "مرة واحدة") {
                                paymentDate = new Date(new Date().getFullYear(), new Date().getMonth() + 5, new Date().getDate())
                            } else paymentDate = endDate;
                            var studentSponsorship = new StudentSponsorship({
                                donar: req.body.donar,
                                donationdetails: donationDetail,
                                startDate: new Date(),
                                endDate: endDate,
                                paymentDate: paymentDate,
                                students: student,
                                currencyTitle: donationDetail.donation.currencyTitle,
                                sponsorshipAmount: element.totalAmount / element.students.length
                            });
                            studentSponsorship.save(function (err) {
                                if (err) {
                                    throw err;
                                }
                            });
                        });
                    }
                }
            }, this);
            donation.save(function (err, donation) {
                if (err) {
                    throw err;
                } else {
                    sendEmailWithReciept(req, invoiceNum, 'ND');
                    req.session.cart = {};
                    req.session.save();
                    let message = `Your donation of ${donation.currencyTitle} ${donation.totalAmount} has been successfully processed.`;
                    message += "An email receipt has been sent to " + req.session.donarEmailWithoutLogin || req.session.email + " Please save this for your record.";
                    clearCart(req, res);
                    res.status(200).send(message);
                    // res.redirect('/donation/successful/' + message);
                };
            });

        });
    })
}


module.exports.addDonationDirect = function (req, res) {
    let cart = req.body.cart;
    let invoiceNo = 'AA0001';
    const country = req.body.country;

    Donation.findOne({}, {}, {
        sort: {
            'invoiceNo': -1
        }
    }, (dErr, lastDonation) => {
        invoiceNo = lastDonation && lastDonation.invoiceNo || invoiceNo;
        let invoiceNum = recieptNumberGenerator(invoiceNo);
        var donation = new Donation({
            invoiceNo: invoiceNum,
            donor: req.body.donar,
            chargeId: req.body.chargeid,
            customerId: req.body.customerid,
            totalAmount: parseInt(req.body.amount).toFixed(2),
            isActive: true,
            isKhums: false,
            documentPath: `public/pdf/Reciept-${req.body.selectedLang}-${invoiceNum}.pdf`,
            created: Date.now(),
            updated: Date.now(),
            currency: req.body.paymentCurrency,
            currencyTitle: req.body.paymentTitle,
            createdBy: 'NA',
            updatedBy: 'NA'
        });
        donation.save(function (error) {
            if (error) {
                throw error;
            } else {

            }
        });
        let donationDetailsSaved = [];
        let donationDetails = cart.items;
        donationDetails.forEach(function (element) {

            var endDate = Date.now();
            var nextMonth = getNextMonth();
            var startDate = Date.now();
            var noOfPayments = 0;

            if (element.donationDuration) {
                // Student Sponsorship
                if (element.program.programName == 'Parrainage scolaire' || element.program.programName == 'Student Sponsorship' || element.program.programName == 'الكفالات الدراسية') {
                    nextMonth = getNextMonth();
                    endDate = new Date(new Date().setMonth(new Date().getMonth() + element.donationDuration.noOfMonths));
                    noOfPayments = element.donationDuration.noOfMonths - 1;
                }
                // Orphan Sponsorship
                if (element.program.programName == 'Orphan Sponsorship' ||
                    element.program.programName == 'كفالة الأيتام' ||
                    element.program.programName == "Parrainage d'orphelin" ||
                    element.program.programName == 'رعاية الطلاب'
                ) {
                    nextMonth = getNextMonth(true);
                    noOfPayments = element.donationDuration.noOfMonths - 1;
                    startDate = new Date((nextMonth.getMonth() + 1) + '-01-' + nextMonth.getFullYear())
                    const sd = new Date(startDate);
                    endDate = new Date(sd.setMonth(sd.getMonth() + element.donationDuration.noOfMonths - 1));
                } else {
                    if (element.donationDuration) {
                        endDate = new Date(new Date((nextMonth.getMonth()) + '-' + new Date().getDate() + '-' + nextMonth.getFullYear()).setMonth(new Date((nextMonth.getMonth()) + '-' + new Date().getDate() + '-' + nextMonth.getFullYear()).getMonth() + (element.donationDuration.noOfMonths - 1))).toDateString();
                        noOfPayments = element.donationDuration.noOfMonths - 1;
                    }
                }
            } else {
                if (element.program.programName == 'Higher Education Loans' ||
                    element.program.programName == 'قرض التعليم العالي' ||
                    element.program.programName == 'قروض الدراسات العليا' ||
                    element.program.programName == "Études supérieures") {
                    nextMonth = getNextMonth();
                    if (element.programSubCategory.programSubCategoryName == 'PhD (2.5 Years)' ||
                        element.programSubCategory.programSubCategoryName == 'الدكتوراه (2.5 سنة)' ||
                        element.programSubCategory.programSubCategoryName == 'Doctorat (2.5 Ans)') {
                        endDate = new Date(new Date().setMonth(new Date().getMonth() + 30));
                        noOfPayments = 29;
                    } else if (element.programSubCategory.programSubCategoryName == 'Masters (2 Years)' ||
                        element.programSubCategory.programSubCategoryName == 'سادة 2 سنوات' ||
                        element.programSubCategory.programSubCategoryName == 'الماجستير (2 سنوات)' ||
                        element.programSubCategory.programSubCategoryName == 'Maîtrise (2 Ans)') {
                        endDate = new Date(new Date().setMonth(new Date().getMonth() + 24));
                        noOfPayments = 23;
                    } else {
                        endDate = new Date(new Date((nextMonth.getMonth()) + '-' + new Date().getDate() + '-' + nextMonth.getFullYear()).setMonth(new Date((nextMonth.getMonth()) + '-' + new Date().getDate() + '-' + nextMonth.getFullYear()).getMonth() + 11)).toDateString();
                        noOfPayments = 11;
                    }
                } else {
                    if (element.program.programName == 'Parrainage scolaire' || element.program.programName == 'Student Sponsorship' || element.program.programName == 'الكفالات الدراسية') {
                        nextMonth = getNextMonth();
                        endDate = new Date(new Date().setMonth(new Date().getMonth() + 11));
                    }
                    if ((element.program.programName == 'Orphan Sponsorship' ||
                        element.program.programName == 'كفالة الأيتام' ||
                        element.program.programName == `Parrainage d'orphelin` ||
                        element.program.programName == 'رعاية الطلاب')) {
                        nextMonth = getNextMonth(true);
                        startDate = new Date((nextMonth.getMonth() + 1) + '-01-' + nextMonth.getFullYear());
                        const sd = new Date(startDate);
                        endDate = new Date(sd.setMonth(sd.getMonth() + 11));
                    } else {
                        endDate = new Date(new Date((nextMonth.getMonth()) + '-' + new Date().getDate() + '-' + nextMonth.getFullYear()).setMonth(new Date((nextMonth.getMonth()) + '-' + new Date().getDate() + '-' + nextMonth.getFullYear()).getMonth() + 11)).toDateString();
                    }
                    noOfPayments = 11;
                }
            }

            var donationDetail = new DonationDetail({
                amount: element.totalAmount,
                donation: donation,
                program: element.program,
                programSubCategory: element.programSubCategory,
                isCampaign: req.body.isCampaign,
                chargeId: req.body.chargeId,
                occasion: element.occasion,
                dua: element.dua,
                marhomeenName: element.marhomeenName,
                calendarForSacrifice: element.calendarForSacrifice,
                sdoz: element.sdoz,
                isSyed: element.descend,
                fitrahSubType: element.fitrahSubType,
                sahm: element.sahm,
                otherPersonalityName: element.otherPersonalityName,
                isActive: true,
                isRecurring: element.isRecurring,
                autoRenew: element.autoRenew,
                count: element.count,
                countryOfResidence: country && country._id, //element.countryOfResidence
                created: Date.now(),
                updated: Date.now(),
                createdBy: 'NA',
                updatedBy: 'NA',
                comments: element.comment,
                endDate: endDate
            });
            donationDetail.save(function (err) {
                if (err) {
                    throw err;
                }
            });
            donation.donationdetails.push(donationDetail);
            let today = new Date();
            let nextInterval = new Date();

            // if (element.isRecurring != false && element.isRecurring != undefined) {//if recurring
            if (element.program.programName == 'Higher Education Loans' ||
                element.program.programName == 'قرض التعليم العالي' ||
                element.program.programName == 'قروض الدراسات العليا' ||
                element.program.programName == "Prêt pour l'enseignement supérieur") {
                // today.setMonth(today.getMonth() + 6);
                // nextInterval = today;
                let nextDatePayment = new Date(nextMonth);
                nextDatePayment.setMonth(nextDatePayment.getMonth() + 5);
                nextInterval = new Date(nextDatePayment)
            } else {
                // today.setMonth(today.getMonth() + 1);
                // nextInterval = today;
                if (element.program.programName == 'Orphan Sponsorship' ||
                    element.program.programName == 'كفالة الأيتام' ||
                    element.program.programName == `Parrainage d'orphelin` ||
                    element.program.programName == 'Student Sponsorship' ||
                    element.program.programName == 'رعاية الطلاب' || element.program.programName == 'الكفالات الدراسية' ||
                    element.program.programName == 'Parrainage scolaire') {
                    nextInterval = new Date((nextMonth.getMonth() + 1) + '-01-' + nextMonth.getFullYear()).setMonth(new Date((nextMonth.getMonth() + 1) + '-01-' + nextMonth.getFullYear()).getMonth() + 1);
                } else {
                    nextInterval = nextMonth;
                }
            }

            if (element.orphans == undefined && element.students == undefined && element.isRecurring) {
                let donationRecurring = new DonationRecurring({
                    donationDetails: donationDetail,
                    program: element.program,
                    programSubCategory: element.programSubCategory,
                    donationDuration: element.donationDuration,
                    donar: req.body.donar,
                    customerId: req.body.customerid,
                    count: 1,
                    nextDonationDate: nextInterval,
                    amount: element.totalAmount,
                    isActive: true,
                    endDate: endDate,
                    freezedDate: Date.now(),
                    created: Date.now(),
                    startDate: startDate,
                    noOfPaymentsRemaining: noOfPayments
                });
                donationRecurring.save(function (err) {
                    if (err) {
                        throw err;
                    }
                });
                // }

            }
            //ORPHAN SCHOLARESHIP HERE
            if (element.orphans != undefined) {
                if (element.orphans.length > 0) {
                    element.orphans.forEach(function (orphan) {
                        var orphanId = new ObjectID(orphan);
                        Orphan.findById(orphanId, function (err, orp) {
                            orp._id = orphanId; // Some id was in string type, to avoid that this line will help
                            let donationRecurring = new DonationRecurring({
                                donationDetails: donationDetail,
                                program: element.program,
                                programSubCategory: element.programSubCategory,
                                donationDuration: element.donationDuration,
                                donar: req.body.donar,
                                customerId: req.body.customerid,
                                count: 1,
                                nextDonationDate: nextInterval,
                                amount: element.totalAmount / element.orphans.length,
                                isActive: true,
                                orphan: orp,
                                endDate: endDate,
                                freezedDate: Date.now(),
                                created: Date.now(),
                                startDate: startDate,
                                noOfPaymentsRemaining: noOfPayments
                            });
                            donationRecurring.save(function (err) {
                                if (err) {
                                    throw err;
                                }
                            });
                        });

                        var orphanScholarship = new OrphanScholarships({
                            donar: req.body.donar,
                            donationdetails: donationDetail,
                            startDate: startDate,
                            endDate: endDate,
                            paymentDate: nextInterval,
                            orphans: orphan,
                            currencyTitle: donationDetail.donation.currencyTitle,
                            sponsorshipAmount: element.totalAmount / element.orphans.length
                        });
                        orphanScholarship.save(function (err) {
                            if (err) {
                                throw err;
                            }
                        });
                    });
                }
            }
            //STUDENT SPONSORSHIP HERE
            if (element.students != undefined) {
                if (element.students.length > 0) {
                    element.students.forEach(function (student) {
                        var studentId = new ObjectID(student);
                        Student.findById(studentId, function (err, stu) {
                            stu._id = studentId; // Some id was in string type, to avoid that this line will help

                            let donationRecurring = new DonationRecurring({
                                donationDetails: donationDetail,
                                program: element.program,
                                programSubCategory: element.programSubCategory,
                                donationDuration: element.donationDuration,
                                donar: req.body.donar,
                                customerId: req.body.customerid,
                                count: 1,
                                nextDonationDate: nextInterval,
                                amount: element.totalAmount / element.students.length,
                                isActive: true,
                                student: stu,
                                endDate: endDate,
                                freezedDate: Date.now(),
                                created: Date.now(),
                                startDate: startDate,
                                noOfPaymentsRemaining: noOfPayments
                            });
                            donationRecurring.save(function (err) {
                                if (err) {
                                    throw err;
                                }
                            });
                        });
                        var studentSponsorship = new StudentSponsorship({
                            donar: req.body.donar,
                            donationdetails: donationDetail,
                            startDate: startDate,
                            endDate: endDate,
                            paymentDate: nextInterval,
                            currencyTitle: donationDetail.donation.currencyTitle,
                            students: student,
                            sponsorshipAmount: element.totalAmount / element.students.length
                        });
                        studentSponsorship.save(function (err) {
                            if (err) {
                                throw err;
                            }
                        });
                        // let sponsr = Object.assign({}, req.body.donar);
                        // if (sponsr) {
                        //     Student.findByIdAndUpdate(new ObjectID(student), {
                        //         $set: {
                        //             sponsorName: sponsr.donarName,
                        //             sponsorEmail: sponsr.email,
                        //             donor: new ObjectID(sponsr._id),
                        //             currentDonation: {
                        //                 endDate: endDate,
                        //                 startDate: startDate,
                        //                 amount: element.totalAmount / element.students.length,
                        //                 currency: req.body.paymentCurrency,
                        //             }
                        //         }
                        //     }, (sErr, sRes) => {
                        //         if (sErr) throw sErr;
                        //     });
                        // }
                    });
                }
            }
        }, this);
        donation.save(function (err, donation) {
            if (err) {
                throw err;
            } else {
                // req.session.cart = {};
                // req.session.save();
                sendEmailWithReciept(req, invoiceNum, 'D');
                let message = "Your donation of " + " " + donation.currencyTitle + "&nbsp;" + donation.totalAmount + " has been successfully processed. ";
                message += "An email receipt has been sent to " + req.session.donarEmailWithoutLogin || req.session.email + " Please save this for your record.";
                //clearCart(req, res);
                res.status(200).send(message);
                // res.redirect('/donation/successful/' + message);
            };
        });
    })
}
clearCart = function (req, res) {
    try {
        delete req.session['cart'];
        var newSession = req.session;
    } catch (ex) {
        res.send(ex);
    }
}
// Delete Donation
module.exports.deleteDonation = function (req, res) {
    try {
        Donation.findById(req.params.Id, function (err, Donation) {
            Donation.isActive = !(Donation.isActive);
            Donation.save(function (err, Donation) {

                let response = {
                    message: "Donation Deleted Sucessfully",
                    id: Donation._id
                };
                res.status(200).send(response);
            });
        });
    } catch (ex) {
        res.send(ex);
    }
}
module.exports.getReceiptData = function (req, res) {

    Donation.find({}).populate({
        path: 'donationdetails',
        populate: {
            path: 'programSubCategory',
            model: 'programSubCategory'
        }
    })
        .populate({
            path: 'donationdetails',
            populate: {
                path: 'sahm'
            }
        }).populate({
            path: 'donationdetails',
            populate: {
                path: 'program',
                model: 'program'
            }
        }).populate({
            path: "donor",
            model: "donar",
            populate: {
                path: "user"
            }
        }).sort({
            created: -1
        }).exec(function (err, donation) {
            if (donation && donation.length) {
                res.status(200).send(donation);
            } else res.status(200).send([]);
        });
}
module.exports.getKhumsReceipts = function (req, res) {

    Donation.find({
        'donationdetails.0.program.0': {
            programName: 'Khums'
        }
    }).populate({
        path: "donationdetails",
        populate: {
            path: 'program',
        }
    }).populate({
        path: "donationdetails",
        populate: {
            path: 'programSubCategory',
        }
    }).populate({
        path: "donor",
        model: "donar"
    }).exec(function (err, donation) {
        res.status(200).send(donation);
    });
}
// all related Donations list
module.exports.RelatedDonationList = function (req, res) {
    Donation.find({
        DonationType: req.body.DonationTypeId,
        _id: {
            $ne: req.body.id
        }
    }, function (err, Donations) {
        if (err != undefined) {
            res.send(err);
        }
        res.send(Donations);
    });
}
// all Donations list
module.exports.DonationList = function (req, res) {

    if (req.params.DonationTypeId != undefined) {
        Donation.find({
            DonationType: req.params.DonationTypeId
        }).populate("DonationType").populate("DonationSubCategory").populate({
            path: 'donationProcess',
            populate: {
                path: 'donationDuration',
                model: 'donationduration'
            }
        }).exec(function (err, Donations) {
            if (err != undefined) {
                res.send(err);
            }
            res.status(200).send(Donations);

        });
    } else {
        Donation.find({}).populate("DonationType").exec(function (err, Donations) {
            if (err != undefined) {
                res.send(err);
            }
            res.status(200).send(Donations);
        });
    }
}
// update Donation
module.exports.updateDonation = function (req, res) {
    Donation.findOne({
        _id: req.body.id
    }).populate('donationProcess').exec((err, Donation) => {
        if (err) {
            res.status(500).send(err);
        } else {
            Donation.DonationName = req.body.DonationName || Donation.DonationName;
            Donation.DonationDescription = req.body.DonationDescription || Donation.DonationDescription;
            Donation.DonationSubCategory = req.body.DonationSubCategory || Donation.DonationSubCategory;
            Donation.imageLink = req.body.imageLink || Donation.imageLink;
            Donation.donationProcess[0].isRecurring = req.body.donationProcess.isRecurring || (Donation.donationProcess[0].isRecurring == undefined);
            Donation.donationProcess[0].isDuration = req.body.donationProcess.isDuration || (Donation.donationProcess[0].isDuration == undefined);
            Donation.donationProcess[0].isCount = req.body.donationProcess.isCount || (Donation.donationProcess[0].isCount == undefined);
            Donation.donationProcess[0].isYearAround = req.body.donationProcess.isYearAround || (Donation.donationProcess[0].isYearAround == undefined);
            Donation.donationProcess[0].isSyed = req.body.donationProcess.isSyed || (Donation.donationProcess[0].isSyed == undefined);
            Donation.donationProcess[0].isAmount = req.body.donationProcess.isAmount || (Donation.donationProcess[0].isAmount == undefined);
            Donation.donationProcess[0].isMinimumAmount = req.body.donationProcess.isMinimumAmount || (Donation.donationProcess[0].isMinimumAmount == undefined);
            Donation.donationProcess[0].durationStartDate = req.body.donationProcess.durationStartDate || Donation.donationProcess[0].durationStartDate;
            Donation.donationProcess[0].durationEndDate = req.body.donationProcess.durationEndDate || Donation.donationProcess[0].durationEndDate;
            Donation.donationProcess[0].countMin = req.body.donationProcess.countMin || Donation.donationProcess[0].countMin;
            Donation.donationProcess[0].countMax = req.body.donationProcess.countMax || Donation.donationProcess[0].countMax;
            Donation.donationProcess[0].interval = req.body.donationProcess.interval || Donation.donationProcess[0].interval;
            Donation.donationProcess[0].amount = req.body.donationProcess.amount || Donation.donationProcess[0].amount;
            Donation.donationProcess[0].minimumAmount = req.body.donationProcess.minimumAmount || Donation.donationProcess[0].minimumAmount;
            Donation.donationProcess[0].donationDuration = req.body.donationProcess.donationDurations || Donation.donationProcess.donationDuration;

            Donation.donationProcess[0].save(function (err) {
                if (err) {
                    throw err;
                }
            });
            Donation.isSyed = req.body.isSyed || Donation.isSyed;
            Donation.countryOfZiyarat = req.body.countryOfZiyarat || Donation.countryOfZiyarat;
            Donation.updated = Date.now();
            Donation.updatedBy = 'NA';
            Donation.save((err, Donation) => {
                if (err) {
                    res.status(500).send(err)
                }
                res.json('Donation updated Sucessfully');
            });
        }

    });
}
//select Donation by id
module.exports.DonationById = function (req, res) {
    //Donation.find({donor: {_id: "5a68192b28c5b91b2c1db097"}}).populate('DonationSubCategory')
    /*  Donation.find({donor:  { $elemMatch: { user: {_id: "5a68192428c5b91b2c1db096"} } } }).populate('DonationSubCategory')
          .populate({
              path: 'donationProcess', populate: {
                  path: 'donationDuration',
                  model: 'donationduration'
              }
          }).exec(function (err, donation) {
          res.status(200).send(donation);
      });*/
    //let userObjectID = new ObjectID(req.session._id);
    Donar.findOne({
        user: req.session._id
    }, function (err, donar) {
        if (donar) {
            Donation.find({
                donor: donar._id
            }).sort({
                created: -1
            }).populate({
                path: "donationdetails",
                populate: [{
                    path: 'program',
                    populate: {
                        path: 'programType'
                    }
                }, {
                    path: 'programSubCategory'
                }]
            }).exec(function (err, donations) {
                if (donations) {
                    if (donations.length) {
                        res.status(200).json(donations);
                    } else {
                        res.status(200).json([]);

                    }
                }


            });
        } else if (!err && !donar) {
            res.status(200).json([]);

        }
    });
    // User.findOne({ _id: req.session._id }).
    // var donationList = [];
    // Get the _ids of people with the last name of Robertson.
    // Donation.find({}, function (err, donations) {
    //     try {
    //         if (donations.length > 0) {
    //             for (let i = 0; i < donations.length; i++) {
    //                 Donar.findOne({ _id: donations[i].donor[0] }, function (err, donar) {
    //                     if (donar) {
    //                         User.findOne({ _id: donar.user[0] }, function (err, user) {
    //                             if (user._id.toString() == req.session._id) {
    //                                 donationList.push(donations[i]);

    //                             }
    //                         });
    //                     }
    //                 });
    //             }
    //             res.json(donationList);
    //         }
    //     }
    //     catch (ex) {
    //         res.status(500).send(ex)
    //     }
    // });
}


//select Donation Details by id
module.exports.donationDetailsByUserId = function (req, res) {

    Donar.findOne({
        user: req.session._id
    }, function (err, donar) {
        if (donar) {
            Donation.find({
                donor: donar._id
            }).sort({
                created: -1
            }).populate({
                path: "donationdetails",
                populate: [{
                    path: 'program',
                    populate: {
                        path: 'programType'
                    }
                }, {
                    path: 'programSubCategory'
                }]
            }).exec(function (err, donations) {
                if (donations) {
                    if (donations.length) {
                        var donationList = [];
                        donations.forEach((obj) => {
                            obj.donationdetails.forEach((element) => {
                                if (element.program && element.program.length && element.program[0].programName) {
                                    element.donation.documentPath = element.donation.documentPath.substring(element.donation.documentPath.indexOf('/', 0), element.donation.documentPath.length)
                                    donationList.push(element);
                                }
                            })
                        })

                        res.status(200).json(donationList);
                    } else {
                        res.status(200).json([]);
                    }
                }
            });
        } else if (!err && !donar) {
            res.status(200).json([]);
        }
    });
}

function createKhumsDocument(req, res, user) {
    DonationDetail.update({
        'donation._id': ObjectID(req.body.donationId)
    }, {
        $set: {
            'donation.isKhums': true
        }
    }, {
        multi: true
    }, function (dErr, dRes) {
        if (dErr) res.status(400).json('Unable to update');
        let options = {
            from: "invoice@najafyia.org",
            to: req.body.donorEmail
        }
        if (user.language == 'ARB') {
            options.subject = "الخمس";
            options.html = JSON.parse(emailTemplate.khumsArb().replace("[Name]", req.body.donorName));
        } else if (user.language == 'FRN') {
            options.subject = configuration.email.subjectPrefixEng_Frn + " | Khums";
            options.html = JSON.parse(emailTemplate.khumsFrn().replace("[Name]", req.body.donorName));
        } else {
            options.subject = configuration.email.subjectPrefixEng_Frn + " | Khums";
            options.html = JSON.parse(emailTemplate.khumsEng().replace("[Name]", req.body.donorName));
        }
        options.attachments = [{
            path: req.body.path,
            filename: req.body.path.split('\\').pop()
        }]

        emailTrans.trans().sendMail(options, function (err, suc) {
            if (!err) {
                res.status(200).send("email send")
            } else {
                res.status(500).send("email not send")
            }
        });
    })
}
module.exports.updateDonationWithDocument = function (req, res) {
    Donation.update({
        _id: req.body.donationId
    }, {
        $set: {
            isKhums: true,
            documentPathKhums: req.body.path
        }
    }, {
        multi: true
    }, function (err, donation) {
        if (err) {
            console.log(err)
        } else {
            let userObj = {};
            if (req.body.donorEmail) {
                User.findOne({
                    email: req.body.donorEmail
                }, (uErr, user) => {
                    if (!user) {
                        GuestUser.findOne({
                            email: req.body.donorEmail
                        }, (gErr, gUser) => {
                            userObj = gUser;
                            createKhumsDocument(req, res, userObj)
                        })
                    } else {
                        userObj = user;
                        createKhumsDocument(req, res, userObj)
                    };

                });

            }

        }
    });
}

// //Send Email Receipt

module.exports.getActiveRecurringDonationsByUserID = function (req, res) {
    Donar.findOne({
        user: req.session._id
    }, function (err, donar) {
        if (donar) {
            DonationRecurring.find({
                donar: donar._id,
                isActive: true,
                'donationDetails.isRecurring': {
                    $ne: false
                }
            })
                .populate({
                    path: "program",
                    populate: {
                        path: "programType"
                    }
                })
                .populate("programSubCategory")
                .sort({
                    updated: -1
                })
                .exec(function (err, donationRecurring) {
                    res.send(donationRecurring);
                })
        } else if (!err && !donar) {
            res.send([]);
        }
    });
}
async function getDonationTotals(id, currency) {
    let result = [];
    result = await Donar.aggregate([{
        $match: {
            user: ObjectID(id)
        }
    },
    {
        $project: {
            _id: 1
        }
    },
    {
        $lookup: {
            from: "donations",
            localField: "_id",
            foreignField: "donor",
            as: 'donations',
        }
    },
    {
        $unwind: "$donations"
    },
    {
        $match: {
            'donations.currencyTitle': currency
        }
    },
    {
        $project: {
            amount: '$donations.totalAmount'
        }
    },
    {
        $group: {
            _id: '$_id',
            totalDonationAmount: {
                $sum: "$amount"
            }
        }
    },
    {
        $lookup: {
            from: "donationdetails",
            localField: "_id",
            foreignField: "donation.donor",
            as: 'renewals'
        }
    },
    {
        $project: {
            totalDonationAmount: 1,
            renewals: {
                $filter: {
                    input: "$renewals",
                    as: "ren",
                    cond: {
                        $and: [{
                            $eq: ["$$ren.autoRenew", true]
                        }, {
                            $eq: ["$$ren.donation.currencyTitle", currency]
                        }]
                    },
                }
            }
        }
    },
    {
        $unwind: {
            path: "$renewals",
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $project: {
            totalDonationAmount: 1,
            totalRenewalAmount: "$renewals.amount"
        }
    },
    {
        $group: {
            _id: '$_id',
            totalRenewalAmount: {
                $sum: "$totalRenewalAmount"
            },
            totalDonationAmount: {
                $first: "$totalDonationAmount"
            }
        }
    },
    {
        $lookup: {
            from: "donationrecurrings",
            localField: "_id",
            foreignField: "donar",
            as: "drs"
        }
    },
    {
        $project: {
            totalDonationAmount: 1,
            totalRenewalAmount: 1,
            recs: {
                $filter: {
                    input: "$drs",
                    as: "d",
                    cond: {
                        $and: [{
                            $eq: ["$$d.donationDetails.donation.currencyTitle", currency]
                        }, {
                            $eq: ["$$d.donationDetails.isRecurring", true]
                        }, {
                            $eq: ["$$d.isChanged", false]
                        }]
                    },
                }
            }
        }
    },
    {
        $unwind: {
            path: "$recs",
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $group: {
            _id: '$_id',
            totalRecurringAmount: {
                $sum: "$recs.amount"
            },
            totalDonationAmount: {
                $first: "$totalDonationAmount"
            },
            totalRenewalAmount: {
                $first: "$totalRenewalAmount"
            }
        }
    },
    {
        $lookup: {
            from: "studentsponsorships",
            localField: "_id",
            foreignField: "donar",
            as: "stds"
        }
    },
    {
        $project: {
            totalDonationAmount: 1,
            totalRenewalAmount: 1,
            totalRecurringAmount: 1,
            stds: {
                $filter: {
                    input: "$stds",
                    as: "s",
                    cond: {
                        $and: [{
                            $eq: ["$$s.currencyTitle", currency]
                        }]
                    },
                }
            }
        }
    },
    {
        $unwind: {
            path: "$stds",
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $group: {
            _id: '$_id',
            totalDAZAmount: {
                $sum: "$stds.sponsorshipAmount"
            },
            totalDonationAmount: {
                $first: "$totalDonationAmount"
            },
            totalRenewalAmount: {
                $first: "$totalRenewalAmount"
            },
            totalRecurringAmount: {
                $first: "$totalRecurringAmount"
            }
        }
    },
    {
        $lookup: {
            from: "orphanscholarships",
            localField: "_id",
            foreignField: "donar",
            as: "orps"
        }
    },
    {
        $project: {
            totalDonationAmount: 1,
            totalRenewalAmount: 1,
            totalRecurringAmount: 1,
            totalDAZAmount: 1,
            orps: {
                $filter: {
                    input: "$orps",
                    as: "o",
                    cond: {
                        $and: [{
                            $eq: ["$$o.currencyTitle", currency]
                        }]
                    },
                }
            }
        }
    },
    {
        $unwind: {
            path: "$orps",
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $group: {
            _id: '$_id',
            totalOrphanAmount: {
                $sum: "$orps.sponsorshipAmount"
            },
            totalDAZAmount: {
                $first: "$totalDAZAmount"
            },
            totalDonationAmount: {
                $first: "$totalDonationAmount"
            },
            totalRenewalAmount: {
                $first: "$totalRenewalAmount"
            },
            totalRecurringAmount: {
                $first: "$totalRecurringAmount"
            }
        }
    },
    ])
    return result;
}
module.exports.donationTotal = async function (req, res) {
    let total = {
        usdTotal: await getDonationTotals(req.session._id, "USD"),
        eurTotal: await getDonationTotals(req.session._id, "EUR"),
        gbpTotal: await getDonationTotals(req.session._id, "GBP"),
    };
    res.status(200).json(total);
}
module.exports.getAutoRenewTotal = function (req, res) {
    Donar.aggregate([{
        $match: {
            user: ObjectID(req.session._id)
        }
    },
    {
        $lookup: {
            from: "donationdetails",
            localField: "_id",
            foreignField: "donation.donor",
            as: "donations"

        }
    },
    {
        $sort: {
            created: -1
        }
    },
    {
        $project: {
            donations: {
                $filter: {
                    input: "$donations",
                    as: "d",
                    cond: {
                        $and: [{
                            $ne: ["$$d.autoRenew", false]
                        }]
                    },
                }
            }
        }
    },
    {
        $unwind: "$donations"
    },
    {
        $project: {
            doc: "$donations",
        }
    },
    {
        $lookup: {
            from: "programs",
            localField: "doc.program",
            foreignField: "_id",
            as: "program"
        }
    },
    {
        $unwind: {
            path: "$program",
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $lookup: {
            from: "programsubcategories",
            localField: "doc.programSubCategory",
            foreignField: "_id",
            as: "programSubCategory"
        }
    },
    {
        $unwind: {
            path: "$programSubCategory",
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $sort: {
            "doc.created": -1
        }
    },
    {
        $project: {
            description: "$program.programName",
            details: "$programSubCategory.programSubCategoryName",
            endDate: "$doc.endDate",
            freezedDate: "$doc.created",
            amount: "$doc.amount",
            currency: "$doc.donation.currency",
            slug: '$program.slug',
            // nextPayment: { $add: ["$doc.endDate", 1 * 24 * 60 * 60000] },
            nextPayment: "$doc.endDate",
        }
    },
    ]).exec((err, donations) => {
        if (err) res.status(400).json(err);
        if (donations) {
            res.status(200).json(donations);
        }
    })
}
module.exports.sendEmail = function (req, res) {
    var options = {
        from: "test@binaryvibes.com",
        to: 'wajahat@binaryvibes.com',
        subject: 'test',
        text: 'Your donation has been done.'
    };
    emailTrans.trans().sendMail(options, function (err, suc) {
        if (error) {
            console.log(error);
            res.end("error");
        } else {
            console.log("Message sent: " + response.message);
            res.end("sent");
        }

    });
}

function sendEmailWithReciept(recData, invoiceNum, donationType, donation) { // 'D' is for DirectDonation & 'ND' is for Nor Direct
    const methodName = Constants.LogLiterals.SEND_EMAIL_WITH_RECIEPT_METHOD;
    logMessage(`${methodName}`, recData.body);

    var cart = {};
    if (recData.body.cart) {
        cart = donationType == 'D' ? recData.body.cart : recData.session.cart;
    } else {
        cart = {
            items: recData.body.items
        };
    }
    recData.session = recData.session || {};
    recData.session.donarEmailWithoutLogin = recData.body.donarEmailWithoutLogin || recData.body.donarEmail;
    savedFileName = 'Reciept-' + recData.body.selectedLang + '-' + invoiceNum + '.pdf';
    let checkCreatePdf = cart.items.some(obj => obj.program.programName != 'Khums' && obj.program.programName != 'الخمس')
    if (checkCreatePdf) {
        let khumsprograms = cart.items.filter(obj => obj.program.programName == 'Khums' || obj.program.programName == 'الخمس')
        if (khumsprograms.length) {
            var khumsAmount = khumsprograms.reduce((total, num) => {
                return Number(total) + Number(num.totalAmount);
            }, 0)
        }
        cart.items = cart.items.filter(obj => obj.program.programName != 'Khums' && obj.program.programName != 'الخمس')
        createPdf(savedFileName, recData, cart, khumsAmount, invoiceNum, donation);

    } else if (!checkCreatePdf) {
        onlyEmailSend(recData, donation)
    }
}

function onlyEmailSend(recData, donation) {

    if (recData.body.selectedLang == 'ENG') {
        recData.body.subject = configuration.email.subjectPrefixEng_Frn + " | Donation receipt";
        recData.body.html = emailTemplate.khumsEng()
            .replace('[Name]', capitalize(recData.body.donar.donarName))
            .replace('[DSP]', 'block');
    } else if (recData.body.selectedLang == 'ARB') {
        recData.body.subject = 'إيصال';
        recData.body.html = emailTemplate.khumsArb()
            .replace('[Name]', capitalize(recData.body.donar.donarName))
            .replace('[DSP]', 'block');

    } else if (recData.body.selectedLang == 'FRN') {
        recData.body.subject = configuration.email.subjectPrefixEng_Frn + " | Reçu de donation";
        recData.body.html = emailTemplate.khumsFrn()
            .replace('[Name]', capitalize(recData.body.donar.donarName))
            .replace('[DSP]', 'block');

    }

    var options = {
        from: 'invoice@najafyia.org',
        to: recData.body.donarEmailWithoutLogin || recData.body.donarEmail,
        subject: recData.body.subject || '',
        html: JSON.parse(recData.body.html),
    };

    emailTrans.trans().sendMail(options, (err, suc) => {
        Donation.updateOne({
            _id: donation._id
        }, {
            $set: {
                emailResponse: suc || err
            }
        })
    });
}

function formatDate(day, month, year) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (day.length < 2)
        day = '0' + day;
    return [day, months[parseInt(month) - 1], year].join('-');
}

function capitalize(string) {
    if (string && string.length) {
        let name = string.split(" ").map(str => str.charAt(0).toUpperCase() + str.slice(1)).join(" ");
        // if (name.length > 15) {
        //     name = name.substring(0, 15) + '...';
        // }
        return name;
    } else return "";
}

function getProgramNameWithSubCategory(cartItem) {
    if (cartItem && cartItem.program) {
        let program = cartItem.program;
        if (cartItem.otherFieldForNiyaz) {
            return `${program.programName} - ${cartItem.otherFieldForNiyaz}`;
        }
        if (cartItem.otherPersonalityName) {
            return `${program.programName} - ${cartItem.otherPersonalityName}`;
        }
        if (cartItem.programSubCategory && cartItem.programSubCategory.programSubCategoryName) {
            if (cartItem.marhomeenName) {
                return `${program.programName} - ${cartItem.programSubCategory.programSubCategoryName || ''} - ${cartItem.marhomeenName || ''}`;
            }
            return `${program.programName} - ${cartItem.programSubCategory.programSubCategoryName || ''}`;
        } else {
            return `${program.programName}`;
        }
    } else return '---';
}

function synchronizeCurrencies(currency, item, currencies) {
    if (item.currency.title === currency) {
        return item;
    } else {
        let cur = currencies.find(c => c.name === currency) || {};
        // item.totalAmount = parseInt(currencyFormula((cur.rate || 1) * item.currency.dollarAmount) * (item.count || 1)).toFixed(2);
        item.currency.title = cur.name || 'USD';
        item.currency.rateExchange = cur.rate || 1;
        item.currency.symbol = cur.symbol || '$';
        return item;
    }
}

function getArabicCartItems(items) {
    let cartItems = '';
    if (items && items.length) {
        for (let i = 0; i < items.length; i++) {
            let programName = getProgramNameWithSubCategory(items[i]);
            const quantity = items[i].count || '-';
            cartItems = cartItems + `<tr>
            <td style="padding:10px;text-align:center;font-family: helvetica;color:grey">${arabicDigit.toArabic(items[i].totalAmount, false)} ${items[i].currency.symbol}</td>
            <td style="padding:10px;text-align:center;font-family: helvetica;color:grey">${arabicDigit.toArabic(quantity, false)}</td>
            <td style="padding:10px;text-align:center;font-family: helvetica;color:grey">${programName}</td>
            <td style="padding:10px;text-align:center;font-family: helvetica;color:grey">${arabicDigit.toArabic(i + 1, false)}</td>
            </tr>`
        }
    }
    return cartItems;
}

function getCartItems(items) {
    let cartItems = '';
    if (items && items.length) {
        for (let i = 0; i < items.length; i++) {
            let programName = getProgramNameWithSubCategory(items[i]);
            const quantity = items[i].count || '-';
            cartItems = cartItems + `<tr>
                <td style="height:64px;padding:10px;text-align:center;font-family: helvetica;color:grey">${i + 1}</td>
                <td style="height:64px;padding:10px;text-align:center;font-family: helvetica;color:grey">${programName}</td>
                <td style="height:64px;padding:10px;text-align:center;font-family: helvetica;color:grey">${quantity}</td>
                <td style="height:64px;padding:10px;text-align:center;font-family: helvetica;color:grey">${items[i].currency.symbol} ${items[i].totalAmount}</td>
                </tr>`
        }
    }
    return cartItems;
}

function createOrphanHeaders(lang) {
    let headers = `
    <thead>
        <th>Sno.</th>
        <th>Id</th>
        <th>Name</th>
        <th>Birthday</th>
        <th>Descent</th>
        <th>Gender</th>
        <th>City</th>
    </thead>`;
    if (lang === 'FRN') {
        headers = `
        <thead>
            <th>Sno.</th>
            <th>Id</th>
            <th>Nom complet</th>
            <th>Date de naissance</th>
            <th>Descente</th>
            <th>Sexe</th>
            <th>Ville</th>
        </thead>`
    } else if (lang === 'ARB') {
        headers = `
        <thead>
        <th>المدينة</th>
        <th>الجنس</th>
        <th>النسب</th>
        <th>تاريخ الولادة</th>
        <th>الإسم</th>
        <th>هوية اليتيم</th>
        <th>سنو</th>
        </thead>`
    }
    return headers;
}

function insertOrphanDataInReceipt(orphans, lang) {
    let row = '';
    let heading = 'Orphan Details';
    let floatHeading = 'left';
    let gender = '';
    let descent = '';
    const tdStyle = '"padding: 5px; text-align: center; font-family: helvetica;border:1px solid #eceff1; border-top:none !important;"';
    for (let i = 0; i < orphans.length; i++) {
        const currentDate = new Date(orphans[i].dateOfBirth);
        var dateLocale = moment(currentDate);
        gender = orphans[i].gender;
        descent = orphans[i].descent;
        let rowValues = [i + 1, orphans[i].orphanId, orphans[i].orphanName, dateLocale.format('DD-MMM-YYYY'), descent, gender, orphans[i].city];
        if (lang === Constants.Languages.Arabic.code) {
            gender = gender === Constants.GenderTypes.ENG.female ? Constants.GenderTypes.ARB.female : Constants.GenderTypes.ARB.male;
            descent = descent === Constants.DescentTypes.ENG.syed ? Constants.DescentTypes.ARB.syed : Constants.DescentTypes.ARB.nonSyed;
            dateLocale.locale(Constants.Languages.Arabic.locale);
            rowValues[0] = arabicDigit.toArabic(i + 1, false);
            rowValues[1] = arabicDigit.toArabic(orphans[i].orphanId, false);
            rowValues[3] = dateLocale.format('LL');//arabic date format
            rowValues[4] = descent;
            rowValues[5] = gender;
            rowValues = rowValues.reverse();//reverse order for RTL lang
            row += getRowContent(tdStyle, rowValues)
        }
        else if (lang === Constants.Languages.French.code) {
            gender = gender === Constants.GenderTypes.ENG.female ? Constants.GenderTypes.FRN.female : Constants.GenderTypes.FRN.male;
            descent = descent === Constants.DescentTypes.ENG.syed ? Constants.DescentTypes.FRN.syed : Constants.DescentTypes.FRN.nonSyed;
            dateLocale.locale(Constants.Languages.French.locale);
            rowValues[3] = dateLocale.format('LL');//french date format
            rowValues[4] = descent;
            rowValues[5] = gender;
            row += getRowContent(tdStyle, rowValues);
        }
        else {
            dateLocale.locale(Constants.Languages.English.locale);
            row += getRowContent(tdStyle, rowValues);
        }
    }
    if (lang === Constants.Languages.Arabic.code) {
        heading = 'تفاصيل اليتيم';
        floatHeading = 'right';
    }
    else if (lang === Constants.Languages.French.code) heading = 'Détails orphelins';
    return `
    <div>
        <h2 style="font-family: helvetica;float:${floatHeading}">${heading}</h2>
        <table style="font-family: helvetica;border-collapse: collapse;border:solid 1px grey;margin-top: 20px; width: 100%;" border="1">
            ${createOrphanHeaders(lang)}
            <tbody>${row}</tbody>
        </table>
    </div>
        `;
}

function getRowContent(tdStyle, rowValues) {
    let row = `<tr>`;
    rowValues.map(function (tdVal) {
        row += `<td style=${tdStyle}>${tdVal}</td>`
    })
    row += `</tr>`;
    return row;
}
function flatten(arr) {
    return arr.reduce(function (flat, toFlatten) {
        return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
}
var pdf = require('html-pdf'); // npm install html-pdf — save
async function createPdf(fileName, recData, cart, khumsAmount = 0, invoiceNum, donation) {
    const receiptBase = require('../emails/templates/receipts');
    const orphanIds = cart.items.map(i => i.orphans) || [];
    var currentDate;
    var dateLocale = moment(recData.datetime);
    const orphans = await Orphan.find({
        _id: {
            $in: flatten(orphanIds)
        }
    });
    let cartItems = getCartItems(cart.items);
    let html = '';
    let options = {
        header: {
            height: "220px",
            contents: receiptBase.getEnglishMailHeader()
        },
        format: 'Letter',
        timeout: 600000,
        footer: {
            height: "47mm",
            contents: receiptBase.getEnglishMailFooter()
        }
    };
    if (recData.body.selectedLang == Constants.Languages.English.code) {
        html = receiptBase.receiptEng();
        dateLocale.locale(Constants.Languages.English.locale);
        currentDate = dateLocale.format('DD-MMM-YYYY');
    } else if (recData.body.selectedLang == Constants.Languages.French.code) {
        html = receiptBase.receiptFRN();
        options.header.contents = receiptBase.getFrenchMailHeader();
        options.footer.contents = receiptBase.getFrenchMailFooter();
        dateLocale.locale(Constants.Languages.French.locale);
        currentDate = dateLocale.format('LL');// LL stands for DD-(Name of month)-YYYY (e.g April 11, 2020)
    } else {
        html = receiptBase.receiptARB();
        options.header.contents = receiptBase.getArabicMailHeader();
        options.footer.contents = receiptBase.getArabicMailFooter();
        cartItems = getArabicCartItems(cart.items);
        dateLocale.locale(Constants.Languages.Arabic.locale);
        currentDate = dateLocale.format('LL');// LL stands for DD-(Name of month)-YYYY (e.g April 11, 2020)
    }
    if (orphans && orphans.length) {
        html = html.replace('<div id="orphan"></div>', insertOrphanDataInReceipt(orphans, recData.body.selectedLang));
    }

    html = html.replace('{{DATE}}', currentDate);
    html = html.replace('{{CART_ITEMS}}', cartItems);
    html = html.replace('{{TOTAL_AMOUNT}}', recData.body.selectedLang == Constants.Languages.Arabic.code ? `${recData.body.items[0].currency.symbol} ${arabicDigit.toArabic(parseInt(recData.body.amount - khumsAmount).toFixed(2), false)}` : `${recData.body.items[0].currency.symbol} ${parseInt(recData.body.amount - khumsAmount).toFixed(2)}`);
    html = html.replace('{{CURRENCY}}', cart.items[0].currency.symbol);
    html = html.replace('{{DONOR_NAME}}', capitalize(recData.body.donar.donarName));
    html = html.replace('{{INVOICE_NO}}', invoiceNum);
    pdf.create(html, options).toFile('./public/pdf/' + fileName, function (err, data) {
        if (err) return console.log(err);
        if (recData.body.selectedLang == Constants.Languages.English.code) {
            recData.body.subject = configuration.email.subjectPrefixEng_Frn + " | Donation receipt";
            recData.body.html = emailTemplate.standardRecEng()
                .replace('[DonarName]', capitalize(recData.body.donar.donarName))
            recData.body.html = (khumsAmount) ? recData.body.html.replace('[DSP]', 'block') : recData.body.html.replace('[DSP]', 'none');;
        } else if (recData.body.selectedLang == Constants.Languages.Arabic.code) {
            recData.body.subject = 'إيصال';
            recData.body.html = emailTemplate.standardRecArb()
                .replace('[DonarName]', capitalize(recData.body.donar.donarName));
            recData.body.html = (khumsAmount) ? recData.body.html.replace('[DSP]', 'block') : recData.body.html.replace('[DSP]', 'none');;

        } else if (recData.body.selectedLang == Constants.Languages.French.code) {
            recData.body.subject = configuration.email.subjectPrefixEng_Frn + " | Reçu de donation";
            recData.body.html = emailTemplate.standardRecFrn()
                .replace('[DonarName]', capitalize(recData.body.donar.donarName));
            recData.body.html = (khumsAmount) ? recData.body.html.replace('[DSP]', 'block') : recData.body.html.replace('[DSP]', 'none');;

        }
        const mailOptions = {
            from: 'invoice@najafyia.org',
            to: recData.body.donarEmailWithoutLogin || recData.body.donarEmail,
            subject: recData.body.subject || '',
            html: JSON.parse(recData.body.html),
            attachments: [{
                path: data.filename,
                filename: fileName
            }]
        };

        emailTrans.trans().sendMail(mailOptions, (err, suc) => {
            if (suc) {
                console.log('Step 9:  Email Sent successfully')
            } else {
                console.log('Step 8:  Email not sent successfully')
            }
            Donation.updateOne({
                _id: donation._id
            }, {
                $set: {
                    emailResponse: suc || err
                }
            }, (e, r) => console.log('Step 10:  Email Response captured'))
        });
        return data.filename;
    });

}

function logMessage(message, data, isError) {
    msg = `${Constants.LogLiterals.DONATION_CONTROLLER}: ${message}`;
    isError ? logHelper.logError(msg, data) : logHelper.logInfo(msg, data);
}

async function createTransactionDataForGTM(donationItem) {
    let transaction;
    const methodName = "createTransactionDataForGTM";
    try {
        let products = [];
        let programTypeName;
        let currencyRate = 1;
        let isUSD = donationItem.body.paymentTitle == Constants.Currencies.UnitedStateDollar;
        if (!isUSD) {
            let currency = await databaseHelper.getItem(Constants.Database.Collections.CURNCY.dataKey, { name: donationItem.body.paymentTitle }, { rate: 1 });

            currencyRate = 1 / parseFloat(currency.rate);
        }

        for (let index = 0; index < donationItem.body.items.length; index++) {
            if (donationItem.body.items[index].program.programType && donationItem.body.items[index].program.programType.length > 0) {
                if (donationItem.body.items[index].program.programType[0].programTypeName) {
                    programTypeName = donationItem.body.items[index].program.programType[0].programTypeName;
                }
                else {
                    let programType = await databaseHelper.getItem(Constants.Database.Collections.PRGM_TYP.dataKey, { _id: donationItem.body.items[index].program.programType[0] }, { programTypeName: 1 });

                    programTypeName = programType.programTypeName;
                }
            }

            products.push({

                'sku': donationItem.body.items[index].program.slug,
                'name': donationItem.body.items[index].program.programName,
                'category': programTypeName,
                'price': (donationItem.body.items[index].count ? parseFloat(donationItem.body.items[index].totalAmount) / donationItem.body.items[index].count : parseFloat(donationItem.body.items[index].totalAmount)) * currencyRate,
                'quantity': donationItem.body.items[index].count ? donationItem.body.items[index].count : 1
            });
        }
        transaction = {
            'event': 'purchase',
            'transactionId': donationItem._id,
            'transactionAffiliation': 'Najafyia Foundation',
            'transactionTotal': donationItem.body.amount * currencyRate,
            'transactionTax': 0.00,
            'transactionShipping': 0,
            'transactionProducts': products
        };
    }
    catch (err) {
        logMessage(`${methodName}: Error`, err, true);
    }

    return transaction;
}

module.exports.getRecurringDonationsForMenuVisibility = async function (req, res) {
    const methodName = 'getRecurringDonationsForMenuVisibility';
    try {
        let userID = req.session._id;
        var showOrphanBasicCareTab = false;

        let donorObject = await databaseHelper.getItem(Constants.Database.Collections.DONR.dataKey, { user: userID }, { _id: 1 });

        let query = {
            "donar": donorObject._id,
            paymentSchedule: { $exists: false },
            freezed: false
        };

        let donationRecurring = await databaseHelper.getManyItems(Constants.Database.Collections.DON_REC.dataKey, query, { _id: 1 });

        if (donationRecurring && donationRecurring.length > 0) {
            showOrphanBasicCareTab = true;
        }

        res.status(200).send({
            showOrphanBasicCareTab: showOrphanBasicCareTab
        });
    }
    catch (ex) {
        logMessage(`${methodName}: Error`, ex, true);
        res.status(500).send(ex);
    }
}