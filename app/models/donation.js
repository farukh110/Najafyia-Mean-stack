var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var donationSchema = new Schema({
    donationId: Schema.Types.ObjectId,
    emailResponse: {
        type: Schema.Types.Mixed,
        required: false
    },
    donor: [{
        type: Schema.Types.ObjectId,
        ref: 'donor',
        model: 'donar'
    }],
    donationdetails: [{
        type: Schema.Types.ObjectId,
        ref: 'donationDetail',
        required: false
    }],
    orphan: [String],
    student: [String],
    status: {
        type: String
    },
    documentPath: {
        type: String
    },
    documentPathKhums: {
        type: String
    },
    commitmentDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        default: Date.now
    },
    chargeId: {
        type: String
    },
    customerId: {
        type: String
    },
    invoiceNo: {
        type: String,
    },
    currency: {
        type: String,
        unique: false
    },
    currencyTitle: {
        type: String,
        unique: false
    },
    isActive: {
        type: Boolean,
        required: true
    },
    isKhums: {
        type: Boolean,
        default: false
    },
    amount: {
        type: Number,
        required: false
    },
    totalAmount: {
        type: Number,
        required: true
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
    updatedBy: { type: String },
    payment_intent_id: {
        type: String,
    },
    additionalData: {
        type: Schema.Types.Mixed,
    }
});
donationSchema.pre('save', function (next) {
    this.endDate = new Date(this.endDate).setHours(12);
    next();
});
module.exports = mongoose.model('donation', donationSchema);