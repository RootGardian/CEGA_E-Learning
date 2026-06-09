require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  logging: false,
});

async function run() {
  try {
    await sequelize.query('ALTER TABLE etudiants RENAME COLUMN "createdAt" TO created_at;');
    await sequelize.query('ALTER TABLE etudiants RENAME COLUMN "updatedAt" TO updated_at;');
    console.log('Columns renamed!');
  } catch (e) {
    console.error(e.message);
  } finally {
    process.exit();
  }
}

run();
