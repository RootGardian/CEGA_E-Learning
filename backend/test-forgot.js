const axios = require('axios');

async function run() {
  try {
    const res = await axios.post('http://127.0.0.1:5000/api/auth/forgot-password', {
      email: 'ahmedbangoura852@gmail.com',
    });
    console.log('Response:', res.data);
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
}

run();
