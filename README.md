# Yordam.tj — Платформа услуг в Таджикистане

> Полнофункциональная full-stack платформа для поиска мастеров и услуг в Таджикистане.
> Аналог Avito Услуги / YouDo для таджикского рынка.

[![Status](https://img.shields.io/badge/status-MVP%20готов-success)]()
[![Stack](https://img.shields.io/badge/stack-Node.js%20%2B%20SQLite-blue)]()
[![License](https://img.shields.io/badge/license-Private-red)]()

---

## 📸 Скриншоты

| Главная страница | Личный кабинет |
|---|---|
| Заявки в реальном времени, статистика из базы | Управление своими заявками: закрыть/удалить |

---

## ✨ Возможности (фичи)

### Для пользователей:
- 🔐 **Регистрация и вход** — телефон + пароль (с шифрованием bcrypt)
- 📝 **Создание заявок** — категория, бюджет, описание, адрес
- 📋 **Просмотр всех заявок** — фильтр по категориям
- 👤 **Личный кабинет** — статистика, мои заявки
- 🔒 **Управление заявкой** — закрыть, открыть, удалить
- 🌐 **2 языка** — таджикский / русский

### Технические:
- 🔑 **JWT-аутентификация** (токен 30 дней)
- 🛡️ **Защита от XSS** через escapeHtml
- 🔒 **bcrypt** для паролей (10 раундов)
- ✅ **Валидация** (уникальный телефон, обязательные поля)
- 📱 **PWA** (можно установить как приложение)
- 🎨 **Адаптивный дизайн** (mobile + desktop)
- 🍞 **Toast-уведомления** + loading-состояния

---

## 🛠️ Стек технологий

### Frontend
- **HTML5** + **CSS3** (без фреймворков, чистый код)
- **Vanilla JavaScript** (ES2020+, async/await, fetch API)
- **PWA** (manifest.json, service worker)

### Backend
- **Node.js** v22+ (используется встроенный `node:sqlite`)
- **Express** 4.21 — web-сервер
- **bcryptjs** — хеширование паролей
- **jsonwebtoken** — JWT токены
- **cors** — CORS-политика
- **dotenv** — env-переменные

### База данных
- **SQLite** (файл `yordam.db`)
- 3 таблицы: `users`, `tasks`, `specialists`
- Foreign keys + индексы

### Тесты
- **Playwright** — e2e тесты (desktop + mobile)

---

## 📁 Структура проекта

```
yordam-tj/
├── index.html              ← главная страница (HTML + inline CSS/JS)
├── style.css               ← legacy стили
├── script.js               ← legacy JS (не используется)
├── manifest.json           ← PWA-манифест
├── sw.js                   ← service worker
├── 404.html                ← страница ошибки
├── icons/                  ← иконки PWA
├── fonts/                  ← шрифты
│
├── backend/                ← API-сервер
│   ├── server.js           ← Express + 9 endpoint
│   ├── db.js               ← SQLite, схема таблиц
│   ├── package.json        ← зависимости
│   ├── .env                ← секреты (не в git!)
│   ├── .gitignore
│   ├── yordam.db           ← база (не в git!)
│   ├── check.js            ← админ-скрипт: посмотреть юзеров
│   ├── reset-password.js   ← админ-скрипт: сбросить пароль
│   └── seed-tasks.js       ← добавить тестовые заявки
│
├── tests/                  ← Playwright тесты
│   ├── homepage.spec.js
│   └── mobile.spec.js
│
└── docs/                   ← документация
    ├── README.md           ← вы здесь
    ├── ARCHITECTURE.md     ← как всё устроено
    ├── API.md              ← все endpoint
    └── SETUP.md            ← как запустить
```

---

## 🚀 Быстрый старт

```bash
# 1. Backend (порт 3001)
cd backend
npm install
node server.js

# 2. Frontend (порт 3000) — в другом терминале
cd ..
npx serve -l 3000 -s .

# 3. Открыть в браузере
# http://localhost:3000
```

Подробная инструкция: [SETUP.md](./SETUP.md)

---

## 📊 Текущее состояние

### ✅ Готово (MVP)
- [x] Frontend (HTML/CSS/JS) — 100%
- [x] Backend API — 9 endpoint
- [x] База данных — 3 таблицы
- [x] Аутентификация — JWT + bcrypt
- [x] CRUD заявок — Create/Read/Update/Delete
- [x] Личный кабинет
- [x] Real-time статистика
- [x] Toast + loading UX

### 🚧 Дальше
- [ ] Деплой в интернет (Render + Vercel)
- [ ] SMS-верификация (Alif Mobi или Twilio)
- [ ] Загрузка фото (Cloudinary)
- [ ] Поиск и сортировка
- [ ] Профиль мастера + рейтинги
- [ ] Чат между клиентом и мастером
- [ ] Платежи (Alif Mobi, DC Wallet)
- [ ] Админ-панель
- [ ] Покупка домена `yordam.tj`

---

## 👥 Команда

- **Носирҷон** — Founder, Full-Stack Developer
- **[Партнёр]** — Tech advisor

---

## 📝 Лицензия

Private. Все права защищены © 2026 Yordam.tj
