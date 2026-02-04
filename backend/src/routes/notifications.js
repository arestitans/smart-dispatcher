import express from 'express';
import {
    sendOrderNotification,
    sendBulkMessage,
    sendPriorityWarning,
    sendStaleOrderAlert,
    sendOrderSummary,
    sendToAdmin,
    sendToSupervisor
} from '../bot/telegram.js';

const router = express.Router();

// Send order notification to technician
router.post('/order', async (req, res) => {
    try {
        const { techChatId, order } = req.body;

        if (!techChatId || !order) {
            return res.status(400).json({ error: 'Missing techChatId or order data' });
        }

        const result = await sendOrderNotification(techChatId, order);
        res.json({ success: result, message: result ? 'Notification sent' : 'Failed to send' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send bulk message to multiple technicians
router.post('/bulk', async (req, res) => {
    try {
        const { chatIds, message } = req.body;

        if (!chatIds?.length || !message) {
            return res.status(400).json({ error: 'Missing chatIds or message' });
        }

        const result = await sendBulkMessage(chatIds, message);
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send priority warning to admins/supervisors
router.post('/priority-warning', async (req, res) => {
    try {
        const { order } = req.body;

        if (!order) {
            return res.status(400).json({ error: 'Missing order data' });
        }

        const result = await sendPriorityWarning(order);
        res.json({ success: result, message: 'Priority warning sent to admins' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send stale order alert to admins/supervisors
router.post('/stale-alert', async (req, res) => {
    try {
        const { orders } = req.body;

        if (!orders?.length) {
            return res.status(400).json({ error: 'No stale orders provided' });
        }

        const result = await sendStaleOrderAlert(orders);
        res.json({ success: result, message: `Stale alert sent for ${orders.length} orders` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send order summary to admins/supervisors
router.post('/summary', async (req, res) => {
    try {
        const { summary } = req.body;

        if (!summary) {
            return res.status(400).json({ error: 'Missing summary data' });
        }

        const result = await sendOrderSummary(summary);
        res.json({ success: result, message: 'Summary sent to admins' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send message to admin only
router.post('/admin', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Missing message' });
        }

        const result = await sendToAdmin(message);
        res.json({ success: result, message: 'Message sent to admin' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send message to supervisor only
router.post('/supervisor', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Missing message' });
        }

        const result = await sendToSupervisor(message);
        res.json({ success: result, message: 'Message sent to supervisor' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
