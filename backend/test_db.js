const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('cega_e_learning', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
});

async function run() {
  try {
    const [results] = await sequelize.query('SELECT * FROM course_access;');
    console.log(results);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
