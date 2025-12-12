import mongoose from "mongoose";

const versionSchema = new mongoose.Schema({
  title: String,
  content: String,
  images: [String],        
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { _id: true });

const postSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },   
  excerpt: { type: String },                      
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
  tags: [{ type: String }],
  images: [{ type: String }],                   
  versions: [versionSchema],                   
  isDeleted: { type: Boolean, default: false },  
  deletedAt: { type: Date },
  archivedAt: { type: Date },                  
}, {
  timestamps: true
});

const Post = mongoose.model("Post", postSchema);
export default Post;
