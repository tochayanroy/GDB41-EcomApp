const express = require('express');
const router = express.Router();
const Address = require('../modules/addressSchema');
const passport = require('passport');


// Apply auth middleware to all routes

// POST /api/addresses - Add new address
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { 
            fullName, 
            phone, 
            addressLine1, 
            addressLine2, 
            city, 
            state, 
            postalCode, 
            country,
            isDefault 
        } = req.body;

        // If setting as default, unset any existing default address
        if (isDefault) {
            await Address.updateMany(
                { user: req.user.id, isDefault: true },
                { $set: { isDefault: false } }
            );
        }

        const address = new Address({
            user: req.user.id,
            fullName,
            phone,
            addressLine1,
            addressLine2,
            city,
            state,
            postalCode,
            country: country || 'Bangladesh',
            isDefault: isDefault || false
        });

        await address.save();

        res.status(201).json(address);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/addresses - Get user's addresses
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const addresses = await Address.find({ user: req.user.id });
        res.json(addresses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/addresses/:id - Get specific address
router.get('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const address = await Address.findOne({ 
            _id: req.params.id, 
            user: req.user.id 
        });

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        res.json(address);
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/addresses/:id - Update address
router.put('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { 
            fullName, 
            phone, 
            addressLine1, 
            addressLine2, 
            city, 
            state, 
            postalCode, 
            country,
            isDefault 
        } = req.body;

        // If setting as default, unset any existing default address
        if (isDefault) {
            await Address.updateMany(
                { user: req.user.id, isDefault: true },
                { $set: { isDefault: false } }
            );
        }

        const address = await Address.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { 
                fullName, 
                phone, 
                addressLine1, 
                addressLine2, 
                city, 
                state, 
                postalCode, 
                country: country || 'Bangladesh',
                isDefault 
            },
            { new: true }
        );

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        res.json(address);
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/addresses/:id - Delete address
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const address = await Address.findOneAndDelete({ 
            _id: req.params.id, 
            user: req.user.id 
        });

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // If deleted address was default, set another address as default
        if (address.isDefault) {
            const remainingAddress = await Address.findOne({ user: req.user.id });
            if (remainingAddress) {
                remainingAddress.isDefault = true;
                await remainingAddress.save();
            }
        }

        res.json({ message: 'Address deleted successfully' });
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/addresses/:id/set-default - Set default address
router.put('/:id/set-default', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        // First unset any existing default address
        await Address.updateMany(
            { user: req.user.id, isDefault: true },
            { $set: { isDefault: false } }
        );

        // Set the specified address as default
        const address = await Address.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { $set: { isDefault: true } },
            { new: true }
        );

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        res.json(address);
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;