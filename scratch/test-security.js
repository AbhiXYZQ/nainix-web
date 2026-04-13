const axios = require('axios');

async function testRateLimit() {
  const url = 'http://localhost:3000/api/auth/login';
  console.log('Testing rate limit on:', url);

  for (let i = 1; i <= 10; i++) {
    try {
      const start = Date.now();
      const res = await axios.post(url, { email: 'test@example.com', password: 'wrong' });
      console.log(`Request ${i}: Status ${res.status} (${Date.now() - start}ms)`);
    } catch (error) {
      console.log(`Request ${i}: Status ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      if (error.response?.status === 429) {
        console.log('SUCCESS: Rate limit triggered correctly.');
        break;
      }
    }
  }
}

testRateLimit();
