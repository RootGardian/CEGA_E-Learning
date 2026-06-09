require('dotenv').config({ path: 'backend/.env' });
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL, { logging: false });
sequelize.query('SELECT id, email, password FROM "Etudiants"').then(([results]) => {
  console.log(results);
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
