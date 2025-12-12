import Category from "../../../../database/models/Category.js";
import slugify from "slugify";

// Create category
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    const slug = slugify(name, { lower: true, strict: true });

    const existing = await Category.findOne({ slug });
    if (existing)
      return res.status(409).json({ message: "Category already exists" });

    const category = new Category({ name, slug });
    await category.save();
    res.status(201).json({ message: "Category created", category });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all categories
export const listCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    const slug = slugify(name, { lower: true, strict: true });
    const existing = await Category.findOne({ slug, _id: { $ne: id } });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Category with this name already exists" });
    }
    const category = await Category.findByIdAndUpdate(
      id,
      { name, slug },
      { new: true }
    );

    if (!category)
      return res.status(404).json({ message: "Category not found" });

    res.json({ message: "Category updated", category });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
