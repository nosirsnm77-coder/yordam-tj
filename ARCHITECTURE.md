# Архитектура Yordam.tj

## 🏗️ Общая схема

```
┌─────────────────────┐         ┌──────────────────────┐         ┌────────────────┐
│                     │         │                      │         │                │
│   Браузер юзера    │  HTTP   │   Backend (Node.js) │   SQL   │   База данных │
│   (HTML/CSS/JS)    │◄──────► │   Express + JWT     │◄──────► │   SQLite файл │
│                     │  fetch  │   Порт: 3001         │         │   yordam.db    │
│   Порт: 3000       │  JSON   │                      │         │                │
└─────────────────────┘         └──────────────────────┘         └────────────────┘
        ▲                                  ▲
        │                                  │
        │ localStorage                     │ bcrypt + JWT
        │ (token + user)                   │ (auth)
        │                                  │
        └──────────────────────────────────┘
                Stateless authentication
```

---

## 🔄 Полный цикл работы

### Сценарий: Юзер создаёт заявку

```
1. ЮЗЕР → нажимает "Фармоиш додан"
   ↓
2. Frontend → открывает модалку с формой
   ↓
3. ЮЗЕР → заполняет и отправляет
   ↓
4. Frontend → fetch('POST /api/tasks', { Authorization: Bearer <token>, body: {...} })
   ↓
5. Backend → authMiddleware проверяет JWT-токен
   ├─ если token валидный → req.user = { userId, phone, name }
   └─ если нет → 401 Unauthorized
   ↓
6. Backend → INSERT INTO tasks (user_id, title, ...) VALUES (...)
   ↓
7. SQLite → сохраняет, возвращает id
   ↓
8. Backend → res.json({ success: true, taskId: 5 })
   ↓
9. Frontend → toast("Заявкаи шумо қабул шуд!", success)
   ↓
10. Frontend → loadTasks() — перезагружает список
    ↓
11. ЮЗЕР видит свою новую заявку в списке
```

---

## 🗂️ Структура базы данных

### Таблица `users`

| Поле | Тип | Описание |
|---|---|---|
| `id` | INTEGER PRIMARY KEY | Автоинкремент |
| `name` | TEXT NOT NULL | Имя пользователя |
| `phone` | TEXT UNIQUE NOT NULL | Телефон (уникальный) |
| `email` | TEXT UNIQUE | Email (опционально) |
| `password_hash` | TEXT NOT NULL | bcrypt хеш пароля |
| `role` | TEXT DEFAULT 'client' | client / master / admin |
| `created_at` | TEXT | Дата регистрации |

### Таблица `tasks`

| Поле | Тип | Описание |
|---|---|---|
| `id` | INTEGER PRIMARY KEY | Автоинкремент |
| `user_id` | INTEGER NOT NULL | FK → users.id |
| `title` | TEXT NOT NULL | Название заявки |
| `description` | TEXT | Подробное описание |
| `category` | TEXT NOT NULL | Категория (Таъмир, IT, ...) |
| `budget` | INTEGER | Бюджет в сомони |
| `address` | TEXT | Адрес или "онлайн" |
| `status` | TEXT DEFAULT 'open' | open / in_progress / closed |
| `specialist_id` | INTEGER | FK → specialists.id (после принятия) |
| `created_at` | TEXT | Дата создания |

### Таблица `specialists` (мастера)

| Поле | Тип | Описание |
|---|---|---|
| `id` | INTEGER PRIMARY KEY | Автоинкремент |
| `user_id` | INTEGER NOT NULL | FK → users.id |
| `category` | TEXT NOT NULL | Специализация |
| `bio` | TEXT | О себе |
| `rating` | REAL DEFAULT 0 | Средний рейтинг |
| `completed_jobs` | INTEGER DEFAULT 0 | Кол-во выполненных |
| `hourly_rate` | INTEGER | Цена за час |
| `is_verified` | INTEGER DEFAULT 0 | Проверен ли админом |
| `created_at` | TEXT | Дата создания профиля |

---

## 🔐 Безопасность

### 1. Пароли — bcrypt
```js
// При регистрации
const hash = await bcrypt.hash(password, 10);
// "myPass123" → "$2a$10$X9zR7..."

// При логине
const isValid = await bcrypt.compare(password, user.password_hash);
```
**Почему важно:** даже если хакер украдёт базу — пароли расшифровать невозможно.

### 2. Аутентификация — JWT
```js
// При успешном логине
const token = jwt.sign(
  { userId, phone, name },
  JWT_SECRET,
  { expiresIn: '30d' }
);
// "eyJhbGciOiJIUzI1NiIsInR5cCI..."
```
Токен сохраняется в `localStorage` браузера. Каждый запрос — токен в заголовке `Authorization: Bearer <token>`.

### 3. authMiddleware — проверка токена
```js
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();  // допускаем дальше
  } catch {
    return res.status(401).json({ error: 'Token нодуруст' });
  }
}
```

### 4. Защита от XSS
```js
function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;')...
}
```
Если злодей в заявке напишет `<script>...</script>` — это станет текстом, а не выполняемым кодом.

### 5. Authorization (право собственности)
Перед удалением/изменением заявки — проверка, что она принадлежит юзеру:
```js
if (task.user_id !== req.user.userId) {
  return res.status(403).json({ error: 'Иҷозат надоред' });
}
```

---

## 📡 Endpoint-ы (краткий список)

| Метод | Путь | Auth | Описание |
|---|---|---|---|
| GET | `/` | — | Health check |
| POST | `/api/register` | — | Регистрация |
| POST | `/api/login` | — | Вход |
| GET | `/api/me` | ✅ | Кто я |
| GET | `/api/stats` | — | Общая статистика |
| GET | `/api/tasks` | — | Все открытые заявки |
| POST | `/api/tasks` | ✅ | Создать заявку |
| GET | `/api/my-tasks` | ✅ | Мои заявки + статистика |
| PATCH | `/api/tasks/:id/status` | ✅ | Изменить статус |
| DELETE | `/api/tasks/:id` | ✅ | Удалить свою |

Подробнее: [API.md](./API.md)

---

## 🎨 Frontend — структура JS

```
index.html (всё в одном файле)
│
├── <style>            ← все стили
│
├── HTML разметка
│   ├── <header>       ← навигация + кнопки логина
│   ├── <section.hero> ← главный экран + статистика
│   ├── <section.categories>
│   ├── <section.how>
│   ├── <section.tasks-section> ← заявки (частично из базы)
│   ├── <section.specialists>
│   ├── <footer>
│   ├── 4 модалки (login, register, createTask, cabinet)
│   └── chat-widget
│
└── <script>
    ├── Toast и loading-helpers
    ├── Backend API helpers (apiRequest, токены)
    ├── updateAuthUI — управление шапкой
    ├── Form handlers (login, register, createTask)
    ├── loadTasks() — заявки в "Фармоишҳои нав"
    ├── loadStats() — цифры в hero
    ├── openCabinet() — личный кабинет
    └── Modal management, language switcher, etc.
```

---

## ⚖️ Принципы дизайна

1. **Простота превыше всего** — нет лишних фреймворков
2. **Безопасность по умолчанию** — auth-проверки, escapeHtml
3. **Чёткое разделение** — frontend / backend / database
4. **REST API** — стандартные HTTP методы
5. **Stateless backend** — токен в каждом запросе, нет сессий
6. **Responsive** — работает на любом устройстве

---

## 🚀 Как масштабировать в будущем

### Phase 1: Деплой (текущая фаза)
- SQLite → подходит до ~10,000 пользователей
- Render.com (backend) + Vercel (frontend)

### Phase 2: Рост (после 1000 юзеров)
- SQLite → **PostgreSQL** (Neon/Supabase free)
- Кэширование с Redis (Upstash free)
- CDN для статики

### Phase 3: Production (после 10,000 юзеров)
- Backend → отдельный VPS (DigitalOcean/Hetzner)
- Postgres → managed (Supabase pro)
- Мониторинг (Sentry, Plausible)
- CI/CD (GitHub Actions)
