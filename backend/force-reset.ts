import sequelize from './src/utils/db';
import Etudiant from './src/models/Etudiant';
import { hashPassword } from './src/utils/auth';

const resetPw = async () => {
  try {
    const user = await Etudiant.findOne({ where: { email: 'ahmedbangoura852@gmail.com' } });
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }
    
    const hashedPassword = await hashPassword('admin123');
    user.password = hashedPassword;
    await user.save();
    console.log('Password reset successfully to admin123');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

resetPw();
