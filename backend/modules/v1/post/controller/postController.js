import mongoose from "mongoose";
import slugify from "slugify";
import Post from "../../../../database/models/post.js";
import Category from "../../../../database/models/Category.js";

const parseArrayInput = (input) => {
  if (!input) return [];
  return Array.isArray(input)
    ? input.filter(Boolean)
    : input
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
};

const validateCategories = async (categories) => {
  for (const id of categories) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new Error(`Invalid Category ID: ${id}`);
    const exists = await Category.findById(id);
    if (!exists) throw new Error(`Category not found: ${id}`);
  }
};

export const createPost = async (req, res) => {
  try {
    const { title, content, excerpt, categories, tags } = req.body;
    const author = req.user?._id;

    if (!author) return res.status(401).json({ message: "Unauthorized" });
    if (!title || !content)
      return res.status(400).json({ message: "Title and content required" });
    if (excerpt && excerpt.length > 300)
      return res
        .status(400)
        .json({ message: "Excerpt too long (max 300 chars)" });

    const categoriesArray = parseArrayInput(categories);
    const tagsArray = parseArrayInput(tags);

    await validateCategories(categoriesArray);

    let slug = slugify(title, { lower: true, strict: true });
    let counter = 1;
    while (await Post.findOne({ slug })) {
      slug = `${slugify(title, { lower: true, strict: true })}-${counter++}`;
    }

    const images = (req.files || []).map((f) => f.filename || f.path);

    const post = new Post({
      title,
      slug,
      content,
      excerpt,
      author,
      categories: categoriesArray,
      tags: tagsArray,
      images,
    });

    await post.save();
    return res.status(201).json({ message: "Post created", post });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

export const listPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      includeDeleted = "false",
      category,
      tag,
    } = req.query;

    const skip = (page - 1) * limit;
    const filter = {};
    if (includeDeleted !== "true") filter.isDeleted = false;
    if (category) filter.categories = category;
    if (tag) filter.tags = tag;

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit))
        .populate("author", "name email")
        .populate("categories", "name slug"),
      Post.countDocuments(filter),
    ]);

    return res.json({ posts, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getPost = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const post = await Post.findOne({
      $or: [{ _id: idOrSlug }, { slug: idOrSlug }],
    })
      .populate("author", "name email")
      .populate("categories", "name slug");

    if (!post || post.isDeleted)
      return res.status(404).json({ message: "Post not found" });

    return res.json({ post });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, categories, tags } = req.body;

    const post = await Post.findById(id);
    if (!post || post.isDeleted)
      return res.status(404).json({ message: "Post not found" });

    post.versions.push({
      title: post.title,
      content: post.content,
      images: post.images,
      updatedAt: new Date(),
      updatedBy: req.user?._id || null,
    });

    if (excerpt && excerpt.length > 300)
      return res
        .status(400)
        .json({ message: "Excerpt too long (max 300 chars)" });
    if (title && title.trim().length < 3)
      return res.status(400).json({ message: "Title too short" });

    if (title && title !== post.title) {
      let slug = slugify(title, { lower: true, strict: true });
      let counter = 1;
      while (await Post.findOne({ slug, _id: { $ne: post._id } })) {
        slug = `${slugify(title, { lower: true, strict: true })}-${counter++}`;
      }
      post.title = title;
      post.slug = slug;
    }

    if (content) post.content = content;
    if (excerpt) post.excerpt = excerpt;

    const categoriesArray = parseArrayInput(categories);
    const tagsArray = parseArrayInput(tags);

    await validateCategories(categoriesArray);

    post.categories = categoriesArray;
    post.tags = tagsArray;

    const newImages = (req.files || []).map((f) => f.filename || f.path);
    if (newImages.length) post.images.push(...newImages);

    await post.save();
    return res.json({ message: "Post updated", post });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

export const softDeletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Not found" });
    if (post.isDeleted)
      return res.status(400).json({ message: "Already deleted" });

    post.isDeleted = true;
    post.deletedAt = new Date();
    await post.save();
    return res.json({ message: "Post soft-deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const restorePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Not found" });

    post.isDeleted = false;
    post.deletedAt = null;
    await post.save();
    return res.json({ message: "Post restored" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const archivePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Not found" });

    post.archivedAt = new Date();
    await post.save();
    return res.json({ message: "Post archived" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const rollbackVersion = async (req, res) => {
  try {
    const { id, versionId } = req.params;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Not found" });

    const version = post.versions.id(versionId);
    if (!version) return res.status(404).json({ message: "Version not found" });

    post.versions.push({
      title: post.title,
      content: post.content,
      images: post.images,
      updatedAt: new Date(),
      updatedBy: req.user?._id || null,
    });

    post.title = version.title;
    post.content = version.content;
    post.images = version.images;

    await post.save();
    return res.json({ message: "Rolled back to version", post });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
