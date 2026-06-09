require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  logging: false,
});

async function run() {
  try {
    await sequelize.query(`
      CREATE OR REPLACE FUNCTION update_nombre_inscrits_cohorte()
      RETURNS trigger AS $$
      BEGIN
          IF TG_OP = 'INSERT' THEN
              IF NEW.cohorte_id IS NOT NULL THEN
                  UPDATE cohortes SET nombre_inscrits = nombre_inscrits + 1 WHERE id = NEW.cohorte_id;
              END IF;
          ELSIF TG_OP = 'DELETE' THEN
              IF OLD.cohorte_id IS NOT NULL THEN
                  UPDATE cohortes SET nombre_inscrits = nombre_inscrits - 1 WHERE id = OLD.cohorte_id;
              END IF;
          ELSIF TG_OP = 'UPDATE' THEN
              IF OLD.cohorte_id IS NOT NULL AND (NEW.cohorte_id IS NULL OR NEW.cohorte_id != OLD.cohorte_id) THEN
                  UPDATE cohortes SET nombre_inscrits = nombre_inscrits - 1 WHERE id = OLD.cohorte_id;
              END IF;
              IF NEW.cohorte_id IS NOT NULL AND (OLD.cohorte_id IS NULL OR NEW.cohorte_id != OLD.cohorte_id) THEN
                  UPDATE cohortes SET nombre_inscrits = nombre_inscrits + 1 WHERE id = NEW.cohorte_id;
              END IF;
          END IF;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('Trigger fixed!');
  } catch (e) {
    console.error(e.message);
  } finally {
    process.exit();
  }
}

run();
