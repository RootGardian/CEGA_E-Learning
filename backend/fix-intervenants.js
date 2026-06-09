const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  logging: console.log
});

async function fix() {
  try {
    console.log('Suppression de la table intervenants...');
    await sequelize.query('DROP TABLE IF EXISTS intervenants CASCADE;');
    console.log('✅ Table supprimée avec succès.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
}

fix();
