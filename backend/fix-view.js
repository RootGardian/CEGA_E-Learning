const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  logging: console.log
});

async function fix() {
  try {
    // Drop all dependent views
    console.log('1. Suppression des vues dépendantes...');
    await sequelize.query('DROP VIEW IF EXISTS vw_notifications_pending CASCADE;');
    
    // Check for any other views depending on the notifications table
    const [views] = await sequelize.query(`
      SELECT viewname FROM pg_views 
      WHERE schemaname = 'public' 
      AND definition LIKE '%notifications%';
    `);
    console.log('Vues trouvées:', views);
    
    for (const view of views) {
      console.log(`Suppression de la vue: ${view.viewname}`);
      await sequelize.query(`DROP VIEW IF EXISTS "${view.viewname}" CASCADE;`);
    }
    
    // Drop and recreate the notifications table
    console.log('2. Suppression de la table notifications...');
    await sequelize.query('DROP TABLE IF EXISTS notifications CASCADE;');
    
    console.log('✅ Nettoyage terminé. Redémarrez le backend.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
}

fix();
