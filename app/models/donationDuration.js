var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var donationDurationSchema = new Schema({
    donationDurationId: Schema.Types.ObjectId,

    donationDurationName: {
        type: String
    },
    noOfMonths: {
        type: Number
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: String
    },
    updatedBy: {
        type: String
    },
    language: {
        type: String
    },
});

module.exports = mongoose.model('donationduration', donationDurationSchema, 'donationduration');