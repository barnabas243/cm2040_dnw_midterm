/**
 * The author controller for updating blog settings, creating draft, editing article and publishing article
 * @module controllers/author
 * @requires express-validator
 * @requires model/sqlite
 */

/**
 * @namespace authorController
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

/** extend dayjs with utc plugin */
dayjs.extend(utc);
/** extend dayjs with timezone plugin */
dayjs.extend(timezone);
/** auto detect user timezone */
dayjs.tz.guess();
/** extend dayjs with relative plugin */
dayjs.extend(relativeTime);

/**
 * Render the Author home page
 * @exports getAuthorHome
 * @function
 * @memberof module:controllers/author~authorController
 * @inner
 * @param {Express.Request} req - the express request object
 * @param {Express.Response} res - the express response object
 * @param {Object} req.user -   the user session object
 * @param {Function} next
 */
exports.getAuthorHome = async (req, res, next) => {
  if (req.user) {
    try {
      const [author, articles] = await Promise.allSettled([
        db.getAuthor(req.user.id),
        db.getArticles(req.user.id),
      ]);
      // convert date time to correct timezone and format
      articles.value.forEach((article) => {
        if (article.publish_date) {
          article.publish_date = dayjs
            .utc(article.publish_date)
            .tz()
            .format('DD MMM YYYY h:mm A');
        }
        if (article.modification_date) {
          article.modification_date = dayjs
            .utc(article.modification_date)
            .tz()
            .fromNow();
        }
        article.creation_date = dayjs
          .utc(article.creation_date)
          .tz()
          .format('DD MMM YYYY h:mm A');
      });

      const token = req.csrfToken();
      return res.render('author_home.ejs', {
        title: 'Blog',
        description: 'This is the author home page where he can view his work',
        blogTitle: author.value.blogTitle,
        blogSubtitle: author.value.blogSubtitle,
        author_name: author.value.author_name,
        scriptSrc: ['/scripts/author_home.js'],
        nonce: res.locals.cspNonce,
        articles: articles.value,
        csrfToken: token,
      });
    } catch (e) {
      next(e);
    }
  }
  return res.redirect('../auth/login');
};

/**
 * Create an empty article draft
 * @exports createDraft
 * @function
 * @memberof module:controllers/author~authorController
 * @inner
 * @param {Express.Request} req - the express request object
 * @param {Express.Response} res - the express response object
 * @param {Function} next
 * @param {Object} req.user -   the user session object
 */
exports.createDraft = async (req, res, next) => {
  if (req.isAuthenticated()) {
    try {
      const result = await db.addArticle(req.user.id);
      if (result && result.changes > 0) {
        return res.status(201).json({ article_id: result.lastID });
      }
    } catch (e) {
      next(e);
    }
  }
  return res.redirect('../auth/login');
};

/**
 * Delete an article
 * @exports deleteArticle
 * @function
 * @memberof module:controllers/author~authorController
 * @inner
 * @param {Express.Request} req the express request object
 * @param {Express.Response} res the express response object
 * @param {Function} next
 * @param {int} req.body.article_id id of the article to delete
 */
exports.deleteArticle = async (req, res, next) => {
  if (req.isAuthenticated()) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(404).jsonp(errors.array());
    }

    return db
      .deleteArticle(req.body.article_id)
      .then(() => {
        res.sendStatus(200);
      })
      .catch((err) => next(err));
  }
  return res.redirect('../auth/login');
};

/**
 * Render the Settings page
 * @exports getSettingsPage
 * @function
 * @memberof module:controllers/author~authorController
 * @inner
 * @param {Express.Request} req - the express request object
 * @param {Express.Response} res - the express response object
 * @param {Function} next
 * @param {Object} req.user -  the user session object
 */
exports.getSettingsPage = async (req, res, next) => {
  if (req.user) {
    try {
      const blog = await db.getAuthor(req.user.id);

      return res.render('author_settings.ejs', {
        title: 'Author Blog Settings',
        description:
          'This is the author blog settings where he can change the blog titles, subtitles and author name',
        authorData: blog,
        scriptSrc: ['/scripts/settings.js'],
        nonce: res.locals.cspNonce,
        csrfToken: req.csrfToken(),
      });
    } catch (e) {
      next(e);
    }
  }
  return res.redirect('../auth/login');
};

/**
 * Update the author settings
 * @exports updateSettings
 * @function
 * @memberof module:controllers/author~authorController
 * @inner
 * @param {Express.Request} req - the express request object
 * @param {Express.Response} res - the express response object
 * @param {Function} next
 * @param {Object} req.user -  the user session object
 * @param {String} req.body.author_name - the new author name
 * @param {String} req.body.blogTitle - the new blog title
 * @param {String} req.body.blogSubtitle - the new blog subtitle
 */
exports.updateSettings = async (req, res, next) => {
  if (req.user) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).jsonp(errors.array());
    }

    const blogData = matchedData(req);
    const authorData = {
      author_id: req.user.id,
      author_name: blogData.author_name,
      blogTitle: blogData.blogTitle,
      blogSubtitle: blogData.blogSubtitle,
    };
    return db
      .updateAuthor(authorData)
      .then((result) => {
        if (result.changes > 0) {
          res.status(200).json({ message: 'Updated successfully' });
        } else {
          res.status(400).json({ message: 'Not updated' });
        }
      })
      .catch((err) => next(err));
  }
  return res.redirect('../auth/login');
};

/**
 * Render the article edit page
 * @exports getEditPage
 * @function
 * @memberof module:controllers/author~authorController
 * @inner
 * @param {Express.Request} req - the express request object
 * @param {Express.Response} res - the express response object
 * @param {Function} next
 * @param {Object} req.user -  the user session object
 * @param {int} req.query.article_id the id of the article to edit
 */
exports.getEditPage = async (req, res, next) => {
  if (req.user) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).jsonp(errors.array());
      }

      const article_id = req.query.article_id;
      const article = await db.getArticle(article_id);

      article.creation_date = dayjs
        .utc(article.creation_date)
        .tz()
        .format('DD MMM YYYY h:mm A');

      if (article.modification_date) {
        article.modification_date = dayjs
          .utc(article.modification_date)
          .tz()
          .fromNow();
      }

      if (article) {
        return res.render('author_edit.ejs', {
          title: 'Author Article edit',
          description:
            'This is where the author writes, amends and publishes individual articles.',
          scriptSrc: [
            'https://cdn.ckeditor.com/ckeditor5/38.1.0/classic/ckeditor.js',
            '/scripts/edit.js',
          ],
          nonce: res.locals.cspNonce,
          article: article,
          csrfToken: req.csrfToken(),
        });
      } else {
        return res.redirect('/');
      }
    } catch (e) {
      next(e);
    }
  }
  return res.redirect('../auth/login');
};
/**
 * Update the article title, subtitle and the content
 * @exports updateArticle
 * @function
 * @memberof module:controllers/author~authorController
 * @inner
 * @param {Express.Request} req - the express request object
 * @param {Express.Response} res - the express response object
 * @param {Function} next
 * @param {Object} req.user -  the user session object
 * @param {int} req.body.article_id  the id of the article to be updated
 * @param {String} req.body.article_title the new article title
 * @param {String} req.body.article_subtitle the new article subtitle
 * @param {String} req.body.article_content the new article content
 */
exports.updateArticle = async (req, res, next) => {
  if (req.user) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }
      const articleData = matchedData(req);
      const result = await db.updateArticle(articleData);

      if (result && result.changes > 0) {
        return res.sendStatus(200);
      }
      return res.sendStatus(400);
    } catch (e) {
      next(e);
    }
  }
  return res.redirect('../auth/login');
};

/**
 * publishes an article by setting the publication date
 * @exports publishArticle
 * @function
 * @memberof module:controllers/author~authorController
 * @inner
 * @param {Express.Request} req - the express request object
 * @param {Express.Response} res - the express response object
 * @param {Function} next
 * @param {Object} req.user -  the user session object
 * @param {int} req.body.article_id the id of the article to be published
 */
exports.publishArticle = async (req, res, next) => {
  if (req.user) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      const article_id = req.body.article_id;

      // check whether article has empty columns
      const articleCheck = await db.getArticle(article_id);
      if (
        !articleCheck.article_title ||
        !articleCheck.article_subtitle ||
        !articleCheck.article_content
      ) {
        return res.status(400).json({
          message: 'Publish failed. Article have some missing contents',
        });
      }

      const published = await db.publishArticle(article_id);
      if (published && published.changes > 0) {
        return res.sendStatus(200);
      }
    } catch (e) {
      next(e);
    }
  }
  return res.redirect('../auth/login');
};
