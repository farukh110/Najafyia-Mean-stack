/* Import constants and helper functions */
const logHelper = require('../utilities/logHelper');
const stripeAPIHelper = require('../utilities/stripeAPIHelper')
const databaseHelper = require('../utilities/databaseHelper');
const configuration = require('../../config/configuration');
const constants = require('../constants');
const dateHelper = require('../utilities/dateHelper');
var FILE_NAME = "PAYMENT_SERVICE";
const pdfHelper = require('../utilities/pdfHelper');
const genericHelper = require('../utilities/genericHelper');
var ObjectID = require('mongodb').ObjectID;
var tokens = require('../tokenData');
var arabicDigit = require('arabic-digits');
var emailService = require('../services/emailService.js');
var fs = require('fs');
module.exports = {
    createCustomerSubscriptions,
    sendEmailWithReciept,
    onPaymentSucceeded,
    getInvoiceNumber,
    getDonorCountry,
    chargeCustomerFailedInvoice,
    insertOrphanDataInReceipt,
    renewOrphanSponsorshipWithoutPayment,
    getAdditionalMetaInfo,
    getNumberOfMonthsByProgram,
    insertDonorProgram,
    recieptNumberGenerator,
    handleSubscriptionOnStripe,
    payDraftInvoices,
    getItemPrice,
    addProgramMetadata,
    resumeStripeSubscription,
    pauseStripeSubscription,
    setCustomerDefaultPaymentMethod
};
//#region custom checkout flow start
function getItemPrice(item) {
    const price_data = {
        currency: item.currency.title.toLowerCase() || 'usd',
        product: item.isRecurringProgram ? configuration.payment.stripeRecurringProductId : configuration.payment.stripeOneTimeProductId,
        unit_amount: item.totalAmount / (item.count || 1) * 100,
    };
    if (item.isRecurringProgram) {
        if (item.paymentPlan && item.paymentPlan.billingDetail) {
            price_data.recurring = {
                interval: item.paymentPlan.billingDetail.interval || "month",
                interval_count: item.paymentPlan.billingDetail.interval_count || 1
            };
        }
        else {
            price_data.recurring = {
                interval: "month",
                interval_count: 1
            };
        }
    }
    return {
        price_data,
        quantity: item.count || 1
    }
}
function getItemName(item) {
    const programName = item.program && item.program.programName;
    const subCat = item.programSubCategory && item.programSubCategory.programSubCategoryName || "";
    return `${programName} ${subCat}`;
}
function addProgramMetadata(itemNo, item, metadataObject) {
    const desc = `(${item.count || 1})` + `(${item.program.programName})` + 'x' + `(${item.currency.symbol})` + `(${item.totalAmount})`;
    let keyPrefix = "";
    if (itemNo > 0) {
        keyPrefix = `Item#${itemNo} `;
    }
    metadataObject[`${keyPrefix}Name`] = getItemName(item);
    metadataObject[`${keyPrefix}Description`] = desc;
    return metadataObject;
}
function getCustomerSubscriptionsByDonationItem(customerId, paymentMethodId, donationItem) {
    let subscriptions = [];
    let nonRecurringPrograms = [];
    let subscriptionMetadata = {}
    let cartItems = donationItem.body.items;
    cartItems.map((cItem, index) => {
        try {
            if (cItem.isRecurringProgram) {
                //create subscription for it
                let subsData = {
                    customer: customerId,
                    items: [getItemPrice(cItem)],
                    expand: ["latest_invoice.payment_intent"],
                    default_payment_method: paymentMethodId,
                }
                let startDate = new Date().toUTCString();
                if (donationItem.body.stripeSubscriptionStartDate) {

                    if (new Date(donationItem.body.stripeSubscriptionStartDate) <= new Date(dateHelper.getDateNow(true))) {
                        let itemIndex = donationItem.body.items.findIndex(cItem => cItem.program.slug == constants.ProgramSlugs.orphanSponsorship);
                        if (donationItem.body.items[itemIndex].paymentPlan.Name == constants.PaymentPlans.MONTHLY) {
                            subsData.billing_cycle_anchor = dateHelper.convertDateToUnix(dateHelper.addMonthsInDate(donationItem.body.stripeSubscriptionStartDate, donationItem.body.noOfInstallments, true));
                        } else {
                            subsData.billing_cycle_anchor = dateHelper.convertDateToUnix(dateHelper.addInDate(donationItem.body.stripeSubscriptionStartDate, 1, constants.DateUnit.Years, true));
                        }
                        subsData.backdate_start_date = dateHelper.convertDateToUnix(donationItem.body.stripeSubscriptionStartDate);
                        startDate = new Date(donationItem.body.stripeSubscriptionStartDate).toUTCString();
                    }
                }
                //calculate subscription end date
                let durationInNoOfMonths = 12;//default one year
                if (cItem.donationProcess
                    && cItem.donationProcess.length > 0
                    && cItem.donationProcess[0].subscriptionDetail
                    && cItem.donationProcess[0].subscriptionDetail.duration)
                    durationInNoOfMonths = cItem.donationProcess[0].subscriptionDetail.duration.noOfMonths;
                let endDate = dateHelper.addMonthsInDate(startDate, durationInNoOfMonths, false, "X");
                cItem.stripeDetail = {};
                cItem.stripeDetail.stripeEndDate = endDate;
                // if (!cItem.isAutoRenew) {
                //     subsData.cancel_at = endDate;
                // }
                subscriptionMetadata = addProgramMetadata(subscriptions.length == 0 ? 1 : 0, cItem, subscriptionMetadata);
                subsData.metadata = subscriptionMetadata;
                cItem.subsIndex = subscriptions.length;
                subscriptions.push({ subscriptionPayload: subsData, cartItem: cItem });
            }
            else {
                //normal product
                cItem.subsIndex = 0;//normal cart item will always be assigned to first subscription 
                nonRecurringPrograms.push(getItemPrice(cItem));
                subscriptionMetadata = addProgramMetadata(nonRecurringPrograms.length + 1, cItem, subscriptionMetadata);
            }
        } catch (err) {
            logHelper.logError(`${FILE_NAME}: getCustomerSubscriptionsByDonationItem: `, err);
        }
    });
    if (subscriptions.length > 0 && nonRecurringPrograms && nonRecurringPrograms.length > 0) {
        //cart having non recurring programs as well, merge them with first subscription
        subscriptions[0].subscriptionPayload.add_invoice_items = nonRecurringPrograms;
        subscriptions[0].subscriptionPayload.metadata = subscriptionMetadata;
    }
    return subscriptions;
}
async function getStripeCustomer(donationItem) {
    try {
        let customerId = donationItem.body.donar ? donationItem.body.donar.customerId : "";
        if (donationItem.body.donar.stripeCustomerIds) {
            //if multiple customers exist for each currency over stripe then get customer which matches current currency to charge
            let currencyCustomer = donationItem.body.donar.stripeCustomerIds.find(x => x.currency.toLowerCase() == donationItem.body.paymentTitle.toLowerCase())
            if (currencyCustomer) {
                customerId = currencyCustomer.customerId
            }
        }
        if (customerId)
            return await stripeAPIHelper.getCustomer(
                customerId
            );
    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: getStripeCustomer: Error in getting and creating customer`, err);
    }
    return null;
}
async function getOrCreateCustomer(paymentMethod, customerInfo, donationItem) {

    const paymentMethodId = paymentMethod;
    let customer = await getStripeCustomer(donationItem);
    let attached = false;
    try {
        if (customer && (!customer.currency ||
            (customer.currency && donationItem.body.paymentTitle
                && customer.currency.toLowerCase() === donationItem.body.paymentTitle.toLowerCase()))) {

            let attachResp = await stripeAPIHelper.attachPaymentMethod(paymentMethodId, customer.id);
            if (attachResp) {
                attached = true;
                //set default payment method
                customer = await stripeAPIHelper.updateCustomer(
                    customer.id,
                    {
                        name: customerInfo.name,
                        //payment_method: paymentMethodId,
                        invoice_settings: {
                            default_payment_method: paymentMethodId,
                        }
                    }
                );
            }
        }
        else if (customerInfo.email && customerInfo.name) {
            //create customer if doesn't exist
            /* Create customer and set default payment method */
            customer = await stripeAPIHelper.createCustomer({
                payment_method: paymentMethodId,
                email: customerInfo.email,
                name: customerInfo.name,
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                },
            });
            if (customer)
                //update customer Id in donor database table
                if (!donationItem.body.donar.stripeCustomerIds)
                    donationItem.body.donar.stripeCustomerIds = [];
            donationItem.body.donar.stripeCustomerIds.push({ "currency": donationItem.body.paymentTitle, "customerId": customer.id })
            await databaseHelper.updateItem(constants.Database.Collections.DONR.dataKey, { _id: donationItem.body.donar._id }, { stripeCustomerIds: donationItem.body.donar.stripeCustomerIds, "customerId": customer.id });
            //update donation item as well
            await databaseHelper.updateItem(constants.Database.Collections.DON_ITEM.dataKey, { _id: donationItem._id }, { "body.donar.customerId": customer.id });

            if (!attached)
                await stripeAPIHelper.attachPaymentMethod(paymentMethodId, customer.id)
        }
    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: getOrCreateCustomer: Error in getting and creating customer`, err);
        return null;
    }
    return customer;
}
async function createCustomerSubscriptions(paymentMethod, customerInfo, donationItem) {
    let customerSubscriptions = [];
    let customer;
    try {
        donationItem = await databaseHelper.getItem(constants.Database.Collections.DON_ITEM.dataKey, {
            "_id": donationItem._id
        }, {
            "body.donar": 1,
            "body.items": 1,
            "body.noOfInstallments": 1,
            "body.stripeSubscriptionStartDate": 1,
            "body.paymentTitle": 1
        });

        //TODOKH: get payment method for customer if exists and use that for payment if its not different 
        //don't proceed if donation item has subscription details already --- may be don't restrict it 

        paymentMethodId = paymentMethod.id ? paymentMethod.id : paymentMethod;
        customer = await getOrCreateCustomer(paymentMethodId, customerInfo, donationItem);
        //create subscriptions if customer exists
        if (customer) {
            /* Create subscription and expand the latest invoice's Payment Intent 
             * We'll check this Payment Intent's status to determine if this payment needs SCA
             */
            //attach payment method to customer
            // const attachResponse =   await stripeAPIHelper.attachPaymentMethod(paymentMethodId, customer.id);
            // if (attachResponse && customer) {
            let subscriptions = getCustomerSubscriptionsByDonationItem(customer.id, paymentMethodId, donationItem);
            if (subscriptions) {
                for (let i = 0; i < subscriptions.length; i++) {
                    const subsData = subscriptions[i].subscriptionPayload;
                    try {
                        const subscription = await stripeAPIHelper.createSubscription(subsData);
                        customerSubscriptions.push({ isSuccess: true, subscription: subscription });
                    }
                    catch (err) {
                        logHelper.logError(`${FILE_NAME}: CreateCustomerSubscriptions: Error in creating customer subscription`, subsData, err);
                        customerSubscriptions.push({ isSuccess: false, subscription: null, error: err });
                    }
                }
            }
            //}

            //update donation items for payment intent and subscription ids
            updateSuscriptionDetailsInDonationItem(donationItem, customerSubscriptions);
        }
    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: CreateCustomerSubscriptions: Error in creating customer subscriptions`, customerInfo, err);
        customerSubscriptions.push({ isSuccess: false, subscription: null, error: err })
    }
    return customerSubscriptions;
}
function updateSuscriptionDetailsInDonationItem(donationItem, customerSubscriptions) {
    try {
        let cartItems = donationItem.body.items;
        cartItems.map((cItem, index) => {
            let createdSubscription;
            if (cItem.isRecurringProgram) {
                createdSubscription = customerSubscriptions[cItem.subsIndex || 0].subscription;
            }
            else {
                //else get first subscription because non-recurring items are added as invoice items of first subscription
                createdSubscription = customerSubscriptions[0].subscription;
            }
            if (createdSubscription) {
                if (!cItem.stripeDetail)
                    cItem.stripeDetail = {};
                const {
                    id,
                    cancel_at,
                    start_date,
                    status,
                    latest_invoice
                } = createdSubscription
                cItem.stripeDetail.subscription = {
                    id: id,
                    cancel_at: cancel_at,
                    start_date: start_date,
                    status: status
                };
                cItem.stripeDetail.invoice = {
                    id: latest_invoice.id,
                    status: latest_invoice.status,
                    hosted_invoice_url: latest_invoice.hosted_invoice_url
                };
                cItem.stripeDetail.payment_intent = {
                    id: latest_invoice.payment_intent.id,
                    status: latest_invoice.payment_intent.status
                };
            }
        });
        if (customerSubscriptions.some(x => x.subscription != null)) {
            //overwriting items with created subscriptions details
            databaseHelper.updateItem(constants.Database.Collections.DON_ITEM.dataKey, { _id: donationItem._id }, { "body.items": cartItems });
        }
    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: updateSuscriptionDetailsInDonationItem: Error in updating donation item subscriptions: ${donationItem._id}`, err);
    }
}




//#endregion custom checkout flow end

//#region custom to charge failed invocie 
async function chargeCustomerFailedInvoice(paymentMethod, customerInfo, donationItem, invoiceId, paymentIntent, stripeSubscriptionId) {

    let responseDTO = {
        isSuccess: false,
        data: {},
        errorMessage: ""
    }
    let customer;
    try {
        //TODOKH: get payment method for customer if exists and use that for payment if its not different 
        //don't proceed if donation item has subscription details already --- may be don't restrict it 
        paymentMethodId = paymentMethod.id ? paymentMethod.id : paymentMethod;
        customer = await getOrCreateCustomer(paymentMethodId, customerInfo, donationItem);
        if (customer) {
            //attach payment method to customer
            //const attachResponse = await stripeAPIHelper.attachPaymentMethod(paymentMethodId, customer.id );
            // if (attachResponse) {

            let subscriptionUpdateOptionObj = { default_payment_method: paymentMethodId };
            const updatedSubscription = await stripeAPIHelper.updateSubscription(stripeSubscriptionId, subscriptionUpdateOptionObj);

            if (updatedSubscription) {

                let paremeter = { payment_method: paymentMethodId };
                const paid_Invoice = await stripeAPIHelper.payInvoice(invoiceId, paremeter);


                if (!paid_Invoice.object && paid_Invoice.object != constants.Stripe.Objects.Invoice) {

                    if (paid_Invoice.raw.code == constants.Stripe.Actions.InvoicePaymentIntentRequiresAction) {

                        const payment_Intent_Obj = await stripeAPIHelper.retrievePaymentIntent(paymentIntent);
                        if (payment_Intent_Obj) {
                            responseDTO.isSuccess = false;
                            responseDTO.data.status = paid_Invoice.raw.code;
                            responseDTO.data.clientSecret = payment_Intent_Obj.client_secret;
                            responseDTO.errorMessage = paid_Invoice.raw.message;
                        }
                    }

                    else {
                        responseDTO.isSuccess = false;
                        responseDTO.data.status = paid_Invoice.raw.code ? paid_Invoice.raw.code : paid_Invoice.statusCode;
                        responseDTO.data.clientSecret = null;
                        responseDTO.errorMessage = paid_Invoice.raw.message;
                    }
                }
                else {
                    responseDTO.isSuccess = true;
                    responseDTO.data = {};
                }


            }
            //}

        }
    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: chargeCustomerFailedInvoice: Error in charging customer payment`, customerInfo, err);

    }
    return responseDTO;
}

//#endregion custom to charge failed invocie 

//#region Successful payment Email start
async function sendEmailWithReciept(donationItemOrId, invoiceNumber, paymentDate, donation, installmentNumber, totalInstallments, emailTemplateName, installmentDate) {
    const methodName = constants.LogLiterals.SEND_EMAIL_WITH_RECIEPT_METHOD;
    var donationItemObject;
    var createPDF;
    var khumsAmount = 0;
    var fileAttachment = [];
    var showKhumsContent = true;
    try {
        if (typeof (donationItemOrId) == "string")
            donationItemObject = await getDonationItem(donationItemOrId);
        else
            donationItemObject = donationItemOrId;

        if (donationItemObject) {
            logHelper.logInfo(`${FILE_NAME}: ${methodName}`, donationItemObject.body);

            createPDF = donationItemObject.body.items.some(obj => obj.program.programName != 'Khums' && obj.program.programName != 'الخمس');

            if (createPDF) {
                let khumsprograms = donationItemObject.body.items.filter(obj => obj.program.programName == 'Khums' || obj.program.programName == 'الخمس');
                if (khumsprograms.length) {
                    khumsAmount = khumsprograms.reduce((total, num) => {
                        return Number(total) + Number(num.totalAmount);
                    }, 0);
                }
                donationItemObject.body.items = donationItemObject.body.items.filter(obj => obj.program.programName != 'Khums' && obj.program.programName != 'الخمس')

                var pdfFileName = 'Reciept-' + donationItemObject.body.selectedLang + '-' + invoiceNumber + '.pdf';
                fileAttachment = await pdfGenerationForEmail(donationItemObject.body, constants.pdfTemplates.PAYMENT_INVOICE, pdfFileName, khumsAmount, invoiceNumber, paymentDate, installmentNumber, totalInstallments, installmentDate);

                showKhumsContent = false;
            }

            var emailResponse = await sendEmail(donationItemObject.body, emailTemplateName, fileAttachment, showKhumsContent, installmentNumber, totalInstallments, installmentDate);

            await updateEmailResponseInDonation(donation._id, emailResponse);

        }
    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: ${methodName}: Error : Error occured while sending email.`, err);
    }
}

//#region Database Operation functions
async function getDonationItem(donationItemId) {
    return await databaseHelper.getItem(constants.Database.Collections.DON_ITEM.dataKey, { _id: donationItemId });
}

async function getPDFTemplate(templateName) {
    return await databaseHelper.getSingleItem(constants.Database.Collections.PDF_TEMP.dataKey, { name: templateName });
}

async function updateEmailResponseInDonation(id, emailResponse) {
    return await databaseHelper.updateItem(constants.Database.Collections.DONATN.dataKey, { _id: id }, { emailResponse: emailResponse });
}

//#endregion

//#region PDF Creation
async function pdfGenerationForEmail(donationItem, pdfTemplate, pdfFileName, khumsAmount, invoiceNumber, paymentDate, installmentNumber, totalInstallments, installmentDate) {
    const methodName = 'pdfGenerationForEmail';
    let pdfTemplateObject;
    let fileAttachmentForEmail = [];
    let orphanIds;
    let orphans;
    let dynamicFields = [];
    let cartItems = getCartItems(donationItem.items, donationItem.selectedLang == constants.Languages.Arabic.code, donationItem.selectedLang, installmentNumber, totalInstallments, installmentDate);
    try {
        var currentDate = donationItem.selectedLang == constants.Languages.Arabic.code ?
            dateHelper.getDateInSpecificFormat(paymentDate, false, 'LL', constants.Languages.Arabic.locale) :
            donationItem.selectedLang == constants.Languages.French.code ?
                dateHelper.getDateInSpecificFormat(paymentDate, false, 'LL', constants.Languages.French.locale) :
                dateHelper.getDateInSpecificFormat(paymentDate, false, 'DD-MMM-YYYY', constants.Languages.English.locale);

        //Dynamic fields creation
        addObjectInDynamicFieldList(dynamicFields, tokens.common.DATE, currentDate);
        addObjectInDynamicFieldList(dynamicFields, tokens.pdfTemplate.CART_ITEMS, cartItems);
        addObjectInDynamicFieldList(dynamicFields, tokens.pdfTemplate.TOTAL_AMOUNT, donationItem.selectedLang == constants.Languages.Arabic.code ? `${donationItem.items[0].currency.symbol} ${arabicDigit.toArabic(parseInt(donationItem.amount - khumsAmount).toFixed(2), false)}` : `${donationItem.items[0].currency.symbol} ${parseInt(donationItem.amount - khumsAmount).toFixed(2)}`);
        addObjectInDynamicFieldList(dynamicFields, tokens.pdfTemplate.CURRENCY_SYMBOL, donationItem.items[0].currency.symbol);
        addObjectInDynamicFieldList(dynamicFields, tokens.common.DONOR_NAME, capitalize(donationItem.donar.donarName));
        addObjectInDynamicFieldList(dynamicFields, tokens.pdfTemplate.INVOICE_NUMBER, invoiceNumber);

        pdfTemplateObject = await getPDFTemplate(`${pdfTemplate}_${donationItem.selectedLang}`);

        var options = {
            header: pdfTemplateObject.header,
            footer: pdfTemplateObject.footer,
            format: pdfTemplateObject.format,
            timeout: pdfTemplateObject.timeout
        }

        if (donationItem.items != undefined) {
            orphanIds = donationItem.items.map(i => i.orphans) || [];
            if (orphanIds && orphanIds.length > 0) {
                orphans = await databaseHelper.getManyItems(constants.Database.Collections.ORPN.dataKey, {
                    _id: {
                        $in: flatten(orphanIds)
                    }
                });
                if (orphans && orphans.length) {
                    addObjectInDynamicFieldList(dynamicFields, tokens.pdfTemplate.ORPHANS_LIST, insertOrphanDataInReceipt(orphans, donationItem.selectedLang, true));
                }
                else {
                    addObjectInDynamicFieldList(dynamicFields, tokens.pdfTemplate.ORPHANS_LIST, '');
                }
            }
            else {
                addObjectInDynamicFieldList(dynamicFields, tokens.pdfTemplate.ORPHANS_LIST, '');
            }
        }

        var pdfHtml = genericHelper.setDynamicValuesInHtmlBody(pdfTemplateObject.body, dynamicFields);
        var pdfBuffer = await pdfHelper.createPDFBufferFromHTML(pdfHtml, options);

        if (pdfBuffer != undefined && pdfBuffer.length > 0) {
            fileAttachmentForEmail.push({
                fileName: pdfFileName,
                buffer: pdfBuffer
            });
        }

        fs.writeFile('./public/pdf/' + pdfFileName, pdfBuffer, function (err) {
            if (err) {
                logHelper.logError(`${FILE_NAME}: ${methodName}: Error : PDF file either not saved or corrupted file saved.`, err);
            } else {
            }
        });

        return fileAttachmentForEmail;

    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: ${methodName}: Error : Error occured while creating PDF.`, err);
    }
}

function insertOrphanDataInReceipt(orphans, lang, showHeading) {
    let row = '';
    let heading = 'Orphan Details';
    let floatHeading = 'left';
    let gender = '';
    let descent = '';
    let tdStyle = `"padding: 5px; text-align: center; font-family: helvetica;border:1px solid #000000; border-top:none !important;${!showHeading ? "font-size: 11px" : ""}"`;

    for (let i = 0; i < orphans.length; i++) {
        const currentDate = new Date(orphans[i].dateOfBirth);
        gender = orphans[i].gender;
        descent = orphans[i].descent;

        let rowValues
        // if (showHeading) {
        //     rowValues = [i + 1, orphans[i].orphanId, orphans[i].orphanName];
        // }
        // else {
        rowValues = [i + 1, orphans[i].orphanId, orphans[i].orphanName, dateHelper.getDateInSpecificFormat(currentDate, false, 'DD-MMM-YYYY', constants.Languages.English.locale), descent, gender, orphans[i].city];
        // }

        if (lang === constants.Languages.Arabic.code) {
            gender = gender === constants.GenderTypes.ENG.female ? constants.GenderTypes.ARB.female : constants.GenderTypes.ARB.male;
            descent = descent === constants.DescentTypes.ENG.syed ? constants.DescentTypes.ARB.syed : constants.DescentTypes.ARB.nonSyed;

            rowValues[0] = arabicDigit.toArabic(i + 1, false);
            rowValues[1] = arabicDigit.toArabic(orphans[i].orphanId, false);

            //if (!showHeading) {
            rowValues[3] = dateHelper.getDateInSpecificFormat(currentDate, false, 'LL', constants.Languages.Arabic.locale);
            rowValues[4] = descent;
            rowValues[5] = gender;
            rowValues = rowValues.reverse();//reverse order for RTL lang
            // }
            row += getRowContent(tdStyle, rowValues)
        }
        else if (lang === constants.Languages.French.code) {
            gender = gender === constants.GenderTypes.ENG.female ? constants.GenderTypes.FRN.female : constants.GenderTypes.FRN.male;
            descent = descent === constants.DescentTypes.ENG.syed ? constants.DescentTypes.FRN.syed : constants.DescentTypes.FRN.nonSyed;

            //if (!showHeading) {
            rowValues[3] = dateHelper.getDateInSpecificFormat(currentDate, false, 'LL', constants.Languages.French.locale);
            rowValues[4] = descent;
            rowValues[5] = gender;
            // }
            row += getRowContent(tdStyle, rowValues);
        }
        else {
            row += getRowContent(tdStyle, rowValues);
        }
    }
    if (lang === constants.Languages.Arabic.code) {
        heading = 'تفاصيل اليتيم';
        floatHeading = 'right';
    }
    else if (lang === constants.Languages.French.code) heading = 'Détails orphelins';
    if (showHeading) {
        return `
        <div>
            <h2 style="font-family: helvetica;float:${floatHeading}">${heading}</h2>
            <table style="font-family: helvetica;border-collapse: collapse;border:solid 1px #000000;margin-top: 20px; width: 100%;" border="1">
                ${createOrphanHeaders(lang, showHeading)}
                <tbody>${row}</tbody>
            </table>
        </div>
            `;
    }
    else {
        return `
        <div>
        <table style="font-family: helvetica;border-collapse: collapse;border:solid 1px #000000;margin-top: 20px; width: 100%;" border="1">
                ${createOrphanHeaders(lang, showHeading)}
                <tbody>${row}</tbody>
            </table>
        </div>
            `;
    }
}

function createOrphanHeaders(lang, showHeading) {
    let styles;
    if (!showHeading) {
        styles = 'padding: 5px; text-align: center; font-family: helvetica;border:1px solid #000000; border-top:none !important; font-size: 11px';
    }
    else {
        styles = 'padding: 5px; text-align: center; font-family: helvetica;border:1px solid #000000; border-top:none !important;';
    }

    let headers = `
    <thead>
        <th style="${styles}">Sno.</th>
        <th style="${styles}">Id</th>
        <th style="${styles}">Name</th>
        <th style="${styles}">Birthday</th>
        <th style="${styles}">Descent</th>
        <th style="${styles}">Gender</th>
        <th style="${styles}">City</th>
        
    </thead>`;
    if (lang === constants.Languages.French.code) {
        headers = `
        <thead>
            <th style="${styles}">No.</th>
            <th style="${styles}">Identifiant</th>
            <th style="${styles}">Nom complet</th>
            <th style="${styles}">Date de naissance</th>
            <th style="${styles}">Descendance</th>
            <th style="${styles}">Sexe</th>
            <th style="${styles}">Ville</th>
        </thead>`
    } else if (lang === constants.Languages.Arabic.code) {
        headers = `
        <thead>
        <th style="${styles}">المدينة</th>
        <th style="${styles}">الجنس</th>
        <th style="${styles}">النسب</th>
        <th style="${styles}">تاريخ الولادة</th>
        <th style="${styles}">الإسم</th>
        <th style="${styles}">هوية اليتيم</th>
        <th style="${styles}">سنو</th>
        </thead>`
    }
    return headers;
}

function addObjectInDynamicFieldList(dynamicFields, field, value) {
    dynamicFields.push({
        field: field,
        value: value
    });
}

function getCartItems(items, isArabic, lang, installmentNumber, totalInstallments, installmentDate) {
    let cartItems = '';
    const tdStyle = '"height:64px;padding:10px;text-align:center;font-family: helvetica;color:grey"';
    if (items && items.length) {
        for (let i = 0; i < items.length; i++) {
            let programName = getProgramNameWithSubCategory(items[i], lang, installmentNumber, totalInstallments, installmentDate);
            const quantity = items[i].count || '-';
            let rowValues = [
                isArabic ? arabicDigit.toArabic(i + 1, false) : i + 1,
                programName,
                isArabic ? arabicDigit.toArabic(quantity, false) : quantity,
                isArabic ? `${arabicDigit.toArabic(items[i].totalAmount, false)} ${items[i].currency.symbol}` : `${items[i].currency.symbol} ${items[i].totalAmount}`
            ];
            rowValues = isArabic ? rowValues.reverse() : rowValues;
            cartItems += getRowContent(tdStyle, rowValues);
        }
    }
    return cartItems;
}
//#endregion

//#region Generic methods
function capitalize(string) {
    if (string && string.length) {
        return string.split(" ").map(str => str.charAt(0).toUpperCase() + str.slice(1)).join(" ");
    } else return "";
}

function flatten(arr) {
    return arr.reduce(function (flat, toFlatten) {
        return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
}

function getRowContent(tdStyle, rowValues) {
    let row = `<tr>`;
    rowValues.map(function (tdVal) {
        row += `<td style=${tdStyle}>${tdVal}</td>`
    })
    row += `</tr>`;
    return row;
}

async function sendEmail(donationItem, templateName, fileAttachment, showKhumsContent, installmentNo, totalInstallments, installmentDate) {
    var dynamicFields = [];
    const methodName = "sendEmail"

    try {

        dynamicFields.push({
            keyName: tokens.common.DONOR_NAME,
            value: donationItem.donar.donarName
        });
        let installmentText = null;
        if (donationItem.items && donationItem.items[0].paymentPlan && donationItem.items[0].paymentPlan.Name == constants.PaymentPlans.MONTHLY) {
            const donationProcess = donationItem.items[0].program.donationProcess[0];
            const subscriptionDetail = donationProcess ? donationProcess.subscriptionDetail : null;
            let isLifeTimeSubscription = subscriptionDetail && subscriptionDetail.duration && subscriptionDetail.duration.name == constants.SubscriptionDuration.LIFETIME;
            installmentText = getInstallmentTextNumeric(donationItem.selectedLang, installmentNo, totalInstallments, installmentDate, isLifeTimeSubscription);
        }
        dynamicFields.push({
            keyName: tokens.installments.INSTALLMENT,
            value: installmentText || 'N/A'
        });

        dynamicFields.push({
            keyName: tokens.common.ISVISIBLE + '_' + tokens.emailTemplate.KHUMS_CONTENT,
            value: showKhumsContent
        });

        dynamicFields.push({
            keyName: tokens.emailTemplate.PROGRAM_NAME,
            value: donationItem.items[0].program.programName
        });

        dynamicFields.push({
            keyName: tokens.emailTemplate.PROGRAM_NAME,
            value: donationItem.items[0].program.programName
        });

        let paymentPlan = donationItem.items[0].paymentPlan;

        let paymentPlanName;
        if (paymentPlan && paymentPlan.value) {
            paymentPlanName = paymentPlan.value[donationItem.selectedLang];
        }

        dynamicFields.push({
            keyName: tokens.emailTemplate.PAYMENT_PLAN,
            value: paymentPlanName
        });

        let billingAmount = donationItem.selectedLang == constants.Languages.Arabic.code ? `${donationItem.items[0].currency.symbol} ${arabicDigit.toArabic(parseInt(donationItem.amount), false)}` : `${donationItem.items[0].currency.symbol} ${parseInt(donationItem.amount)}`;

        dynamicFields.push({
            keyName: tokens.emailTemplate.BILLING_AMOUNT,
            value: billingAmount
        });

        dynamicFields.push({
            keyName: tokens.emailTemplate.APP_URL,
            value: configuration.app.appUrl
        });

        let dateByMonthYear = donationItem.selectedLang == constants.Languages.Arabic.code ? dateHelper.getDateInSpecificFormat(installmentDate, true, 'MMM-YY', constants.Languages.Arabic.locale) : donationItem.selectedLang == constants.Languages.French.code ? dateHelper.getDateInSpecificFormat(installmentDate, true, 'MMM-YY', constants.Languages.French.locale) : dateHelper.getDateInSpecificFormat(installmentDate, true, 'MMM-YY');
        dynamicFields.push({
            keyName: tokens.installments.INST_MONTH,
            value: dateByMonthYear || 'N/A'
        });

        let billDate = installmentNo == totalInstallments && donationItem.items[0].isAutoRenew == false ? 'N/A' :
            donationItem.selectedLang == constants.Languages.Arabic.code ? dateHelper.getDateInSpecificFormat(dateHelper.addMonthsInDate(installmentDate, 1, true), true, 'DD-MMM-YY', constants.Languages.Arabic.locale) : donationItem.selectedLang == constants.Languages.French.code ? dateHelper.getDateInSpecificFormat(dateHelper.addMonthsInDate(installmentDate, 1, true), true, 'DD-MMM-YY', constants.Languages.French.locale) : dateHelper.getDateInSpecificFormat(dateHelper.addMonthsInDate(installmentDate, 1, true), true, 'DD-MMM-YY');

        dynamicFields.push({
            keyName: tokens.installments.NEXT_BILL_DATE,
            value: billDate || 'N/A'
        });


        return await emailService.sendEmailByTemplate(templateName, dynamicFields, fileAttachment, donationItem.donarEmailWithoutLogin || donationItem.donarEmail);
    } catch (error) {
        logHelper.logError(`${FILE_NAME}: ${methodName}:`, error);

    }
}

function getProgramNameWithSubCategory(cartItem, lang, installmentNumber, totalInstallments, installmentDate) {
    let result;
    if (cartItem && cartItem.program) {
        let program = cartItem.program;
        if (cartItem.otherFieldForNiyaz) {
            result = `${program.programName} - ${cartItem.otherFieldForNiyaz}`;
        }
        else if (cartItem.otherPersonalityName) {
            result = `${program.programName} - ${cartItem.otherPersonalityName}`;
        }
        else if (cartItem.programSubCategory && cartItem.programSubCategory.programSubCategoryName) {
            if (cartItem.marhomeenName) {
                result = `${program.programName} - ${cartItem.programSubCategory.programSubCategoryName || ''} - ${cartItem.marhomeenName || ''}`;
            }
            else {
                result = `${program.programName} - ${cartItem.programSubCategory.programSubCategoryName || ''}`;
            }
        } else {
            result = `${program.programName}`;
        }
    } else {
        result = '---'
    }
    if (cartItem.paymentPlan && cartItem.paymentPlan.Name != constants.PaymentPlans.GIVE_ONCE) {
        const donationProcess = cartItem.program.donationProcess[0];
        const subscriptionDetail = donationProcess ? donationProcess.subscriptionDetail : null;
        let isLifeTimeSubscription = subscriptionDetail && subscriptionDetail.duration && subscriptionDetail.duration.name == constants.SubscriptionDuration.LIFETIME;
        var installmentText = getInstallmentText(lang, installmentNumber, totalInstallments, installmentDate, isLifeTimeSubscription);
        result = lang == constants.Languages.Arabic.code ? ` ${result}  ${installmentText}` : `${result} ${installmentText}`
    }
    return result;
}
//#endregion

//#endregion Successful payment Email End

//#region Successful payment processing Start
async function onPaymentSucceeded(donationItem, charges, purchaseDatetime, paymentIntentId) {
    const methodName = "onPaymentSucceeded";
    let INSTALLMENT_NO = 1;
    let chargeId = charges.id;
    try {
        logHelper.logInfo(`${FILE_NAME}: onPaymentSucceeded: Started processing successful payment`, paymentIntentId);
        let currentCartItems = donationItem.body.items.filter(cItem => cItem.stripeDetail.payment_intent.id === paymentIntentId);
        if (!currentCartItems || (currentCartItems && currentCartItems.length == 0)) {
            logHelper.logInfo(`${FILE_NAME}: onPaymentSucceeded: No cart items found to process`, paymentIntentId);
            return;
        }

        let stripeSubscriptionId = currentCartItems[0].stripeDetail.subscription.id;
        let stripeInvoiceId = currentCartItems[0].stripeDetail.invoice.id;

        const recurringProgram = currentCartItems.find(cItem => cItem.isRecurringProgram == true);
        let additionalData = {
            stripeSubscriptionId: stripeSubscriptionId,
        };
        if (recurringProgram) {
            additionalData.isRecurringProgram = recurringProgram.isRecurringProgram;
            additionalData.isAutoRenew = recurringProgram.isAutoRenew;
            additionalData.paymentPlan = recurringProgram.paymentPlan;
        }
        else {
            additionalData.isRecurringProgram = false;
            additionalData.paymentPlan = currentCartItems[0].paymentPlan;
        }

        updateChargesDescription(charges.id, currentCartItems);

        //KH: No need to re-update customer id as its already updated at the time of creating subscription
        //Stopping this update to ensure/allow multiple currencies payment in case of subscription 
        //await mapStripeCustomerIdWithDonor(charges, donationItem);

        //Mustafa. Quick check out fix
        let countryName = typeof (donationItem.body.country) == "string" ? donationItem.body.country : donationItem.body.country.name;
        const donorCountry = await getDonorCountry(countryName);

        //Step 4) Get Invoice Number
        let invoiceNum = await getInvoiceNumber();

        //Step 5) Add entry to Donation

        let newInsertedDonation = await insertDonation(invoiceNum, donationItem, chargeId, purchaseDatetime, paymentIntentId, additionalData);

        //Step 6) Add entry to Donor Program
        let NO_OF_MONTHS = 0;
        let newInsertedDonationDetailsList = []

        for (let i = 0; i < currentCartItems.length; i++) {
            let cartItem = currentCartItems[i];
            //await Promise.all(currentCartItems.map(async function (cartItem) {
            try {
                let START_DATE, END_DATE;
                // ********** Calculation of start date, number of months and end date
                START_DATE = purchaseDatetime;

                const donationProcess = cartItem.program.donationProcess[0];
                const subscriptionDetail = donationProcess ? donationProcess.subscriptionDetail : null;
                if (subscriptionDetail && !subscriptionDetail.startImmediately)
                    START_DATE = dateHelper.getNextMonth(true).toISOString();

                NO_OF_MONTHS = getNumberOfMonthsByProgram(cartItem, subscriptionDetail);

                END_DATE = dateHelper.addMonthsInDate(START_DATE, NO_OF_MONTHS);

                if (subscriptionDetail && !subscriptionDetail.startImmediately)
                    //Need to subtract 1 day from End Date.
                    END_DATE = dateHelper.subtractDaysFromDate(END_DATE, 1, null, null);

                // ********** Calculation of start date, number of months and end date

                let additionalMetadata = await getAdditionalMetaInfo(cartItem);

                // **************** Calculate Subscription Amount **************** 
                let SUBSCRIPTION_AMOUNT;
                if (cartItem && cartItem.paymentPlan && cartItem.paymentPlan.Name) {
                    SUBSCRIPTION_AMOUNT = (cartItem.paymentPlan.Name == constants.PaymentPlans.GIVE_ONCE) ? cartItem.totalAmount : cartItem.totalAmount * NO_OF_MONTHS;
                }
                else {
                    cartItem.totalAmount
                }

                const newInsertedDonorProgram = await insertDonorProgram(cartItem, donationItem, START_DATE, END_DATE, additionalMetadata, stripeSubscriptionId, charges, purchaseDatetime, NO_OF_MONTHS, SUBSCRIPTION_AMOUNT);

                //Step 7) Add entries in Donation Details

                additionalData.isRecurringProgram = cartItem.isRecurringProgram;
                additionalData.isAutoRenew = cartItem.isAutoRenew;
                additionalData.paymentPlan = cartItem.paymentPlan;
                if (cartItem.performLocation)
                    additionalData.performLocation = cartItem.performLocation;

                if (cartItem.aqiqaChildName)
                    additionalData.aqiqaChildName = cartItem.aqiqaChildName;

                if (cartItem.orphanIds)
                    additionalData.orphanIds = cartItem.orphanIds;

                if (cartItem.orphanGiftDescription) {
                    additionalData.orphanGiftDescription = cartItem.orphanGiftDescription;
                }

                const newInsertedDonationDetails = await insertDonationDetails(cartItem, newInsertedDonation, donationItem, donorCountry._id, purchaseDatetime, END_DATE, newInsertedDonation, additionalData, true);

                newInsertedDonationDetailsList.push(new ObjectID(newInsertedDonationDetails._id));

                //Step 8) Add entries in Donor Program Details
                await insertDonorProgramDetails(purchaseDatetime, paymentIntentId, stripeInvoiceId, cartItem, donationItem, stripeSubscriptionId, invoiceNum, NO_OF_MONTHS, newInsertedDonorProgram, subscriptionDetail);

                //Orphan Scholorship

                if (additionalMetadata && additionalMetadata.value && additionalMetadata.value.length > 0) {
                    //additionalMetadata.value contains orphans or students list
                    await Promise.all(additionalMetadata.value.map(async function (dataItem) {
                        try {
                            //dataItem = orphan, student etc.

                            let objDonRecurring = await getDonationRecurringObject(newInsertedDonationDetails, cartItem, donationItem, END_DATE, purchaseDatetime, START_DATE, NO_OF_MONTHS, stripeInvoiceId, paymentIntentId, stripeSubscriptionId, additionalMetadata.value.length, SUBSCRIPTION_AMOUNT);

                            objDonRecurring[additionalMetadata.columnName] = dataItem;

                            await databaseHelper.insertItem(constants.Database.Collections.DON_REC.dataKey, objDonRecurring)

                            if (cartItem.paymentPlan.Name == constants.PaymentPlans.GIVE_ONCE && !cartItem.isAutoRenew) {
                                await handleSubscriptionOnStripe(null, true, stripeSubscriptionId);
                            }
                            //logic to insert sponship data
                            let objSponsorship = await getSponsorshipObject(newInsertedDonationDetails, cartItem, donationItem, END_DATE, purchaseDatetime, START_DATE, additionalMetadata.value.length, SUBSCRIPTION_AMOUNT);

                            objSponsorship[additionalMetadata.columnName + 's'] = dataItem;

                            await databaseHelper.insertItem(additionalMetadata.dataModelKey, objSponsorship);
                        }
                        catch (err) {
                            logHelper.logError(`${FILE_NAME}: additionalMetadata item: `, err);
                        }
                    }))
                }

                // Now update donationDetailId in donation collection
                await databaseHelper.updateItem(constants.Database.Collections.DONATN.dataKey, { _id: new ObjectID(newInsertedDonation._id) }, { donationdetails: newInsertedDonationDetailsList });
            }
            catch (err) {
                logHelper.logError(`${FILE_NAME}: ${methodName}: Error in cart items loop`, err);
            }
        }
        //));  //end of main for loop 


        //sending email with PDF receipt
        //Send email template name from here. 11 May 2021

        var emailTemplateName = `${constants.emailTemplates.SUCCESSFUL_PAYMENT_EMAIL}_${donationItem.body.selectedLang}`;

        await sendEmailWithReciept(donationItem, invoiceNum, purchaseDatetime, newInsertedDonation, INSTALLMENT_NO, NO_OF_MONTHS, emailTemplateName, purchaseDatetime);

        //TODOKH: Update code to address multiple subscriptions when enabled
        await databaseHelper.updateItem(constants.Database.Collections.DON_ITEM.dataKey,
            {
                _id: donationItem._id
            },
            {
                "state": constants.Database.DonationItem.State.Processed
            });
    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: ${methodName}: Main method try catch :Error`, err);
    }
};
async function renewOrphanSponsorshipWithoutPayment({ donationItem, invoiceNum }) {
    const methodName = "renewOrphanSponsorshipWithoutPayment";
    try {

        let purchaseDatetime, paymentIntentId;
        let objDonation = await databaseHelper.getItem(constants.Database.Collections.DONATN.dataKey, { invoiceNo: invoiceNum });
        if (!objDonation)
            throw new Error("No donation found for the provided parameter");
        purchaseDatetime = objDonation.created;
        paymentIntentId = objDonation.payment_intent_id;
        logHelper.logInfo(`${FILE_NAME}: renewOrphanSponsorshipWithoutPayment: Started processing successful payment`, paymentIntentId);
        let currentCartItems = donationItem.body.items.filter(cItem => cItem.stripeDetail.payment_intent.id === paymentIntentId);
        if (!currentCartItems || (currentCartItems && currentCartItems.length == 0)) {
            logHelper.logInfo(`${FILE_NAME}: onPaymentSucceeded: No cart items found to process`, paymentIntentId);
            return;
        }
        let stripeSubscriptionId = currentCartItems[0].stripeDetail.subscription.id;
        let stripeInvoiceId = currentCartItems[0].stripeDetail.invoice.id;

        const recurringProgram = currentCartItems.find(cItem => cItem.isRecurringProgram == true);
        let additionalData = {
            stripeSubscriptionId: stripeSubscriptionId,
        };
        if (recurringProgram) {
            additionalData.isRecurringProgram = recurringProgram.isRecurringProgram;
            additionalData.isAutoRenew = recurringProgram.isAutoRenew;
            additionalData.paymentPlan = recurringProgram.paymentPlan;
        }
        else {
            additionalData.isRecurringProgram = false;
            additionalData.paymentPlan = currentCartItems[0].paymentPlan;
        }

        //Step 5) update Donation entry , additional data
        let newUpdatedDonation = await databaseHelper.updateItem(constants.Database.Collections.DONATN.dataKey, { _id: new ObjectID(objDonation._id) }, { additionalData: additionalData });
        objDonation.additionalData = additionalData;
        //Step 6) Add entry to Donor Program
        let NO_OF_MONTHS = 0;
        for (let i = 0; i < currentCartItems.length; i++) {
            let cartItem = currentCartItems[i];
            //await Promise.all(currentCartItems.map(async function (cartItem) {
            try {
                let START_DATE, END_DATE;
                // ********** Calculation of start date, number of months and end date
                START_DATE = purchaseDatetime;
                const donationProcess = cartItem.program.donationProcess[0];
                const subscriptionDetail = donationProcess ? donationProcess.subscriptionDetail : null;
                if (subscriptionDetail && !subscriptionDetail.startImmediately)
                    START_DATE = dateHelper.getNextMonth(true).toISOString();

                NO_OF_MONTHS = getNumberOfMonthsByProgram(cartItem, subscriptionDetail);

                END_DATE = dateHelper.addMonthsInDate(START_DATE, NO_OF_MONTHS);

                //Need to subtract 1 day from End Date.
                END_DATE = dateHelper.subtractDaysFromDate(END_DATE, 1, null, null);

                // ********** Calculation of start date, number of months and end date

                let additionalMetadata = await getAdditionalMetaInfo(cartItem);

                // **************** Calculate Subscription Amount **************** 
                let SUBSCRIPTION_AMOUNT;
                if (cartItem && cartItem.paymentPlan && cartItem.paymentPlan.Name) {
                    SUBSCRIPTION_AMOUNT = (cartItem.paymentPlan.Name == constants.PaymentPlans.GIVE_ONCE) ? cartItem.totalAmount : cartItem.totalAmount * NO_OF_MONTHS;
                }
                else {
                    cartItem.totalAmount
                }
                const charges = { payment_method_details: { card: {} }, payment_method: "" };
                const newInsertedDonorProgram = await insertDonorProgram(cartItem, donationItem, START_DATE, END_DATE, additionalMetadata, stripeSubscriptionId, charges, purchaseDatetime, NO_OF_MONTHS, SUBSCRIPTION_AMOUNT);

                //Step 7) Add entries in Donation Details

                additionalData.isRecurringProgram = cartItem.isRecurringProgram;
                additionalData.isAutoRenew = cartItem.isAutoRenew;
                additionalData.paymentPlan = cartItem.paymentPlan;

                //update donation details, additional data, donation, programid
                // const newInsertedDonationDetails = await insertDonationDetails(cartItem, newInsertedDonation, donationItem, donorCountry._id, purchaseDatetime, END_DATE, newInsertedDonation, additionalData)
                const newUpdatedDonationDetails = await databaseHelper.updateItem(constants.Database.Collections.DON_DET.dataKey, { "donation._id": new ObjectID(objDonation._id) }, {
                    additionalData: additionalData,
                    endDate: END_DATE,
                    donation: objDonation,
                    program: cartItem.program
                });
                const objDonationDetails = await databaseHelper.getItem(constants.Database.Collections.DON_DET.dataKey, { _id: new ObjectID(newUpdatedDonationDetails._id) });
                //Step 8) Add entries in Donor Program Details
                await insertDonorProgramDetails(purchaseDatetime, paymentIntentId, stripeInvoiceId, cartItem, donationItem, stripeSubscriptionId, invoiceNum, NO_OF_MONTHS, newInsertedDonorProgram);

                //Orphan Scholorship

                if (additionalMetadata && additionalMetadata.value && additionalMetadata.value.length > 0) {
                    //additionalMetadata.value contains orphans or students list
                    await Promise.all(additionalMetadata.value.map(async function (dataItem) {
                        try {
                            //dataItem = orphan, student etc.

                            let objDonRecurring = await getDonationRecurringObject(objDonationDetails, cartItem, donationItem, END_DATE, purchaseDatetime, START_DATE, NO_OF_MONTHS, stripeInvoiceId, paymentIntentId, stripeSubscriptionId, additionalMetadata.value.length, SUBSCRIPTION_AMOUNT);

                            objDonRecurring[additionalMetadata.columnName] = dataItem;

                            await databaseHelper.insertItem(constants.Database.Collections.DON_REC.dataKey, objDonRecurring)

                            //logic to insert sponship data
                            let objSponsorship = await getSponsorshipObject(objDonationDetails, cartItem, donationItem, END_DATE, purchaseDatetime, START_DATE, additionalMetadata.value.length, SUBSCRIPTION_AMOUNT);

                            objSponsorship[additionalMetadata.columnName + 's'] = dataItem;

                            await databaseHelper.insertItem(additionalMetadata.dataModelKey, objSponsorship);
                        }
                        catch (err) {
                            logHelper.logError(`${FILE_NAME}: additionalMetadata item: `, err);
                        }
                    }))
                }
            }
            catch (err) {
                logHelper.logError(`${FILE_NAME}: ${methodName}: Error in cart items loop`, err);
                throw new Error(err.message);
            }
        }
        //));  //end of main for loop 
    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: ${methodName}: Main method try catch :Error`, err);
        throw new Error(err.message);
    }
    return true;
};
async function updateChargesDescription(chargeId, items) {
    await stripeAPIHelper.updateChargeDescription(chargeId, getDescriptionString(items));
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
async function getSponsorshipObject(newInsertedDonationDetails, cartItem, donationItem, endDate, purchaseDatetime, startDate, count, SUBSCRIPTION_AMOUNT) {
    let objSponsorship = {};
    objSponsorship.donar = donationItem.body.donar;
    objSponsorship.donationdetails = newInsertedDonationDetails;
    objSponsorship.startDate = startDate;
    objSponsorship.endDate = endDate;
    objSponsorship.paymentDate = purchaseDatetime;
    objSponsorship.currencyTitle = cartItem.currency.title;
    objSponsorship.sponsorshipAmount = SUBSCRIPTION_AMOUNT / count;
    return objSponsorship;
}
async function getDonationRecurringObject(newInsertedDonationDetails, cartItem, donationItem, endDate, purchaseDatetime, startDate, noOfMonths, stripeInvoiceId, paymentIntentId, stripeSubscriptionId, count, SUBSCRIPTION_AMOUNT) {
    let objDonationRecurring = {};

    let noOfInstallments = 0;
    let additionalData = {
        donor:
        {
            _id: new ObjectID(donationItem.body.donar._id),
            donorName: donationItem.body.donar.donarName,
            donoremail: donationItem.body.donar.email,
        },
        program:
        {
            _id: new ObjectID(cartItem.program._id),
            programName: cartItem.program.programName,
            slug: cartItem.program.slug,
        },
        currency:
        {
            currencySymbol: donationItem.body.paymentCurrency,
            currencyTitle: donationItem.body.paymentTitle,
        },
        paymentPlan: cartItem.paymentPlan.Name
    }

    if (!cartItem.program.isRecurringProgram) {
        noOfInstallments = 1;//add only one entry for non recurring program
    }
    else {
        noOfInstallments = noOfMonths / cartItem.paymentPlan.billingDetail.interval_count;
    }

    objDonationRecurring.donationDetails = newInsertedDonationDetails;
    objDonationRecurring.program = cartItem.program;
    objDonationRecurring.programSubCategory = cartItem.programSubCategory;
    objDonationRecurring.donationDuration = cartItem.donationDuration;
    objDonationRecurring.donar = donationItem.body.donar;
    objDonationRecurring.customerId = donationItem.body.donar.customerid;
    objDonationRecurring.count = 1;
    objDonationRecurring.amount = SUBSCRIPTION_AMOUNT / count;
    objDonationRecurring.isActive = true;
    objDonationRecurring.endDate = endDate;
    objDonationRecurring.freezedDate = Date.now();
    objDonationRecurring.created = purchaseDatetime;
    objDonationRecurring.startDate = startDate;
    objDonationRecurring.noOfPaymentsRemaining = (cartItem.paymentPlan.Name == constants.PaymentPlans.GIVE_ONCE) ? 0 : noOfInstallments - 1;
    objDonationRecurring.stripeSubscriptionId = stripeSubscriptionId;
    objDonationRecurring.additionalData = additionalData;

    let paymentsSchedule = [];
    for (let i = 0; i < noOfInstallments; i++) {

        let tempAmount = (cartItem.paymentPlan.Name == constants.PaymentPlans.GIVE_ONCE) ? cartItem.totalAmount / (count * noOfMonths) : cartItem.totalAmount / count;

        let paySchedule =
        {
            installmentNo: i + 1,
            amount: tempAmount,
            roundUpAmount: Math.ceil(tempAmount),
            payableBy: constants.PayableBy.Donor,
            isActive: true,
            comment: 'Installment number ' + (i + 1),
            installmentDate: dateHelper.addMonthsInDate(purchaseDatetime, i),
        }
        if (i == 0 || cartItem.paymentPlan.Name == constants.PaymentPlans.GIVE_ONCE) {

            paySchedule.invoiceId = stripeInvoiceId;
            paySchedule.paymentIntentId = paymentIntentId;
            paySchedule.status = constants.PaymentStatus.Paid;
            paySchedule.paymentDate = purchaseDatetime;
            paySchedule.paidBy = constants.PayableBy.Donor;
            paySchedule.paymentIntentId = paymentIntentId;
            paySchedule.attemptHistory =
            {
                date: purchaseDatetime,
                status: constants.PaymentStatus.Paid,
                comment: 'Installment number' + (i + 1),
            }
        }
        else {

            paySchedule.status = constants.PaymentStatus.Unpaid;
            paySchedule.paymentDate = null;
            paySchedule.paidBy = null;
            paySchedule.attemptHistory = null;
            paySchedule.invoiceId = '';
            paySchedule.paymentIntentId = '';
        }
        paymentsSchedule.push(paySchedule);
    }
    objDonationRecurring.paymentSchedule = paymentsSchedule;

    return objDonationRecurring;
}
async function getAdditionalMetaInfo(cartItem) {
    let additionalMetadataInfo = null;
    let dataList = [];
    let dataKey = "", columnName = "", dataModelKey = "";
    if (cartItem.orphans && cartItem.orphans.length > 0) {
        dataKey = "OrphanInfo";
        columnName = "orphan";
        dataModelKey = constants.Database.Collections.ORP_SCH.dataKey;
        for (let i = 0; i < cartItem.orphans.length; i++) {
            let orphan = cartItem.orphans[i];
            let orphanFilter = { _id: new ObjectID(orphan) };

            //orphanPayload commented because we need to insert complete orphan object into donationRecurring
            //let orphanPayload = { orphanName: 1, orphanId: 1,  };
            orphanInfo = await databaseHelper.getItem(constants.Database.Collections.ORPN.dataKey, orphanFilter, null);
            dataList.push(orphanInfo);
        };
    }

    else if (cartItem.students && cartItem.students.length > 0) {
        dataKey = "StudentInfo";
        columnName = "student";
        dataModelKey = constants.Database.Collections.STU_SCH.dataKey;
        await Promise.all(cartItem.students.map(async function (student) {
            let filter = { _id: new ObjectID(student) };
            let payload = { studentName: 1, fileNumber: 1 };
            const dataInfo = await databaseHelper.getItem(constants.Database.Collections.STU.dataKey, filter, payload);
            dataList.push(
                {
                    _id: dataInfo._id,
                    studentName: dataInfo.studentName,
                    fileNumber: dataInfo.fileNumber
                });
        }));
    }
    if (dataKey)
        additionalMetadataInfo = { "key": dataKey, "value": dataList, "columnName": columnName, "dataModelKey": dataModelKey };
    return additionalMetadataInfo;
}
async function insertDonorProgramDetails(purchaseDatetime, paymentIntentId, stripeInvoiceId, cartItem, donationItem, stripeSubscriptionId, invoiceNum, noOfMonths, newInsertedDonorProgram, subscriptionDetail) {
    let objDonorProgramDetails = {};
    let isLifeTimeSubscription = subscriptionDetail && subscriptionDetail.duration && subscriptionDetail.duration.name == constants.SubscriptionDuration.LIFETIME;

    let donorProgram = {
        _id: new ObjectID(newInsertedDonorProgram._id)
        ,
        program:
        {
            _id: new ObjectID(newInsertedDonorProgram.program.programDetails._id),
            programName: newInsertedDonorProgram.program.programDetails.programName,
            slug: newInsertedDonorProgram.program.programDetails.slug,
        }
    }

    if (!cartItem.program.isRecurringProgram
        || (cartItem.program.isRecurringProgram && cartItem.paymentPlan.Name == constants.PaymentPlans.GIVE_ONCE))
        noOfMonths = 1;//add only one entry for non recurring program and for GIVE once program
    for (let i = 0; i < noOfMonths; i++) {
        try {
            if (noOfMonths > 1 || isLifeTimeSubscription)
                objDonorProgramDetails.installmentNo = i + 1;
            if (i == 0) {
                //first installment payment
                objDonorProgramDetails.installmentDate = purchaseDatetime;
                objDonorProgramDetails.paymentDate = purchaseDatetime;
                objDonorProgramDetails.paymentStatus = constants.PaymentStatus.Paid;
                objDonorProgramDetails.paymentIntentId = paymentIntentId;
                objDonorProgramDetails.comments = 'Installment number ' + (i + 1);
                objDonorProgramDetails.stripeInvoiceId = stripeInvoiceId;
                objDonorProgramDetails.invoiceLink = `public/pdf/Reciept-${donationItem.body.selectedLang}-${invoiceNum}.pdf`;
            }
            else {
                objDonorProgramDetails.installmentDate = dateHelper.addMonthsInDate(purchaseDatetime, i);
                objDonorProgramDetails.paymentDate = null;
                objDonorProgramDetails.paymentStatus = constants.PaymentStatus.Unpaid;
                objDonorProgramDetails.paymentIntentId = null;
                objDonorProgramDetails.comments = '';
                objDonorProgramDetails.stripeInvoiceId = '';
                objDonorProgramDetails.invoiceLink = '';
            }
            objDonorProgramDetails.created = purchaseDatetime;
            objDonorProgramDetails.updated = purchaseDatetime;
            objDonorProgramDetails.amount = cartItem.totalAmount;

            objDonorProgramDetails.stripeSubscriptionId = stripeSubscriptionId;
            objDonorProgramDetails.stripeChargeHistory = {};

            objDonorProgramDetails.donorProgram = donorProgram;

            await databaseHelper.insertItem(constants.Database.Collections.DON_PRG_DET.dataKey, objDonorProgramDetails);
        }
        catch (err) {
            logHelper.logError(`${FILE_NAME}: insertDonorProgramDetails : `, err);
        }
    }
}
async function insertDonationDetails(cartItem, objDonation, donationItem, countryId, purchaseDatetime, endDate, newInsertedDonation, additionalData, isEndDateUpdated) {
    let objDonDetail = {};
    objDonDetail.amount = cartItem.totalAmount;
    objDonDetail.donation = objDonation;
    objDonDetail.program = cartItem.program;
    objDonDetail.programSubCategory = cartItem.programSubCategory;
    objDonDetail.chargeId = donationItem.chargeId;
    objDonDetail.isCampaign = donationItem.isCampaign;
    objDonDetail.occasion = cartItem.occasion;
    objDonDetail.dua = cartItem.dua;
    objDonDetail.marhomeenName = cartItem.marhomeenName;
    objDonDetail.calendarForSacrifice = cartItem.calendarForSacrifice;
    objDonDetail.sdoz = cartItem.sdoz;
    objDonDetail.isSyed = cartItem.descend;
    objDonDetail.fitrahSubType = cartItem.fitrahSubType;
    objDonDetail.sahm = cartItem.sahm;
    objDonDetail.otherPersonalityName = cartItem.otherPersonalityName;
    objDonDetail.isActive = true;
    objDonDetail.isRecurring = cartItem.isRecurringProgram;
    objDonDetail.autoRenew = cartItem.autoRenew;
    objDonDetail.count = cartItem.count;
    objDonDetail.countryOfResidence = countryId;
    objDonDetail.created = purchaseDatetime;
    objDonDetail.updated = purchaseDatetime;
    objDonDetail.createdBy = 'NA';
    objDonDetail.updatedBy = 'NA';
    objDonDetail.comments = cartItem.comment;
    objDonDetail.endDate = endDate;
    objDonDetail.additionalData = additionalData;
    objDonDetail.isEndDateUpdated = isEndDateUpdated ? isEndDateUpdated : false;



    return await databaseHelper.insertItem(constants.Database.Collections.DON_DET.dataKey, objDonDetail);

}
async function insertDonorProgram(cartItem, donationItem, startDate, endDate, additionalMetadata, stripeSubscriptionId, charges, purchaseDatetime, noOfMonths, SUBSCRIPTION_AMOUNT) {
    let objDonorProgram = {};
    const { payment_method_details, payment_method } = charges;
    let donorObj = {
        donorId: new ObjectID(donationItem.body.donar._id),
        donorName: donationItem.body.donar.donarName,
        donoremail: donationItem.body.donar.email,
        donorCustomerId: donationItem.body.donar.customerId,
        paymentMethodId: payment_method,
        cardDetail: payment_method_details.card
    }
    let donorProgram =
    {
        programType:
        {
            _id: new ObjectID(cartItem.program.programType[0]._id),
            programTypeName: cartItem.program.programType[0].programTypeName,
            programTypeSlug: cartItem.program.programType[0].slug
        },
        programDetails:
        {
            _id: new ObjectID(cartItem.program._id),
            programName: cartItem.program.programName,
            slug: cartItem.program.slug,
            additionalMetaData: {}
        },
    }
    donorProgram.programDetails.additionalMetaData = additionalMetadata;

    const donationProcess = cartItem.program.donationProcess[0];
    const subscriptionDetail = donationProcess ? donationProcess.subscriptionDetail : null;

    objDonorProgram.donor = donorObj;
    objDonorProgram.program = donorProgram;
    objDonorProgram.allowAutoRenew = subscriptionDetail ? subscriptionDetail.allowAutoRenew : false;
    objDonorProgram.cancellationMode = subscriptionDetail ? subscriptionDetail.cancellationMode : constants.CancellationMode.NotAllowed
    objDonorProgram.isRecurringProgram = cartItem.program ? cartItem.program.isRecurringProgram : false;
    objDonorProgram.isAutoRenewal = cartItem.isAutoRenew ? cartItem.isAutoRenew : false;
    objDonorProgram.paymentPlan = cartItem.paymentPlan;

    objDonorProgram.startDate = startDate
    objDonorProgram.endDate = endDate;

    objDonorProgram.totalSubscriptionAmount = SUBSCRIPTION_AMOUNT;

    objDonorProgram.totalAmount = cartItem.totalAmount;

    objDonorProgram.currency = donationItem.body.paymentCurrency
    objDonorProgram.comments = "";
    objDonorProgram.created = purchaseDatetime;
    objDonorProgram.updated = purchaseDatetime;
    objDonorProgram.lastPaymentDate = purchaseDatetime;
    objDonorProgram.lastPaymentStatus = constants.PaymentStatus.Paid;
    objDonorProgram.subscriptionStatus = constants.SubscriptionStatus.Active
    objDonorProgram.stripeSubscriptionId = stripeSubscriptionId;
    objDonorProgram.cancellationDate = null
    objDonorProgram.stripeSubscriptionStatus = constants.SubscriptionStatus.Active;

    return await databaseHelper.insertItem(constants.Database.Collections.DON_PRG.dataKey, objDonorProgram)
}
async function insertDonation(invoiceNum, donationItem, chargeId, purchaseDatetime, paymentIntentId, additionalData) {
    var objDonation = {

        invoiceNo: invoiceNum,
        donor: donationItem.body.donar,
        chargeId: chargeId,
        customerId: donationItem.body.donar.customerId,
        totalAmount: parseInt(donationItem.body.amount).toFixed(2),
        isActive: true,
        isKhums: false,
        documentPath: `public/pdf/Reciept-${donationItem.body.selectedLang}-${invoiceNum}.pdf`,
        created: purchaseDatetime,
        updated: purchaseDatetime,
        currency: donationItem.body.paymentCurrency,
        currencyTitle: donationItem.body.paymentTitle,
        createdBy: 'NA',
        updatedBy: 'NA',
        payment_intent_id: paymentIntentId,
        additionalData: additionalData
    };

    let resp = await databaseHelper.insertItem(constants.Database.Collections.DONATN.dataKey, objDonation)

    return resp
}
async function getDonorCountry(countryName) {
    //Step 3) Get Country
    let countryPayload = { name: 1, _id: 1 }
    let countryFilter = {
        $or:
            [
                { name: countryName },
                { nameARB: countryName },
                { nameFRN: countryName }
            ]
    }

    return await databaseHelper.getItem(constants.Database.Collections.CON.dataKey, countryFilter, countryPayload)

}
async function mapStripeCustomerIdWithDonor(charges, donationItem) {
    //Step 2.1) Get Donor   
    let donorFilter = { customerId: charges.customer }
    const donor = await databaseHelper.getItem(constants.Database.Collections.DONR.dataKey, donorFilter)

    //Step 2.2) Update Donor (if applicable)

    if (!donor) {
        donorFilter = { _id: donationItem.body.donar._id };
        let donorPayload = { customerId: charges.customer }
        await databaseHelper.updateItem(constants.Database.Collections.DONR.dataKey, donorFilter, donorPayload)
    }
}
async function getInvoiceNumber() {
    const methodName = "getInvoiceNumber";
    let lastInvoiceNo = 'AA0001'
    try {

        let lastDonation = null;

        let dataFields = {
            "invoiceNo": 1
        }

        let sortOptions = { sort: { invoiceNo: -1 } };


        lastDonation = await databaseHelper.getItem("DONATN", {}, dataFields, sortOptions);

        lastInvoiceNo = lastDonation && lastDonation.invoiceNo || lastInvoiceNo;
        let invoiceNum = recieptNumberGenerator(lastInvoiceNo);

        return invoiceNum;
    }
    catch (ex) {
        logHelper.logError(`${FILE_NAME}: ${methodName}: `, err);
    }
};

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

function getNumberOfMonthsByProgram(cartItem, subscriptionDetail) {
    const methodName = "getNumberOfMonthsByProgram";
    let noOfMonths = 12;
    try {
        if (subscriptionDetail && subscriptionDetail.duration && subscriptionDetail.duration.numOfMonths)
            return subscriptionDetail.duration.numOfMonths;//new model for duration
        else if (cartItem.donationDuration && cartItem.donationDuration.noOfMonths)
            return cartItem.donationDuration.noOfMonths; //old model of duration
        else {
            //TODO: Will be removed once higher education will be enabled for recurring
            if (cartItem.program.slug == constants.ProgramSlugs.higherEducationLoans) {
                if (cartItem.programSubCategory.isPhd) {
                    noOfMonths = 30; //2.5 years
                }
                else { noOfMonths = 24 } //2 years
            }
        }
    }
    catch (ex) {
        logHelper.logError(`${FILE_NAME}: ${methodName}: `, err);
    }
    return noOfMonths;
}

function getInstallmentText(language, installmentNo, totalInstallments, installmentDate, isLifeTimeSubscription) {

    let textToReturn;
    if (language == constants.Languages.Arabic.code) {
        textToReturn = isLifeTimeSubscription == true ? `<br /> <i>(رقم القسط ${arabicDigit.toArabic(installmentNo)}&nbsp;||&nbsp;شهر التقسيط: ${dateHelper.getDateInSpecificFormat(installmentDate, true, 'MMMM-YY', constants.Languages.Arabic.locale)})</i>` : `<br /> <i>(رقم القسط ${arabicDigit.toArabic(installmentNo)} من ${arabicDigit.toArabic(totalInstallments)}&nbsp;||&nbsp;شهر التقسيط: ${dateHelper.getDateInSpecificFormat(installmentDate, true, 'MMMM-YY', constants.Languages.Arabic.locale)})</i>`;
    }
    else if (language == constants.Languages.French.code) {
        textToReturn = isLifeTimeSubscription == true ? `<br /> <i>(N° VRSMT: ${installmentNo}&nbsp;||&nbsp;Mois VRSMT: ${dateHelper.getDateInSpecificFormat(installmentDate, true, 'MMMM-YY', constants.Languages.French.locale)})</i>` : `<br /> <i>(N° VRSMT: ${installmentNo} sur ${totalInstallments}&nbsp;||&nbsp;Mois VRSMT: ${dateHelper.getDateInSpecificFormat(installmentDate, true, 'MMMM-YY', constants.Languages.French.locale)})</i>`;
    }
    else {
        textToReturn = isLifeTimeSubscription == true ? `<br /> <i>(Inst. No: ${installmentNo}&nbsp;||&nbsp;Inst. Month: ${dateHelper.getDateInSpecificFormat(installmentDate, true, 'MMMM-YY')})</i>` : `<br /> <i>(Inst. No: ${installmentNo} of ${totalInstallments}&nbsp;||&nbsp;Inst. Month: ${dateHelper.getDateInSpecificFormat(installmentDate, true, 'MMMM-YY')})</i>`;
    }

    return textToReturn;

}



function getInstallmentTextNumeric(language, installmentNo, totalInstallments, installmentDate, isLifeTimeSubscription) {
    var installmenttext;
    if (isLifeTimeSubscription) {
        installmenttext = language == constants.Languages.Arabic.code ? ` ${arabicDigit.toArabic(installmentNo)}` :
            `${installmentNo}`;
    }
    else {
        installmenttext = language == constants.Languages.Arabic.code ? ` ${arabicDigit.toArabic(installmentNo)} من ${arabicDigit.toArabic(totalInstallments)}` :
            language == constants.Languages.French.code ? ` ${installmentNo} sur ${totalInstallments} ` : ` ${installmentNo} of ${totalInstallments} `;
    }
    return installmenttext;
}
//#endregion Successful payment Processing End






// //#region  stripe pause collection area


async function payInvoiceOnStripe(invoiceId) {
    const methodName = "payInvoiceOnStripe";
    try {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: trying to pay invoice on stripe`);

        const payInvoice = await stripeAPIHelper.payInvoice(invoiceId);
        if (payInvoice && payInvoice.status == constants.Stripe.InoviceStatuses.Paid) {
            return true;
        } else {
            return false;
        }

    } catch (ex) {
        logHelper.logError(`${FILE_NAME}: payInvoiceOnStripe : `, err);
        return false;
    }

}

async function payDraftInvoices(subscriptionId) {

    const methodName = "payDraftInvoices";
    try {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: perform action if subscription exists on stripe`);
        let resp = [];
        let filter = {
            subscription: subscriptionId,
            status: constants.Stripe.InoviceStatuses.Draft
        };
        //retrieve all invoices from stripe 
        const response = await stripeAPIHelper.retrieveInvoiceList(filter);
        if (response && response.data) {
            let invoices = response.data;

            for (let i = 0; i < invoices.length; i++) {

                if (i != 0) {
                    await genericHelper.sleep(5000);
                }

                let result = await payInvoiceOnStripe(invoices[i].id);
                let obj = {
                    stripeIvoiceId: invoices[i].id,
                    paidStatus: result

                };
                resp.push(obj);

            }

        }
        return resp;

    }
    catch (ex) {
        logHelper.logError(`${FILE_NAME}: payDraftInvoices : `, err);
        return false;
    }




}
async function handleSubscriptionOnStripe(stripeSubscription, perfromPause, stripeSubscriptionId) {
    const methodName = "handleSubscriptionOnStripe";
    try {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: perform action if subscription exists on stripe`);

        if (!stripeSubscription && stripeSubscriptionId) {
            const stpeRetrievedSubscription = await stripeAPIHelper.retrieveSubscription(stripeSubscriptionId);
            if (stpeRetrievedSubscription) {
                stripeSubscription = stpeRetrievedSubscription;
            }
        }

        if (stripeSubscription.pause_collection && !perfromPause) {
            const updatedSubscription = await resumeStripeSubscription(stripeSubscription.id);
            if (updatedSubscription) {
                let result = await payDraftInvoices(stripeSubscription.id);
                logHelper.logInfo(`${FILE_NAME}: ${methodName}: result of trying to pay draft invoice on stripe having subscription id :${stripeSubscription.id} and result : ${result} `);
                return true;

            }
        }

        if (perfromPause) {
            let result = await pauseStripeSubscription(stripeSubscription.id);
            return result;
        }

        if (stripeSubscription.cancel_at && stripeSubscription.cancel_at != null) {

            let result = await removeCancelAtStripeSubscription(stripeSubscription.id);
            return result;
        }
        return false;
    }
    catch (ex) {
        logHelper.logError(`${FILE_NAME}: handleSubscriptionOnStripe : `, err);
        return false;
    }

}

async function removeCancelAtStripeSubscription(stripeSubscriptionId) {
    const methodName = "removeCancelAtStripeSubscription";
    try {

        logHelper.logInfo(`${FILE_NAME}: ${methodName}: removing cancel at on stripe`);
        let updateSubscriptionObj = {
            cancel_at: null,
            cancel_at_period_end: false
        };
        const updatedSubscription = await stripeAPIHelper.updateSubscription(stripeSubscriptionId, updateSubscriptionObj);
        if (updatedSubscription && updatedSubscription.cancel_at == null) {
            return true;
        }
        return false;
    }
    catch (ex) {
        logHelper.logError(`${FILE_NAME}: removeCancelAtStripeSubscription : `, err);
        return false;
    }
}

async function pauseStripeSubscription(stripeSubscriptionId, pauseBehaviour, resumeAt, metaData) {
    const methodName = "pauseStripeSubscription";
    try {

        logHelper.logInfo(`${FILE_NAME}: ${methodName}: pausing subscription on stripe`);
        let updateSubscriptionObj = {
            pause_collection: {
                behavior: constants.Stripe.PauseCollectionBehavior.Draft
            }
        };

        if (pauseBehaviour) {
            updateSubscriptionObj.pause_collection.behavior = pauseBehaviour;
        }
        if (resumeAt) {
            updateSubscriptionObj.pause_collection.resumes_at = resumeAt;
        }
        if (metaData) {
            updateSubscriptionObj.metadata = metaData;
        }

        //  let updateObj = optionalParameter ? optionalParameter  : updateSubscriptionObj;
        const updatedSubscription = await stripeAPIHelper.updateSubscription(stripeSubscriptionId, updateSubscriptionObj);
        if (updatedSubscription && updatedSubscription.pause_collection != null) {
            return true;
        }
        return false;
    }
    catch (ex) {
        logHelper.logError(`${FILE_NAME}: pauseStripeSubscription : `, ex);
        return false;
    }
}

async function resumeStripeSubscription(stripeSubscriptionId) {
    const methodName = "resumeStripeSubscription";
    try {

        logHelper.logInfo(`${FILE_NAME}: ${methodName}: resuming paused subscription stripe`);
        let updateSubscriptionObj = {
            pause_collection: null,
        };
        const updatedSubscription = await stripeAPIHelper.updateSubscription(stripeSubscriptionId, updateSubscriptionObj);
        if (updatedSubscription && updatedSubscription.pause_collection == null) {
            return true;
        }
        return false;
    }
    catch (ex) {
        logHelper.logError(`${FILE_NAME}: resumeStripeSubscription : `, err);
        return false;
    }
}

async function setCustomerDefaultPaymentMethod(cusotmerId, paymentMethodId) {

    const methodName = "setCustomerDefaultPaymentMethod";
    try {
        logHelper.logInfo(`${FILE_NAME}: ${methodName}: set default card if doesnt exist `);
        let customerObj = await stripeAPIHelper.getCustomer(cusotmerId);
        if (!customerObj.invoice_settings.default_payment_method) {

            let updateObj = { invoice_settings: { default_payment_method: paymentMethodId } };
            let attachResp = await stripeAPIHelper.attachPaymentMethod(paymentMethodId, customer.id);
            if (attachResp)
                await stripeAPIHelper.updateCustomer(cusotmerId, updateObj);
        }
    } catch (ex) {
        logHelper.logError(`${FILE_NAME}: ${methodName}: error :  `, ex);
        return false;
    }
}
//#endregion stripe pause collection area




