/**
 * Reader controller for displaying reader homepage, getting article page, commenting and liking the article
 * @module controllers/reader
 * @requires express-validator
 * @requires model/sqlite
 */

/**
 * @namespace readerController
 */
/**
 * express-validator functions
 * @const
 */
const { validationResult } = require('express-validator');

/**
 * sqlite3 model
 * @const
 */
const db = require('../model/sqlite');

/**
 * dayjs module
 * @const
 */
const dayjs = require('dayjs');
/**
 * dayjs relativeTime plugin
 * @const
 */
const relativeTime = require('dayjs/plugin/relativeTime');
/**
 * dayjs utc plugin
 * @const
 */
const utc = require('dayjs/plugin/utc');
/**
 * dayjs timezone plugin
 * @const
 */
const timezone = require('dayjs/plugin/timezone');

/** */
dayjs.extend(utc);
/** */
dayjs.extend(timezone);
// auto detect user timezone
dayjs.tz.guess();

dayjs.extend(relativeTime);

/**
 * Render reader home page
 * @exports getReaderHome
 * @function
 * @memberof module:controllers/reader~readerController
 * @param {Express.Request} req - the express request object
 * @param {Express.Response} res - the express response object
 * @param {Function} next
 * @param {Object} req.user -  the express user session object
 */
exports.getReaderHome = async (req, res, next) => {
  let user = false;
  if (req.user) {
    user = true;
  }
  db.getPublishedArticles()
    .then((articles) => {
      // format date with dayjs
      articles.forEach((article) => {
        article.publish_date = dayjs
          .utc(article.publish_date)
          .tz()
          .format('DD MMM YYYY h:mm A');
      });

      res.render('reader_home.ejs', {
        title: 'Reader Home',
        description:
          'This is the front page which readers use to access the blog site.',
        scriptSrc: [],
        articles: articles,
        user: user,
        nonce: res.locals.cspNonce,
      });
    })
    .catch((err) => next(err));
};

/**
 * Get the published article page
 * @exports getArticlePage
 * @function
 * @memberof module:controllers/reader~readerController
 * @param {Express.Request} req - the express request object
 * @param {Express.Response} res - the express response object
 * @param {Function} next
 * @param {int} req.params.article_id id of the article to read
 */
exports.getArticlePage = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }
    const publishedArticle = await db.getPublishedArticle(
      req.params.article_id,
    );
    if (publishedArticle) {
      publishedArticle.publish_date = dayjs
        .utc(publishedArticle.publish_date)
        .tz()
        .format('DD MMM YYYY h:mm A');
      const comments = await db.getComments(req.params.article_id);
      if (comments) {
        comments.forEach((comment) => {
          comment.comment_date = dayjs.utc(comment.comment_date).tz().fromNow();
        });
      }
      return res.render('article.ejs', {
        title: publishedArticle.article_title,
        description: publishedArticle.artical_subtitle,
        scriptSrc: [
          'https://cdn.ckeditor.com/ckeditor5/38.1.1/decoupled-document/ckeditor.js',
          '/scripts/article.js',
        ],
        nonce: res.locals.cspNonce,
        article: publishedArticle,
        comments: comments,
        csrfToken: req.csrfToken(),
      });
    } else {
      return res.redirect('/');
    }
  } catch (e) {
    next(e);
  }
};

/**
 * Insert a new comment for the article
 * @exports addComment
 * @function
 * @memberof module:controllers/reader~readerController
 * @param {Express.Request} req - the express request object
 * @param {Express.Response} res - the express response object
 * @param {Function} next
 * @param {Object} req.user -  the express user session object
 * @param {int} req.body.article_id id of the article to add comment to
 * @param {String} req.body.comment_content comment content to insert
 */
exports.addComment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }
  req.body.user = 'Anonymous';
  if (req.user) {
    req.body.user = req.user.author_name;
  }

  db.addComment(req.body)
    .then(() => {
      res.sendStatus(201);
    })
    .catch((err) => next(err));
};

/**
 * Update the total number of likes
 * @exports updateArticleLikes
 * @function
 * @memberof module:controllers/reader~readerController
 * @param {Express.Request} req - the express request object
 * @param {Express.Response} res - the express response object
 * @param {Function} next
 * @param {int} req.body.article_id the id of the article that was liked
 * @param {int} req.body.val either -1 or 1
 */
exports.updateArticleLikes = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(404).json(errors.array());
  }

  db.updateArticleLikes(req.body.article_id, req.body.val)
    .then((likes) => {
      res.json(likes);
    })
    .catch((err) => next(err));
};
