import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3001/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 5000,
});

async function testLogin() {
    try {
        console.log('Testing login with admin/admin123...');
        const response = await api.post('/auth/login', {
            username: 'admin',
            password: 'admin123'
        });
        console.log('✓ Login successful!');
        console.log('Response:', response.data);
        console.log('Token:', response.data.token);
        console.log('User:', response.data.user);
    } catch (error) {
        console.error('✗ Login failed!');
        console.error('Error message:', error.message);
        console.error('Status:', error.response?.status);
        console.error('Response data:', error.response?.data);
    }
}

testLogin();
