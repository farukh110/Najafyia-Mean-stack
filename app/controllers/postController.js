var Post = require('../models/posts.js');
var ObjectID = require('mongodb').ObjectID;

//generating hash using for password encryption
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);

//Create post
module.exports.addPost = function (req, res) {
    var post = new Post({
        postName: req.body.title,
        postContent: req.body.content,
        description: req.body.description,
        imageLink: (req.body.imageLink == undefined ? "defaultpost.jpg" : req.body.imageLink),
        isActive: true
    })
    post.save(function (error) {
        if (error) {
            throw error;
        }
        else {
            res.json('Post created Sucessfully');
        }
    })
}
// update Post
module.exports.updatePost = function (req, res) {
    Post.findById(req.body.id, (err, post) => {
        if (err) {
            res.status(500).send(err);
        } else {
            post.postName = req.body.title || post.postName;
            post.postContent = req.body.content || post.postContent;
            post.description = req.body.description || post.description;
            post.imageLink = req.body.imageLink;
            post.updated = Date.now();
            post.save((err, post) => {
                if (err) {
                    res.status(500).send(err)
                }
                res.json('post updated Sucessfully');
            });
        }
    });
}
// Delete Post
module.exports.deletePost = function (req, res) {
    Post.findByIdAndRemove(req.params.Id, function (err, post) {
        let response = {
            message: "Post Deleted Sucessfully",
            id: post._id
        };
        res.status(200).send(response);
    });
}
//select all posts
module.exports.postList = function (req, res) {

    Post.find({}).sort([['created', -1]]).exec(function (err, posts) {
        res.status(200).send(posts);
    });
}
//select all posts
module.exports.relatedPostList = function (req, res) {

    Post.find({ _id: { $ne: req.body.id } }).sort([['created', -1]]).exec(function (err, posts) {
        res.status(200).send(posts);
    });
}
//select post by id
module.exports.postById = function (req, res) {

    Post.findById(req.params.Id, function (err, posts) {
        res.status(200).send(posts);
    });
}