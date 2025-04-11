const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

// Register
router.get('/register', (req, res) => res.render('register'));
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    await user.save();
    req.flash('success', 'Registration successful. Please log in.');
    res.redirect('/login');
  } catch (err) {
    req.flash('error', 'Registration failed. Please try again.');
    res.redirect('/register');
  }
});

// Login
router.get('/login', (req, res) => res.render('login'));
router.post('/login', passport.authenticate('local', {
  successRedirect: 'items/dashboard',
  failureRedirect: '/login',
  failureFlash: true
}));
router.post('/login', passport.authenticate('local', {
    successRedirect: '/items/dashboard',  
    failureRedirect: '/login',
    failureFlash: true
  }));

// GitHub Auth
router.get('/auth/github', passport.authenticate('github'));
router.get('/auth/github/callback', passport.authenticate('github', {
  successRedirect: 'items/dashboard',
  failureRedirect: '/login'
}));

// Logout
router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
      if (err) { return next(err); }
      req.flash('success', 'You have been logged out');
      res.redirect('/');
    });
  });

module.exports = router;