require('dotenv').config();
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL, { dialect: 'postgres', dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }, logging: false });

async function run() {
  try {
    const [rows] = await sequelize.query('SELECT email, numero_etudiant, created_at FROM etudiants;');
    console.log(rows);
  } catch (e) {
    console.error(e.message);
  } finally {
    process.exit();
  }
}
run();
