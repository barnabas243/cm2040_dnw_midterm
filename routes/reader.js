/** 
 * Express router providing author related routes
 * @module routers/reader
 * @requires express
 * @requires controllers/reader
 * @requires utils/req-validator
 */

/**
 * express module
 * @const
 */
const express = require('express');

/**
 * Express router to mount reader related functions on
 * @type {object}
 * @const
 * @namespace readerRouter
 */
const router = express.Router();

/**
 * Controller functions to handle reader requests
 * @const
 */
const {
  getReaderHome,
  getArticlePage,
  addComment,
  updateArticleLikes,
} = require('../controllers/reader');

/**
 * express validator functions to handle reader requests
 * @const
 */
const {
  articleIdValidation,
  commentValidation,
  articleLikesValidation,
} = require('../utils/req-validator');

/**
 * Route serving reader homepage
 * @name get/
 * @function
 * @memberof module:routers/reader~readerRouter
 * @param {String} path Express path
 * @param {module:controllers/reader~readerController~getReaderHome} getReaderHome readerController middleware function
 */
router.get('/', getReaderHome);

/**
 * Route serving article page
 * @name get/article/:article_id
 * @function
 * @memberof module:routers/reader~readerRouter
 * @param {String} path Express path
 * @param {module:utils/req-validator~articleIdValidation} articleIdValidation express-validator middleware
 * @param {module:controllers/reader~readerController~getArticlePage} getArticlePage readerController middleware function
 */
router.get('/article/:article_id', articleIdValidation, getArticlePage);

/**
 * Route processing reader comment
 * @name get/article/comment
 * @function
 * @memberof module:routers/reader~readerRouter
 * @param {String} path Express path
 * @param {module:utils/req-validator~commentValidation} commentValidation express-validator middleware
 * @param {module:controllers/reader~readerController~addComment} addComment readerController middleware function
 */
router.post('/article/comment', commentValidation, addComment);

/**
 * Route processing reader likes
 * @name get/article/likes
 * @function
 * @memberof module:routers/reader~readerRouter
 * @param {String} path Express path
 * @param {module:utils/req-validator~articleLikesValidation} articleLikesValidation express-validator middleware
 * @param {module:controllers/reader~readerController~updateArticleLikes} updateArticleLikes readerController middleware function
 */
router.post('/article/likes', articleLikesValidation, updateArticleLikes);

module.exports = router;
