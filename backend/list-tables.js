const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false }
  },
  logging: false,
});

async function listTables() {
  try {
    const [results] = await sequelize.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'");
    console.log('Tables in database:');
    results.forEach(r => console.log(r));
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

listTables();
