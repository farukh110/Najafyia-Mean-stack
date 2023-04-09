var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var osSchema = new Schema({
    osId: Schema.Types.ObjectId,
    donar: [{
        type: Schema.Types.ObjectId,
        ref: 'donor'
    }],
    donationdetails: [{
        type: Schema.Types.ObjectId,
        ref: 'donationDetail',
    }],
    orphans: [{
        type: Schema.Types.ObjectId,
        ref: 'orphan',
    }],
    sponsorshipAmount: {
        type: Number,
    },
    fromRecurring: {
        type: Boolean,
        required: false
    },
    startDate: {
        type: String,
    },
    endDate: {
        type: String,
    },
    isChanged: {
        type: Boolean,
    },
    currencyTitle: {
        type: String,
    },
    paymentDate: {
        type: String,
    },
    autoRenew: {
        type: Boolean,
        default: false
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
    updatedBy: { type: String }
});

module.exports = mongoose.model('orphanScholarship', osSchema);