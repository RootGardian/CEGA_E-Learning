const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

async function run() {
  try {
    await sequelize.query('DROP TABLE IF EXISTS comments CASCADE;');
    console.log('Comments table dropped');
  } catch (e) {
    console.error('Migration error:', e);
  } finally {
    process.exit(0);
  }
}
run();
