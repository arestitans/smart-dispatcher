import express from 'express';
import { generateOrders, PRODUCT_TYPES, ORDER_STATUS } from '../data/mockData.js';
import { sendOrderNotification } from '../bot/telegram.js';

const router = express.Router();

// In-memory orders (replace with Google Sheets later)
let orders = generateOrders(50);

// Get all orders
router.get('/', (req, res) => {
    const { status, product, priority, search } = req.query;

    let filtered = [...orders];

    if (status) {
        filtered = filtered.filter(o => o.status === status);
    }
    if (product) {
        filtered = filtered.filter(o => o.product === product);
    }
    if (priority) {
        filtered = filtered.filter(o => o.priority === priority);
    }
    if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(o =>
            o.id.toLowerCase().includes(s) ||
            o.customer.toLowerCase().includes(s) ||
            o.address.toLowerCase().includes(s)
        );
    }

    res.json({
        orders: filtered,
        total: filtered.length,
        productTypes: PRODUCT_TYPES,
        statuses: Object.values(ORDER_STATUS)
    });
});

// Get order by ID
router.get('/:id', (req, res) => {
    const order = orders.find(o => o.id === req.params.id);

    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
});

// Create new order
router.post('/', (req, res) => {
    const newOrder = {
        id: `ORD-${4400 + orders.length}`,
        ...req.body,
        status: 'OPEN',
        createdAt: new Date().toISOString()
    };

    orders.unshift(newOrder);
    res.status(201).json(newOrder);
});

// Assign technician to order
router.post('/:id/assign', async (req, res) => {
    const { technicianId, technicianName, techChatId } = req.body;
    const order = orders.find(o => o.id === req.params.id);

    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }

    order.assignee = { id: technicianId, name: technicianName };
    order.status = 'SURVEY';

    // Send Telegram notification
    if (techChatId) {
        await sendOrderNotification(techChatId, order);
    }

    res.json(order);
});

// Update order status
router.patch('/:id/status', (req, res) => {
    const { status } = req.body;
    const order = orders.find(o => o.id === req.params.id);

    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    res.json(order);
});

// Get order statistics
router.get('/stats/summary', (req, res) => {
    const stats = {
        total: orders.length,
        open: orders.filter(o => o.status === 'OPEN').length,
        inProgress: orders.filter(o => ['SURVEY', 'IKR', 'ACTIVATION'].includes(o.status)).length,
        completed: orders.filter(o => o.status === 'PS_DONE').length,
        issues: orders.filter(o => o.status === 'TECHNICAL_ISSUE').length,
        byProduct: PRODUCT_TYPES.map(p => ({
            product: p,
            count: orders.filter(o => o.product === p).length
        })),
        byPriority: {
            high: orders.filter(o => o.priority === 'HIGH').length,
            normal: orders.filter(o => o.priority === 'NORMAL').length,
            low: orders.filter(o => o.priority === 'LOW').length
        }
    };

    res.json(stats);
});

export default router;
