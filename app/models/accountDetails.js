var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var accountDetailSchema = new Schema({
    accountDetailId:Schema.Types.ObjectId,

    accountHolderName: {
        type: String,
    },
    cardNumber: {
        type: String,
        // unique:true
    },
    expiryMonth: {
        type: String,
    },
    expiryYear: {
        type: String
    },
    CVC: {
        type: String,
    }
});

module.exports = mongoose.model('accountDetail',accountDetailSchema);