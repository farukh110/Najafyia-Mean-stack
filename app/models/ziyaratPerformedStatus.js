var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ziyaratPerformedSchema = new Schema({
    id: Schema.Types.ObjectId,
    consultantId: {
        type: String,
        required: false
    },
    ziaratDate: {
        type: Date,
        required: false
    },
    processedDate: {
        type: Date,
        required: false
    },
    totalZaireen: {
        type: Number,
        required: false
    },
    status: {
        type: String,
        required: false
    },
    consultant: {
        type: Schema.Types.Mixed,
        required: false
    },
    created: {
        type: Date
    },
    updated: {
        type: Date
    }

});

module.exports = mongoose.model('ZiyaratPerformedStatus', ziyaratPerformedSchema);