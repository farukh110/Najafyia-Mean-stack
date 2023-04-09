var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pdfTemplatesSchema = new Schema({
    id: Schema.Types.ObjectId,

    name: {
        type: String   
    },

    format: {
        type: String   
    },

    timeout: {
        type: Number   
    },

    header: {
        type: Schema.Types.Mixed      
    },

    footer: {
        type: Schema.Types.Mixed      
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

module.exports = mongoose.model('pdfTemplates', pdfTemplatesSchema, 'pdfTemplates');