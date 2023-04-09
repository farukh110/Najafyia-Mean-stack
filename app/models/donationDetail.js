var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var donationDetailSchema = new Schema({
    donationDetailId: Schema.Types.ObjectId,
    donation: {
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
    orphan: [{
        type: Schema.Types.ObjectId,
        ref: 'orphan'
    }],
    amount: {
        type: Number
    },
    marhomeenName: {
        type: String
    },
    occasion: {
        type: Schema.Types.ObjectId,
        ref: 'occasions'
    },
    dua: {
        type: Schema.Types.ObjectId,
        ref: 'dua'
    },
    calendarForSacrifice: {
        type: String
    },
    sdoz: [{
        type: Schema.Types.ObjectId,
        ref: 'sdoz'
    }],
    fitrahSubType: {
        type: Array
    },
    sahm: [{
        type: Schema.Types.ObjectId,
        ref: 'sahms'
    }],
    otherPersonalityName: {
        type: String
    },
    isActive: {
        type: Boolean,
        required: true
    },
    isRecurring: {
        type: Boolean,

    },
    autoRenew: {
        type: Boolean,
        default: false
    },
    isSyed: {
        type: Boolean,
        default: false,
    },
    count: {
        type: String
    },
    countryOfResidence: [{
        type: Schema.Types.ObjectId,
        ref: 'country'
    }],
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    },
    createdBy: {type: String},
    updatedBy: {type: String},
    comments: {type: String},
    endDate: {
        type: Date
    },
    lastReadByJobAt: {
        type: Date,
        default: null
    },
    isEndDateUpdated: {
        type: Boolean,
        default: false
    },
    additionalData: {
        type: Schema.Types.Mixed
    },
    installmentNumber : {
        type: Number
    }
});
donationDetailSchema.pre('save', function (next) {
    this.endDate = new Date(this.endDate).setHours(12);
    next();
});
module.exports = mongoose.model('donationDetail', donationDetailSchema);