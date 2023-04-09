var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var duaSchema = new Schema({
    duaId: Schema.Types.ObjectId,
    duaName: {
        type: String
    },
    occasion: [{
        type: Schema.Types.ObjectId,
        ref: 'occasions'
    }],
    fixedAmount: {
        type: Number
    },
    language: {
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
    createdBy: { type: String },
    updatedBy: { type: String }
});

module.exports = mongoose.model('dua', duaSchema);