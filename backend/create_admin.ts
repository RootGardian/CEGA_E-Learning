import sequelize from './src/utils/db';
import User from './src/models/User';
import { hashPassword } from './src/utils/auth';

async function createAdmin() {
  try {
    await sequelize.authenticate();
    console.log('Connecté à la base de données.');

    const email = 'admin@cega.edu';
    const password = 'password123';
    
    // Check if exists
    let existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log(`L'utilisateur ${email} existe déjà.`);
      process.exit(0);
    }

    const password_hash = await hashPassword(password);

    await User.create({
      email,
      password_hash,
      nom: 'Admin',
      prenom: 'Super',
      role: 'directeur_formation',
      status: 'actif',
      is_active: true,
    });

    console.log(`✅ Administrateur créé avec succès !`);
    console.log(`Email : ${email}`);
    console.log(`Mot de passe : ${password}`);
    
  } catch (err) {
    console.error('Erreur lors de la création de l\'admin:', err);
  } finally {
    process.exit(0);
  }
}

createAdmin();
