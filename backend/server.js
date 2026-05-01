// server.js — Сервери асосии Yordam.tj
// Ин файл серверро мекушояд ва ба запросҳои HTTP ҷавоб медиҳад

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware — функсияҳое, ки пеш аз ҳар запрос кор мекунанд
app.use(cors());                  // Иҷозат ба frontend ки ба сервер муроҷиат кунад
app.use(express.json());          // JSON-ро мефаҳмад

// ============================================
// Endpoint-и тестӣ — то бубинем сервер кор мекунад
// ============================================
app.get('/', (req, res) => {
  res.json({
    message: 'Yordam.tj API кор мекунад! 🎉',
    version: '1.0.0',
    endpoints: ['/api/register', '/api/login', '/api/tasks']
  });
});

// ============================================
// POST /api/register — Сабти ном
// ============================================
app.post('/api/register', async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    // 1. Тафтиш: ҳамаи майдонҳо пур шудаанд?
    if (!name || !phone || !password) {
      return res.status(400).json({
        error: 'Ном, телефон ва парол ҳатмӣ мебошанд'
      });
    }

    // 2. Тафтиш: ин телефон қаблан сабт нашудааст?
    const existing = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
    if (existing) {
      return res.status(409).json({
        error: 'Ин рақами телефон аллакай сабт шудааст'
      });
    }

    // 3. Паролро рамзгузорӣ мекунем (hash)
    const password_hash = await bcrypt.hash(password, 10);

    // 4. Юзери навро ба база меандозем
    const result = db.prepare(`
      INSERT INTO users (name, phone, email, password_hash)
      VALUES (?, ?, ?, ?)
    `).run(name, phone, email || null, password_hash);

    const userId = result.lastInsertRowid;

    // 5. JWT token месозем (то юзер баъдан логин бошад)
    const token = jwt.sign(
      { userId, phone, name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // 6. Ҷавоб ба frontend
    res.status(201).json({
      success: true,
      message: 'Сабти ном муваффақ',
      token,
      user: { id: userId, name, phone, email }
    });

  } catch (err) {
    console.error('Хатогӣ дар /api/register:', err);
    res.status(500).json({ error: 'Хатогии сервер' });
  }
});

// ============================================
// POST /api/login — Воридшавӣ
// ============================================
app.post('/api/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        error: 'Телефон ва парол ҳатмӣ мебошанд'
      });
    }

    // 1. Юзерро дар база ёфтан
    const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
    if (!user) {
      return res.status(401).json({
        error: 'Телефон ё парол нодуруст'
      });
    }

    // 2. Паролро санҷидан (bcrypt худаш ҳэшро муқоиса мекунад)
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({
        error: 'Телефон ё парол нодуруст'
      });
    }

    // 3. JWT token нав месозем
    const token = jwt.sign(
      { userId: user.id, phone: user.phone, name: user.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'Воридшавӣ муваффақ',
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email
      }
    });

  } catch (err) {
    console.error('Хатогӣ дар /api/login:', err);
    res.status(500).json({ error: 'Хатогии сервер' });
  }
});

// ============================================
// Middleware: тафтиши JWT token
// ============================================
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token лозим' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;  // userId, phone, name дар req.user мегузоранд
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token нодуруст ё мӯҳлаташ гузашта' });
  }
}

// ============================================
// GET /api/me — маълумоти юзери воридшуда
// ============================================
app.get('/api/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, name, phone, email, role, created_at FROM users WHERE id = ?')
    .get(req.user.userId);
  res.json({ user });
});

// ============================================
// GET /api/tasks — Рӯйхати ҳамаи заявкаҳо
// ============================================
app.get('/api/tasks', (req, res) => {
  const tasks = db.prepare(`
    SELECT t.*, u.name as user_name, u.phone as user_phone
    FROM tasks t
    JOIN users u ON t.user_id = u.id
    WHERE t.status = 'open'
    ORDER BY t.created_at DESC
  `).all();
  res.json({ tasks });
});

// ============================================
// POST /api/tasks — Заявкаи нав фиристодан
// ============================================
app.post('/api/tasks', authMiddleware, (req, res) => {
  try {
    const { title, description, category, budget, address } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        error: 'Сарлавҳа ва категория ҳатмӣ мебошанд'
      });
    }

    const result = db.prepare(`
      INSERT INTO tasks (user_id, title, description, category, budget, address)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      req.user.userId,
      title,
      description || null,
      category,
      budget || null,
      address || null
    );

    res.status(201).json({
      success: true,
      message: 'Заявка қабул шуд',
      taskId: result.lastInsertRowid
    });

  } catch (err) {
    console.error('Хатогӣ дар POST /api/tasks:', err);
    res.status(500).json({ error: 'Хатогии сервер' });
  }
});

// ============================================
// GET /api/stats — омори умумӣ (бе авторизатсия)
// ============================================
app.get('/api/stats', (req, res) => {
  const usersCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  const tasksCount = db.prepare('SELECT COUNT(*) as c FROM tasks').get().c;
  const closedTasks = db.prepare("SELECT COUNT(*) as c FROM tasks WHERE status = 'closed'").get().c;
  const specialistsCount = db.prepare('SELECT COUNT(*) as c FROM specialists').get().c;
  res.json({
    users: usersCount,
    tasks: tasksCount,
    completed: closedTasks,
    specialists: specialistsCount
  });
});

// ============================================
// GET /api/my-tasks — заявкаҳои юзери ҷорӣ
// ============================================
app.get('/api/my-tasks', authMiddleware, (req, res) => {
  const tasks = db.prepare(`
    SELECT * FROM tasks
    WHERE user_id = ?
    ORDER BY created_at DESC
  `).all(req.user.userId);

  // Статистика
  const stats = {
    total: tasks.length,
    open: tasks.filter(t => t.status === 'open').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    closed: tasks.filter(t => t.status === 'closed').length
  };

  res.json({ tasks, stats });
});

// ============================================
// PATCH /api/tasks/:id/status — тағйири статус
// ============================================
app.patch('/api/tasks/:id/status', authMiddleware, (req, res) => {
  const taskId = parseInt(req.params.id);
  const { status } = req.body;
  const allowed = ['open', 'in_progress', 'closed'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Статуси нодуруст' });
  }

  const task = db.prepare('SELECT user_id FROM tasks WHERE id = ?').get(taskId);
  if (!task) return res.status(404).json({ error: 'Заявка ёфт нашуд' });
  if (task.user_id !== req.user.userId) {
    return res.status(403).json({ error: 'Иҷозат надоред' });
  }

  db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run(status, taskId);
  res.json({ success: true, status });
});

// ============================================
// DELETE /api/tasks/:id — нест кардани заявка (танҳо аз они худ)
// ============================================
app.delete('/api/tasks/:id', authMiddleware, (req, res) => {
  const taskId = parseInt(req.params.id);
  if (!taskId) return res.status(400).json({ error: 'ID нодуруст' });

  // Аввал санҷем — ин заявка аз они юзери ҷорӣ ҳаст?
  const task = db.prepare('SELECT user_id FROM tasks WHERE id = ?').get(taskId);
  if (!task) return res.status(404).json({ error: 'Заявка ёфт нашуд' });
  if (task.user_id !== req.user.userId) {
    return res.status(403).json({ error: 'Иҷозат надоред' });
  }

  db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);
  res.json({ success: true, message: 'Заявка нест карда шуд' });
});

// ============================================
// Серверро мекушоем
// ============================================
app.listen(PORT, () => {
  console.log(`🚀 Сервер кор мекунад: http://localhost:${PORT}`);
  console.log(`📍 Тестӣ кушоед: http://localhost:${PORT}/`);
});
