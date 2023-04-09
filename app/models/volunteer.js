var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var volunteerSchema = new Schema({
    volunteerId: Schema.Types.ObjectId,
    name: {
        type: String,
        required: true,
        trim: true
    },
    from: {
        type: String,
        required: false
    },
    to: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    },
    phone: {
        type: String,
        required: false
    },
    age: {
        type: String,
        required: false
    },
    country: {
        type: String,
        required: false
    },
    nationality: {
        type: String,
        required: false
    },
    language: {
        type: Object,
        required: false
    },
    photo: {
        type: String,
        required: false
    },
    cv: {
        type: String,
        required: false
    },
    isActive: {
        type: Boolean,
        required: true

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
volunteerSchema.pre('save', function (next) {
    this.cv = `uploads/${this.cv}`;
    this.photo = `uploads/${this.photo}`;
    next();
});
module.exports = mongoose.model('volunteer', volunteerSchema);