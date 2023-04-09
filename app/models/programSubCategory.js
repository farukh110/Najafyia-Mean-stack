var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var programSubCategorySchema = new Schema({
    programSubCategoryId: Schema.ObjectId,
    programSubCategoryName: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        trim: true
    },
    programPriority: {
        type: Number,
        trim: true,
    },
    programType: {
        type: Schema.Types.ObjectId,
        ref: 'programType'
    },
    imageLink: {
        type: String
    },
    description: {
        type: String
    },
    isLanding: {
        type: Boolean
    },
    isCountryFoZiyarat: {
        type: Boolean,
        default: false,
    },
    isSDOZ: {
        type: Boolean,
        default: false,
    },
    isSahm: {
        type: Boolean,
        default: false,
    },
    sahms: [{
        type: Schema.Types.ObjectId,
        ref: 'sahms'
    }],
    countryOfZiyarat: {
        type: Schema.Types.ObjectId,
        ref: 'country'
    },
    sdoz: [{
        type: Schema.Types.ObjectId,
        ref: 'sdoz'
    }],
    isFirtahSubType: {
        type: Boolean,
        default: false,
    },
    fitrahSubTypes: {
        type: Array
    },
    isFixedAmount: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean
    },
    fixedAmount: {
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
    amountBasedOnCountry:{
        type: Boolean,
        default: false
    },
    countryWiseAmount:{
        type: Array
    },
    createdBy: { type: String },
    updatedBy: { type: String },
    language: { type: String }
});

module.exports = mongoose.model('programSubCategory', programSubCategorySchema);