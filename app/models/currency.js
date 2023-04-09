var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var currencySchema = new Schema({
    currencyId:Schema.Types.ObjectId,

    name: {
        type: String,
        unique: true,
    },
    rate: {
        type: String,
    },
    created: {
        type: Date,
        default: Date.now
    },
    symbol: {
        type: String,
    },
    updated : {
        type: Date,
        default: Date.now
    },
    rateFromApi: {
        type: mongoose.Types.Decimal128,
    },
    displayOrder: {
        type: Number
    },
    translatedTitle: {
        type: Schema.Types.Mixed
    },
    isActive:{
        type:Boolean
    }
});

module.exports = mongoose.model('currency',currencySchema, 'currency');