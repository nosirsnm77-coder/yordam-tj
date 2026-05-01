# Как запустить Yordam.tj — инструкция

> Этот документ для **партнёра-разработчика** или для повторного запуска проекта.
> Время установки: ~5-10 минут.

---

## 📋 Требования

Перед началом убедись, что установлено:

| ПО | Версия | Как проверить |
|---|---|---|
| **Node.js** | v22+ | `node --version` |
| **npm** | v10+ | `npm --version` |
| **Git** (опционально) | любая | `git --version` |
| **VS Code** (опционально) | любая | редактор кода |

### Если Node.js не установлен:

**Windows:**
```bash
winget install OpenJS.NodeJS
```

**Mac:**
```bash
brew install node
```

**Linux:**
```bash
sudo apt install nodejs npm
```

Скачать вручную: https://nodejs.org

---

## 🚀 Запуск с нуля

### Шаг 1 — Получить проект

Если есть архив `.zip`:
- Распакуй в любую папку (например `C:\Projects\yordam-tj`)

Если есть git-репозиторий:
```bash
git clone <repo-url>
cd yordam-tj
```

### Шаг 2 — Запустить backend

Открой терминал в папке `backend/`:

```bash
cd backend

# Установить зависимости (один раз)
npm install

# Запустить сервер
node server.js
```

**Должно появиться:**
```
✅ База тайёр аст: yordam.db
🚀 Сервер кор мекунад: http://localhost:3001
📍 Тестӣ кушоед: http://localhost:3001/
```

База `yordam.db` создастся автоматически при первом запуске.

### Шаг 3 — Запустить frontend

Открой **второй терминал** в корневой папке проекта:

```bash
# В папке yordam-tj/
npx serve -l 3000 -s .
```

**Должно появиться:**
```
Serving!
- Local:    http://localhost:3000
```

### Шаг 4 — Открыть в браузере

Перейди по адресу: **http://localhost:3000**

🎉 Готово!

---

## 🧪 Тестовые данные

### Создать тестового пользователя

В браузере:
1. Нажми **«Бақайдгирӣ»**
2. Заполни форму
3. Запомни пароль!

### Или через API (curl):
```bash
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Тест","phone":"+992900000001","password":"test123"}'
```

### Добавить демо-заявки

В папке `backend/`:
```bash
node seed-tasks.js
```

⚠️ Этот скрипт добавляет заявки от пользователя с `id=2`. Если у тебя другой ID — поправь в `seed-tasks.js`.

---

## 🛠️ Полезные команды

### Backend

```bash
# Запустить сервер с авто-перезагрузкой при изменениях
node --watch server.js

# Посмотреть всех пользователей в базе
node check.js

# Сбросить пароль пользователя
node reset-password.js <id> <новый_пароль>
# Пример: node reset-password.js 2 newPass123

# Добавить тестовые заявки
node seed-tasks.js
```

### Frontend

```bash
# Простой http-сервер (если npx serve не работает)
npx http-server -p 3000

# Запустить Playwright тесты
npm test
npm run test:desktop
npm run test:mobile
```

---

## 🗂️ Что-где находится

### Изменить дизайн → `index.html`
Все CSS-стили в теге `<style>` (строки 20-1490).
HTML-разметка с 1490 до ~2200.

### Изменить логику → `index.html`
Весь JavaScript в теге `<script>` (строки 2270-2900).

Основные функции:
- `apiRequest()` — запросы к backend
- `updateAuthUI()` — управление шапкой
- `loadTasks()` / `loadStats()` — загрузка данных
- `openCabinet()` — личный кабинет
- `toast()` / `setBtnLoading()` — UX

### Изменить backend → `backend/server.js`
9 endpoint, все с комментариями на таджикском.

### Изменить структуру базы → `backend/db.js`
3 таблицы: `users`, `tasks`, `specialists`.

⚠️ **Внимание:** изменения в `db.js` влияют только на **новые** базы. Если `yordam.db` уже существует — удали его перед перезапуском.

---

## 🐛 Решение проблем

### «EADDRINUSE: address already in use :::3001»
Сервер уже запущен. Найди и закрой старый процесс:

**Windows (PowerShell):**
```powershell
Get-NetTCPConnection -LocalPort 3001 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

**Mac/Linux:**
```bash
lsof -ti:3001 | xargs kill -9
```

### «Cannot find module 'express'»
Не запущен `npm install`. Перейди в `backend/` и запусти:
```bash
npm install
```

### Кириллица показывается как «◆◆◆◆»
Если ты вставлял данные через `curl` в Windows-консоли — кодировка ломается. Используй Postman или браузер.

### Сайт открывается, но регистрация не работает
Проверь, запущен ли backend на порту 3001:
```bash
curl http://localhost:3001/api/stats
```
Должен вернуть JSON со статистикой.

### Открыть DevTools браузера:
- **F12** — общая панель
- **Console** (вкладка) — увидеть ошибки JS
- **Network** (вкладка) — увидеть запросы к API
- **Application → Local Storage** — увидеть токен

---

## 🔐 Конфиденциальность

**Файлы которые НЕ должны попадать в Git:**
- `backend/.env` — секретный JWT_SECRET
- `backend/yordam.db` — база с паролями и данными
- `backend/node_modules/` — зависимости
- `node_modules/` (frontend) — то же

Уже добавлены в `.gitignore`.

---

## 📞 Контакт автора

- **Носирҷон** — основатель Yordam.tj
- Email: [контакт]
- Telegram: [контакт]

Если вопрос по коду — открывай issue или пиши лично.

---

## 📚 Дополнительно

- [README.md](./README.md) — обзор проекта
- [ARCHITECTURE.md](./ARCHITECTURE.md) — как всё устроено
- [API.md](./API.md) — все endpoint
