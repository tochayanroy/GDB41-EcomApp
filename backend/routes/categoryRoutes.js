const express = require('express');
const router = express.Router();
const Category = require('../modules/categorySchema');
const passport = require('passport');
const { singleImageUpload } = require('../middleware/multer');







// Create category
router.post('/createCategory', 
  passport.authenticate('jwt', { session: false }), 
  singleImageUpload, 
  async (req, res) => {
    
    try {
      const { name } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: 'Category name is required' });
      }

      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category already exists' });
      }

      const newCategory = new Category({
        name,
        image: req.file ? req.file.path.replace(/\\/g, '/') : null
      });

      await newCategory.save();
      res.status(201).json({
        success: true,
        category: newCategory
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ 
        success: false,
        message: 'Server error',
        error: err.message 
      });
    }
});

// Get all categories
router.get('/getAllCategories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });        
    res.json({ 
      success: true,
      categories 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Get single category
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ 
        success: false,
        message: 'Category not found' 
      });
    }
    res.json({ 
      success: true,
      category 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Update category
router.put('/update/:id', 
  passport.authenticate('jwt', { session: false }), 
  singleImageUpload,
  async (req, res) => {
    try {
      const { name } = req.body;
      const updateData = { name };

      if (req.file) {
        updateData.image = req.file.path.replace(/\\/g, '/');
      }

      const category = await Category.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!category) {
        return res.status(404).json({ 
          success: false,
          message: 'Category not found' 
        });
      }

      res.json({ 
        success: true,
        category 
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ 
        success: false,
        message: 'Server error' 
      });
    }
});

router.put('/updateImage/:id', passport.authenticate('jwt', { session: false }), singleImageUpload, async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ message: 'No image provided' });
		}

		const category = await Category.findByIdAndUpdate(
			req.params.id,
			{ image: req.file.path.replace(/\\/g, '/') },
			{ new: true }
		);

		if (!category) {
			return res.status(404).json({ message: 'Category not found' });
		}

		res.json(category);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Server error' });
	}
});

// Delete category
router.delete('/delete/:id', 
  passport.authenticate('jwt', { session: false }), 
  async (req, res) => {
    try {
      const category = await Category.findByIdAndDelete(req.params.id);
      if (!category) {
        return res.status(404).json({ 
          success: false,
          message: 'Category not found' 
        });
      }
      res.json({ 
        success: true,
        message: 'Category deleted successfully' 
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ 
        success: false,
        message: 'Server error' 
      });
    }
});

module.exports = router;