const axios = require('axios');

async function createTestUser() {
  try {
    const response = await axios.post('http://localhost:5002/api/auth/register', {
      email: 'etudiant.test@cega.edu',
      password: 'Password123!'
    });
    console.log('Utilisateur créé avec succès !');
    console.log(response.data);
  } catch (error) {
    if (error.response) {
      console.error('Erreur API:', error.response.data);
    } else {
      console.error('Erreur de requête:', error.message);
    }
  }
}

createTestUser();
