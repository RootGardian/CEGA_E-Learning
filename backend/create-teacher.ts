import { Sequelize } from 'sequelize';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import Intervenant from './src/models/Intervenant';

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL as string, {
  dialect: 'postgres',
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  logging: false
});

async function createTeacher() {
  const email = process.argv[2];
  const password = process.argv[3];
  const firstName = process.argv[4] || 'Admin';
  const lastName = process.argv[5] || 'Enseignant';
  const department = process.argv[6] || 'geosciences';

  if (!email || !password) {
    console.error('Usage: npx ts-node create-teacher.ts <email> <password> [firstName] [lastName] [department]');
    process.exit(1);
  }

  try {
    await sequelize.authenticate();
    // Use pepper mechanism
    const pepper = process.env.PASSWORD_PEPPER || '';
    const saltRounds = 10;
    const passwordWithPepper = password + pepper;
    const hashedPassword = await bcrypt.hash(passwordWithPepper, saltRounds);

    await Intervenant.create({
      firstName,
      lastName,
      email,
      department,
      password: hashedPassword
    });

    console.log(`✅ Enseignant créé avec succès !`);
    console.log(`Email: ${email}`);
    console.log(`Mot de passe: ${password}`);
    console.log(`Département: ${department}`);
    
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
}

createTeacher();
