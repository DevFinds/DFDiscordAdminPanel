FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production --prefer-offline --no-audit --progress=false
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
