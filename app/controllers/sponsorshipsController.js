var OrphanScholarship = require("../models/orphanScholarships.js");
var StudentSponsorship = require("../models/studentSponsorship.js");
var Donation = require("../models/donation.js");
const logHelper = require('../utilities/logHelper');
var Donar = require("../models/donar.js");
const databaseHelper = require("../utilities/databaseHelper.js");
const Constants = require("../constants.js");
var ObjectID = require('mongodb').ObjectID;
const paymentService = require("../services/paymentService.js");
const orphanSponsorshipService = require("../services/orphanSponsorshipService.js");
const stripeAPIHelper = require('../utilities/stripeAPIHelper');









// get expired sponsorships by donar id
module.exports.getExpiredSponsorshipsByDonarId = function (req, res) {
  // var expiredSponsorshiplist = [];

  Donar.findOne({ user: req.session._id }, function (err, donar) {
    if (donar) {
      Donation.aggregate([
        {
          $match: {
            donor: donar._id,
          }
        },
        {
          $lookup: {
            from: "donationdetails",
            localField: "customerId",
            foreignField: "donation.customerId",
            as: "donations"
          }
        },
        {
          $unwind: {
            path: "$donations",
            // preserveNullAndEmptyArrays: 
          }
        },
        {
          $match: {
            "donations.isRecurring": { $exists: true },
            "donations.donation.donor": donar._id,
            "donations.autoRenew": { $eq: true }
          }
        },

        {
          $group: {
            _id: "$invoiceNo",
            data: { $addToSet: "$$ROOT" }
          }
        },
        { $unwind: "$data" },
        {
          $project: {
            currency: "$data.currency",
            totalAmount: "$data.donations.amount",
            endDate: "$data.donations.endDate",
            program: "$data.donations.program",
            programSubCategory: "$data.donations.programSubCategory",
            customerId: "$data.customerId",

          }
        },
        {
          $lookup: {
            from: "programs",
            localField: "program",
            foreignField: "_id",
            as: "program"
          }
        },
        {
          $lookup: {
            from: "programsubcategories",
            localField: "programSubCategory",
            foreignField: "_id",
            as: "programSubCategory"
          }
        },
        {
          $unwind: "$program"
        },
        {
          $unwind: { path: "$programSubCategory", preserveNullAndEmptyArrays: true }
        },
        {
          $project: {
            currency: 1,
            totalAmount: 1,
            endDate: 1,
            program: "$program.programName",
            programSubCategory: "$programSubCategory.programSubCategoryName",
            customerId: 1

          }
        },
        {
          $lookup: {
            from: "donationrecurrings",
            localField: "customerId",
            foreignField: "customerId",
            as: "donationRecurring"
          }
        },
        {
          $project: {
            currency: 1,
            totalAmount: 1,
            endDate: 1,
            program: 1,
            programSubCategory: 1,
            customerId: 1,
            nextDonationDate:
            {
              $map:
              {
                input: "$donationRecurring",
                as: "dr",
                in: {
                  $cond: [{ $eq: ["$$dr.amount", "$totalAmount"] }, "$$dr.nextDonationDate", null]
                }
              }
            }
          }


        },
        {
          $project: {
            currency: 1,
            totalAmount: 1,
            endDate: 1,
            program: 1,
            programSubCategory: 1,
            nextDonationDate: {
              $filter: {
                input: "$nextDonationDate",
                as: "item",
                cond: { $ne: ["$$item", null] }
              }
            }
          },
        },

        {
          $unwind: {
            path: "$nextDonationDate",
            preserveNullAndEmptyArrays: true
          }
        },


      ]).exec(function (err, donations) {
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
};

module.exports.renewExpiredSponsorships = function (req, res) {
  var count = 0;
  for (let i = 0; i < req.body.length; i++) {
    Donation.findOne(
      { donationdetails: req.body[i].donationdetails[0]._id },
      (err, donation) => {
        if (donation) {
          donation.endDate = req.body[i].endDateObj;
          donation.updated = Date.now();
          donation.updatedBy = req.session.name;
          donation.autoRenew = req.body[i].autoRenew;
          donation.save((err, donation) => {
            if (err) {
              res.status(500).send(err);
            } else {
              if (req.body[i].students) {
                StudentSponsorship.findById(req.body[i]._id, (err, stdObj) => {
                  if (stdObj) {
                    stdObj.endDate = req.body[i].endDate;
                    stdObj.autoRenew = req.body[i].autoRenew;
                    stdObj.updated = Date.now();
                    stdObj.updatedBy = req.session.name;
                    stdObj.save((err, stdObj) => {
                      if (err) {
                        res.status(500).send(err);
                      }
                    });
                  } else {
                    return res.status(404).send({
                      message: "Student not found!"
                    });
                  }
                });
              }
              if (req.body[i].orphans) {
                OrphanScholarship.findById(req.body[i]._id, (err, orpObj) => {
                  if (orpObj) {
                    orpObj.endDate = req.body[i].endDate;
                    orpObj.autoRenew = req.body[i].autoRenew;
                    orpObj.updated = Date.now();
                    orpObj.updatedBy = req.session.name;
                    orpObj.save((err, orpObj) => {
                      if (err) {
                        res.status(500).send(err);
                      }
                    });
                  } else {
                    return res.status(404).send({
                      message: "Orphan not found!"
                    });
                  }
                });
              }
            }
            count++;
            if (count == req.body.length) {
              res.json("Renew Successfully!");
            }
          });
        }
      }
    );
  }
};
function encodeURL(unencoded) {
  return encodeURIComponent(unencoded).replace(/'/g, "%27").replace(/"/g, "%22");
}
let MONTHLY_SUBSCRIPTION = {
  "state": "NotStarted",
  "body": {
    "amount": 60,
    "donar": {
      "user": ["600e7405b9193f05a0d4c3b7"],
      "accountDetails": [],
      "isActive": true,
      "_id": "600e7406b9193f05a0d4c3b8",
      "donarName": "Komail Haider",
      "email": "komail.haider@talverse.com",
      "mobile": "+923332347414",
      "address": "",
      "created": "2021-01-25T07:32:22.363Z",
      "updated": "2021-04-22T10:09:01.561Z",
      "__v": 0,
      "customerId": "cus_JLgqr6xwLvcYU7"
    },
    "donarEmail": "komail.haider@talverse.com",
    "selectedLang": "ENG",
    "items": [{
      "program": {
        "programType": ["5a37badbb585eacb5e87c3bf"],
        "programSubCategory": [],
        "donationProcess": [{
          "donationDuration": [],
          "isSyed": true,
          "isMarhomeenName": false,
          "isCalendar": false,
          "isOtherFieldForNiyaz": false,
          "isOtherFieldForRP": false,
          "amount": 360,
          "isActive": true,
          "_id": "5add80d42dbc3f223c1acb7a",
          "isRecurring": true,
          "isDuration": false,
          "isYearAround": false,
          "isCount": true,
          "countMin": "1",
          "countMax": "20",
          "interval": "1",
          "isAmount": true,
          "isMinimumAmount": true,
          "minimumAmount": 5,
          "updated": "2018-04-23T06:44:36.010Z",
          "created": "2018-04-23T06:44:36.010Z",
          "__v": 0,
          "durationEndDate": "07/17/2020",
          "durationStartDate": "03/12/2020",
          "subscriptionDetail": {
            "paymentPlan": [{
              "Name": "GIVE_ONCE",
              "value": {
                "FRN": "Donner une fois",
                "ARB": "أعط مرة واحدة",
                "ENG": "Give Once"
              },
              "billingDetail": {
                "interval": "year",
                "interval_count": 1
              }
            }, {
              "Name": "MONTHLY",
              "value": {
                "FRN": "Donnez mensuellement",
                "ARB": "تبرع شهريا",
                "ENG": "Give Monthly"
              },
              "billingDetail": {
                "interval": "month",
                "interval_count": 1
              }
            }],
            "duration": {
              "name": "YEARLY",
              "numOfMonths": 12,
              "value": {
                "FRN": "Annuel",
                "ARB": "سنوي",
                "ENG": "Yearly"
              }
            },
            "allowAutoRenew": true,
            "autoRenewMessage": {
              "value": {
                "FRN": "Donner une fois",
                "ARB": "أعط مرة واحدة",
                "ENG": "<b>Renew</b> sponsorship <b> every year, Turn off</b> auto-renewal of sponsorship <b>anytime</b>"
              }
            },
            "cancellationMode": "NotAllowed",
            "paymentChargeMessage": {
              "value": {
                "FRN": "Donner une fois",
                "ARB": "أعط مرة واحدة",
                "ENG": "Please note that the <b>[currency][amount]</b> will be deducted monthly until <b>[date]</b>"
              }
            }
          }
        }],
        "isSyed": false,
        "countryOfZiyarat": null,
        "created": "2018-04-23T06:44:36.135Z",
        "updated": "2020-05-10T12:07:31.761Z",
        "_id": "5add80d42dbc3f223c1acb7b",
        "programName": "Orphan Sponsorship",
        "programDescription": "<p>The orphan sponsorship program is one of the most important programs run  by the foundation. The program allows individuals to sponsor the orphans for a  whole year in order to meet their basic needs. Pegged at a dollar a day, it is  barely enough to cover one meal a day, let alone pay for any medical or  incidental necessities. The donor is given a selection of orphan profiles to  choose from based on their selection of descent &amp; gender. After sponsoring  an orphan, the donor will be able to view the orphan profile that includes the  picture and other basic information of the orphan sponsored. It is also possible  for you to meet the orphan you are sponsoring while traveling to Iraq. This  meetup can be arranged by providing notice prior to your arrival.</p><p><img alt=\"Image title\" class=\"fr-fin fr-dib\" src=\"uploads/19B.png\"></p><p><strong>Criteria for  orphan sponsorship</strong></p><p>To ensure only orphans that  are in dire need are chosen for sponsorship, the foundation usually follows a  rigorous selection process that involves:</p><ol start=\"1\" type=\"1\"><li style=\"color:#222222;mso-margin-top-alt:auto;mso-margin-bottom-alt:       auto;text-align:justify;line-height:normal;mso-list:l0 level1 lfo1;       tab-stops:list 36.0pt;background:white\">Receiving orphan registration       applications.</li><li style=\"color:#222222;mso-margin-top-alt:auto;mso-margin-bottom-alt:       auto;text-align:justify;line-height:normal;mso-list:l0 level1 lfo1;       tab-stops:list 36.0pt;background:white\">A field survey is done to       assess the living conditions of the orphan. This is conducted to ensure       that the orphan genuinely needs support.</li><li style=\"color:#222222;mso-margin-top-alt:auto;mso-margin-bottom-alt:       auto;text-align:justify;line-height:normal;mso-list:l0 level1 lfo1;       tab-stops:list 36.0pt;background:white\">If the orphan is above       the age of 6, they are required to be in a school.</li><li style=\"color:#222222;mso-margin-top-alt:auto;mso-margin-bottom-alt:       auto;text-align:justify;line-height:normal;mso-list:l0 level1 lfo1;       tab-stops:list 36.0pt;background:white\">The widow (mother of the       orphan) has to be unmarried.</li><li style=\"color:#222222;mso-margin-top-alt:auto;mso-margin-bottom-alt:       auto;text-align:justify;line-height:normal;mso-list:l0 level1 lfo1;       tab-stops:list 36.0pt;background:white\">The family should not be       getting pension/stipends from any government entities.</li></ol><p><em>“By God Take  care of the orphans and let them not starve in your presence” </em>[Prophet Muhammad (saw)]</p>",
        "imageLink": "19B.png",
        "isActive": true,
        "createdBy": "NA",
        "updatedBy": "NA",
        "language": "ENG",
        "productId": "prod_HwRVa2CLMwKycr",
        "__v": 0,
        "programPriority": 1,
        "slug": "orphan-sponsorship",
        "isRecurringProgram": true
      },
      "programSubCategory": [],
      "totalAmount": "60.00",
      "isRecurring": false,
      "autoRenew": false,
      "isRecurringProgram": true,
      "isAutoRenew": false,
      "paymentPlan": {
        "Name": "MONTHLY",
        "value": {
          "FRN": "Donnez mensuellement",
          "ARB": "تبرع شهريا",
          "ENG": "Give Monthly"
        },
        "billingDetail": {
          "interval": "month",
          "interval_count": 1
        }
      },
      "totalSubscriptionAmount": "720.00",
      "orphans": ["5f1d312ded59116f2e832137", "5f1d312ded59116f2e83214d"],
      "count": 2,
      "paymentType": "One Time",
      "currency": {
        "title": "USD",
        "symbol": "$",
        "dollarAmount": 360
      },
      "itemCount": 0.16666666666666666
    }],
    "paymentCurrency": "$",
    "paymentTitle": "USD",
    "country": "Pakistan"
  }
}

let YEARLY_SUBSCRIPTION = {
  "state": "NotStarted",
  "body": {
    "amount": 720,
    "donar": {
      "user": ["60926c304cfcd70d98ca9db3"],
      "accountDetails": [],
      "isActive": true,
      "_id": "60926c304cfcd70d98ca9db5",
      "donarName": "quick1",
      "email": "quick1@test.com",
      "mobile": null,
      "address": "",
      "created": "2021-05-05T09:58:08.922Z",
      "updated": "2021-05-05T09:58:08.922Z",
      "__v": 0
    },
    "donarEmail": "quick1@test.com",
    "selectedLang": "ENG",
    "items": [{
      "program": {
        "programType": ["5a37badbb585eacb5e87c3bf"],
        "programSubCategory": [],
        "donationProcess": [{
          "donationDuration": [],
          "isSyed": true,
          "isMarhomeenName": false,
          "isCalendar": false,
          "isOtherFieldForNiyaz": false,
          "isOtherFieldForRP": false,
          "amount": 360,
          "isActive": true,
          "_id": "5add80d42dbc3f223c1acb7a",
          "isRecurring": true,
          "isDuration": false,
          "isYearAround": false,
          "isCount": true,
          "countMin": "1",
          "countMax": "20",
          "interval": "1",
          "isAmount": true,
          "isMinimumAmount": true,
          "minimumAmount": 5,
          "updated": "2018-04-23T06:44:36.010Z",
          "created": "2018-04-23T06:44:36.010Z",
          "__v": 0,
          "durationEndDate": "07/17/2020",
          "durationStartDate": "03/12/2020",
          "subscriptionDetail": {
            "paymentPlan": [{
              "Name": "GIVE_ONCE",
              "value": {
                "FRN": "Donner une fois",
                "ARB": "أعط مرة واحدة",
                "ENG": "Give Once"
              },
              "billingDetail": {
                "interval": "year",
                "interval_count": 1
              }
            }, {
              "Name": "MONTHLY",
              "value": {
                "FRN": "Donnez mensuellement",
                "ARB": "تبرع شهريا",
                "ENG": "Give Monthly"
              },
              "billingDetail": {
                "interval": "month",
                "interval_count": 1
              }
            }],
            "duration": {
              "name": "YEARLY",
              "numOfMonths": 12,
              "value": {
                "FRN": "Annuel",
                "ARB": "سنوي",
                "ENG": "Yearly"
              }
            },
            "allowAutoRenew": true,
            "autoRenewMessage": {
              "value": {
                "FRN": "Donner une fois",
                "ARB": "أعط مرة واحدة",
                "ENG": "<b>Renew</b> sponsorship <b> every year, Turn off</b> auto-renewal of sponsorship <b>anytime</b>"
              }
            },
            "cancellationMode": "NotAllowed",
            "paymentChargeMessage": {
              "value": {
                "FRN": "Donner une fois",
                "ARB": "أعط مرة واحدة",
                "ENG": "Please note that the <b>[currency][amount]</b> will be deducted monthly until <b>[date]</b>"
              }
            }
          }
        }],
        "isSyed": false,
        "countryOfZiyarat": null,
        "created": "2018-04-23T06:44:36.135Z",
        "updated": "2020-05-10T12:07:31.761Z",
        "_id": "5add80d42dbc3f223c1acb7b",
        "programName": "Orphan Sponsorship",
        "programDescription": "<p>The orphan sponsorship program is one of the most important programs run  by the foundation. The program allows individuals to sponsor the orphans for a  whole year in order to meet their basic needs. Pegged at a dollar a day, it is  barely enough to cover one meal a day, let alone pay for any medical or  incidental necessities. The donor is given a selection of orphan profiles to  choose from based on their selection of descent &amp; gender. After sponsoring  an orphan, the donor will be able to view the orphan profile that includes the  picture and other basic information of the orphan sponsored. It is also possible  for you to meet the orphan you are sponsoring while traveling to Iraq. This  meetup can be arranged by providing notice prior to your arrival.</p><p><img alt=\"Image title\" class=\"fr-fin fr-dib\" src=\"uploads/19B.png\"></p><p><strong>Criteria for  orphan sponsorship</strong></p><p>To ensure only orphans that  are in dire need are chosen for sponsorship, the foundation usually follows a  rigorous selection process that involves:</p><ol start=\"1\" type=\"1\"><li style=\"color:#222222;mso-margin-top-alt:auto;mso-margin-bottom-alt:       auto;text-align:justify;line-height:normal;mso-list:l0 level1 lfo1;       tab-stops:list 36.0pt;background:white\">Receiving orphan registration       applications.</li><li style=\"color:#222222;mso-margin-top-alt:auto;mso-margin-bottom-alt:       auto;text-align:justify;line-height:normal;mso-list:l0 level1 lfo1;       tab-stops:list 36.0pt;background:white\">A field survey is done to       assess the living conditions of the orphan. This is conducted to ensure       that the orphan genuinely needs support.</li><li style=\"color:#222222;mso-margin-top-alt:auto;mso-margin-bottom-alt:       auto;text-align:justify;line-height:normal;mso-list:l0 level1 lfo1;       tab-stops:list 36.0pt;background:white\">If the orphan is above       the age of 6, they are required to be in a school.</li><li style=\"color:#222222;mso-margin-top-alt:auto;mso-margin-bottom-alt:       auto;text-align:justify;line-height:normal;mso-list:l0 level1 lfo1;       tab-stops:list 36.0pt;background:white\">The widow (mother of the       orphan) has to be unmarried.</li><li style=\"color:#222222;mso-margin-top-alt:auto;mso-margin-bottom-alt:       auto;text-align:justify;line-height:normal;mso-list:l0 level1 lfo1;       tab-stops:list 36.0pt;background:white\">The family should not be       getting pension/stipends from any government entities.</li></ol><p><em>“By God Take  care of the orphans and let them not starve in your presence” </em>[Prophet Muhammad (saw)]</p>",
        "imageLink": "19B.png",
        "isActive": true,
        "createdBy": "NA",
        "updatedBy": "NA",
        "language": "ENG",
        "productId": "prod_HwRVa2CLMwKycr",
        "__v": 0,
        "programPriority": 1,
        "slug": "orphan-sponsorship",
        "isRecurringProgram": true
      },
      "programSubCategory": [],
      "totalAmount": "720.00",
      "isRecurring": false,
      "autoRenew": false,
      "isRecurringProgram": true,
      "isAutoRenew": false,
      "paymentPlan": {
        "Name": "GIVE_ONCE",
        "value": {
          "FRN": "Donner une fois",
          "ARB": "أعط مرة واحدة",
          "ENG": "Give Once"
        },
        "billingDetail": {
          "interval": "year",
          "interval_count": 1
        }
      },
      "totalSubscriptionAmount": "720.00",
      "orphans": ["5f15aa63ed59116f2e7dac4c", "5f15aa63ed59116f2e7dac45"],
      "count": 2,
      "paymentType": "One Time",
      "currency": {
        "title": "USD",
        "symbol": "$",
        "dollarAmount": 360
      },
      "itemCount": 2
    }],
    "paymentCurrency": "$",
    "paymentTitle": "USD",
    "country": {
      "_id": "5a41ff28b585eacb5e87c47f",
      "name": "Pakistan",
      "nameFRN": "Pakistan",
      "nameARB": "باكستان",
      "dialCode": "+92",
      "code": "PK",
      "isNew": true,
      "updated": "2021-05-05T09:57:20.846Z"
    }
  }
}
module.exports.renewOrphanSponsorships = async function (req, res) {
  try {
    let currrentDate = new Date();
    const donationId = req.query.sid;
    const isMonthly = req.query.isMonthly == "1";
    const PAYMENT_PLAN = isMonthly ? "MONTHLY" : "GIVE_ONCE";
    let CURRENCY = "USD";
    if (donationId) {
      const renewalId = donationId + PAYMENT_PLAN;
      let donationItemObject = isMonthly ? MONTHLY_SUBSCRIPTION : YEARLY_SUBSCRIPTION;
      let renewalDonationItem = await databaseHelper.getItem(Constants.Database.Collections.DON_ITEM.dataKey, { "body.renewalID": renewalId }, { "_id": 1, "state": 1 });
      console.log("renewalDonationItem");
      console.log(renewalDonationItem);
      if (!renewalDonationItem) {
        let oldOrphanSponsorships = await databaseHelper.getItems(Constants.Database.Collections.DON_REC.dataKey, {
          "donationDetails.donation._id": ObjectID(donationId), freezed: false
        }, { "orphan._id": 1, "donar": 1, "donationDetails": 1 });
        if (oldOrphanSponsorships && oldOrphanSponsorships.length > 0) {
          let orphanIds = oldOrphanSponsorships.map(x => { return x.orphan._id });
          console.log(orphanIds);
          console.log(oldOrphanSponsorships[0].donar)
          if (orphanIds && orphanIds.length > 0) {
            let donor = await databaseHelper.getItem(Constants.Database.Collections.DONR.dataKey, { "_id": ObjectID(oldOrphanSponsorships[0].donar[0]) }, {});
            if (donor && donor.user && donor.user[0]) {
              donationItemObject.body.donarEmail = donor.email;
              let donorUser = await databaseHelper.getItem(Constants.Database.Collections.USR.dataKey, { "_id": ObjectID(donor.user[0]) }, {});
              if (donorUser) {
                donationItemObject.body.selectedLang = donorUser.language;
                donationItemObject.body.country = donorUser.countryOfResidence;
              }
            }
            if (!donationItemObject.body.country) {
              const countryId = oldOrphanSponsorships[0].donationDetails
                && oldOrphanSponsorships[0].donationDetails.countryOfResidence
                && oldOrphanSponsorships[0].donationDetails.countryOfResidence.length > 0 ? oldOrphanSponsorships[0].donationDetails.countryOfResidence[0] : null;
              let donorCountry = null;
              console.log(countryId);
              if (countryId)
                donorCountry = await databaseHelper.getItem(Constants.Database.Collections.CON.dataKey, { "_id": ObjectID(countryId) }, {});
              donationItemObject.body.country = donorCountry;
            }

            //set country, donor details, currency, total amount, language in body
            donationItemObject.body.donar = donor;
            const donation = oldOrphanSponsorships[0].donationDetails ? oldOrphanSponsorships[0].donationDetails.donation : null;
            if (donation) {
              donationItemObject.body.paymentCurrency = donation.currency;
              CURRENCY = donationItemObject.body.paymentTitle = donation.currencyTitle;

              donationItemObject.body.items[0].currency.title = donation.currencyTitle;
              donationItemObject.body.items[0].currency.symbol = donation.currency;
            }
            // set orphan ids, amount, itemCount, total amount, totalSubscriptionAmount in items
            donationItemObject.body.items[0].orphans = orphanIds;

            let currencyBasedAmount = await orphanSponsorshipService.updateRateJson(CURRENCY);

            donationItemObject.body.amount =
              donationItemObject.body.items[0].totalAmount =
              currencyBasedAmount[CURRENCY][PAYMENT_PLAN].amount * orphanIds.length;
            donationItemObject.body.items[0].count = donationItemObject.body.items[0].itemCount = orphanIds.length;
            donationItemObject.body.items[0].totalSubscriptionAmount = currencyBasedAmount[CURRENCY][PAYMENT_PLAN].totalAmount * orphanIds.length;
            donationItemObject.body.renewalID = renewalId;

            //add new donation item
            renewalDonationItem = await databaseHelper.insertItem(Constants.Database.Collections.DON_ITEM.dataKey, donationItemObject);
          }
        }
        else {
          let message = 'We are sorry, please contact administrator, Thank you.';
          let redirectUrl = `${req.protocol}://${req.get('host')}/#/stripe-checkout?message=${message}`;
          res.redirect(redirectUrl);
          //res.status(200).send("We are sorry, please contact administrator, Thank you.")
        }
      }
      else {
        // check if donation item is processed
        const processedItem = await databaseHelper.getItem(Constants.Database.Collections.DON_ITEM.dataKey, { "body.renewalID": { $regex: ".*" + donationId + ".*" }, "state": "Processed" }, { "_id": 1, "state": 1 });//{"body.renewalID":{$regex:".*5eaf73ef4838750a909b2d69.*"}, "state":"Processed"}
        if (processedItem) {
          renewalDonationItem = null;
        }
        else {


          renewalDonationItem = await databaseHelper.getItem(Constants.Database.Collections.DON_ITEM.dataKey, { "body.renewalID": renewalId }, { "_id": 1, "body": 1 });

          CURRENCY = renewalDonationItem.body.paymentTitle;
          let orphan = renewalDonationItem.body.items[0].orphans;
          let currencyBasedAmount = await orphanSponsorshipService.updateRateJson(CURRENCY);
          renewalDonationItem.body.amount = renewalDonationItem.body.items[0].totalAmount = currencyBasedAmount[CURRENCY][PAYMENT_PLAN].amount * orphan.length;
          renewalDonationItem.body.items[0].count = renewalDonationItem.body.items[0].itemCount = orphan.length;
          renewalDonationItem.body.items[0].totalSubscriptionAmount = currencyBasedAmount[CURRENCY][PAYMENT_PLAN].totalAmount * orphan.length;
          await databaseHelper.updateItem(Constants.Database.Collections.DON_ITEM.dataKey, { _id: renewalDonationItem._id }, renewalDonationItem);
        }
      }
      if (renewalDonationItem) {
        req.session.isGuestUser = true;//allowing checkout page to be accessed as guest user
        const success_url = encodeURL(`${req.protocol}://${req.get('host')}/#/success-checkout/?donationId=${renewalDonationItem._id}`);
        //const redirectUrl = `${req.protocol}://${req.get('host')}/#/stripe-checkout?su=${success_url}&di=${renewalDonationItem._id}`;

        const redirectUrl = `${req.protocol}://${req.get('host')}/#/middle-work?donItem=${renewalDonationItem._id}&donId=${donationId}`;
        console.log('redirectUrl', redirectUrl);
        res.redirect(redirectUrl);
      }
      else {
        let message = 'Something went wrong, please contact administrator. Thank you.';
        let redirectUrl = `${req.protocol}://${req.get('host')}/#/stripe-checkout?message=${message}`;
        res.redirect(redirectUrl);
        // throw new Error("Something went wrong, please contact administrator. Thank you")

      }
      //res.status(200).json(donationItemObject)
    }
    else {
      throw new Error("Required parameters are missing")
    }
  }
  catch (err) {
    res.status(400).send(err.message);
  }
}

module.exports.renewOrphanSponsorshipsWithoutPayment = async function (req, res) {
  //renewOrphanSponsorshipWithoutPayment
  try {
    let { donationItem, invoiceNum } = req.body;
    if (donationItem && invoiceNum) {
      const response = await paymentService.renewOrphanSponsorshipWithoutPayment(req.body);
      if (response)
        res.status(200).send("Alhumdulilah!! Success!!")
      else
        throw new Error("Something went wrong for invoice: " + invoiceNum)
    }
    else {
      throw new Error("Required parameters are missing")
    }
  }
  catch (err) {
    res.status(400).send(err.message);
  }
}

module.exports.renewOrphanSponsorhsipInGracePeriod = async function (req, res) {

  try {
    logHelper.logInfo(`SponsorShipController: renewOrphanSponsorhsipInGracePeriod: Renewal link visited `);

    const donProgDetId = req.query.dpd ? req.query.dpd : "";
    const donItem = req.query.donItem ? req.query.donItem : "";
    const donId = req.query.donId ? req.query.donId : "";

    const confirmed = req.query.confirmed ? true : false;

    let donationItem = null;
    let response;

    if (donProgDetId && confirmed) {
      response = await orphanSponsorshipService.performRenewalForPaymentPlan(donProgDetId);
      if (response && response.hasDonationItem) {
        donationItem = response.data.donationItem;
      }
    }

    if (donItem && donId && confirmed) {
      response = await orphanSponsorshipService.performRenewalForOneTime(donItem, donId);
      if (response && response.hasDonationItem) {
        donationItem = response.data.donationItem;
      }
    }
    let redirectUrl = '';
    const success_url = encodeURL(`${req.protocol}://${req.get('host')}/#/success-checkout/?donationId=${donationItem ? donationItem._id : ''}`);
    req.session.isGuestUser = true;//allowing checkout page to be accessed as guest user

    redirectUrl = `${req.protocol}://${req.get('host')}/#/stripe-checkout?su=${success_url}&message=${response.message}&icon=${response.icon}`;

    if (donationItem)
      redirectUrl = `${req.protocol}://${req.get('host')}/#/stripe-checkout?su=${success_url}&di=${donationItem ? donationItem._id : ''}`;

    res.redirect(redirectUrl);

  }
  catch (ex) {
    logHelper.logError(` SponsorShipController: renewOrphanSponsorhsipInGracePeriod : `, ex);
  }



}

module.exports.retrieveStripeSubscription = async function (req, res) {

  try {

    let subId = req.query.subId ? req.query.subId : null;

    if (subId) {
      let subscription = await stripeAPIHelper.retrieveSubscription(subId);
      res.status(200).send(subscription);

    }

    res.status(400).send();

  } catch (ex) {
    logHelper.logError(` SponsorShipController: retrieveStripeSubscription : `, ex);
    res.status(400).send();
  }

}


module.exports.getCustomerDefaultPaymentMethod = async function (req, res) {

  let responseDTO = {
    isSuccess: false,
    paymentMethod: null,
  };
  try {
    let customerId = req.query.cusId ? req.query.cusId : null;
    if (customerId) {
      let customerObj = await stripeAPIHelper.getCustomer(customerId);
      if (customerObj) {
        let paymentMethodId = customerObj.invoice_settings.default_payment_method;
        if (paymentMethodId) {
          // get payment method object to retrieve card details 
          let paymentMethod = await stripeAPIHelper.retrievePaymentMethod(paymentMethodId);
          if (paymentMethod) {
            responseDTO.paymentMethod = paymentMethod;
            responseDTO.isSuccess = true;
          }
        }
      }
      res.status(200).send(responseDTO);
    }
    //res.status(400).send(responseDTO);
  } catch (ex) {
    logHelper.logError(` SponsorShipController: getCustomerDefaultPaymentMethod : `, ex);
    res.status(400).send(responseDTO);
  }

}





