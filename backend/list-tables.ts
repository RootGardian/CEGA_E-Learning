import sequelize from './src/utils/db';
sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'").then(([results]) => {
  console.log(results);
  process.exit(0);
}).catch(console.error);
