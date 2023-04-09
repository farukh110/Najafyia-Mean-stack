var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var programTypeSchema = new Schema({
    programTypeId: Schema.Types.ObjectId,
    programTypeName: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    created: {
        type: Date,
        default: Date.now()
    },
    updated: {
        type: Date,
        default: Date.now()
    },
    createdBy: { type: String },
    updatedBy: { type: String },
    language: { type: String }
});

module.exports = mongoose.model('programType', programTypeSchema);