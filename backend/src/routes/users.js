import express from 'express';
import { users } from '../data/mockData.js';

const router = express.Router();

// Middleware to check authentication
const requireAuth = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    // In a real app, verify the token here
    next();
};

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
    // In a real app, extract user from verified token
    // For now, check if authorization header exists (implied admin for demo)
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    // In production, decode token and check role
    // For now, we'll allow all authenticated requests
    next();
};

// Get all users (admin only)
router.get('/', requireAuth, (req, res) => {
    try {
        // Don't expose passwords in the response
        const safeUsers = users.map(u => ({
            id: u.id,
            username: u.username,
            name: u.name,
            role: u.role
        }));
        res.json({ users: safeUsers });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single user by ID
router.get('/:id', requireAuth, (req, res) => {
    try {
        const user = users.find(u => u.id === parseInt(req.params.id));
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new user (admin only)
router.post('/', requireAdmin, (req, res) => {
    try {
        const { username, password, name, role } = req.body;

        // Validation
        if (!username || !password || !name || !role) {
            return res.status(400).json({ error: 'Missing required fields: username, password, name, role' });
        }

        // Check if username already exists
        if (users.find(u => u.username === username)) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Validate role
        const validRoles = ['admin', 'supervisor', 'helpdesk', 'guest'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
        }

        // Create new user
        const newUser = {
            id: Math.max(...users.map(u => u.id), 0) + 1,
            username,
            password, // In production, hash this!
            name,
            role
        };

        users.push(newUser);

        res.status(201).json({
            id: newUser.id,
            username: newUser.username,
            name: newUser.name,
            role: newUser.role,
            message: 'User created successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Change password (users can change their own password)
router.patch('/:id/password', requireAuth, (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Missing currentPassword or newPassword' });
        }

        const user = users.find(u => u.id === parseInt(req.params.id));
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        if (user.password !== currentPassword) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword;

        res.json({
            message: 'Password changed successfully',
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reset user password (admin only)
router.patch('/:id/password-reset', requireAdmin, (req, res) => {
    try {
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({ error: 'Missing newPassword' });
        }

        const user = users.find(u => u.id === parseInt(req.params.id));
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update password without verifying old one
        user.password = newPassword;

        res.json({
            message: 'User password reset successfully',
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update user details (admin only)
router.patch('/:id', requireAdmin, (req, res) => {
    try {
        const { name, role } = req.body;

        const user = users.find(u => u.id === parseInt(req.params.id));
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update allowed fields
        if (name) user.name = name;
        if (role) {
            const validRoles = ['admin', 'supervisor', 'helpdesk', 'guest'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
            }
            user.role = role;
        }

        res.json({
            message: 'User updated successfully',
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete user (admin only)
router.delete('/:id', requireAdmin, (req, res) => {
    try {
        const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Prevent deleting the last admin
        const user = users[userIndex];
        if (user.role === 'admin') {
            const adminCount = users.filter(u => u.role === 'admin').length;
            if (adminCount === 1) {
                return res.status(400).json({ error: 'Cannot delete the last admin user' });
            }
        }

        const deletedUser = users.splice(userIndex, 1)[0];

        res.json({
            message: 'User deleted successfully',
            user: {
                id: deletedUser.id,
                username: deletedUser.username,
                name: deletedUser.name,
                role: deletedUser.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
