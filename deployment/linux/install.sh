#!/bin/bash

set -e

echo "===== Discord Admin Panel: Linux Install ====="

apt update && apt upgrade -y
apt install -y nodejs npm git build-essential mongodb

echo "Mongo и Node.js установлены"
echo "Клонируйте backend и frontend, выполните npm install в каждой."
echo "Скопируйте .env.example → .env и настройте переменные"
echo "Запустите: npm start (backend), npm run bot (backend), npm start (frontend)"
