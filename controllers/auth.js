/**
 * The authentication controller for passportjs login, registering and logout
 * @module controllers/auth
 * @requires express-validator
 * @requires model/sqlite
 * @requires crypto
 * @requires passport-local
 */

/**
 * @namespace authController
 */

/**
 * express-validator functions
 * @const
 */
const { validationResult, matchedData } = require('express-validator');

/**
 * sqlite3 model
 * @const
 */
const db = require('../model/sqlite');

/**
 * crypto module
 * @const
 */
const crypto = require('crypto');

/**
 * passport-local module
 * @const
 */
const LocalStrategy = require('passport-local');

/**
 * passport authentication strategy
 * @constructor
 */
exports.passportStrategy = new LocalStrategy(
  { usernameField: 'email' },
  function verify(username, password, cb) {
    const lowerUsername = username.toLowerCase();

    //find existing author
    db.getAuthorByEmail(lowerUsername)
      .then(function (row) {
        if (!row) {
          return cb(null, false, {
            message: 'Incorrect username or password.',
          });
        }

        // compare salt + hash
        crypto.pbkdf2(
          password,
          row.salt,
          310000,
          32,
          'sha256',
          function (err, hashedPassword) {
            if (err) {
              return cb(err);
            }
            if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
              return cb(null, false, {
                message: 'Incorrect username or password.',
              });
            }
            return cb(null, row);
          },
        );
      })
      .catch((err) => {
        return cb(err);
      });
  },
);

/**
 * render the login page if user is not authenticated
 * @exports getLoginPage
 * @function
 * @memberof module:controllers/auth~authController
 * @inner
 * @param {Express.Request} req - the express request object
 * @param {Express.Response} res - the express response object
 * @param {Object} req.user -  the express user session object
 */
exports.getLoginPage = async (req, res) => {
  if (req.user) {
    return res.redirect('/author');
  }
  return res.render('login.ejs', {
    title: 'login page',
    description: 'This is the login page for readers',
    scriptSrc: ['/scripts/login.js'],
    nonce: res.locals.cspNonce,
    errors: req.flash('error'),
    csrfToken: req.csrfToken(),
  });
};

/**
 * render the register page if user is not authenticated
 * @exports getRegisterPage
 * @function
 * @memberof module:controllers/auth~authController
 * @inner
 * @param {Express.Request} req - the express request object
 * @param {Express.Response} res - the express response object
 * @param {Object} req.user -  the express user session object
 */
exports.getRegisterPage = async (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('../author');
  } else {
    res.render('register.ejs', {
      title: 'register page',
      description: 'This is the registration page for readers',
      scriptSrc: ['/scripts/register.js'],
      nonce: res.locals.cspNonce,
      csrfToken: req.csrfToken(),
    });
  }
};

/**
 * Create a new user
 * @exports registerUser
 * @function
 * @memberof module:controllers/auth~authController
 * @inner
 * @param {Express.Request} req - the express request object
 * @param {Express.Response} res - the express response object
 * @param {String} req.body.email the email
 * @param {String} req.body.author_name the author name
 * @param {String} req.body.password the user password
 * @param {String} req.body.password_confirm to compare password
 * @param {Function} next
 */
exports.registerUser = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).jsonp(errors.array());
  }
  const userData = matchedData(req);

  // search for existing user
  const userExists = await db.getAuthorByEmail(userData.email);
  if (userExists) {
    return res.status(409).json({ message: 'Email already exists' });
  }

  // generate salt and hash for password before insertion to db
  const salt = crypto.randomBytes(16);
  crypto.pbkdf2(
    userData.password,
    salt,
    310000,
    32,
    'sha256',
    async function (err, hashedPassword) {
      if (err) {
        return next(err);
      }
      const authorRow = await db.addAuthor([
        userData.email,
        hashedPassword,
        salt,
        userData.author_name,
      ]);
      if (authorRow) {
        const user = {
          author_id: authorRow.lastID,
          email: userData.email,
          author_name: userData.author_name,
        };
        req.login(user, function (err) {
          if (err) {
            next(err);
          }
          return res.sendStatus(201);
        });
      }
    },
  );
};

/**
 * Log out from author
 * @exports logout
 * @function
 * @memberof module:controllers/auth~authController
 * @inner
 * @param {Express.Request} req  the express request object
 * @param {Express.Response} res  the express response object
 * @param {Function} next
 */
exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    return res.sendStatus(200);
  });
};
