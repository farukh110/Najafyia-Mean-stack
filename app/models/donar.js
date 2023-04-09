var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var donarSchema = new Schema({
    donarId: Schema.Types.ObjectId,
    user: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    donarName: {
        type: String,
        required: true,
        trim: true        
    },
    accountDetails: [{
        type: Schema.Types.ObjectId,
        ref: 'accountDetail'
    }],
    countryOfResidence: {
        type: String,
    },
    language: {
        type: String,
        required: false
    },
    email: {
        type: String,
        trim: true,
        unique: true
    },
    customerId: {
        type: String,
        trim: true,
        unique: false,
        required: false,
    },
    stripeCustomerIds: {
        type: Schema.Types.Mixed,
        unique: false,
        required: false,
    },
    countryCode: {
        type: String,
        trim: true,
        required: false
    },
    mobile: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
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
donarSchema.pre('save', function (next) {
    if(this.mobile && this.mobile.length && this.mobile.indexOf('undefined') >= 0) {
        this.mobile = null;
    }
    if (this.mobile && this.mobile[0] == "0" && this.mobile[1] == "0") {
        this.mobile = `+${this.mobile.substring(2,this.mobile.length)}`;
    }
    next();
});
module.exports = mongoose.model('donar', donarSchema);