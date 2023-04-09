var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var emailTemplatesSchema = new Schema({
    id: Schema.Types.ObjectId,

    name: {
        type: String   
    },

    to: {
        type: String    
    },

    from: {
        type: String    
    },

    CC: {
        type: String    
    },

    BCC: {
        type: String    
    },

    subject: {
        type: String    
    },

    body: {
        type: String    
    },

    created: {
        type: Date,
        default: Date.now
    },

    updated: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model('emailTemplates', emailTemplatesSchema, 'emailTemplates');