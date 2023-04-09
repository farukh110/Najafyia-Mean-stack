var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var donorProgramDetailsSchema = new Schema({
    id: Schema.Types.ObjectId,

    installmentNo: {
        type: Number
    },

    paymentDate: {
        type: Date
    },

    installmentDate: {
        type: Date
    },
    
    paymentStatus: {
        type: String
    },
    
    paymentIntentId: {
        type: String
    },

    comments: {
        type: String
    },

    created: {
        type: Date
    },

    amount: {
        type: Number
    },

    updated: {
        type: Date
    },

    invoiceLink: {
        type: String
    },
    stripeSubscriptionId: {
        type: String
    },
    stripeInvoiceId: {
        type: String
    },

    stripeChargeHistory: {
        type: Schema.Types.Mixed
    },

    donorProgram: {
        type: Schema.Types.Mixed
    },
    subscriptionIdHistory: [{
        type: Object
    }]
});

module.exports = mongoose.model('donorProgramDetails', donorProgramDetailsSchema, 'donorProgramDetails');