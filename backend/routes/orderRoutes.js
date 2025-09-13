const express = require('express');
const router = express.Router();
const Order = require('../modules/orderSchema');
const Cart = require('../modules/cartSchema');
const Product = require('../modules/productSchema');
const Address = require('../modules/addressSchema');
const passport = require('passport');


// POST /api/orders - Create new order
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { shippingAddress, paymentMethod } = req.body;

        // Get user's cart
        const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'No items in cart' });
        }

        // Verify shipping address belongs to user
        const address = await Address.findOne({ 
            _id: shippingAddress, 
            user: req.user.id 
        });
        if (!address) {
            return res.status(400).json({ message: 'Invalid shipping address' });
        }

        // Check product availability and calculate total
        const items = [];
        let subtotal = 0;

        for (const item of cart.items) {
            const product = await Product.findById(item.product._id);
            if (!product) {
                return res.status(400).json({ message: `Product ${item.product.name} no longer available` });
            }

            if (product.quantity < item.quantity) {
                return res.status(400).json({ 
                    message: `Insufficient quantity for ${item.product.name}`
                });
            }

            const price = product.discount > 0 ? 
                product.price * (1 - product.discount / 100) : 
                product.price;

            items.push({
                product: item.product._id,
                quantity: item.quantity,
                price: price
            });

            subtotal += price * item.quantity;
        }

        // Create order
        const order = new Order({
            user: req.user.id,
            items,
            shippingAddress,
            paymentMethod,
            subtotal,
            shippingFee: subtotal > 500 ? 0 : 50, // Example shipping logic
            totalAmount: subtotal + (subtotal > 500 ? 0 : 50)
        });

        // Save order
        await order.save();

        // Update product quantities
        for (const item of cart.items) {
            await Product.updateOne(
                { _id: item.product._id },
                { $inc: { quantity: -item.quantity } }
            );
        }

        // Clear user's cart
        await Cart.deleteOne({ user: req.user.id });

        res.status(201).json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/orders - Get user's orders
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .populate('items.product', 'name images');
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/orders/:id - Get order details
router.get('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const order = await Order.findOne({ 
            _id: req.params.id, 
            user: req.user.id 
        })
        .populate('items.product', 'name images price discount')
        .populate('shippingAddress');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/orders/:id/cancel - Cancel order
router.put('/:id/cancel', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const order = await Order.findOne({ 
            _id: req.params.id, 
            user: req.user.id 
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Only allow cancellation if order is pending
        if (order.orderStatus !== 'pending') {
            return res.status(400).json({ 
                message: 'Order can only be cancelled when in pending status' 
            });
        }

        order.orderStatus = 'cancelled';
        await order.save();

        // Restore product quantities
        for (const item of order.items) {
            await Product.updateOne(
                { _id: item.product },
                { $inc: { quantity: item.quantity } }
            );
        }

        res.json({ message: 'Order cancelled successfully' });
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});


// GET /api/admin/orders - Get all orders (admin only)
router.get('/admin/orders', async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const filter = {};
        
        if (status) filter.orderStatus = status;

        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .populate('user', 'username email')
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Order.countDocuments(filter);

        res.json({
            orders,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/admin/orders/:id/status - Update order status (admin only)
router.put('/admin/orders/:id/status', async (req, res) => {
    try {
        const { status } = req.body;

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Prevent updating to same status
        if (order.orderStatus === status) {
            return res.status(400).json({ message: 'Order already has this status' });
        }

        order.orderStatus = status;
        await order.save();

        res.json({ message: 'Order status updated successfully' });
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;