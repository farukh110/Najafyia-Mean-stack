var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var stripeWebhookEventsSchema = new Schema({
    id: Schema.Types.ObjectId,
    eventType: {
        type: String
    },
    eventData: {
        type: Schema.Types.Mixed
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date
    }
});

module.exports = mongoose.model('stripeWebhookEvents', stripeWebhookEventsSchema, 'stripeWebhookEvents');