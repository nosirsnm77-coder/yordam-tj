// Админ-скрипт: сбросить пароль юзера
// Использование: node reset-password.js <id> <новый_пароль>

const bcrypt = require('bcryptjs');
const db = require('./db');

const userId = process.argv[2];
const newPassword = process.argv[3];

if (!userId || !newPassword) {
  console.log('Истифода: node reset-password.js <id> <парол>');
  process.exit(1);
}

const hash = bcrypt.hashSync(newPassword, 10);
const result = db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, userId);

if (result.changes > 0) {
  const user = db.prepare('SELECT id, name, phone FROM users WHERE id = ?').get(userId);
  console.log(`✅ Парол барои юзер #${userId} (${user.name}) тағйир дода шуд`);
  console.log(`📱 Телефон: ${user.phone}`);
  console.log(`🔑 Пароли нав: ${newPassword}`);
} else {
  console.log(`❌ Юзери ID=${userId} ёфт нашуд`);
}
