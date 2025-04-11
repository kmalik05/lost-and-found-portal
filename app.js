var createError = require('http-errors');
const express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const methodOverride = require('method-override');

// Configuration and DB setup
require('dotenv').config();
require('./config/db');

// Authentication middleware
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');

const app = express();
app.use(methodOverride('_method'));
// View engine setup (must come before routes)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Register HBS helpers
const hbs = require('hbs');
const helpers = require('./helpers/hbs');
hbs.registerHelper(helpers);

// Standard middleware (order matters!)
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session and authentication middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
require('./config/passport')(passport);

// Routes (after all middleware)
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const itemsRouter = require('./routes/items');


app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/items', itemsRouter);


// Error handlers
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;