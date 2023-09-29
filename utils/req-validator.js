/**
 * Express validation utilities
 * @module
 * @requires express-validator
 */

const {
  /**
   * check middleware in express-validator
   * @const
   */
  check,
} = require('express-validator');

/**
 * author name validation using check validation chain.
 * - author_name cannot be empty
 * @const
 */
const checkAuthorName = check('author_name', 'Your name cannot be empty')
  .trim()
  .not()
  .isEmpty()
  .escape();
/**
 * email validation using check validation chain.
 * - email cannot be empty
 * - email must be in a valid format
 * @const
 */
const checkEmail = check('email', 'Your email is not valid')
  .trim()
  .isEmail()
  .normalizeEmail();
/**
 * password validation using check validation chain.
 * - password must have a minimum of 8 alphanumerical characters, including one uppercase
 * @const
 */
const checkPassword = check(
  'password',
  'Your password must have a minimum of 8 alphanumerical characters, including one uppercase',
)
  .trim()
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[\w\d\W]{8,}$/);

/**
 * password comparison using custom check validation chain.
 * - password_confirm must be equal to password
 * @const
 */
const password_confirm = check(
  'password_confirm',
  'password does not match',
).custom((value, { req }) => {
  if (value !== req.body.password) {
    // throw error when passwords do not match
    throw new Error('Passwords do not match');
  } else {
    return value;
  }
});

/**
 * article id validation using check validation chain.
 * - article_id cannot be empty
 * - article_id must be an integer
 * @const
 */
const checkArticleId = check('article_id', 'article_id cannot be empty')
  .trim()
  .isInt()
  .withMessage('article_id must be an integer');

/**
 * blog title validation using check validation chain.
 * - blogTitle cannot be empty
 * @const
 */
const checkBlogTitle = check('blogTitle', 'blogTitle must not be empty.')
  .trim()
  .not()
  .isEmpty()
  .escape();

/**
 * blog subtitle validation using check validation chain.
 * - blogSubtitle cannot be empty
 * @const
 */
const checkBlogSubtitle = check(
  'blogSubtitle',
  'blogsubTitle must not be empty.',
)
  .trim()
  .not()
  .isEmpty()
  .escape();

/**
 * comment content validation using check validation chain.
 * - comment_content cannot be empty
 * @const
 */
const checkComment = check('comment_content', 'Comment cannot be empty')
  .trim()
  .not()
  .isEmpty();

/**
 * like value validation using check validation chain.
 * - val cannot be empty
 * - val is an integer between -1 and 1
 * @const
 */
const checkLikeVal = check(
  'val',
  'val must be an integer within -1 to 1',
).isInt({ min: -1, max: 1 });

/**
 * article title validation using check validation chain.
 * - Title cannot be empty
 * @const
 */
const checkArticleTitle = check('title', 'Title must be a string')
  .trim()
  .not()
  .isEmpty()
  .escape();

/**
 * article subtitle validation using check validation chain.
 * - Subtitle cannot be empty
 * @const
 */
const checkArticleSubtitle = check('subtitle', 'Subtitle must be a string')
  .trim()
  .not()
  .isEmpty()
  .escape();

/**
 * article content validation using check validation chain.
 * - Content cannot be empty
 * @const
 */
const checkArticleContent = check('content', 'Content must be a string')
  .trim()
  .not()
  .isEmpty();

/**
 * an array of check middleware to validate the author_name, email, password and password_confirm
 * @type  {Array.<check>}
 * @property {module:utils/utils/req-validator~checkAuthorName} checkAuthorName
 * @property {module:utils/utils/req-validator~checkEmail } checkEmail
 * @property {module:utils/utils/req-validator~checkPassword } checkPassword
 * @property {module:utils/utils/req-validator~checkPasswordConfirm } checkPasswordConfirm
 */
exports.registerValidation = [
  checkAuthorName,
  checkEmail,
  checkPassword,
  password_confirm,
];

/**
 * an array of check middleware to validate article id
 * @type  {Array.<check>}
 * @property {module:utils/req-validator~checkArticleId} checkArticleId
 */
exports.articleIdValidation = [checkArticleId];

/**
 * an array of check middleware to validate author_name, blogTitle, blogSubtitle
 * @type  {Array.<check>}
 * @property {module:utils/req-validator~checkAuthorName} checkAuthorName
 * @property {module:utils/req-validator~checkBlogTitle} checkBlogTitle
 * @property {module:utils/req-validator~checkBlogSubtitle} checkBlogSubtitle
 */
exports.settingValidation = [
  checkAuthorName,
  checkBlogTitle,
  checkBlogSubtitle,
];

/**
 * an array of check middleware to validate article_id, article title, article subtitle and article content
 * @type  {Array.<check>}
 * @property {module:utils/req-validator~checkArticleId} checkArticleId
 * @property {module:utils/req-validator~checkArticleTitle} checkArticleTitle
 * @property {module:utils/req-validator~checkArticleSubtitle} checkArticleSubtitle
 * @property {module:utils/req-validator~checkArticleContent} checkArticleContent
 */
exports.articleValidation = [
  checkArticleId,
  checkArticleTitle,
  checkArticleSubtitle,
  checkArticleContent,
];

/**
 * an array of check middleware to validate article_id and comment content
 * @type {Array.<check>}
 * @property {module:utils/req-validator~checkArticleId} checkArticleId
 * @property {module:utils/req-validator~checkComment} checkComment
 */
exports.commentValidation = [checkArticleId, checkComment];

/**
 * an array of check middleware to validate article_id and val for article likes
 * @type {Array.<check>}
 * @property {module:utils/req-validator~checkArticleId} checkArticleId
 * @property {module:utils/req-validator~checkLikeVal} checkLikeVal
 */
exports.articleLikesValidation = [checkArticleId, checkLikeVal];
