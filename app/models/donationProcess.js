var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var donationProcessSchema = new Schema({
    donationProcessId: Schema.Types.ObjectId,

    isRecurring: {
        type: Boolean,
        required: true
    },
    donationDuration: [{
        type: Schema.Types.ObjectId,
        ref: 'donationduration'
    }],
    isDuration: {
        type: Boolean,
        required: true
    },
    isYearAround: {
        type: Boolean,
        required: true
    },
    isCount: {
        type: Boolean,
        required: true
    },
    isMinimumAmount: {
        type: Boolean,
    },
    isAmount: {
        type: Boolean,
    },
    durationStartDate: {
        type: String,
    },
    durationEndDate: {
        type: String,
    },
    countMin: {
        type: String,
    },
    countMax: {
        type: String,
    },
    interval: {
        type: String,
    },
    isSyed: {
        type: Boolean,
        default: false
    },
    isMarhomeenName: {
        type: Boolean,
        default: false
    },
    isCalendar: {
        type: Boolean,
        default: false
    },
    isOtherFieldForNiyaz: {
        type: Boolean,
        default: false
    },
    isOtherFieldForRP: {
        type: Boolean,
        default: false
    },
    amount: {
        type: Number,
        default: 0
    },
    minimumAmount: {
        type: Number,
    },
    isActive: {
        type: Boolean,
        required: true,
        default: true
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
    subscriptionDetail: {type: Schema.Types.Mixed,}




});

module.exports = mongoose.model('donationProcess', donationProcessSchema);

