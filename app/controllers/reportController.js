var Donar = require('../models/donar.js');
var Donation = require('../models/donation.js');
var DonationRecurring = require('../models/donationRecurring.js');
var StudentSponsorship = require('../models/studentSponsorship.js');
var OrphanScholarship = require('../models/orphanScholarships.js');
var ObjectID = require('mongodb').ObjectID;
var Program =  require('../models/program');
const aytamunaReportService = require('../services/aytamunaReportService');
const constants = require('../constants');
const logHelper = require('../utilities/logHelper');
const responseDTO = require('../models/custom/responseDTO');
// Load the full build.
var _ = require('lodash');
// Load the core build.
var _ = require('lodash/core');
// Load the FP build for immutable auto-curried iteratee-first data-last methods.
var fp = require('lodash/fp');

// Load method categories.
var array = require('lodash/array');
var object = require('lodash/fp/object');

// Cherry-pick methods for smaller browserify/rollup/webpack bundles.
var at = require('lodash/at');
var curryN = require('lodash/fp/curryN');

// get Donar Wise Report
module.exports.getDonarWiseReport = function (req, res) {
    Donation.find({}).populate({
        path: "donationdetails",
        model: "donationDetail",
        populate: [{
            path: 'program', model: "program",
            populate: [{ path: 'programType', model: "programType",select:{programTypeName:1, slug:1, language:1} }, {
                path: 'donationProcess', model: "donationProcess"
            }]
        }, { path: 'programSubCategory', model: "programSubCategory",select:{programSubCategoryName:1, slug:1, language:1}, populate: { path: 'sahms', model: 'sahms' } },
        { path: 'sdoz', model: 'sdoz' },
        { path: 'occasion', model: 'occasions' },
        { path: 'dua', model: 'dua' },]
    }).populate({
        path: "donor",
        model: "donar", populate: { path: 'country', model: 'country' },
        populate: {
            path: 'user'
        }
    }).exec(function (err, donation) {
        if (donation) {
            res.status(200).send(donation);
        } else {
            res.status(500).send("donation does not exist!");
        }
    });
}
module.exports.getProjectionReport = async function (req, res) {
    const filter = req.query;
    let fromDate = (filter.fromDate) ? new Date(filter.fromDate).toISOString() : new Date(0)
    let obj = {
        created: { $gte: fromDate }
    }

    if (filter.type == "Recurring Auto Renewal") {
        obj['donationDetails.autoRenew'] = true;
        obj['donationDetails.isRecurring'] = true;
    }
    else if (filter.type == "Recurring") {
        obj['donationDetails.isRecurring'] = true;
    }
    if (filter.toDate) {
        obj.endDate = { $lte: new Date(filter.toDate).toISOString() }
    }

    DonationRecurring.find(obj || {}).populate({
        path: 'program',
        model: 'program',
        populate: { path: 'programType', model: 'programType' }
    }).populate({
        path: 'programSubCategory', model: 'programSubCategory'
    }).populate({
        path: 'donar', model: 'donar'
    }).sort({ "endDate": -1 }).exec(function (err, donations) {
        if (err) {
            res.status(500).send(err);
        } else {
            if (donations && donations.length) {
                let arr = Object.assign([], donations)
                res.status(200).send({ data: donations, endDate: donations[0].endDate, startDate: arr.sort((a, b) => a.created - b.created)[0].created });
            } else {
                res.status(200).send({ data: [], endDate: null, startDate: null });
            }
        }
    })

}

module.exports.getDonations = function (req, res) {
    Donation.find({}).populate({
        path: "donationdetails",
        model: "donationDetail",
        populate: [{
            path: 'program', model: "program",
            populate: [{ path: 'programType', model: "programType",select:{programTypeName:1, slug:1, language:1} }, {
                path: 'donationProcess', model: "donationProcess"
            }]
        }, { path: 'programSubCategory', model: "programSubCategory",select:{programSubCategoryName:1, slug:1, language:1} },
        { path: 'sdoz', model: 'sdoz' }]
    }).populate({
        path: "donor",
        model: "donar"
    }).exec(function (err, donation) {
        if (donation) {
            res.status(200).send(donation);
        } else {
            res.status(500).send("donation does not exist!");
        }
    });
}

module.exports.getRecurringDonations = function (req, res) {
    DonationRecurring.find({}).populate({
        path: 'program',
        model: 'program',
        populate: { path: 'programType', model: 'programType',select:{programTypeName:1, slug:1, language:1} }
    }).populate({
        path: 'donor', model: 'donar'
    }).exec(function (err, donations) {
        res.status(200).send(donations);
    })
}


// get Khums Report
module.exports.getKhumsReport = function (req, res) {

    Donation.find({}).populate({
        path: 'donationdetails', populate: {
            path: 'programSubCategory',
            model: 'programSubCategory',
            select:{programSubCateogryName:1, slug:1, language:1}
        }
    })
        .populate({
            path: 'donationdetails', populate: {
                path: 'program',
                model: 'program',
                select:{programName:1, slug:1, language:1}
            }
        }).populate({
            path: "donor",
            model: "donar"
        }).exec(function (err, donation) {
            res.status(200).send(donation);
        });
}

//Get All Donor
module.exports.getProfileReport = function (req, res) {
    Donar.find({})
        .populate('accountDetails')
        .populate('user')
        .populate('country')
        .exec(function (err, donar) {
            res.status(200).send(donar);
        });
}

//get all student sposnorships
module.exports.getStudentSponsorship = function (req, res) {
    StudentSponsorship.find({ $or: [{ isChanged: { $exists: false } }, { isChanged: false }] })
        .populate({
            path: "students",
            model: "studentprofile",
            populate: [{ path: 'nationality', model: "country" }, { path: 'motherTongue', model: "languages" }]
        })
        .populate({
            path: "donar",
            model: "donar"
        })
        .populate({
            path: "donationdetails",
            model: "donationDetail",
            populate: [{
                path: 'program', model: "program",
                populate: [{ path: 'programType', model: "programType" }, {
                    path: 'donationProcess', model: "donationProcess"
                }]
            }, { path: 'programSubCategory', model: "programSubCategory" },
            { path: 'sdoz', model: 'sdoz' }]
        })
        .exec(function (err, studentSponsor) {
            if (studentSponsor) {
                res.status(200).send(studentSponsor);
            } else {
                res.status(500).send("Student does not exist!");
            }
        });
}


// get orphan by donar id
module.exports.getOrphansScholarship = function (req, res) {
    OrphanScholarship.find({ $or: [{ isChanged: { $exists: false } }, { isChanged: false }] })
        .populate({
            path: "orphans",
            model: "orphan"
        })
        .populate({
            path: "donar",
            model: "donar"
        })
        .populate({
            path: "donationdetails",
            model: "donationDetail",
            populate: [{
                path: "program", model: "program",
                populate: [{ path: "programType", model: "programType" }, {
                    path: "donationProcess", model: "donationProcess"
                }]
            }, { path: "programSubCategory", model: "programSubCategory" },
            { path: "sdoz", model: "sdoz" }]
        }).exec(function (err, orphanSponsor) {
            if (orphanSponsor) {
                res.status(200).send(orphanSponsor);
            } else {
                res.status(500).send("Orphan does not exist!");
            }
        });
}

module.exports.updateStatusForAytamunaReport = async function (req, res) {
    const methodName = "updateStatusForAytamunaReport()";
    try {
        let successFlag = await aytamunaReportService.updateStatusForAytamunaReport(new Date(new Date().toUTCString()));
        if (!successFlag)
            throw new Error('An error has occurred while updating statuses for aytamuna report')
        responseDTO.isSuccess = successFlag;
        responseDTO.data = successFlag;
        res.status(200).send(responseDTO);
    }
    catch (ex) {
        logHelper.logError(`reportController: ${methodName}: Error`, ex);
        responseDTO.isSuccess = false;
        responseDTO.data = ex;
        responseDTO.errorMessage = constants.Messages.ErrorMessage;
        res.status(500).send(responseDTO);
    }
};
