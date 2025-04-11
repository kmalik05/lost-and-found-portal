const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const { ensureAuthenticated } = require('../middleware/auth');

// Public items list
router.get('/', async (req, res) => {
  try {
    const items = await Item.find().populate('user', 'username');
    res.render('items/public', { items });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// Dashboard (private items)
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
    try {
      const items = await Item.find({ user: req.user._id });
      res.render('items/dashboard', {
        title: 'Dashboard',
        items: items,
        user: req.user 
      });
    } catch (err) {
      console.error(err);
      res.redirect('/');
    }
  });

// Add item form
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('items/add');
});

// Create item
router.post('/', ensureAuthenticated, async (req, res) => {
  try {
    const { title, description, category, location } = req.body;
    const newItem = new Item({
      title,
      description,
      category,
      location,
      user: req.user._id
    });
    await newItem.save();
    req.flash('success', 'Item added successfully');
    res.redirect('/items/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to add item');
    res.redirect('/items/add');
  }
});

// Edit item form
router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
    try {
      const item = await Item.findOne({ 
        _id: req.params.id,
        user: req.user._id // Ensure user owns the item
      });
      
      if (!item) {
        req.flash('error', 'Item not found');
        return res.redirect('/items/dashboard');
      }
      
      res.render('items/edit', { item });
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error loading item');
      res.redirect('/items/dashboard');
    }
  });
  

// Update item
router.put('/:id', ensureAuthenticated, async (req, res) => {
    try {
      const { title, description, category, location } = req.body;
      
      await Item.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { title, description, category, location }
      );
      
      req.flash('success', 'Item updated successfully');
      res.redirect('/items/dashboard');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Failed to update item');
      res.redirect(`/items/edit/${req.params.id}`);
    }
  });

// Delete item
router.delete('/:id', ensureAuthenticated, async (req, res) => {
    try {
      await Item.findOneAndDelete({ 
        _id: req.params.id,
        user: req.user._id // Ensure users can only delete their own items
      });
      req.flash('success', 'Item deleted successfully');
      res.redirect('/items/dashboard');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Failed to delete item');
      res.redirect('/items/dashboard');
    }
  });

module.exports = router;