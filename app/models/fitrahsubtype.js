var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var fitrahsubtypeSchema = new Schema({
    fitrahsubtypeId:Schema.Types.ObjectId,

    name: {
        type: String,
    },
    fitrahSubTypeAmount: {
        type: String,
    }
});

module.exports = mongoose.model('fitrahsubtype',fitrahsubtypeSchema, 'fitrahsubtype');