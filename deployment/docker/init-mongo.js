// MongoDB инициализация для DFDiscordAdminPanel

print('Creating Discord Dashboard database and user...');

// Переключаемся на базу discord-dashboard
db = db.getSiblingDB('discord-dashboard');

// Создаем пользователя для приложения
db.createUser({
  user: 'discordapp',
  pwd: 'discordpassword',
  roles: [
    {
      role: 'readWrite',
      db: 'discord-dashboard'
    }
  ]
});

// Создаем коллекции с индексами
db.users.createIndex({ "discordId": 1 }, { unique: true });
db.users.createIndex({ "createdAt": 1 });

db.guilds.createIndex({ "guildId": 1 }, { unique: true });
db.guilds.createIndex({ "guildId": 1, "updatedAt": -1 });

print('Database initialization completed successfully!');
print('Created collections: users, guilds');
print('Created indexes for optimal performance');