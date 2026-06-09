import sequelize from './src/utils/db';
sequelize.query('SELECT * FROM "etudiants"').then(([results]) => {
  console.log('Students count:', results.length);
  if(results.length > 0) {
    console.log(results.map((r: any) => r.email));
  }
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
