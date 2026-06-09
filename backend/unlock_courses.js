const { Sequelize } = require('sequelize');
require('dotenv').config();
const s = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});
s.query('UPDATE "Courses" SET "isLocked" = false').then(() => {
  console.log('All courses unlocked');
  process.exit(0);
});
