var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var pageSchema = new Schema({
  pageId: Schema.Types.ObjectId,
  pageName: {
    type: String,
    required: true,
    trim: true
  },
  pageContent: {
    type: String,
    required: true,
    trim: true
  },
  pageLink: {
    type: String,
    required: true
  },
  language: {
    type: String,
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
  slug: {
    type: String
  },
  createdBy: { type: String },
  updatedBy: { type: String }
});

module.exports = mongoose.model("Page", pageSchema);
