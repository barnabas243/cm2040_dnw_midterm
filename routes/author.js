/** 
 * Express router providing author related routes
 * @module routers/author
 * @requires express
 * @requires controllers/author
 * @requires utils/req-validator
 */

/**
 * express module
 * @const
 */
const express = require('express');

/**
 * Express router to mount author related functions on
 * @type {object}
 * @const
 * @namespace authorRouter
 */
const router = express.Router();

/**
 * Controller middleware to handle author route requests
 * @const
 */
const {
  getAuthorHome,
  createDraft,
  deleteArticle,
  getSettingsPage,
  updateSettings,
  getEditPage,
  updateArticle,
  publishArticle,
} = require('../controllers/author');

/**
 * express-validator middleware to validate requests
 * @const
 */
const {
  articleIdValidation,
  settingValidation,
  articleValidation,
} = require('../utils/req-validator');

/**
 * Route serving author homepage
 * @name get/
 * @function
 * @memberof module:routers/author~authorRouter
 * @inner
 * @param {String} path Express path
 * @param {module:controllers/author~authorController~getAuthorHome} getAuthorHome authorController middleware function
 */
router.get('/', getAuthorHome);

/**
 * Route to create new draft
 * @name post/createDraft
 * @function
 * @memberof module:routers/author~authorRouter
 * @inner
 * @param {String} path Express path
 * @param {module:controllers/author~authorController~createDraft} createDraft authorController middleware function
 */
router.post('/createDraft', createDraft);

/**
 * Route to delete article
 * @name post/delete
 * @function
 * @memberof module:routers/author~authorRouter
 * @inner
 * @param {String} path Express path
 * @param {module:utils/req-validator~articleIdValidation} articleIdValidation express-validator middleware
 * @param {module:controllers/author~authorController~deleteArticle} deleteArticle authorController middleware function
 */
router.post('/delete', articleIdValidation, deleteArticle);

/**
 * Route serving blog settings form
 * @name get/settings
 * @function
 * @memberof module:routers/author~authorRouter
 * @inner
 * @param {String} path Express path
 * @param {module:controllers/author~authorController~getSettingsPage} getSettingsPage authorController middleware function
 */
router.get('/settings', getSettingsPage);

/**
 * Route to update blog settings
 * @name post/settings
 * @function
 * @memberof module:routers/author~authorRouter
 * @inner
 * @param {String} path Express path
 * @param {module:utils/req-validator~settingValidation} settingValidation express-validator middleware
 * @param {module:controllers/author~authorController~updateSettings} updateSettings authorController middleware function
 */
router.post('/settings', settingValidation, updateSettings);

/**
 * Route serving article edit form
 * @name get/edit
 * @function
 * @memberof module:routers/author~authorRouter
 * @inner
 * @param {String} path Express path
 * @param {module:utils/req-validator~articleIdValidation} articleIdValidation express-validator middleware
 * @param {module:controllers/author~authorController~getEditPage} getEditPage authorController middleware function
 */
router.get('/edit', articleIdValidation, getEditPage);

/**
 * Route to update article
 * @name post/edit
 * @function
 * @memberof module:routers/author~authorRouter
 * @inner
 * @param {String} path Express path
 * @param {module:utils/req-validator~articleIdValidation} articleIdValidation express-validator middleware
 * @param {module:controllers/author~authorController~updateArticle} updateArticle authorController middleware function
 */
router.post('/edit', articleValidation, updateArticle);

/**
 * Route to publish article
 * @name post/publish
 * @function
 * @memberof module:routers/author~authorRouter
 * @inner
 * @param {String} path Express path
 * @param {module:utils/req-validator~articleIdValidation} articleIdValidation express-validator middleware
 * @param {module:controllers/author~authorController~publishArticle} publishArticle authorController middleware function
 */
router.post('/publish', articleIdValidation, publishArticle);

module.exports = router;
