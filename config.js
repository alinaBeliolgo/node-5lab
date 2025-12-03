const path = require('path');

module.exports = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'devsecret',
  DB_PATH: process.env.DB_PATH || path.join(__dirname, '..', 'data.db'),
};
