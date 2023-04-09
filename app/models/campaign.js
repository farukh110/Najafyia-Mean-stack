var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var campaignSchema = new Schema({
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
    title: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    targetAmount: {
        type: String,
        required: false
    },
    startDate: {
        type: String,
        required: false
    },
    endDate: {
        type: String,
        required: false
    },
    image: {
        type: String,
        required: true
    },
    isBanner: {
        type: Boolean,
        required: true
    },
    language: {
        type: String,
        default: "ENG"
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
    updatedBy: { type: String },
    displayOrder: {
        type: Number,
        default: 1
    },
});

module.exports = mongoose.model('Campaign', campaignSchema);