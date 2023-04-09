var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var configSetting = new Schema({
    id: Schema.Types.ObjectId,
    key: {
        type: String,
        required: false
    },
    value: {
        type: Schema.Types.Mixed,
        required: false
    },
    created: {
        type: Date
    },
    updated: {
        type: Date
    }

});

module.exports = mongoose.model('configSetting', configSetting);