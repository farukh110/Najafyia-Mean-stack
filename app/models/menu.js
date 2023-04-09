var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var menuSchema = new Schema({
    menuId: Schema.Types.ObjectId,

    menuName: {
        type: String,
    },
    link: {
        type: String,
    },
    priority: {
        type: Number
    },
    isRoot: {
        type: Boolean
    },
    subMenu: [{
        type: Schema.Types.ObjectId,
        ref: 'menu'
    }],
    isActive: {
        type: Boolean,
    },
    language: {
        type: String
    }

});

module.exports = mongoose.model('menu', menuSchema, 'menu');
