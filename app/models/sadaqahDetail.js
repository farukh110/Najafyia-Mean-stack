var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sadaqahDetailsSchema = new Schema({
    id: Schema.Types.ObjectId,

    donationDetail: {
        type: Schema.Types.Mixed
    },

    donor: {
        type: Schema.Types.Mixed
    },

    countryOfResidence: {
        type: Schema.Types.Mixed    
    },

    sadaqahDate: {
        type: Date
    },

    type: {
        type: String    //(Sunrise/Sunset)
    },

    gmtHour: {
        type: Number    
    },

    gmtHourPlusOne: {
        type: Number    
    },

    amountUSD: {
        type: Number,
        default: 0  
    },

    amountEUR: {
        type: Number,
        default: 0   
    },

    amountGBP: {
        type: Number,
        default: 0  
    },
    donorCurrency: {
        type: Schema.Types.Mixed
    },
    sadaqahAmount: {
        type: mongoose.Types.Decimal128
    },

    rate: {
        type: mongoose.Types.Decimal128,   
    },

    time: {         //(DateTime) sunrise/sunset datetime
        type: Date
    },

    created: {
        type: Date,
        default: Date.now
    },

    updated: {
        type: Date,
        default: Date.now
    },
    isDeleted : {
        type: Boolean,
        default : false
    },
    months: {
        type: Number
    },
    days: {
        type: Number
    }

});

module.exports = mongoose.model('sadaqahDetails', sadaqahDetailsSchema, 'sadaqahDetails');