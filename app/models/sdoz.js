var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sdozSchema = new Schema({
    sdozId: Schema.Types.ObjectId,

    name: {
        type: String,
    },
});

module.exports = mongoose.model('sdoz', sdozSchema, 'sdoz');