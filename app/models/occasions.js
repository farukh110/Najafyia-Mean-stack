var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var occasionSchema = new Schema({
    occasionId: Schema.Types.ObjectId,
    occasionName: {
        type: String
    },
    programType: [{
        type: Schema.Types.ObjectId,
        ref: 'programType'
    }],
    program: [{
        type: Schema.Types.ObjectId,
        ref: 'program'
    }],
    programSubCategory: [{
        type: Schema.Types.ObjectId,
        ref: 'programSubCategory'
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

module.exports = mongoose.model('occasions', occasionSchema);