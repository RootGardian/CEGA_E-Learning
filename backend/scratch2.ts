import sequelize from './src/utils/db';
async function run() {
  try {
    await sequelize.query("ALTER TABLE course_evaluations ADD COLUMN status VARCHAR(255) NOT NULL DEFAULT 'published'");
    console.log("Migration successful");
  } catch (e: any) {
    console.log("Error or already exists:", e.message);
  }
  process.exit(0);
}
run();
