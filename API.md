# API документация — Yordam.tj

**Базовый URL:** `http://localhost:3001` (разработка)

---

## 🔓 Публичные endpoint (без авторизации)

### `GET /`
Проверка работы сервера.

**Ответ:**
```json
{
  "message": "Yordam.tj API кор мекунад! 🎉",
  "version": "1.0.0",
  "endpoints": ["/api/register", "/api/login", "/api/tasks"]
}
```

---

### `POST /api/register`
Регистрация нового пользователя.

**Запрос:**
```json
{
  "name": "Носирҷон",
  "phone": "+992901112233",
  "email": "user@example.com",
  "password": "myPass123"
}
```

**Обязательные поля:** `name`, `phone`, `password`

**Ответ (201 Created):**
```json
{
  "success": true,
  "message": "Сабти ном муваффақ",
  "token": "eyJhbGciOiJIUzI1NiI...",
  "user": {
    "id": 1,
    "name": "Носирҷон",
    "phone": "+992901112233",
    "email": "user@example.com"
  }
}
```

**Ошибки:**
- `400` — не все обязательные поля заполнены
- `409` — телефон уже зарегистрирован
- `500` — внутренняя ошибка сервера

---

### `POST /api/login`
Вход в аккаунт.

**Запрос:**
```json
{
  "phone": "+992901112233",
  "password": "myPass123"
}
```

**Ответ (200 OK):**
```json
{
  "success": true,
  "message": "Воридшавӣ муваффақ",
  "token": "eyJhbGciOiJIUzI1NiI...",
  "user": {
    "id": 1,
    "name": "Носирҷон",
    "phone": "+992901112233",
    "email": null
  }
}
```

**Ошибки:**
- `400` — телефон или пароль не указаны
- `401` — неверный телефон или пароль

---

### `GET /api/stats`
Общая статистика платформы.

**Ответ:**
```json
{
  "users": 1,
  "tasks": 3,
  "completed": 0,
  "specialists": 0
}
```

---

### `GET /api/tasks`
Все открытые заявки (для главной страницы).

**Ответ:**
```json
{
  "tasks": [
    {
      "id": 5,
      "user_id": 2,
      "title": "Таъмири ҳаммом",
      "description": "Ҳаммомро пурра таъмир кардан...",
      "category": "Таъмир",
      "budget": 3000,
      "address": "Душанбе",
      "status": "open",
      "specialist_id": null,
      "created_at": "2026-05-01 04:18:00",
      "user_name": "Носирҷон",
      "user_phone": "+992901112233"
    }
  ]
}
```

---

## 🔐 Защищённые endpoint (с авторизацией)

Все эти запросы должны иметь заголовок:
```
Authorization: Bearer <token>
```

Где `<token>` — это JWT, полученный при логине.

---

### `GET /api/me`
Информация о текущем пользователе.

**Ответ:**
```json
{
  "user": {
    "id": 2,
    "name": "Носирҷон",
    "phone": "+992901112233",
    "email": null,
    "role": "client",
    "created_at": "2026-05-01 04:18:00"
  }
}
```

**Ошибки:**
- `401` — токен отсутствует или невалидный

---

### `POST /api/tasks`
Создать новую заявку.

**Запрос:**
```json
{
  "title": "Таъмири кран",
  "description": "Кран дар ошхона рост кор намекунад",
  "category": "Сантехникӣ",
  "budget": 200,
  "address": "Душанбе, ноҳияи Сино"
}
```

**Обязательные поля:** `title`, `category`

**Ответ (201 Created):**
```json
{
  "success": true,
  "message": "Заявка қабул шуд",
  "taskId": 6
}
```

---

### `GET /api/my-tasks`
Список заявок текущего пользователя + статистика.

**Ответ:**
```json
{
  "tasks": [
    {
      "id": 5,
      "user_id": 2,
      "title": "Таъмири ҳаммом",
      "category": "Таъмир",
      "budget": 3000,
      "status": "open",
      "created_at": "2026-05-01 04:18:00"
    }
  ],
  "stats": {
    "total": 3,
    "open": 2,
    "in_progress": 0,
    "closed": 1
  }
}
```

---

### `PATCH /api/tasks/:id/status`
Изменить статус заявки (только своей).

**URL пример:** `PATCH /api/tasks/5/status`

**Запрос:**
```json
{
  "status": "closed"
}
```

**Допустимые статусы:** `open`, `in_progress`, `closed`

**Ответ:**
```json
{
  "success": true,
  "status": "closed"
}
```

**Ошибки:**
- `400` — невалидный статус
- `403` — попытка изменить чужую заявку
- `404` — заявка не найдена

---

### `DELETE /api/tasks/:id`
Удалить заявку (только свою).

**URL пример:** `DELETE /api/tasks/5`

**Ответ:**
```json
{
  "success": true,
  "message": "Заявка нест карда шуд"
}
```

**Ошибки:**
- `403` — попытка удалить чужую заявку
- `404` — заявка не найдена

---

## 📦 Примеры использования (curl)

### Регистрация
```bash
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Носирҷон","phone":"+992901112233","password":"myPass123"}'
```

### Логин
```bash
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"+992901112233","password":"myPass123"}'
```

### Создать заявку (с токеном)
```bash
TOKEN="eyJhbGc..."

curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Таъмир","category":"IT","budget":1000}'
```

### Удалить заявку
```bash
curl -X DELETE http://localhost:3001/api/tasks/5 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔍 Коды ответов (HTTP Status Codes)

| Код | Значение | Когда |
|---|---|---|
| `200 OK` | Успех | GET-запросы |
| `201 Created` | Создано | POST `/api/register`, POST `/api/tasks` |
| `400 Bad Request` | Невалидный запрос | Не все поля заполнены |
| `401 Unauthorized` | Не авторизован | Токен отсутствует/невалидный, неверный пароль |
| `403 Forbidden` | Нет прав | Попытка изменить чужие данные |
| `404 Not Found` | Не найдено | Заявка не существует |
| `409 Conflict` | Конфликт | Телефон уже зарегистрирован |
| `500 Server Error` | Ошибка сервера | Внутренняя проблема |

---

## 🛡️ Безопасность API

1. **Никогда не возвращаем `password_hash`** — даже в `GET /api/me`
2. **Токен срок жизни 30 дней** — для удобства, можно сократить
3. **CORS открыт** — для разработки. В продакшене — только yordam.tj
4. **Rate limiting** — пока не реализован, добавить перед деплоем
