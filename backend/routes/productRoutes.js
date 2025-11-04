const express = require('express');
const router = express.Router();
const Product = require('../modules/productSchema');
const Category = require('../modules/categorySchema');
const passport = require('passport');
const { singleImageUpload } = require('../middleware/multer');



// POST /api/products - Create product (admin only)
router.post('/addProduct', passport.authenticate('jwt', { session: false }), singleImageUpload, async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            discount,
            quantity,
            categorie,
        } = req.body;

        console.log(categorie);
        console.log(quantity);
        console.log(quantity);
        console.log(discount);
        console.log(price);
        

        
        
        
        
        // Check if category exists
        const category = await Category.findById(categorie);
        if (!category) {
            return res.status(400).json({ message: 'Invalid category' });
        }
        const product = new Product({
            name,
            description,
            price,
            discount,
            quantity,
            categorie,
            image: req.file ? req.file.path.replace(/\\/g, '/') : null
        });

        await product.save();

        res.status(201).json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});








router.get('/allProduct', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});





router.get('/getFilteredProduct', async (req, res) => {
    try {
        const { category, featured, search, minPrice, maxPrice } = req.query;
        const filter = {};

        if (category) filter.categorie = category;
        if (featured) filter.isFeatured = true;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        const products = await Product.find(filter).populate('categorie');
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/getProduct/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('categorie');
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        } 
        
        res.json(product);
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/products/:id - Update product (admin only)
router.put('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            discount,
            quantity,
            categorie,
            images,
            isFeatured
        } = req.body;

        // Check if category exists
        if (categorie) {
            const category = await Category.findById(categorie);
            if (!category) {
                return res.status(400).json({ message: 'Invalid category' });
            }
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name,
                description,
                price,
                discount,
                quantity,
                categorie,
                images,
                isFeatured
            },
            { new: true }
        ).populate('categorie');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/products/:id - Delete product (admin only)
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});




















// GET /api/products/featured - Get featured products
router.get('/featured', async (req, res) => {
    try {
        const products = await Product.find({ isFeatured: true }).populate('categorie');
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/products/category/:categoryId - Get products by category
router.get('/category/:categoryId', async (req, res) => {
    try {
        const products = await Product.find({
            categorie: req.params.categoryId
        }).populate('categorie');

        res.json(products);
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;