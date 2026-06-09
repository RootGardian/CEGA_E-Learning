const axios = require('axios');

async function testRegister() {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      firstName: 'Test',
      lastName: 'User',
      department: 'geosciences',
      email: 'ahmed2@cega.edu',
      password: 'Password123!'
    });
    console.log('Register successful!', response.data);
  } catch (error) {
    console.error('Register failed!');
    if (error.response) {
      console.error(error.response.status, error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

testRegister();
