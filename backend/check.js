const db = require('./db');
const users = db.prepare('SELECT id, name, phone, email, created_at FROM users').all();
console.log('Юзерҳои сабтшуда:', users.length);
console.log(JSON.stringify(users, null, 2));
