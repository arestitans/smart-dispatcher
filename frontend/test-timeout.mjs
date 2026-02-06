import axios from 'axios';

// Test with short timeout like PUBLIC_MODE
const apiShort = axios.create({
    baseURL: 'http://localhost:3001/api',
    headers: { 'Content-Type': 'application/json' },
    timeout: 1000, // SHORT TIMEOUT like PUBLIC_MODE
});

// Test with normal timeout
const apiNormal = axios.create({
    baseURL: 'http://localhost:3001/api',
    headers: { 'Content-Type': 'application/json' },
    timeout: 5000, // NORMAL TIMEOUT
});

async function testWithTimeout() {
    console.log('Testing login with SHORT timeout (1000ms - like PUBLIC_MODE)...');
    try {
        await apiShort.post('/auth/login', { username: 'admin', password: 'admin123' });
        console.log('✓ Short timeout succeeded');
    } catch (error) {
        console.error('✗ Short timeout failed:', error.code || error.message);
    }

    console.log('\nTesting login with NORMAL timeout (5000ms)...');
    try {
        const response = await apiNormal.post('/auth/login', { username: 'admin', password: 'admin123' });
        console.log('✓ Normal timeout succeeded:', !!response.data.token);
    } catch (error) {
        console.error('✗ Normal timeout failed:', error.code || error.message);
    }
}

testWithTimeout();
