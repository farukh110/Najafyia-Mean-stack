/* Import constants and helper functions */
var logHelper = require('../utilities/logHelper');
var configuration = require('../../config/configuration');
console.log(configuration.payment.stripeSecretKey);
var stripe = require('stripe')(configuration.payment.stripeSecretKey);
var FILE_NAME = "STRIPE_API_HELPER";

async function createCustomer(customerPayload) {
    let customer = null;
    try {
        if (customerPayload.email && customerPayload.name) {
            customer = await stripe.customers.create(customerPayload);
        }
    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: CreateCustomer: Error in creating customer`, customerPayload, err);
        throw err;
    }
    return customer;
}
async function updateCustomer(customerId, customerPayload) {
    let customer = null;
    try {
        customer = await stripe.customers.update(
            customerId,
            customerPayload
        );
    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: UpdateCustomer: Error in updating customer`, customerId, customerPayload, err);
        throw err;
    }
    return customer;
}
async function getCustomer(customerId) {
    let customer = null;
    try {
        customer = await stripe.customers.retrieve(customerId);
    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: GetCustomer: Error in retrieving customer`, customerId, err);
    }
    return customer;
}

async function createSubscription(subscriptionPayload) {
    let subscription = null;
    try {
        subscription = await stripe.subscriptions.create(subscriptionPayload);
    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: CreateSubscription: Error in creating subscriptions`, subscriptionPayload, err);
        throw err;
    }
    return subscription;
}
async function attachPaymentMethod(paymentMethodId, customerId) {
    let response = null;
    try {
        response = await stripe.paymentMethods.attach(
            paymentMethodId,
            { customer: customerId }
        );
    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: attachPaymentMethod: Error in attaching Payment Method`, err, paymentMethodId, customerId);
        throw err;
    }
    return response;
}

async function updateChargeDescription(chargeId, description) {
    let response = null;
    try {
        response = await stripe.charges.update(
            chargeId, {
            description: description
        });
    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: updateChargeDescription: Error in updating charge description`, err, chargeId, description);
    }
    return response;
}

async function cancelSubscription(subscriptionId) {
    let response = null;
    try {
        response = await stripe.subscriptions.del(subscriptionId);
        return response;
    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: cancelSubscription: Error in canceling subscriptions`, subscriptionId, err);
        throw err;
    }
}

async function payInvoice(invoiceId, optionalParameter) {
    let response = null;
    try {
        response = await stripe.invoices.pay(invoiceId,  optionalParameter );
    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: ChargeCustomerInvoice: Error in charging customer with invoice`, err, invoiceId, optionalParameter);
        response = err;
    }
    return response;
}

async function retrievePaymentIntent(paymentIntentId) {
    let response = null;
    try {

        response = await stripe.paymentIntents.retrieve(paymentIntentId);
    }
    catch (err) {
       
        logHelper.logError(`${FILE_NAME}: retrievePaymentIntent: Error in retrieving Payment Intent`, err);
        response = err;;
    }
    return response;
}

async function updateSubscription(subscriptionId, optionalParameter) {
    let response = null;
    try {

        response = await stripe.subscriptions.update( subscriptionId, optionalParameter  );
        
    }
    catch (err) {
        
        logHelper.logError(`${FILE_NAME}: updateSubscription: Error in updating subscription `, err, subscriptionId, optionalParameter);
        response = err;
    }
    return response;
}


async function retrieveSubscription(subscriptionId) {
    let response = null;
    try {
        response = await stripe.subscriptions.retrieve( subscriptionId  );
    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: retrieveSubscription: Error in retrieveing subscription `, err, subscriptionId);
        response = err;
    }
    return response;
}

async function retrieveInvoiceList(optionalParameter) {
    let response = null;
    try {
        response = await stripe.invoices.list( optionalParameter  );
    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: retrieveSubscription: retrieveing list of invoices  `, err);
        response = err;
    }
    return response;
}

async function retrieveCharge(chargeId) {
    let response = null;
    try {
        response = await stripe.charges.retrieve( chargeId  );
    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: retrieveCharge: retrieveing charge by id  `, err);
       // response = err;
    }
    return response;
}

async function retrieveInvocie(invoiceId) {
    let response = null;
    try {
        response =  await stripe.invoices.retrieve( invoiceId  );
    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: retrieveInvocie: retrieveing invoice by id  `, err);
       // response = err;
    }
    return response;
}

async function updateInvoiceItems(itemId , optionalParameter) {
    let response = null;
    try {
        response =  await stripe.invoiceItems.update( itemId,optionalParameter  );
    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: updateInvoiceItems: updating invoice items   `, err);
       // response = err;
    }
    return response;
}
async function deleteSubscriptionItem(subscriptionItemId , optionalParameter) {
    let response = null;
    try {
        response =  await stripe.subscriptionItems.del( subscriptionItemId,optionalParameter  );
    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: deleteSubscriptionItem: deleting subscriptopn line item  `, err);
       // response = err;
    }
    return response;
}

async function getAllInvoiceItems(parameters) {
    let response = null;
    try {
        response =  await stripe.invoiceItems.list( parameters );
    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: getAllInvoiceItems: getting all invoice items  `, err);
        //response = err;
    }
    return response;
}


async function createInvoiceItems(parameters ) {
    let response = null;
    try {
        response =  await stripe.invoiceItems.create( parameters );
    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: createInvoiceItems: create an invoice item `, err);
        //response = err;
    }
    return response;
}

async function updateStripeInvoice(invocieId , optionalParameters ) {
    let response = null;
    try {
        response =  await stripe.invoices.update( invocieId,optionalParameters );
    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: updateStripeInvoice: updating invoice   `, err);
        response = err;
    }
    return response;
}

async function voidStripeInvoice(invocieId) {
    let response = null;
    try {
        response =  await stripe.invoices.voidInvoice( invocieId );
    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: voidStripeInvoice: void invoice on stripe   `, err);
        //response = err;;
    }
    return response;
}

async function finalizeStripeInvoice(invocieId,autoAdvace) {
    let response = null;
    try {
        response =  await stripe.invoices.finalizeInvoice( invocieId , autoAdvace);
    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: finalizeStripeInvoice: finalize invoice on stripe  `, err);
        //response = err;;
    }
    return response;
}
async function createStripeInvoice(params) {
    let response = null;
    try {
        response =  await stripe.invoices.create( params );
    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: createStripeInvoice: create  invoice on stripe `, err);
        //response = err;;
    }
    return response;
}

async function deleteInvoiceItems(invID) {
    let response = null;
    try {
        response = stripe.invoiceItems.del ( invID );
    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: deleteInvoiceItems: deleteing invoice items `, err);
        //response = err;;
    }
    return response;
}

async function retrievePaymentMethod(paymentMethodId) {
    let paymentMethod  = null;
    try {
        paymentMethod  = await stripe.paymentMethods.retrieve(paymentMethodId);
    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: retrievePaymentMethod: Error in retrieving paymentMethod`, paymentMethodId, err);
    }
    return paymentMethod ;
}


module.exports = {
    getCustomer,
    createCustomer,
    updateCustomer,
    createSubscription,
    attachPaymentMethod,
    updateChargeDescription,
    cancelSubscription,
    payInvoice,
    retrievePaymentIntent,
    updateSubscription,
    retrieveSubscription,
    retrieveInvoiceList,
    retrieveCharge,
    retrieveInvocie,
    updateInvoiceItems,
    deleteSubscriptionItem,
    getAllInvoiceItems,
    createInvoiceItems,
    updateStripeInvoice,
    voidStripeInvoice,
    finalizeStripeInvoice,
    createStripeInvoice,
    deleteInvoiceItems,
    retrievePaymentMethod
    
};
