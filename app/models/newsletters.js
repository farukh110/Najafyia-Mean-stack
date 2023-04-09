var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var newslettersSchema = new Schema({
    id: Schema.Types.ObjectId,
    firstName: {
        type: String,
        required: false
    },
    lastName: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    country: {
        type: String,
        required: false
    },
    subscription: {
        type: Boolean,
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
    createdBy: {type: String},
    updatedBy: {type: String},
    language: {
        type: String,
        required: false
    },
});

module.exports = mongoose.model('Newsletters', newslettersSchema);