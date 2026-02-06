// Test login through the actual API wrapper
import { authAPI } from './src/services/api.js';

async function testAuthAPI() {
    try {
        console.log('Testing authAPI.login...');
        const response = await authAPI.login('admin', 'admin123');
        console.log('✓ authAPI.login successful!');
        console.log('Response structure:', Object.keys(response));
        console.log('Response.data:', response.data);
        
        // Test destructuring like Login.jsx does
        const { user, token } = response.data;
        console.log('✓ Destructuring works!');
        console.log('Token:', token ? `${token.substring(0, 20)}...` : 'missing');
        console.log('User:', user);
        
    } catch (error) {
        console.error('✗ authAPI.login failed!');
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testAuthAPI();
