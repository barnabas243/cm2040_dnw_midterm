// SQLite connection config
/**
 * @module
 * @requires sqlite3
 * @requires path
 */

/**
 * sqlite3 module
 * @const
 */
const sqlite3 = require('sqlite3').verbose();
/**
 * path module
 * @const
 */
const path = require('path');

/**
 * Initialize sqlite database connection
 * @constructor
 * */
const db = new sqlite3.Database(
  path.resolve(__dirname, '../database.db'),
  function (err) {
    if (err) {
      console.error(err);
      process.exit(1); //Bail out we can't connect to the DB
    } else {
      console.log('Database connected');
      db.run('PRAGMA foreign_keys=ON'); //This tells SQLite to pay attention to foreign key constraints
    }
  },
);

module.exports = db;
