var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var suggestedDonationsSchema = new Schema({
    id: Schema.Types.ObjectId,
    programType: [{
        type: Schema.Types.ObjectId,
        ref: 'programType'
    }],
    program: [{
        type: Schema.Types.ObjectId,
        ref: 'program'
    }],
    programSubCategory: [{
        type: Schema.Types.ObjectId,
        ref: 'programSubCategory'
    }],
    language: {
        type: String,
        required: true

    },
    isActive: {
        type: Boolean,
        required: true

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

module.exports = mongoose.model('SuggestedDonations', suggestedDonationsSchema);