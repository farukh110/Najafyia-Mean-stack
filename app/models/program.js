var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var programSchema = new Schema({
    programId: Schema.Types.ObjectId,
    programName: {
        type: String,
        required: true,
        trim: true,

    },
    slug: {
        type: String,
        trim: true,
    },
    programPriority: {
        type: Number,
        trim: true,
    },
    programType: [{
        type: Schema.Types.ObjectId,
        ref: 'programType'
    }],
    programDescription: {
        type: String,
        trim: true
    },
    programSubCategory: [{
        type: Schema.Types.ObjectId,
        ref: 'programSubCategory'
    }],
    imageLink: {
        type: String
    },
    content: {
        type: String
    },
    donationProcess: [{
        type: Schema.Types.ObjectId,
        ref: 'donationProcess'
    }],
    isSyed: {
        type: Boolean,
        default: true
    },
    countryOfZiyarat: [{
        type: Schema.Types.ObjectId,
        ref: 'yCombo'
    }],
    isActive: {
        type: Boolean,
        required: true
    },
    created: {
        type: Date,
        default: Date.now()
    },
    updated: {
        type: Date,
        default: Date.now()
    },
    createdBy: { type: String },
    updatedBy: { type: String },
    language: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model('program', programSchema);