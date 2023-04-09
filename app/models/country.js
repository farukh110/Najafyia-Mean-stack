var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var countrySchema = new Schema({
    countryId: Schema.Types.ObjectId,

    name: {
        type: String,
    },
    alpha2: {
        type: String,
    },
    alpha3: {
        type: String,
    },
    dialCode: {
        type: String
    },
    religion: {
        type: String,
    },
    subRegion: {
        type: String,
    },
    latitude: {
        type: String,
    },
    longitude: {
        type: String,
    },
    sunrise: {
        type: Date,
    },
    sunset : {
        type: Date,
    },
    updated : {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('country', countrySchema, 'country');
