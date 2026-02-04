import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { users } from '../data/mockData.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = users.find(u => u.username === username);

        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'smart-dispatcher-secret',
            { expiresIn: '24h' }
        );

        res.json({
            token,
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

// Verify token
router.get('/verify', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smart-dispatcher-secret');
        const user = users.find(u => u.id === decoded.id);

        res.json({
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Middleware to check auth
export const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smart-dispatcher-secret');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Role-based access middleware
export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        next();
    };
};

export default router;
