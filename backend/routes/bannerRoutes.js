const express = require('express');
const router = express.Router();
const Banner = require('../modules/bannerSchema');
const passport = require('passport');
const { singleImageUpload } = require('../middleware/multer');



// POST /api/banners - Create banner (admin only)
router.post('/addBanner', passport.authenticate('jwt', { session: false }), singleImageUpload, async (req, res) => {
	try {
		const { title, subtitle, link, isActive } = req.body;
		// Get the current highest order value
		const highestOrderBanner = await Banner.findOne().sort('-order');
		const order = highestOrderBanner ? highestOrderBanner.order + 1 : 1;

		const banner = new Banner({
			title,
			subtitle,
			image: req.file ? req.file.path.replace(/\\/g, '/') : null,
			link,
			isActive: isActive || false,
			order
		});

		await banner.save();

		res.status(201).json(banner);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Server error' });
	}
});

// GET /api/banners - Get all banners (active first)
router.get('/allBanner', async (req, res) => {
	try {
		const banners = await Banner.find().sort({ order: 1 });
		res.json(banners);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Server error' });
	}
});

// GET /api/banners/:id - Get single banner
router.get('/:id', async (req, res) => {
	try {
		const banner = await Banner.findById(req.params.id);
		if (!banner) {
			return res.status(404).json({ message: 'Banner not found' });
		}
		res.json(banner);
	} catch (err) {
		console.error(err);
		if (err.kind === 'ObjectId') {
			return res.status(404).json({ message: 'Banner not found' });
		}
		res.status(500).json({ message: 'Server error' });
	}
});

// PUT /api/banners/update/:id - Update banner without image (admin only)
router.put('/update/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
	try {
		const { title, subtitle, link, isActive } = req.body;

		const updates = {
			title,
			subtitle,
			link,
			isActive: isActive === 'true' || isActive === true
		};

		const banner = await Banner.findByIdAndUpdate(
			req.params.id,
			updates,
			{ new: true }
		);

		if (!banner) {
			return res.status(404).json({ message: 'Banner not found' });
		}

		res.json(banner);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Server error' });
	}
});

// PUT /api/banners/updateImage/:id - Update banner image (admin only)
router.put('/updateImage/:id', passport.authenticate('jwt', { session: false }), singleImageUpload, async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ message: 'No image provided' });
		}

		const banner = await Banner.findByIdAndUpdate(
			req.params.id,
			{ image: req.file.path.replace(/\\/g, '/') },
			{ new: true }
		);

		if (!banner) {
			return res.status(404).json({ message: 'Banner not found' });
		}

		res.json(banner);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Server error' });
	}
});

// DELETE /api/banners/:id - Delete banner (admin only)
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
	try {
		const banner = await Banner.findByIdAndDelete(req.params.id);

		if (!banner) {
			return res.status(404).json({ message: 'Banner not found' });
		}

		// Reorder remaining banners
		await Banner.updateMany(
			{ order: { $gt: banner.order } },
			{ $inc: { order: -1 } }
		);

		res.json({ message: 'Banner deleted successfully' });
	} catch (err) {
		console.error(err);
		if (err.kind === 'ObjectId') {
			return res.status(404).json({ message: 'Banner not found' });
		}
		res.status(500).json({ message: 'Server error' });
	}
});

// PUT /api/banners/:id/activate - Activate/deactivate banner (admin only)
router.put('/:id/activate', passport.authenticate('jwt', { session: false }), async (req, res) => {
	try {
		const { isActive } = req.body;

		const banner = await Banner.findByIdAndUpdate(
			req.params.id,
			{ isActive },
			{ new: true }
		);

		if (!banner) {
			return res.status(404).json({ message: 'Banner not found' });
		}

		res.json({
			message: `Banner ${isActive ? 'activated' : 'deactivated'} successfully`,
			banner
		});
	} catch (err) {
		console.error(err);
		if (err.kind === 'ObjectId') {
			return res.status(404).json({ message: 'Banner not found' });
		}
		res.status(500).json({ message: 'Server error' });
	}
});

// PUT /api/banners/reorder - Reorder banners (admin only)
router.put('/reorder', passport.authenticate('jwt', { session: false }), async (req, res) => {
	try {
		const { bannerIds } = req.body; // Array of banner IDs in new order

		if (!bannerIds || !Array.isArray(bannerIds)) {
			return res.status(400).json({ message: 'Invalid banner order data' });
		}

		// Update order for each banner
		const updates = bannerIds.map((id, index) => ({
			updateOne: {
				filter: { _id: id },
				update: { $set: { order: index + 1 } }
			}
		}));

		await Banner.bulkWrite(updates);

		res.json({ message: 'Banners reordered successfully' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Server error' });
	}
});

module.exports = router;