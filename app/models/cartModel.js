var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var cartModelSchema = new Schema({
    cartId: Schema.Types.ObjectId,

    user: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        model: 'user'
    }],
    cart: {
        type: String
    },
    createdBy: {type: String},
    updatedBy: {type: String},
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    }


});

module.exports = mongoose.model('cartModel', cartModelSchema);