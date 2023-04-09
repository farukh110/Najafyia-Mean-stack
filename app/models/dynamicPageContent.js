var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var dynamicPageContentSchema = new Schema({
    pageId: Schema.Types.ObjectId,
    title: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    order: {
        type: Number,
        required: false
    },
    titleImage: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    pageContent: {
        type: String,
        required: false
    },
    parentPageName: {
        type: String,
        required: false
    },
    subParentPageId: {
        type: String,
        required: false
    },
    slug: {
        type: String,
        required: false
    },
    gallery: {
        type: Array,
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
    createdBy: {type: String},
    updatedBy: {type: String}
});

module.exports = mongoose.model('dynamicPageContent', dynamicPageContentSchema);