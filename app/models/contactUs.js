var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const contactUsScehma = new Schema({
 firstName : {
     type: String,
     required: true,
     trim: true
 },
 created:{
    type: Date,
    default: Date.now
 },
 lastName : {
     type: String,
     required: true,
     trim: true
 },
 email : {
     type: String,
     required: true,
     trim: true,
 },
 subject : {
     type: String,
     required: true,
     trim: true
 },
 contactMessage : {
     type: String,
     required: true,
     },
});

module.exports = mongoose.model('contactUs',contactUsScehma,'contact-us');