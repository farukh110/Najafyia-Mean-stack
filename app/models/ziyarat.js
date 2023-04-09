var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ziyaratSchema = new Schema({
    id: Schema.Types.ObjectId,
    fullName: {
        type: String,
        required: false
    },
    date: {
        type: String,
        required: false
    },
    country: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    },
    consultantEmail: {
        type: String
    },
    phone: {
        type: String,
        required: false
    },
    userId: {
        type: String,
        required: false
    },
    isSelectedForZiyarat: {
        type: Boolean,
        required: false
    },
    isVisited: {
        type: Boolean,
        required: false
    },
    isActive: {
        type: Boolean,
        required: false
    },
    hasAssigned: {
        type: Boolean,
        required: false
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
    emailSent:{type: Boolean},
    smsSent:{type: Boolean},
    emailResponse:{type : String},
    smsResponse:{type:String },
    ziyaratDate: {
        type: Date}

});

module.exports = mongoose.model('Ziyarat', ziyaratSchema);