require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false }
  },
  logging: false,
});
async function run() {
  try {
    const [triggers] = await sequelize.query("SELECT event_object_table, trigger_name, action_statement FROM information_schema.triggers WHERE event_object_table = 'etudiants';");
    console.log('Triggers:', triggers);

    const [columns] = await sequelize.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'etudiants';");
    console.log('Columns:', columns);

    const [functions] = await sequelize.query("SELECT proname, prosrc FROM pg_proc WHERE proname IN ('update_nombre_inscrits_cohorte', 'update_updated_at_column');");
    console.log('Functions:', functions);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

run();
