/**
 * @module index
 * @requires express
 * @requires helmet
 * @requires express-rate-limit
 * @requires http
 * @requires https
 * @requires fs
 * @requires crypto
 * @requires express-ejs-layouts
 * @requires passport
 * @requires express-session
 * @requires connect-sqlite3
 * @requires connect-flash
 * @requires dotenv
 */

'use strict';

/**
 * dotenv.module
 * @const
 */
require('dotenv').config();

/**
 * express module
 * @const
 */
const express = require('express');

/**
 * instantiates Express and assign to app
 * @type {object}
 * @const
 */
const app = express();

/**
 * compression module
 * @const
 */
const compression = require('compression');
/**
 * helmet module
 * @const
 */
const helmet = require('helmet');

/**
 * express-rate-limit module
 * @const
 */
const rateLimit = require('express-rate-limit');

/**
 * express-ejs-layouts module
 * @const
 */
const expressLayouts = require('express-ejs-layouts');

/**
 * passport module
 * @const
 */
const passport = require('passport');

/**
 * express-session module
 * @const
 */
const session = require('express-session');

/**
 * express-session module
 * @const
 */
const SQLiteStore = require('connect-sqlite3')(session);

/**
 * http module
 * @const
 */
const http = require('http');
/**
 * https module
 * @const
 */
const https = require('https');
/**
 * fs module
 * @const
 */
const fs = require('fs');
/**
 * crypto module
 * @const
 */
const crypto = require('crypto');

/**
 * connect-flash module
 * @const
 */
const flash = require('connect-flash');

/**
 * csrfSync module
 * @const
 */
const { csrfSync } = require('csrf-sync');

/**
 * csrf Synchronizer token middleware
 * @const
 */
const { csrfSynchronisedProtection } = csrfSync({
  getTokenFromRequest: (req) => {
    return req.headers['x-csrf-token'];
  },
});

/**
 * http port
 * @const
 */
const httpPort = process.env.HTTP_PORT || 3000;

/**
 * https port
 * @const
 */
const httpsPort = process.env.HTTPS_PORT || 4444;

////////////////////////////////////////////////////////////////////////////////////////

/** session configurations */
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    store: new SQLiteStore({ db: 'sessions.db', dir: __dirname }), //store session in sqlitedb using connect-sqlite3
    cookie: { secure: true },
  }),
);

/** use passport session authentication */
app.use(passport.authenticate('session'));

/** saving error messages in session */
app.use(flash());

/** saving error messages in session */
app.use(express.static('public'));
app.use('/css', express.static(`${__dirname}public/css`));
app.use('/scripts', express.static(`${__dirname}public/scripts`));
app.use('/img', express.static(`${__dirname}public/img`));

/** enable helmet defaults */
app.use(helmet());

/** create NONCE to whitelist accepted inline js scripts */
app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString('hex');
  next();
});
/** implement csp nonce with helmet */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`],
        connectSrc: [
          "'self'",
          'https://ka-f.fontawesome.com/releases/v5.15.4/css/',
        ],
      },
    },
  }),
);

/** rate limiting user routes
 * @type {Object}
 * @const
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/', limiter);
app.use('/author', limiter);

/** accept json and urlencoded requests */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/** EJS templaying with layouts */
app.use(expressLayouts);
app.set('layout', './layouts/full-width');
app.set('view engine', 'ejs');

/** Compress the http requests */
app.use(compression());

/** Redirect to https if using http */
app.use((req, res, next) => {
  const localhost = req.headers.host.split(':')[0];
  req.secure
    ? next()
    : res.redirect(301, `https://${localhost}:${httpsPort}${req.url}`);
});

/** enforce https with HSTS */
app.use(function (req, res, next) {
  if (req.secure) {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=300; includeSubDomains; preload',
    );
  }
  next();
});

/** enable csrf protection */
app.use(csrfSynchronisedProtection);

/** author routes
 * @const
 */
const authorRoutes = require('./routes/author');

/** authentication routes
 * @const
 */
const authRoutes = require('./routes/auth');

/** reader routes
 * @const
 */
const readerRoutes = require('./routes/reader');

/** set path for reader routes */
app.use('/', readerRoutes);

/** set path for authentication routes */
app.use('/auth', authRoutes);

/** set path for author routes */
app.use('/author', authorRoutes);

/** run http server */
http.createServer(app).listen(httpPort, () => {
  console.log(`App listening on http port ${httpPort}.`);
  console.log(`Access reader home page at http://localhost:${httpPort}`);
});

/** run https server */
https
  .createServer(
    // read the keys using fs
    {
      key: fs.readFileSync('./config/ssl/key.pem'),
      cert: fs.readFileSync('./config/ssl/cert.pem'),
    },
    app,
  )
  .listen(httpsPort, () => {
    console.log(`App listening on https port ${httpsPort}`);
  });
