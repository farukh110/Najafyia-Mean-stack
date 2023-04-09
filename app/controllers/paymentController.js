var DonationRecurrings = require('../models/donationRecurring');
var Donation = require('../models/donation.js');
var DonationDetail = require('../models/donationDetail');
let responseDTO = require('../models/custom/responseDTO');
var scheduleController = require('../controllers/scheduleController');
const paymentService = require('../services/paymentService');
const subsequentPaymentService = require('../services/subsequentPaymentService');
const Constants = require('../constants');
const logHelper = require('../utilities/logHelper');
const databaseHelper = require('../utilities/databaseHelper.js');
const FILE_NAME = "PAYMENT_CONTROLLER";
var genericHelper = require('../utilities/genericHelper');
module.exports.getStripePaymentHook = function (req, res) {
    console.log('payment hook called from stripe', req.body);
    res.status(200).send("Success")
}
module.exports.getPayment = function (req, res) {
    try {
        DonationRecurrings.findOne({ _id: req.query.donationId })
            .populate('donar')
            .populate('program')
            .exec(function (err, donation) {
                if (err) throw error;
                res.status(200).send(donation)
            });
    }
    catch (ex) {
        res.status(400).send(ex);
    }
}
module.exports.donationPaymentSave = function (req, res) {
    try {
        if (req.query.donationId) {
            DonationRecurrings.findOne({ _id: req.query.donationId })
                .populate('program')
                .populate('donar')
                .exec(function (drErr, donationRecurng) {
                    if (drErr) throw drErr;
                    let ndd = new Date(donationRecurng.nextDonationDate);

                    if (donationRecurng.program[0].programName == 'Higher Education Loans' ||
                        donationRecurng.program[0].programName == 'قرض التعليم العالي' ||
                        donationRecurng.program[0].programName == "Prêt pour l'enseignement supérieur") {
                        donationRecurng.nextDonationDate = new Date(ndd.setMonth(donationRecurng.nextDonationDate.getMonth() + 6));
                    } else {
                        donationRecurng.nextDonationDate = new Date(ndd.setMonth(donationRecurng.nextDonationDate.getMonth() + 1));
                    }
                    if (donationRecurng.noOfPaymentsRemaining <= 0) return res.status(400).send("All payments to this program has been done. Kindly renew your program.")
                    donationRecurng.noOfPaymentsRemaining = donationRecurng.noOfPaymentsRemaining - 1;
                    donationRecurng.updated = Date.now();
                    donationRecurng.save((err, drUpdate) => {
                        if (err) {
                            throw err;
                        }
                        else {
                            Donation.count(function (err, c) {
                                let invoiceNum = "inv" + c;//generate invoice number
                                //donation main
                                var donation = new Donation({
                                    invoiceNo: invoiceNum,
                                    donor: donationRecurng.donar[0],
                                    chargeId: req.query.chargeId,
                                    customerId: req.query.customerId,
                                    totalAmount: donationRecurng.amount,
                                    donationdetails: donationRecurng.donationDetails,
                                    isActive: true,
                                    created: Date.now(),
                                    updated: Date.now(),
                                    createdBy: donationRecurng.donar.donarName,
                                    updatedBy: 'NA'
                                });
                                donation.save(function (error, d) {
                                    if (error) {
                                        throw error;
                                    }
                                    else {
                                        //donation detail
                                        donation.donationdetails.push(donationRecurng.donationDetails)
                                        var donationDetail = new DonationDetail({
                                            amount: donationRecurng.amount,
                                            program: donationRecurng.program[0],
                                            donation: d,
                                            programSubCategory: donationRecurng.programSubCategory[0],
                                            isCampaign: false,
                                            chargeId: req.query.chargeid,
                                            isActive: true,
                                            isRecurring: false,
                                            created: Date.now(),
                                            updated: Date.now(),
                                            createdBy: donationRecurng.donar.donarName,
                                            updatedBy: 'NA'

                                        });
                                        donationDetail.save(function (err) {
                                            if (err) {
                                                throw err;
                                            }
                                            else {
                                                donationRecurng.language = req.query.language;
                                                scheduleController.sendEmailAndReciept(donationRecurng);
                                                res.status(200).send('Sent')

                                            }
                                        });
                                    }
                                });
                            });
                        }
                    });
                })

        }

    } catch (error) {
        res.status(400).send(error);
    }

}
module.exports.handlePayment = async function (req, res) {
    try {
        const { customerInfo, donationItem, paymentMethod } = req.body;
        responseDTO.data = await paymentService.createCustomerSubscriptions(paymentMethod, customerInfo, donationItem)
        responseDTO.isSuccess = true;
        return res.status(200).send(responseDTO);
    }
    catch (ex) {
        responseDTO.isSuccess = false;
        responseDTO.errorMessage = ex.message;
        res.status(500).send(responseDTO);
    }
}

module.exports.handleFailedPaymentRecharge = async function (req, res) {
    try {

        const { customerInfo, donationItem, paymentMethod,invoiceId,paymentIntent,subscriptionId } = req.body;
        responseDTO = await paymentService.chargeCustomerFailedInvoice(paymentMethod, customerInfo, donationItem,invoiceId,paymentIntent,subscriptionId)
        return res.status(200).send(responseDTO);
    }
    catch (ex) {
        responseDTO.isSuccess = false;
        responseDTO.errorMessage = ex.message;
        res.status(500).send(responseDTO);
    }
}




module.exports.stripeWebhookHandler = async function (req, res) {
    try {

        //log webhook event details into database
        let event = req.body;
      
        logHelper.logInfo(`${FILE_NAME}: stripeWebhookHandler : Webhook recieved`, event);

        await databaseHelper.insertItem(Constants.Database.Collections.STRIPE_WH_EV.dataKey, { eventType: event.type, eventData: event.data });

        //run logic based on event type
        switch (event.type) {
            case Constants.Stripe.Events.InvoicePaid:

                
                // update donor program last payment status, paymentschedules, track payment history
                    if(event.data.object.subscription && event.data.object.subscription != null ){
               await subsequentPaymentService.performInvoicePaid(event.data.object);
                    }


                break;
            case Constants.Stripe.Events.InvoicePaymentFailed:
                
                // update donor program last payment status, paymentschedules, track payment history
             
                if(event.data.object.subscription && event.data.object.subscription != null ){
                 await subsequentPaymentService.performInvoicePaymentFailed( event.data.object);
                }

                break;
            case Constants.Stripe.Events.CustomerSubscriptionUpdated:

                //subscription status => past_due, cancelled, unpaid
                //store/track subscription status into donor program

                //if past_due , store stripestatus
              await subsequentPaymentService.perfromCustomerSubscriptionUpdated( event.data.object);

                break;
            case Constants.Stripe.Events.CustomerSubscriptionCancelled:
                //if cancelled, mark donor program inactive, future payments as inactive, store stripestatus    

                await subsequentPaymentService.performCustomerSubscriptionCancelled( event.data.object);
 
                break;
            case Constants.Stripe.Events.InvoiceCreatedInDraft:
                await subsequentPaymentService.performComputationForDraftInvoices( event.data.object);
                break;
            default:
            // Unexpected event type
        }
        res.sendStatus(200);
    }
    catch (ex) {
        logHelper.logError(`${FILE_NAME}: stripeWebhookHandler : `, ex);
        res.status(500).send(ex);
    }
}







function encodeURL(unencoded) {
    return encodeURIComponent(unencoded).replace(/'/g, "%27").replace(/"/g, "%22");
}
module.exports.payFailedInvoice = async function (req, res) {
    try {
        
      const donarProgramId = req.query.dpd_id;
      if (donarProgramId) {
        
          req.session.isGuestUser = true;//allowing checkout page to be accessed as guest user

          const success_url = encodeURL(`${req.protocol}://${req.get('host')}/#/success-checkout/?donationId=${''}`);

          const redirectUrl = `${req.protocol}://${req.get('host')}/#/stripe-checkout-renewal?su=${success_url}&dpd_id=${donarProgramId}`;
          console.log(redirectUrl);
          res.redirect(redirectUrl);
      }
      else {
        throw new Error("Required parameters are missing")
      }
    }
    catch (err) {
      console.log(err);
      res.status(400).send(err.message);
    }
  }



  module.exports.correctSubsequentPaymentMissingData = async function (req, res) {
    try {
        
      const invoiceObj = req.body.invoiceObj;

      if (invoiceObj) {
        await subsequentPaymentService.correctSubsequentPaymentMissingData(invoiceObj);
        res.sendStatus(200);
      }
      else {
        throw new Error("Required parameters are missing")
      }
    }
    catch (err) {
      console.log(err);
      res.status(400).send(err.message);
    }
  }