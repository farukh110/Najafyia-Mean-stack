var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var studentProfileSchema = new Schema({
    studentId: {
        type: String,
        required: true,
    },

    studentName: {
        type: String,
        required: true,
        trim: true,
    },
    descent: {
        type: String,
        required: true,
        default: true
    },
    dateOfBirth: {
        type: String
    },
    city: {
        type: String,
        trim: true
    },
    language: {
        type: String,
    },
    gender: {
        type: String,
        required: true,
        trim: true
    },
    grade: {
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
        required: true
    },
    imageLink: {
        type: String,
        // required: true
    },
    medicalLink: {
        type: String,
        // required: true
    },
    resultLink: {
        type: String,
        // required: true
    },
    sponsorName: {
        type: String,
        // required: true
    },
    sponsorEmail: {
        type: String,
        // required: true
    },
    sponsorPhone: {
        type: String,
        // required: true
    },
    donor: {
        type: Schema.Types.ObjectId,
        ref: 'donor'
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    },
    currentDonation: {
        type: Object,
    },
    createdBy: { type: String },
    updatedBy: { type: String },
    priority: {
        type: Number,
        default: 1
    }
});

module.exports = mongoose.model('studentprofile', studentProfileSchema, 'studentprofile_copy');
// module.exports = mongoose.model('studentprofile2', studentProfileSchema2, 'studentprofile2');
