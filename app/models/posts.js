var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema({
    postId: Schema.Types.ObjectId,
    postName: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    imageLink: {
        type: String
    }
    ,
    description: {
        type: String
    },
    postContent: {
        type: String,
        required: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        required: true

    },
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

module.exports = mongoose.model('Post', postSchema);