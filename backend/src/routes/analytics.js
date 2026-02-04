import express from 'express';
import { getDashboardStats, generateOrders, technicians, PRODUCT_TYPES } from '../data/mockData.js';

const router = express.Router();

// Dashboard stats
router.get('/dashboard', (req, res) => {
    const stats = getDashboardStats();
    res.json(stats);
});

// Product distribution
router.get('/products', (req, res) => {
    const orders = generateOrders(100);

    const distribution = PRODUCT_TYPES.map(product => ({
        product,
        count: orders.filter(o => o.product === product).length,
        percentage: ((orders.filter(o => o.product === product).length / orders.length) * 100).toFixed(1)
    }));

    res.json({ distribution });
});

// Daily completion trends (mock data)
router.get('/trends', (req, res) => {
    const days = 7;
    const trends = [];

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        trends.push({
            date: date.toISOString().split('T')[0],
            completed: Math.floor(20 + Math.random() * 30),
            target: 40
        });
    }

    res.json({ trends });
});

// Revenue by product
router.get('/revenue', (req, res) => {
    const revenue = [
        { product: 'Indihome', value: 425.5, color: '#22c55e' },
        { product: 'Datin', value: 280.2, color: '#eab308' },
        { product: 'Indibiz', value: 155.8, color: '#3b82f6' }
    ];

    res.json({ revenue });
});

// Regional performance
router.get('/regional', (req, res) => {
    const regions = [
        { region: 'Jakarta Selatan', completedOrders: 84, avgResponse: 32, slaStatus: 'HEALTHY', efficiency: 98 },
        { region: 'Jakarta Pusat', completedOrders: 62, avgResponse: 45, slaStatus: 'MODERATE', efficiency: 86 },
        { region: 'Jakarta Barat', completedOrders: 102, avgResponse: 28, slaStatus: 'HEALTHY', efficiency: 94 }
    ];

    res.json({ regions });
});

// Technician workload grid
router.get('/workload', (req, res) => {
    const grid = technicians.map(t => ({
        id: t.id,
        name: t.name,
        workload: t.workload,
        maxWorkload: t.maxWorkload,
        status: t.workload === 0 ? 'empty' : t.workload >= t.maxWorkload ? 'full' : 'partial'
    }));

    res.json({ grid, fleetHealthScore: 8.4 });
});

export default router;
