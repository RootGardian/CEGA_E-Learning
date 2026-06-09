const { Sequelize } = require('sequelize');
require('dotenv').config();
const s = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});
s.query('SELECT * FROM "Courses"').then((res) => {
  console.log(res[0]);
  process.exit(0);
});
