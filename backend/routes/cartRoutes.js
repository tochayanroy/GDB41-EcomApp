const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Add this import

const Cart = require('../modules/cartSchema');
const Product = require('../modules/productSchema');
const passport = require('passport');


// Helper function to calculate totals
const calculateCartTotals = (cart) => {
	cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
	cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
	return cart;
};


// 1. Get user's cart
router.get('/getCart', passport.authenticate('jwt', { session: false }), async (req, res) => {
	try {
		const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');		
		res.json(cart);
	} catch (err) {
		res.status(500).send('Server error.');
	}
});


// Add item to cart
router.post('/add/:productId', passport.authenticate('jwt', { session: false }), async (req, res) => {
	try {
		const { quantity = 1 } = req.body; // Default quantity to 1 if not provided
		const product = await Product.findById(req.params.productId);

		if (!product) {
			return res.status(404).json({ success: false, message: 'Product not found' });
		}

		let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

		if (!cart) {
			// If no cart exists, create a new one with the product
			cart = new Cart({
				user: req.user._id,
				items: [{ product: product._id, quantity, price: product.price }]
			});
		} else {
			// Check if product already exists in cart
			const existingItemIndex = cart.items.findIndex(item =>
				item.product._id.toString() === req.params.productId
			);

			if (existingItemIndex !== -1) {
				// If product exists, just increase the quantity
				cart.items[existingItemIndex].quantity += quantity;
			} else {
				// If product doesn't exist, add it to cart
				cart.items.push({ product: product._id, quantity, price: product.price });
			}
		}

		calculateCartTotals(cart);
		await cart.save();

		res.json({
			success: true,
			cart: await cart.populate('items.product'),
			message: 'Product added to cart'
		});

	} catch (error) {
		console.error('Add to cart error:', error);
		res.status(500).json({
			success: false,
			message: 'Server error while adding to cart'
		});
	}
});



// 3. Remove item from cart
router.delete('/removeCart/:productId', passport.authenticate('jwt', { session: false }), async (req, res) => {
	try {
		const cart = await Cart.findOne({ user: req.user._id });
		if (!cart) return res.status(404).send('Cart not found.');

		cart.items = cart.items.filter(item => item.product.toString() !== req.params.productId);

		// Update totals
		cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
		cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

		await cart.save();
		res.json(cart);
	} catch (err) {
		res.status(500).send('Server error.');
	}
});

// 4. Update cart item quantity
router.patch('/updateCart/:productId', passport.authenticate('jwt', { session: false }), async (req, res) => {
	const { quantity } = req.body;
	try {
		const cart = await Cart.findOne({ user: req.user._id });
		if (!cart) return res.status(404).send('Cart not found.');

		const itemIndex = cart.items.findIndex(item => item.product.toString() === req.params.productId);
		if (itemIndex < 0) return res.status(404).send('Item not found in cart.');

		cart.items[itemIndex].quantity = quantity;

		// Update totals
		cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
		cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

		await cart.save();
		res.json(cart);
	} catch (err) {
		res.status(500).send('Server error.');
	}
});

module.exports = router;