import mongoose from 'mongoose';

// Category model
let Category;
try { Category = mongoose.model('Category'); }
catch {
  const categorySchema = new mongoose.Schema(
    { category: { type: String, required: true, trim: true, unique: true } },
    { timestamps: true }
  );
  Category = mongoose.model('Category', categorySchema);
}

// Shape to old format the frontend expects
const toOld = (c) => ({
  cat_id:   String(c._id),
  _id:      c._id,
  category: c.category,
  createdAt: c.createdAt,
});

export const getAllCategories = async (req, res) => {
  try {
    const cats = await Category.find().sort({ createdAt: 1 }).lean();
    res.json(cats.map(toOld));
  } catch (e) { res.status(500).json({ error: e.message }); }
};

export const getSingleCategory = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.cid).lean();
    res.json(cat ? toOld(cat) : {});
  } catch (e) { res.status(500).json({ error: e.message }); }
};

export const saveCategory = async (req, res) => {
  try {
    const cat = await new Category({ category: req.body.cat }).save();
    res.json({ result: 'Category Saved', cat_id: String(cat._id) });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

export const updateCategory = async (req, res) => {
  try {
    await Category.findByIdAndUpdate(req.params.cid, { category: req.body.cat });
    res.json({ result: 'Category Updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

export const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.cid);
    res.json({ result: 'Category Deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
