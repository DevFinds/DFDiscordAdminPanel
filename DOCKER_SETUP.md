# 🐳 Docker Setup Guide for DFDiscordAdminPanel

## 📋 Быстрый старт

### 1. **Клонирование репозитория**
```bash
git clone https://github.com/DevFinds/DFDiscordAdminPanel.git
cd DFDiscordAdminPanel
```

### 2. **Настройка переменных окружения**
```bash
# Копируем шаблон конфигурации
cp .env.example .env

# Редактируем файл .env
nano .env  # или любой другой редактор
```

**Обязательно заполните:**
- `DISCORD_CLIENT_ID` - ID вашего Discord приложения
- `DISCORD_CLIENT_SECRET` - Секретный ключ Discord приложения  
- `DISCORD_BOT_TOKEN` - Токен Discord бота
- `JWT_SECRET` - Случайная строка (минимум 32 символа)
- `SESSION_SECRET` - Случайная строка (минимум 32 символа)

### 3. **Запуск через Docker Compose**
```bash
# Сборка и запуск всех сервисов
docker-compose up -d --build

# Проверка статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f
```

### 4. **Доступ к приложению**
- 🌐 **Frontend**: http://localhost:3000
- 🔧 **Backend API**: http://localhost:5000
- 📊 **Health Check**: http://localhost:5000/health
- 🗄️ **MongoDB**: localhost:27017

---

## ⚙️ Конфигурация Discord приложения

### Создание Discord приложения:
1. Перейдите в [Discord Developer Portal](https://discord.com/developers/applications)
2. Нажмите "New Application"
3. Введите название приложения
4. В разделе "OAuth2" → "Redirects" добавьте:
   ```
   http://localhost:5000/auth/discord/callback
   ```
5. В разделе "Bot" создайте бота и скопируйте токен
6. Скопируйте Client ID и Client Secret

### Права бота (Bot Permissions):
- ✅ **Administrator** (8) - для полного функционала
- Или выберите конкретные права:
  - Manage Guild
  - Manage Channels
  - Manage Roles
  - Send Messages
  - Manage Messages
  - Add Reactions

---

## 🛠️ Управление контейнерами

### Основные команды:
```bash
# Запуск сервисов
docker-compose up -d

# Остановка сервисов
docker-compose down

# Перезапуск конкретного сервиса
docker-compose restart backend

# Просмотр логов конкретного сервиса
docker-compose logs -f bot

# Обновление и пересборка
docker-compose down
docker-compose up -d --build

# Полная очистка (ВНИМАНИЕ: удалит все данные!)
docker-compose down -v --rmi all
```

### Статус сервисов:
```bash
# Проверка работающих контейнеров
docker ps

# Статус через docker-compose
docker-compose ps

# Использование ресурсов
docker stats
```

---

## 📦 Структура контейнеров

| Сервис | Порт | Описание | Health Check |
|--------|------|----------|-------------|
| **frontend** | 3000 | React приложение | ✅ |
| **backend** | 5000 | API сервер | ✅ /health |
| **bot** | - | Discord бот | ✅ |
| **mongo** | 27017 | База данных | ✅ ping |

### Volumes (Постоянное хранение):
- `mongo_data` - Данные MongoDB
- Исходный код монтируется для hot reload в dev режиме

### Networks:
- `discord-network` - Внутренняя сеть для связи между контейнерами

---

## 🔍 Диагностика проблем

### Проверка логов:
```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f backend
docker-compose logs -f bot
docker-compose logs -f mongo
```

### Подключение к контейнеру:
```bash
# Backend контейнер
docker-compose exec backend sh

# MongoDB
docker-compose exec mongo mongo
```

### Проверка переменных окружения:
```bash
docker-compose exec backend env
```

### Частые проблемы:

#### 🔴 Backend не запускается
```bash
# Проверить логи
docker-compose logs backend

# Проверить переменные окружения
cat .env

# Пересобрать контейнер
docker-compose up -d --build backend
```

#### 🔴 Бот не подключается
```bash
# Проверить токен бота в .env
# Проверить логи
docker-compose logs bot

# Убедиться что backend запущен
curl http://localhost:5000/health
```

#### 🔴 MongoDB недоступен
```bash
# Проверить статус
docker-compose ps mongo

# Проверить логи
docker-compose logs mongo

# Перезапустить
docker-compose restart mongo
```

#### 🔴 Frontend не загружается
```bash
# Проверить что backend доступен
curl http://localhost:5000/health

# Очистить и пересобрать
docker-compose down
docker-compose up -d --build frontend
```

---

## 🚀 Production развертывание

Для production используйте:
```bash
# Используйте production compose файл
docker-compose -f deployment/docker/docker-compose.prod.yml up -d
```

### Рекомендации для production:
1. **Смените секретные ключи** в `.env`
2. **Настройте SSL/HTTPS** (nginx + certbot)
3. **Настройте backup** для MongoDB
4. **Используйте внешний MongoDB** для высокой доступности
5. **Настройте мониторинг** (Prometheus + Grafana)
6. **Ограничьте доступ** к портам

---

## 📚 Дополнительные команды

### Backup и восстановление:
```bash
# Создание backup MongoDB
docker-compose exec mongo mongodump --db discord-dashboard --out /backup

# Восстановление из backup
docker-compose exec mongo mongorestore --db discord-dashboard /backup/discord-dashboard
```

### Обновление проекта:
```bash
# Получить последние изменения
git pull origin main

# Пересобрать и перезапустить
docker-compose down
docker-compose up -d --build
```

### Очистка системы:
```bash
# Удалить неиспользуемые контейнеры
docker system prune

# Удалить неиспользуемые образы
docker image prune

# Полная очистка (ОСТОРОЖНО!)
docker system prune -a --volumes
```

---

## ✅ Проверка корректной работы

1. **Откройте** http://localhost:3000
2. **Авторизуйтесь** через Discord
3. **Проверьте отображение** серверов
4. **Добавьте бота** на тестовый сервер
5. **Проверьте управление** настройками

**🎉 Готово! Ваша Discord админ-панель запущена в Docker!**