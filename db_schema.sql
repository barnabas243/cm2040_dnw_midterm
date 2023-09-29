
-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

--create your tables with SQL commands here (watch out for slight syntactical differences with SQLite)

CREATE TABLE IF NOT EXISTS authors (
    author_id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    hashed_password TEXT NOT NULL,
    salt TEXT NOT NULL, 
    author_name TEXT NOT NULL,
    register_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    blogTitle TEXT DEFAULT "My Awesome Blog",
    blogSubtitle TEXT DEFAULT "I am just a placeholder. Edit me by clicking on the settings icon."
);
CREATE TABLE IF NOT EXISTS articles (
    article_id INTEGER PRIMARY KEY AUTOINCREMENT,
    creation_date TEXT NOT NULL default (current_date);
    modification_date TEXT ,
    article_title TEXT DEFAULT "",
    article_subtitle TEXT DEFAULT "",
    article_content TEXT DEFAULT "", 
    publish_date TEXT DEFAULT NULL,
    article_likes INTEGER NOT NULL DEFAULT 0,
    article_read INTEGER NOT NULL DEFAULT 0,
    author_id INT NOT NULL,
    FOREIGN KEY (author_id) REFERENCES authors(author_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comments (
    comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    comment_user TEXT NOT NULL,
    comment_date TEXT DEFAULT CURRENT_TIMESTAMP,
    comment_content TEXT NOT NULL,
    article_id INT NOT NULL,
    FOREIGN KEY (article_id) REFERENCES articles(article_id) ON DELETE CASCADE

);

--insert default data (if necessary here)

COMMIT;

