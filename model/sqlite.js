/**
 * Sqlite3 model to interact with the database
 * @module
 * @requires config/db
 */

/**
 * sqlite3 config
 * @const
 */
const db = require('./../config/db');

/////////////////////////////////// Author CRUD ///////////////////////////////////

/**
 * create a new author with the credentials
 * @param {Array} authorCredentials [email, hashed_password, salt, author_name]
 * @returns {object} an object of the last id of the table and number of changes made
 */
exports.addAuthor = async (authorCredentials) => {
  const sql =
    'INSERT INTO authors(email,hashed_password,salt,author_name) VALUES (?,?,?,?)';
  const response = await db_run(sql, authorCredentials);
  return response;
};

/**
 * get the author details by author_id
 * @param {int} author_id
 * @returns {Object} an object of author blog data
 */
exports.getAuthor = async (author_id) => {
  const sql =
    'SELECT author_id, author_name, blogTitle, blogSubtitle from authors WHERE author_id = ?';
  const author = await db_get(sql, [author_id]);
  return author;
};

/**
 * Get the author credentials by email
 * @param {String} email email
 * @returns {Object} an object of author credentials and name
 */
exports.getAuthorByEmail = async (email) => {
  const sql =
    'SELECT author_id, hashed_password, salt, email, author_name FROM authors WHERE email = ?';
  const author_id = await db_get(sql, [email]);
  return author_id;
};

/**
 * update the author's name, blog title and subtitle.
 * @param {Object} blogData An object of author blog settings
 * @param {int} blogData.author_id author id
 * @param {String} blogData.author_name author name
 * @param {String} blogData.blogTitle blog title
 * @param {String} blogData.blogSubtitle blog subtitle
 * @returns {object} an object of the last id of the table and number of changes made
 */
exports.updateAuthor = async (blogData) => {
  const sql =
    'UPDATE authors SET author_name = ?, blogTitle = ?, blogSubtitle = ? WHERE author_id = ?';
  const param = [
    blogData.author_name,
    blogData.blogTitle,
    blogData.blogSubtitle,
    blogData.author_id,
  ];

  const response = await db_run(sql, param);
  return response;
};

/////////////////////////////////// Articles CRUD ///////////////////////////////////

/**
 * Get all the published articles, sorted by date in descending order
 * @returns {Array.<Object>} an array of all published article objects
 */
exports.getPublishedArticles = async () => {
  const sql =
    'SELECT author_name, article_id, creation_date, modification_date, article_title, article_subtitle, publish_date, article_likes FROM authors, articles WHERE authors.author_id = articles.author_id AND publish_date IS NOT NULL ORDER BY publish_date DESC';
  const articles = await db_all(sql, []);

  return articles;
};
/**
 * Get a published article by article_id
 * @param {int} article_id the id of the published article
 * @returns {Object} an object of article and author data
 */
exports.getPublishedArticle = async (article_id) => {
  const sql =
    'SELECT author_name, article_id, creation_date, modification_date, article_title, article_subtitle, article_content, publish_date, article_likes from authors, articles where authors.author_id = articles.author_id AND articles.article_id = ? AND publish_date IS NOT NULL';
  const article = await db_get(sql, [article_id]);
  return article;
};

/**
 * Get all articles by author id
 * @param {int} author_id the author int id
 * @returns {Array.<Object>} an array of all article objects
 */
exports.getArticles = async (author_id) => {
  const sql =
    'SELECT * from articles WHERE articles.author_id = ? ORDER BY publish_date DESC';
  const articles = await db_all(sql, [author_id]);
  return articles;
};

/**
 * get a article using the article_id
 * @param {int} article_id id of the article
 * @returns {Object} an object of article data
 */
exports.getArticle = async (article_id) => {
  const sql = 'SELECT * from articles WHERE articles.article_id = ?';
  const article = await db_get(sql, [article_id]);
  return article;
};

/**
 * Insert an empty article draft into the articles table
 * @param {int} author_id the author id
 * @returns {object} an object of the last id of the table and number of changes made
 */
exports.addArticle = async (author_id) => {
  const sql = 'INSERT INTO articles(author_id) VALUES (?)';
  const response = await db_run(sql, [author_id]);
  return response;
};

/**
 * Update the article title, subtitle and content of the corresponding article_id.
 * @param {Object} article an object of article data from user input
 * @param {int} article.article_id the id of the article to be updated
 * @param {String} article.article_title the new article title
 * @param {String} article.article_subtitle the new article subtitle
 * @param {String} article.article_content the new article content
 * @returns {object} an object of the last id of the table and number of changes made
 */
exports.updateArticle = async (article) => {
  const sql =
    'UPDATE articles SET article_title = ?, article_subtitle = ?,article_content = ?,  modification_date = CURRENT_TIMESTAMP WHERE article_id = ?';
  const param = [
    article.title,
    article.subtitle,
    article.content,
    article.article_id,
  ];
  const result = await db_run(sql, param);
  return result;
};

/**
 * Update the publish date of the article with the corresponding article_id
 * @param {int} article_id the id of article to be published
 * @returns {object} an object of the last id of the table and number of changes made
 */
exports.publishArticle = async (article_id) => {
  const sql =
    'UPDATE articles SET publish_date = CURRENT_TIMESTAMP WHERE article_id = ?';
  const param = [article_id];
  const result = await db_run(sql, param);
  return result;
};

/**
 * delete an article
 * @param {int} article_id the id of the article to be deleted
 * @returns {object} an object of the last id of the table and number of changes made
 */
exports.deleteArticle = async (article_id) => {
  const sql = 'DELETE FROM articles WHERE article_id = ?';
  const param = [article_id];
  const response = await db_run(sql, param);
  return response;
};

//////////////////////////// Article likes & comments //////////////////////////////////

/**
 * update the number of article likes
 * @param {int} article_id the id of the article that was liked
 * @param {int} val either -1 or 1
 * @returns {Object} an object with the total number of likes
 */
exports.updateArticleLikes = async (article_id, val) => {
  const sql =
    'UPDATE articles SET article_likes = article_likes + ? WHERE article_id = ? RETURNING article_likes';
  const param = [val, article_id];

  const result = await db_get(sql, param);
  return result;
};

/**
 * Insert a new comment for the article
 * @param {JObject} comment an object of comment data
 * @param {int} comment.article_id id of the article
 * @param {String} comment.comment_user name of user that commented
 * @param {String} comment.comment_content the content of the comment
 * @returns {object} an object of the last id of the comments table and number of changes made
 */
exports.addComment = async (comment) => {
  const sql =
    'INSERT INTO comments(comment_content, comment_user, article_id) VALUES (?,?,?) RETURNING *';
  const param = [comment.comment_content, comment.user, comment.article_id];

  const insertedComment = await db_run(sql, param);
  return insertedComment;
};

/**
 * Get all the comments, sorted by date in descending order
 * @param {int} article_id id of the article
 * @returns {Array.<Object>} an array of comments object
 */
exports.getComments = async (article_id) => {
  const sql =
    'SELECT * FROM comments WHERE article_id = ? ORDER BY comment_date DESC';
  const param = [article_id];

  const rows = await db_all(sql, param);
  return rows;
};

//////////////////////////// SQLite commands //////////////////////////////////

/**
 * added the promise wrapper to make the db.all() function asynchronous
 * @param {String} query sql string statement
 * @param {Array} param an array of data
 * @returns {Array} rows
 */
async function db_all(query, param) {
  return new Promise(function (resolve, reject) {
    db.all(query, param, function (err, rows) {
      if (err) {
        const errorMsg = {
          error: err,
        };
        reject(errorMsg);
      }
      resolve(rows);
    });
  });
}

/**
 * added the promise wrapper to make the db.get() function asynchronous
 * @param {String} query sql string statement
 * @param {Array} param an array of data
 * @returns {Object} row
 */
async function db_get(query, param) {
  return new Promise(function (resolve, reject) {
    db.get(query, param, function (err, row) {
      if (err) {
        const errorMsg = {
          error: err,
        };
        reject(errorMsg);
      }
      resolve(row);
    });
  });
}

/**
 * added the promise wrapper to make the db.run() function asynchronous
 * @param {String} query sql string statement
 * @param {Array} param an array of data
 * @returns {Object} this: {lastId : int, changes : int}
 */
async function db_run(query, param) {
  return new Promise(function (resolve, reject) {
    db.run(query, param, function (err) {
      if (err) {
        const errorMsg = {
          error: err,
        };
        reject(errorMsg);
      }
      resolve(this);
    });
  });
}
