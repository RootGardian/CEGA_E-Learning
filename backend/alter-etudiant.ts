import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const dbUrl = process.env.DATABASE_URL;
const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  logging: true,
});

async function addColumn() {
  try {
    await sequelize.query(`ALTER TABLE etudiants ADD COLUMN "formationType" VARCHAR(255) NOT NULL DEFAULT 'e-learning';`);
    console.log('Column added successfully');
  } catch (err) {
    console.error('Error adding column:', err);
  } finally {
    process.exit(0);
  }
}
addColumn();
