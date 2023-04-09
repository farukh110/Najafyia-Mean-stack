var ObjectID = require('mongodb').ObjectID;
const stripeAPIHelper = require('../utilities/stripeAPIHelper');
var Donar = require('../models/donar.js');
var OrphanScholarship = require('../models/orphanScholarships.js');
var DonationRecurring = require('../models/donationRecurring.js');
var Orphan = require('../models/orphan.js');
var logHelper = require('../utilities/logHelper');
var Constants = require('../constants');
let methodName = '';
var dbHelper = require('../utilities/databaseHelper');
var dateHelper = require('../utilities/dateHelper');
module.exports.getOrphansRecurring = async function (req, res) {
    try {
        methodName = Constants.LogLiterals.GET_ORPHAN_RECURRING_METHOD;

        if (req.session.role && (req.session.role.indexOf("super admin") >= 0 || req.session.role.indexOf("admin") >= 0)) {
            let query = {
                orphan: { $exists: true },
                'orphan.language': req.query.language
            };
            let sortQ = { endDate: -1 };
            let resp = await dbHelper.getManyItems(DonationRecurring, query, {  additionalData : 0 , stageTransitionHistory : 0}, sortQ);
            if (resp) {
                const dnrs = await dbHelper.getManyItems(Donar, {}, { donarName: 1 });
                if (dnrs) {
                    //Populate donor:
                    for (j = 0; j < resp.length; j++) {
                        const found = dnrs.find(el => String(el._id) == String(resp[j].donar[0]));
                        if (found)
                            resp[j].donar[0] = found;
                    }
                }
                res.status(200).send(resp);
            }

        } else {
            Donar.findOne({ user: req.session._id }, function (err, donr) {
                if (donr) {
                    DonationRecurring.find({ orphan: { $exists: true }, donar: donr }).sort({ endDate: -1 })
                        .populate({ path: 'donationDuration', model: 'donationduration' })
                        .populate({ path: "donar", model: "donar" })
                        .exec(function (err, data) {
                            res.status(200).send(data);
                        });
                }
            })
        }
    }
    catch (exc) {
        logHelper.logErrorToFile(`${Constants.LogLiterals.MANAGE_ORPHAN_CONTROLLER}: ${methodName}: Error`, exc);
        res.status(500).send([]);
    }
}

module.exports.changeOrphan =async function (req, res) { // always (req.body[0]: new orphan & req.body[1]: donation recurring)
    try {
        methodName = Constants.LogLiterals.CHANGE_ORPHAN_METHOD;
        DonationRecurring.findOne({ 'orphan.orphanId': req.body[0].orphanId, freezed: false },async function (dErr, dRes) {
            if (dRes && dRes.orphan) {
                res.status(400).json("Orphan Already Occupied");
            } else {
                DonationRecurring.findOneAndUpdate({ _id: new ObjectID(req.body[1]._id) }, {
                    $set: {
                        isChanged: true,
                    }
                }, async function (err) {
                    if (err) {
                        throw err;
                    }
                    else {
                        let donationRecurringOld = await  dbHelper.getItem(Constants.Database.Collections.DON_REC.dataKey, { _id: req.body[1]._id });
                        await updateOrphanDataInDonorProgram(donationRecurringOld,req.body[1].orphan._id, req.body[0]);
                        var startDate = new Date(new Date().getFullYear(), new Date().getMonth() , 1); //  get first day of current month 
                        req.body[0]._id = ObjectID(req.body[0]._id);
                        req.body[1].donationDetails._id  = ObjectID(req.body[1].donationDetails._id);
                        req.body[1].donationDetails.donation._id= ObjectID(req.body[1].donationDetails.donation._id);

                        let donationRecurringNew = new DonationRecurring({
                            donationDetails: req.body[1].donationDetails,
                            program: req.body[1].program,
                            programSubCategory: req.body[1].programSubCategory,
                            donationDuration: req.body[1].donationDuration,
                            donar: req.body[1].donar,
                            customerId: req.body[1].customerId,
                            count: req.body[1].count,
                            nextDonationDate: req.body[1].nextDonationDate,
                            amount: req.body[1].amount,
                            isActive: true,
                            orphan: req.body[0] ,
                            endDate: req.body[1].endDate,
                            freezedDate: req.body[1].freezedDate,
                            startDate: startDate,
                            noOfPaymentsRemaining: req.body[1].noOfPaymentsRemaining,
                            changeRef: {
                                referenceId: new ObjectID(req.body[1]._id),
                                orphanName: req.body[1].orphan.orphanName,
                                startDate: req.body[1].startDate,
                                endDate: req.body[1].endDate,
                                nextDonationDate: req.body[1].nextDonationDate,
                                freezedDate: req.body[1].freezedDate,
                                orphanId:req.body[1].orphan.orphanId

                            },
                            stripeSubscriptionId : (donationRecurringOld && donationRecurringOld.stripeSubscriptionId ? donationRecurringOld.stripeSubscriptionId : ""),
                            additionalData : (donationRecurringOld && donationRecurringOld.additionalData ? donationRecurringOld.additionalData : null),
                            paymentSchedule : (donationRecurringOld && donationRecurringOld.paymentSchedule ? donationRecurringOld.paymentSchedule : null)
                        });
                        donationRecurringNew.save(function (err) {
                            if (err) {
                                throw err;
                            }
                            else {
                                OrphanScholarship.update({ donationdetails: req.body[1].donationDetails._id }, { $set: { isChanged: true, } }, (usErr, usRes) => {
                                    if (usErr) throw usErr;
                                    else {
                                        OrphanScholarship.findOne({ donationdetails: req.body[1].donationDetails._id, isChanged: true }, function (oldSpnsErr, oldSpns) {
                                            var orphanScholarshipNew = new OrphanScholarship({
                                                startDate: startDate.toISOString(),
                                                endDate: req.body[1].endDate,
                                                sponsorshipAmount: req.body[1].amount,
                                                orphans: [req.body[0]._id],
                                                donationdetails: [req.body[1].donationDetails._id],
                                                donar: req.body[1].donar,
                                                paymentDate: oldSpns.paymentDate,
                                            });
                                            orphanScholarshipNew.save(function (err) {
                                                if (err) {
                                                    throw err;
                                                }
                                                else {
                                                    res.status(200).send();
                                                }
                                            });
                                        })
                                    }
                                })
                            }
                        });
                    }
                })
            }
        });
    }
    catch (ex) {
        logHelper.logErrorToFile(`${Constants.LogLiterals.MANAGE_ORPHAN_CONTROLLER}: ${methodName}: Error`, ex);
        res.status(400).json(ex);
    }
}

module.exports.cancelOrphan = async function (req, res) {
    try {
        methodName = Constants.LogLiterals.CANCEL_ORPHAN_METHOD;

        let updateObj =  {
            freezedDate: new Date(),
            freezed: true,
            isActive: false,
            isDeleted:true,
            comment:'Cancelled from admin portal , might have been changed, as of ' +dateHelper.getDateNow(true)

        };

        let setCancel = req.body.setCancel ? true : false ;

        if(setCancel){
            updateObj.isCancelled = true;

            // update all donation recurring to be cancelled 

            let donationRecurrings = await dbHelper.getItems(Constants.Database.Collections.DON_REC.dataKey,{ "donationDetails._id" : ObjectID(req.body.donationDetails._id) },{orphan:1,donationDetails:1,_id:1});
            if(donationRecurrings && donationRecurrings.length > 0)
            {
                for(let j = 0 ; j < donationRecurrings.length ;j++ )
                {
                    if(donationRecurrings[j]._id != req.body._id ){
                      let updatedDonRec =   await dbHelper.updateItem(Constants.Database.Collections.DON_REC.dataKey,{_id : donationRecurrings[j]._id},updateObj);

                      if(updatedDonRec){

                        let updatePayload = {  isCancelled: true ,isActive : false}

                           await dbHelper.updateItem(Constants.Database.Collections.ORPN.dataKey,{orphanId: donationRecurrings[j].orphan.orphanId},updatePayload)
                      }
                    }
                }

                if(req.body.stripeSubscriptionId){
                    const response = await stripeAPIHelper.cancelSubscription(req.body.stripeSubscriptionId);
                }
            }
            // update all orphan 
             // check if stripe id existsts ? then send for cacnellation to stripe method 
        }
      


        
        DonationRecurring.findOneAndUpdate({ _id: req.body._id }, {
            $set: updateObj
        }).populate({
            path: 'donar', populate: {
                path: 'user'
            }
        }).exec(function (err, data) {
            if (err) {
                console.log(err);
            }
            else {
                var priority;
                Orphan.findOne({}).sort({ priority: -1 }).limit(1).exec(function (err, orphan) {
                    priority = orphan.priority + 1;
                    let updatePayload = { priority: priority, isCancelled: true }
                    if(!setCancel){
                        updatePayload.isActive = false;
                    }
                    Orphan.update(
                        { orphanId: req.body.orphan.orphanId },
                        { $set: updatePayload },
                        { multi: true },
                        function (err, succ) {
                            if (err) {
                                throw err;
                            }
                        });
                    res.status(200).send();
                });

            }
        });
    }
    catch (exc) {
        logHelper.logErrorToFile(`${Constants.LogLiterals.MANAGE_ORPHAN_CONTROLLER}: ${methodName}: Error`, exc);
    }
}

module.exports.updateSponsorship = async function (req, res) {
    try {
        methodName = Constants.LogLiterals.UPDATE_SPONSORSHIP_METHOD;
        const today = new Date();
        const edate = dateHelper.createUTCDate(req.body.endDate);
        let respDR = await dbHelper.updateItem(DonationRecurring,
            {
                _id: req.body._id
            },
            {
                updated: today,
                endDate: edate
            });

        if (respDR) {
            let respOS = await dbHelper.updateItem(OrphanScholarship,
                {
                    donationdetails: req.body.donationDetails._id
                },
                {
                    endDate: edate,
                    updated: today
                });

            if (respOS)
                res.status(200).json("Sponsorship updated Successfully");
            else
                res.status(500).send(respOS);
        }
        else {
            res.status(500).send(respDR);
        }
    }
    catch (ex) {
        logHelper.logErrorToFile(`${Constants.LogLiterals.MANAGE_ORPHAN_CONTROLLER}: ${methodName}: Error`, ex);
        res.status(500).json(ex);
    }
}

async function updateOrphanDataInDonorProgram(donationRecurring, oldOrphanID ,newOrphan){
    const methodName = 'updateOrphanDataInDonorProgram';
    try{
        if(donationRecurring && donationRecurring.stripeSubscriptionId)
        {
            var oldOrphanIndex = -1;
            let donorProgram = await  dbHelper.getItem(Constants.Database.Collections.DON_PRG.dataKey, { stripeSubscriptionId: donationRecurring.stripeSubscriptionId, "program.programDetails.slug" : Constants.ProgramSlugs.orphanSponsorship }); 

            if(donorProgram && donorProgram.program && donorProgram.program.programDetails && donorProgram.program.programDetails.additionalMetaData && donorProgram.program.programDetails.additionalMetaData.value)
            {
                let orphanList = donorProgram.program.programDetails.additionalMetaData.value;

                oldOrphanIndex = orphanList.findIndex(x => x._id == oldOrphanID);

                // If old orphan is present in the list then update with new orphan
                if(oldOrphanIndex != -1)
                {
                    orphanList[oldOrphanIndex] = newOrphan;
                    let updatedDonorProgram = await  dbHelper.updateItem(Constants.Database.Collections.DON_PRG.dataKey, { _id : donorProgram._id }, {"program.programDetails.additionalMetaData.value" : orphanList});
                    
                    logHelper.logInfo(`${Constants.LogLiterals.MANAGE_ORPHAN_CONTROLLER}: ${methodName}: Updated orphan list : `, updatedDonorProgram.program.programDetails.additionalMetaData.value);
                }
            }
        }
    }
    catch(error)
    {
        logHelper.logError(`${Constants.LogLiterals.MANAGE_ORPHAN_CONTROLLER}: ${methodName}: Error`, error);
    }
}