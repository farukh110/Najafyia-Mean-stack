var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var notificationStatusSchema = new Schema({
    id: Schema.Types.ObjectId,

    donationId: {
        type: Schema.Types.ObjectId,   
    },

    program: {
        type: String   
    },

    additionalData: {
        type: Schema.Types.Mixed      
    },

    created: {
        type: Date,
        default: Date.now
    },

});

module.exports = mongoose.model('notificationStatus', notificationStatusSchema, 'notificationStatus');