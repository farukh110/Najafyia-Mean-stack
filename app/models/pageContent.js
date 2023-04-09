var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pageContentSchema = new Schema({
    pageId: Schema.Types.ObjectId,
    pageName: {
        type: String,
        required: true,
        trim: true
    },
    faqQuestionAnswers: {
        type: Array,
        required: false
    },
    faqSupportText: {
        type: String,
        required: false
    },
    contactGetInTouch: {
        type: String,
        required: false
    },
    contactHeadOffice: {
        type: String,
        required: false
    },
    contactJoinUsText: {
        type: String,
        required: false
    },
    contactSocialMedia: {
        type: Array,
        required: false
    },
    contactEmailAddress: {
        type: String,
        required: false
    },
    homeSlider: {
        type: Array,
        required: false
    },
    homeCampaignBanners: {
        type: String,
        required: false
    },
    homeInfoGraphicsBanner: {
        type: String,
        required: false
    },
    homeBanner1: {
        type: String,
        required: false
    },
    homeBanner1CampaignUrl: {
        type: String,
        required: false
    },
    homeBanner2: {
        type: String,
        required: false
    },
    homeBanner3: {
        type: String,
        required: false
    },
    titleImage:{
        type: String,
        required: false
    },
    pageDescription:{
        type: String,
        required: false
    },
    galleryMedia: {
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

module.exports = mongoose.model('PageContent', pageContentSchema);