// db.js — Файли пайвасткунӣ ба базаи SQLite
// Дар ин файл базаи `yordam.db` сохта мешавад ва ҷадвалҳои зарурӣ эҷод мегарданд

const { DatabaseSync } = require('node:sqlite');
const path = require('path');

// Базаро дар ҳамин папка нигоҳ медорем — файли yordam.db
const dbPath = path.join(__dirname, 'yordam.db');
const db = new DatabaseSync(dbPath);

// Ҷадвали 1: users — юзерҳои оддӣ (мизоҷон)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'client',
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

// Ҷадвали 2: specialists — мутахассисон (устодон)
db.exec(`
  CREATE TABLE IF NOT EXISTS specialists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category TEXT NOT NULL,
    bio TEXT,
    rating REAL DEFAULT 0,
    completed_jobs INTEGER DEFAULT 0,
    hourly_rate INTEGER,
    is_verified INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

// Ҷадвали 3: tasks — заявкаҳои мизоҷон
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    budget INTEGER,
    address TEXT,
    status TEXT DEFAULT 'open',
    specialist_id INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (specialist_id) REFERENCES specialists(id)
  )
`);

console.log('✅ База тайёр аст: yordam.db');

module.exports = db;
