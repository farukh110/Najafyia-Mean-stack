var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var fitrahSubTypesWithAmountSchema = new Schema({
    fitrahSubTypesWithAmountId: Schema.ObjectId,
    
    programSubCategory: {
        type: Schema.Types.ObjectId,
        ref: 'programSubCategory'
    },
    fitrahsubtype: {
        type: Schema.Types.ObjectId,
        ref: 'fitrahsubtype'
    },
    fitrahSubTypeAmount: {
        type: String,
    },
    isActive: {
        type: Boolean
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

module.exports = mongoose.model('fitrahSubTypesWithAmount', fitrahSubTypesWithAmountSchema);