var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var donationRecurringSchema = new Schema({
    donationRecurringId: Schema.Types.ObjectId,
    donationDetails: {
        type: Object
    },
    program: [{
        type: Schema.Types.ObjectId,
        ref: 'program'
    }],
    programSubCategory: [{
        type: Schema.Types.ObjectId,
        ref: 'programSubCategory'
    }],
    donationDuration: [{
        type: Schema.Types.ObjectId,
        ref: 'donationduration'
    }],
    donar: [{
        type: Schema.Types.ObjectId,
        ref: 'donar'
    }],
    customerId: {
        type: String
    },
    nextDonationDate: {
        type: Date
    },
    count: {
        type: Number
    },
    amount: {
        type: Number
    },
    isActive: {
        type: Boolean,
        required: true
    },
    isSyed: {
        type: Boolean,

    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    },
    createdBy: { type: String },
    updatedBy: { type: String },
    freezed: {
        type: Boolean,
        default: false
    },
    orphan: {
        type: Object
    },
    student: {
        type: Object
    },
    endDate: {
        type: Date
    },
    freezedDate: {
        type: Date
    },
    changeRef: {
        type: Object
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    isChanged: {
        type: Boolean,
        default: false
    },
    noOfPaymentsRemaining: {
        type: Number,
        default: 0
    },
    stripeSubscriptionId: {
        type: String
    },

    // (only applicable when isRecurringProgram)
    paymentSchedule: {
        type: Schema.Types.Mixed
    },

    // > invoice id
    // > paymentIntentId
    // > amount
    // > payableBy (Akhyar, Donor)
    // > status (Paid/Unpaid)
    // > installmentDate
    // > paymentDate
    // > paidBy (Donor, Akhyar)
    // > attemptHistory
    // >> date
    // >> status
    // >> comment


    additionalData: {
        type: Schema.Types.Mixed
    },
    stageTransition: {
        type: String
    },
    stageTransitionDate: {
        type: Date
    },
    stageTransitionHistory:
    {
        type: Schema.Types.Mixed
    },
    subscriptionIdHistory: [{
        type: Object
    }],
    enableNotification: {
        type: Boolean,
    },
    subscriptionAmountHistory : [{
        type:Object
    }],
    isCancelled: {
        type: Boolean
    },
    isDeleted: {
        type: Boolean
    },
    comment: {
        type: String
    }
    
});

donationRecurringSchema.pre('save', function (next) {
    this.endDate = new Date(this.endDate).setHours(12);
    this.nextDonationDate = new Date(this.nextDonationDate).setHours(12);
    this.startDate = new Date(this.startDate).setHours(12);
    next();
});
module.exports = mongoose.model('donationRecurring', donationRecurringSchema);