var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var studentSpSchema = new Schema({
    StudentSpId: Schema.Types.ObjectId,
    donar: [{
        type: Schema.Types.ObjectId,
        ref: 'donor'
    }],
    donationdetails: [{
        type: Schema.Types.ObjectId,
        ref: 'donationDetail',
    }],
    students: [{
        type: Schema.Types.ObjectId,
        ref: 'studentProfile',
    }],
    sponsorshipAmount: {
        type: Number,
    },
    currencyTitle: {
        type: String,
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
    paymentDate: {
        type: String,
    },
    autoRenew: {
        type: Boolean,
        default: false
    },
    isChanged: {
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

module.exports = mongoose.model('studentSponsorship', studentSpSchema);