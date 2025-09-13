const express = require('express');
const router = express.Router();
const Watchlist = require('../modules/watchlistSchema');
const Product = require('../modules/productSchema');
const passport = require('passport');


const getOrCreateWatchlist = async (userId) => {
	let watchlist = await Watchlist.findOne({ user: userId });
	if (!watchlist) {
		watchlist = new Watchlist({ user: userId, products: [] });
		await watchlist.save();
	}
	return watchlist;
};


// GET user's watchlist
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
	try {
		const watchlist = await Watchlist.findOne({ user: req.user.id })
			.populate('products.product', 'name price image discount');

		res.json(watchlist?.products || []);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Server error' });
	}
});


// POST /api/watchlist/:productId - Add to watchlist
router.post('/addWatchlist/:productId', passport.authenticate('jwt', { session: false }), async (req, res) => {
	try {
		// Check if product exists
		const product = await Product.findById(req.params.productId);

		if (!product) {
			return res.status(404).json({ message: 'Product not found' });
		}
		// Find or create watchlist for user
		let watchlist = await Watchlist.findOne({ user: req.user.id });

		if (!watchlist) {
			watchlist = new Watchlist({
				user: req.user.id,
				products: []
			});
		}
		// Check if product already in watchlist
		const existingItem = watchlist.products.find(
			item => item.product.toString() === req.params.productId
		);

		if (existingItem) {
			return res.status(400).json({ message: 'Product already in watchlist' });
		}
		// Add product to watchlist
		watchlist.products.push({
			product: req.params.productId,
			addedAt: new Date()
		});

		await watchlist.save();

		res.status(201).json({ message: 'Product added to watchlist' });
	} catch (err) {
		console.error(err);
		if (err.kind === 'ObjectId') {
			return res.status(404).json({ message: 'Product not found' });
		}
		res.status(500).json({ message: 'Server error' });
	}
});

// DELETE /api/watchlist/:productId - Remove from watchlist
router.delete('/deleteWatchlist/:productId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        console.log('Deleting product ID:', req.params.productId); // Log incoming ID
        const watchlist = await Watchlist.findOne({ user: req.user.id });
        
        if (!watchlist) {
            return res.status(404).json({ message: 'Watchlist not found' });
        }

        console.log('Current products in watchlist:', watchlist.products); // Log current products

        // Log each product ID for comparison
        watchlist.products.forEach(item => {
            console.log(`Stored product ID: ${item.product.toString()}, Type: ${typeof item.product}`);
        });

        const initialLength = watchlist.products.length;
        watchlist.products = watchlist.products.filter(
            item => item.product.toString() !== req.params.productId
        );

        if (initialLength === watchlist.products.length) {
            console.log('No product was removed - ID not found');
        }

        await watchlist.save();
        console.log('Updated watchlist:', watchlist.products); // Log updated list

        res.json({ message: 'Product removed from watchlist', watchlist });
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Invalid product ID' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// TOGGLE product in watchlist
router.post('/toggle/:productId', passport.authenticate('jwt', { session: false }), async (req, res) => {
	try {
		// Validate product exists
		const product = await Product.findById(req.params.productId);
		if (!product) {
			return res.status(404).json({ message: 'Product not found' });
		}

		const watchlist = await getOrCreateWatchlist(req.user.id);
		const productIndex = watchlist.products.findIndex(
			item => item.product.toString() === req.params.productId
		);

		// Toggle existence
		if (productIndex > -1) {
			watchlist.products.splice(productIndex, 1);
			await watchlist.save();
			return res.json({
				message: 'Product removed from watchlist',
				inWishlist: false,
				watchlist: watchlist.products
			});
		} else {
			watchlist.products.push({
				product: req.params.productId,
				addedAt: new Date()
			});
			await watchlist.save();
			return res.json({
				message: 'Product added to watchlist',
				inWishlist: true,
				watchlist: watchlist.products
			});
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Server error' });
	}
});







module.exports = router;