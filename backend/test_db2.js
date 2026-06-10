const axios = require('axios');

async function test() {
  const { Sequelize } = require('sequelize');
  const sequelize = new Sequelize('postgresql://base_cega_elearning_user:3oTBn8XU6SmbkIoGYTyEN5fAN5eKY5vX@dpg-d8juo8pkh4rs73ej6cu0-a.oregon-postgres.render.com/base_cega_elearning', {
    logging: false,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });

  try {
    const [results] = await sequelize.query('SELECT * FROM course_access;');
    console.log("COURSE ACCESS ENTRIES:");
    console.table(results);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
test();
