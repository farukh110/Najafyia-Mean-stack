var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var eventLogsSchema = new Schema({
    id: Schema.Types.ObjectId,
    
    eventName: {
        type: String,
        trim: true
    },
    eventType: {
        type: String,
    },
    triggeredBy: {
        type: String,
    },
    eventData: {
        type: Schema.Types.Mixed
    },
    agent: {
        type: String,
    },
    sessionId: {
        type: String,
    },
    level: {
        type: String,
    },
    device: {
        type: String,
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('eventLog', eventLogsSchema);