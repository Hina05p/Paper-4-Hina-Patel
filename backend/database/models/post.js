import mongoose from "mongoose";

const postSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true,
    trim: true
  },

  content: {
    type: String,
    required: true
  },

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  image: {
    type: String,
    default: ""
  },

  status: {
    type: String,
    enum: ["draft", "published"],
    default: "published"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

const Post = mongoose.model("Post", postSchema);

export default Post;