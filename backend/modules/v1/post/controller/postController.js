import PostModel from "../../../../database/models/post.js";

export const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content)
      return res.status(400).json({ message: "Title and Content required" });

    const post = await PostModel.create({
      title,
      content,
      author: req.user._id,
    });

    res.status(201).json({ message: "Post Created", post });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await PostModel.find();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updatePost = async (req, res) => {
  try {
    const updated = await PostModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updated) return res.status(404).json({ message: "Post not found" });

    res.json({ message: "Post Updated", updated });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const deleted = await PostModel.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ message: "Post not found" });

    res.json({ message: "Post Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default { createPost, getAllPosts, updatePost, deletePost };
