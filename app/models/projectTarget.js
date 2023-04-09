var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var achievementRateSchema = new Schema({
    target: {
        type: Number,
        trim: true,
        required: true,

    },
    achieved: {
        type: Number,
        trim: true,
        required: true,
    },
    currencyTitle: {
        type: String,
        trim: true,
        required: true,
    },
    updated: {
        type: Date,
        default: Date.now()
    },
    created: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('achievementRate', achievementRateSchema);