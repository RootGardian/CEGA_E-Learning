import sequelize from './src/utils/db';
import Etudiant from './src/models/Etudiant';
import { comparePassword } from './src/utils/auth';

const test = async () => {
  try {
    const user = await Etudiant.findOne({ where: { email: 'ahmedbangoura852@gmail.com' } });
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }
    
    const isMatch = await comparePassword('admin123', user.password);
    console.log('Match with comparePassword:', isMatch);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

test();
