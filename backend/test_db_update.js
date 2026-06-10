const { Sequelize, Op } = require('sequelize');

async function test() {
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
    const courseId = 1;
    const department = 'geosciences';
    const isUnlocked = true;
    const teacherId = 1;

    console.log('Testing update...');
    const result = await sequelize.query(`
      UPDATE course_access 
      SET "isUnlocked" = ${isUnlocked}, "unlockedBy" = ${teacherId}
      WHERE "courseId" = ${courseId} AND "etudiantId" IS NOT NULL
    `);
    console.log('Update result:', result);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}
test();
