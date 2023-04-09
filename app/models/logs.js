var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var logsSchema = new Schema({
    id: Schema.Types.ObjectId,
    action: Schema.Types.String,
    error: Schema.Types.Mixed,
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

module.exports = mongoose.model('Logs', logsSchema);