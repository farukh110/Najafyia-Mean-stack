var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var representativesSchema = new Schema({
    id: Schema.Types.ObjectId,
    name: {
        type: String,
        required: true,
        trim: true
    },
    designation: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    },
    phone: {
        type: String,
        required: false
    },
    country: {
        type: String,
        required: false
    },
    city: {
        type: String,
        required: false
    },
    currency: {
        type: String,
        required: false
    },
    amount: {
        type: String,
        required: false
    },
    image: {
        type: String,
        required: false
    },
    socialMedia:{
        type:Array,
        required: false
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
    updatedBy: { type: String }
});

module.exports = mongoose.model('Representatives', representativesSchema);