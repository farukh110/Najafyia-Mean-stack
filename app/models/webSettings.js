var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var webSettingsSchema = new Schema({
    id: Schema.Types.ObjectId,
    webTitle: {
        type: String,
        trim: true
    },
    copyRights: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    },
    socialMedia: {
        type: Array,
        required: false
    },
    image: {
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

module.exports = mongoose.model('WebSettings', webSettingsSchema);