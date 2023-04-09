var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var orphanSchema = new Schema({
    // orphanId:Schema.Types.ObjectId,

    orphanName: {
        type: String,
        required: true,
        trim: true,
    },
    contactDetails: {
        type: String,
        // required: true,
        trim: true,
    },
    familyName: {
        type: String,
        trim: true,
    },
    orphanId: {
        type: String,
        trim: true,
    },
    language: {
        type: String,
        trim: true,
    },
    startingDate: {
        type: String,
    },
    endingDate: {
        type: String,
    },
    isActive: {
        type: Boolean,
        required: true
    },
    isSyed: {
        type: Boolean,
        required: true,
        default: true
    },
    imageLink: {
        type: String,
        // required: true
    },
    dateOfBirth: {
        type: Date,
        trim: true,
    },
    gender: {
        type: String,
        required: true,
        trim: true,
    },
    country: {
        type: String,
        trim: true,
    },
    city: {
        type: String,
        trim: true,
    },
    fatherName: {
        type: String,
        trim: true,
    },
    motherName: {
        type: String,
        trim: true,
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    },
    descent: {
        type: String,
    },
    causeOfDeath: {
        type: String,
    },
    createdBy: { type: String },
    updatedBy: { type: String },
    priority: {
        type: Number,
        default: 1
    },
    orphanReservedTill :{
        type: Date,
    }
});

module.exports = mongoose.model('orphan', orphanSchema, 'orphan');
