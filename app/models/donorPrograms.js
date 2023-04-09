var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var donorProgramsSchema = new Schema({
    id: Schema.Types.ObjectId,

    program: {
        type: Schema.Types.Mixed
    },

    // program (Object)
    // > Program Type (with id, name, slug)
    // > Program (with id, name, slug, allowAutoRenew, cancellationMode) from donationprocess 
    // > Program Subcategory (with id, name, slug)
    // > Additional metadata based on program selected"

    donor: {
        type: Schema.Types.Mixed
    },


    orphan: {
        type: Schema.Types.Mixed
    },
    // paymentMethodId
    // cardLastFourDigits
    // cardexpiryDate
    // stripeCustomerId

    startDate: {
        type: Date
    },

    isRecurringProgram: {
        type: Boolean
    },

    paymentPlan: {
        type: Schema.Types.Mixed
    },

    endDate: {
        type: Date
    },

    isAutoRenewal: {
        type: Boolean
    },

    totalAmount: {
        type: Number
    },

    totalSubscriptionAmount: {
        type: Number
    },

    currency: {
        type: String
    },

    comments: {
        type: String
    },

    paymentIntentId: {
        type: String
    },

    created: {
        type: Date,
        default: Date.now
    },

    updated: {
        type: Date
    },

    stripeSubscriptionId: {
        type: String
    },

    lastPaymentDate: {
        type: Date
    },

    lastPaymentStatus: {
        type: String
    },

    subscriptionStatus: {
        type: String
    },

    cancellationDate: {
        type: Date
    },

    createdBy: {
        type: String
    },

    updatedBy: {
        type: String
    },
    stripeSubscriptionStatus: {
        type: String
    },
    subscriptionIdHistory: [{
        type: Object
    }],
    subscriptionAmountHistory : [{
        type:Object
    }],
    cancelledBy: {
        type: String
    },
});

module.exports = mongoose.model('donorPrograms', donorProgramsSchema, 'donorPrograms');



   
