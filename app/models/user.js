var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    userId: Schema.Types.ObjectId,
    userName: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    firstName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        unique: true
    },
    mobile: {
        type: String,
        trim: true
    },
    gender: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    file: {
        type: String,
        default: null,
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
    createdBy: { type: String },
    updatedBy: { type: String },
    role: {
        type: [String],
        trim: true,
        required: true
    },
    language: {
        type: String,
        required: false
    },
    countryOfResidence: {
        type: String,
        required: false
    },
    countryCode: {
        type: String,
        trim: true,
        required: false
    },
    resetPasswordToken: {
        type: String,
        trim: true
    },
    resetPasswordExpires: {
        type: Date,
        trim: true
    },
    contactEmailAddress: {
        type: String,
        trim: true,
    }
});
userSchema.pre('save', function (next) {
    if(this.mobile && this.mobile.length && this.mobile.indexOf('undefined') >= 0) {
        this.mobile = null;
    }
    if (this.mobile && this.mobile[0] == "0" && this.mobile[1] == "0") {
        this.mobile = `+${this.mobile.substring(2,this.mobile.length)}`;
    }
    next();
});
module.exports = mongoose.model('User', userSchema);