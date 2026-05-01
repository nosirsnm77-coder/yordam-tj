// Скрипт для добавления тестовых заявок в базу
const db = require('./db');

const tasks = [
  {
    user_id: 2,
    title: 'Таъмири дастгоҳи кондитсионер',
    description: 'Кондитсионер шамол намедиҳад. Лозим аст, ки усто омада санҷад ва таъмир кунад.',
    category: 'Сантехникӣ',
    budget: 300,
    address: 'Душанбе, ноҳияи Сино'
  },
  {
    user_id: 2,
    title: 'Сохтани сайти визитка',
    description: 'Барои тиҷорати хурди ман сайти 3-саҳифагӣ лозим: дар бораи мо, хизматҳо, тамос.',
    category: 'IT',
    budget: 1500,
    address: 'Дар хат (онлайн)'
  }
];

let added = 0;
for (const t of tasks) {
  // Тафтиш — ин заявка қаблан илова шудааст?
  const existing = db.prepare('SELECT id FROM tasks WHERE title = ? AND user_id = ?').get(t.title, t.user_id);
  if (existing) {
    console.log(`⏭️  Аллакай ҳаст: ${t.title}`);
    continue;
  }
  db.prepare(`
    INSERT INTO tasks (user_id, title, description, category, budget, address)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(t.user_id, t.title, t.description, t.category, t.budget, t.address);
  console.log(`✅ Илова шуд: ${t.title}`);
  added++;
}

console.log(`\n📊 ${added} заявка ба база илова шуд`);
const total = db.prepare('SELECT COUNT(*) as c FROM tasks').get().c;
console.log(`📋 Дар маҷмӯъ дар база: ${total} заявка`);
