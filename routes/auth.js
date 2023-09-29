/** 
 * Express router providing authentication related routes
 * @module routers/auth
 * @requires express
 * @requires passport
 * @requires passport-local
 * @requires crypto
 * @requires express-rate-limit
 * @requires utils/req-validator
 * @requires controllers/auth
 */

/**
 * express module
 * @const
 */
const express = require('express');

/**
 * Express router to mount authentication related functions on.
 * @type {object}
 * @const
 * @namespace authRouter
 */
const router = express.Router();

/**
 * passport module
 * @const
 */
const passport = require('passport');

/**
 * custom express-validator utils to validate requests
 * @const
 */
const { registerValidation } = require('../utils/req-validator');

/**
 * Controller functions to handle authentication requests
 * @const
 */
const {
  passportStrategy,
  getLoginPage,
  getRegisterPage,
  registerUser,
  logout,
} = require('../controllers/auth');

/**
 * express-rate-limit module
 * @const
 */
const rateLimit = require('express-rate-limit');

/**
 * rate limiter configuration for register and login POST requests
 * @const
 */
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10mins
  max: 5, // Limit each IP to 5 POST login/register requests each
  message: 'Too many attempts to register/login',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/** use passport authentication strategy*/
passport.use(passportStrategy);

/**
 * passport serialize user
 * @function
 * @param {Object} user author id, email and name
 * @callback
 */
passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, {
      id: user.author_id,
      email: user.email,
      author_name: user.author_name,
    });
  });
});
/**
 * passport deserialize user
 * @function
 * @param {Object} user author id, email and name
 * @callback
 * */
passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

/**
 * Route serving login form
 * @name get/auth/login
 * @function
 * @memberof module:routers/auth~authRouter
 * @inner
 * @param {String} path Express path
 * @param {module:controllers/auth~authController~getLoginPage} getLoginPage authController middleware function
 */
router.get('/login', getLoginPage);

/**
 * Route processing login form
 * @name post/auth/login
 * @function
 * @memberof module:routers/auth~authRouter
 * @inner
 * @param {String} path Express path
 * @param {@module:routers/auth~authLimiter} authLimiter express-rate-limit check middleware
 * @param {function} authenticate passport authenticate middleware
 */
router.post(
  '/login',
  authLimiter,
  passport.authenticate('local', {
    failureFlash: true,
  }),
);

/**
 * Route serving register form
 * @name get/auth/register
 * @function
 * @memberof module:routers/auth~authRouter
 * @inner
 * @param {String} path Express path
 * @param {module:controllers/auth~authController~getRegisterPage} getRegisterPage authController middleware function
 */
router.get('/register', getRegisterPage);

/**
 * Route processing register form
 * @name post/auth/register
 * @function
 * @memberof module:routers/auth~authRouter
 * @inner
 * @param {String} path Express path
 * @param {@module:controllers/auth~authLimiter} authLimiter express-rate-limit middleware
 * @param {module:utils/req-validator~registerValidation} registerValidation express-validator middleware
 * @param {module:controllers/auth~authController~registerUser} registerUser authController middleware function
 */
router.post('/register', authLimiter, registerValidation, registerUser);

/**
 * Route processing logout
 * @name post/auth/logout
 * @function
 * @memberof module:routers/auth~authRouter
 * @inner
 * @param {String} path Express path
 * @param {module:controllers/auth~authController~logout} logout authController middleware function
 */
router.post('/logout', logout);

module.exports = router;
