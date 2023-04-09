var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Constants = require('../constants');
var donationItemSchema = new Schema({
    id: Schema.Types.ObjectId,
    body: Schema.Types.Mixed,
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    },
    state: {
        type: String,
        default: Constants.Database.DonationItem.State.NotStarted
    },//NotStarted, InProcess, Processed
    createdBy: { type: String },
    updatedBy: { type: String }
});

module.exports = mongoose.model('DonationItems', donationItemSchema);