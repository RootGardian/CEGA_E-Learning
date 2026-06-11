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
    await sequelize.query('ALTER TABLE notifications ADD COLUMN IF NOT EXISTS "userId" CHAR(36) NULL;');
    await sequelize.query('ALTER TABLE notifications ALTER COLUMN "etudiantId" DROP NOT NULL;');
    console.log('Migration done');
  } catch (e) {
    console.error('Migration error:', e);
  } finally {
    process.exit(0);
  }
}
run();
