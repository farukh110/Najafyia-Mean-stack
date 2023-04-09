var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sahmsSchema = new Schema({
    sahmsId: Schema.Types.ObjectId,

    name: {
        type: String,
    }
});

module.exports = mongoose.model('sahms', sahmsSchema, 'sahms');