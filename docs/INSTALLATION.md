# Установка Discord Admin Panel

1. Клонируйте репозиторий
2. Установите зависимости в `backend` и `frontend`
3. Скопируйте `.env.example` → `.env`, настройте токены Discord, MongoDB URI и фронт URL.
4. Запустите MongoDB и backend/server.js, backend/bot.js, frontend (npm start).
5. Для Docker выполните:

cd deployment/docker
docker-compose -f docker-compose.prod.yml up -d

6. Для Linux:

cd deployment/linux
sudo ./install.sh
sudo ./deploy.sh


7. Для Windows:

cd deployment/windows
install.bat
start-dev.bat