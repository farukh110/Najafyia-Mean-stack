var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var citySchema = new Schema({
    id: Schema.Types.ObjectId,
    
    country: {
        type: String,
        trim: true
    },
    name: {
        type: String,
        required: true
    },
    lat: {
        type: String,
        required: false
    },
    long: {
        type: String,
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
});

module.exports = mongoose.model('cities', citySchema);