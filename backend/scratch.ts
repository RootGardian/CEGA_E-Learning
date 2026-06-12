import sequelize from './src/utils/db';
import Course from './src/models/Course';
import CourseAccess from './src/models/CourseAccess';

async function run() {
  try {
    const { Op } = require('sequelize');
    const course = await Course.findOne({ where: { title: { [Op.iLike]: '%INTELLIGENCE ARTIFICIELLE%' } } });
    if (course) {
      course.department = 'all';
      await course.save();
      const access = await CourseAccess.findOne({ where: { courseId: course.id, department: 'all', etudiantId: null } });
      if (!access) {
        await CourseAccess.create({
          courseId: course.id,
          department: 'all',
          isUnlocked: true,
          etudiantId: null
        });
      }
      console.log('Course updated:', course.title);
    } else {
      console.log('Course not found');
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
