import sequelize from './src/utils/db';
import User from './src/models/User';
import { comparePassword } from './src/utils/auth';

async function testLogin() {
  try {
    await sequelize.authenticate();
    const email = 'admin@cega.edu';
    const password = 'password123';
    
    const user = await User.findOne({ where: { email } });
    console.log('User found:', user ? user.toJSON() : null);

    if (user) {
      const storedPassword = user.password_hash;
      const isMatch = await comparePassword(password, storedPassword);
      console.log('Password match:', isMatch);
    }
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

testLogin();
