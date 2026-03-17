
import axios from 'axios';

async function testSSO() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.s7jS-H8...'; // Mock token or real one if I can
  try {
    const res = await axios.post('http://localhost:3001/api/auth/sso-login', { token: 'invalid-token' });
    console.log(res.data);
  } catch (err) {
    console.log('Status:', err.response?.status);
    console.log('Data:', JSON.stringify(err.response?.data, null, 2));
  }
}
testSSO();
