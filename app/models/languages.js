var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var languagesSchema = new Schema({
    languageId:Schema.Types.ObjectId,

    name: {
        type: String,
    }
});

module.exports = mongoose.model('languages',languagesSchema, 'languages');
