const bcrypt = require('bcrypt');
require('dotenv').config({ path: '.env' });
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL, { logging: false });
sequelize.query("SELECT password FROM etudiants WHERE email='ahmedbangoura852@gmail.com'").then(async ([results]) => {
  const hash = results[0].password;
  console.log('Hash in DB:', hash);
  
  const pepper = process.env.PASSWORD_PEPPER;
  const password = 'admin123';
  const passwordWithPepper = password + pepper;
  
  const matchWithPepper = await bcrypt.compare(passwordWithPepper, hash);
  const matchWithoutPepper = await bcrypt.compare(password, hash);
  
  console.log('Match with pepper:', matchWithPepper);
  console.log('Match without pepper:', matchWithoutPepper);
  process.exit(0);
});
