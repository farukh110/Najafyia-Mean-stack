var Donation = require('../models/donation.js');
var DonationDetail = require('../models/donationDetail.js');
var DonationRecurring = require('../models/donationRecurring.js');
var ObjectId = require('mongodb').ObjectID;

var emailTemplate = require('../../public/js/emailTemplates.js');
var emailTrans = require('../../public/js/emailTransporter.js');
var stripe = require("stripe")(
    process.env.StripeKey
);
var DonationRecurring = require('../models/donationRecurring.js');
var Logs = require('../models/logs');
OrphanSponsorship = require('../models/orphanScholarships');
StudentSponsorship = require('../models/studentSponsorship');
var ziyaratService = require('../../app/services/ziyaratService');
const configuration = require("../../config/configuration.js");

/** send Zaireen list to consultant everyday at 3PM for TESTING **/
// schedule.scheduleJob('0 0 15 * * *', function () {
//     sendZaireenList();
// });

//Send Zaireen List Function 
module.exports.sendZaireenList = async function (req, res) {
    ziyaratService.sendZaireenList();
    res.send();
}


module.exports.donateRecurringByDonars = function (req, res) {
    DonationRecurring.find({
        $and: [{
            'donationDetails.autoRenew': {
                $eq: true
            }
        },
        {
            'donationDetails.endDate': {
                $lte: new Date()
            }
        },
        {
            'nextDonationDate': {
                $gte: new Date()
            }
        }
        ]
    })
        .populate("donationDuration")
        .populate("program")
        .populate("programSubCategory")
        .populate({
            path: "donar",
            populate: {
                path: "user"
            }
        })
        .exec(function (err, donateRecurr) {
            if (donateRecurr && donateRecurr.length) {
                donateRecurr.forEach((obj) => {
                    let startDate = new Date(obj.endDate || obj.donationDetails.endDate).setDate(new Date(obj.endDate || obj.donationDetails.endDate).getDate() + 1)
                    if (obj.program && obj.program.length && obj.program[0].programName && (obj.program[0].programName == "Higher Education Loans" || obj.program[0].programName == 'قرض التعليم العالي' || obj.program[0].programName == "Études Supérieures")) {
                        if (obj.programSubCategory && obj.programSubCategory.length && (obj.programSubCategory[0].programSubCategoryName == 'Masters (2 Years)' || obj.programSubCategory[0].programSubCategoryName == 'الماجستير (2 سنوات)' || obj.programSubCategory[0].programSubCategoryName == 'Maîtres (2 Ans)')) {
                            let endDate = new Date(obj.endDate || obj.donationDetails.endDate).setMonth(new Date(obj.endDate || obj.donationDetails.endDate).getMonth() + 24);
                            obj.donationDetails.endDate = (new Date(endDate)).toISOString();
                            obj.donationDetails.donation.endDate = (new Date(endDate)).toISOString();
                        } else {
                            let endDate = new Date(obj.endDate || obj.donationDetails.endDate).setMonth(new Date(obj.endDate || obj.donationDetails.endDate).getMonth() + 30);
                            obj.donationDetails.endDate = (new Date(endDate)).toISOString();
                            obj.donationDetails.donation.endDate = (new Date(endDate)).toISOString();
                        }

                    } else {
                        if (obj.donationDuration && obj.donationDuration.length) {
                            let endDate = new Date(obj.endDate || obj.donationDetails.endDate).setMonth(new Date(obj.endDate || obj.donationDetails.endDate).getMonth() + obj.donationDuration[0].noOfMonths);
                            obj.donationDetails.endDate = (new Date(endDate)).toISOString()
                            obj.donationDetails.donation.endDate = (new Date(endDate)).toISOString();
                        }
                    }
                    obj.nextDonationDate = new Date(obj.nextDonationDate).setDate(new Date(obj.nextDonationDate).getDate() + 1),
                        obj.startDate = startDate;
                    obj.endDate = obj.donationDetails.endDate;
                    DonationRecurring.update({
                        _id: ObjectId(obj.id)
                    }, obj, function (err, succ) {
                        if (err) {
                            console.log(err);
                        } else {
                            if (obj.program && obj.program.length && obj.program[0].programName && (obj.program[0].programName == "Hawzah Students" || obj.program[0].programName == 'طلاب الحوزة' || obj.program[0].programName == "Étudiants Hawza")) {
                                sendEmail(obj);
                            }
                        }
                    })
                })
            }

        });

}


function sendEmail(obj) {
    let subject;
    let html;
    if (obj.donar[0].user[0].language == 'ENG') {
        subject = configuration.email.subjectPrefixEng_Frn+' | Auto Renewal Successful (Hawzah Student)';
        html = emailTemplate.hawzaStuAutoRenewEng()
            .replace('[Name]', obj.donar[0].donarName)
            .replace('[CURRSYM]', obj.donationDetails.donation.currency)
            .replace('[AMOUNT]', obj.amount);
    } else if (obj.donar[0].user[0].language == 'FRN') {
        subject = configuration.email.subjectPrefixEng_Frn+' | Auto Renewal Successful (Hawzah Student) FRN';
        html = emailTemplate.hawzaStuAutoRenewFrn()
            .replace('[Name]', obj.donar[0].donarName)
            .replace('[CURRSYM]', obj.donationDetails.donation.currency)
            .replace('[AMOUNT]', obj.amount);
    } else if (obj.donar[0].user[0].language == 'ARB') {
        subject = 'التجديد التلقائي لطلاب  الحوزة العلمية';
        html = emailTemplate.hawzaStuAutoRenewArb()
            .replace('[Name]', obj.donar[0].donarName)
            .replace('[CURRSYM]', obj.donationDetails.donation.currency)
            .replace('[AMOUNT]', obj.amount);
    }

    let options = {
        from: 'invoice@najafyia.org',
        to: obj.donar[0].email,
        subject: subject || '',
        html: JSON.parse(html)
    };
    emailTrans.trans().sendMail(options, (err, suc) => {
        if (err) {
            res.status(500).send('error')
        } else {
            console.log('Email  sent.')
            res.status(200).send('Sent')
        }
    });
}

module.exports.reminderEmailAfter30DaysnonPayment = function (req, res) {
    DonationRecurring.find({
        $and: [{
            'isActive': {
                $eq: true
            }
        },
        {
            'nextDonationDate': {
                $lt: new Date()
            }
        },
        ]
    })
        .populate("donationDuration")
        .populate("program")
        .populate("programSubCategory")
        .populate({
            path: "donar",
            populate: {
                path: "user"
            }
        })
        .exec(function (err, donateRecurr) {
            if (donateRecurr && donateRecurr.length) {
                let orphanArray = donateRecurr.filter(obj => {
                    if (obj.program && obj.program.length && obj.program[0].programName &&
                        (obj.program[0].slug == 'orphan-sponsorship' ||
                            obj.program[0].slug == 'student-sponsorship')) {
                        return true
                    }
                })
                if (orphanArray && orphanArray.length) {

                    orphanArray.forEach(function (item) {
                        var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                        var firstDate = new Date();
                        var secondDate = new Date(item.nextDonationDate);
                        var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
                        if (diffDays == 30) {
                            item.donationDetails.isActive = false
                            item.donationDetails.donation.isActive = false;
                            item.isActive = false;
                            let subject;
                            let html;
                            if (item.donar[0].user[0].language == 'ENG') {
                                subject = configuration.email.subjectPrefixEng_Frn+' | Error: Sponsorship expiry';
                                html = emailTemplate.recNonPayAfter30Eng()
                                    .replace('[Name]', item.donar[0].donarName)
                            } else if (item.donar[0].user[0].language == 'FRN') {
                                subject = configuration.email.subjectPrefixEng_Frn+' | Error: Sponsorship expiry FRN';
                                html = emailTemplate.recNonPayAfter30Frn()
                                    .replace('[Name]', item.donar[0].donarName)
                            } else if (item.donar[0].user[0].language == 'ARB') {
                                subject = 'عدم السداد المتكرر بعد 30 يومًا';
                                html = emailTemplate.recNonPayAfter30Arb()
                                    .replace('[Name]', item.donar[0].donarName)
                            }

                            let options = {
                                from: 'invoice@najafyia.org',
                                to: item.donar[0].email,
                                subject: subject || '',
                                html: JSON.parse(html)
                            };
                            emailTrans.trans().sendMail(options, (err, suc) => {
                                if (err) {
                                    console.log('30 Reminder email error.')
                                    suc.status(500).send('error')
                                } else {
                                    console.log('30 Reminder email sent.')
                                    suc.status(200).send('Sent');
                                    DonationRecurring.update({
                                        _id: ObjectId(item.id)
                                    }, item, function (err, succ) {
                                        if (err) {
                                            console.log(err)
                                        } else {
                                            console.log(succ);
                                        }
                                    })
                                }
                            });

                        }
                    });


                }
            }
        });
}

module.exports.reminderEmailAfter30DaysNonPaymentDAZ = function (req, res) {
    DonationRecurring.find({
        $and: [{
            'isActive': {
                $eq: true
            }
        },
        {
            'noOfPaymentsRemaining': {
                $eq: 1
            }
        },
        {
            'nextDonationDate': {
                $lt: new Date()
            }
        },
        ]
    })
        .populate("donationDuration")
        .populate("program")
        .populate("programSubCategory")
        .populate({
            path: "donar",
            populate: {
                path: "user"
            }
        })
        .exec(function (err, donateRecurr) {
            if (donateRecurr && donateRecurr.length) {
                let studentArray = donateRecurr.filter(obj => {
                    if (obj.program && obj.program.length && obj.program[0].programName &&
                        (obj.program[0].slug == 'student-sponsorship')) {
                        return true
                    }
                })
                if (studentArray && studentArray.length) {
                    studentArray.forEach(function (item) {
                        var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                        var firstDate = new Date();
                        var secondDate = new Date(item.nextDonationDate);
                        var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
                        if (diffDays == 30) {
                            item.donationDetails.isActive = false
                            item.donationDetails.donation.isActive = false;
                            item.isActive = false;
                            let subject;
                            let html;
                            if (item.donar[0].user[0].language == 'ENG') {
                                subject = configuration.email.subjectPrefixEng_Frn+' | Error: DAZ Sponsorship Expiry';
                                html = emailTemplate.dazRecNonPayEng()
                                    .replace('[Name]', item.donar[0].donarName)
                            } else if (item.donar[0].user[0].language == 'FRN') {
                                subject = configuration.email.subjectPrefixEng_Frn+' | Error: DAZ Sponsorship Expiry FRN';
                                html = emailTemplate.dazRecNonPayFrn()
                                    .replace('[Name]', item.donar[0].donarName)
                            } else if (item.donar[0].user[0].language == 'ARB') {
                                subject = ' DAZ عدم سداد الدفع المتكرر';
                                html = emailTemplate.dazRecNonPayArb()
                                    .replace('[Name]', item.donar[0].donarName)
                            }

                            let options = {
                                from: 'invoice@najafyia.org',
                                to: item.donar[0].email,
                                subject: subject || '',
                                html: html
                            };
                            emailTrans.trans().sendMail(options, (err, suc) => {
                                if (err) {
                                    suc.status(500).send('error')
                                } else {
                                    console.log('After 30 Days Reminder email sent.')
                                    suc.status(200).send('Sent');
                                    DonationRecurring.update({
                                        _id: ObjectId(item.id)
                                    }, item, function (err, succ) {
                                        if (err) {
                                            console.log(err)
                                        } else {
                                            console.log(succ);
                                        }
                                    })
                                }
                            });
                        }

                    });
                }
            }
        });
}

module.exports.reminderEmailSadaqahADay = function (req, res) {
    DonationRecurring.find({
        $and: [{
            'isActive': {
                $eq: true
            }
        },
        {
            'nextDonationDate': {
                $lt: new Date()
            }
        },
        ]
    })
        .populate("donationDuration")
        .populate("program")
        .populate("programSubCategory")
        .populate({
            path: "donar",
            populate: {
                path: "user"
            }
        })
        .exec(function (err, donateRecurr) {
            if (donateRecurr && donateRecurr.length) {
                let sadaqahArray = donateRecurr.filter(obj => {
                    if (obj.program && obj.program.length && obj.program[0].programName &&
                        (obj.program[0].programName == 'Sadaqah a Day' ||
                            obj.program[0].programName == 'الصدقة اليومية' ||
                            obj.program[0].programName == 'Sadaqah par Jour')
                    ) {
                        return true
                    }
                })
                if (sadaqahArray && sadaqahArray.length) {

                    sadaqahArray.forEach(function (item) {
                        var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                        var firstDate = new Date();
                        var secondDate = new Date(item.nextDonationDate);
                        var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
                        if (diffDays == 1) {
                            item.donationDetails.isActive = false
                            item.donationDetails.donation.isActive = false;
                            item.isActive = false;
                            let subject;
                            let html;
                            if (item.donar[0].user[0].language == 'ENG') {
                                subject = configuration.email.subjectPrefixEng_Frn+' | Error: Sadaqah A Day Cancellation';
                                html = emailTemplate.sadaqaAdayEng()
                                    .replace('[Name]', item.donar[0].donarName)

                            } else if (item.donar[0].user[0].language == 'FRN') {
                                subject = configuration.email.subjectPrefixEng_Frn+' | Error: Sadaqah A Day Cancellation FRN';
                                html = emailTemplate.sadaqaAdayFrn()
                                    .replace('[Name]', item.donar[0].donarName)
                            } else if (item.donar[0].user[0].language == 'ARB') {
                                subject = 'الصدقة اليومية';
                                html = emailTemplate.sadaqaAdayArb()
                                    .replace('[Name]', item.donar[0].donarName)
                            }

                            let options = {
                                from: 'invoice@najafyia.org',
                                to: item.donar[0].email,
                                subject: subject || '',
                                html: JSON.parse(html)
                            };
                            emailTrans.trans().sendMail(options, (err, suc) => {
                                if (err) {
                                    suc.status(500).send('error')
                                } else {
                                    console.log('After 1 Day email sent.')
                                    suc.status(200).send('Sent');
                                    DonationRecurring.update({
                                        _id: ObjectId(item.id)
                                    }, item, function (err, succ) {
                                        if (err) {
                                            console.log(err)
                                        } else {
                                            console.log(succ);
                                        }
                                    })
                                }

                            });
                        }


                    });
                }
            }
        });
}

module.exports.reminderEmailAfter30DaysnonPaymentHawzah = function (req, res) {
    DonationRecurring.find({
        $and: [{
            'isActive': {
                $eq: true
            }
        },
        {
            'nextDonationDate': {
                $lt: new Date()
            }
        },
        ]
    })
        .populate("donationDuration")
        .populate("program")
        .populate("programSubCategory")
        .populate({
            path: "donar",
            populate: {
                path: "user"
            }
        })
        .exec(function (err, donateRecurr) {
            if (donateRecurr && donateRecurr.length) {
                let hawzahArray = donateRecurr.filter(obj => {
                    if (obj.program && obj.program.length && obj.program[0].programName &&
                        (obj.program[0].programName == "Hawzah Students" ||
                            obj.program[0].programName == 'طلاب الحوزة' ||
                            obj.program[0].programName == "Étudiants Hawza"
                        )) {
                        return true
                    }
                })
                if (hawzahArray && hawzahArray.length) {
                    hawzahArray.forEach(function (item) {
                        var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                        var firstDate = new Date();
                        var secondDate = new Date(item.nextDonationDate);
                        var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
                        if (diffDays == 30) {
                            item.donationDetails.isActive = false
                            item.donationDetails.donation.isActive = false;
                            item.isActive = false;
                            let subject;
                            let html;
                            if (item.donar[0].user[0].language == 'ENG') {
                                subject = configuration.email.subjectPrefixEng_Frn+' | Error: Sponsorship Expiry';
                                html = emailTemplate.days30ByeByeEng()
                                    .replace('[Name]', item.donar[0].donarName)
                                    .replace('[CURRSYM]', item.donationDetails.donation.currency)
                                    .replace('[AMOUNT]', item.amount);
                            } else if (item.donar[0].user[0].language == 'FRN') {
                                subject = configuration.email.subjectPrefixEng_Frn+' | Error: Sponsorship Expiry FRN';
                                html = emailTemplate.days30ByeByeFrn()
                                    .replace('[Name]', item.donar[0].donarName)
                                    .replace('[CURRSYM]', item.donationDetails.donation.currency)
                                    .replace('[AMOUNT]', item.amount);
                            } else if (item.donar[0].user[0].language == 'ARB') {
                                subject = '30 يومًا / إلى اللقاء';
                                html = emailTemplate.days30ByeByeArb()
                                    .replace('[Name]', item.donar[0].donarName)
                                    .replace('[CURRSYM]', item.donationDetails.donation.currency)
                                    .replace('[AMOUNT]', item.amount);
                            }

                            let options = {
                                from: 'invoice@najafyia.org',
                                to: item.donar[0].email,
                                subject: subject || '',
                                html: JSON.parse(html)
                            };
                            emailTrans.trans().sendMail(options, (err, suc) => {
                                if (err) {
                                    console.log('30 Reminder email error.')
                                    suc.status(500).send('error')
                                } else {
                                    console.log('30 Reminder email sent.')
                                    suc.status(200).send('Sent');
                                    DonationRecurring.update({
                                        _id: ObjectId(item.id)
                                    }, item, function (err, succ) {
                                        if (err) {
                                            console.log(err)
                                        } else {
                                            console.log(succ);
                                        }
                                    })
                                }
                            });
                        }
                    });
                }
            }
        });
}

module.exports.reminderEmailBefore48Autorenewal = function (req, res) {
    let today = new Date();
    let dateBefore48Hrs = new Date();
    dateBefore48Hrs.setDate(today.getDate() + 2); // Add 48 hours in days to date

    DonationRecurring.find({
        $and: [{
            'donationDetails.autoRenew': {
                $eq: true
            }
        },
        {
            'endDate': {
                $lt: dateBefore48Hrs.setHours(23, 59, 59, 0)
            }
        }
        ]
    })
        .populate("donationDuration")
        .populate("program")
        .populate("programSubCategory")
        .populate({
            path: "donar",
            populate: {
                path: "user"
            }
        })
        .exec(function (err, donateRecurr) {
            if (donateRecurr && donateRecurr.length) {

                let orphanArray = donateRecurr.filter(obj => {
                    if (obj.program && obj.program.length && obj.program[0].programName &&
                        (obj.program[0].programName == 'Orphan Sponsorship' ||
                            obj.program[0].programName == 'رعاية اليتيم' ||
                            obj.program[0].programName == 'Parrainage des orphelins' ||
                            obj.program[0].programName == 'Student Sponsorship' ||
                            obj.program[0].programName == 'رعاية الطلاب' ||
                            obj.program[0].programName == 'Parrainage étudiant')) {
                        return true
                    }
                })
                if (orphanArray && orphanArray.length) {
                    orphanArray.forEach(function (item) {
                        let subject;
                        let html;
                        if (item.donar[0].user[0].language == 'ENG') {
                            subject = configuration.email.subjectPrefixEng_Frn+' | Reminder: Sponsorship Auto Renewal';
                            html = emailTemplate.autoRenew48ReminderEng()
                                .replace('[Name]', item.donar[0].donarName)
                        } else if (item.donar[0].user[0].language == 'FRN') {
                            subject = configuration.email.subjectPrefixEng_Frn+' | Reminder: Sponsorship Auto Renewal FRN';
                            html = emailTemplate.autoRenew48ReminderFrn()
                                .replace('[Name]', item.donar[0].donarName)
                        } else if (item.donar[0].user[0].language == 'ARB') {
                            subject = 'تذكير 48 ساعة للتجديد التلقائي';
                            html = emailTemplate.autoRenew48ReminderArb()
                                .replace('[Name]', item.donar[0].donarName)
                        }

                        let options = {
                            from: 'invoice@najafyia.org',
                            to: item.donar[0].email,
                            subject: subject || '',
                            html: JSON.parse(html)
                        };
                        emailTrans.trans().sendMail(options, (err, suc) => {
                            if (err) {
                                console.log('48 Reminder email error.')
                                suc.status(500).send('error')
                            } else {
                                console.log('48 Reminder email sent.')
                                suc.status(200).send('Sent')
                            }
                        });

                    });
                }
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

function insertErrorLog(item, err) {
    Logs.create({
        error: {
            ...err,
            items: [item],
            amount: item.amount
        }
    }, console.log);
}

function payAndSave(item, invoiceNo) {
    try {
        stripe.charges.create({
            amount: item.amount * 100,
            customer: item.customerId,
            currency: item.donationDetails.donation.currencyTitle.toLowerCase() || "usd",
            description: `Recurring payment ->(${item.count || 1})` + `(${item.program[0].programName})` + 'x' + `(${item.donationDetails.donation.currency})` + `(${item.amount}) |`,
        }, function (err, charge) {
            if (err) {
                console.log(err);
            } else {
                console.log('Scheduller is now deducting payment');
                let ndd = new Date(item.nextDonationDate);
                let nextDonationDate = new Date(ndd.setMonth(item.nextDonationDate.getMonth() + 1));
                if (item.program[0].programName == 'Higher Education Loans' ||
                    item.program[0].programName == 'قرض التعليم العالي' ||
                    item.program[0].programName == 'قروض الدراسات العليا' ||
                    item.program[0].programName == "Études supérieures") {
                    nextDonationDate = new Date(ndd.setMonth(item.nextDonationDate.getMonth() + 6));
                } else {
                    // item.nextDonationDate = new Date(ndd.setMonth(item.nextDonationDate.getMonth() + 1));
                }

                item.noOfPaymentsRemaining = item.noOfPaymentsRemaining - 1;
                item.updated = Date.now();
                item.updatedBy = 'AUTO SCHEDULER';
                item.freezed = true;
                // save another Recurring for Record
                let newDR = {
                    donationDetails: item.donationDetails,
                    customerId: item.customerId,
                    count: 1,
                    nextDonationDate,
                    amount: item.amount,
                    isActive: true,
                    orphan: item.orphan,
                    endDate: item.endDate,
                    freezedDate: item.freezedDate,
                    noOfPaymentsRemaining: item.noOfPaymentsRemaining,
                    isChanged: item.isChanged,
                    startDate: item.startDate,
                    freezed: false,
                    updated: new Date(),
                    created: new Date(),
                    donar: [item.donar[0]._id],
                    donationDuration: [item.donationDuration[0] && item.donationDuration[0]._id],
                    program: [item.program[0]._id],
                }
                DonationRecurring.create(newDR, function (drErr, drRes) {
                    if (drErr) {
                        console.log(drErr)
                    } else {
                        item.save((err, drUpdate) => {
                            if (err) {
                                return insertErrorLog(item, err);
                            } else {
                                var donation = new Donation({
                                    invoiceNo,
                                    donor: item.donar[0],
                                    currency: item.donationDetails.donation.currency,
                                    currencyTitle: item.donationDetails.donation.currencyTitle,
                                    chargeId: charge.id,
                                    customerId: item.customerId,
                                    totalAmount: item.amount,
                                    donationdetails: item.donationDetails,
                                    isActive: true,
                                    created: Date.now(),
                                    updated: Date.now(),
                                    createdBy: 'AUTO SCHEDULER',
                                    updatedBy: 'NA'
                                });
                                donation.save(function (error, d) {
                                    if (error) {
                                        return insertErrorLog(item, error)
                                    } else {
                                        //donation detail
                                        donation.donationdetails.push(item.donationDetails)
                                        var donationDetail = new DonationDetail({
                                            amount: item.amount,
                                            program: item.program[0],
                                            donation: d,
                                            programSubCategory: item.programSubCategory[0],
                                            isCampaign: false,
                                            chargeId: charge.id,
                                            isActive: true,
                                            isRecurring: false,
                                            created: Date.now(),
                                            updated: Date.now(),
                                            createdBy: 'AUTO SCHEDULER',
                                            updatedBy: 'NA'

                                        });
                                        donationDetail.save(function (ddEr) {
                                            if (ddEr) {
                                                return insertErrorLog(item, ddEr)
                                            } else {
                                                if (item.program[0].programName == 'Orphan Sponsorship' ||
                                                    item.program[0].programName == 'رعاية اليتيم' ||
                                                    item.program[0].programName == 'Parrainage des orphelins'
                                                ) {
                                                    // Insert amount in Orphansponsorship
                                                    OrphanSponsorship.update({
                                                        donationdetails: item.donationDetails._id
                                                    }, {
                                                        $inc: {
                                                            sponsorshipAmount: item.amount,
                                                        }
                                                    }, function (stdErr, stdSpns) {
                                                        if (stdErr) return insertErrorLog(item, stdErr)

                                                        else sendEmailWithReciept(item, invoiceNo);
                                                    })
                                                }
                                                if (item.program[0].programName == 'Student Sponsorship' ||
                                                    item.program[0].programName == 'رعاية الطلاب' ||
                                                    item.program[0].programName == 'Parrainage étudiant') {
                                                    // Insert Student Sponsorship
                                                    StudentSponsorship.update({
                                                        donationdetails: item.donationDetails._id
                                                    }, {
                                                        $inc: {
                                                            sponsorshipAmount: item.amount,
                                                        }
                                                    }, function (stdErr, stdSpns) {
                                                        if (stdErr) return insertErrorLog(item, stdErr)

                                                        else sendEmailWithReciept(item, invoiceNo);
                                                    })

                                                } else {
                                                    sendEmailWithReciept(item, invoiceNo);
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                })
            }
        });
    } catch (error) {
        return insertErrorLog(item, error)

    }
    //Stripe payment

}

function freezePayment(item) {
    item.updated = Date.now();
    item.updatedBy = 'AUTO SCHEDULER';
    item.freezed = true;
    item.freezedDate = Date.now();
    item.save((err, drUpdate) => {
        if (err) {
            console.log(err);
        }
    });
}

function monthDifference(d1, d2) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth() + 1;
    months += d2.getMonth() + 1;
    return months <= 0 ? 0 : months;
}


//                                            ss mm hh d m week
// var reminderPayDeduct = schedule.scheduleJob('00 52 17 * * *', function () {
// reminderEmailBefore48PayDeduct();
// reminderEmailAfter48PayDeduct();
// });

function reminderEmailBefore48PayDeduct() {
    var today = new Date();
    var dateBefore48Hrs = new Date();
    dateBefore48Hrs.setDate(today.getDate() + 2); // Add 48 hours in days to date

    DonationRecurring.find({
        isActive: true,
        freezed: false,
        endDate: {
            "$gte": new Date(new Date().setHours(00, 00, 00, 0))
        },
        $and: [{
            nextDonationDate: {
                $lte: dateBefore48Hrs.setHours(23, 59, 59, 0)
            }
        }]

    }).populate({
        path: 'program',
        populate: {
            path: 'accountDetails',
            model: 'accountDetail'
        }
    }).populate({
        path: 'donar',
        populate: {
            path: 'user'
        }
    }).populate({
        path: 'program',
        model: 'program'
    }).exec(function (err, dr) {
        if (dr && dr.length) {
            dr.forEach(function (item) {
                let subject;
                let html;
                if (item.donar && item.donar.length && item.donar[0].user && item.donar[0].user.length && item.donar[0].user[0].language && item.donar[0].user[0].language == 'ENG') {
                    subject = configuration.email.subjectPrefixEng_Frn+' | Reminder: Auto Renewal Deduction ';
                    html = emailTemplate.reminderPayDeducEng()
                        .replace('[Name]', item.donar[0].donarName)
                        .replace('[CURRSYM]', item.donationDetails.donation.currency)
                        .replace('[AMOUNT]', item.amount);
                } else if (item.donar && item.donar.length && item.donar[0].user && item.donar[0].user.length && item.donar[0].user[0].language && item.donar[0].user[0].language == 'FRN') {
                    subject = configuration.email.subjectPrefixEng_Frn+' | Reminder: Auto Renewal Deduction FRN';
                    html = emailTemplate.reminderPayDeducFrn()
                        .replace('[Name]', item.donar[0].donarName)
                        .replace('[CURRSYM]', item.donationDetails.donation.currency)
                        .replace('[AMOUNT]', item.amount);
                } else if (item.donar && item.donar.length && item.donar[0].user && item.donar[0].user.length && item.donar[0].user[0].language && item.donar[0].user[0].language == 'ARB') {
                    subject = 'تذكير خصم الدفع:';
                    html = emailTemplate.reminderPayDeducArb()
                        .replace('[Name]', item.donar[0].donarName)
                        .replace('[CURRSYM]', item.donationDetails.donation.currency)
                        .replace('[AMOUNT]', item.amount);
                }

                var options = {
                    from: 'invoice@najafyia.org',
                    to: (item.donar && item.donar.length && item.donar[0].email) ? item.donar[0].email : "noor.ali@binaryvibes.com",
                    subject: subject || '',
                    html: JSON.parse(html)
                };
                emailTrans.trans().sendMail(options, (err, suc) => {
                    if (err) {
                        console.log('48 Reminder Email Before error.')
                        // res.status(500).send('error')
                    } else {
                        console.log('48 Reminder Email Before sent.')
                        // res.status(200).send('Sent')
                    }
                });

            });
        }
    });
}

function capitalize(string) {
    if (string && string.length) {
        return string.split(" ").map(str => str.charAt(0).toUpperCase() + str.slice(1)).join(" ");
    } else return "";
}

function reminderEmailAfter48PayDeduct() {
    var today = new Date();
    var dateAfter48Hrs = new Date();
    dateAfter48Hrs.setDate(today.getDate() - 2); // Subtract 48 hours in days to date

    DonationRecurring.find({
        isActive: true,
        freezed: false,
        endDate: {
            $gte: new Date(new Date().setHours(00, 00, 00, 0))
        },
        $and: [{
            nextDonationDate: {
                $gte: dateAfter48Hrs.setHours(00, 00, 00, 0)
            }
        },
        {
            nextDonationDate: {
                $lte: dateAfter48Hrs.setHours(23, 59, 59, 0)
            }
        }
        ]

    }).populate({
        path: 'program',
        populate: {
            path: 'accountDetails',
            model: 'accountDetail'
        }
    }).populate({
        path: 'donar',
        populate: {
            path: 'user'
        }
    }).populate({
        path: 'program',
        model: 'program'
    }).exec(function (err, dr) {
        dr.forEach(function (item) {
            var subject = "";
            var html = "";
            if (item.donar[0].user[0].language == 'ENG') {
                subject = configuration.email.subjectPrefixEng_Frn+' | Reminder: Recurring Payment';
                html = emailTemplate.recPay48NoticeEng()
                    .replace('[Name]', item.donar[0].donarName)
            } else if (item.donar[0].user[0].language == 'FRN') {
                subject = configuration.email.subjectPrefixEng_Frn+' | Reminder: Recurring Payment FRN';
                html = emailTemplate.recPay48NoticeFrn()
                    .replace('[Name]', item.donar[0].donarName)
            } else if (item.donar[0].user[0].language == 'ARB') {
                subject = 'دفع متكرر - 48 ساعة إشعار';
                html = emailTemplate.recPay48NoticeArb()
                    .replace('[Name]', item.donar[0].donarName)
            }

            var options = {
                from: 'invoice@najafyia.org',
                to: item.donar[0].email,
                subject: subject || '',
                html: JSON.parse(html)
            };
            emailTrans.trans().sendMail(options, (err, suc) => {
                if (err) {
                    console.log('48 Reminder Email After error.')
                    res.status(500).send('error')
                } else {
                    console.log('48 Reminder Email After sent.')
                    res.status(200).send('Sent')
                }
            });

        });
    });
}


//                                            ss mm hh d m week
// var rucurringPayments = schedule.scheduleJob('00 32 12 * * *', function () {
//     //schedulerRecurring();
// });


// function schedulerRecurring() {
//     DonationRecurring.find({
//         isActive: true,
//         freezed: false,
//         noOfPaymentsRemaining: {
//             $gte: 1
//         },
//         // endDate: { "$gte": new Date(new Date().setHours(00, 00, 00, 0)) },
//         $and: [{
//             nextDonationDate: {
//                 $gte: new Date().setHours(00, 00, 00, 0)
//             }
//         },
//         {
//             nextDonationDate: {
//                 $lte: new Date().setHours(23, 59, 59, 0)
//             }
//         }
//         ]

//     }).populate({
//         path: 'donar',
//         populate: {
//             path: 'user'
//         }
//     }).populate({
//         path: 'program',
//         model: 'program'
//     }).exec(function (err, donationRecurring) {
//         var dr = donationRecurring;
//         console.log('Recurring Payments Size For [' + new Date(Date.now()) + '] : ' + dr.length);
//         var today = new Date();
//         Donation.findOne({}, {}, {
//             sort: {
//                 'invoiceNo': -1
//             }
//         }, (dErr, lastDonation) => {
//             let invNo = lastDonation.invoiceNo;
//             dr.forEach(function (element, index) {
//                 let nmbr = invNo.substring(2, invNo.length);
//                 let alpha = invNo.substring(0, 2);
//                 nmbr = parseInt(nmbr) + index + 1;
//                 if (nmbr <= 9) nmbr = `${alpha}000${nmbr}`;
//                 else if (nmbr > 9 && nmbr <= 99) nmbr = `${alpha}00${nmbr}`;
//                 else if (nmbr > 9 && nmbr > 99 && nmbr <= 999) nmbr = `${alpha}0${nmbr}`;
//                 else if (nmbr > 9 && nmbr > 99 && nmbr > 999 && nmbr <= 9999) nmbr = `${alpha}${nmbr}`;
//                 else if (nmbr > 9 && nmbr > 99 && nmbr > 999 && nmbr > 9999) {
//                     nmbr = 0;
//                     const lastAlpha = alpha[1].charCodeAt() + 1;
//                     if (lastAlpha > 90) {
//                         let firstAlpha = alpha[0].charCodeAt();
//                         alpha = `${String.fromCharCode(firstAlpha + 1)}A`;
//                     } else {
//                         alpha = `${alpha[0]}${String.fromCharCode(lastAlpha)}`;
//                     }
//                     nmbr = `${alpha}0001`;
//                 }
//                 invNo = nmbr;
//                 if ('donationDetails' in element) {
//                     if (element.donationDetails != undefined && 'donation' in element.donationDetails) {
//                         var endMonth = element.endDate.getMonth() + 1;
//                         var endYear = element.endDate.getFullYear();
//                         var todayMonth = today.getMonth() + 1;
//                         var todayYear = today.getFullYear();
//                         var monthDiff = monthDifference(new Date(element.nextDonationDate), today);
//                         if (element.noOfPaymentsRemaining > 0) { //Verify that donation doesn't end and payment is remaining

//                             // if (monthDiff <= 1) {
//                             payAndSave(element, invNo); //element Type Of DonationRecurrings
//                             // }
//                         } else {
//                             freezePayment(element); //element Type Of DonationRecurrings
//                         }
//                     }
//                 }
//             });
//         })
//     });
// }
module.exports.sendEmailAndReciept = function (item) {
    return sendEmailWithReciept(item);
}
//Send Email Receipt
function sendEmailWithReciept(itemDr, invoiceNum) {
    if (itemDr) {
        savedFileName = 'Reciept-' + itemDr.donar[0].user[0].language + '-' + new Date().getTime() + '.pdf';
        createPDFFile(savedFileName, itemDr, invoiceNum);
    }
}

var pdf = require('html-pdf'); // npm install html-pdf — save
function createPDFFile(fileName, item, invoiceNum) {
    var payItem = "";
    var receipt = "";
    if ((item.donar[0].user[0].language || item.language) == 'ENG') {
        receipt = emailTemplate.ENG();
    } else if ((item.donar[0].user[0].language || item.language) == 'FRN') {
        receipt = emailTemplate.FRN();
    } else if ((item.donar[0].user[0].language || item.language) == 'ARB') {
        receipt = emailTemplate.ARB();
    }
    var quantity = item.donationDetails.count ? item.donationDetails.count : '-';
    payItem += " <tr><td style='text-align:center'>1</td><td style='text-align:center'>" + item.program[0].programName + "</td><td style='text-align:center'> " + quantity + " </td><td style='text-align:center'>" + item.donationDetails.donation.currency + " " + item.amount + "</td></tr>";
    receipt = receipt.replace('[DONARNAME]', item.donar[0].donarName);

    var currentDate = new Date()
    var day = currentDate.getDate()
    var month = currentDate.getMonth() + 1
    var year = currentDate.getFullYear()
    var displayDate = day + "-" + month + "-" + year;

    receipt = receipt.replace('[DATE]', displayDate);
    receipt = receipt.replace('[ITEMS]', payItem);
    receipt = receipt.replace('[TOTALAMOUNT]', item.amount);
    receipt = receipt.replace('[CURRENCY]', item.donationDetails.donation.currency);

    let options = {
        format: 'Letter',
        timeout: 600000,
    };

    if (item.donar[0].user[0].language == 'ENG') {
        options.header = {
            "height": "36.86mm",
            "contents": `
            <table style="width:88%; margin-left:4%" cellspacing="0" cellpadding="1">
            
            <thead>
                <tr>
                    <td>
                        
<svg id="Layer_1" style="width: 500px;
height: 105px;" 
data-name="Layer 1" 
xmlns="http://www.w3.org/2000/svg" viewBox="0 0 405.12 84.79">
<defs><style>.cls-1{fill:#dfb431;}.cls-2{fill:#231f20;}</style></defs>
<title>Najafia Logo</title>
<g id="_Group_" data-name="&lt;Group&gt;">
<path id="_Compound_Path_" data-name="&lt;Compound Path&gt;" class="cls-1" d="M130.47,443.16H110.88c-2.34,0-4.69,0-7,0-1,0-1.42-.32-1.3-1.32a4.12,4.12,0,0,0,0-.86c0-.34.1-.8-.47-.79a.73.73,0,0,0-.74.77,5.34,5.34,0,0,0,0,1c.12,1-.34,1.27-1.26,1.22s-1.55,0-1.49-1.25a4.89,4.89,0,0,1,1.43-3.7c1.44-1.34,3.13-.71,4.73-.76.37,0,.36.4.36.69,0,.72,0,1.44,0,2.16s.31.73.82.76.77-.25.74-.78,0-.94,0-1.41c0-1.38.92-1.95,2.23-1.44.42.16.36.49.38.8,0,.72.07,1.44.09,2.16,0,.52.29.68.76.68s.78-.18.85-.73c.39-2.94.4-2.94,3.38-2.95.83,0,1.66,0,2.49,0,.55,0,.8.21.77.76,0,.29,0,.58,0,.87,0,2.1,0,2.09,2,2.07l5.42,0c.33,0,.82.16.8-.41s-.45-.38-.76-.38c-1.84,0-3.68,0-5.52,0-.44,0-1.12.48-1.2-.53-.1-1.4.25-2.18,1.19-2.29a9.4,9.4,0,0,1,1.3,0h6.39c1.45,0,1.44,0,1.45,1.49,0,.51,0,1,0,1.52s.2.67.66.64.61-.28.59-.72c0-.65,0-1.3-.06-2s.19-1.11,1-1a4.94,4.94,0,0,0,.86,0c.61-.05.86.21.84.82s0,1.44,0,2.16c0,.54.18.79.75.78s.77-.26.77-.8c0-1.33,0-2.67,0-4,0-.83.25-1.06,1.05-1,1.61,0,1.61,0,1.62,1.56,0,1.73,0,3.46,0,5.19,0,.82-.27,1.1-1.05,1.09C134,443.14,132.24,443.16,130.47,443.16Zm-15.63-2.5c0-.32-.15-.46-.45-.48s-.56.09-.56.47.1.49.43.49S114.82,441,114.84,440.66Z" transform="translate(-88.17 -378.3)"/>
<path id="_Path_" data-name="&lt;Path&gt;" class="cls-1" d="M147.1,417.19c2.63.23,5.21-.36,7.82.79,4.52,2,9.26,3.48,13.62,5.83,4.8,2.58,9.28,5.59,12.52,10.11,2.25,3.14,3.28,6.54,2.05,10.4-.33,1-.82,1.57-2,1.44a29,29,0,0,0-3.36,0c-.58,0-.8-.21-.52-.8,2.11-4.45.71-8.2-2.36-11.59-3.62-4-8.14-6.74-12.83-9.25a120.66,120.66,0,0,0-14.46-6.34C147.39,417.68,147.14,417.66,147.1,417.19Z" transform="translate(-88.17 -378.3)"/><path id="_Path_2" data-name="&lt;Path&gt;" class="cls-1" d="M125.2,417.33c-2.73,1.1-5.2,2.07-7.65,3.09A69.93,69.93,0,0,0,99.77,430.6a17.53,17.53,0,0,0-5.67,7.24,8.67,8.67,0,0,0,.42,6.93c.33.72.26,1-.57,1-1.26,0-2.53,0-3.79,0a1.14,1.14,0,0,1-1.22-.83,10,10,0,0,1-.16-7.3,19.26,19.26,0,0,1,5.84-7.94,51.48,51.48,0,0,1,15.66-9c1.92-.73,3.82-1.5,5.74-2.24A16.69,16.69,0,0,1,125.2,417.33Z" transform="translate(-88.17 -378.3)"/><path id="_Path_3" data-name="&lt;Path&gt;" class="cls-1" d="M129.6,414.37a6.85,6.85,0,1,1,6.66,6.95A6.84,6.84,0,0,1,129.6,414.37Z" transform="translate(-88.17 -378.3)"/>
<path id="_Path_4" data-name="&lt;Path&gt;" class="cls-1" d="M139.42,382.09c-.38,3-.74,5.91-1.13,8.85q-.93,7.19-1.9,14.37c0,.36.07.93-.5.9s-.38-.53-.42-.87c-.94-7.12-1.77-14.25-2.86-21.34a4.42,4.42,0,0,1,1.68-4.56c1.74-1.5,1.67-1.58,3.26.06.48.49.95,1,1.45,1.47A1.2,1.2,0,0,1,139.42,382.09Z" transform="translate(-88.17 -378.3)"/>
<path id="_Path_5" data-name="&lt;Path&gt;" class="cls-1" d="M131.6,432.78c-3.06,0-6.13,0-9.2,0-.81,0-1.22-.19-1.17-1.09,0-.39.33-1.11-.39-1.11-.56,0-.4.68-.39,1.08,0,.81-.24,1.12-1.12,1.14s-1.23-.31-1.2-1.24c.07-2.27,1.13-3.36,3.4-3.36h.32c1.52,0,1.52,0,1.52,1.52,0,.18,0,.37,0,.55,0,.36,0,.79.52.76s.43-.41.44-.73,0-.58,0-.87c0-1.16.84-1.66,1.92-1.2.36.16.34.43.35.71,0,.54,0,1.08,0,1.63,0,.22.06.45.33.47a.44.44,0,0,0,.52-.43,12.68,12.68,0,0,0,0-1.51c-.06-.83.39-.93,1.07-.91s1.18,0,1.11.87a13.08,13.08,0,0,0,0,1.4c0,.3.05.61.46.59s.44-.31.45-.61a5.57,5.57,0,0,0,0-1.08c-.13-.89.22-1.17,1.12-1.19s1,.51,1,1.22c0,.36,0,.72,0,1.08s0,.6.44.6a.53.53,0,0,0,.6-.6c0-.32,0-.64,0-1s-.24-.95.23-1.19a2.67,2.67,0,0,1,1.7-.05c.37.07.29.44.3.72,0,.54,0,1.09,0,1.62a.45.45,0,0,0,.53.43c.27,0,.32-.26.32-.48s0-.65,0-1c0-1.32.37-1.64,1.66-1.43.45.07.48.36.49.7,0,.58,0,1.16,0,1.73,0,.29.14.48.46.49s.44-.19.45-.47,0-.8,0-1.2c0-1.19.73-1.65,1.8-1.15.35.16.31.45.31.73,0,.94,0,1.88,0,2.82.05.76-.23,1-1,1-3.14,0-6.28,0-9.43,0Z" transform="translate(-88.17 -378.3)"/>
<path id="_Path_6" data-name="&lt;Path&gt;" class="cls-1" d="M130.2,408c-.06.37-.26.52-.54.38a3.31,3.31,0,0,1-.76-.59c-5.81-5.62-11.59-11.25-17.42-16.85-.69-.66-.63-1,.08-1.59a24,24,0,0,0,1.82-1.68c.39-.38.67-.42,1,.06q7,9,14.09,18.08c.45.57.91,1.12,1.35,1.69C130,407.63,130.1,407.82,130.2,408Z" transform="translate(-88.17 -378.3)"/>
<path id="_Path_7" data-name="&lt;Path&gt;" class="cls-1" d="M141.94,408.4c-.06,0-.21-.11-.27-.22-.18-.33.1-.52.27-.74,1.18-1.51,2.35-3,3.53-4.52q6-7.6,11.94-15.23c.33-.42.59-.47,1-.11.65.63,1.28,1.27,2,1.86s.55.95,0,1.49c-2.61,2.49-5.19,5-7.78,7.53l-9.74,9.38A1.41,1.41,0,0,1,141.94,408.4Z" transform="translate(-88.17 -378.3)"/>
<path id="_Compound_Path_2" data-name="&lt;Compound Path&gt;" class="cls-1" d="M150.87,432.86c-.44,0-.87,0-1.3,0a2.26,2.26,0,0,0-2.32.94,2.19,2.19,0,0,1-2.13.81c-.21,0-.46-.05-.56-.26s.15-.36.31-.49.67-.3.55-.7-.61-.25-.94-.28a4.22,4.22,0,0,0-.87,0c-.77.07-1-.29-1-1s0-1.59,0-2.38a1.13,1.13,0,0,1,1-1.28,1,1,0,0,0,1.08-.81,2.37,2.37,0,0,1,.53-.67c.15-.16.33-.32.56-.24s.29.29.27.53c-.09.89.29,1.28,1.19,1.16.55-.07.69.29.68.74s0,.93-.05,1.4c0,.27,0,.55.33.6s.48-.25.51-.56a3.1,3.1,0,0,0,0-.43c.08-1.76.08-1.76,1.89-1.76.68,0,1.37,0,2.05,0a1.32,1.32,0,0,1,1.4,1.34v.11C154.35,432.86,154.35,432.86,150.87,432.86Zm-5.5-2.42c-.26,0-.51,0-.5.39s.21.34.44.34.52,0,.51-.39S145.6,430.45,145.37,430.44Z" transform="translate(-88.17 -378.3)"/>
<path id="_Compound_Path_3" data-name="&lt;Compound Path&gt;" class="cls-1" d="M153.07,445c.53-.6,1.63-.9,1.37-1.61s-1.28-.21-1.95-.3a3.21,3.21,0,0,0-.87.05c-.54,0-.81-.17-.8-.73,0-1.23,0-2.46,0-3.69a1.17,1.17,0,0,1,1.24-1.23c1.51-.05,3,0,4.54,0,.47,0,.65.2.65.65,0,.76,0,1.52,0,2.27,0,.34,0,.69.47.72s.49-.41.5-.76,0-.86,0-1.3c0-1.56.55-2,2.1-1.6a.63.63,0,0,1,.52.7c0,1.41,0,2.82,0,4.23,0,.49-.2.71-.72.69s-.87.11-1.29.06a1.74,1.74,0,0,0-2,.92A3,3,0,0,1,153.07,445Zm1-3.87c.3,0,.58,0,.62-.42s-.24-.54-.61-.53-.57.1-.57.48S153.76,441.17,154.1,441.15Z" transform="translate(-88.17 -378.3)"/>
<path id="_Path_8" data-name="&lt;Path&gt;" class="cls-1" d="M125.93,388.37c.68-.1.78.26.91.61l4.83,12.62c.32.84.69,1.67,1,2.52.13.37.48.87-.11,1.13s-.69-.28-.89-.61q-1.93-3.12-3.86-6.25c-1.53-2.49-3-5-4.58-7.48-.51-.8-.66-1.3.49-1.61A15.63,15.63,0,0,0,125.93,388.37Z" transform="translate(-88.17 -378.3)"/><path id="_Path_9" data-name="&lt;Path&gt;" class="cls-1" d="M139.43,405.37a.51.51,0,0,1-.43-.72c.12-.41.28-.82.43-1.22q2.72-7.17,5.44-14.35c.25-.65.61-.93,1.32-.57.54.28,1.12.49,1.69.72,1.36.56,1.38.58.6,1.86q-3.39,5.52-6.8,11L140,404.9C139.85,405.11,139.73,405.34,139.43,405.37Z" transform="translate(-88.17 -378.3)"/><path id="_Path_10" data-name="&lt;Path&gt;" class="cls-1" d="M126.75,410.43c0,.09-.09.25-.19.32a.73.73,0,0,1-.81-.07c-1.2-.66-2.41-1.31-3.6-2-3.63-2.06-7.26-4.14-10.91-6.16-.81-.44-1.11-.76-.63-1.72,1-2,.93-2,2.75-.65,4.13,3.08,8.26,6.15,12.38,9.25A2.45,2.45,0,0,1,126.75,410.43Z" transform="translate(-88.17 -378.3)"/>
<path id="_Compound_Path_4" data-name="&lt;Compound Path&gt;" class="cls-1" d="M164.73,443.16h-.43c-3.13-.09-2.74.62-2.59-2.78.07-1.33-.42-2.57-.24-3.88.1-.67.05-1.31.95-1.15.67.12,1.87-.6,1.77,1,0,.36-.48,1.26.42,1.27s.66-.86.66-1.35c0-1.62,1.18-.82,1.86-.95.9-.17.84.47.78,1.1-.08.81.14,1.66-.46,2.38-.17.19,0,.39.12.58a6.65,6.65,0,0,1,.3,3.19c0,.47-.37.55-.76.55Zm-1.5-6.75c.05-.3.19-.72-.27-.64s-.61.6-.74,1,.2.66.45.6A.72.72,0,0,0,163.23,436.41Zm2.34,3.62c-.6-.12-1.09-.11-1.27.54-.07.27,0,.51.3.57C165.47,441.29,165.18,440.4,165.57,440Z" transform="translate(-88.17 -378.3)"/>
<path id="_Path_11" data-name="&lt;Path&gt;" class="cls-1" d="M161.42,401.64c0,.41-.32.52-.61.68l-14.69,8.3c-.29.15-.6.39-.88.05s.14-.65.38-.83q4.13-3.15,8.28-6.26c1.87-1.41,3.77-2.78,5.61-4.23.61-.48.86-.3,1.09.29A10.52,10.52,0,0,1,161.42,401.64Z" transform="translate(-88.17 -378.3)"/>
<path id="_Path_12" data-name="&lt;Path&gt;" class="cls-1" d="M109.71,415.31c-1,.18-1.34-.2-1.44-.95-.31-2.29-.33-2.32,2-2.11,5.27.48,10.54,1,15.82,1.49.38,0,.9,0,.87.54s-.5.43-.85.44Z" transform="translate(-88.17 -378.3)"/><path id="_Path_13" data-name="&lt;Path&gt;" class="cls-1" d="M159.31,415.21q-6.76-.24-13.52-.5c-.36,0-.9.12-.93-.47s.52-.47.87-.5c5.64-.52,11.28-1,16.92-1.56.9-.09,1.24,0,1.06,1-.37,2.18-.31,2.19-2.45,2.1l-1.95-.12Z" transform="translate(-88.17 -378.3)"/>
<path id="_Path_14" data-name="&lt;Path&gt;" class="cls-1" d="M119.63,451.85c0,.33,0,.65,0,1a2.19,2.19,0,0,1-2.92,2.1,2,2,0,0,0-1.42,0,2.11,2.11,0,0,1-3-2.09c0-.64,0-1.29,0-1.94s.15-.89.78-.89.8.32.8.88,0,1.08.07,1.62,0,.88.58.88.61-.5.63-.94,0-1.08,0-1.62.1-.86.72-.82.89.25.9.84,0,1.16,0,1.73.11.83.65.8.55-.4.55-.78c0-.58,0-1.16,0-1.73s.24-.88.89-.88.75.39.74.91C119.62,451.2,119.63,451.53,119.63,451.85Z" transform="translate(-88.17 -378.3)"/>
<path id="_Path_15" data-name="&lt;Path&gt;" class="cls-1" d="M173.78,452.91a12.11,12.11,0,0,1-.15,2.5,1.82,1.82,0,0,1-1.82,1.4,2.1,2.1,0,0,1-2.26-1.13c-.1-.2-.22-.51,0-.58,1.11-.38.33-.85.1-1.31-.6-1.19-.31-2.47-.28-3.71,0-.48.55-.32.89-.32s.68.19.68.64c0,.65,0,1.3,0,2,0,.41.11.84.65.8s.53-.42.53-.8c0-.58.05-1.15,0-1.73s.19-.85.79-.88.86.22.84.82S173.78,451.93,173.78,452.91Z" transform="translate(-88.17 -378.3)"/>
<path id="_Compound_Path_5" data-name="&lt;Compound Path&gt;" class="cls-1" d="M95,452.42c0,.61,0,1.22,0,1.83s-.13.83-.72.81-1-.09-.91-.75-.22-.89-.88-.9-.8.33-.76.88-.31.78-.87.77-.76-.28-.76-.8c0-1.22,0-2.45,0-3.67a2.21,2.21,0,0,1,2.36-2.16,2.18,2.18,0,0,1,2.44,2.05,17.92,17.92,0,0,1,0,1.94Zm-1.58-1.24c0-.7-.22-1.21-.89-1.21s-.82.48-.83,1,.16.87.81.81C93,451.78,93.44,451.8,93.38,451.18Z" transform="translate(-88.17 -378.3)"/>
<path id="_Compound_Path_6" data-name="&lt;Compound Path&gt;" class="cls-1" d="M101.54,452.35a17.48,17.48,0,0,1,0-2.05,2.11,2.11,0,0,1,2.32-1.93,2.14,2.14,0,0,1,2.35,1.92c.12,1.3.09,2.6.12,3.9,0,.51-.19.82-.75.83s-.91-.19-.87-.81-.21-.91-.87-.91-.75.41-.74.92-.34.82-.9.82-.74-.44-.73-1,0-1.15,0-1.73Zm3.17-1.35c0-.63-.16-1.1-.88-1.06s-.76.61-.79,1.17.25.7.77.69S104.83,451.72,104.71,451Z" transform="translate(-88.17 -378.3)"/>
<path id="_Compound_Path_7" data-name="&lt;Compound Path&gt;" class="cls-1" d="M138.76,452.35c0,.54,0,1.08,0,1.62s-.14.88-.77.9-.9-.24-.85-.82c.06-.73-.28-.91-1-.92s-.72.42-.68.91-.11.83-.7.84-.89-.22-.88-.82c0-1.36,0-2.73.11-4.09a2.16,2.16,0,0,1,2.25-1.78,2.35,2.35,0,0,1,2.43,2,19.26,19.26,0,0,1,0,2.15Zm-2.49-.72c.55,0,.95-.07.92-.73s-.19-1.11-.89-1.1-.79.47-.81,1S135.68,451.72,136.27,451.63Z" transform="translate(-88.17 -378.3)"/>
<path id="_Compound_Path_8" data-name="&lt;Compound Path&gt;" class="cls-1" d="M164.39,452.05c0-.61,0-1.22,0-1.83a2.12,2.12,0,0,1,2-2.1,2.32,2.32,0,0,1,2.21,2.05c0,.21,0,.43,0,.65.08,1.93.08,2-1.8,2-.72,0-1,.33-.92,1s-.14.94-.83.93-.81-.42-.79-1,0-1.15,0-1.73Zm2.27-.79c.38,0,.62-.15.53-.59s-.09-.84-.65-.79-.55.4-.56.78S166.24,451.29,166.66,451.26Z" transform="translate(-88.17 -378.3)"/><path id="_Path_16" data-name="&lt;Path&gt;" class="cls-1" d="M142.42,444.9c1.55-.22,1.78-1.06,1.74-2.15,0-1.44,0-2.88,0-4.32,0-.71.17-1,1-1,1.72,0,1.71-.06,1.71,1.67,0,1.4,0,2.8,0,4.21s-.54,1.89-1.85,2A4.58,4.58,0,0,1,142.42,444.9Z" transform="translate(-88.17 -378.3)"/>
<path id="_Path_17" data-name="&lt;Path&gt;" class="cls-1" d="M147.43,439.26c0-1.05,0-2.1,0-3.14,0-.62.22-.85.83-.79a5.57,5.57,0,0,0,1.08,0c.52,0,.72.22.72.7,0,2.17,0,4.33,0,6.49,0,.46-.24.64-.68.64s-.79,0-1.19,0c-.55,0-.77-.23-.76-.78C147.44,441.35,147.42,440.3,147.43,439.26Z" transform="translate(-88.17 -378.3)"/>
<path id="_Path_18" data-name="&lt;Path&gt;" class="cls-1" d="M140.07,439.17c0,1.05,0,2.09,0,3.13s-.78.86-1.38.85-1.28.16-1.26-.85c0-2.05,0-4.11,0-6.16,0-.63.24-.78.82-.81,1.82-.07,1.82-.09,1.83,1.68Z" transform="translate(-88.17 -378.3)"/><path id="_Compound_Path_9" data-name="&lt;Compound Path&gt;" class="cls-1" d="M123.6,454.83c-2.58.15-3.84-1.2-3.29-3.22a2.24,2.24,0,0,1,1.79-1.67,2.31,2.31,0,0,1,2.45.72c1,1.12.72,2.5.65,3.83,0,.35-.39.39-.68.39S123.73,454.84,123.6,454.83Zm0-2.45a.89.89,0,0,0-1-.91.83.83,0,0,0-.81.95c0,.75.54.89,1.18.91S123.66,453,123.62,452.38Z" transform="translate(-88.17 -378.3)"/><path id="_Compound_Path_10" data-name="&lt;Compound Path&gt;" class="cls-1" d="M163.69,453c0,.36,0,.72,0,1.08a.61.61,0,0,1-.65.69,14.05,14.05,0,0,1-2.34,0,2.31,2.31,0,0,1-2-2.81,2.49,2.49,0,0,1,5,.11c0,.32,0,.64,0,1Zm-1.57-.47c0-.59-.17-1.19-1-1.24-.64,0-.91.43-.89,1,0,.82.67.85,1.3.95S162.09,452.92,162.12,452.51Z" transform="translate(-88.17 -378.3)"/><path id="_Compound_Path_11" data-name="&lt;Compound Path&gt;" class="cls-1" d="M180,454.63c-2.27.08-3.46-1-3.17-2.88a2.46,2.46,0,0,1,2.56-2.16,2.41,2.41,0,0,1,2.4,2.09,21.25,21.25,0,0,1,.07,2.26.61.61,0,0,1-.67.68C180.82,454.64,180.42,454.63,180,454.63Zm-.31-1.52c.37.15.62.05.6-.47s-.07-1.35-.92-1.42a.82.82,0,0,0-.95.9C178.44,452.92,179,453.14,179.71,453.11Z" transform="translate(-88.17 -378.3)"/><path id="_Path_19" data-name="&lt;Path&gt;" class="cls-1" d="M171.33,439.17c0,1,0,2,0,3,0,.78-.31,1.08-1,1s-1.56.38-1.54-.88c0-2,0-4,0-6,0-.71.21-.94.92-.92,2,.05,1.61-.15,1.65,1.57,0,.76,0,1.51,0,2.27Z" transform="translate(-88.17 -378.3)"/><path id="_Path_20" data-name="&lt;Path&gt;" class="cls-1" d="M111.62,453.06v1.19c0,.66-.45.74-1,.76s-.67-.31-.66-.77,0-1.16,0-1.73-.06-.93-.66-.91-.59.45-.59.87c0,.58,0,1.16,0,1.73s-.34.81-.9.8-.73-.33-.72-.84,0-1.29,0-1.94a2.23,2.23,0,1,1,4.45,0C111.59,452.49,111.61,452.78,111.62,453.06Z" transform="translate(-88.17 -378.3)"/><path id="_Path_21" data-name="&lt;Path&gt;" class="cls-1" d="M150.08,452.12c0,.58,0,1.16,0,1.73s-.12.91-.77.9-.74-.42-.73-.94c0-1,0-2,0-3,0-.51-.12-1-.82-1s-.87.54-.88,1.11c0,1,0,2,0,3,0,.55-.14.9-.78.91s-.74-.4-.73-.92c0-1.16,0-2.31,0-3.46a2.33,2.33,0,0,1,4.66.1c0,.54,0,1.08,0,1.62Z" transform="translate(-88.17 -378.3)"/><path id="_Compound_Path_12" data-name="&lt;Compound Path&gt;" class="cls-1" d="M154,454.67a2.5,2.5,0,0,1-3.23-2.86,2.38,2.38,0,0,1,2.42-2,2.4,2.4,0,0,1,2.46,2,7.74,7.74,0,0,1,0,1.08C155.73,454.58,155.72,454.58,154,454.67Zm.12-2c0-.71-.09-1.32-.85-1.37s-.93.4-1,.95c0,.74.52.93,1.14,1S154.18,453,154.15,452.67Z" transform="translate(-88.17 -378.3)"/><path id="_Path_22" data-name="&lt;Path&gt;" class="cls-1" d="M158.15,452.27v2.91a1.44,1.44,0,0,1-1.13,1.51c-.37.1-.85.26-1.07-.19a1,1,0,0,1,.13-1.2c.51-.37.45-.85.45-1.34v-4.74c0-.54.09-1.11.74-1.1s.89.51.88,1.13v3Z" transform="translate(-88.17 -378.3)"/><path id="_Path_23" data-name="&lt;Path&gt;" class="cls-1" d="M126,452.93a11.28,11.28,0,0,1,0-1.3,2.15,2.15,0,0,1,2.33-1.8,2,2,0,0,1,2,1.65c.06.36.16.8-.26.94s-1,.23-1.21-.34c-.17-.38-.4-.61-.82-.51s-.43.52-.43.88,0,.93,0,1.4c0,.64-.11,1-.86,1s-.8-.43-.77-1c0-.32,0-.65,0-1Z" transform="translate(-88.17 -378.3)"/><path id="_Path_24" data-name="&lt;Path&gt;" class="cls-1" d="M97.27,450.89c.14,1-.39,2.13.78,2.9.23.16.19.7,0,1a.83.83,0,0,1-.9.21,1.57,1.57,0,0,1-1.32-1.27c-.34-1.67-.07-3.38-.23-5.06,0-.49.39-.64.83-.63s.86.18.87.74S97.27,450.17,97.27,450.89Z" transform="translate(-88.17 -378.3)"/><path id="_Path_25" data-name="&lt;Path&gt;" class="cls-1" d="M141.91,460v-1.4c0-.28.1-.49.41-.53s.55,0,.57.18c.11,1.07.91.74,1.53.82.34.05.9-.22.94.4s-.56.6-1,.63c-1.33.07-1.57.29-1.31,1.24.07.25.16.49.44.56a.57.57,0,0,0,.71-.33c.22-.48.57-.89,1-.49s.13.89-.13,1.28a1.67,1.67,0,0,1-1.72.66,1.51,1.51,0,0,1-1.39-1.3,16.19,16.19,0,0,1-.13-1.71Z" transform="translate(-88.17 -378.3)"/><path id="_Path_26" data-name="&lt;Path&gt;" class="cls-1" d="M176.21,451.44c0,.8,0,1.59,0,2.39,0,.6-.22.84-.83.83s-.83-.29-.82-.86c0-1.59,0-3.18,0-4.77,0-.47.12-1,.75-1s.82.47.83,1v2.37Z" transform="translate(-88.17 -378.3)"/><path id="_Path_27" data-name="&lt;Path&gt;" class="cls-1" d="M116.51,460.83v-1c0-1.76,1.2-2.6,2.92-2.1a.5.5,0,0,1,.4.55.51.51,0,0,1-.52.57,7.71,7.71,0,0,0-1.18.07c-.38.07-.5.39-.47.75,0,.53.39.24.63.22l.43,0c.4,0,.74.05.71.57s-.38.52-.7.45c-1-.22-1.17.29-1.11,1.12,0,.39.16,1-.5,1s-.6-.56-.62-1,0-.8,0-1.19Z" transform="translate(-88.17 -378.3)"/><path id="_Path_28" data-name="&lt;Path&gt;" class="cls-1" d="M136.81,459.63a9.59,9.59,0,0,1,0,1.61,1.88,1.88,0,0,1-1.68,1.71,1.81,1.81,0,0,1-2.1-1.12,1.9,1.9,0,0,1,.56-2.34,1.4,1.4,0,0,1,1-.36c.31,0,.7-.08.76.38s-.25.49-.59.59c-.86.25-1.11.82-.68,1.41a.86.86,0,0,0,1,.45.88.88,0,0,0,.65-.89c0-.86,0-1.73,0-2.59,0-.44-.14-1.06.58-1s.45.61.48,1,0,.79,0,1.19Z" transform="translate(-88.17 -378.3)"/><path id="_Path_29" data-name="&lt;Path&gt;" class="cls-1" d="M141.33,461.59c0,.29,0,.5,0,.72s-.11.66-.53.66-.55-.27-.54-.64a10.88,10.88,0,0,0,0-1.4.87.87,0,0,0-.91-.88.82.82,0,0,0-.89.77.86.86,0,0,0,.73,1c.41.1,1,.11.76.75s-.67.32-1,.28c-1.06-.12-1.55-.79-1.54-2A1.83,1.83,0,0,1,139,459a2,2,0,0,1,2.15,1.4A7.83,7.83,0,0,1,141.33,461.59Z" transform="translate(-88.17 -378.3)"/><path id="_Path_30" data-name="&lt;Path&gt;" class="cls-1" d="M152.24,461.39a6.48,6.48,0,0,1,0-1.08,1.56,1.56,0,0,1,1.61-1.45c.92,0,1.66.33,1.8,1.34a17.38,17.38,0,0,1,.09,2.05c0,.36-.14.62-.57.62s-.56-.24-.56-.62,0-1,0-1.52c0-.32,0-.69-.47-.71a.73.73,0,0,0-.84.67c-.05.46,0,.93,0,1.4s0,.76-.51.77-.57-.32-.56-.72v-.75Z" transform="translate(-88.17 -378.3)"/><path id="_Compound_Path_13" data-name="&lt;Compound Path&gt;" class="cls-1" d="M151.64,460.87a2,2,0,1,1-2.1-2A2.11,2.11,0,0,1,151.64,460.87Zm-2-1a.86.86,0,0,0-.85.93c0,.59.22,1.11.87,1.15s.9-.52.92-1.07A.87.87,0,0,0,149.61,459.88Z" transform="translate(-88.17 -378.3)"/><path id="_Compound_Path_14" data-name="&lt;Compound Path&gt;" class="cls-1" d="M122,463.09a2,2,0,1,1,1.93-2A1.9,1.9,0,0,1,122,463.09ZM121,461c0,.6.28,1.1.91,1.11a.94.94,0,0,0,.93-1A1,1,0,0,0,122,460C121.3,460,121.15,460.48,121,461Z" transform="translate(-88.17 -378.3)"/><path id="_Path_31" data-name="&lt;Path&gt;" class="cls-1" d="M124.49,460.51c.16-.39-.39-1.34.55-1.34s.37.9.5,1.39a1.63,1.63,0,0,1,0,.54c0,.44.12.85.61.87s.73-.37.74-.86,0-1,0-1.51a.46.46,0,0,1,.46-.5c.34,0,.57.11.59.47a5.91,5.91,0,0,1-.08,2.26,1.65,1.65,0,0,1-1.91,1.24,1.62,1.62,0,0,1-1.5-1.57C124.46,461.21,124.49,460.92,124.49,460.51Z" transform="translate(-88.17 -378.3)"/><path id="_Path_32" data-name="&lt;Path&gt;" class="cls-1" d="M141,450.31c0,.65.05,1.3.11,1.94,0,.45,0,.9.56,1.18.4.19.31.71.14,1.07s-.56.3-.87.23a1.65,1.65,0,0,1-1.34-1.63c-.07-1.44-.06-2.88-.08-4.32a.74.74,0,0,1,.85-.86c.64,0,.67.42.67.88v1.51Z" transform="translate(-88.17 -378.3)"/><path id="_Path_33" data-name="&lt;Path&gt;" class="cls-1" d="M128.76,461.41c0-1.54.3-2.09,1.35-2.35a1.63,1.63,0,0,1,2.11,1.44,14.58,14.58,0,0,1,0,1.62c0,.35.06.79-.47.8s-.57-.45-.58-.85,0-.72,0-1.09-.1-.9-.69-.89-.63.4-.66.83,0,.94-.07,1.4-.07.59-.46.6-.54-.27-.53-.64Z" transform="translate(-88.17 -378.3)"/><path id="_Path_34" data-name="&lt;Path&gt;" class="cls-1" d="M146,460.75c-.2-.77.33-1.67,0-2.6-.09-.3.16-.55.49-.58s.52.23.53.54c0,1.35,0,2.7.07,4,0,.46-.09.81-.61.81s-.51-.42-.52-.78S146,461.32,146,460.75Z" transform="translate(-88.17 -378.3)"/><path id="_Path_35" data-name="&lt;Path&gt;" class="cls-1" d="M101.64,435.24a7,7,0,0,0,2.19,0c.35,0,.76-.11,1,.26s0,.49-.2.68a.86.86,0,0,1-1.07.29c-.64-.44-1.12-.62-1.79,0-.31.29-.84,0-1.16-.32a.56.56,0,0,1-.12-.7C100.77,435.08,101.22,435.33,101.64,435.24Z" transform="translate(-88.17 -378.3)"/><path id="_Path_36" data-name="&lt;Path&gt;" class="cls-1" d="M99.51,453.12a6.14,6.14,0,0,1-1,0c-.47-.08-.46-.48-.47-.84s.14-.63.55-.63l1.29,0c.5,0,1,0,1,.74s-.45.81-1,.79h-.43Z" transform="translate(-88.17 -378.3)"/><path id="_Path_37" data-name="&lt;Path&gt;" class="cls-1" d="M123.17,426.8c-.21.63-.66.9-1.24.57a.89.89,0,0,0-1.14,0,.78.78,0,0,1-1.06-.21c-.13-.13-.25-.29-.16-.48.21-.42.64-.37,1-.29a9.73,9.73,0,0,0,2,0C122.82,426.42,123.15,426.35,123.17,426.8Z" transform="translate(-88.17 -378.3)"/><path id="_Path_38" data-name="&lt;Path&gt;" class="cls-1" d="M143.3,452.93h-.75c-.49,0-.59-.33-.6-.72s.06-.74.54-.77.86,0,1.29,0,.91.1.9.77-.43.74-.94.73h-.44Z" transform="translate(-88.17 -378.3)"/><path id="_Path_39" data-name="&lt;Path&gt;" class="cls-1" d="M115.43,435.61c-.16.56-.46.9-1,.94a1,1,0,0,1-1.13-.77c-.15-.56.36-.5.68-.51A1.67,1.67,0,0,1,115.43,435.61Z" transform="translate(-88.17 -378.3)"/><path id="_Path_40" data-name="&lt;Path&gt;" class="cls-1" d="M131.2,435.22c.39.11,1-.15,1,.52a.76.76,0,0,1-.85.79c-.53,0-1.08-.22-1.11-.81S130.87,435.38,131.2,435.22Z" transform="translate(-88.17 -378.3)"/><path id="_Path_41" data-name="&lt;Path&gt;" class="cls-1" d="M124.05,445c-.39-.18-1,.21-1-.5,0-.5.52-.72,1-.71s1,.26.94.79S124.32,444.71,124.05,445Z" transform="translate(-88.17 -378.3)"/><path id="_Path_42" data-name="&lt;Path&gt;" class="cls-1" d="M109.34,444.94c-.38-.11-.92.14-.92-.39s.53-.83,1-.86a.77.77,0,0,1,.88.74C110.32,445.19,109.62,444.71,109.34,444.94Z" transform="translate(-88.17 -378.3)"/><path id="_Path_43" data-name="&lt;Path&gt;" class="cls-1" d="M159.52,435.27c.39.22,1.08-.21,1,.53,0,.53-.6.67-1.07.68a.79.79,0,0,1-.89-.75C158.6,435,159.26,435.52,159.52,435.27Z" transform="translate(-88.17 -378.3)"/><path id="_Path_44" data-name="&lt;Path&gt;" class="cls-1" d="M106.89,444.94c-.43-.11-1,.15-1-.52,0-.49.49-.65.95-.66s.91.12,1,.64C107.83,445.12,107.18,444.79,106.89,444.94Z" transform="translate(-88.17 -378.3)"/></g><path class="cls-2" d="M192.64,419.61l5.83-15.19h2.17l6.22,15.19h-2.29l-1.78-4.6h-6.35l-1.67,4.6Zm4.38-6.24h5.15l-1.58-4.2c-.49-1.28-.85-2.33-1.08-3.16a19.14,19.14,0,0,1-.82,2.91Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M208.18,419.61V404.42h1.87v15.19Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M216.24,419.61l5.83-15.19h2.17l6.22,15.19h-2.29L226.4,415H220l-1.67,4.6Zm4.38-6.24h5.15l-1.58-4.2c-.49-1.28-.84-2.33-1.08-3.16a19.14,19.14,0,0,1-.82,2.91Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M231.83,419.61v-11h1.68v1.56a3.93,3.93,0,0,1,3.5-1.81,4.77,4.77,0,0,1,1.83.35,3,3,0,0,1,1.25.94,3.74,3.74,0,0,1,.58,1.38,10.71,10.71,0,0,1,.1,1.81v6.77h-1.86v-6.69a5.2,5.2,0,0,0-.22-1.71,1.86,1.86,0,0,0-.77-.9,2.52,2.52,0,0,0-1.3-.34,3,3,0,0,0-2.06.76,3.71,3.71,0,0,0-.87,2.87v6Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M245.66,419.61l-3.36-11h1.92L246,415l.65,2.36.57-2.27,1.75-6.44h1.92l1.65,6.38.55,2.1.63-2.12,1.88-6.36h1.82l-3.44,11H252L250.27,413l-.43-1.88-2.23,8.47Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M266.15,418.25a6.87,6.87,0,0,1-2,1.25,5.79,5.79,0,0,1-2.06.36,4,4,0,0,1-2.78-.88,3,3,0,0,1-1-2.27,3,3,0,0,1,.37-1.48,3.1,3.1,0,0,1,1-1.07,4.61,4.61,0,0,1,1.35-.61,12.37,12.37,0,0,1,1.65-.28,17,17,0,0,0,3.33-.64c0-.26,0-.42,0-.49a2,2,0,0,0-.53-1.61,3.1,3.1,0,0,0-2.12-.63,3.3,3.3,0,0,0-2,.46,2.86,2.86,0,0,0-.92,1.64l-1.83-.25a4.56,4.56,0,0,1,.82-1.9,3.51,3.51,0,0,1,1.65-1.1,7.33,7.33,0,0,1,2.5-.39,6.65,6.65,0,0,1,2.29.33,3,3,0,0,1,1.29.83,2.92,2.92,0,0,1,.58,1.27,9.49,9.49,0,0,1,.1,1.72V415a26.15,26.15,0,0,0,.12,3.29,4,4,0,0,0,.47,1.32h-2A3.88,3.88,0,0,1,266.15,418.25Zm-.16-4.16a13.33,13.33,0,0,1-3.05.7,6.76,6.76,0,0,0-1.62.38,1.58,1.58,0,0,0-.74.6,1.63,1.63,0,0,0-.26.89,1.57,1.57,0,0,0,.57,1.24,2.41,2.41,0,0,0,1.65.5,3.9,3.9,0,0,0,1.92-.47,2.94,2.94,0,0,0,1.23-1.29,4.54,4.54,0,0,0,.3-1.87Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M270.75,419.61v-11h1.68v1.66a4.61,4.61,0,0,1,1.18-1.54,2.1,2.1,0,0,1,1.2-.37,3.65,3.65,0,0,1,1.92.6l-.64,1.73a2.71,2.71,0,0,0-1.37-.41,1.8,1.8,0,0,0-1.1.37,2,2,0,0,0-.7,1,7.55,7.55,0,0,0-.31,2.18v5.76Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M281.13,419.61,287,404.42h2.17l6.22,15.19h-2.3l-1.77-4.6h-6.35l-1.67,4.6Zm4.39-6.24h5.15l-1.59-4.2c-.48-1.28-.84-2.33-1.07-3.16a20.37,20.37,0,0,1-.82,2.91Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M296.68,419.61V404.42h1.87v15.19Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M307.55,419.61V404.42h2.07l8,11.93V404.42h1.93v15.19h-2.07l-8-11.94v11.94Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M329.85,418.25a7,7,0,0,1-2,1.25,5.83,5.83,0,0,1-2.06.36A4,4,0,0,1,323,419a2.94,2.94,0,0,1-1-2.27,3.09,3.09,0,0,1,.36-1.48,3.13,3.13,0,0,1,1-1.07,4.44,4.44,0,0,1,1.34-.61,12.9,12.9,0,0,1,1.66-.28,17.3,17.3,0,0,0,3.33-.64c0-.26,0-.42,0-.49a2.08,2.08,0,0,0-.53-1.61,3.15,3.15,0,0,0-2.13-.63,3.26,3.26,0,0,0-1.94.46,2.81,2.81,0,0,0-.93,1.64l-1.82-.25a4.32,4.32,0,0,1,.82-1.9,3.43,3.43,0,0,1,1.64-1.1,7.37,7.37,0,0,1,2.5-.39,6.65,6.65,0,0,1,2.29.33,3.08,3.08,0,0,1,1.3.83,3,3,0,0,1,.58,1.27,10.89,10.89,0,0,1,.09,1.72V415a26.15,26.15,0,0,0,.12,3.29,4.26,4.26,0,0,0,.47,1.32h-1.95A4.1,4.1,0,0,1,329.85,418.25Zm-.15-4.16a13.47,13.47,0,0,1-3.05.7,6.87,6.87,0,0,0-1.63.38,1.63,1.63,0,0,0-.74.6,1.62,1.62,0,0,0-.25.89,1.56,1.56,0,0,0,.56,1.24,2.45,2.45,0,0,0,1.65.5,3.9,3.9,0,0,0,1.92-.47,2.94,2.94,0,0,0,1.23-1.29,4.52,4.52,0,0,0,.31-1.87Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M332.1,423.88l.35-1.58a4.17,4.17,0,0,0,.88.14,1,1,0,0,0,.85-.38,3.8,3.8,0,0,0,.28-1.89V408.61h1.87v11.6a5.45,5.45,0,0,1-.53,2.83,2.48,2.48,0,0,1-2.24,1A5.47,5.47,0,0,1,332.1,423.88Zm2.36-17.3v-2.16h1.87v2.16Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M346.37,418.25a6.84,6.84,0,0,1-2,1.25,5.83,5.83,0,0,1-2.06.36,4,4,0,0,1-2.79-.88,2.94,2.94,0,0,1-1-2.27,3.09,3.09,0,0,1,.36-1.48,3.13,3.13,0,0,1,1-1.07,4.55,4.55,0,0,1,1.34-.61,12.9,12.9,0,0,1,1.66-.28,17.14,17.14,0,0,0,3.33-.64c0-.26,0-.42,0-.49a2.08,2.08,0,0,0-.53-1.61,3.15,3.15,0,0,0-2.13-.63,3.28,3.28,0,0,0-1.94.46,2.81,2.81,0,0,0-.93,1.64l-1.82-.25a4.43,4.43,0,0,1,.82-1.9,3.51,3.51,0,0,1,1.65-1.1,7.27,7.27,0,0,1,2.49-.39,6.61,6.61,0,0,1,2.29.33,3.08,3.08,0,0,1,1.3.83,2.92,2.92,0,0,1,.58,1.27,10.89,10.89,0,0,1,.09,1.72V415a26.15,26.15,0,0,0,.12,3.29,4.26,4.26,0,0,0,.47,1.32h-1.94A3.88,3.88,0,0,1,346.37,418.25Zm-.15-4.16a13.47,13.47,0,0,1-3.05.7,6.87,6.87,0,0,0-1.63.38,1.59,1.59,0,0,0-1,1.49,1.59,1.59,0,0,0,.56,1.24,2.46,2.46,0,0,0,1.66.5,3.89,3.89,0,0,0,1.91-.47,3,3,0,0,0,1.24-1.29,4.54,4.54,0,0,0,.3-1.87Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M351.44,419.61v-9.55h-1.65v-1.45h1.65v-1.18a5.09,5.09,0,0,1,.2-1.64,2.33,2.33,0,0,1,.95-1.18,3.4,3.4,0,0,1,1.9-.45,9.52,9.52,0,0,1,1.74.18L356,406a6.16,6.16,0,0,0-1.1-.1,1.62,1.62,0,0,0-1.2.36,2,2,0,0,0-.35,1.36v1h2.14v1.45H353.3v9.55Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M356.81,423.85l-.21-1.75a4.27,4.27,0,0,0,1.07.17,2.06,2.06,0,0,0,1-.21,1.78,1.78,0,0,0,.61-.58,11.42,11.42,0,0,0,.57-1.39c0-.1.09-.26.16-.46l-4.17-11h2l2.29,6.37c.29.81.56,1.66.8,2.55a26,26,0,0,1,.76-2.51l2.35-6.41h1.87l-4.19,11.19a22.58,22.58,0,0,1-1,2.5,3.81,3.81,0,0,1-1.14,1.35,2.68,2.68,0,0,1-1.54.43A3.77,3.77,0,0,1,356.81,423.85Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M367.52,406.56v-2.14h1.86v2.14Zm0,13.05v-11h1.86v11Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M379.41,418.25a7,7,0,0,1-2,1.25,5.79,5.79,0,0,1-2.06.36,4,4,0,0,1-2.79-.88,3.14,3.14,0,0,1-.6-3.75,3.1,3.1,0,0,1,1-1.07,4.61,4.61,0,0,1,1.35-.61,12.37,12.37,0,0,1,1.65-.28,17,17,0,0,0,3.33-.64c0-.26,0-.42,0-.49a2.08,2.08,0,0,0-.53-1.61,3.1,3.1,0,0,0-2.12-.63,3.3,3.3,0,0,0-1.95.46,2.86,2.86,0,0,0-.92,1.64l-1.83-.25a4.56,4.56,0,0,1,.82-1.9,3.51,3.51,0,0,1,1.65-1.1,7.33,7.33,0,0,1,2.5-.39,6.65,6.65,0,0,1,2.29.33,3,3,0,0,1,1.29.83,2.92,2.92,0,0,1,.58,1.27,9.49,9.49,0,0,1,.1,1.72V415a26.15,26.15,0,0,0,.12,3.29,4,4,0,0,0,.47,1.32h-2A3.88,3.88,0,0,1,379.41,418.25Zm-.16-4.16a13.33,13.33,0,0,1-3.05.7,6.76,6.76,0,0,0-1.62.38,1.58,1.58,0,0,0-.74.6,1.63,1.63,0,0,0-.26.89,1.57,1.57,0,0,0,.57,1.24,2.41,2.41,0,0,0,1.65.5,3.9,3.9,0,0,0,1.92-.47,2.94,2.94,0,0,0,1.23-1.29,4.54,4.54,0,0,0,.3-1.87Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M390.27,419.61V404.42h10.25v1.79h-8.24v4.71h7.13v1.79h-7.13v6.9Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M402.2,414.11a5.68,5.68,0,0,1,1.7-4.53,5.1,5.1,0,0,1,3.46-1.22,4.94,4.94,0,0,1,3.71,1.48,5.69,5.69,0,0,1,1.44,4.11,7.4,7.4,0,0,1-.63,3.35,4.58,4.58,0,0,1-1.86,1.89,5.39,5.39,0,0,1-2.66.67,5,5,0,0,1-3.74-1.48A5.92,5.92,0,0,1,402.2,414.11Zm1.92,0a4.69,4.69,0,0,0,.92,3.17,3,3,0,0,0,2.32,1.05,2.91,2.91,0,0,0,2.31-1.06,4.76,4.76,0,0,0,.92-3.22,4.56,4.56,0,0,0-.92-3.1,3.08,3.08,0,0,0-4.63,0A4.64,4.64,0,0,0,404.12,414.11Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M421.91,419.61V418a4,4,0,0,1-3.49,1.86,4.42,4.42,0,0,1-1.82-.37,3,3,0,0,1-1.25-.94,3.45,3.45,0,0,1-.58-1.38,10.2,10.2,0,0,1-.11-1.74v-6.82h1.86v6.1a10.4,10.4,0,0,0,.12,2,1.87,1.87,0,0,0,.74,1.15,2.25,2.25,0,0,0,1.41.42,3.14,3.14,0,0,0,1.58-.42,2.38,2.38,0,0,0,1-1.18,5.93,5.93,0,0,0,.31-2.15v-5.89h1.86v11Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M426.5,419.61v-11h1.68v1.56a4,4,0,0,1,3.51-1.81,4.77,4.77,0,0,1,1.83.35,3,3,0,0,1,1.25.94,3.74,3.74,0,0,1,.58,1.38,10.71,10.71,0,0,1,.1,1.81v6.77h-1.87v-6.69a5.25,5.25,0,0,0-.21-1.71,1.88,1.88,0,0,0-.78-.9,2.49,2.49,0,0,0-1.3-.34,3,3,0,0,0-2.05.76,3.71,3.71,0,0,0-.87,2.87v6Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M445.45,419.61v-1.39a3.41,3.41,0,0,1-3.08,1.64,4.37,4.37,0,0,1-2.42-.72,4.89,4.89,0,0,1-1.71-2,7.06,7.06,0,0,1-.6-3,7.73,7.73,0,0,1,.55-3,4.29,4.29,0,0,1,1.64-2.06,4.42,4.42,0,0,1,2.46-.71,3.65,3.65,0,0,1,1.77.42,3.74,3.74,0,0,1,1.27,1.09v-5.45h1.85v15.19Zm-5.9-5.49a4.75,4.75,0,0,0,.9,3.16,2.64,2.64,0,0,0,4.18.05,4.63,4.63,0,0,0,.85-3.05,5.17,5.17,0,0,0-.87-3.32,2.65,2.65,0,0,0-2.14-1.06,2.59,2.59,0,0,0-2.08,1A5,5,0,0,0,439.55,414.12Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M457.3,418.25a6.87,6.87,0,0,1-2,1.25,5.74,5.74,0,0,1-2.05.36,4,4,0,0,1-2.79-.88,3,3,0,0,1-1-2.27,3.09,3.09,0,0,1,.37-1.48,3.13,3.13,0,0,1,1-1.07,4.44,4.44,0,0,1,1.34-.61,12.9,12.9,0,0,1,1.66-.28,17,17,0,0,0,3.32-.64c0-.26,0-.42,0-.49a2.08,2.08,0,0,0-.52-1.61,3.15,3.15,0,0,0-2.13-.63,3.26,3.26,0,0,0-1.94.46,2.81,2.81,0,0,0-.93,1.64l-1.82-.25a4.32,4.32,0,0,1,.82-1.9,3.43,3.43,0,0,1,1.64-1.1,7.33,7.33,0,0,1,2.5-.39,6.65,6.65,0,0,1,2.29.33,3.08,3.08,0,0,1,1.3.83,3,3,0,0,1,.58,1.27,10.89,10.89,0,0,1,.09,1.72V415a26.15,26.15,0,0,0,.12,3.29,4.26,4.26,0,0,0,.47,1.32h-1.95A4.1,4.1,0,0,1,457.3,418.25Zm-.16-4.16a13.22,13.22,0,0,1-3,.7,6.87,6.87,0,0,0-1.63.38,1.58,1.58,0,0,0-1,1.49,1.57,1.57,0,0,0,.57,1.24,2.45,2.45,0,0,0,1.65.5,3.9,3.9,0,0,0,1.92-.47,2.94,2.94,0,0,0,1.23-1.29,4.54,4.54,0,0,0,.3-1.87Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M466,417.94l.27,1.65a7.07,7.07,0,0,1-1.41.17,3.24,3.24,0,0,1-1.58-.32,1.84,1.84,0,0,1-.79-.85,6.7,6.7,0,0,1-.23-2.2v-6.33H460.9v-1.45h1.36v-2.73l1.86-1.12v3.85H466v1.45h-1.88v6.43a3.09,3.09,0,0,0,.1,1,.74.74,0,0,0,.32.36,1.24,1.24,0,0,0,.64.14A6.15,6.15,0,0,0,466,417.94Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M467.83,406.56v-2.14h1.87v2.14Zm0,13.05v-11h1.87v11Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M471.84,414.11a5.68,5.68,0,0,1,1.7-4.53,5.1,5.1,0,0,1,3.46-1.22,4.93,4.93,0,0,1,3.71,1.48,5.69,5.69,0,0,1,1.45,4.11,7.39,7.39,0,0,1-.64,3.35,4.58,4.58,0,0,1-1.86,1.89,5.39,5.39,0,0,1-2.66.67,4.93,4.93,0,0,1-3.73-1.48A5.92,5.92,0,0,1,471.84,414.11Zm1.92,0a4.74,4.74,0,0,0,.92,3.17,3,3,0,0,0,2.32,1.05,2.91,2.91,0,0,0,2.31-1.06,4.76,4.76,0,0,0,.93-3.22,4.56,4.56,0,0,0-.93-3.1,3.08,3.08,0,0,0-4.63,0A4.69,4.69,0,0,0,473.76,414.11Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M484.34,419.61v-11H486v1.56a4,4,0,0,1,3.51-1.81,4.69,4.69,0,0,1,1.82.35,2.89,2.89,0,0,1,1.25.94,3.58,3.58,0,0,1,.58,1.38,10.42,10.42,0,0,1,.11,1.81v6.77h-1.87v-6.69a4.94,4.94,0,0,0-.22-1.71,1.81,1.81,0,0,0-.77-.9,2.49,2.49,0,0,0-1.3-.34,3.07,3.07,0,0,0-2.06.76,3.75,3.75,0,0,0-.86,2.87v6Z" transform="translate(-88.17 -378.3)"/></svg>
                    </td>
                </tr>
                </thead>
                </table>
                
                <table cellpadding="0" border="0" cellspacing="0" style="width:105%; margin-left:-20px; margin-top:20px; margin-bottom:25px; background:#F0C84C">
                <thead>
                    <tr>
                        <td style="height: 50px">
                <div style="
                    margin: -2px 0;
                    float: right;
                    height: 51px;
                    font-family: Microsoft Sans serif;
                    ">
                            <span style="
                    margin-right: 65px;
                    background: #fff;
                    font-size: 46px;
                    padding: 0 8px;
                ">RECEIPT</span>
                            </div>
                        
                        </td>
                    </tr></thead>
                </table>
            
            
            
            
            
            <table style="width:88%; margin:2% auto 0" cellspacing="0" cellpadding="1">
                <tbody>
                    <tr>
                        <td style="font-size:18px;font-family:helvetica;font-style:bold;margin-top:3px">Donor Name</td>
                        <td style="visibility:hidden; padding-left: 300px;font-style:bold;">Description</td>
                        <td style="font-size:18px;font-style:bold;font-family:helvetica">Date</td>
                        <td style='padding-left:5px;color:grey;font-style: italic;font-size:20px;font-weight:500;font-family:Myriad Pro'>${displayDate}</td>
                    </tr>
                    <tr>
                        <td style="color:grey;font-size:20px;font-family:Myriad Pro">${capitalize(item.donar[0].donarName)}</td>
                        <td style="visibility:hidden">Description</td>
                        <td style="font-size:18px;font-family:helvetica">Receipt #</td>
                        <td style='padding-left:5px;color:grey;font-style: italic;font-size:20px;font-family:Myriad Pro;font-weight:500'>${invoiceNum}</td>
                    </tr>
                </tbody>
            </table>
            
            
            <table style="width:88%; margin:13px auto 0;" cellspacing="0" cellpadding="5">
            <thead style="background:#F4C64E;outline: 11px solid #F4C64E; outline-offset:-11px;">
                <tr style='height:50px'>
                    <td style="font-style:bold;text-align:center; width:60px; border-right: 2px solid #000; font-size: 20px;font-family:helvetica">S No.</td>
                    <td style="font-style:bold; text-align:center; width:400px; border-right: 2px solid #000;  font-size: 20px;font-family:helvetica">Description</td>
                    <td style="font-style:bold;text-align:center; width:50px;border-right: 2px solid #000;  font-size: 20px;font-family:helvetica">Quantity</td>
                    <td style="font-style:bold;text-align:center; width:100px; font-size: 20px; font-family:helvetica">Amount</td>
                <tr>
            </thead>
            </table>`
        };

        options.footer = {
            "height": "35mm",
            "contents": `
            <table id='pageFooter' style='width:100%; position:fixed; bottom:10; left:0; right:0; margin-bottom:0'>
                <tfoot>
                    <tr>
                        <td colspan='3' style='text-align:center'>
                        This is an electronically generated reciept therefore, no signature required
                        </td>
                    </tr>
                    <tr>
                        <td colspan='3'>
                        <span style=' margin: 1px -5px 8px -4px; border: 2px solid #e2b836; display: block'></span>
                        </td>
                    </tr>
                    <tr>
                        <td style='text-align:center; border-right:1px solid grey; color:grey'> 
                        <svg version="1.1" style="margin-right:2px" fill="#f0c84b" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                            width="13px" height="13px" viewBox="0 0 96.124 96.123" 
                            xml:space="preserve">
                        <g>
                            <path d="M72.089,0.02L59.624,0C45.62,0,36.57,9.285,36.57,23.656v10.907H24.037c-1.083,0-1.96,0.878-1.96,1.961v15.803
                                c0,1.083,0.878,1.96,1.96,1.96h12.533v39.876c0,1.083,0.877,1.96,1.96,1.96h16.352c1.083,0,1.96-0.878,1.96-1.96V54.287h14.654
                                c1.083,0,1.96-0.877,1.96-1.96l0.006-15.803c0-0.52-0.207-1.018-0.574-1.386c-0.367-0.368-0.867-0.575-1.387-0.575H56.842v-9.246
                                c0-4.444,1.059-6.7,6.848-6.7l8.397-0.003c1.082,0,1.959-0.878,1.959-1.96V1.98C74.046,0.899,73.17,0.022,72.089,0.02z"/>
                        </g>

                        </svg>
                        <svg version="1.1" style="margin-right:3px" fill="#f0c84b" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                            width="13px" height="13px"  viewBox="0 0 169.063 169.063" style="enable-background:new 0 0 169.063 169.063;"
                            xml:space="preserve">
                        <g>
                            <path d="M122.406,0H46.654C20.929,0,0,20.93,0,46.655v75.752c0,25.726,20.929,46.655,46.654,46.655h75.752
                                c25.727,0,46.656-20.93,46.656-46.655V46.655C169.063,20.93,148.133,0,122.406,0z M154.063,122.407
                                c0,17.455-14.201,31.655-31.656,31.655H46.654C29.2,154.063,15,139.862,15,122.407V46.655C15,29.201,29.2,15,46.654,15h75.752
                                c17.455,0,31.656,14.201,31.656,31.655V122.407z"/>
                            <path d="M84.531,40.97c-24.021,0-43.563,19.542-43.563,43.563c0,24.02,19.542,43.561,43.563,43.561s43.563-19.541,43.563-43.561
                                C128.094,60.512,108.552,40.97,84.531,40.97z M84.531,113.093c-15.749,0-28.563-12.812-28.563-28.561
                                c0-15.75,12.813-28.563,28.563-28.563s28.563,12.813,28.563,28.563C113.094,100.281,100.28,113.093,84.531,113.093z"/>
                            <path d="M129.921,28.251c-2.89,0-5.729,1.17-7.77,3.22c-2.051,2.04-3.23,4.88-3.23,7.78c0,2.891,1.18,5.73,3.23,7.78
                                c2.04,2.04,4.88,3.22,7.77,3.22c2.9,0,5.73-1.18,7.78-3.22c2.05-2.05,3.22-4.89,3.22-7.78c0-2.9-1.17-5.74-3.22-7.78
                                C135.661,29.421,132.821,28.251,129.921,28.251z"/>
                        </g>

                        </svg>
                         <svg version="1.1" style="margin-right:5px" fill="#f0c84b" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="14px" height="15px"
                            viewBox="0 0 310 310" style="enable-background:new 0 0 310 310;" xml:space="preserve">
                        <g id="XMLID_822_">
                            <path id="XMLID_823_" d="M297.917,64.645c-11.19-13.302-31.85-18.728-71.306-18.728H83.386c-40.359,0-61.369,5.776-72.517,19.938
                                C0,79.663,0,100.008,0,128.166v53.669c0,54.551,12.896,82.248,83.386,82.248h143.226c34.216,0,53.176-4.788,65.442-16.527
                                C304.633,235.518,310,215.863,310,181.835v-53.669C310,98.471,309.159,78.006,297.917,64.645z M199.021,162.41l-65.038,33.991
                                c-1.454,0.76-3.044,1.137-4.632,1.137c-1.798,0-3.592-0.484-5.181-1.446c-2.992-1.813-4.819-5.056-4.819-8.554v-67.764
                                c0-3.492,1.822-6.732,4.808-8.546c2.987-1.814,6.702-1.938,9.801-0.328l65.038,33.772c3.309,1.718,5.387,5.134,5.392,8.861
                                C204.394,157.263,202.325,160.684,199.021,162.41z"/>
                        </g>
                        </svg>
                        Najafyia Foundation 
                        </td>
                        <td style='text-align:center; border-right:1px solid grey;color:grey'>www.najafyia.org </td>
                        <td style='text-align:center;color:grey'>info@najafyia.org</td>
                    </tr>
                </tfoot>
            </table>`,

        };
    } else if (item.donar[0].user[0].language == 'FRN') {
        options.header = {
            "height": "36.86mm",
            "contents": `
            <table style="width:88%; margin-left:4%" cellspacing="0" cellpadding="1">
            
            <thead>
                <tr>
                    <td>
                        <svg id="Layer_1" style="width: 500px;
                        height: 105px;" 
                        data-name="Layer 1" 
                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 405.12 84.79">
                        <defs><style>.cls-1{fill:#dfb431;}.cls-2{fill:#231f20;}</style></defs>
                        <title>Najafia Logo</title>
                        <g id="_Group_" data-name="&lt;Group&gt;">
                        <path id="_Compound_Path_" data-name="&lt;Compound Path&gt;" class="cls-1" d="M130.47,443.16H110.88c-2.34,0-4.69,0-7,0-1,0-1.42-.32-1.3-1.32a4.12,4.12,0,0,0,0-.86c0-.34.1-.8-.47-.79a.73.73,0,0,0-.74.77,5.34,5.34,0,0,0,0,1c.12,1-.34,1.27-1.26,1.22s-1.55,0-1.49-1.25a4.89,4.89,0,0,1,1.43-3.7c1.44-1.34,3.13-.71,4.73-.76.37,0,.36.4.36.69,0,.72,0,1.44,0,2.16s.31.73.82.76.77-.25.74-.78,0-.94,0-1.41c0-1.38.92-1.95,2.23-1.44.42.16.36.49.38.8,0,.72.07,1.44.09,2.16,0,.52.29.68.76.68s.78-.18.85-.73c.39-2.94.4-2.94,3.38-2.95.83,0,1.66,0,2.49,0,.55,0,.8.21.77.76,0,.29,0,.58,0,.87,0,2.1,0,2.09,2,2.07l5.42,0c.33,0,.82.16.8-.41s-.45-.38-.76-.38c-1.84,0-3.68,0-5.52,0-.44,0-1.12.48-1.2-.53-.1-1.4.25-2.18,1.19-2.29a9.4,9.4,0,0,1,1.3,0h6.39c1.45,0,1.44,0,1.45,1.49,0,.51,0,1,0,1.52s.2.67.66.64.61-.28.59-.72c0-.65,0-1.3-.06-2s.19-1.11,1-1a4.94,4.94,0,0,0,.86,0c.61-.05.86.21.84.82s0,1.44,0,2.16c0,.54.18.79.75.78s.77-.26.77-.8c0-1.33,0-2.67,0-4,0-.83.25-1.06,1.05-1,1.61,0,1.61,0,1.62,1.56,0,1.73,0,3.46,0,5.19,0,.82-.27,1.1-1.05,1.09C134,443.14,132.24,443.16,130.47,443.16Zm-15.63-2.5c0-.32-.15-.46-.45-.48s-.56.09-.56.47.1.49.43.49S114.82,441,114.84,440.66Z" transform="translate(-88.17 -378.3)"/>
                        <path id="_Path_" data-name="&lt;Path&gt;" class="cls-1" d="M147.1,417.19c2.63.23,5.21-.36,7.82.79,4.52,2,9.26,3.48,13.62,5.83,4.8,2.58,9.28,5.59,12.52,10.11,2.25,3.14,3.28,6.54,2.05,10.4-.33,1-.82,1.57-2,1.44a29,29,0,0,0-3.36,0c-.58,0-.8-.21-.52-.8,2.11-4.45.71-8.2-2.36-11.59-3.62-4-8.14-6.74-12.83-9.25a120.66,120.66,0,0,0-14.46-6.34C147.39,417.68,147.14,417.66,147.1,417.19Z" transform="translate(-88.17 -378.3)"/><path id="_Path_2" data-name="&lt;Path&gt;" class="cls-1" d="M125.2,417.33c-2.73,1.1-5.2,2.07-7.65,3.09A69.93,69.93,0,0,0,99.77,430.6a17.53,17.53,0,0,0-5.67,7.24,8.67,8.67,0,0,0,.42,6.93c.33.72.26,1-.57,1-1.26,0-2.53,0-3.79,0a1.14,1.14,0,0,1-1.22-.83,10,10,0,0,1-.16-7.3,19.26,19.26,0,0,1,5.84-7.94,51.48,51.48,0,0,1,15.66-9c1.92-.73,3.82-1.5,5.74-2.24A16.69,16.69,0,0,1,125.2,417.33Z" transform="translate(-88.17 -378.3)"/><path id="_Path_3" data-name="&lt;Path&gt;" class="cls-1" d="M129.6,414.37a6.85,6.85,0,1,1,6.66,6.95A6.84,6.84,0,0,1,129.6,414.37Z" transform="translate(-88.17 -378.3)"/>
                        <path id="_Path_4" data-name="&lt;Path&gt;" class="cls-1" d="M139.42,382.09c-.38,3-.74,5.91-1.13,8.85q-.93,7.19-1.9,14.37c0,.36.07.93-.5.9s-.38-.53-.42-.87c-.94-7.12-1.77-14.25-2.86-21.34a4.42,4.42,0,0,1,1.68-4.56c1.74-1.5,1.67-1.58,3.26.06.48.49.95,1,1.45,1.47A1.2,1.2,0,0,1,139.42,382.09Z" transform="translate(-88.17 -378.3)"/>
                        <path id="_Path_5" data-name="&lt;Path&gt;" class="cls-1" d="M131.6,432.78c-3.06,0-6.13,0-9.2,0-.81,0-1.22-.19-1.17-1.09,0-.39.33-1.11-.39-1.11-.56,0-.4.68-.39,1.08,0,.81-.24,1.12-1.12,1.14s-1.23-.31-1.2-1.24c.07-2.27,1.13-3.36,3.4-3.36h.32c1.52,0,1.52,0,1.52,1.52,0,.18,0,.37,0,.55,0,.36,0,.79.52.76s.43-.41.44-.73,0-.58,0-.87c0-1.16.84-1.66,1.92-1.2.36.16.34.43.35.71,0,.54,0,1.08,0,1.63,0,.22.06.45.33.47a.44.44,0,0,0,.52-.43,12.68,12.68,0,0,0,0-1.51c-.06-.83.39-.93,1.07-.91s1.18,0,1.11.87a13.08,13.08,0,0,0,0,1.4c0,.3.05.61.46.59s.44-.31.45-.61a5.57,5.57,0,0,0,0-1.08c-.13-.89.22-1.17,1.12-1.19s1,.51,1,1.22c0,.36,0,.72,0,1.08s0,.6.44.6a.53.53,0,0,0,.6-.6c0-.32,0-.64,0-1s-.24-.95.23-1.19a2.67,2.67,0,0,1,1.7-.05c.37.07.29.44.3.72,0,.54,0,1.09,0,1.62a.45.45,0,0,0,.53.43c.27,0,.32-.26.32-.48s0-.65,0-1c0-1.32.37-1.64,1.66-1.43.45.07.48.36.49.7,0,.58,0,1.16,0,1.73,0,.29.14.48.46.49s.44-.19.45-.47,0-.8,0-1.2c0-1.19.73-1.65,1.8-1.15.35.16.31.45.31.73,0,.94,0,1.88,0,2.82.05.76-.23,1-1,1-3.14,0-6.28,0-9.43,0Z" transform="translate(-88.17 -378.3)"/>
                        <path id="_Path_6" data-name="&lt;Path&gt;" class="cls-1" d="M130.2,408c-.06.37-.26.52-.54.38a3.31,3.31,0,0,1-.76-.59c-5.81-5.62-11.59-11.25-17.42-16.85-.69-.66-.63-1,.08-1.59a24,24,0,0,0,1.82-1.68c.39-.38.67-.42,1,.06q7,9,14.09,18.08c.45.57.91,1.12,1.35,1.69C130,407.63,130.1,407.82,130.2,408Z" transform="translate(-88.17 -378.3)"/>
                        <path id="_Path_7" data-name="&lt;Path&gt;" class="cls-1" d="M141.94,408.4c-.06,0-.21-.11-.27-.22-.18-.33.1-.52.27-.74,1.18-1.51,2.35-3,3.53-4.52q6-7.6,11.94-15.23c.33-.42.59-.47,1-.11.65.63,1.28,1.27,2,1.86s.55.95,0,1.49c-2.61,2.49-5.19,5-7.78,7.53l-9.74,9.38A1.41,1.41,0,0,1,141.94,408.4Z" transform="translate(-88.17 -378.3)"/>
                        <path id="_Compound_Path_2" data-name="&lt;Compound Path&gt;" class="cls-1" d="M150.87,432.86c-.44,0-.87,0-1.3,0a2.26,2.26,0,0,0-2.32.94,2.19,2.19,0,0,1-2.13.81c-.21,0-.46-.05-.56-.26s.15-.36.31-.49.67-.3.55-.7-.61-.25-.94-.28a4.22,4.22,0,0,0-.87,0c-.77.07-1-.29-1-1s0-1.59,0-2.38a1.13,1.13,0,0,1,1-1.28,1,1,0,0,0,1.08-.81,2.37,2.37,0,0,1,.53-.67c.15-.16.33-.32.56-.24s.29.29.27.53c-.09.89.29,1.28,1.19,1.16.55-.07.69.29.68.74s0,.93-.05,1.4c0,.27,0,.55.33.6s.48-.25.51-.56a3.1,3.1,0,0,0,0-.43c.08-1.76.08-1.76,1.89-1.76.68,0,1.37,0,2.05,0a1.32,1.32,0,0,1,1.4,1.34v.11C154.35,432.86,154.35,432.86,150.87,432.86Zm-5.5-2.42c-.26,0-.51,0-.5.39s.21.34.44.34.52,0,.51-.39S145.6,430.45,145.37,430.44Z" transform="translate(-88.17 -378.3)"/>
                        <path id="_Compound_Path_3" data-name="&lt;Compound Path&gt;" class="cls-1" d="M153.07,445c.53-.6,1.63-.9,1.37-1.61s-1.28-.21-1.95-.3a3.21,3.21,0,0,0-.87.05c-.54,0-.81-.17-.8-.73,0-1.23,0-2.46,0-3.69a1.17,1.17,0,0,1,1.24-1.23c1.51-.05,3,0,4.54,0,.47,0,.65.2.65.65,0,.76,0,1.52,0,2.27,0,.34,0,.69.47.72s.49-.41.5-.76,0-.86,0-1.3c0-1.56.55-2,2.1-1.6a.63.63,0,0,1,.52.7c0,1.41,0,2.82,0,4.23,0,.49-.2.71-.72.69s-.87.11-1.29.06a1.74,1.74,0,0,0-2,.92A3,3,0,0,1,153.07,445Zm1-3.87c.3,0,.58,0,.62-.42s-.24-.54-.61-.53-.57.1-.57.48S153.76,441.17,154.1,441.15Z" transform="translate(-88.17 -378.3)"/>
                        <path id="_Path_8" data-name="&lt;Path&gt;" class="cls-1" d="M125.93,388.37c.68-.1.78.26.91.61l4.83,12.62c.32.84.69,1.67,1,2.52.13.37.48.87-.11,1.13s-.69-.28-.89-.61q-1.93-3.12-3.86-6.25c-1.53-2.49-3-5-4.58-7.48-.51-.8-.66-1.3.49-1.61A15.63,15.63,0,0,0,125.93,388.37Z" transform="translate(-88.17 -378.3)"/><path id="_Path_9" data-name="&lt;Path&gt;" class="cls-1" d="M139.43,405.37a.51.51,0,0,1-.43-.72c.12-.41.28-.82.43-1.22q2.72-7.17,5.44-14.35c.25-.65.61-.93,1.32-.57.54.28,1.12.49,1.69.72,1.36.56,1.38.58.6,1.86q-3.39,5.52-6.8,11L140,404.9C139.85,405.11,139.73,405.34,139.43,405.37Z" transform="translate(-88.17 -378.3)"/><path id="_Path_10" data-name="&lt;Path&gt;" class="cls-1" d="M126.75,410.43c0,.09-.09.25-.19.32a.73.73,0,0,1-.81-.07c-1.2-.66-2.41-1.31-3.6-2-3.63-2.06-7.26-4.14-10.91-6.16-.81-.44-1.11-.76-.63-1.72,1-2,.93-2,2.75-.65,4.13,3.08,8.26,6.15,12.38,9.25A2.45,2.45,0,0,1,126.75,410.43Z" transform="translate(-88.17 -378.3)"/>
                        <path id="_Compound_Path_4" data-name="&lt;Compound Path&gt;" class="cls-1" d="M164.73,443.16h-.43c-3.13-.09-2.74.62-2.59-2.78.07-1.33-.42-2.57-.24-3.88.1-.67.05-1.31.95-1.15.67.12,1.87-.6,1.77,1,0,.36-.48,1.26.42,1.27s.66-.86.66-1.35c0-1.62,1.18-.82,1.86-.95.9-.17.84.47.78,1.1-.08.81.14,1.66-.46,2.38-.17.19,0,.39.12.58a6.65,6.65,0,0,1,.3,3.19c0,.47-.37.55-.76.55Zm-1.5-6.75c.05-.3.19-.72-.27-.64s-.61.6-.74,1,.2.66.45.6A.72.72,0,0,0,163.23,436.41Zm2.34,3.62c-.6-.12-1.09-.11-1.27.54-.07.27,0,.51.3.57C165.47,441.29,165.18,440.4,165.57,440Z" transform="translate(-88.17 -378.3)"/>
                        <path id="_Path_11" data-name="&lt;Path&gt;" class="cls-1" d="M161.42,401.64c0,.41-.32.52-.61.68l-14.69,8.3c-.29.15-.6.39-.88.05s.14-.65.38-.83q4.13-3.15,8.28-6.26c1.87-1.41,3.77-2.78,5.61-4.23.61-.48.86-.3,1.09.29A10.52,10.52,0,0,1,161.42,401.64Z" transform="translate(-88.17 -378.3)"/>
                        <path id="_Path_12" data-name="&lt;Path&gt;" class="cls-1" d="M109.71,415.31c-1,.18-1.34-.2-1.44-.95-.31-2.29-.33-2.32,2-2.11,5.27.48,10.54,1,15.82,1.49.38,0,.9,0,.87.54s-.5.43-.85.44Z" transform="translate(-88.17 -378.3)"/><path id="_Path_13" data-name="&lt;Path&gt;" class="cls-1" d="M159.31,415.21q-6.76-.24-13.52-.5c-.36,0-.9.12-.93-.47s.52-.47.87-.5c5.64-.52,11.28-1,16.92-1.56.9-.09,1.24,0,1.06,1-.37,2.18-.31,2.19-2.45,2.1l-1.95-.12Z" transform="translate(-88.17 -378.3)"/>
                        <path id="_Path_14" data-name="&lt;Path&gt;" class="cls-1" d="M119.63,451.85c0,.33,0,.65,0,1a2.19,2.19,0,0,1-2.92,2.1,2,2,0,0,0-1.42,0,2.11,2.11,0,0,1-3-2.09c0-.64,0-1.29,0-1.94s.15-.89.78-.89.8.32.8.88,0,1.08.07,1.62,0,.88.58.88.61-.5.63-.94,0-1.08,0-1.62.1-.86.72-.82.89.25.9.84,0,1.16,0,1.73.11.83.65.8.55-.4.55-.78c0-.58,0-1.16,0-1.73s.24-.88.89-.88.75.39.74.91C119.62,451.2,119.63,451.53,119.63,451.85Z" transform="translate(-88.17 -378.3)"/>
                        <path id="_Path_15" data-name="&lt;Path&gt;" class="cls-1" d="M173.78,452.91a12.11,12.11,0,0,1-.15,2.5,1.82,1.82,0,0,1-1.82,1.4,2.1,2.1,0,0,1-2.26-1.13c-.1-.2-.22-.51,0-.58,1.11-.38.33-.85.1-1.31-.6-1.19-.31-2.47-.28-3.71,0-.48.55-.32.89-.32s.68.19.68.64c0,.65,0,1.3,0,2,0,.41.11.84.65.8s.53-.42.53-.8c0-.58.05-1.15,0-1.73s.19-.85.79-.88.86.22.84.82S173.78,451.93,173.78,452.91Z" transform="translate(-88.17 -378.3)"/>
                        <path id="_Compound_Path_5" data-name="&lt;Compound Path&gt;" class="cls-1" d="M95,452.42c0,.61,0,1.22,0,1.83s-.13.83-.72.81-1-.09-.91-.75-.22-.89-.88-.9-.8.33-.76.88-.31.78-.87.77-.76-.28-.76-.8c0-1.22,0-2.45,0-3.67a2.21,2.21,0,0,1,2.36-2.16,2.18,2.18,0,0,1,2.44,2.05,17.92,17.92,0,0,1,0,1.94Zm-1.58-1.24c0-.7-.22-1.21-.89-1.21s-.82.48-.83,1,.16.87.81.81C93,451.78,93.44,451.8,93.38,451.18Z" transform="translate(-88.17 -378.3)"/>
                        <path id="_Compound_Path_6" data-name="&lt;Compound Path&gt;" class="cls-1" d="M101.54,452.35a17.48,17.48,0,0,1,0-2.05,2.11,2.11,0,0,1,2.32-1.93,2.14,2.14,0,0,1,2.35,1.92c.12,1.3.09,2.6.12,3.9,0,.51-.19.82-.75.83s-.91-.19-.87-.81-.21-.91-.87-.91-.75.41-.74.92-.34.82-.9.82-.74-.44-.73-1,0-1.15,0-1.73Zm3.17-1.35c0-.63-.16-1.1-.88-1.06s-.76.61-.79,1.17.25.7.77.69S104.83,451.72,104.71,451Z" transform="translate(-88.17 -378.3)"/>
                        <path id="_Compound_Path_7" data-name="&lt;Compound Path&gt;" class="cls-1" d="M138.76,452.35c0,.54,0,1.08,0,1.62s-.14.88-.77.9-.9-.24-.85-.82c.06-.73-.28-.91-1-.92s-.72.42-.68.91-.11.83-.7.84-.89-.22-.88-.82c0-1.36,0-2.73.11-4.09a2.16,2.16,0,0,1,2.25-1.78,2.35,2.35,0,0,1,2.43,2,19.26,19.26,0,0,1,0,2.15Zm-2.49-.72c.55,0,.95-.07.92-.73s-.19-1.11-.89-1.1-.79.47-.81,1S135.68,451.72,136.27,451.63Z" transform="translate(-88.17 -378.3)"/>
                        <path id="_Compound_Path_8" data-name="&lt;Compound Path&gt;" class="cls-1" d="M164.39,452.05c0-.61,0-1.22,0-1.83a2.12,2.12,0,0,1,2-2.1,2.32,2.32,0,0,1,2.21,2.05c0,.21,0,.43,0,.65.08,1.93.08,2-1.8,2-.72,0-1,.33-.92,1s-.14.94-.83.93-.81-.42-.79-1,0-1.15,0-1.73Zm2.27-.79c.38,0,.62-.15.53-.59s-.09-.84-.65-.79-.55.4-.56.78S166.24,451.29,166.66,451.26Z" transform="translate(-88.17 -378.3)"/><path id="_Path_16" data-name="&lt;Path&gt;" class="cls-1" d="M142.42,444.9c1.55-.22,1.78-1.06,1.74-2.15,0-1.44,0-2.88,0-4.32,0-.71.17-1,1-1,1.72,0,1.71-.06,1.71,1.67,0,1.4,0,2.8,0,4.21s-.54,1.89-1.85,2A4.58,4.58,0,0,1,142.42,444.9Z" transform="translate(-88.17 -378.3)"/>
                        <path id="_Path_17" data-name="&lt;Path&gt;" class="cls-1" d="M147.43,439.26c0-1.05,0-2.1,0-3.14,0-.62.22-.85.83-.79a5.57,5.57,0,0,0,1.08,0c.52,0,.72.22.72.7,0,2.17,0,4.33,0,6.49,0,.46-.24.64-.68.64s-.79,0-1.19,0c-.55,0-.77-.23-.76-.78C147.44,441.35,147.42,440.3,147.43,439.26Z" transform="translate(-88.17 -378.3)"/>
                        <path id="_Path_18" data-name="&lt;Path&gt;" class="cls-1" d="M140.07,439.17c0,1.05,0,2.09,0,3.13s-.78.86-1.38.85-1.28.16-1.26-.85c0-2.05,0-4.11,0-6.16,0-.63.24-.78.82-.81,1.82-.07,1.82-.09,1.83,1.68Z" transform="translate(-88.17 -378.3)"/><path id="_Compound_Path_9" data-name="&lt;Compound Path&gt;" class="cls-1" d="M123.6,454.83c-2.58.15-3.84-1.2-3.29-3.22a2.24,2.24,0,0,1,1.79-1.67,2.31,2.31,0,0,1,2.45.72c1,1.12.72,2.5.65,3.83,0,.35-.39.39-.68.39S123.73,454.84,123.6,454.83Zm0-2.45a.89.89,0,0,0-1-.91.83.83,0,0,0-.81.95c0,.75.54.89,1.18.91S123.66,453,123.62,452.38Z" transform="translate(-88.17 -378.3)"/><path id="_Compound_Path_10" data-name="&lt;Compound Path&gt;" class="cls-1" d="M163.69,453c0,.36,0,.72,0,1.08a.61.61,0,0,1-.65.69,14.05,14.05,0,0,1-2.34,0,2.31,2.31,0,0,1-2-2.81,2.49,2.49,0,0,1,5,.11c0,.32,0,.64,0,1Zm-1.57-.47c0-.59-.17-1.19-1-1.24-.64,0-.91.43-.89,1,0,.82.67.85,1.3.95S162.09,452.92,162.12,452.51Z" transform="translate(-88.17 -378.3)"/><path id="_Compound_Path_11" data-name="&lt;Compound Path&gt;" class="cls-1" d="M180,454.63c-2.27.08-3.46-1-3.17-2.88a2.46,2.46,0,0,1,2.56-2.16,2.41,2.41,0,0,1,2.4,2.09,21.25,21.25,0,0,1,.07,2.26.61.61,0,0,1-.67.68C180.82,454.64,180.42,454.63,180,454.63Zm-.31-1.52c.37.15.62.05.6-.47s-.07-1.35-.92-1.42a.82.82,0,0,0-.95.9C178.44,452.92,179,453.14,179.71,453.11Z" transform="translate(-88.17 -378.3)"/><path id="_Path_19" data-name="&lt;Path&gt;" class="cls-1" d="M171.33,439.17c0,1,0,2,0,3,0,.78-.31,1.08-1,1s-1.56.38-1.54-.88c0-2,0-4,0-6,0-.71.21-.94.92-.92,2,.05,1.61-.15,1.65,1.57,0,.76,0,1.51,0,2.27Z" transform="translate(-88.17 -378.3)"/><path id="_Path_20" data-name="&lt;Path&gt;" class="cls-1" d="M111.62,453.06v1.19c0,.66-.45.74-1,.76s-.67-.31-.66-.77,0-1.16,0-1.73-.06-.93-.66-.91-.59.45-.59.87c0,.58,0,1.16,0,1.73s-.34.81-.9.8-.73-.33-.72-.84,0-1.29,0-1.94a2.23,2.23,0,1,1,4.45,0C111.59,452.49,111.61,452.78,111.62,453.06Z" transform="translate(-88.17 -378.3)"/><path id="_Path_21" data-name="&lt;Path&gt;" class="cls-1" d="M150.08,452.12c0,.58,0,1.16,0,1.73s-.12.91-.77.9-.74-.42-.73-.94c0-1,0-2,0-3,0-.51-.12-1-.82-1s-.87.54-.88,1.11c0,1,0,2,0,3,0,.55-.14.9-.78.91s-.74-.4-.73-.92c0-1.16,0-2.31,0-3.46a2.33,2.33,0,0,1,4.66.1c0,.54,0,1.08,0,1.62Z" transform="translate(-88.17 -378.3)"/><path id="_Compound_Path_12" data-name="&lt;Compound Path&gt;" class="cls-1" d="M154,454.67a2.5,2.5,0,0,1-3.23-2.86,2.38,2.38,0,0,1,2.42-2,2.4,2.4,0,0,1,2.46,2,7.74,7.74,0,0,1,0,1.08C155.73,454.58,155.72,454.58,154,454.67Zm.12-2c0-.71-.09-1.32-.85-1.37s-.93.4-1,.95c0,.74.52.93,1.14,1S154.18,453,154.15,452.67Z" transform="translate(-88.17 -378.3)"/><path id="_Path_22" data-name="&lt;Path&gt;" class="cls-1" d="M158.15,452.27v2.91a1.44,1.44,0,0,1-1.13,1.51c-.37.1-.85.26-1.07-.19a1,1,0,0,1,.13-1.2c.51-.37.45-.85.45-1.34v-4.74c0-.54.09-1.11.74-1.1s.89.51.88,1.13v3Z" transform="translate(-88.17 -378.3)"/><path id="_Path_23" data-name="&lt;Path&gt;" class="cls-1" d="M126,452.93a11.28,11.28,0,0,1,0-1.3,2.15,2.15,0,0,1,2.33-1.8,2,2,0,0,1,2,1.65c.06.36.16.8-.26.94s-1,.23-1.21-.34c-.17-.38-.4-.61-.82-.51s-.43.52-.43.88,0,.93,0,1.4c0,.64-.11,1-.86,1s-.8-.43-.77-1c0-.32,0-.65,0-1Z" transform="translate(-88.17 -378.3)"/><path id="_Path_24" data-name="&lt;Path&gt;" class="cls-1" d="M97.27,450.89c.14,1-.39,2.13.78,2.9.23.16.19.7,0,1a.83.83,0,0,1-.9.21,1.57,1.57,0,0,1-1.32-1.27c-.34-1.67-.07-3.38-.23-5.06,0-.49.39-.64.83-.63s.86.18.87.74S97.27,450.17,97.27,450.89Z" transform="translate(-88.17 -378.3)"/><path id="_Path_25" data-name="&lt;Path&gt;" class="cls-1" d="M141.91,460v-1.4c0-.28.1-.49.41-.53s.55,0,.57.18c.11,1.07.91.74,1.53.82.34.05.9-.22.94.4s-.56.6-1,.63c-1.33.07-1.57.29-1.31,1.24.07.25.16.49.44.56a.57.57,0,0,0,.71-.33c.22-.48.57-.89,1-.49s.13.89-.13,1.28a1.67,1.67,0,0,1-1.72.66,1.51,1.51,0,0,1-1.39-1.3,16.19,16.19,0,0,1-.13-1.71Z" transform="translate(-88.17 -378.3)"/><path id="_Path_26" data-name="&lt;Path&gt;" class="cls-1" d="M176.21,451.44c0,.8,0,1.59,0,2.39,0,.6-.22.84-.83.83s-.83-.29-.82-.86c0-1.59,0-3.18,0-4.77,0-.47.12-1,.75-1s.82.47.83,1v2.37Z" transform="translate(-88.17 -378.3)"/><path id="_Path_27" data-name="&lt;Path&gt;" class="cls-1" d="M116.51,460.83v-1c0-1.76,1.2-2.6,2.92-2.1a.5.5,0,0,1,.4.55.51.51,0,0,1-.52.57,7.71,7.71,0,0,0-1.18.07c-.38.07-.5.39-.47.75,0,.53.39.24.63.22l.43,0c.4,0,.74.05.71.57s-.38.52-.7.45c-1-.22-1.17.29-1.11,1.12,0,.39.16,1-.5,1s-.6-.56-.62-1,0-.8,0-1.19Z" transform="translate(-88.17 -378.3)"/><path id="_Path_28" data-name="&lt;Path&gt;" class="cls-1" d="M136.81,459.63a9.59,9.59,0,0,1,0,1.61,1.88,1.88,0,0,1-1.68,1.71,1.81,1.81,0,0,1-2.1-1.12,1.9,1.9,0,0,1,.56-2.34,1.4,1.4,0,0,1,1-.36c.31,0,.7-.08.76.38s-.25.49-.59.59c-.86.25-1.11.82-.68,1.41a.86.86,0,0,0,1,.45.88.88,0,0,0,.65-.89c0-.86,0-1.73,0-2.59,0-.44-.14-1.06.58-1s.45.61.48,1,0,.79,0,1.19Z" transform="translate(-88.17 -378.3)"/><path id="_Path_29" data-name="&lt;Path&gt;" class="cls-1" d="M141.33,461.59c0,.29,0,.5,0,.72s-.11.66-.53.66-.55-.27-.54-.64a10.88,10.88,0,0,0,0-1.4.87.87,0,0,0-.91-.88.82.82,0,0,0-.89.77.86.86,0,0,0,.73,1c.41.1,1,.11.76.75s-.67.32-1,.28c-1.06-.12-1.55-.79-1.54-2A1.83,1.83,0,0,1,139,459a2,2,0,0,1,2.15,1.4A7.83,7.83,0,0,1,141.33,461.59Z" transform="translate(-88.17 -378.3)"/><path id="_Path_30" data-name="&lt;Path&gt;" class="cls-1" d="M152.24,461.39a6.48,6.48,0,0,1,0-1.08,1.56,1.56,0,0,1,1.61-1.45c.92,0,1.66.33,1.8,1.34a17.38,17.38,0,0,1,.09,2.05c0,.36-.14.62-.57.62s-.56-.24-.56-.62,0-1,0-1.52c0-.32,0-.69-.47-.71a.73.73,0,0,0-.84.67c-.05.46,0,.93,0,1.4s0,.76-.51.77-.57-.32-.56-.72v-.75Z" transform="translate(-88.17 -378.3)"/><path id="_Compound_Path_13" data-name="&lt;Compound Path&gt;" class="cls-1" d="M151.64,460.87a2,2,0,1,1-2.1-2A2.11,2.11,0,0,1,151.64,460.87Zm-2-1a.86.86,0,0,0-.85.93c0,.59.22,1.11.87,1.15s.9-.52.92-1.07A.87.87,0,0,0,149.61,459.88Z" transform="translate(-88.17 -378.3)"/><path id="_Compound_Path_14" data-name="&lt;Compound Path&gt;" class="cls-1" d="M122,463.09a2,2,0,1,1,1.93-2A1.9,1.9,0,0,1,122,463.09ZM121,461c0,.6.28,1.1.91,1.11a.94.94,0,0,0,.93-1A1,1,0,0,0,122,460C121.3,460,121.15,460.48,121,461Z" transform="translate(-88.17 -378.3)"/><path id="_Path_31" data-name="&lt;Path&gt;" class="cls-1" d="M124.49,460.51c.16-.39-.39-1.34.55-1.34s.37.9.5,1.39a1.63,1.63,0,0,1,0,.54c0,.44.12.85.61.87s.73-.37.74-.86,0-1,0-1.51a.46.46,0,0,1,.46-.5c.34,0,.57.11.59.47a5.91,5.91,0,0,1-.08,2.26,1.65,1.65,0,0,1-1.91,1.24,1.62,1.62,0,0,1-1.5-1.57C124.46,461.21,124.49,460.92,124.49,460.51Z" transform="translate(-88.17 -378.3)"/><path id="_Path_32" data-name="&lt;Path&gt;" class="cls-1" d="M141,450.31c0,.65.05,1.3.11,1.94,0,.45,0,.9.56,1.18.4.19.31.71.14,1.07s-.56.3-.87.23a1.65,1.65,0,0,1-1.34-1.63c-.07-1.44-.06-2.88-.08-4.32a.74.74,0,0,1,.85-.86c.64,0,.67.42.67.88v1.51Z" transform="translate(-88.17 -378.3)"/><path id="_Path_33" data-name="&lt;Path&gt;" class="cls-1" d="M128.76,461.41c0-1.54.3-2.09,1.35-2.35a1.63,1.63,0,0,1,2.11,1.44,14.58,14.58,0,0,1,0,1.62c0,.35.06.79-.47.8s-.57-.45-.58-.85,0-.72,0-1.09-.1-.9-.69-.89-.63.4-.66.83,0,.94-.07,1.4-.07.59-.46.6-.54-.27-.53-.64Z" transform="translate(-88.17 -378.3)"/><path id="_Path_34" data-name="&lt;Path&gt;" class="cls-1" d="M146,460.75c-.2-.77.33-1.67,0-2.6-.09-.3.16-.55.49-.58s.52.23.53.54c0,1.35,0,2.7.07,4,0,.46-.09.81-.61.81s-.51-.42-.52-.78S146,461.32,146,460.75Z" transform="translate(-88.17 -378.3)"/><path id="_Path_35" data-name="&lt;Path&gt;" class="cls-1" d="M101.64,435.24a7,7,0,0,0,2.19,0c.35,0,.76-.11,1,.26s0,.49-.2.68a.86.86,0,0,1-1.07.29c-.64-.44-1.12-.62-1.79,0-.31.29-.84,0-1.16-.32a.56.56,0,0,1-.12-.7C100.77,435.08,101.22,435.33,101.64,435.24Z" transform="translate(-88.17 -378.3)"/><path id="_Path_36" data-name="&lt;Path&gt;" class="cls-1" d="M99.51,453.12a6.14,6.14,0,0,1-1,0c-.47-.08-.46-.48-.47-.84s.14-.63.55-.63l1.29,0c.5,0,1,0,1,.74s-.45.81-1,.79h-.43Z" transform="translate(-88.17 -378.3)"/><path id="_Path_37" data-name="&lt;Path&gt;" class="cls-1" d="M123.17,426.8c-.21.63-.66.9-1.24.57a.89.89,0,0,0-1.14,0,.78.78,0,0,1-1.06-.21c-.13-.13-.25-.29-.16-.48.21-.42.64-.37,1-.29a9.73,9.73,0,0,0,2,0C122.82,426.42,123.15,426.35,123.17,426.8Z" transform="translate(-88.17 -378.3)"/><path id="_Path_38" data-name="&lt;Path&gt;" class="cls-1" d="M143.3,452.93h-.75c-.49,0-.59-.33-.6-.72s.06-.74.54-.77.86,0,1.29,0,.91.1.9.77-.43.74-.94.73h-.44Z" transform="translate(-88.17 -378.3)"/><path id="_Path_39" data-name="&lt;Path&gt;" class="cls-1" d="M115.43,435.61c-.16.56-.46.9-1,.94a1,1,0,0,1-1.13-.77c-.15-.56.36-.5.68-.51A1.67,1.67,0,0,1,115.43,435.61Z" transform="translate(-88.17 -378.3)"/><path id="_Path_40" data-name="&lt;Path&gt;" class="cls-1" d="M131.2,435.22c.39.11,1-.15,1,.52a.76.76,0,0,1-.85.79c-.53,0-1.08-.22-1.11-.81S130.87,435.38,131.2,435.22Z" transform="translate(-88.17 -378.3)"/><path id="_Path_41" data-name="&lt;Path&gt;" class="cls-1" d="M124.05,445c-.39-.18-1,.21-1-.5,0-.5.52-.72,1-.71s1,.26.94.79S124.32,444.71,124.05,445Z" transform="translate(-88.17 -378.3)"/><path id="_Path_42" data-name="&lt;Path&gt;" class="cls-1" d="M109.34,444.94c-.38-.11-.92.14-.92-.39s.53-.83,1-.86a.77.77,0,0,1,.88.74C110.32,445.19,109.62,444.71,109.34,444.94Z" transform="translate(-88.17 -378.3)"/><path id="_Path_43" data-name="&lt;Path&gt;" class="cls-1" d="M159.52,435.27c.39.22,1.08-.21,1,.53,0,.53-.6.67-1.07.68a.79.79,0,0,1-.89-.75C158.6,435,159.26,435.52,159.52,435.27Z" transform="translate(-88.17 -378.3)"/><path id="_Path_44" data-name="&lt;Path&gt;" class="cls-1" d="M106.89,444.94c-.43-.11-1,.15-1-.52,0-.49.49-.65.95-.66s.91.12,1,.64C107.83,445.12,107.18,444.79,106.89,444.94Z" transform="translate(-88.17 -378.3)"/></g><path class="cls-2" d="M192.64,419.61l5.83-15.19h2.17l6.22,15.19h-2.29l-1.78-4.6h-6.35l-1.67,4.6Zm4.38-6.24h5.15l-1.58-4.2c-.49-1.28-.85-2.33-1.08-3.16a19.14,19.14,0,0,1-.82,2.91Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M208.18,419.61V404.42h1.87v15.19Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M216.24,419.61l5.83-15.19h2.17l6.22,15.19h-2.29L226.4,415H220l-1.67,4.6Zm4.38-6.24h5.15l-1.58-4.2c-.49-1.28-.84-2.33-1.08-3.16a19.14,19.14,0,0,1-.82,2.91Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M231.83,419.61v-11h1.68v1.56a3.93,3.93,0,0,1,3.5-1.81,4.77,4.77,0,0,1,1.83.35,3,3,0,0,1,1.25.94,3.74,3.74,0,0,1,.58,1.38,10.71,10.71,0,0,1,.1,1.81v6.77h-1.86v-6.69a5.2,5.2,0,0,0-.22-1.71,1.86,1.86,0,0,0-.77-.9,2.52,2.52,0,0,0-1.3-.34,3,3,0,0,0-2.06.76,3.71,3.71,0,0,0-.87,2.87v6Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M245.66,419.61l-3.36-11h1.92L246,415l.65,2.36.57-2.27,1.75-6.44h1.92l1.65,6.38.55,2.1.63-2.12,1.88-6.36h1.82l-3.44,11H252L250.27,413l-.43-1.88-2.23,8.47Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M266.15,418.25a6.87,6.87,0,0,1-2,1.25,5.79,5.79,0,0,1-2.06.36,4,4,0,0,1-2.78-.88,3,3,0,0,1-1-2.27,3,3,0,0,1,.37-1.48,3.1,3.1,0,0,1,1-1.07,4.61,4.61,0,0,1,1.35-.61,12.37,12.37,0,0,1,1.65-.28,17,17,0,0,0,3.33-.64c0-.26,0-.42,0-.49a2,2,0,0,0-.53-1.61,3.1,3.1,0,0,0-2.12-.63,3.3,3.3,0,0,0-2,.46,2.86,2.86,0,0,0-.92,1.64l-1.83-.25a4.56,4.56,0,0,1,.82-1.9,3.51,3.51,0,0,1,1.65-1.1,7.33,7.33,0,0,1,2.5-.39,6.65,6.65,0,0,1,2.29.33,3,3,0,0,1,1.29.83,2.92,2.92,0,0,1,.58,1.27,9.49,9.49,0,0,1,.1,1.72V415a26.15,26.15,0,0,0,.12,3.29,4,4,0,0,0,.47,1.32h-2A3.88,3.88,0,0,1,266.15,418.25Zm-.16-4.16a13.33,13.33,0,0,1-3.05.7,6.76,6.76,0,0,0-1.62.38,1.58,1.58,0,0,0-.74.6,1.63,1.63,0,0,0-.26.89,1.57,1.57,0,0,0,.57,1.24,2.41,2.41,0,0,0,1.65.5,3.9,3.9,0,0,0,1.92-.47,2.94,2.94,0,0,0,1.23-1.29,4.54,4.54,0,0,0,.3-1.87Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M270.75,419.61v-11h1.68v1.66a4.61,4.61,0,0,1,1.18-1.54,2.1,2.1,0,0,1,1.2-.37,3.65,3.65,0,0,1,1.92.6l-.64,1.73a2.71,2.71,0,0,0-1.37-.41,1.8,1.8,0,0,0-1.1.37,2,2,0,0,0-.7,1,7.55,7.55,0,0,0-.31,2.18v5.76Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M281.13,419.61,287,404.42h2.17l6.22,15.19h-2.3l-1.77-4.6h-6.35l-1.67,4.6Zm4.39-6.24h5.15l-1.59-4.2c-.48-1.28-.84-2.33-1.07-3.16a20.37,20.37,0,0,1-.82,2.91Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M296.68,419.61V404.42h1.87v15.19Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M307.55,419.61V404.42h2.07l8,11.93V404.42h1.93v15.19h-2.07l-8-11.94v11.94Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M329.85,418.25a7,7,0,0,1-2,1.25,5.83,5.83,0,0,1-2.06.36A4,4,0,0,1,323,419a2.94,2.94,0,0,1-1-2.27,3.09,3.09,0,0,1,.36-1.48,3.13,3.13,0,0,1,1-1.07,4.44,4.44,0,0,1,1.34-.61,12.9,12.9,0,0,1,1.66-.28,17.3,17.3,0,0,0,3.33-.64c0-.26,0-.42,0-.49a2.08,2.08,0,0,0-.53-1.61,3.15,3.15,0,0,0-2.13-.63,3.26,3.26,0,0,0-1.94.46,2.81,2.81,0,0,0-.93,1.64l-1.82-.25a4.32,4.32,0,0,1,.82-1.9,3.43,3.43,0,0,1,1.64-1.1,7.37,7.37,0,0,1,2.5-.39,6.65,6.65,0,0,1,2.29.33,3.08,3.08,0,0,1,1.3.83,3,3,0,0,1,.58,1.27,10.89,10.89,0,0,1,.09,1.72V415a26.15,26.15,0,0,0,.12,3.29,4.26,4.26,0,0,0,.47,1.32h-1.95A4.1,4.1,0,0,1,329.85,418.25Zm-.15-4.16a13.47,13.47,0,0,1-3.05.7,6.87,6.87,0,0,0-1.63.38,1.63,1.63,0,0,0-.74.6,1.62,1.62,0,0,0-.25.89,1.56,1.56,0,0,0,.56,1.24,2.45,2.45,0,0,0,1.65.5,3.9,3.9,0,0,0,1.92-.47,2.94,2.94,0,0,0,1.23-1.29,4.52,4.52,0,0,0,.31-1.87Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M332.1,423.88l.35-1.58a4.17,4.17,0,0,0,.88.14,1,1,0,0,0,.85-.38,3.8,3.8,0,0,0,.28-1.89V408.61h1.87v11.6a5.45,5.45,0,0,1-.53,2.83,2.48,2.48,0,0,1-2.24,1A5.47,5.47,0,0,1,332.1,423.88Zm2.36-17.3v-2.16h1.87v2.16Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M346.37,418.25a6.84,6.84,0,0,1-2,1.25,5.83,5.83,0,0,1-2.06.36,4,4,0,0,1-2.79-.88,2.94,2.94,0,0,1-1-2.27,3.09,3.09,0,0,1,.36-1.48,3.13,3.13,0,0,1,1-1.07,4.55,4.55,0,0,1,1.34-.61,12.9,12.9,0,0,1,1.66-.28,17.14,17.14,0,0,0,3.33-.64c0-.26,0-.42,0-.49a2.08,2.08,0,0,0-.53-1.61,3.15,3.15,0,0,0-2.13-.63,3.28,3.28,0,0,0-1.94.46,2.81,2.81,0,0,0-.93,1.64l-1.82-.25a4.43,4.43,0,0,1,.82-1.9,3.51,3.51,0,0,1,1.65-1.1,7.27,7.27,0,0,1,2.49-.39,6.61,6.61,0,0,1,2.29.33,3.08,3.08,0,0,1,1.3.83,2.92,2.92,0,0,1,.58,1.27,10.89,10.89,0,0,1,.09,1.72V415a26.15,26.15,0,0,0,.12,3.29,4.26,4.26,0,0,0,.47,1.32h-1.94A3.88,3.88,0,0,1,346.37,418.25Zm-.15-4.16a13.47,13.47,0,0,1-3.05.7,6.87,6.87,0,0,0-1.63.38,1.59,1.59,0,0,0-1,1.49,1.59,1.59,0,0,0,.56,1.24,2.46,2.46,0,0,0,1.66.5,3.89,3.89,0,0,0,1.91-.47,3,3,0,0,0,1.24-1.29,4.54,4.54,0,0,0,.3-1.87Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M351.44,419.61v-9.55h-1.65v-1.45h1.65v-1.18a5.09,5.09,0,0,1,.2-1.64,2.33,2.33,0,0,1,.95-1.18,3.4,3.4,0,0,1,1.9-.45,9.52,9.52,0,0,1,1.74.18L356,406a6.16,6.16,0,0,0-1.1-.1,1.62,1.62,0,0,0-1.2.36,2,2,0,0,0-.35,1.36v1h2.14v1.45H353.3v9.55Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M356.81,423.85l-.21-1.75a4.27,4.27,0,0,0,1.07.17,2.06,2.06,0,0,0,1-.21,1.78,1.78,0,0,0,.61-.58,11.42,11.42,0,0,0,.57-1.39c0-.1.09-.26.16-.46l-4.17-11h2l2.29,6.37c.29.81.56,1.66.8,2.55a26,26,0,0,1,.76-2.51l2.35-6.41h1.87l-4.19,11.19a22.58,22.58,0,0,1-1,2.5,3.81,3.81,0,0,1-1.14,1.35,2.68,2.68,0,0,1-1.54.43A3.77,3.77,0,0,1,356.81,423.85Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M367.52,406.56v-2.14h1.86v2.14Zm0,13.05v-11h1.86v11Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M379.41,418.25a7,7,0,0,1-2,1.25,5.79,5.79,0,0,1-2.06.36,4,4,0,0,1-2.79-.88,3.14,3.14,0,0,1-.6-3.75,3.1,3.1,0,0,1,1-1.07,4.61,4.61,0,0,1,1.35-.61,12.37,12.37,0,0,1,1.65-.28,17,17,0,0,0,3.33-.64c0-.26,0-.42,0-.49a2.08,2.08,0,0,0-.53-1.61,3.1,3.1,0,0,0-2.12-.63,3.3,3.3,0,0,0-1.95.46,2.86,2.86,0,0,0-.92,1.64l-1.83-.25a4.56,4.56,0,0,1,.82-1.9,3.51,3.51,0,0,1,1.65-1.1,7.33,7.33,0,0,1,2.5-.39,6.65,6.65,0,0,1,2.29.33,3,3,0,0,1,1.29.83,2.92,2.92,0,0,1,.58,1.27,9.49,9.49,0,0,1,.1,1.72V415a26.15,26.15,0,0,0,.12,3.29,4,4,0,0,0,.47,1.32h-2A3.88,3.88,0,0,1,379.41,418.25Zm-.16-4.16a13.33,13.33,0,0,1-3.05.7,6.76,6.76,0,0,0-1.62.38,1.58,1.58,0,0,0-.74.6,1.63,1.63,0,0,0-.26.89,1.57,1.57,0,0,0,.57,1.24,2.41,2.41,0,0,0,1.65.5,3.9,3.9,0,0,0,1.92-.47,2.94,2.94,0,0,0,1.23-1.29,4.54,4.54,0,0,0,.3-1.87Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M390.27,419.61V404.42h10.25v1.79h-8.24v4.71h7.13v1.79h-7.13v6.9Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M402.2,414.11a5.68,5.68,0,0,1,1.7-4.53,5.1,5.1,0,0,1,3.46-1.22,4.94,4.94,0,0,1,3.71,1.48,5.69,5.69,0,0,1,1.44,4.11,7.4,7.4,0,0,1-.63,3.35,4.58,4.58,0,0,1-1.86,1.89,5.39,5.39,0,0,1-2.66.67,5,5,0,0,1-3.74-1.48A5.92,5.92,0,0,1,402.2,414.11Zm1.92,0a4.69,4.69,0,0,0,.92,3.17,3,3,0,0,0,2.32,1.05,2.91,2.91,0,0,0,2.31-1.06,4.76,4.76,0,0,0,.92-3.22,4.56,4.56,0,0,0-.92-3.1,3.08,3.08,0,0,0-4.63,0A4.64,4.64,0,0,0,404.12,414.11Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M421.91,419.61V418a4,4,0,0,1-3.49,1.86,4.42,4.42,0,0,1-1.82-.37,3,3,0,0,1-1.25-.94,3.45,3.45,0,0,1-.58-1.38,10.2,10.2,0,0,1-.11-1.74v-6.82h1.86v6.1a10.4,10.4,0,0,0,.12,2,1.87,1.87,0,0,0,.74,1.15,2.25,2.25,0,0,0,1.41.42,3.14,3.14,0,0,0,1.58-.42,2.38,2.38,0,0,0,1-1.18,5.93,5.93,0,0,0,.31-2.15v-5.89h1.86v11Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M426.5,419.61v-11h1.68v1.56a4,4,0,0,1,3.51-1.81,4.77,4.77,0,0,1,1.83.35,3,3,0,0,1,1.25.94,3.74,3.74,0,0,1,.58,1.38,10.71,10.71,0,0,1,.1,1.81v6.77h-1.87v-6.69a5.25,5.25,0,0,0-.21-1.71,1.88,1.88,0,0,0-.78-.9,2.49,2.49,0,0,0-1.3-.34,3,3,0,0,0-2.05.76,3.71,3.71,0,0,0-.87,2.87v6Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M445.45,419.61v-1.39a3.41,3.41,0,0,1-3.08,1.64,4.37,4.37,0,0,1-2.42-.72,4.89,4.89,0,0,1-1.71-2,7.06,7.06,0,0,1-.6-3,7.73,7.73,0,0,1,.55-3,4.29,4.29,0,0,1,1.64-2.06,4.42,4.42,0,0,1,2.46-.71,3.65,3.65,0,0,1,1.77.42,3.74,3.74,0,0,1,1.27,1.09v-5.45h1.85v15.19Zm-5.9-5.49a4.75,4.75,0,0,0,.9,3.16,2.64,2.64,0,0,0,4.18.05,4.63,4.63,0,0,0,.85-3.05,5.17,5.17,0,0,0-.87-3.32,2.65,2.65,0,0,0-2.14-1.06,2.59,2.59,0,0,0-2.08,1A5,5,0,0,0,439.55,414.12Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M457.3,418.25a6.87,6.87,0,0,1-2,1.25,5.74,5.74,0,0,1-2.05.36,4,4,0,0,1-2.79-.88,3,3,0,0,1-1-2.27,3.09,3.09,0,0,1,.37-1.48,3.13,3.13,0,0,1,1-1.07,4.44,4.44,0,0,1,1.34-.61,12.9,12.9,0,0,1,1.66-.28,17,17,0,0,0,3.32-.64c0-.26,0-.42,0-.49a2.08,2.08,0,0,0-.52-1.61,3.15,3.15,0,0,0-2.13-.63,3.26,3.26,0,0,0-1.94.46,2.81,2.81,0,0,0-.93,1.64l-1.82-.25a4.32,4.32,0,0,1,.82-1.9,3.43,3.43,0,0,1,1.64-1.1,7.33,7.33,0,0,1,2.5-.39,6.65,6.65,0,0,1,2.29.33,3.08,3.08,0,0,1,1.3.83,3,3,0,0,1,.58,1.27,10.89,10.89,0,0,1,.09,1.72V415a26.15,26.15,0,0,0,.12,3.29,4.26,4.26,0,0,0,.47,1.32h-1.95A4.1,4.1,0,0,1,457.3,418.25Zm-.16-4.16a13.22,13.22,0,0,1-3,.7,6.87,6.87,0,0,0-1.63.38,1.58,1.58,0,0,0-1,1.49,1.57,1.57,0,0,0,.57,1.24,2.45,2.45,0,0,0,1.65.5,3.9,3.9,0,0,0,1.92-.47,2.94,2.94,0,0,0,1.23-1.29,4.54,4.54,0,0,0,.3-1.87Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M466,417.94l.27,1.65a7.07,7.07,0,0,1-1.41.17,3.24,3.24,0,0,1-1.58-.32,1.84,1.84,0,0,1-.79-.85,6.7,6.7,0,0,1-.23-2.2v-6.33H460.9v-1.45h1.36v-2.73l1.86-1.12v3.85H466v1.45h-1.88v6.43a3.09,3.09,0,0,0,.1,1,.74.74,0,0,0,.32.36,1.24,1.24,0,0,0,.64.14A6.15,6.15,0,0,0,466,417.94Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M467.83,406.56v-2.14h1.87v2.14Zm0,13.05v-11h1.87v11Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M471.84,414.11a5.68,5.68,0,0,1,1.7-4.53,5.1,5.1,0,0,1,3.46-1.22,4.93,4.93,0,0,1,3.71,1.48,5.69,5.69,0,0,1,1.45,4.11,7.39,7.39,0,0,1-.64,3.35,4.58,4.58,0,0,1-1.86,1.89,5.39,5.39,0,0,1-2.66.67,4.93,4.93,0,0,1-3.73-1.48A5.92,5.92,0,0,1,471.84,414.11Zm1.92,0a4.74,4.74,0,0,0,.92,3.17,3,3,0,0,0,2.32,1.05,2.91,2.91,0,0,0,2.31-1.06,4.76,4.76,0,0,0,.93-3.22,4.56,4.56,0,0,0-.93-3.1,3.08,3.08,0,0,0-4.63,0A4.69,4.69,0,0,0,473.76,414.11Z" transform="translate(-88.17 -378.3)"/><path class="cls-2" d="M484.34,419.61v-11H486v1.56a4,4,0,0,1,3.51-1.81,4.69,4.69,0,0,1,1.82.35,2.89,2.89,0,0,1,1.25.94,3.58,3.58,0,0,1,.58,1.38,10.42,10.42,0,0,1,.11,1.81v6.77h-1.87v-6.69a4.94,4.94,0,0,0-.22-1.71,1.81,1.81,0,0,0-.77-.9,2.49,2.49,0,0,0-1.3-.34,3.07,3.07,0,0,0-2.06.76,3.75,3.75,0,0,0-.86,2.87v6Z" transform="translate(-88.17 -378.3)"/></svg>
                    </td>
                </tr>
                </thead>
                </table>
                
                <table cellpadding="0" border="0" cellspacing="0" style="width:105%; margin-left:-20px; margin-top:20px; margin-bottom:25px; background:#F0C84C">
                <thead>
                    <tr>
                        <td style="height: 50px">
                <div style="
                    margin: -2px 0;
                    float: right;
                    height: 51px;
                    font-family: Microsoft Sans serif;
                    ">
                            <span style="
                    margin-right: 65px;
                    background: #fff;
                    font-size: 46px;
                    padding: 0 8px;
                ">REÇU</span>
                            </div>
                        
                        </td>
                    </tr></thead>
                </table>
            
            <table style="width:88%; margin:2% auto 0" cellspacing="0" cellpadding="1">
                <tbody>
                    <tr>
                        <td style="font-size:18px;font-family:helvetica;font-style:bold;margin-top:3px">Nom du Donateur</td>
                        <td style="visibility:hidden; padding-left: 300px;font-style:bold;">Description</td>
                        <td style="font-size:18px;font-style:bold;font-family:helvetica">Date</td>
                        <td style='padding-left:5px;color:grey;font-style: italic;font-size:20px;font-weight:500;font-family:Myriad Pro'>${displayDate}</td>
                    </tr>
                    <tr>
                        <td style="color:grey;font-size:20px;font-family:Myriad Pro">${capitalize(item.donar[0].donarName)}</td>
                        <td style="visibility:hidden">Description</td>
                        <td style="font-size:18px;font-family:helvetica">Série #</td>
                        <td style='padding-left:5px;color:grey;font-style: italic;font-size:20px;font-family:Myriad Pro;font-weight:500'>${invoiceNum}</td>
                    </tr>
                </tbody>
            </table>
            
            
            <table style="width:88%; margin:13px auto 0;" cellspacing="0" cellpadding="5">
            <thead style="background:#F4C64E;outline: 11px solid #F4C64E; outline-offset:-11px;">
                <tr style='height:50px'>
                    <td style="font-style:bold;text-align:center; width:60px; border-right: 2px solid #000; font-size: 20px;font-family:helvetica">S No.</td>
                    <td style="font-style:bold; text-align:center; width:400px; border-right: 2px solid #000;  font-size: 20px;font-family:helvetica">Description</td>
                    <td style="font-style:bold;text-align:center; width:50px;border-right: 2px solid #000;  font-size: 20px;font-family:helvetica">Quantité</td>
                    <td style="font-style:bold;text-align:center; width:100px; font-size: 20px; font-family:helvetica">Montant</td>
                <tr>
            </thead>
            </table>`
        };

        options.footer = {
            "height": "35mm",
            "contents": `
            <table id='pageFooter' style='width:100%; position:fixed; bottom:10; left:0; right:0; margin-bottom:0'>
                <tfoot>
                    <tr>
                        <td colspan='3' style='text-align:center'>
                        Ceci est un reçu généré automatiquement, aucune signature n'est donc requise.
                        </td>
                    </tr>
                    <tr>
                        <td colspan='3'>
                        <span style=' margin: 1px -5px 8px -4px; border: 2px solid #e2b836; display: block'></span>
                        </td>
                    </tr>
                    <tr>
                        <td style='text-align:center; border-right:1px solid grey; color:grey'> 
                        <svg version="1.1" style="margin-right:2px" fill="#f0c84b" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                            width="13px" height="13px" viewBox="0 0 96.124 96.123" 
                            xml:space="preserve">
                        <g>
                            <path d="M72.089,0.02L59.624,0C45.62,0,36.57,9.285,36.57,23.656v10.907H24.037c-1.083,0-1.96,0.878-1.96,1.961v15.803
                                c0,1.083,0.878,1.96,1.96,1.96h12.533v39.876c0,1.083,0.877,1.96,1.96,1.96h16.352c1.083,0,1.96-0.878,1.96-1.96V54.287h14.654
                                c1.083,0,1.96-0.877,1.96-1.96l0.006-15.803c0-0.52-0.207-1.018-0.574-1.386c-0.367-0.368-0.867-0.575-1.387-0.575H56.842v-9.246
                                c0-4.444,1.059-6.7,6.848-6.7l8.397-0.003c1.082,0,1.959-0.878,1.959-1.96V1.98C74.046,0.899,73.17,0.022,72.089,0.02z"/>
                        </g>

                        </svg>
                        <svg version="1.1" style="margin-right:3px" fill="#f0c84b" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                            width="13px" height="13px"  viewBox="0 0 169.063 169.063" style="enable-background:new 0 0 169.063 169.063;"
                            xml:space="preserve">
                        <g>
                            <path d="M122.406,0H46.654C20.929,0,0,20.93,0,46.655v75.752c0,25.726,20.929,46.655,46.654,46.655h75.752
                                c25.727,0,46.656-20.93,46.656-46.655V46.655C169.063,20.93,148.133,0,122.406,0z M154.063,122.407
                                c0,17.455-14.201,31.655-31.656,31.655H46.654C29.2,154.063,15,139.862,15,122.407V46.655C15,29.201,29.2,15,46.654,15h75.752
                                c17.455,0,31.656,14.201,31.656,31.655V122.407z"/>
                            <path d="M84.531,40.97c-24.021,0-43.563,19.542-43.563,43.563c0,24.02,19.542,43.561,43.563,43.561s43.563-19.541,43.563-43.561
                                C128.094,60.512,108.552,40.97,84.531,40.97z M84.531,113.093c-15.749,0-28.563-12.812-28.563-28.561
                                c0-15.75,12.813-28.563,28.563-28.563s28.563,12.813,28.563,28.563C113.094,100.281,100.28,113.093,84.531,113.093z"/>
                            <path d="M129.921,28.251c-2.89,0-5.729,1.17-7.77,3.22c-2.051,2.04-3.23,4.88-3.23,7.78c0,2.891,1.18,5.73,3.23,7.78
                                c2.04,2.04,4.88,3.22,7.77,3.22c2.9,0,5.73-1.18,7.78-3.22c2.05-2.05,3.22-4.89,3.22-7.78c0-2.9-1.17-5.74-3.22-7.78
                                C135.661,29.421,132.821,28.251,129.921,28.251z"/>
                        </g>

                        </svg>
                         <svg version="1.1" style="margin-right:5px" fill="#f0c84b" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="14px" height="15px"
                            viewBox="0 0 310 310" style="enable-background:new 0 0 310 310;" xml:space="preserve">
                        <g id="XMLID_822_">
                            <path id="XMLID_823_" d="M297.917,64.645c-11.19-13.302-31.85-18.728-71.306-18.728H83.386c-40.359,0-61.369,5.776-72.517,19.938
                                C0,79.663,0,100.008,0,128.166v53.669c0,54.551,12.896,82.248,83.386,82.248h143.226c34.216,0,53.176-4.788,65.442-16.527
                                C304.633,235.518,310,215.863,310,181.835v-53.669C310,98.471,309.159,78.006,297.917,64.645z M199.021,162.41l-65.038,33.991
                                c-1.454,0.76-3.044,1.137-4.632,1.137c-1.798,0-3.592-0.484-5.181-1.446c-2.992-1.813-4.819-5.056-4.819-8.554v-67.764
                                c0-3.492,1.822-6.732,4.808-8.546c2.987-1.814,6.702-1.938,9.801-0.328l65.038,33.772c3.309,1.718,5.387,5.134,5.392,8.861
                                C204.394,157.263,202.325,160.684,199.021,162.41z"/>
                        </g>
                        </svg>
                        Najafyia Foundation 
                        </td>
                        <td style='text-align:center; border-right:1px solid grey;color:grey'>www.najafyia.org </td>
                        <td style='text-align:center;color:grey'>info@najafyia.org</td>
                    </tr>
                </tfoot>
            </table>`,

        };
    } else if (item.donar[0].user[0].language == 'ARB') {
        options.header = {
            "height": "36.86mm",
            "contents": `
            <table style="width:88%; margin-left:4%" cellspacing="0" cellpadding="1">
            
            <thead>
                <tr>
                    <td>
                        <svg id="Layer_1" width="500px" style="float:right" height="105px" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1117.22 223.59"><defs><style>.cls-1{fill:#231f20;}.cls-2{fill:#f1c94a;}</style></defs><title>Arabic</title><path class="cls-1" d="M52.77,134.37a3.59,3.59,0,0,0,.37-1.4,86.85,86.85,0,0,1,4.78-18.08A22.56,22.56,0,0,1,60,110.56c.15-.23.31-.58.65-.47s.34.57.25.87a39.37,39.37,0,0,1-1.39,4.31,55.93,55.93,0,0,0-3.16,10.5,19,19,0,0,0-.06,8.13,7.33,7.33,0,0,0,1,2.41,2.41,2.41,0,0,0,1.5,1.09c.9.21,1.18.06,1.55-.83.19-.45.38-.9.6-1.33.14-.27.35-.51.69-.43a.78.78,0,0,1,.61.74,2.58,2.58,0,0,1-.06.73,49.91,49.91,0,0,1-1.52,5.34A5,5,0,0,1,59.29,144a3.32,3.32,0,0,0-1.17,2.56,52.42,52.42,0,0,0-.36,7.3,18.63,18.63,0,0,0,2.11,8.43,8.74,8.74,0,0,0,2.2,2.52,2.4,2.4,0,0,0,2.87.18,5.31,5.31,0,0,0,1.59-1.28,16.41,16.41,0,0,0,3-5.17,26.87,26.87,0,0,1,6.35-11.06,19.61,19.61,0,0,1,5.81-3.89,8,8,0,0,1,1.54-.45,3.28,3.28,0,0,1,3.66,1.53c.65,1,1.25,2,1.86,3A11.52,11.52,0,0,0,95.57,153a10.51,10.51,0,0,0,9.67-1.94,17.23,17.23,0,0,0,3.58-4,28.07,28.07,0,0,1,2.64-3.32,7.31,7.31,0,0,1,.6-.64c.41-.33.85-.83,1.41-.46s.28.91.11,1.35a6.11,6.11,0,0,0,.68,5.41,9,9,0,0,0,8.27,4.85,32.21,32.21,0,0,0,4.81-.2,17.41,17.41,0,0,0,3.06-.95,11.22,11.22,0,0,1,1.1-.41c1.93-.45,2.49-1.72,2.69-3.62.74-6.77,3.75-12.23,9.73-15.82a4.08,4.08,0,0,1,.77-.41c1.93-.62,2.85-.48,3.79,1.51.52,1.1.93,2.25,1.47,3.35a7,7,0,0,0,4.18,3.43,2.24,2.24,0,0,0,1.58.14c2-.73,3.89-1.6,4.92-3.63a16.14,16.14,0,0,1,2.53-3.92c.38-.4.74-1.11,1.41-.81s.43,1,.37,1.59a6.23,6.23,0,0,0,7.35,6.65c.34-.06.68-.11,1-.2,2.45-.73,3.36-2.14,3.16-4.67-.16-2.09-.1-4.2-.35-6.27s-.63-4.24-.77-6.38c-.29-4.68-1.05-9.3-1.48-14-.39-4.17-.58-8.36-1.12-12.51-.19-1.39-.1-2.81-.18-4.21a30.69,30.69,0,0,0-.51-4.5,5.31,5.31,0,0,1,.25-3.15c.49-1.22.86-2.49,1.33-3.72.16-.43.2-1.15.75-1.14s.65.77.79,1.24c.46,1.55.85,3.11,1.27,4.66.15.56.3,1.13.5,1.68a78,78,0,0,1,2.76,9.25,2.93,2.93,0,0,1,.12,1.58c-.17.53-.6.64-1,.23s-.48-.61-.74-.9-.52-.58-.85-1a2.51,2.51,0,0,0-.16,1.73c.25,3,.52,5.92.79,8.88.12,1.26.19,2.53.41,3.78.57,3.37.67,6.79,1,10.18.31,3,.54,5.93.8,8.89a7.13,7.13,0,0,1,0,1.46,73.68,73.68,0,0,1-1.18,8.09,13.08,13.08,0,0,1-2.82,5.73c-2.14,2.4-7.18,4.57-10.63,1A10.53,10.53,0,0,1,163,143a5,5,0,0,0-.55-1.49c-.6,0-.74.52-.89.88a21.38,21.38,0,0,1-3.2,4.71c-1.52,1.91-3.48,2.77-6.09,1.48a7.81,7.81,0,0,1-4.1-4c-.46-1.13-.95-2.25-1.47-3.35s-1-1.4-2.33-.95a13.15,13.15,0,0,0-6.27,5.06,4.21,4.21,0,0,0-.59,3.36c.19,1,.49,1.26,1.5,1a21.25,21.25,0,0,1,3.61-.6,9.15,9.15,0,0,1,6.26,1.52,4.73,4.73,0,0,1,2.06,3.07,8.93,8.93,0,0,1,.19,2.19c-.1,3.2-.51,6.31-2.33,9.08a5.74,5.74,0,0,1-2.94,2.51,4.85,4.85,0,0,1-4.82-.75,16.61,16.61,0,0,1-5-6.9c-.1-.22-.17-.46-.26-.68-.56-1.33-.94-1.53-2.23-.83a34.2,34.2,0,0,1-7.17,2.9c-3.85,1.06-7.67.92-11.08-1.46-1.94-1.35-2.94-3.47-3.86-5.59a7.79,7.79,0,0,0-.37-.95c-.49-.86-1-.89-1.65-.07a35.42,35.42,0,0,1-3.75,4.66,12.19,12.19,0,0,1-16.17,0,23.79,23.79,0,0,1-4-5.36c-1.15-1.85-1.91-2.16-4-1.52A13.21,13.21,0,0,0,76,154.39a21.26,21.26,0,0,0-5.48,8.37,20.5,20.5,0,0,1-1.72,3.87,13.83,13.83,0,0,1-4.13,4,1.09,1.09,0,0,1-1,.18,5.71,5.71,0,0,1-3.47-2,21.88,21.88,0,0,1-4-10.07,43.21,43.21,0,0,1,0-10.78c.11-.77.34-1.52.5-2.28.1-.44.17-.9-.29-1.18-2.15-1.35-2.73-3.58-3.28-5.82a4.91,4.91,0,0,0-.38-1.41Zm88.56,22.44c.84,1,1.42,1.75,2.11,2.43a3.68,3.68,0,0,0,3.06,1.09,1.51,1.51,0,0,0,1.28-1.06.75.75,0,0,0-.33-.9A7.23,7.23,0,0,0,141.33,156.81Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M482.58,155.91l-5.58-.7c-.58-.07-1.18-.08-1.74-.2-3.39-.71-6.81-1.27-10.21-1.93a17.48,17.48,0,0,0-8-.16c-1,.27-1.44-.17-1.11-1.16a31.94,31.94,0,0,1,2.47-5.14,3.17,3.17,0,0,1,1.26-1,97.18,97.18,0,0,1,10.26-5,34.42,34.42,0,0,0,7.13-4,30.55,30.55,0,0,0,4.85-5.06c1-1.2,2-2.4,3-3.61a5.77,5.77,0,0,1,2.06-1.61,1.4,1.4,0,0,1,2.1.64,4.17,4.17,0,0,1,.56,2.09,11.67,11.67,0,0,0,1.8,5.65,7.68,7.68,0,0,0,8.91,2.83c.23-.09.46-.17.68-.28,2.4-1.14,2.66-1.69,2.34-4.33q-1.08-8.87-2.59-17.66c-.86-5-1.94-9.86-2.71-14.83-.46-3-1-6-1.32-9a7,7,0,0,0-.41-2,3.36,3.36,0,0,1,0-2.69c.58-1.5,1.13-3,1.7-4.52.12-.31.25-.7.67-.67s.51.44.6.76c.92,3.4,2.74,6.45,3.94,9.75.5,1.36,1.18,2.66,1.66,4a6.22,6.22,0,0,1,.43,2c0,.35,0,.71-.39.88s-.75,0-1-.36-.65-.85-1-1.26a2.39,2.39,0,0,0-.46-.34c-.51.35-.34.82-.25,1.21.71,3.09,1,6.25,1.68,9.36.71,3.54,1.16,7.12,1.67,10.7.41,2.85.88,5.7,1.05,8.56a31.78,31.78,0,0,1-.3,7.86,18.24,18.24,0,0,1-2.91,7.28c-3.44,4.78-11,4.78-14-.26a16.38,16.38,0,0,1-1.72-4.18c-.25-.94-.5-1.89-.79-2.82-.35-1.1-.93-1.29-1.83-.54a17.12,17.12,0,0,0-2.63,2.94,33.81,33.81,0,0,1-7.26,7.17,25.44,25.44,0,0,1-3.54,1.95A1.92,1.92,0,0,0,473,147c3.83.79,7.68,1.41,11.54,1.93,2.95.39,5.91.65,8.85,1.12s6,.06,9.05.12c1.86,0,3.7-.3,5.55-.17a7.46,7.46,0,0,1,1.16.1.84.84,0,0,1,.72,1.19,13,13,0,0,1-.72,1.92,29.23,29.23,0,0,0-1.33,2.76,1.55,1.55,0,0,1-1.79,1.18c-2-.36-3.9.09-5.83.23a41.16,41.16,0,0,0-7.79,1.3,73.34,73.34,0,0,0-9.49,3.37,55.47,55.47,0,0,1-8.23,3c-2,.5-4.05,1.09-6.06,1.69a49.12,49.12,0,0,1-16,2.18,35.54,35.54,0,0,1-8.51-1.28,10.25,10.25,0,0,1-3.75-1.94,2.75,2.75,0,0,0-3-.51c-2,.74-4.05,1.42-6.13,2A19.11,19.11,0,0,1,426,168a10.82,10.82,0,0,1-10.64-9.43c-.12-1-.56-1.17-1.33-.52a6,6,0,0,0-1,1.09c-1.11,1.48-2.41,2.81-3.62,4.22a6,6,0,0,1-2,1.43c-5.34,2.59-9.44,1.94-14.16-1.71a16.49,16.49,0,0,1-4.09-4.93c-.42-.72-.83-1.44-1.28-2.14a2.4,2.4,0,0,0-3.24-1.16c-4.94,1.47-8.15,4.87-10.17,9.43a48.09,48.09,0,0,1-3.32,7c-1.14,1.75-2.46,3.42-4.7,3.88a1.89,1.89,0,0,1-.86.11c-1.82-.58-3.53-1.23-4.7-3-2.92-4.34-3.58-9.19-3.57-14.24,0-.72.53-1.47.08-2.14s-1.36-.39-2-.64a10.34,10.34,0,0,1-5.94-5.33,20.86,20.86,0,0,1-1.69-4.67c-.06-.26,0-.6-.4-.81-.31,1.89-.95,3.67-1.31,5.52-1,5.11-6.79,7.25-10.33,6.57a5.66,5.66,0,0,1-3.65-2.73,9.7,9.7,0,0,1-1.39-3.37c-.2-1-.59-1.16-1.3-.38-1,1.09-1.88,2.24-2.79,3.39-3.46,4.43-8.09,6.57-13.61,7.05a23.27,23.27,0,0,1-7.25-.68,3.75,3.75,0,0,0-2.68.27,43.29,43.29,0,0,1-5.25,2.23,11.59,11.59,0,0,1-11-1.58,11.18,11.18,0,0,1-3.08-3.85c-1.9-3.34-2.6-7-3.11-10.75-.59-4.31-.68-8.65-.89-13-.09-1.74-.35-3.49-.38-5.24a50.67,50.67,0,0,1-.25-5.08c.09-1-.23-2-.24-3.06a177.28,177.28,0,0,0-2.42-26.62,31.57,31.57,0,0,0-.88-3.7,4.32,4.32,0,0,1,0-2.73c.53-1.42,1.07-2.83,1.63-4.23.12-.31.22-.72.63-.72s.65.42.74.79a44.78,44.78,0,0,1,1.19,4.83c.58,3.91,1.19,7.81,1.71,11.73.27,2,.4,4.08.52,6.12.2,3.45.68,6.88.71,10.34,0,4.1.41,8.19.53,12.28.08,2.58.3,5.16.4,7.74A58.67,58.67,0,0,0,285,146.32a15.81,15.81,0,0,0,2.1,4.82,8.23,8.23,0,0,0,5.12,3.86,11.12,11.12,0,0,0,6.21,0c1.07-.35,1.2-.43.81-1.41a10.24,10.24,0,0,1-.23-6.47c.32-1.22.61-2.46,1-3.67a11.15,11.15,0,0,1,2-3.69,39.77,39.77,0,0,1,5.57-5.59c1.07-.9,1.67-.89,2.67,0a5.83,5.83,0,0,1,.87,1c2.14,3.16,3.18,6.54,2.28,10.39a55.41,55.41,0,0,1-1.66,6.06c-.45,1.27-.25,1.52,1.1,1.41,5.48-.46,10.39-2.11,14-6.64a26.17,26.17,0,0,1,4.57-4.72l.56-.47c.28-.2.57-.45.93-.27s.35.68.23,1a4.31,4.31,0,0,0,.11,3.55c1.92,3.41,3.38,4,7.08,3.24a8.7,8.7,0,0,0,3.43-1.6,2.91,2.91,0,0,0,1.32-2.47c-.07-4.39-.12-8.78-.47-13.16-.26-3.3-.49-6.61-.77-9.91-.22-2.53-.5-5-.74-7.57-.09-.87-.11-1.75-.2-2.62-.31-3-1-5.87-1.25-8.82-.28-3.21-.67-6.4-1.07-9.59s.52-5.88,1.33-8.73a.78.78,0,0,1,.05-.14c.19-.39.3-.92.83-.91s.74.56.82,1c.41,2.11.84,4.22,1.16,6.34q.94,6.36,1.8,12.74c.34,2.51.54,5,.91,7.55.74,5,.75,10,1.21,15q.62,6.56,1.85,13a11.84,11.84,0,0,0,3.22,6.61,8.87,8.87,0,0,0,1.48,1.19c3,1.83,4.9,1.61,7.87-.74a3.61,3.61,0,0,0,1.23-2.87,37.93,37.93,0,0,0-.35-5.84c-.64-5.28-1.28-10.56-2-15.82-.64-4.64-1.44-9.25-2.11-13.89q-1-6.66-1.82-13.33a16.44,16.44,0,0,0-.78-4.45,1.91,1.91,0,0,1,0-1.29c.54-1.77,1.09-3.55,1.64-5.31.1-.33.24-.71.66-.68s.48.43.58.75c1.09,3.39,2.64,6.6,3.94,9.91.58,1.49,1.05,3,1.7,4.51a1.9,1.9,0,0,1,.14.57c.05.63.15,1.39-.51,1.7s-1-.36-1.36-.83c-.16-.23-.3-.56-.65-.47s-.43.5-.4.84c.07.87.19,1.74.27,2.62.17,1.75.57,3.46.7,5.22.07,1.07.42,1.25,1.29.78a91.54,91.54,0,0,0,9.51-5.48c2.19-1.54,4.39-3.09,6.57-4.65a30,30,0,0,0,4.05-3.58c.65-.68.59-.86-.29-1.21-.41-.16-.84-.27-1.23-.46a2.41,2.41,0,0,1-1.36-3.16,9.07,9.07,0,0,1,.5-1.21,6,6,0,0,0,.74-2.35,4.82,4.82,0,0,1,.66-1.93c.81-1.55,1.95-1.73,3.12-.48.94,1,1.85,2,2.77,3l1.76,2a6.53,6.53,0,0,1,1.44,2.36,3.28,3.28,0,0,1-.74,3.53,3,3,0,0,1-3.51.62c-1.82-.69-1.78-.66-3.08.91a24.93,24.93,0,0,1-4.46,4.43,81.18,81.18,0,0,1-8.92,5.87,44.73,44.73,0,0,1-7.11,3.07c-1.2.4-1.27.49-1.08,1.65.62,3.9,1.29,7.8,1.87,11.71a83.33,83.33,0,0,1,1,10.48A59.09,59.09,0,0,1,367,143c-.48,3.41-1.3,6.69-3.78,9.31a12.47,12.47,0,0,1-3.07,2.21,2.13,2.13,0,0,0-1.24,2.26,32.28,32.28,0,0,0,2.28,9.78,6.81,6.81,0,0,0,2.14,2.55,3.47,3.47,0,0,0,3.36.25,4.81,4.81,0,0,0,2.63-2,30.61,30.61,0,0,0,3.09-6,25,25,0,0,1,7.86-11.08c.37-.3.86-.5.8-1.12a.31.31,0,0,1,.38-.34c1.33.2,2.27-.76,3.38-1.19,2.17-.83,3.61-.52,5,1.39,1.05,1.47,2,3,3,4.49a12.53,12.53,0,0,0,7.46,5.1c4,.91,7.77.09,10.6-3.26.82-1,1.65-1.93,2.43-2.93a15.58,15.58,0,0,1,3.49-3.09c.33-.23.69-.43,1.08-.16s.34.68.22,1.07c-.4,1.37-.79,2.8-.13,4.14a10.77,10.77,0,0,0,4,4.52,11,11,0,0,0,8.28,1.51c1.24-.26,2.49-.46,3.73-.74,1-.23,1-.3.73-1.17a10.39,10.39,0,0,1,0-6.05,20.69,20.69,0,0,1,3.66-7.9,11.56,11.56,0,0,1,2.3-2.23c1-.66,1.88-1.4,2.83-2.08,2.26-1.66,3.14-1.5,4.38.85a13.92,13.92,0,0,1,1.44,9.5,33.52,33.52,0,0,1-1.61,5.46,13,13,0,0,1-1.57,3c-.7,1-.64,1,.48,1.54a14.75,14.75,0,0,0,5.66,1.29,62.61,62.61,0,0,0,12.39-.64,74.25,74.25,0,0,0,8.56-1.87c3-.76,5.84-2.2,8.88-3A.48.48,0,0,0,482.58,155.91ZM310.47,147.2a11.93,11.93,0,0,0-2.13-5.36c-.67-.69-1.17-.76-1.87-.05a36.06,36.06,0,0,0-3.53,3.68c-1.65,2.18-1.39,3.68.87,5.26.32.22.67.39,1,.6a1.46,1.46,0,0,0,1.65,0,30.4,30.4,0,0,0,3.1-2.19A2.34,2.34,0,0,0,310.47,147.2Zm135.86,5a15.17,15.17,0,0,0-1.64-4.78c-.35-.61-.86-.86-1.46-.43a23.12,23.12,0,0,0-4.78,4,2,2,0,0,0-.4,1.93,8.78,8.78,0,0,0,2.35,3.65,1.05,1.05,0,0,0,1.19.29,8.88,8.88,0,0,0,4.46-3.41A1.93,1.93,0,0,0,446.33,152.22ZM390.94,92a6.3,6.3,0,0,0-1.7-2.06c-.23-.22-.45,0-.55.22a.81.81,0,0,0,.06.95A2.59,2.59,0,0,0,390.94,92Zm-5.39-3.79a1,1,0,0,0-.82.88c0,.45.66.91,1.3.89a.48.48,0,0,0,.52-.55C386.54,88.83,386,88.2,385.55,88.23Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M760.72,151c-.38.11-.46.47-.61.76a16.23,16.23,0,0,1-5.19,6,7.42,7.42,0,0,1-6.24,1.35c-2.07-.48-3.83-1.4-4.62-3.6-.36-1-.66-1-1.44-.29s-1.65,1.66-2.53,2.43a20.37,20.37,0,0,1-8.44,4.21c-.32.09-.66.16-1,.26a19.55,19.55,0,0,1-13.46-.66,7.84,7.84,0,0,1-3.61-3.5c-.53-.87-.9-1.82-1.39-2.82-.75.42-.91,1.17-1.2,1.79a8.23,8.23,0,0,1-2.94,3.38,5.62,5.62,0,0,1-7.63-1.06,16.54,16.54,0,0,1-1.06-2.19,3.82,3.82,0,0,0-1.52,1.46,11.26,11.26,0,0,1-7.75,4.24,7.37,7.37,0,0,1-5.08-1.5,3,3,0,0,1-1.21-1.78c-.12-.42-.21-.85-.3-1.28-.13-.65-.49-.68-.94-.33a10.25,10.25,0,0,0-1,.88,19.33,19.33,0,0,1-11.55,5.47,20.88,20.88,0,0,1-5.24-.09,9.47,9.47,0,0,1-5.33-2.51,31.7,31.7,0,0,1-4-4.62,36.8,36.8,0,0,0-3-3.59,2.57,2.57,0,0,0-2.93-.69,10.23,10.23,0,0,0-4,2.37c-1.06,1-2.09,2-3.1,3.11a11.93,11.93,0,0,0-2.34,3.86,58.36,58.36,0,0,1-3.53,6.91c-1.07,1.9-2.49,3.49-4.86,3.87a3.47,3.47,0,0,1-2-.22,8.42,8.42,0,0,1-3.59-2.92,22.39,22.39,0,0,1-3.75-9.12,26.14,26.14,0,0,1-.28-6.25,20.2,20.2,0,0,1,1.58-5.9c.08-.22.23-.45.54-.35s.26.28.26.47a5.15,5.15,0,0,1,0,.88,33.84,33.84,0,0,0,.3,9.48,15.13,15.13,0,0,0,2.5,6.94c.31.44.69.82,1,1.23a3,3,0,0,0,4.2.55,10.59,10.59,0,0,0,4.49-5.42c.62-1.65,1.2-3.3,1.81-5a16.09,16.09,0,0,1,3.8-5.84c1.1-1.11,2.2-2.22,3.34-3.29a11.5,11.5,0,0,1,5.68-2.85,2.77,2.77,0,0,1,2.46.59,21.37,21.37,0,0,1,3.54,3.88,35.63,35.63,0,0,0,3.06,3.54,11.76,11.76,0,0,0,7.68,3.52,18.71,18.71,0,0,0,13.8-4.07c1.33-1.07,2.74-2,4.12-3,.59-.42,1-.2,1.07.52a4.39,4.39,0,0,1-.29,1.43,2.42,2.42,0,0,0,1.33,3.18,7.05,7.05,0,0,0,4.83.73,10.43,10.43,0,0,0,6.21-3.58c.79-.93,1.54-1.89,2.31-2.83a5.13,5.13,0,0,1,1.19-1.09.57.57,0,0,1,.68,0,.59.59,0,0,1,.17.66c-.19.66-.41,1.31-.6,2a2,2,0,0,0,.91,2.65,5.15,5.15,0,0,0,7.08-1.46c.28-.46.48-1,.74-1.43.39-.73.79-1.46,1.24-2.16.31-.5.78-1.07,1.38-.88s.3.91.25,1.41a2.85,2.85,0,0,0,.31,1.84,8,8,0,0,0,4.52,3.94c3.61,1,7.23,1.56,10.95.48,1.21-.36,2.47-.56,3.69-.9a25.09,25.09,0,0,0,8-4.24A9.33,9.33,0,0,0,744,148a8.53,8.53,0,0,1,2.61-2.32c.69-.39,1-.19.92.62a14.52,14.52,0,0,1-.29,1.73,2.63,2.63,0,0,0,1.22,2.9,4.76,4.76,0,0,0,2,.87,8.63,8.63,0,0,0,7.86-2.59,17.14,17.14,0,0,0,3.31-4.62,9.53,9.53,0,0,1,1.85-2.44c.26-.27.51-.71,1-.49s.32.76.23,1.17a6,6,0,0,1-.42,1.4c-1.33,2.8,1,6.23,4.91,6.07a7,7,0,0,0,2.41-.57.77.77,0,0,0,.46-1.17,2,2,0,0,0-.36-.63c-.87-.9-.75-1.87-.43-3a32.78,32.78,0,0,1,1.12-3.48c.16-.39.22-1,.74-1s.82.49,1,.91a11,11,0,0,1,1.06,6.26,43.75,43.75,0,0,1-1.44,5.51c-1,3.9-6.41,5.22-9.15,3.72-1.37-.75-1.78-.56-2,.94a17,17,0,0,0-.27,4.51c.38,3.47,2.63,5.53,5.53,7a11.28,11.28,0,0,0,8.52.65,41.55,41.55,0,0,0,11.23-5.19,71.09,71.09,0,0,0,11-8.94,2.28,2.28,0,0,0,.29-.33c.35-.46.78-.91.37-1.56s-.92-.42-1.44-.31a21.19,21.19,0,0,1-8.43.29c-2.92-.55-5-2.48-5.35-5.08a10.16,10.16,0,0,1,1-6,13.25,13.25,0,0,1,5.62-6,6.09,6.09,0,0,1,3.08-.71,1.6,1.6,0,0,1,.94.33,16.94,16.94,0,0,1,6.6,8c.46,1.26.74,1.29,2,.88a14.63,14.63,0,0,0,7.62-6.1c.83-1.2,1.74-2.35,2.65-3.5a4.36,4.36,0,0,1,2-1.61c.91-.3,1.28-1.17,1.77-1.89a15,15,0,0,1,4.36-4.27c2.46-1.58,4.89-.84,6.14,1.83a10.1,10.1,0,0,1,1,4.25c0,2.16.58,4.24.57,6.4A6,6,0,0,1,829,143a15.22,15.22,0,0,1-1.91,3.27c-.47.64-1.06,1.2-2,.84-3.22-1.24-6.56-2.23-9.54-4.06a7.47,7.47,0,0,1-1.62-1.25c-.58-.62-.82-.61-1.42,0a16.23,16.23,0,0,0-2,2.9,21.4,21.4,0,0,1-3,4.15,13,13,0,0,1-3.34,2.6,3.27,3.27,0,0,0-1.8,2.33c-.25,1-.61,2.06-1,3.07a18.92,18.92,0,0,1-4.27,6.4,52.81,52.81,0,0,1-9.44,7.83,50.22,50.22,0,0,1-7.32,4.55,31.06,31.06,0,0,1-6.5,2.24,12.25,12.25,0,0,1-13.52-7.36,17.52,17.52,0,0,1-.56-10.35c.34-1.43.71-2.84,1.11-4.25A6.3,6.3,0,0,0,760.72,151Zm34.53-4.12a9.52,9.52,0,0,0-3.1-2.87,2.6,2.6,0,0,0-3.13.11c-.8.55-.8.82,0,1.41C790.79,146.94,792.9,147,795.25,146.86ZM818.06,135a24.57,24.57,0,0,0,4.62,2.66c.42.17.87.13.77-.44-.36-2.16-2.22-3.61-4-2.78C819.09,134.58,818.73,134.71,818.06,135Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M217.78,161.89a1.83,1.83,0,0,0-1,.76,68.53,68.53,0,0,1-7.33,6.72c-1.83,1.45-3.85,2.66-5.79,4a55.45,55.45,0,0,1-10.33,5.46,16.1,16.1,0,0,1-9.63.66,5.51,5.51,0,0,1-2.28-1.26,14.22,14.22,0,0,1-5.26-9.19,26.32,26.32,0,0,1,.21-9.89c.95-4,2-8,4.13-11.52a8.39,8.39,0,0,1,1.36-2.23c.64-.57,1-.47,1.22.37a2.77,2.77,0,0,1-.25,2.13,71.44,71.44,0,0,0-3.29,7.82,13.32,13.32,0,0,0-.12,10.85c1.73,3.73,4.22,6.06,8.66,6.14a15.15,15.15,0,0,0,6-1.18,68.44,68.44,0,0,0,18.36-11.3c1.54-1.28,3-2.7,4.36-4.12,1.26-1.26,1.24-2.24-.2-3.27a6.38,6.38,0,0,0-4.45-1.51c-1.31.14-2.63.08-4,.11a7.48,7.48,0,0,1-5.16-2.13,4.63,4.63,0,0,1-1.48-3.09l-.21-2.77a2.16,2.16,0,0,1,0-.72c1-3.21,2.34-6.22,5-8.44a6.08,6.08,0,0,1,6.23-.27,8.65,8.65,0,0,1,1.65,1.21,25.9,25.9,0,0,1,3.23,3.78,18.79,18.79,0,0,1,3.27,11.9c-.14,2.72-.43,5.43-.45,8.17,0,3.3,1.44,5.92,3.26,8.43a5.22,5.22,0,0,0,1.34,1.12,3,3,0,0,0,3.87-.31c2.28-1.93,3.28-4.57,4.19-7.26a53.51,53.51,0,0,1,2.49-6.25,18.87,18.87,0,0,1,9.24-9,3,3,0,0,1,4.2,1.07,20.84,20.84,0,0,1,1.68,2.75,19.75,19.75,0,0,0,3.35,4.77c3.19,3.34,7,4.1,11.4,3a23.29,23.29,0,0,0,5.68-2.28c1.93-1.07,1.94-2,.55-3.89a3.65,3.65,0,0,0-3.05-1.48,39.56,39.56,0,0,0-5.55.1,7.41,7.41,0,0,1-3.45-.5,5,5,0,0,1-3-3.23,9.41,9.41,0,0,1-.42-4.47,14.41,14.41,0,0,1,3.51-7.73,6.43,6.43,0,0,1,4-2.24,3.61,3.61,0,0,1,2.73.83,18.58,18.58,0,0,1,5.3,5.58,37.67,37.67,0,0,1,3.23,7.19,13.86,13.86,0,0,1,.49,6.37,23.34,23.34,0,0,1-1.88,6.59,9.23,9.23,0,0,1-3.81,3.94,23.22,23.22,0,0,1-6.06,2.51,11.51,11.51,0,0,1-12.41-4.08,22.5,22.5,0,0,1-3-4.68,15.74,15.74,0,0,0-1-1.81c-.86-1.38-1.7-1.63-3.21-1a16.87,16.87,0,0,0-4,2.71,14.31,14.31,0,0,0-4.28,6.18c-.92,2.51-2,5-3.1,7.42a11.87,11.87,0,0,1-2.34,3.69c-1.94,1.93-3.74,2.43-6.47.29a11.42,11.42,0,0,1-2.62-3.13,21.53,21.53,0,0,1-2.7-6.29A8.3,8.3,0,0,0,217.78,161.89Zm48.27-19.77a5.1,5.1,0,0,0-2.25-2.39,2.82,2.82,0,0,0-2.9.09c-.46.25-1,.58-.9,1.2s.57.75,1,.91A11.65,11.65,0,0,0,266.05,142.12ZM209.52,144a6.84,6.84,0,0,0,2.16-.25c.36-.11.49-.37.26-.66A5,5,0,0,0,209,141c-1-.17-1.79.63-2.54,1.21-.58.45-.48.92.18,1.24A6,6,0,0,0,209.52,144Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M584.74,131.28c1,1.42,2,2.8,3.07,4.14a13.31,13.31,0,0,1,2.38,11.88,18.74,18.74,0,0,1-1.59,3.92,8.35,8.35,0,0,1-3.82,3.52,3.8,3.8,0,0,0-2.14,3.21,18.83,18.83,0,0,1-5,10.34,65.32,65.32,0,0,1-7.22,6.39,56.32,56.32,0,0,1-9.73,6.18,20.81,20.81,0,0,1-8.5,2.52,9.9,9.9,0,0,1-8.1-3.66c-2.75-3.05-3.51-6.79-3.67-10.7a23,23,0,0,1,.84-7.1c.08-.27.24-.55.07-.86-.39-.23-.63.11-.88.28-1.73,1.19-3.5,2.32-5.16,3.6a52.28,52.28,0,0,1-7.86,4.8c-3.93,2.07-8,3.85-12.08,5.61a26.65,26.65,0,0,1-5.77,1.58c-4.69.88-9.39,1.76-14.08,2.67a18,18,0,0,0-3.64,1.11,2,2,0,0,1-1.12.26.54.54,0,0,1-.46-.31.45.45,0,0,1,.15-.52,6.23,6.23,0,0,1,1.72-1.1c1.3-.54,2.61-1.08,3.93-1.56,6-2.18,11.84-4.83,17.66-7.46A150.22,150.22,0,0,0,533,159.82c3.4-2.18,6.61-4.67,9.88-7.06a15.66,15.66,0,0,0,2.88-3.09,1.6,1.6,0,0,0,.22-1.52,16.75,16.75,0,0,0-1.72-4.18,76.63,76.63,0,0,1-4.11-8.08,31.07,31.07,0,0,0-2.16-5.11,2,2,0,0,1-.2-1.29,30,30,0,0,1,.77-4.61c.3-1.23.82-1.3,1.67-.39,1.8,1.92,3.35,4,5,6.09a9.9,9.9,0,0,1,.72,1.1c.2.32.27.64,0,.92a.82.82,0,0,1-.94.2c-.29-.12-.52-.49-.93-.26-.13.54.27.9.48,1.32,1,2,2.15,4,3.11,6.13a13.61,13.61,0,0,1,1.26,7.12,25.61,25.61,0,0,1-1.3,6,10.75,10.75,0,0,1-2.25,3.74,6.58,6.58,0,0,0-1.65,3.36c-.27,1.44-.56,2.87-.76,4.33-.61,4.6,2.81,10,7.26,11.33a9.48,9.48,0,0,0,5.63,0,42,42,0,0,0,8.4-3.68,102.28,102.28,0,0,0,10.48-7.2,30.65,30.65,0,0,0,4.44-4.23,2.3,2.3,0,0,0,.72-1.25,1.54,1.54,0,0,0-2.06-1.76,23.17,23.17,0,0,1-5.16,1,8.8,8.8,0,0,1-3.7-.77,5.08,5.08,0,0,1-3.08-3.82c-.66-3.41.47-6.32,2.3-9.07a9.89,9.89,0,0,1,3.33-3c1.78-1.08,3.35-.64,4.92.35a14,14,0,0,1,3.81,4c.45.63.84,1.32,1.27,2,.56.87.77,1,1.66.61a17.68,17.68,0,0,0,3.67-1.82c1.5-1.06,1.66-1.61.7-3.18s-2-2.91-3-4.34a81.58,81.58,0,0,1-4.84-7.65c-1.1-1.95-1.72-3.71-1.22-5.9.18-.79.1-1.65.31-2.46.17-.66.54-.81,1-.36.65.59,1.39,1.06,2,1.7a28.13,28.13,0,0,0,4.28,4,2.06,2.06,0,0,1,.53.49.85.85,0,0,1-.51,1.45C585.72,131,585.3,130.83,584.74,131.28ZM573.38,151.6c.58-.1,1.16-.15,1.73-.29s.75-.52.23-1a13.71,13.71,0,0,0-1.47-1.17,2.7,2.7,0,0,0-3.69.27c-.67.58-.66,1,.12,1.43A9.11,9.11,0,0,0,573.38,151.6Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M796.28,87.37a1.59,1.59,0,0,1-.21.47c-.86.94-1.38,2.12-2.15,3.13a5.67,5.67,0,0,1-3.16,2c-3.68,1-7.24,2.33-11,2.94-2.46.4-4.8,1.34-7.21,1.91-3.7.88-7.44,1.58-11.15,2.38-2.86.61-5.71,1.25-8.57,1.9-4.09.91-8.13,2-12.3,2.6-2.77.41-5.53,1.14-8.3,1.73-4.44,1-8.74,2.38-13.11,3.58-1.7.46-3.42.79-5.13,1.2-5.08,1.21-10.16,2.37-15.2,3.73-5.37,1.45-10.79,2.7-16.19,4a102.29,102.29,0,0,0-9.84,2.84c-3.08,1.08-6.19,2.07-9.19,3.38-.27.12-.57.22-.82,0s-.1-.54,0-.8a29.33,29.33,0,0,1,2.38-3.85,6.06,6.06,0,0,1,2.8-2,177.22,177.22,0,0,1,23.56-6.94c4.72-1,9.37-2.34,14.07-3.48,3.83-.93,7.68-1.85,11.53-2.69,2-.45,4.09-.95,6.12-1.46,4.5-1.12,9-2.14,13.52-3.23,3.75-.9,7.58-1.4,11.35-2.17,3.11-.63,6.18-1.44,9.27-2.12,2.91-.64,5.83-1.19,8.74-1.83,4.57-1,9.13-2,13.7-3.06A53.23,53.23,0,0,0,787,89.56c2.7-1,5.59-1.4,8.21-2.64C795.92,86.58,796.34,86.79,796.28,87.37Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M609.1,98a20.16,20.16,0,0,0,.46,4c.82,4.47,1.17,9,1.77,13.49.57,4.31,1.38,8.58,1.86,12.89.66,6,1.18,12,.39,18-.6,4.54-1.41,9.08-3.71,13.16a33.92,33.92,0,0,1-5.32,6.95,11.6,11.6,0,0,1-3.4,2.26c-3.87,1.85-7.77,3.64-11.67,5.43-.41.19-1,.68-1.3.17s.38-.88.75-1.21c2.52-2.24,5.48-3.9,8.07-6.05a79.38,79.38,0,0,0,9.55-9.68,24.08,24.08,0,0,0,3.63-6,10,10,0,0,0,.67-5c-.37-4.37-.73-8.75-1.13-13.12-.11-1.21-.35-2.41-.52-3.62-.67-5-1.38-10-2-14.93-.54-4.26-1.35-8.48-1.88-12.73-.45-3.68-1.3-7.3-1.4-11a.68.68,0,0,0,0-.29c-.83-1.79,0-3.43.46-5.1.23-.74.49-1.48.76-2.21.15-.41.32-.9.82-.94s.7.47.85.87c.64,1.68,1.35,3.35,1.84,5.08A58.24,58.24,0,0,0,610.55,94c.42,1,.63,2.15,1.12,3.17a2.88,2.88,0,0,1,.18,1.14c0,.52.22,1.16-.46,1.4s-.85-.33-1.15-.7A2.86,2.86,0,0,0,609.1,98Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M574.72,99.83a7.12,7.12,0,0,0,1.17,1.78,74.7,74.7,0,0,0,8.57,10.55c2.55,2.69,5.1,5.39,7.79,7.94,1.94,1.84,3.89,3.68,5.9,5.46a37.68,37.68,0,0,1,5.62,6.34,32.55,32.55,0,0,1,3.63,6.33,15.19,15.19,0,0,1,1.28,5.38,26.82,26.82,0,0,0,.22,3.8,4,4,0,0,1-.24,1.87.44.44,0,0,1-.42.35.48.48,0,0,1-.39-.38,2.93,2.93,0,0,1-.13-.57,17.39,17.39,0,0,0-2.49-6.52,35.39,35.39,0,0,0-5.91-8c-3-2.87-5.78-5.94-9-8.62a98,98,0,0,1-9.69-9.75c-5.1-5.7-9.08-12.2-13-18.69a16.7,16.7,0,0,0-1.56-2.63,2.28,2.28,0,0,1-.44-1.36c0-1.66,0-3.32,0-5,0-.78.4-.94,1-.54a4.87,4.87,0,0,1,.77.67c2.64,2.6,5.38,5.1,7.85,7.87a14.55,14.55,0,0,0,1.86,1.64,3.17,3.17,0,0,1,1.34,1.86c.15.77-.28,1.14-1,.83a11.59,11.59,0,0,0-1.9-.76C575.32,99.67,575,99.52,574.72,99.83Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M435.54,97.12a7.08,7.08,0,0,1-1-2.23A27.69,27.69,0,0,0,433.43,92c-.66-1.42-1.43-2.67-3.15-2.92A.9.9,0,0,1,430,89c-2-1-2.27-2.48-.71-4a1.63,1.63,0,0,1,1.9-.28A4.38,4.38,0,0,1,432.92,86,22.59,22.59,0,0,1,435,89.5c.21.38.27.85.74,1.16.48-.48.42-1.15.54-1.72a12.78,12.78,0,0,1,1.74-4.47,3.69,3.69,0,0,1,1.19-1.26,1.41,1.41,0,0,1,1.77-.06,1.74,1.74,0,0,1,.81,1.76,8.25,8.25,0,0,1-.4,1.25c-.22.55-.54.69-1.15.42-1.36-.61-1.87-.37-2.32,1.1a17.07,17.07,0,0,0-.6,4.33,10.77,10.77,0,0,1-.11,2.34,7.88,7.88,0,0,1-.94,2.46c1.22-.37,2.18-.63,3.13-.93,12-3.83,23.92-7.82,36.11-11,3.21-.83,6.39-1.79,9.58-2.67.5-.13,1.11-.49,1.5,0s0,1.13-.28,1.64A2.26,2.26,0,0,1,484.83,85c-4.16,1.21-8.31,2.51-12.49,3.66-7,1.92-13.94,4.09-20.89,6.23-7.18,2.21-14.21,4.84-21.39,7-7.83,2.4-15.56,5.13-23.34,7.7-3.28,1.08-6.6,2.11-9.8,3.42a13.63,13.63,0,0,0-3.17,1.81c-.56.44-.51.76.09,1.08a4.47,4.47,0,0,0,1.57.34c1.33.2,1.8.63,1.71,1.54a1.87,1.87,0,0,1-2.21,1.93,5.93,5.93,0,0,1-3.64-1.7,1.88,1.88,0,0,1-.68-1.85,5.81,5.81,0,0,1,2-3.61,26,26,0,0,1,7.33-3.58q12.19-4.15,24.4-8.23c3.47-1.16,7-2.23,10.46-3.34C435,97.36,435.16,97.28,435.54,97.12Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M733.5,119.57c-1.29.35-2.65.68-4,1.08-6.07,1.83-12.25,3.33-18.23,5.46-1,.38-2.08.83-3.14,1.2s-1.34-.06-1.08-1a3.28,3.28,0,0,1,2.24-2.45c9.26-3.11,18.68-5.65,28.11-8.16,9.62-2.57,19.2-5.27,28.88-7.59,4.88-1.16,9.78-2.3,14.66-3.47,1.42-.35,2.83-.77,4.23-1.2,5.4-1.68,10.86-3.17,16.17-5.14a8.33,8.33,0,0,1,1.56-.41c.65-.1.88.19.74.85a3.64,3.64,0,0,1-3.44,2.87,10.15,10.15,0,0,0-2.69.63l-9.11,3.22a2.19,2.19,0,0,1-.84.25,10.41,10.41,0,0,0-4,.91c-5.78,1.82-11.74,2.91-17.6,4.39-6.63,1.67-13.26,3.29-19.83,5.14-3,.84-5.94,1.62-8.93,2.31a4.15,4.15,0,0,0-2.94,2.3c-1.73,3.17-3.45,6.35-5.12,9.55a7.91,7.91,0,0,0-1.05,4.2,5.57,5.57,0,0,0,.75,2.5,1.59,1.59,0,0,0,2.48.59c.24-.15.44-.39.69-.54s.6,0,.57.34a5.19,5.19,0,0,1-.28,1.58,18.39,18.39,0,0,1-2.46,4.47c-1.32,1.62-3,1.59-4-.21a8.83,8.83,0,0,1-1.2-6.19,18,18,0,0,1,1.87-5.37,65,65,0,0,1,4.55-7.67c.88-1.23,1.65-2.53,2.47-3.81A.48.48,0,0,0,733.5,119.57Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M631.18,160.66c.64-3.23.07-6.64-.08-10-.11-2.47-.55-4.93-.83-7.4-.38-3.24-.72-6.49-1.14-9.73-.39-3-.86-6-1.31-9-.74-4.87-1.44-9.74-2.26-14.6-.53-3.17-.81-6.38-1.32-9.55-.24-1.54-.36-3.1-.47-4.66a11.84,11.84,0,0,0-.66-3.72,2.77,2.77,0,0,1,0-1.59,55.1,55.1,0,0,1,1.66-5.3c.09-.27.22-.57.57-.6s.59.3.72.61c.38.89.77,1.79,1.07,2.71,1.26,3.79,3,7.39,4,11.29.19.75.54,1.46.79,2.2a5.71,5.71,0,0,1,.24,1c0,.4,0,.82-.44,1s-.64-.13-.86-.41c-.4-.5-.78-1-1.19-1.49a.53.53,0,0,0-.64-.2c-.27.14-.26.4-.22.64.24,1.64.49,3.28.73,4.92.88,5.93,1.71,11.87,2.65,17.79.79,5,1.08,10,1.78,14.95a74.56,74.56,0,0,1,.44,9.32,32.66,32.66,0,0,1-1.19,9.26c-.25.89-.41,1.8-.62,2.71a5.05,5.05,0,0,1-.25.84c-.11.27-.29.55-.64.48s-.42-.37-.45-.67S631.18,161,631.18,160.66Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M194.44,97.39a5,5,0,0,0-.11,2.24c1,5.83,1.17,11.74,1.79,17.6.47,4.42.79,8.84,1.24,13.26a119.62,119.62,0,0,1,.66,17.24,32.46,32.46,0,0,1-2.17,9.51c-.17.47-.32,1.24-1,1.1s-.44-.9-.38-1.39c.52-4.2,0-8.39-.09-12.57-.09-3.46-.58-6.9-.91-10.35-.44-4.71-.92-9.42-1.35-14.13s-.91-9.71-1.36-14.56c-.38-4.08-.84-8.15-1.08-12.24a15.07,15.07,0,0,0-.73-5.19,2,2,0,0,1,0-1.3,30.29,30.29,0,0,1,1.79-5.56c.15-.3.25-.7.66-.69s.46.44.6.74a10.76,10.76,0,0,1,1.15,3.6,5.66,5.66,0,0,0,.28,1.13c1,3.26,2.05,6.52,3,9.79a19.83,19.83,0,0,1,.57,2.86c.06.37.05.85-.4,1s-.59-.26-.78-.53A8.53,8.53,0,0,0,194.44,97.39Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M702.52,92.62a4.16,4.16,0,0,0,.36-1.8,11.5,11.5,0,0,1,2.56-6.28c1.24-1.53,2.5-1.38,3.37.39a2.58,2.58,0,0,1,.07,2.4c-.45.94-1,1-1.77.33-.6-.56-.78-.56-1.25,0a5.8,5.8,0,0,0-1.06,2.85,22.52,22.52,0,0,1-.94,4.73c-.28.79-.09,1,.75.8,2.62-.58,5.25-1.14,7.85-1.8q13-3.33,25.92-6.73c5.09-1.35,10.16-2.79,15.23-4.21a28.94,28.94,0,0,1,3.45-.6c.79-.12,1,.19.69.94a2.16,2.16,0,0,1-1.12,1.3,6.52,6.52,0,0,1-1.5.57A82.28,82.28,0,0,0,746.41,88c-8.78,2.47-17.56,4.93-26.4,7.19-6.24,1.59-12.53,3-18.77,4.57-7.17,1.86-14.37,3.65-21.54,5.54a89.85,89.85,0,0,0-8.91,2.89c-.48.18-1,.61-1.49.14s-.11-1.09.09-1.63a2.72,2.72,0,0,1,2-1.59c2.33-.74,4.64-1.5,7-2.21q6.79-2.07,13.72-3.64c2.57-.59,5.12-1.24,7.67-1.9,1.06-.27,1.47-.35.93-1.69a26.41,26.41,0,0,1-.78-3c-.34-1.25-.75-2.4-2.34-2.63a4.26,4.26,0,0,1-1.92-1,1.46,1.46,0,0,1-.48-2.06c1-2.3,2.32-2.54,4.09-.78a10.63,10.63,0,0,1,2.82,5.21A2.1,2.1,0,0,0,702.52,92.62Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M552.37,99.13a3.88,3.88,0,0,0-.07,2.15c.69,4.72,1.5,9.43,2.07,14.17.65,5.47,1.63,10.9,2.11,16.39.31,3.49.68,7,.78,10.48s-.07,6.81-.22,10.21a13.71,13.71,0,0,1-1.44,5.34c-.14.28-.23.72-.69.6s-.27-.46-.29-.75c-.16-3.06-.28-6.12-.5-9.18-.19-2.72-.47-5.43-.74-8.15-.52-5.44-1.45-10.82-2.14-16.23-.76-5.9-1.76-11.76-2.55-17.66-.39-2.89-.56-5.82-1-8.71a21,21,0,0,1-.64-5.64,1,1,0,0,0-.13-.57c-.79-1.37-.44-2.72.06-4.08.39-1,.74-2.12,1.15-3.16.17-.42.21-1.07.83-1s.55.61.71,1c.32.77.67,1.52.91,2.31.86,2.85,2.2,5.53,2.82,8.45A8.69,8.69,0,0,0,554.1,97a10.13,10.13,0,0,1,.93,3.37.57.57,0,0,1-.26.63.55.55,0,0,1-.65-.18C553.56,100.27,553,99.74,552.37,99.13Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M521.26,99.11a16.36,16.36,0,0,0,.35,3.17c1,5.9,2.16,11.79,3.12,17.71.89,5.53,1.93,11,2.46,16.63a44,44,0,0,1-.2,13.11,26.54,26.54,0,0,0-1,4.41.33.33,0,0,1,0,.13c-.18.39-.29,1-.82.86s-.31-.66-.3-1a65.07,65.07,0,0,0-.57-10.06c-.51-4.16-1.14-8.31-2-12.42-.62-3.11-.9-6.27-1.61-9.36-.93-4-1.47-8.16-2.22-12.23-.85-4.6-1.36-9.26-2.12-13.87-.31-1.93-.61-3.85-1-5.77a3.75,3.75,0,0,1,0-1.73,51.38,51.38,0,0,1,1.82-5.09c.09-.23.2-.49.47-.51s.51.25.63.52c.64,1.52,1.28,3.05,1.9,4.59Q522.15,93,524,97.83a6.18,6.18,0,0,1,.49,2.28c0,.38,0,.83-.45,1s-.61-.22-.82-.49A3.59,3.59,0,0,0,521.26,99.11Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M80,113.54a7.08,7.08,0,0,1,3.51-5.66,32.24,32.24,0,0,1,6.27-2.79c8.88-3.41,18-6.3,27-9.16q11.37-3.59,22.65-7.47,12.81-4.39,25.81-8.15c.52-.15,1-.39,1.52-.53s.84,0,.81.64a2.69,2.69,0,0,1-2.05,2.52c-3.37.81-6.62,2-9.92,3.07-5.76,1.84-11.5,3.75-17.23,5.67-4,1.35-8,2.81-12,4.14-4.72,1.56-9.48,3-14.21,4.55-2.69.87-5.39,1.74-8.06,2.65-4.39,1.5-8.78,3-13.13,4.57a40,40,0,0,0-7.06,3.19c-.62.38-1.52.75-1.46,1.49.08.92,1.15.87,1.87,1.11.37.12.76.18,1.12.31a1.82,1.82,0,0,1,.55,3.17.93.93,0,0,1-.8.28,9,9,0,0,1-4.3-1.72A2.63,2.63,0,0,1,80,113.54Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M404.33,122.83a3.08,3.08,0,0,1,2-2.51c2.61-1,5.19-2,7.79-3,5.23-2,10.54-3.84,15.86-5.6,9.21-3,18.4-6.14,27.68-9,5-1.55,10-3.36,14.88-5.31a15,15,0,0,1,2.8-.8c.81-.15,1.05.21.84,1a2.55,2.55,0,0,1-1.51,1.85,32.45,32.45,0,0,1-6.19,2.16,8,8,0,0,0-1.53.49c-5,2.08-10.12,3.56-15.21,5.23-7.69,2.54-15.4,5-23.07,7.6-7.16,2.42-14.28,5-21.29,7.77-.68.27-1.31.66-2,.91S404.22,123.61,404.33,122.83Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M290.9,89.84a11.5,11.5,0,0,1-.3,3.35c-.19,1,0,1.1.87.74,1.76-.72,3.5-1.48,5.26-2.2,6.31-2.61,12.71-5,19.15-7.27,6.16-2.18,12.39-4.16,18.62-6.12.43-.13.95-.55,1.34,0s0,.94-.19,1.38a2.51,2.51,0,0,1-1.59,1.41c-2.47.9-4.95,1.79-7.46,2.59-7.85,2.52-15.58,5.36-23.28,8.3a131,131,0,0,0-16.73,7.36,2.79,2.79,0,0,1-.53.24c-.63.19-1-.07-.91-.7a3.29,3.29,0,0,1,1.44-2.59c.67-.39,1.35-.78,2.06-1.11a1.61,1.61,0,0,0,1-1.62c-.09-2.61-.39-5.16-2-7.36-1-1.41-2.2-2.73-3.38-4a2.37,2.37,0,0,1-.34-3.08c.28-.48.64-.67,1-.23C288,82.1,291.19,85.2,290.9,89.84Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M298.8,178c-.48-.54-.67-.94-.23-1.51s.75-1.06,1.52-.9a.59.59,0,0,1,.27.11c1.82,1.38,4,1.1,6,1.14.44,0,.94,0,1.14.45a1.18,1.18,0,0,1-.45,1.3,2,2,0,0,1-1.63.47,14.69,14.69,0,0,0-5.47.65,28.14,28.14,0,0,1-8.5,1.3,3.27,3.27,0,0,1-2.54-.91,3.18,3.18,0,0,0-3.45-.78,13.31,13.31,0,0,1-4.49.49c-.7-.06-1.38-.1-1.64-.93-.16-.54-.6-.59-1.06-.56s-1,.11-1.45.16a20.64,20.64,0,0,1-7.82-.68,3.72,3.72,0,0,1-1.43-.72,2.12,2.12,0,0,1-.69-2.62,4.43,4.43,0,0,1,3-2.94,10.42,10.42,0,0,1,5.34-.34l3.68,1c.32.09.69.23.7.64s-.39.65-.76.77a4.16,4.16,0,0,1-1.89,0c-.82-.12-1.63-.28-2.45-.42a8.56,8.56,0,0,0-4.05.3,5,5,0,0,0-1.31.63c-.78.55-.75.94.07,1.37a3.7,3.7,0,0,0,.95.38,22.23,22.23,0,0,0,12.39-.41,1.83,1.83,0,0,0,1.31-1.22,6.19,6.19,0,0,1,1.79-2.63c.93-.8,1.45-.71,2.13.33a3.11,3.11,0,0,1,.5,1.8,6.65,6.65,0,0,0,.24,1.88,1.07,1.07,0,0,0,1.31.86c.82-.1,1.06-.34.95-1.24a4.25,4.25,0,0,1,1.33-3.71c.88-.86,1.19-.84,2,0,1.09,1.18,1.81,1.12,2.77-.2.35-.48.69-1.14,1.26-.18.2.34.38.14.55-.05s.53-.48.89-.22a1.07,1.07,0,0,1,.45,1,1.56,1.56,0,0,1-1.11,1.41c-1.12.34-2.26.61-3.4.85a2.57,2.57,0,0,1-2.29-.7c-.19-.16-.43-.29-.66-.12a.64.64,0,0,0-.19.79,2.2,2.2,0,0,0,1.62,1.34c.47.13,1,.16,1.44.28.91.24,1.26.64,1.17,1.23a1.21,1.21,0,0,1-1.57.9,7.4,7.4,0,0,0-3.34.14c-.24,0-.55.09-.54.38s.37.39.65.39a19.2,19.2,0,0,0,2.63,0C295.94,178.62,297.37,178.3,298.8,178Zm-17.27-.29a1.66,1.66,0,0,0,1.47.16c.81-.14,1.62-.31,2.42-.48,1.58-.34,1.72-.54,1.52-2.19-.08-.66-.09-1.52-.86-1.69s-1.14.63-1.42,1.23a4.75,4.75,0,0,1-2.56,2.43A.8.8,0,0,0,281.53,177.74Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M198.86,108c-.57,0-.84-.32-.76-.77a3.45,3.45,0,0,1,1.34-2.5,7,7,0,0,1,.89-.5c7.3-3.7,14.68-7.24,22.21-10.47,4.08-1.75,8.06-3.72,12.17-5.39q5.89-2.39,11.71-5c.8-.35,1.56-.8,2.34-1.2.26-.13.55-.28.83-.08s.24.6.13.94a3.54,3.54,0,0,1-2.27,2.46c-2.24.81-4.3,2.06-6.51,3-4.1,1.7-8.15,3.5-12.21,5.27-.81.35-1.61.72-2.4,1.09-6.75,3.16-13.64,6-20.31,9.38-2.13,1.07-4.21,2.25-6.31,3.37C199.41,107.76,199.09,107.89,198.86,108Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M378.48,135.72a1.52,1.52,0,0,1-.7-.38q-2-1.65-4.21-3.14c-1.08-.74-1.12-1-.6-2.2a25.34,25.34,0,0,1,2.47-4.13c.57-.82.83-.86,1.69-.28,1.3.86,2.55,1.79,3.83,2.69,1,.68,1.2.64,1.85-.34s1.19-1.91,1.85-2.81c.78-1.06,1.08-1.1,2.17-.42a47.57,47.57,0,0,1,4.64,3.31c.82.67.83.93.42,1.88-.66,1.53-1.76,2.79-2.45,4.31-.41.89-1,.93-1.79.33s-1.34-1.13-2-1.65-1.38-.92-2.08-1.37a.94.94,0,0,0-1.48.29,18.11,18.11,0,0,0-1.49,2.17,3.49,3.49,0,0,1-1.2,1.44A1.41,1.41,0,0,1,378.48,135.72Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M90.36,92.1a7.31,7.31,0,0,1-.09.93,2.58,2.58,0,0,1-3,2.16,2.4,2.4,0,0,1-.83-.24c-2-1.11-2.16-.55-3.11,1a20.59,20.59,0,0,1-4.19,4.25,50.89,50.89,0,0,1-11.66,7.5,6.74,6.74,0,0,1-2.34.78c-.35,0-.72,0-.83-.44s.16-.55.4-.71c.7-.45,1.39-.91,2.11-1.31A81.26,81.26,0,0,0,82,94.83a4.18,4.18,0,0,0,.51-.52c.33-.43.31-.81-.23-1a7.72,7.72,0,0,1-1.46-.67,2.2,2.2,0,0,1-1-2.52A5.29,5.29,0,0,1,80,89.5a23.38,23.38,0,0,0,1.89-5.19,2.83,2.83,0,0,1,.29-.67c.58-1.11,1.21-1.26,2.21-.45a15.16,15.16,0,0,1,1.44,1.45c.9,1,1.78,1.94,2.66,2.93A6.08,6.08,0,0,1,90.36,92.1Zm-4.09-2.57a.51.51,0,0,0-.47.3,1.06,1.06,0,0,0,.43,1.49c.52.29,1.22,1,1.65.53s-.32-1-.65-1.52A1.76,1.76,0,0,0,86.27,89.53Zm-2.47,0c-.16-.43-.15-1.1-.78-1.19-.48-.06-.76.45-.79.88,0,.65.49.76,1,.82C83.53,90.11,83.81,90.05,83.8,89.56Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M306.46,127.43a1.93,1.93,0,0,1-1.18-.5c-.91-.66-1.82-1.31-2.75-1.93a1.81,1.81,0,0,0-2.64.08,10.37,10.37,0,0,0-1.91,2c-.7,1-1.1,1-2.07.4-1.41-1-2.78-2-4.15-3a1.35,1.35,0,0,1-.43-1.81,22.48,22.48,0,0,1,2.6-4.38c.55-.77.88-.74,1.72-.18,1.37.92,2.72,1.88,4.12,2.76.86.54.94.48,1.53-.33a21.74,21.74,0,0,1,1.92-2.57c.75-.78,1-.87,1.87-.31,1.7,1.14,3.36,2.34,5.06,3.48.58.39.55.83.28,1.37-.77,1.53-1.9,2.82-2.74,4.3A1.13,1.13,0,0,1,306.46,127.43Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M100.24,173.42a.8.8,0,0,0-.81.51c-.54,1.16-1.53,2-2,3.22-.34.82-.7.88-1.53.51a12.18,12.18,0,0,1-2-1.27,16.88,16.88,0,0,0-3.17-2.09c-.87-.37-1-.74-.59-1.64a16.49,16.49,0,0,1,2.89-4.38c.68-.78,1.28-.77,2.17-.05a29.92,29.92,0,0,0,4.08,2.82c.91.5,1,.48,1.54-.34.71-1,1.37-2,2.12-3s.89-.83,1.87-.35c1.67.82,3.1,2,4.72,2.93a1,1,0,0,1,.43,1.38,14.92,14.92,0,0,1-1,1.95c-.46.75-.94,1.48-1.33,2.27-.62,1.22-.93,1.28-2.2.71a5.32,5.32,0,0,1-1.09-.73,27.53,27.53,0,0,0-3.17-2.09A2.06,2.06,0,0,0,100.24,173.42Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M409.26,175.66a2.31,2.31,0,0,1-.39.93c-.8,1.46-2.11,2.53-3,3.95-.44.73-.95.71-1.76.14-1.23-.88-2.42-1.82-3.65-2.69s-1.18-.81-2,.38c-.53.75-1.06,1.51-1.53,2.31s-1,1-1.91.4c-1.64-1.15-3.23-2.35-4.84-3.54a1.13,1.13,0,0,1-.34-1.56,26.44,26.44,0,0,1,3-4.64c.57-.67.8-.62,1.59,0a29.86,29.86,0,0,0,4.53,3.2c.95.5,1,.52,1.64-.36s1.12-1.6,1.73-2.36c.77-1,1.06-1,2-.21l4.3,3.27C409,175.08,409.28,175.24,409.26,175.66Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M332.38,130a1.52,1.52,0,0,1-.91-.45,28.68,28.68,0,0,0-3.8-2.46c-1.11-.58-1.12-.55-1.86.49a13.75,13.75,0,0,0-1.37,2.23c-.55,1.2-1,1.34-2.2.86a8.06,8.06,0,0,1-2.29-1.28,19.74,19.74,0,0,0-2.43-1.62,1.09,1.09,0,0,1-.5-1.59,35.41,35.41,0,0,1,2.47-4.48c.58-.89.87-1,1.81-.4,1.51.9,3,1.86,4.46,2.79.87.54.91.53,1.49-.31s1.21-1.89,1.88-2.79c.82-1.1,1.1-1.14,2.32-.45a29.38,29.38,0,0,1,3.81,2.45c1,.82,1.07,1.08.52,2.24a7.33,7.33,0,0,1-1.4,2.21,7.93,7.93,0,0,0-1,1.75A1.42,1.42,0,0,1,332.38,130Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M659.65,126.18a5.84,5.84,0,0,1-.38.92c-.72,1.27-1.44,2.54-2.21,3.77-.53.84-.84.89-1.67.36s-1.77-1.22-2.67-1.79c-.53-.34-1.1-.63-1.66-.92a.94.94,0,0,0-1.46.45c-.54,1.21-1.49,2.16-2.07,3.35s-.91,1.17-2,.46-2.26-1.33-3.4-2c-.38-.22-.76-.43-1.12-.68a1.12,1.12,0,0,1-.4-1.54,31.76,31.76,0,0,1,2.49-4.63,1,1,0,0,1,1.38-.4,6.93,6.93,0,0,1,1.55.81,27,27,0,0,0,3.39,2c.58.36.89.13,1.12-.43a19.52,19.52,0,0,1,1.65-3.09,7.33,7.33,0,0,1,.78-1,1,1,0,0,1,1.45-.18c1.48,1,3,1.86,4.44,2.82A1.57,1.57,0,0,1,659.65,126.18Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M80.92,127a6.44,6.44,0,0,1-.65,2c-.44.93-.89,1.84-1.26,2.8s-.87,1.22-1.79.68c-1.44-.83-2.83-1.72-4.25-2.58a1.44,1.44,0,0,1-.64-1.77,24.78,24.78,0,0,1,1.47-3.81c.54-1.33.56-1.42-.57-2.34-.79-.65-1.66-1.2-2.48-1.81-.47-.34-.92-.72-1.37-1.09a1.73,1.73,0,0,1-.57-2.09,28.78,28.78,0,0,1,2-4.56c.43-.8.72-.87,1.38-.41,1.4,1,2.78,2,4.18,3a2.52,2.52,0,0,1,1,3.08c-.36,1.17-.88,2.27-1.34,3.4s-.4,1.29.64,1.87c1.2.66,2.32,1.43,3.47,2.17A1.54,1.54,0,0,1,80.92,127Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M237,118a12.75,12.75,0,0,1-1.05,2.93,14.49,14.49,0,0,0-.83,2.19,1.14,1.14,0,0,0,.68,1.54c1.17.6,2.32,1.24,3.47,1.88s1.29.91.87,2.11c-.53,1.52-1.12,3-1.73,4.5-.34.82-.7.94-1.5.59a48,48,0,0,1-4.63-2.5,1.39,1.39,0,0,1-.69-1.74,24.72,24.72,0,0,1,1.61-4.08c.65-1.4.59-1.68-.72-2.48-.92-.56-1.88-1-2.81-1.57-1.7-1-1.88-1.54-1.21-3.33a32.07,32.07,0,0,1,1.58-3.78c.5-1,.68-1,1.58-.47,1.35.78,2.71,1.54,4.06,2.33C236.66,116.71,237,117.21,237,118Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M233.74,103.37a3.27,3.27,0,0,1,1.86-2.65c6.4-3.11,12.81-6.2,19.41-8.88,5.19-2.11,10.32-4.38,15.48-6.57a8.33,8.33,0,0,1,1.36-.53c.61-.14.95.18.84.81a3,3,0,0,1-1.93,2.36c-4.18,1.77-8.31,3.65-12.48,5.4-7.64,3.21-15.24,6.51-22.58,10.38a6.46,6.46,0,0,1-.92.44C234,104.41,233.67,104.13,233.74,103.37Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M163.69,118c-.12.31-.27.78-.45,1.23-.51,1.21-1.22,2.32-1.72,3.54-.38.93-.77,1-1.6.54q-2-1.19-4-2.47c-.93-.62-1-.9-.66-2A34.3,34.3,0,0,1,157,115c.54-1.17.55-1.25-.54-2s-2-1.33-3.06-2c-1.23-.84-1.37-1.21-.88-2.56a26.88,26.88,0,0,1,2-4.06c.47-.85.8-.89,1.67-.36,1.17.7,2.33,1.42,3.47,2.17s1.3,1.36.83,2.74c-.41,1.21-1.21,2.22-1.66,3.41s-.5,1.28.61,2,2.33,1.43,3.49,2.14A1.34,1.34,0,0,1,163.69,118Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M657.34,87.46a1.58,1.58,0,0,1,0,.43,3.48,3.48,0,0,0,1.26,3.74,1.82,1.82,0,0,1-.39,2.77.71.71,0,0,1-.82,0l-.74-.47c-.86-.51-.89-.51-1.52.33-.5.66-1,1.32-1.48,2a18.91,18.91,0,0,1-3.62,3.8,84.11,84.11,0,0,1-14.17,9.28,5,5,0,0,1-.65.33.48.48,0,0,1-.4-.06c-.18-.14-.12-.34,0-.52a4,4,0,0,1,1.36-1.31c4.72-3,9.07-6.42,13.49-9.79a23.15,23.15,0,0,0,4.44-4.62c.61-.82.56-1-.3-1.65a19.66,19.66,0,0,1-2.6-2.56,2.34,2.34,0,0,1-.42-2.59,7.3,7.3,0,0,1,3.12-3.92c1.35-.7,2.18-.44,2.86.92A8,8,0,0,1,657.34,87.46Zm-2.11,1.37a3.75,3.75,0,0,0-.3-2.39A.73.73,0,0,0,653.8,86a.83.83,0,0,0-.32,1.32A6.13,6.13,0,0,0,655.23,88.83Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M659,105.33l2.57-1.55A121.6,121.6,0,0,0,677.53,92.7l.34-.28c.57-.55.55-.65-.12-1-1.72-1-1.93-1.49-1.25-3.28a8.44,8.44,0,0,1,.68-1.46,4.86,4.86,0,0,0,.89-2.28,1.69,1.69,0,0,1,.13-.42c.7-1.94,1.28-2.08,2.65-.51a39.13,39.13,0,0,1,3.73,4.49,4,4,0,0,1,.31,4.4c-.71,1.25-1.58,1.72-2.78,1-1.69-1-2.65-.51-3.93.8a34.37,34.37,0,0,1-6.55,5.12c-2.32,1.44-4.59,2.94-7,4.29a26.73,26.73,0,0,1-5.15,2C659.38,105.59,659.23,105.6,659,105.33Zm20.69-16.51c.23,0,.33-.31.3-.69,0-.6-.52-1.11-1-1a.9.9,0,0,0-.76.92C678.24,88.42,678.93,88.84,679.71,88.82Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M105.8,132.36c-1.29,0-3.1-1.62-3.56-3.19a11.25,11.25,0,0,1-.09-5.35c1.06-5.54,3.57-10.48,6.33-15.33.62-1.1,1.16-2.25,1.81-3.34.32-.53.54-1.64,1.25-1.3s0,1.23-.25,1.82c-.39,1-.93,1.93-1.38,2.91-1.1,2.39-2.41,4.68-3.36,7.13a11.27,11.27,0,0,0-.75,7.15,2.74,2.74,0,0,0,.65,1.28c1.18,1.19,2.16,1.08,3-.38.1-.17.18-.35.27-.52s.32-.42.59-.35a.56.56,0,0,1,.37.71c-.63,2.75-1.29,5.5-3.05,7.82A2.33,2.33,0,0,1,105.8,132.36Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M820.42,103.25a6.32,6.32,0,0,1-.56,2.74,1.63,1.63,0,0,0,.49,2.08,3.06,3.06,0,0,1,.3.32c1.17,1.24,1.18,1.79.08,3.09-.39.46-.73.56-1.23.17s-.75-1.17-1.51-1c-.57.17-.84.79-1.27,1.18a41,41,0,0,1-6.74,5.36c-2.44,1.42-4.87,2.86-7.31,4.29a5.68,5.68,0,0,1-.77.41c-.42.17-.94.66-1.28.08s.24-.89.6-1.2a36.33,36.33,0,0,1,4-2.74,85.33,85.33,0,0,0,9.78-6.9c2.13-1.77,2.14-1.76.33-3.74-.4-.43-.74-.9-1.14-1.33a2.29,2.29,0,0,1-.35-2.83,7.72,7.72,0,0,1,3.28-3.43,1.94,1.94,0,0,1,2.83.88A5.12,5.12,0,0,1,820.42,103.25ZM818,104.4c0-.83-.27-1.27-.84-1.26a.62.62,0,0,0-.68.6c0,.42.83,1.41,1.16,1.35S818,104.68,818,104.4Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M323.64,181.87a3,3,0,0,1,1.88-2.52c4.22-1.67,8.4-3.42,12.6-5.13,5.37-2.18,10.88-4,16.07-6.65a3.52,3.52,0,0,1,.68-.26c.63-.13.95.18.82.82a3.05,3.05,0,0,1-1.38,2.14,38.58,38.58,0,0,1-5.3,2.46c-4,1.7-8.06,3.21-12.08,4.83-3.8,1.54-7.58,3.1-11.3,4.84a6.36,6.36,0,0,1-.93.4C323.92,183,323.58,182.69,323.64,181.87Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M796.79,173c.15-.59.63-.76,1.06-.91,4-1.36,7.66-3.42,11.64-4.77a31.14,31.14,0,0,0,6.92-3.47,10.33,10.33,0,0,0,3.62-3.75,14.63,14.63,0,0,1,3.26-3.92c1.45-1.28,2.83-.86,3.21,1a14.16,14.16,0,0,1,.4,3.05,3.51,3.51,0,0,1-.44,1.82,1.8,1.8,0,0,1-2.2,1,8,8,0,0,1-2.61-.92.93.93,0,0,0-1.46.36,17.33,17.33,0,0,1-7.5,5.87,79.74,79.74,0,0,1-11,4c-1.46.44-3,.49-4.45.81C797.13,173.16,797,173.05,796.79,173Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M397.65,139.35l-.39.4c-.38.37-.69.22-.68-.23a4.68,4.68,0,0,1,1.26-3.19A1,1,0,0,1,399,136a1.07,1.07,0,0,1,.51,1,8.88,8.88,0,0,1-.31,2.46,23.2,23.2,0,0,0-.46,2.29,2.43,2.43,0,0,0,1.48,2.48,1.93,1.93,0,0,0,2.43-.24,1.79,1.79,0,0,0,.66-2.07c-.32-1-.56-2.07-.81-3.12a4.11,4.11,0,0,1,.26-2.72c.37-.79.76-.83,1.24-.12a7.94,7.94,0,0,1,1.08,3.31c.12.77.2,1.55.37,2.31a3.08,3.08,0,0,0,1.71,2.25,1.2,1.2,0,0,0,1.38-.06c.42-.37.21-.83,0-1.22-.37-.74-.82-1.44-1.19-2.18a4,4,0,0,1-.2-3.79c.13-.26.27-.56.62-.54s.4.28.45.51a10,10,0,0,0,1.35,2.74,6.56,6.56,0,0,1,.71,5.62,2.86,2.86,0,0,1-4.86,1.25l-.21-.2c-.81-.78-.81-.78-1.6.1l-.21.21c-2.11,2.2-5.13,1.46-6-1.49a5.25,5.25,0,0,1,0-3A5,5,0,0,0,397.65,139.35Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M284.79,110.63a3,3,0,0,1,1.83-2.45q7-3.39,14.16-6.29c4.16-1.68,8.34-3.3,12.51-4.94.57-.23,1.26-.71,1.76-.18s-.07,1.26-.29,1.87a1.77,1.77,0,0,1-1.2,1c-6.2,2.21-12.2,4.9-18.28,7.42-2.79,1.16-5.49,2.51-8.24,3.78a13.12,13.12,0,0,1-1.33.59C285,111.64,284.7,111.36,284.79,110.63Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M704.83,167.25a3.42,3.42,0,0,0,0,.44.75.75,0,0,0,.64.85.72.72,0,0,0,.92-.49,4.4,4.4,0,0,1,.84-1.53c.33-.39.67-.39.93.07a2.88,2.88,0,0,1,.3.82c.49,2.23-1.87,4.67-4,4a3.15,3.15,0,0,0-2.94.51,4,4,0,0,1-4.68.2,3,3,0,0,0-2.79-.24,8.18,8.18,0,0,0-2.34,1.18,49.57,49.57,0,0,0-4.07,3.1c-2.65,2.44-5.86,3.4-9.3,3.87-.87.12-1.73.24-2.59.41-.36.08-.89.32-1-.14s.43-.51.77-.64c2.05-.78,4.13-1.48,6.2-2.21a23.54,23.54,0,0,0,7.26-4.55c1.09-.9,2.23-1.74,3.35-2.6a9.63,9.63,0,0,1,2.6-1.31,3.25,3.25,0,0,1,3.18.32,3.37,3.37,0,0,0,4.81-1.15c.26-.42.47-.86.73-1.27s.47-.83,1-.65S704.88,166.87,704.83,167.25Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M319.54,102.62l.17-1.16c0-.29.14-.63-.07-.85a1.49,1.49,0,0,1-.37-1.6,4.54,4.54,0,0,1,1.45-2.32c.62-.47,1.06-.32,1.31.43a2.48,2.48,0,0,1,0,1.15,19.23,19.23,0,0,1-.72,2.83,1.46,1.46,0,0,0,.53,1.82,2.23,2.23,0,0,0,2.33.39,1.89,1.89,0,0,0,1.22-1.82,15.63,15.63,0,0,0-.71-3.13,3.81,3.81,0,0,1,.28-2.7c.38-.79.71-.83,1.22-.11a4.88,4.88,0,0,1,.8,2,20.67,20.67,0,0,0,.91,3.54,2.55,2.55,0,0,0,2.49,1.89c.62,0,.81-.29.52-.84-.39-.74-.89-1.41-1.26-2.15a4,4,0,0,1-.38-3.64c.11-.26.21-.59.56-.61s.42.36.52.61A14.65,14.65,0,0,0,331.86,99c1.3,1.91,1,3.89.19,5.86a1.93,1.93,0,0,1-2.25,1.21,3.88,3.88,0,0,1-2.42-1.23c-.77-.81-.78-.79-1.58.07-.24.25-.5.47-.73.73a2.61,2.61,0,0,1-3.27.79,3.41,3.41,0,0,1-2.25-3C319.53,103.3,319.54,103.1,319.54,102.62Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M751.12,165.55a1.27,1.27,0,0,0,.07.86.79.79,0,0,0,.67.49c.3,0,.42-.21.51-.44a6.13,6.13,0,0,1,.94-1.65c.25-.33.57-.43.8,0a3.62,3.62,0,0,1-.41,3.73,2.47,2.47,0,0,1-2.56,1.32,1.6,1.6,0,0,1-.83-.21c-.71-.6-1.26-.45-1.89.16a3.3,3.3,0,0,1-3.68.69,5.3,5.3,0,0,0-4.37.39,22.6,22.6,0,0,0-4.47,3q-3.09,2.46-6.37,4.66a8.42,8.42,0,0,1-5.12,1.44,4.4,4.4,0,0,1-.73-.06c-.38-.07-.85-.12-.84-.63s.42-.5.75-.57a23.63,23.63,0,0,0,3.39-.93,17,17,0,0,0,4.47-2.73c2.46-2,5-3.94,7.47-5.87a12,12,0,0,1,3.52-1.76,4.64,4.64,0,0,1,3.14,0c2,.7,2.93.29,4-1.51.22-.38.44-.76.68-1.13a.54.54,0,0,1,.6-.31c.29.08.32.34.31.59A3,3,0,0,1,751.12,165.55Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M152.4,97.08a1.76,1.76,0,0,0-.25-1.58,1.76,1.76,0,0,1,0-1.68,5.35,5.35,0,0,1,1.25-2.46c.42-.4.79-.34,1,.19a3.68,3.68,0,0,1,.26,2.15c-.13.82-.27,1.63-.42,2.45a1.52,1.52,0,0,0,.63,1.79,1.74,1.74,0,0,0,1.93,0,1.53,1.53,0,0,0,.8-1.85,19.33,19.33,0,0,0-.73-3,3.19,3.19,0,0,1,.14-2.55c.12-.26.22-.58.56-.62s.57.31.73.61a11.74,11.74,0,0,1,.86,2.32c.29,1,.58,2.07.9,3.09a2.27,2.27,0,0,0,1.13,1.47c.36.17.75.32,1.1,0s.19-.71,0-1.07c-.29-.72-.62-1.43-.89-2.16a5.46,5.46,0,0,1-.33-2.44,2.22,2.22,0,0,1,.45-1.22c.26-.32.67-.45.8,0,.59,2.11,2.06,3.9,2.23,6.15a3.67,3.67,0,0,1-1.18,3.31,2.64,2.64,0,0,1-3.71,0c-.87-.71-.88-.72-1.68.11a5,5,0,0,1-1.27,1,2.59,2.59,0,0,1-3.65-1A6.33,6.33,0,0,1,152.4,97.08Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M209.89,93.15A7.54,7.54,0,0,1,207,92.7a4,4,0,0,0-4,.4,3.85,3.85,0,0,1-.38.23.47.47,0,0,1-.54,0c-.19-.14-.14-.34-.11-.54.35-2.16,3-4.16,5-3.4s3.36,0,4.66-1.29c1.14-1.13,2.26-2.29,3.4-3.43a8.28,8.28,0,0,1,1.9-1.59,2.27,2.27,0,0,1,3.49,2.19c-.24,2.13-1,4.06-3,5.23a26.14,26.14,0,0,1-4.88,2.29A11,11,0,0,1,209.89,93.15Zm2.84-3.39a14.1,14.1,0,0,0,5.67-2.58c.51-.35.25-.8-.14-1.08a1.68,1.68,0,0,0-2,.14A27.8,27.8,0,0,0,213,88.92.71.71,0,0,0,212.73,89.76Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M480.47,110.76c.06-.39.22-.85-.08-1.13-.8-.74-.45-1.5-.14-2.27a5.08,5.08,0,0,1,.83-1.7.78.78,0,0,1,1.4.19,2.31,2.31,0,0,1,.17,1.44c-.12.77-.24,1.54-.39,2.3a1.44,1.44,0,0,0,.66,1.64,2.2,2.2,0,0,0,2.08.38,1.11,1.11,0,0,0,.68-1.43,16,16,0,0,0-.81-3.41,3,3,0,0,1,.27-2.66c.26-.54.67-.57,1,0a11.16,11.16,0,0,1,.95,2c.33.92.57,1.86.85,2.8a1.92,1.92,0,0,0,.48,1c.37.31.78.79,1.27.5s.15-.88,0-1.28c-.33-.71-.74-1.37-1.11-2.06a2.88,2.88,0,0,1,.18-2.93c.25-.45.63-.49.91,0a13.7,13.7,0,0,1,2.47,6,2.9,2.9,0,0,1-2.3,3.4,2.53,2.53,0,0,1-2.08-.43c-.55-.36-.94-.23-1.35.3-1.17,1.48-2.24,1.83-3.64,1.27A3.63,3.63,0,0,1,480.47,110.76Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M213.37,118.58c.16-1,.3-1.8.44-2.65a16.06,16.06,0,0,1,1.83-5.07,5,5,0,0,1,.57-.84c.5-.55,1-1.12,1.87-.82a2.13,2.13,0,0,1,1.33,2.22,3.57,3.57,0,0,1-.37,1.1c-.27.51-.66.88-1.29.5s-1.19,0-1.59.52a3.85,3.85,0,0,0-.68,1.6,38.65,38.65,0,0,0-.71,4.77,11.08,11.08,0,0,1-.68,3.13c-.16.46-.38,1-1,1s-.91-.51-1.06-1a40,40,0,0,0-1.64-4.22,3.73,3.73,0,0,0-2.6-2.34,5,5,0,0,1-1.75-1,1.81,1.81,0,0,1-.64-2.21A9.12,9.12,0,0,1,206,112c.76-1.43,1.47-1.58,2.79-.63a6,6,0,0,1,1.5,1.78,29.45,29.45,0,0,1,2.48,4.8A1,1,0,0,0,213.37,118.58Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M112.29,179.28a.63.63,0,0,1-.56-.87,3.81,3.81,0,0,1,2-2.69c3.62-1.57,7.21-3.23,10.79-4.87,3.37-1.54,6.72-3.11,10.09-4.65.45-.2.94-.76,1.43-.2s.09,1-.1,1.51a2.5,2.5,0,0,1-1.22,1.2c-3.71,2.07-7.59,3.79-11.41,5.61-2.42,1.15-4.9,2.18-7.26,3.44-1.09.58-2.26.93-3.37,1.41A2.19,2.19,0,0,1,112.29,179.28Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M106.81,92.4c.44-.2.33-.59.37-.9a21.74,21.74,0,0,1,2-6.38,3.81,3.81,0,0,1,.83-1.19,1.8,1.8,0,0,1,2-.5,2,2,0,0,1,1.26,1.82,2.66,2.66,0,0,1-.36,1.54c-.38.72-.66.79-1.37.37-.91-.54-1.36-.41-1.85.71a16.89,16.89,0,0,0-1.27,5.52,13.44,13.44,0,0,1-.57,3.16,4.39,4.39,0,0,1-.47,1.06.67.67,0,0,1-1.2,0,5.55,5.55,0,0,1-.56-1.18c-.64-1.58-1.27-3.17-1.91-4.75A2.89,2.89,0,0,0,102,90a6.68,6.68,0,0,1-1.66-.9,1.63,1.63,0,0,1-.78-2.25,7.19,7.19,0,0,1,.44-1.08c.62-1.24,1.43-1.44,2.59-.65a5.33,5.33,0,0,1,1.69,2,27,27,0,0,1,2.14,4.63A1.09,1.09,0,0,0,106.81,92.4Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M534.63,111a26.44,26.44,0,0,1,1.37-5,13,13,0,0,1,1.28-2.45c.93-1.24,1.78-1.41,2.84-.61a2.6,2.6,0,0,1,.86,3.47c-.36.52-.76.45-1.26.2-1.54-.8-2.09-.59-2.72,1a13.2,13.2,0,0,0-.63,2.85c-.22,1.44-.43,2.88-.68,4.32a6,6,0,0,1-.39,1.25.83.83,0,0,1-.75.61c-.47,0-.65-.37-.79-.74a4,4,0,0,1-.14-.57,24.9,24.9,0,0,0-1.7-4.34,2.22,2.22,0,0,0-1.75-1.37,9.75,9.75,0,0,1-2-.57,1.7,1.7,0,0,1-1.06-2.36,10.06,10.06,0,0,1,.64-1.47,1.41,1.41,0,0,1,2.18-.68,7.22,7.22,0,0,1,3,3.13C533.46,108.72,534,109.75,534.63,111Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M532.28,89.93a4.07,4.07,0,0,1-2.66-.63,2.43,2.43,0,0,0-3.2.32A1.94,1.94,0,0,1,526,90c-.44.21-.65,0-.61-.44a5.52,5.52,0,0,1,3.33-3.78,2.6,2.6,0,0,1,1.69.34,2.35,2.35,0,0,0,3.22-.66c.84-1,1.79-1.92,2.71-2.86a11.16,11.16,0,0,1,1.05-1,2,2,0,0,1,2.67-.3,2.5,2.5,0,0,1,1.35,2.81,4.9,4.9,0,0,1-1.68,2.85A12,12,0,0,1,532.28,89.93Zm3-3.56a7.46,7.46,0,0,0,3-1.07c.3-.19.83-.34.65-.81s-.69-.44-1.13-.41a1.6,1.6,0,0,0-.9.42A6.56,6.56,0,0,0,535.25,86.37Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M638.73,89.27a5.61,5.61,0,0,1-2.81-.7,2.12,2.12,0,0,0-2.46,0,.33.33,0,0,1-.13.07c-.59.24-1.29.6-1.76,0s.22-1,.49-1.52a6.43,6.43,0,0,1,2.4-2.08,1.94,1.94,0,0,1,2,0,1.61,1.61,0,0,0,2-.35c1.26-1.07,2.6-2,3.92-3a3.2,3.2,0,0,1,1.89-.68,2.21,2.21,0,0,1,2.49,2.52,5.09,5.09,0,0,1-2.4,4.13A11.25,11.25,0,0,1,638.73,89.27Zm1.55-3.35A5.74,5.74,0,0,0,644,85.2c.26-.15.55-.32.44-.67a.66.66,0,0,0-.72-.38,4.85,4.85,0,0,0-1,.16A5.41,5.41,0,0,0,640.28,85.92Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M329,115.4a6.26,6.26,0,0,1-1,2.15,30.15,30.15,0,0,0-1.67,2.73,2,2,0,0,1-.79.85c-.33.19-.72.24-.89-.13-.74-1.51-2.34-2-3.51-3-.33-.28-.71-.5-1.06-.77-.89-.69-1-.93-.59-2a18.13,18.13,0,0,1,2.52-4.43c.53-.74.8-.78,1.59-.24,1.49,1,2.94,2.07,4.4,3.13A2.35,2.35,0,0,1,329,115.4Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M224.25,184.17c-.47,0-.65-.29-.59-.61.16-1,.33-2,1.4-2.57,3.29-1.69,6.56-3.41,9.86-5.1,3.68-1.88,7.57-3.35,11.12-5.51a3.1,3.1,0,0,1,.51-.27c.63-.24.95,0,.79.7a3.49,3.49,0,0,1-1.52,2.23,37,37,0,0,1-5.38,3c-4.47,1.95-8.67,4.41-13,6.63-.82.42-1.63.86-2.46,1.28A7,7,0,0,1,224.25,184.17Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M671.92,143.25a10.08,10.08,0,0,0,.53-2.12,12.84,12.84,0,0,1,2.43-5.43,1.82,1.82,0,0,1,2-.87c.69.2,1.32.61,1.37,1.36a2.51,2.51,0,0,1-1,2c-.24.23-.53.09-.82,0-1.38-.42-1.77-.2-2.22,1.2a37.73,37.73,0,0,0-.77,4.6c-.15.77-.28,1.54-.4,2.31a5.57,5.57,0,0,1-.86,2.16c-.38.59-.86.58-1.26,0a2.43,2.43,0,0,1-.41-.93,25.87,25.87,0,0,0-1.4-4,2.71,2.71,0,0,0-1.73-1.83,10.91,10.91,0,0,1-1.58-.76,1.48,1.48,0,0,1-.9-1.41,5.56,5.56,0,0,1,1.44-3.13c.25-.29.61-.22,1-.11a3.69,3.69,0,0,1,1.71,1.31,16.54,16.54,0,0,1,2,3.75A6.55,6.55,0,0,0,671.92,143.25Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M161.39,171.71c.37-.29.25-.72.28-1.08a18.19,18.19,0,0,1,1.59-5.91,4.18,4.18,0,0,1,1-1.43,1.74,1.74,0,0,1,3,.64,2.48,2.48,0,0,1-.14,2.25c-.29.58-.64.76-1.28.34-.85-.57-1.34-.4-1.84.51a6.67,6.67,0,0,0-.67,2.39c-.16,1.2-.28,2.42-.37,3.63a17.44,17.44,0,0,1-.67,3.44,3.57,3.57,0,0,1-.34.81c-.15.26-.35.49-.69.44s-.4-.27-.48-.5-.18-.66-.28-1a23.89,23.89,0,0,0-2.07-5,2.34,2.34,0,0,0-1.76-1.38,1.53,1.53,0,0,1-.42-.11c-2.71-1-2.2-2.54-1-4.33.38-.58,1-.4,1.61-.14a5.24,5.24,0,0,1,2,1.87,26.82,26.82,0,0,1,2,3.73C161,171.19,161,171.58,161.39,171.71Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M758.73,133.64a13.44,13.44,0,0,1,1.85-5.8,5.12,5.12,0,0,1,.81-1,1.65,1.65,0,0,1,1.86-.52,2,2,0,0,1,1.23,1.84,3.56,3.56,0,0,1-.42,1.69c-.4.92-.56,1-1.26.23-.88-.89-1.73-.73-2,.49a41.62,41.62,0,0,0-.64,4.34,13.55,13.55,0,0,1-1.1,3.93c-.18.39-.34.89-.87.87s-.73-.57-.87-1a6.42,6.42,0,0,1-.26-1.29,12.26,12.26,0,0,0-1-3.36,3.06,3.06,0,0,0-2-1.77,4.44,4.44,0,0,1-1.6-.71,1.57,1.57,0,0,1-.44-2.3,11.69,11.69,0,0,1,.75-1.09c.94-1.23,2.12-1.26,3,.05a15.22,15.22,0,0,1,2.36,4.36A1.77,1.77,0,0,0,758.73,133.64Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M63.92,178.89A3.5,3.5,0,0,1,65.51,176c1.14-.66,2.29-1.29,3.47-1.88q4.84-2.42,9.68-4.85c1.57-.79,3.1-1.65,4.68-2.42.49-.24,1.12-.74,1.61-.22s-.08,1.08-.3,1.6a3.06,3.06,0,0,1-1.33,1.51c-2,1.14-4.1,2.26-6.23,3.26A109.16,109.16,0,0,0,66,178.9a7.9,7.9,0,0,1-.88.53C64.31,179.82,63.87,179.52,63.92,178.89Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M580.06,93.58c-.66,0-.84-.39-.74-.87a3.31,3.31,0,0,1,1.59-2.48c2-1.13,4.13-2,6.2-3,4.19-2,8.59-3.42,12.82-5.28a7.54,7.54,0,0,1,1.53-.48c.49-.1.76.2.64.69a2.86,2.86,0,0,1-1.63,2.09c-2.83,1.32-5.69,2.56-8.59,3.69a78.2,78.2,0,0,0-11.22,5.3C580.45,93.41,580.23,93.5,580.06,93.58Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M441.34,170.76a3.13,3.13,0,0,1-1.8,2.28c-1.83.81-3.65,1.65-5.48,2.44-4.71,2-9.56,3.69-14.09,6.11-.45.24-1,.71-1.47.25s-.14-1.17.12-1.74a3.08,3.08,0,0,1,1.64-1.57c5.92-2.65,11.95-5,18-7.41.77-.3,1.52-.67,2.3-.92C441.09,170,441.36,170.26,441.34,170.76Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M255.87,118a31.53,31.53,0,0,1,2.15-4.94.71.71,0,0,1,1.11-.28,43.55,43.55,0,0,1,5,3.23,1.35,1.35,0,0,1,.53,1.66,35.36,35.36,0,0,1-2.42,4.65c-.27.53-.8.8-1.33.3a28.84,28.84,0,0,0-4.36-2.92A1.37,1.37,0,0,1,255.87,118Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M487.36,173.5a21.8,21.8,0,0,1-.78,2,27.17,27.17,0,0,0-1.33,2.9c-.38,1.05-.76,1.14-1.77.6a38.4,38.4,0,0,0-3.6-1.57,8.73,8.73,0,0,1-1.41-.76.91.91,0,0,1-.39-1.14,31.73,31.73,0,0,1,2.22-4.9,1,1,0,0,1,1.38-.4c1.52.64,3.06,1.23,4.59,1.85A1.42,1.42,0,0,1,487.36,173.5Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M593.67,99.49a5.22,5.22,0,0,0,2.3-.6,18.31,18.31,0,0,1,1.89-.78c.91-.27,1.44.26,1.19,1.19a2.72,2.72,0,0,1-1.81,1.94c-1.28.47-2.54,1-3.79,1.54A9.54,9.54,0,0,0,591,104c-.37.3-.84.65-1.31.24s-.11-.8.05-1.2c0-.14.12-.27.18-.4.28-.53.09-.87-.34-1.25-1.6-1.38-1.74-2.24-.69-4a9.5,9.5,0,0,1,3.39-3.56c.66-.39,1.4-1,2.16-.43a2.87,2.87,0,0,1,1,2.61,2.1,2.1,0,0,1-.44,1.07c-.6.84-1.09.86-1.59-.06-.31-.58-.67-.79-1.28-.6s-1.46,1.14-1.37,1.56a1,1,0,0,0,.29.48A3.69,3.69,0,0,0,593.67,99.49Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M142.45,113.84l-.26.84c-.47,1.43-1.35,2.68-1.83,4.12-.28.84-.73.93-1.47.53-1.29-.69-2.57-1.38-3.83-2.11s-1.37-1.11-.95-2.51a36.17,36.17,0,0,1,1.77-4.15c.44-1,.76-1.06,1.7-.55,1.37.75,2.71,1.53,4.06,2.3A1.34,1.34,0,0,1,142.45,113.84Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M443.81,126.27a5.19,5.19,0,0,1-.52,1.84c-.49,1.16-1.17,2.22-1.64,3.41-.38.95-.8,1-1.69.54-1.29-.69-2.58-1.37-3.84-2.1-1.08-.63-1.19-1-.76-2.15a23,23,0,0,1,2.15-4.3c.55-.89.71-.9,1.65-.41,1.21.62,2.42,1.24,3.63,1.88C443.37,125.29,443.84,125.69,443.81,126.27Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M575.84,120.08a2.44,2.44,0,0,1-.18.58c-.7,1.34-1.41,2.67-2.15,4a.8.8,0,0,1-1.24.3c-1.54-.94-3.07-1.88-4.6-2.84a1,1,0,0,1-.51-1.37,24.75,24.75,0,0,1,2-4.4c.55-.86.88-1,1.82-.47a21.46,21.46,0,0,1,4.13,2.74A1.74,1.74,0,0,1,575.84,120.08Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M476.2,120.11a19.85,19.85,0,0,1-1,2.13,22.39,22.39,0,0,0-1.38,2.55c-.53,1.21-1.05,1.21-1.89.61-1.19-.84-2.55-1.42-3.69-2.34-.93-.75-1-1.06-.51-2.12a31.71,31.71,0,0,1,2.15-4.13c.58-.86.76-.89,1.65-.34q1.93,1.17,3.85,2.37A1.42,1.42,0,0,1,476.2,120.11Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M651.38,173.34c.55-.32.46-.74.53-1.11a16,16,0,0,1,2-5.76,1.85,1.85,0,0,1,1.94-1,2,2,0,0,1,1.53,1.59,3.26,3.26,0,0,1-.5,1.95c-.22.41-.54.24-.88.08-1.43-.66-1.8-.48-2.34,1a42.77,42.77,0,0,0-1.07,5,13,13,0,0,1-.67,2.39c-.14.31-.31.66-.7.66a.79.79,0,0,1-.75-.61,25,25,0,0,0-1.77-3.36,5.72,5.72,0,0,0-2.39-2.48,2.33,2.33,0,0,1-.06-4,1.49,1.49,0,0,1,1.87.26,6,6,0,0,1,1.26,2c.5,1,1,2,1.53,3A2.53,2.53,0,0,0,651.38,173.34Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M788,126.65a4.52,4.52,0,0,0,1.43-.39l2.63-.88a.76.76,0,0,1,.93.18.88.88,0,0,1,0,1,2.89,2.89,0,0,1-1.56,1.66c-1.28.45-2.45,1.17-3.79,1.5a10.47,10.47,0,0,0-2.44,1.31c-.25.14-.52.33-.81.14a.54.54,0,0,1-.06-.79c.67-1,.33-1.62-.46-2.35a2.08,2.08,0,0,1-.39-2.68,8.81,8.81,0,0,1,3.92-4.19c1.42-.66,1.82-.51,2.53.88s.56,1.92-.48,2.82c-.57.5-.82.46-1.29-.18-.15-.19-.23-.44-.38-.62a1,1,0,0,0-1.65,0,1.07,1.07,0,0,0-.17,1.65A3.37,3.37,0,0,0,788,126.65Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M137,102.05a11.25,11.25,0,0,1,.65-3c.58-1.5,1.2-3,1.83-4.45a7.51,7.51,0,0,1,.68-1.11c.11-.15.3-.3.51-.17s.24.24.21.34c-.27,1.19.5,1.67,1.34,2.28a4.58,4.58,0,0,1,1.94,4.59,5,5,0,0,1-3.33,4.41A2.74,2.74,0,0,1,137,102.05Zm3.24,0c.86,0,2.14-.61,2.2-1.16.09-.82-.46-1.32-1-1.77-1.8-1.37-2.37-1.13-2.69,1.14A1.45,1.45,0,0,0,140.19,102.09Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M559.64,109.35a8.82,8.82,0,0,1,.38-2.45,23.55,23.55,0,0,1,2.15-4.94c.14-.29.31-.65.73-.6s.44.35.48.65a1.55,1.55,0,0,0,.85,1.11c.35.25.67.56,1,.85a4.24,4.24,0,0,1,1.27,4.76,5.11,5.11,0,0,1-3.89,3.59,2.29,2.29,0,0,1-2.89-1.95A8.76,8.76,0,0,1,559.64,109.35Zm2.92-.18c1,0,2.25-.67,2.26-1.24s-1.5-2-2.24-2c-.45,0-1.25,1.41-1.27,2.25S561.69,109.18,562.56,109.17Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M385.9,171.11a3.48,3.48,0,0,1-1.61,2.4c-2.88,1.62-5.85,3.08-8.81,4.56-1.56.78-3.08,1.65-4.58,2.56a6.41,6.41,0,0,1-.62.38c-.31.16-.64.3-1,.06s-.24-.61-.14-.94a3.69,3.69,0,0,1,1.79-2.37c3.59-1.84,7.11-3.82,10.81-5.45,1.11-.49,2.15-1.13,3.24-1.66C385.4,170.46,385.8,170.46,385.9,171.11Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M536.84,172.06a3.26,3.26,0,0,1-1.45,2.34c-2.28,1.3-4.62,2.51-7,3.6s-4.89,2.4-7.36,3.57c-.33.16-.67.55-1,.14s-.1-.74,0-1.1a4,4,0,0,1,2.12-2.29c3.75-1.74,7.48-3.53,11.2-5.32.88-.43,1.68-1,2.55-1.44C536.47,171.27,536.82,171.47,536.84,172.06Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M561.48,93.71a22.48,22.48,0,0,1-.79,4.55,3.83,3.83,0,0,1-.38.79c-.16.24-.37.52-.7.35s-.2-.42-.16-.67.09-.47.15-.71a10.93,10.93,0,0,0-3-10.86c-.51-.52-1.05-1-1.56-1.54a2.39,2.39,0,0,1,0-3.06.63.63,0,0,1,.92,0,14.72,14.72,0,0,1,4.42,5.36A19.85,19.85,0,0,1,561.48,93.71Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M404.74,94.19a6.18,6.18,0,0,1,.49-2.28,20.27,20.27,0,0,1,4.35-6.51A5.22,5.22,0,0,1,410,85a.38.38,0,0,1,.52-.06c.18.14.12.35.08.54a3.59,3.59,0,0,1-.7,1.27,27.61,27.61,0,0,0-2.43,3.81,6.91,6.91,0,0,0-.74,2.05,1.55,1.55,0,0,0,.69,1.65c.61.41,1.11.12,1.54-.35.2-.21.4-.49.73-.31s.35.56.25.9c-.35,1.18-.72,2.35-2,2.9a1.82,1.82,0,0,1-2.45-.62A4.2,4.2,0,0,1,404.74,94.19Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M458,123.39a6.22,6.22,0,0,1-1.05,3.78,1.52,1.52,0,0,1-2.42.15,4.53,4.53,0,0,1-1.6-3.78,18.8,18.8,0,0,1,2.61-7.54,2.13,2.13,0,0,1,.16-.25c.21-.26.4-.67.79-.45s.22.62.11.94a16.05,16.05,0,0,1-.62,1.63,12.82,12.82,0,0,0-1,3.35,3.85,3.85,0,0,0,.19,2.3c.51,1.08,1.12,1.18,2,.33A1.15,1.15,0,0,1,458,123.39Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M316.28,179.84a2.22,2.22,0,0,1,1-1.58l3.57-3.22a7.83,7.83,0,0,0,2.12-4.39c.12-.53.12-1.13-.46-1.42s-1,.12-1.43.46-.5.85-1,1c-.43-.14-.34-.46-.24-.72a8.5,8.5,0,0,1,2.08-3.31,1.62,1.62,0,0,1,2.88.85,3.55,3.55,0,0,1,0,1.45,12.94,12.94,0,0,1-3.66,7.32,41,41,0,0,1-3.92,3.28A1,1,0,0,1,316.28,179.84Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M616.79,165.76a6.1,6.1,0,0,1-1,2.49,38.76,38.76,0,0,0-2.24,4.91,2.86,2.86,0,0,0-.24,2,1.13,1.13,0,0,0,2,.56c.18-.16.3-.39.49-.54.4-.32.67-.11.72.3a3.44,3.44,0,0,1-.87,2.84c-.59.62-1.29,1.31-2.29,1a2.6,2.6,0,0,1-1.82-2.27,8,8,0,0,1,.73-4.27,48,48,0,0,1,3.5-6.41A1,1,0,0,1,616.79,165.76Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M124.82,114.61a2.81,2.81,0,0,1-.44,2.11c-.63,1.37-1.32,2.71-2,4.06a3.56,3.56,0,0,0-.47,1.82c0,.45.08.9.57,1.09a1.07,1.07,0,0,0,1.08-.28c.31-.24.51-.91,1-.52s.18.92,0,1.36a11.23,11.23,0,0,1-.77,1.74,2.06,2.06,0,0,1-2.13,1,1.82,1.82,0,0,1-1.53-1.39,4.09,4.09,0,0,1-.11-2.86,17.31,17.31,0,0,1,1.37-3.23c.72-1.21,1.41-2.45,2.12-3.67C123.84,115.34,124.09,114.79,124.82,114.61Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M423.1,125a6.31,6.31,0,0,1-1.12,3,7.35,7.35,0,0,0-1.34,4.1,5,5,0,0,0,.07.87,1.25,1.25,0,0,0,2.13.72,3.65,3.65,0,0,0,.45-.57c.13-.15.28-.28.5-.2a.4.4,0,0,1,.27.46,5.54,5.54,0,0,1-1.29,3.34,2.12,2.12,0,0,1-2.91-.08,3.55,3.55,0,0,1-1-2.36,10.7,10.7,0,0,1,1.41-5.59,35,35,0,0,1,2.07-3.34A.69.69,0,0,1,423.1,125Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M692,134.76a4.9,4.9,0,0,1,.37-2,37.4,37.4,0,0,1,3.88-7.18,4,4,0,0,1,.37-.45c.14-.15.34-.24.5-.07a.42.42,0,0,1,.07.39q-.29.75-.63,1.47c-.76,1.58-1.7,3.07-2.33,4.72a3.54,3.54,0,0,0-.21,2.42c.39,1.19,1.11,1.36,2,.48a2.67,2.67,0,0,1,.4-.42c.34-.22.57,0,.63.3.2,1.19-1.55,3.57-2.76,3.76a1.47,1.47,0,0,1-1.5-.68A3.94,3.94,0,0,1,692,134.76Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M88.2,126.75a7.89,7.89,0,0,1,.72-2.79,48,48,0,0,1,2.71-5.17,5.85,5.85,0,0,1,.53-.7c.19-.21.41-.47.72-.23s.17.46.07.68c-.67,1.4-1.34,2.81-2,4.2a7.84,7.84,0,0,0-.74,1.58,2.4,2.4,0,0,0,.1,1.71c.34.67.87.77,1.39.24.27-.27.45-.64.73-.9s.64-.26.78.19c.29,1-1,3.6-2,4a1.86,1.86,0,0,1-2.64-1.05A4.15,4.15,0,0,1,88.2,126.75Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M773.2,119.35a4.7,4.7,0,0,1,.54-2.12c.88-1.8,1.8-3.57,2.7-5.35a2.8,2.8,0,0,1,.31-.5c.2-.25.37-.68.79-.45s.18.53.08.8c-.47,1.18-1,2.35-1.43,3.53-.24.58-.49,1.16-.72,1.76a1.67,1.67,0,0,0,0,1.28c.41.92,1,1.06,1.78.37.27-.24.46-.78.91-.48s.15.72,0,1.08a6.24,6.24,0,0,1-1.29,2.44,1.58,1.58,0,0,1-2.45.17A3.46,3.46,0,0,1,773.2,119.35Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M260.44,95c.34.51.06,1-.11,1.38-.36.85-.8,1.67-1.19,2.51s-.72,1.6-1.07,2.4a2.39,2.39,0,0,0-.13,1.58c.22,1,.73,1.12,1.52.45.21-.17.35-.54.7-.36s.25.51.2.79a5.25,5.25,0,0,1-1.18,2.64,1.53,1.53,0,0,1-2.65-.34,4.94,4.94,0,0,1-.44-3.42,10.2,10.2,0,0,1,1-2.72q1.11-2,2.29-3.92C259.65,95.64,259.82,95.13,260.44,95Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M595.44,114a7.18,7.18,0,0,1,.73-2.66c.74-1.59,1.54-3.15,2.32-4.71a3.55,3.55,0,0,1,.38-.62c.2-.26.4-.65.8-.39s.2.53.09.8c-.55,1.3-1.12,2.59-1.67,3.89-.24.59-.48,1.18-.67,1.78a1.63,1.63,0,0,0,.32,1.51c.42.57.8.59,1.3.07.13-.13.22-.32.35-.46s.32-.26.5-.12a.58.58,0,0,1,.21.36,4.78,4.78,0,0,1-1.64,3.43,1.43,1.43,0,0,1-2-.25A3.29,3.29,0,0,1,595.44,114Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M618,122.88a5.46,5.46,0,0,1,.31-2c.83-2,1.64-4.07,2.49-6.09.18-.42.38-1.15.9-1s.11.85,0,1.27c-.51,1.62-1.06,3.24-1.62,4.85a4.26,4.26,0,0,0-.24,1.87c.13,1.06.76,1.33,1.58.7.25-.2.4-.66.81-.35a.84.84,0,0,1,.18,1,14.19,14.19,0,0,1-.67,1.93,1.77,1.77,0,0,1-1.66,1,1.69,1.69,0,0,1-1.61-1.06A4.22,4.22,0,0,1,618,122.88Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M226.71,146.56a6.92,6.92,0,0,1,.49-2.42,27.39,27.39,0,0,1,2.3-5,7.93,7.93,0,0,1,.78-1.05.38.38,0,0,1,.52-.12.41.41,0,0,1,.15.52,13.14,13.14,0,0,1-.57,1.34,27,27,0,0,0-1.65,4.06,4.13,4.13,0,0,0-.16,1.88c.15.9.75,1.12,1.45.57.15-.12.25-.31.39-.43.38-.33.7-.19.7.25a4,4,0,0,1-1.35,3.26,1.69,1.69,0,0,1-2.68-.67A4.26,4.26,0,0,1,226.71,146.56Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M512.26,136.06a5.68,5.68,0,0,1,.38-2,26.72,26.72,0,0,1,3.05-5.48c.15-.23.36-.54.69-.35s.14.46,0,.67c-.36.8-.73,1.6-1.12,2.38a15.43,15.43,0,0,0-1,2.27,3.15,3.15,0,0,0-.11,1.58,1,1,0,0,0,.71.84c.4.09.63-.15.86-.43s.34-.85.84-.59.19.7.15,1.07a4.46,4.46,0,0,1-.92,2.28,1.79,1.79,0,0,1-3.19-.38A4.71,4.71,0,0,1,512.26,136.06Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M650.24,111.09a5.29,5.29,0,0,1,.55-2.19,23.76,23.76,0,0,1,3.11-5.1c.19-.25.39-.7.78-.44s.07.64-.08.92c-.53,1-1.1,2.06-1.67,3.08a4.35,4.35,0,0,0-.65,2.22,5.63,5.63,0,0,0,0,.58c.16,1.16.68,1.4,1.62.72.23-.17.43-.49.73-.27s.13.53.06.81a4.91,4.91,0,0,1-1.19,2.15,1.66,1.66,0,0,1-2.81-.3A4.19,4.19,0,0,1,650.24,111.09Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M254.62,182.25a6.68,6.68,0,0,1,1.69-2.61,6.72,6.72,0,0,0,1.66-4.12c.1-1.18-.29-1.44-1.35-1-.3.12-.54.44-.93.31s-.16-.55,0-.8a8.26,8.26,0,0,1,1.89-2.39c.93-.78,1.71-.54,2.12.6a2.63,2.63,0,0,1,.16,1.3,13,13,0,0,1-4.59,8.53C255.15,182.16,255,182.15,254.62,182.25Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M800.39,102.5a9,9,0,0,1-1.17,2.34,4.94,4.94,0,0,0-.78,3.19c.11,1,.34,1.1,1.28.67.17-.08.34-.22.53-.11a.55.55,0,0,1,.19.65,4.75,4.75,0,0,1-1.7,2.64,1.25,1.25,0,0,1-2-.52,3.45,3.45,0,0,1-.42-2.26,12.13,12.13,0,0,1,3.43-6.62C799.89,102.38,800.05,102.34,800.39,102.5Z" transform="translate(-52.77 -16.11)"/><path class="cls-1" d="M303.31,181.88c-.51,0-1.34-.93-1.28-1.38a1.21,1.21,0,0,1,1.19-1c.62.07,1.26.72,1.2,1.23S303.7,181.91,303.31,181.88Z" transform="translate(-52.77 -16.11)"/><g id="_Group_" data-name="&lt;Group&gt;"><path id="_Compound_Path_" data-name="&lt;Compound Path&gt;" class="cls-2" d="M1029.81,187.16H978.14c-6.18,0-12.36-.08-18.54.05-2.61.06-3.74-.86-3.42-3.48a12.42,12.42,0,0,0,.06-2.28c-.06-.88.27-2.11-1.24-2.07a1.91,1.91,0,0,0-2,2,13.78,13.78,0,0,0,0,2.57c.33,2.59-.88,3.36-3.31,3.21-2.21-.13-4.08,0-3.92-3.28.18-3.76.79-7,3.74-9.76,3.81-3.52,8.27-1.86,12.5-2,.95,0,.94,1,.95,1.8,0,1.9,0,3.81,0,5.71,0,1.51.81,1.93,2.16,2,1.54.08,2-.64,1.95-2.06-.06-1.23,0-2.47,0-3.71,0-3.63,2.42-5.14,5.88-3.79,1.1.42,1,1.28,1,2.1.09,1.9.18,3.8.23,5.7,0,1.36.76,1.79,2,1.8a1.91,1.91,0,0,0,2.24-1.94c1-7.75,1.05-7.75,8.89-7.77,2.19,0,4.38.06,6.57,0,1.46,0,2.12.56,2,2,0,.76,0,1.52,0,2.28-.07,5.53-.06,5.52,5.34,5.46,4.76-.06,9.52-.06,14.28-.11.88,0,2.17.42,2.13-1.08,0-1.2-1.19-1-2-1-4.85,0-9.71,0-14.56-.05-1.16,0-2.95,1.28-3.15-1.38-.28-3.7.65-5.76,3.13-6.06a28,28,0,0,1,3.43-.05c5.62,0,11.23,0,16.85,0,3.81,0,3.8,0,3.82,3.94,0,1.33.06,2.66.06,4,0,1.17.52,1.77,1.74,1.69s1.61-.72,1.54-1.9c-.1-1.71,0-3.42-.14-5.13-.11-1.88.5-2.94,2.6-2.66a10.85,10.85,0,0,0,2.28,0c1.58-.12,2.26.56,2.2,2.16-.06,1.9,0,3.81,0,5.71,0,1.43.48,2.08,2,2.05s2-.68,2-2.09c0-3.53.09-7.06-.08-10.57-.11-2.19.67-2.78,2.77-2.74,4.25.08,4.25,0,4.26,4.11,0,4.57-.09,9.14.08,13.71.08,2.16-.7,2.88-2.76,2.86C1039.14,187.11,1034.47,187.15,1029.81,187.16Zm-41.22-6.6c.06-.85-.4-1.21-1.18-1.27s-1.48.24-1.48,1.24c0,.77.27,1.3,1.13,1.3S988.54,181.52,988.59,180.56Z" transform="translate(-52.77 -16.11)"/><path id="_Path_" data-name="&lt;Path&gt;" class="cls-2" d="M1073.65,118.68c6.93.59,13.74-1,20.62,2.06,11.93,5.23,24.42,9.19,35.92,15.38,12.65,6.8,24.46,14.76,33,26.66,6,8.28,8.66,17.26,5.41,27.42-.86,2.71-2.15,4.15-5.3,3.8a81.55,81.55,0,0,0-8.85-.07c-1.52,0-2.11-.55-1.37-2.12,5.55-11.72,1.88-21.61-6.22-30.54-9.55-10.52-21.48-17.77-33.83-24.41s-25.14-11.77-38.14-16.7A1.42,1.42,0,0,1,1073.65,118.68Z" transform="translate(-52.77 -16.11)"/><path id="_Path_2" data-name="&lt;Path&gt;" class="cls-2" d="M1015.91,119c-7.2,2.9-13.72,5.45-20.19,8.15-16.73,7-32.78,15.24-46.88,26.84-6.36,5.23-11.93,11.19-15,19.11-2.39,6.26-1.56,12.35,1.13,18.27.85,1.88.68,2.6-1.51,2.55-3.33-.09-6.67-.11-10,0a3,3,0,0,1-3.23-2.18,26.41,26.41,0,0,1-.42-19.24c3-8.49,8.73-15.12,15.4-20.94,12.19-10.64,26.27-18.07,41.29-23.83,5.06-2,10.09-4,15.14-5.94C1000,118.59,1005.59,117.92,1015.91,119Z" transform="translate(-52.77 -16.11)"/><path id="_Path_3" data-name="&lt;Path&gt;" class="cls-2" d="M1027.51,111.24a18.06,18.06,0,1,1,17.56,18.32C1035.31,129.49,1027.47,121.31,1027.51,111.24Z" transform="translate(-52.77 -16.11)"/><path id="_Path_4" data-name="&lt;Path&gt;" class="cls-2" d="M1053.39,26.11c-1,7.86-2,15.6-3,23.34q-2.48,18.94-5,37.89c-.13,1,.2,2.45-1.32,2.39-1.23-.06-1-1.42-1.11-2.31-2.46-18.77-4.65-37.57-7.54-56.27-.83-5.37.6-8.7,4.44-12,4.58-4,4.4-4.17,8.61.16,1.26,1.29,2.48,2.63,3.8,3.87A3.16,3.16,0,0,1,1053.39,26.11Z" transform="translate(-52.77 -16.11)"/><path id="_Path_5" data-name="&lt;Path&gt;" class="cls-2" d="M1032.79,159.79c-8.09,0-16.18,0-24.27,0-2.12,0-3.23-.5-3.07-2.86.07-1.05.86-2.93-1-2.93-1.48,0-1.07,1.78-1,2.83.09,2.14-.64,3-3,3-2.58.06-3.24-.83-3.16-3.29.18-6,3-8.87,9-8.86h.86c4,0,4,0,4,4,0,.47,0,.95,0,1.42,0,1,0,2.09,1.37,2,1.17,0,1.13-1.09,1.16-1.94s0-1.52,0-2.28c0-3.06,2.21-4.39,5.06-3.16,1,.4.9,1.12.91,1.86,0,1.43,0,2.86,0,4.29,0,.58.15,1.2.87,1.25a1.17,1.17,0,0,0,1.37-1.14,31.24,31.24,0,0,0,0-4c-.15-2.18,1-2.45,2.85-2.4,1.65.05,3.11-.05,2.9,2.3a35.35,35.35,0,0,0,0,3.71c0,.78.13,1.59,1.21,1.55s1.16-.83,1.19-1.62a16,16,0,0,0,0-2.85c-.34-2.35.58-3.09,3-3.14,2.63-.06,2.73,1.35,2.66,3.22,0,1,0,1.91,0,2.86,0,.79,0,1.57,1.15,1.58a1.42,1.42,0,0,0,1.6-1.58c0-.85,0-1.71-.07-2.56,0-1.1-.61-2.5.61-3.13s3-.41,4.48-.14c1,.17.78,1.17.8,1.9,0,1.43,0,2.86.07,4.28a1.18,1.18,0,0,0,1.39,1.12c.72-.07.85-.69.87-1.27,0-.86,0-1.71,0-2.57-.06-3.5,1-4.35,4.37-3.79,1.18.19,1.26,1,1.28,1.86,0,1.52,0,3,0,4.56a1.15,1.15,0,0,0,1.21,1.29c.87,0,1.17-.51,1.19-1.25,0-1.05,0-2.1,0-3.14,0-3.15,1.93-4.35,4.75-3,.92.42.81,1.18.81,1.93,0,2.48-.09,5,.06,7.42.12,2-.6,2.65-2.6,2.63-8.28-.09-16.56,0-24.84,0Z" transform="translate(-52.77 -16.11)"/><path id="_Path_6" data-name="&lt;Path&gt;" class="cls-2" d="M1029.08,94.37c-.15,1-.67,1.37-1.41,1a8.79,8.79,0,0,1-2-1.54q-23-22.23-45.92-44.44c-1.82-1.75-1.67-2.75.2-4.19a54.39,54.39,0,0,0,4.8-4.45c1-1,1.77-1.09,2.75.17q18.54,23.87,37.16,47.67c1.17,1.5,2.39,3,3.56,4.45C1028.55,93.47,1028.82,94,1029.08,94.37Z" transform="translate(-52.77 -16.11)"/><path id="_Path_7" data-name="&lt;Path&gt;" class="cls-2" d="M1060.06,95.49c-.17-.13-.57-.29-.73-.57-.47-.88.28-1.39.73-2q4.64-6,9.29-11.9Q1085.1,61,1100.84,40.88c.86-1.1,1.54-1.23,2.53-.28,1.71,1.66,3.38,3.35,5.19,4.9s1.46,2.5,0,3.93c-6.88,6.57-13.68,13.24-20.52,19.85Q1075.17,81.67,1062.31,94A3.73,3.73,0,0,1,1060.06,95.49Z" transform="translate(-52.77 -16.11)"/><path id="_Compound_Path_2" data-name="&lt;Compound Path&gt;" class="cls-2" d="M1083.58,160c-1.14,0-2.28,0-3.42,0-2.43-.14-4.52.07-6.1,2.47-1.2,1.8-3.39,2.34-5.62,2.13-.57-.05-1.23-.12-1.48-.67s.38-1,.81-1.31c.63-.51,1.78-.8,1.45-1.84-.39-1.22-1.61-.67-2.49-.75a10.86,10.86,0,0,0-2.28,0c-2,.19-2.68-.77-2.6-2.7.09-2.08-.06-4.18-.11-6.27-.06-1.92,1-3.28,2.74-3.37a2.75,2.75,0,0,0,2.84-2.14,6.33,6.33,0,0,1,1.41-1.77c.38-.44.85-.85,1.47-.64s.76.78.7,1.4c-.24,2.35.77,3.37,3.15,3.07,1.44-.19,1.81.75,1.79,1.94s-.09,2.47-.13,3.7c0,.71.08,1.45.88,1.57,1,.14,1.24-.65,1.34-1.46,0-.38,0-.76.06-1.14.19-4.64.19-4.64,5-4.65,1.81,0,3.62-.06,5.42,0,2.29,0,3.45,1.33,3.68,3.54,0,.1,0,.19,0,.29C1092.76,160,1092.76,160,1083.58,160Zm-14.48-6.37c-.69,0-1.36.07-1.33,1,0,.75.55.9,1.16.9s1.36-.1,1.34-1C1070.26,153.78,1069.7,153.65,1069.1,153.62Z" transform="translate(-52.77 -16.11)"/><path id="_Compound_Path_3" data-name="&lt;Compound Path&gt;" class="cls-2" d="M1089.41,192.06c1.39-1.59,4.29-2.37,3.6-4.25s-3.37-.56-5.16-.8a9.68,9.68,0,0,0-2.27.13c-1.44.15-2.13-.44-2.13-1.92,0-3.24,0-6.47,0-9.71a3.09,3.09,0,0,1,3.27-3.25c4-.13,8,0,12-.07,1.22,0,1.7.55,1.69,1.72,0,2,0,4,0,6,0,.89,0,1.82,1.22,1.89,1.49.09,1.3-1.08,1.32-2,0-1.14,0-2.29,0-3.43,0-4.13,1.43-5.21,5.51-4.22a1.66,1.66,0,0,1,1.4,1.84c0,3.71,0,7.42,0,11.14,0,1.31-.51,1.89-1.88,1.83-1.13-.05-2.29.29-3.41.17-2.32-.25-4-.06-5.38,2.42C1097.52,192.65,1093,193.55,1089.41,192.06Zm2.69-10.2c.81,0,1.55-.06,1.64-1.11.11-1.21-.63-1.42-1.61-1.41s-1.49.28-1.51,1.28S1091.21,181.91,1092.1,181.86Z" transform="translate(-52.77 -16.11)"/><path id="_Path_8" data-name="&lt;Path&gt;" class="cls-2" d="M1017.83,42.68c1.78-.27,2,.69,2.39,1.6q6.36,16.65,12.75,33.29c.85,2.22,1.8,4.4,2.59,6.64.35,1,1.27,2.29-.28,3-1.28.55-1.81-.74-2.33-1.59q-5.15-8.24-10.2-16.5c-4-6.57-8-13.19-12.06-19.7-1.34-2.13-1.75-3.45,1.29-4.26A43,43,0,0,0,1017.83,42.68Z" transform="translate(-52.77 -16.11)"/><path id="_Path_9" data-name="&lt;Path&gt;" class="cls-2" d="M1053.41,87.5a1.36,1.36,0,0,1-1.13-1.89c.33-1.09.74-2.16,1.14-3.22q7.17-18.91,14.34-37.83c.66-1.73,1.62-2.46,3.48-1.5,1.43.74,3,1.28,4.46,1.9,3.6,1.47,3.65,1.5,1.59,4.88-6,9.73-12,19.42-17.94,29.13l-4.46,7.29C1054.54,86.82,1054.23,87.43,1053.41,87.5Z" transform="translate(-52.77 -16.11)"/><path id="_Path_10" data-name="&lt;Path&gt;" class="cls-2" d="M1020,100.84c-.15.26-.25.66-.52.85a1.88,1.88,0,0,1-2.13-.19c-3.16-1.74-6.34-3.45-9.48-5.22-9.59-5.42-19.14-10.92-28.79-16.24-2.13-1.17-2.93-2-1.64-4.53,2.64-5.2,2.45-5.3,7.24-1.72Q1001,86,1017.32,98.17C1018.27,98.89,1019.43,99.49,1020,100.84Z" transform="translate(-52.77 -16.11)"/><path id="_Compound_Path_4" data-name="&lt;Compound Path&gt;" class="cls-2" d="M1120.14,187.14c-.38,0-.76,0-1.14,0-8.24-.23-7.23,1.64-6.81-7.33.16-3.5-1.12-6.76-.64-10.23.24-1.75.13-3.44,2.49-3,1.78.32,4.94-1.58,4.66,2.74-.06,1-1.25,3.32,1.11,3.36s1.76-2.27,1.75-3.56c0-4.27,3.13-2.18,4.92-2.52,2.37-.45,2.19,1.25,2,2.9-.21,2.13.38,4.39-1.22,6.27-.45.53.07,1.05.32,1.55,1.37,2.69.81,5.58.79,8.4,0,1.25-1,1.46-2,1.46h-6.27Zm-4-17.79c.14-.8.5-1.91-.71-1.68s-1.62,1.57-1.94,2.63c-.26.82.52,1.75,1.17,1.58A1.88,1.88,0,0,0,1116.18,169.35Zm6.18,9.54c-1.6-.3-2.87-.27-3.35,1.44-.2.72-.11,1.35.79,1.5C1122.1,182.21,1121.32,179.87,1122.36,178.89Z" transform="translate(-52.77 -16.11)"/><path id="_Path_11" data-name="&lt;Path&gt;" class="cls-2" d="M1111.41,77.68c0,1.08-.86,1.37-1.6,1.79q-19.38,10.92-38.75,21.87c-.75.42-1.59,1-2.31.14-1-1.21.36-1.71,1-2.2q10.89-8.3,21.84-16.5c4.93-3.71,9.94-7.32,14.79-11.14,1.62-1.27,2.27-.8,2.89.77C1110,74.17,1111.06,75.77,1111.41,77.68Z" transform="translate(-52.77 -16.11)"/><path id="_Path_12" data-name="&lt;Path&gt;" class="cls-2" d="M975.06,113.72c-2.75.47-3.54-.53-3.81-2.52-.82-6-.87-6.09,5.25-5.54,13.91,1.25,27.81,2.59,41.72,3.91,1,.09,2.37,0,2.31,1.44-.06,1.31-1.33,1.12-2.25,1.15Z" transform="translate(-52.77 -16.11)"/><path id="_Path_13" data-name="&lt;Path&gt;" class="cls-2" d="M1105.85,113.46c-11.89-.44-23.77-.86-35.65-1.33-1,0-2.38.32-2.46-1.23s1.36-1.25,2.3-1.34c14.87-1.37,29.75-2.66,44.61-4.11,2.37-.23,3.26,0,2.79,2.73-1,5.74-.8,5.77-6.46,5.52-1.71-.07-3.42-.2-5.13-.3Z" transform="translate(-52.77 -16.11)"/><path id="_Path_14" data-name="&lt;Path&gt;" class="cls-2" d="M1001.22,210.07c0,.86,0,1.72,0,2.57-.16,4.18-3.75,6.85-7.69,5.56a5.21,5.21,0,0,0-3.75-.06c-4.2,1.5-7.64-1-7.81-5.5-.06-1.71,0-3.43-.11-5.14-.05-1.47.4-2.34,2.07-2.35s2.11.86,2.1,2.33.11,2.85.19,4.28c0,1.07.14,2.3,1.52,2.32,1.57,0,1.62-1.33,1.67-2.49.06-1.42.08-2.85.1-4.28,0-1.28.28-2.26,1.91-2.16,1.46.09,2.35.67,2.37,2.23s0,3.05,0,4.57c0,1.12.28,2.18,1.71,2.1,1.27-.07,1.44-1.05,1.44-2.07,0-1.52.07-3,0-4.56-.1-1.75.62-2.31,2.35-2.31s2,1,2,2.39C1001.19,208.36,1001.21,209.22,1001.22,210.07Z" transform="translate(-52.77 -16.11)"/><path id="_Path_15" data-name="&lt;Path&gt;" class="cls-2" d="M1144,212.87c-.2,1.66.31,4.14-.38,6.59s-2.42,3.49-4.81,3.68c-2.58.21-4.7-.53-6-3-.27-.52-.58-1.33,0-1.53,2.91-1,.86-2.24.26-3.44-1.59-3.15-.81-6.52-.74-9.79,0-1.27,1.46-.84,2.36-.85,1.14,0,1.79.5,1.79,1.7,0,1.71,0,3.42.06,5.13,0,1.09.27,2.22,1.71,2.12,1.24-.09,1.39-1.1,1.4-2.11,0-1.52.11-3,0-4.56s.51-2.24,2.1-2.32,2.25.58,2.21,2.15C1144,208.47,1144,210.27,1144,212.87Z" transform="translate(-52.77 -16.11)"/><path id="_Compound_Path_5" data-name="&lt;Compound Path&gt;" class="cls-2" d="M936.16,211.56c0,1.61,0,3.23,0,4.84,0,1.34-.34,2.18-1.91,2.13-1.38,0-2.52-.24-2.39-2s-.6-2.34-2.32-2.35-2.12.87-2,2.3c.15,1.71-.81,2.07-2.28,2s-2-.74-2-2.12c0-3.23-.1-6.46.06-9.67.17-3.47,2.67-5.65,6.22-5.7s6.08,1.86,6.46,5.39a48.55,48.55,0,0,1,0,5.12ZM932,208.29c0-1.83-.56-3.17-2.35-3.19s-2.15,1.27-2.19,2.75.45,2.29,2.15,2.14C930.93,209.87,932.17,209.93,932,208.29Z" transform="translate(-52.77 -16.11)"/><path id="_Compound_Path_6" data-name="&lt;Compound Path&gt;" class="cls-2" d="M953.53,211.38a51.36,51.36,0,0,1,0-5.41c.35-3.22,2.72-5.09,6.14-5.09s5.9,1.89,6.19,5.09c.3,3.4.23,6.84.32,10.26,0,1.35-.52,2.17-2,2.21s-2.42-.53-2.31-2.15-.55-2.41-2.3-2.41-2,1.08-2,2.43c0,1.59-.9,2.18-2.36,2.17-1.74,0-1.94-1.17-1.92-2.53,0-1.52,0-3,0-4.57Zm8.34-3.55c.09-1.67-.43-2.91-2.3-2.8s-2,1.6-2.11,3.08.66,1.86,2,1.83S962.19,209.73,961.87,207.83Z" transform="translate(-52.77 -16.11)"/><path id="_Compound_Path_7" data-name="&lt;Compound Path&gt;" class="cls-2" d="M1051.66,211.4c0,1.42-.05,2.84,0,4.26s-.37,2.32-2,2.37-2.37-.63-2.25-2.16c.16-1.93-.73-2.41-2.52-2.42s-1.89,1.1-1.81,2.39-.29,2.19-1.84,2.21-2.34-.59-2.31-2.15c.07-3.6,0-7.21.27-10.79.24-2.72,3-4.69,5.94-4.69a6.16,6.16,0,0,1,6.41,5.29,48.9,48.9,0,0,1,0,5.68Zm-6.58-1.91c1.46.09,2.51-.18,2.43-1.94-.07-1.58-.5-2.91-2.33-2.89-1.66,0-2.09,1.23-2.15,2.74S1043.54,209.72,1045.08,209.49Z" transform="translate(-52.77 -16.11)"/><path id="_Compound_Path_8" data-name="&lt;Compound Path&gt;" class="cls-2" d="M1119.25,210.59c0-1.61-.07-3.22,0-4.83a5.57,5.57,0,0,1,5.37-5.52,6.12,6.12,0,0,1,5.84,5.4c.07.56.1,1.13.13,1.7.2,5.1.21,5.18-4.75,5.37-1.9.07-2.57.86-2.42,2.6s-.37,2.49-2.19,2.45-2.14-1.11-2.09-2.61,0-3,0-4.56Zm6-2.07c1-.05,1.62-.4,1.38-1.57-.21-1-.24-2.21-1.72-2.08-1.17.11-1.44,1.06-1.46,2.06C1123.41,208.15,1124.11,208.59,1125.24,208.52Z" transform="translate(-52.77 -16.11)"/><path id="_Path_16" data-name="&lt;Path&gt;" class="cls-2" d="M1061.31,191.75c4.1-.59,4.71-2.81,4.6-5.69-.14-3.78,0-7.58-.06-11.37-.06-1.87.45-2.71,2.51-2.73,4.52-.05,4.51-.15,4.5,4.41,0,3.7,0,7.39,0,11.09,0,3.54-1.42,5-4.89,5.32A12.11,12.11,0,0,1,1061.31,191.75Z" transform="translate(-52.77 -16.11)"/><path id="_Path_17" data-name="&lt;Path&gt;" class="cls-2" d="M1074.51,176.86c0-2.76.06-5.52,0-8.27,0-1.64.58-2.25,2.19-2.08a15.08,15.08,0,0,0,2.85,0c1.38-.1,1.89.59,1.89,1.85,0,5.7,0,11.4,0,17.1,0,1.22-.63,1.7-1.78,1.69s-2.09,0-3.14,0c-1.45.06-2-.61-2-2.06C1074.55,182.37,1074.51,179.61,1074.51,176.86Z" transform="translate(-52.77 -16.11)"/><path id="_Path_18" data-name="&lt;Path&gt;" class="cls-2" d="M1055.11,176.64c0,2.75,0,5.51,0,8.26s-2,2.24-3.63,2.22-3.37.44-3.33-2.24c.1-5.41.07-10.82,0-16.23,0-1.67.64-2.07,2.17-2.14,4.8-.2,4.8-.25,4.81,4.43C1055.11,172.84,1055.11,174.74,1055.11,176.64Z" transform="translate(-52.77 -16.11)"/><path id="_Compound_Path_9" data-name="&lt;Compound Path&gt;" class="cls-2" d="M1011.69,217.93c-6.82.38-10.13-3.17-8.69-8.5a6,6,0,0,1,4.74-4.4,6.11,6.11,0,0,1,6.46,1.89c2.53,3,1.9,6.61,1.69,10.1,0,.93-1,1-1.79,1C1013.06,218.05,1012,218,1011.69,217.93Zm0-6.46a2.34,2.34,0,0,0-2.59-2.4,2.18,2.18,0,0,0-2.12,2.5c.09,2,1.42,2.35,3.11,2.41C1011.65,214,1011.84,213.2,1011.73,211.47Z" transform="translate(-52.77 -16.11)"/><path id="_Compound_Path_10" data-name="&lt;Compound Path&gt;" class="cls-2" d="M1117.41,213c0,1,0,1.9,0,2.84a1.6,1.6,0,0,1-1.7,1.84,39.65,39.65,0,0,1-6.17-.11c-3.8-.54-5.71-3.37-5.31-7.41a6.56,6.56,0,0,1,13.07.28c.06.85,0,1.71,0,2.56Zm-4.15-1.24c0-1.56-.46-3.13-2.54-3.26-1.67-.09-2.4,1.14-2.35,2.59.07,2.18,1.78,2.25,3.45,2.52S1113.18,212.89,1113.26,211.8Z" transform="translate(-52.77 -16.11)"/><path id="_Compound_Path_11" data-name="&lt;Compound Path&gt;" class="cls-2" d="M1160.47,217.39c-6,.22-9.15-2.64-8.38-7.6.55-3.48,3-5.55,6.77-5.68a6.34,6.34,0,0,1,6.31,5.5,49.53,49.53,0,0,1,.18,6,1.59,1.59,0,0,1-1.75,1.79C1162.56,217.42,1161.51,217.39,1160.47,217.39Zm-.84-4c1,.4,1.65.13,1.59-1.23-.07-1.74-.17-3.56-2.43-3.75a2.17,2.17,0,0,0-2.51,2.37C1156.28,212.89,1157.65,213.46,1159.63,213.39Z" transform="translate(-52.77 -16.11)"/><path id="_Path_19" data-name="&lt;Path&gt;" class="cls-2" d="M1137.54,176.63c0,2.66-.1,5.32,0,8,.1,2.05-.83,2.83-2.71,2.55-1.62-.24-4.11,1-4.08-2.31,0-5.3.07-10.61,0-15.9,0-1.89.57-2.49,2.43-2.44,5.19.13,4.25-.38,4.35,4.16,0,2,0,4,0,6Z" transform="translate(-52.77 -16.11)"/><path id="_Path_20" data-name="&lt;Path&gt;" class="cls-2" d="M980.1,213.27v3.13c0,1.73-1.2,1.94-2.51,2s-1.76-.82-1.75-2c0-1.52,0-3,0-4.56,0-1.2-.16-2.44-1.74-2.38-1.35.05-1.55,1.18-1.57,2.29,0,1.52,0,3,0,4.56s-.9,2.12-2.36,2.11-1.94-.88-1.92-2.22c0-1.7,0-3.41,0-5.12.12-4,2.19-6,6-6,3.55,0,5.58,2.11,5.73,6C980,211.75,980.06,212.51,980.1,213.27Z" transform="translate(-52.77 -16.11)"/><path id="_Path_21" data-name="&lt;Path&gt;" class="cls-2" d="M1081.52,210.79c0,1.52,0,3,0,4.56s-.31,2.39-2,2.37-2-1.1-1.94-2.48c0-2.66,0-5.32-.11-8,0-1.35-.3-2.77-2.16-2.78s-2.29,1.43-2.31,2.93c0,2.66,0,5.32.11,8,0,1.45-.37,2.36-2,2.39s-2-1.06-1.94-2.43c0-3-.09-6.09,0-9.13.15-3.67,2.58-5.74,6.43-5.68,3.48.06,5.77,2.37,5.88,6,0,1.42,0,2.85,0,4.28Z" transform="translate(-52.77 -16.11)"/><path id="_Compound_Path_12" data-name="&lt;Compound Path&gt;" class="cls-2" d="M1091.93,217.51c-5.86,1.43-9.34-3.38-8.53-7.55a6.27,6.27,0,0,1,6.38-5.33,6.33,6.33,0,0,1,6.49,5.24,18,18,0,0,1,.1,2.85C1096.39,217.27,1096.39,217.27,1091.93,217.51Zm.31-5.27c0-1.88-.24-3.48-2.25-3.63a2.32,2.32,0,0,0-2.51,2.51c-.07,1.95,1.39,2.47,3,2.69S1092.32,213.19,1092.24,212.24Z" transform="translate(-52.77 -16.11)"/><path id="_Path_22" data-name="&lt;Path&gt;" class="cls-2" d="M1102.78,211.16c0,2.56,0,5.12,0,7.68a3.8,3.8,0,0,1-3,4c-1,.27-2.23.68-2.81-.5-.5-1-.67-2.43.33-3.16,1.36-1,1.2-2.24,1.2-3.55q0-6.24,0-12.49c0-1.43.24-2.91,2-2.91s2.35,1.36,2.34,3c0,2.66,0,5.31,0,8Z" transform="translate(-52.77 -16.11)"/><path id="_Path_23" data-name="&lt;Path&gt;" class="cls-2" d="M1018,212.91a27.85,27.85,0,0,1,0-3.42c.38-2.9,2.88-4.79,6.13-4.76a5.32,5.32,0,0,1,5.22,4.36c.17.95.42,2.1-.67,2.49s-2.53.59-3.2-.9c-.45-1-1-1.63-2.17-1.36s-1.12,1.38-1.13,2.32c0,1.23-.05,2.47,0,3.7.11,1.68-.29,2.72-2.28,2.74s-2.09-1.14-2-2.6c0-.86,0-1.71,0-2.57Z" transform="translate(-52.77 -16.11)"/><path id="_Path_24" data-name="&lt;Path&gt;" class="cls-2" d="M942.25,207.53c.38,2.56-1,5.61,2.06,7.66.61.4.5,1.84-.08,2.67a2.1,2.1,0,0,1-2.36.56,4.13,4.13,0,0,1-3.49-3.33c-.9-4.42-.18-8.92-.6-13.37-.12-1.29,1-1.68,2.19-1.66s2.25.49,2.27,2C942.27,203.82,942.25,205.63,942.25,207.53Z" transform="translate(-52.77 -16.11)"/><path id="_Path_25" data-name="&lt;Path&gt;" class="cls-2" d="M1060,231.44v-3.69c0-.74.26-1.31,1.08-1.41.57-.08,1.44-.08,1.5.47.29,2.83,2.4,1.94,4,2.16.9.12,2.38-.59,2.48,1.05.11,1.88-1.48,1.6-2.66,1.66-3.5.18-4.14.79-3.45,3.27.18.67.41,1.29,1.15,1.48a1.5,1.5,0,0,0,1.88-.88c.58-1.26,1.5-2.33,2.75-1.27,1.1.92.33,2.33-.37,3.36a4.37,4.37,0,0,1-4.51,1.75,4,4,0,0,1-3.68-3.43,45.14,45.14,0,0,1-.34-4.52Z" transform="translate(-52.77 -16.11)"/><path id="_Path_26" data-name="&lt;Path&gt;" class="cls-2" d="M1150.41,209c0,2.1-.06,4.19,0,6.28.06,1.59-.56,2.23-2.17,2.21s-2.18-.76-2.16-2.28c0-4.19,0-8.37.05-12.56,0-1.26.31-2.59,2-2.62s2.17,1.24,2.18,2.71c0,2.09,0,4.18,0,6.26Z" transform="translate(-52.77 -16.11)"/><path id="_Path_27" data-name="&lt;Path&gt;" class="cls-2" d="M993,233.73c0-.85,0-1.71,0-2.57,0-4.65,3.16-6.87,7.69-5.52a1.27,1.27,0,0,1,1,1.44c0,.9-.41,1.44-1.35,1.48a24.65,24.65,0,0,0-3.12.2,1.65,1.65,0,0,0-1.24,2c.12,1.39,1,.62,1.66.57.38,0,.76,0,1.14,0,1.06,0,2,.14,1.88,1.49s-1,1.37-1.87,1.19c-2.62-.57-3.08.76-2.91,3,.07,1,.41,2.56-1.32,2.64-1.93.1-1.59-1.48-1.63-2.67,0-1,0-2.09,0-3.14Z" transform="translate(-52.77 -16.11)"/><path id="_Path_28" data-name="&lt;Path&gt;" class="cls-2" d="M1046.51,230.58a24.2,24.2,0,0,1,0,4.26c-.43,2.42-1.79,4.16-4.42,4.51s-4.53-.56-5.55-3a5,5,0,0,1,1.48-6.16,3.66,3.66,0,0,1,2.61-.94c.81,0,1.85-.22,2,1s-.68,1.28-1.57,1.54c-2.26.67-2.93,2.17-1.79,3.74a2.29,2.29,0,0,0,2.65,1.18,2.35,2.35,0,0,0,1.73-2.35c0-2.27,0-4.55.06-6.83,0-1.15-.35-2.8,1.54-2.75,1.74,0,1.19,1.61,1.26,2.65s0,2.08,0,3.13Z" transform="translate(-52.77 -16.11)"/><path id="_Path_29" data-name="&lt;Path&gt;" class="cls-2" d="M1058.45,235.76c0,.74,0,1.31,0,1.88,0,.93-.28,1.75-1.4,1.76s-1.44-.72-1.43-1.71a26.7,26.7,0,0,0,0-3.69,2.3,2.3,0,0,0-2.42-2.3,2.11,2.11,0,0,0-2.32,2,2.26,2.26,0,0,0,1.9,2.72c1.09.27,2.55.28,2,2-.43,1.36-1.77.85-2.72.74-2.79-.33-4.09-2.07-4-5.22a4.78,4.78,0,0,1,4.38-5.05,5.22,5.22,0,0,1,5.69,3.67A21.46,21.46,0,0,1,1058.45,235.76Z" transform="translate(-52.77 -16.11)"/><path id="_Path_30" data-name="&lt;Path&gt;" class="cls-2" d="M1087.21,235.22a18.06,18.06,0,0,1,0-2.85,4.12,4.12,0,0,1,4.26-3.81c2.4-.05,4.36.85,4.73,3.52a48.57,48.57,0,0,1,.25,5.4c0,1-.37,1.64-1.5,1.64s-1.5-.62-1.48-1.63c0-1.34,0-2.67,0-4,0-.84,0-1.83-1.24-1.88a1.93,1.93,0,0,0-2.21,1.76c-.13,1.22,0,2.46-.06,3.7,0,.94.09,2-1.34,2s-1.51-.85-1.48-1.89c0-.66,0-1.33,0-2Z" transform="translate(-52.77 -16.11)"/><path id="_Compound_Path_13" data-name="&lt;Compound Path&gt;" class="cls-2" d="M1085.64,233.84a5.4,5.4,0,0,1-5.32,5.53c-2.69,0-5-2.49-5.09-5.48a5.38,5.38,0,0,1,4.85-5.4A5.58,5.58,0,0,1,1085.64,233.84Zm-5.36-2.61a2.26,2.26,0,0,0-2.25,2.47c0,1.54.59,2.92,2.28,3s2.39-1.36,2.45-2.83A2.33,2.33,0,0,0,1080.28,231.23Z" transform="translate(-52.77 -16.11)"/><path id="_Compound_Path_14" data-name="&lt;Compound Path&gt;" class="cls-2" d="M1007.42,239.7a5.35,5.35,0,1,1,5.09-5.27A5,5,0,0,1,1007.42,239.7Zm-2.48-5.47c.08,1.56.73,2.9,2.4,2.93a2.48,2.48,0,0,0,2.45-2.62,2.57,2.57,0,0,0-2.45-2.92C1005.63,231.46,1005.22,232.83,1004.94,234.23Z" transform="translate(-52.77 -16.11)"/><path id="_Path_31" data-name="&lt;Path&gt;" class="cls-2" d="M1014,232.9c.43-1-1-3.53,1.46-3.53s1,2.38,1.32,3.67a5.17,5.17,0,0,1,0,1.42c0,1.16.31,2.23,1.59,2.3,1.43.09,1.93-1,2-2.27s0-2.67.07-4a1.2,1.2,0,0,1,1.22-1.3c.89-.06,1.48.29,1.55,1.24a15.83,15.83,0,0,1-.22,5.95,4.35,4.35,0,0,1-5,3.27c-2.47-.29-3.64-1.83-4-4.14A22.22,22.22,0,0,1,1014,232.9Z" transform="translate(-52.77 -16.11)"/><path id="_Path_32" data-name="&lt;Path&gt;" class="cls-2" d="M1057.49,206c.09,1.71.12,3.42.29,5.12.11,1.17,0,2.37,1.48,3.09,1,.52.82,1.9.37,2.84s-1.49.8-2.3.6a4.34,4.34,0,0,1-3.53-4.29c-.19-3.79-.16-7.6-.21-11.4a2,2,0,0,1,2.24-2.27c1.68,0,1.76,1.1,1.75,2.32v4Z" transform="translate(-52.77 -16.11)"/><path id="_Path_33" data-name="&lt;Path&gt;" class="cls-2" d="M1025.28,235.28c0-4.07.81-5.52,3.57-6.19a4.27,4.27,0,0,1,5.55,3.78,32,32,0,0,1,0,4.27c0,.92.16,2.09-1.26,2.1s-1.48-1.17-1.51-2.23,0-1.91,0-2.86c0-1.23-.29-2.37-1.83-2.35-1.35,0-1.66,1.06-1.73,2.18s-.14,2.47-.2,3.71c0,.81-.18,1.55-1.22,1.57s-1.41-.73-1.4-1.7Q1025.3,236.42,1025.28,235.28Z" transform="translate(-52.77 -16.11)"/><path id="_Path_34" data-name="&lt;Path&gt;" class="cls-2" d="M1070.68,233.53c-.54-2,.85-4.39.11-6.84-.25-.81.4-1.46,1.28-1.53s1.37.6,1.39,1.42c.09,3.55.11,7.1.2,10.65,0,1.2-.24,2.12-1.63,2.12s-1.32-1.09-1.35-2C1070.65,236.18,1070.68,235.05,1070.68,233.53Z" transform="translate(-52.77 -16.11)"/><path id="_Path_35" data-name="&lt;Path&gt;" class="cls-2" d="M953.77,166.26c1.85.63,3.81,0,5.78.06.92,0,2-.29,2.61.7.39.65,0,1.27-.51,1.78-.79.84-1.95,1.37-2.82.77-1.69-1.17-3-1.63-4.74,0-.81.75-2.2,0-3-.87a1.42,1.42,0,0,1-.33-1.82C951.47,165.85,952.67,166.51,953.77,166.26Z" transform="translate(-52.77 -16.11)"/><path id="_Path_36" data-name="&lt;Path&gt;" class="cls-2" d="M948.17,213.41a16.55,16.55,0,0,1-2.54,0c-1.24-.21-1.21-1.27-1.24-2.22s.36-1.65,1.45-1.67,2.27-.05,3.4,0c1.33,0,2.72-.1,2.7,1.95s-1.18,2.12-2.63,2.08h-1.14Z" transform="translate(-52.77 -16.11)"/><path id="_Path_37" data-name="&lt;Path&gt;" class="cls-2" d="M1010.55,144c-.54,1.67-1.74,2.39-3.26,1.52a2.32,2.32,0,0,0-3,0,2.08,2.08,0,0,1-2.81-.55c-.33-.35-.65-.78-.41-1.27.54-1.1,1.67-1,2.5-.76,1.81.46,3.56-.12,5.33,0C1009.63,143,1010.51,142.83,1010.55,144Z" transform="translate(-52.77 -16.11)"/><path id="_Path_38" data-name="&lt;Path&gt;" class="cls-2" d="M1063.64,212.91h-2c-1.29,0-1.54-.87-1.59-1.9s.17-1.95,1.43-2,2.28,0,3.42-.06c1.39,0,2.4.28,2.36,2s-1.14,2-2.49,1.93h-1.14Z" transform="translate(-52.77 -16.11)"/><path id="_Path_39" data-name="&lt;Path&gt;" class="cls-2" d="M990.14,167.25c-.42,1.47-1.21,2.37-2.57,2.47a2.69,2.69,0,0,1-3-2c-.39-1.5,1-1.32,1.81-1.36C987.72,166.28,989.11,166.16,990.14,167.25Z" transform="translate(-52.77 -16.11)"/><path id="_Path_40" data-name="&lt;Path&gt;" class="cls-2" d="M1031.73,166.22c1,.28,2.61-.39,2.66,1.36a2,2,0,0,1-2.23,2.09c-1.42,0-2.85-.59-2.94-2.14C1029.11,165.65,1030.86,166.63,1031.73,166.22Z" transform="translate(-52.77 -16.11)"/><path id="_Path_41" data-name="&lt;Path&gt;" class="cls-2" d="M1012.86,191.89c-1-.46-2.76.55-2.64-1.31.09-1.33,1.37-1.9,2.73-1.88s2.58.7,2.49,2.08C1015.32,192.58,1013.58,191.24,1012.86,191.89Z" transform="translate(-52.77 -16.11)"/><path id="_Path_42" data-name="&lt;Path&gt;" class="cls-2" d="M974.09,191.84c-1-.29-2.44.38-2.42-1s1.4-2.18,2.75-2.27a2,2,0,0,1,2.32,2C976.68,192.5,974.81,191.24,974.09,191.84Z" transform="translate(-52.77 -16.11)"/><path id="_Path_43" data-name="&lt;Path&gt;" class="cls-2" d="M1106.41,166.36c1,.57,2.84-.57,2.66,1.38-.12,1.41-1.58,1.78-2.83,1.8a2,2,0,0,1-2.33-2C1104,165.71,1105.71,167,1106.41,166.36Z" transform="translate(-52.77 -16.11)"/><path id="_Path_44" data-name="&lt;Path&gt;" class="cls-2" d="M967.63,191.83c-1.13-.27-2.76.42-2.71-1.35,0-1.3,1.3-1.71,2.51-1.75s2.42.33,2.52,1.68C970.09,192.31,968.39,191.44,967.63,191.83Z" transform="translate(-52.77 -16.11)"/></g></svg>
                    </td>
                </tr>
                </thead>
                </table>
                
                <table cellpadding="0" border="0" cellspacing="0" style="width: 105%;
                margin-left: -2%; margin-top:20px; margin-bottom:25px; background:#F0C84C">
                <thead>
                    <tr>
                        <td style="height: 50px">
                <div style="
                    margin: -2px 85px;
                    float: left;
                    height: 51px;
                    font-family: Microsoft Sans serif;
                    ">
                            <span style="
                    margin-right: 65px;
                    background: #fff;
                    font-size: 46px;
                    padding: 0 8px;
                ">إيصال</span>
                            </div>
                        
                        </td>
                    </tr></thead>
                </table>
            
            
            
            
            
                <table style="width:88%; margin:2% auto 0" cellspacing="0" cellpadding="1">
                <tbody>
                    <tr>
                        
                        
                        <td style="padding-left:5px;color:grey;font-style: italic;font-size:20px;font-weight:500;font-family:Myriad Pro";width:135px>${displayDate}</td><td style="font-size:18px;font-style:bold;font-family:helvetica;padding-left:7%">التاريخ</td>
                        <td style="visibility:hidden; padding-left: 300px;font-style:bold;">Description</td><td style="font-size:18px;font-family:helvetica;font-style:bold;margin-top:3px;text-align: right;">اسم المتبرع</td>
                    </tr>
                    <tr>
                        
                        
                        <td style="color:grey;font-style: italic;font-size:20px;font-family:Myriad Pro;font-weight:500; width:135px">${invoiceNum}</td><td style="font-size:18px;font-family:helvetica;"># الإصال</td>
                        
                    <td style="visibility:hidden">Description</td><td style="color:grey;font-size:20px;font-family:Myriad Pro;text-align: left;">${capitalize(item.donar[0].donarName)}</td></tr>
                </tbody>
            </table>
            
            
            <table style="width:88%; margin:13px auto 0;" cellspacing="0" cellpadding="5">
            <thead style="background:#F4C64E;outline: 11px solid #F4C64E; outline-offset:-11px;">
                <tr style='height:50px'>
                    <td style="font-style:bold;text-align:center; width:98px border-left: 2px solid #000; font-size: 20px;font-family:helvetica">المبلغ</td>
                    <td style="width:50px; font-style:bold; text-align:center; border-left: 2px solid #000;  font-size: 20px; font-family:helvetica">الكمية</td>
                    <td style="width:400px; font-style:bold;text-align:center; border-left: 2px solid #000;  font-size: 20px; font-family:helvetica">التفصيل</td>
                    <td style="width:50px; font-style:bold;text-align:center; font-size: 20px; font-family:helvetica; border-left: 2px solid #000;">التسلسل</td>
                <tr>
            </thead>
            </table>`
        };

        options.footer = {
            "height": "35mm",
            "contents": `
            <table id='pageFooter' style='width:100%; position:fixed; bottom:10; left:0; right:0; margin-bottom:0'>
                <tfoot>
                    <tr>
                        <td colspan='3' style='text-align:center'>
                        تم إصدار هذا الإصال آليا وعليه فلا يتطلب توقيعا                        </td>
                    </tr>
                    <tr>
                        <td colspan='3'>
                        <span style=' margin: 1px -5px 8px -4px; border: 2px solid #e2b836; display: block'></span>
                        </td>
                    </tr>
                    <tr>
                        <td style='text-align:center; border-right:1px solid grey; color:grey'> 
                        <svg version="1.1" style="margin-right:2px" fill="#f0c84b" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                            width="13px" height="13px" viewBox="0 0 96.124 96.123" 
                            xml:space="preserve">
                        <g>
                            <path d="M72.089,0.02L59.624,0C45.62,0,36.57,9.285,36.57,23.656v10.907H24.037c-1.083,0-1.96,0.878-1.96,1.961v15.803
                                c0,1.083,0.878,1.96,1.96,1.96h12.533v39.876c0,1.083,0.877,1.96,1.96,1.96h16.352c1.083,0,1.96-0.878,1.96-1.96V54.287h14.654
                                c1.083,0,1.96-0.877,1.96-1.96l0.006-15.803c0-0.52-0.207-1.018-0.574-1.386c-0.367-0.368-0.867-0.575-1.387-0.575H56.842v-9.246
                                c0-4.444,1.059-6.7,6.848-6.7l8.397-0.003c1.082,0,1.959-0.878,1.959-1.96V1.98C74.046,0.899,73.17,0.022,72.089,0.02z"/>
                        </g>

                        </svg>
                        <svg version="1.1" style="margin-right:3px" fill="#f0c84b" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                            width="13px" height="13px"  viewBox="0 0 169.063 169.063" style="enable-background:new 0 0 169.063 169.063;"
                            xml:space="preserve">
                        <g>
                            <path d="M122.406,0H46.654C20.929,0,0,20.93,0,46.655v75.752c0,25.726,20.929,46.655,46.654,46.655h75.752
                                c25.727,0,46.656-20.93,46.656-46.655V46.655C169.063,20.93,148.133,0,122.406,0z M154.063,122.407
                                c0,17.455-14.201,31.655-31.656,31.655H46.654C29.2,154.063,15,139.862,15,122.407V46.655C15,29.201,29.2,15,46.654,15h75.752
                                c17.455,0,31.656,14.201,31.656,31.655V122.407z"/>
                            <path d="M84.531,40.97c-24.021,0-43.563,19.542-43.563,43.563c0,24.02,19.542,43.561,43.563,43.561s43.563-19.541,43.563-43.561
                                C128.094,60.512,108.552,40.97,84.531,40.97z M84.531,113.093c-15.749,0-28.563-12.812-28.563-28.561
                                c0-15.75,12.813-28.563,28.563-28.563s28.563,12.813,28.563,28.563C113.094,100.281,100.28,113.093,84.531,113.093z"/>
                            <path d="M129.921,28.251c-2.89,0-5.729,1.17-7.77,3.22c-2.051,2.04-3.23,4.88-3.23,7.78c0,2.891,1.18,5.73,3.23,7.78
                                c2.04,2.04,4.88,3.22,7.77,3.22c2.9,0,5.73-1.18,7.78-3.22c2.05-2.05,3.22-4.89,3.22-7.78c0-2.9-1.17-5.74-3.22-7.78
                                C135.661,29.421,132.821,28.251,129.921,28.251z"/>
                        </g>

                        </svg>
                         <svg version="1.1" style="margin-right:5px" fill="#f0c84b" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="14px" height="15px"
                            viewBox="0 0 310 310" style="enable-background:new 0 0 310 310;" xml:space="preserve">
                        <g id="XMLID_822_">
                            <path id="XMLID_823_" d="M297.917,64.645c-11.19-13.302-31.85-18.728-71.306-18.728H83.386c-40.359,0-61.369,5.776-72.517,19.938
                                C0,79.663,0,100.008,0,128.166v53.669c0,54.551,12.896,82.248,83.386,82.248h143.226c34.216,0,53.176-4.788,65.442-16.527
                                C304.633,235.518,310,215.863,310,181.835v-53.669C310,98.471,309.159,78.006,297.917,64.645z M199.021,162.41l-65.038,33.991
                                c-1.454,0.76-3.044,1.137-4.632,1.137c-1.798,0-3.592-0.484-5.181-1.446c-2.992-1.813-4.819-5.056-4.819-8.554v-67.764
                                c0-3.492,1.822-6.732,4.808-8.546c2.987-1.814,6.702-1.938,9.801-0.328l65.038,33.772c3.309,1.718,5.387,5.134,5.392,8.861
                                C204.394,157.263,202.325,160.684,199.021,162.41z"/>
                        </g>
                        </svg>
                        Najafyia Foundation 
                        </td>
                        <td style='text-align:center; border-right:1px solid grey;color:grey'>www.najafyia.org </td>
                        <td style='text-align:center;color:grey'>info@najafyia.org</td>
                    </tr>
                </tfoot>
            </table>`,

        };
    }
    /**
     * It will create PDF of that HTML into given folder.
     */
    pdf.create(receipt, options).toFile('./public/pdf/' + fileName, function (err, data) {
        if (err) return console.log(err);
        let subject = '';
        let html = '';
        if (item.donar[0].user[0].language || item.language == 'ENG') {
            subject = configuration.email.subjectPrefixEng_Frn+' | Donation receipt';
            html = emailTemplate.standardRecEng().replace('[DonarName]', capitalize(item.donar[0].donarName))
        } else if (item.donar[0].user[0].language || item.language == 'ARB') {
            subject = 'إيصال';
            html = emailTemplate.standardRecArb().replace('[DonarName]', capitalize(item.donar[0].donarName));
        } else if (item.donar[0].user[0].language || item.language == 'FRN') {
            subject = configuration.email.subjectPrefixEng_Frn+' | Reçu de donation';
            html = emailTemplate.standardRecFrn().replace('[DonarName]', capitalize(item.donar[0].donarName));
        }
        var options = {
            from: 'invoice@najafyia.org',
            to: item.donar[0].user[0].email,
            subject,
            html: JSON.parse(html),
            attachments: [{
                path: data.filename,
                filename: savedFileName
            }]
        };

        emailTrans.trans().sendMail(options, (err, suc) => {
            if (suc) {
                console.log('Donation Email send successfully')
            }
            if (err) {
                console.log("error sending donation email")
            }
        });
        return data.filename;
    });
}