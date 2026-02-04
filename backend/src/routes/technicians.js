import express from 'express';
import { technicians, generateOrders, pendingTechnicians, approveTechnician as approveFunc, rejectTechnician as rejectFunc } from '../data/mockData.js';
import { sendBulkMessage, sendBulkOrderNotifications, notifyTechnicianApproval, notifyTechnicianRejection } from '../bot/telegram.js';

const router = express.Router();

// Get all technicians
router.get('/', (req, res) => {
    const { area, status, rank } = req.query;

    let filtered = [...technicians];

    if (area) {
        filtered = filtered.filter(t => t.area === area);
    }
    if (status) {
        filtered = filtered.filter(t => t.status === status);
    }
    if (rank) {
        filtered = filtered.filter(t => t.rank === rank);
    }

    // Sort by rank
    const rankOrder = { TOP: 1, GOOD: 2, AVERAGE: 3, POOR: 4 };
    filtered.sort((a, b) => rankOrder[a.rank] - rankOrder[b.rank]);

    res.json({
        technicians: filtered,
        total: filtered.length,
        stats: {
            active: technicians.filter(t => t.status === 'ACTIVE').length,
            busy: technicians.filter(t => t.status === 'BUSY').length,
            available: technicians.filter(t => t.status === 'AVAILABLE').length
        }
    });
});

// Get technician ranking
router.get('/ranking', (req, res) => {
    const ranking = technicians
        .map(t => ({
            id: t.id,
            name: t.name,
            photo: t.photo,
            area: t.area,
            rank: t.rank,
            stats: t.stats
        }))
        .sort((a, b) => {
            // Sort by: guarantee claims (asc), completion (desc), SLA (desc)
            if (a.stats.guaranteeClaims !== b.stats.guaranteeClaims) {
                return a.stats.guaranteeClaims - b.stats.guaranteeClaims;
            }
            if (a.stats.completedOrders !== b.stats.completedOrders) {
                return b.stats.completedOrders - a.stats.completedOrders;
            }
            return b.stats.slaCompliance - a.stats.slaCompliance;
        });

    res.json({ ranking });
});

// Get technician by ID
router.get('/:id', (req, res) => {
    const tech = technicians.find(t => t.id === req.params.id);

    if (!tech) {
        return res.status(404).json({ error: 'Technician not found' });
    }

    res.json(tech);
});

// Get technician performance
router.get('/:id/performance', (req, res) => {
    const tech = technicians.find(t => t.id === req.params.id);

    if (!tech) {
        return res.status(404).json({ error: 'Technician not found' });
    }

    res.json({
        technician: { id: tech.id, name: tech.name },
        performance: {
            ...tech.stats,
            rank: tech.rank,
            rankColor: tech.rank === 'TOP' ? 'green' : tech.rank === 'GOOD' ? 'blue' : tech.rank === 'AVERAGE' ? 'yellow' : 'red'
        }
    });
});

// General review - all technicians summary
router.get('/review/general', (req, res) => {
    const summary = {
        totalTechnicians: technicians.length,
        avgCompletionRate: (technicians.reduce((sum, t) => sum + t.stats.completedOrders, 0) / technicians.length).toFixed(0),
        avgSlaCompliance: (technicians.reduce((sum, t) => sum + t.stats.slaCompliance, 0) / technicians.length).toFixed(1),
        avgHandlingTime: (technicians.reduce((sum, t) => sum + t.stats.avgHandlingTime, 0) / technicians.length).toFixed(0),
        totalRevenue: technicians.reduce((sum, t) => sum + t.stats.revenuePoints, 0),
        byRank: {
            top: technicians.filter(t => t.rank === 'TOP').length,
            good: technicians.filter(t => t.rank === 'GOOD').length,
            average: technicians.filter(t => t.rank === 'AVERAGE').length,
            poor: technicians.filter(t => t.rank === 'POOR').length
        },
        techsWithClaims: technicians.filter(t => t.stats.guaranteeClaims > 0).map(t => ({
            id: t.id,
            name: t.name,
            claims: t.stats.guaranteeClaims
        }))
    };

    res.json(summary);
});

// Bulk send message
router.post('/message/bulk', async (req, res) => {
    const { technicianIds, message, filter } = req.body;

    let targetTechs = [];

    if (filter) {
        // Filter by area or status
        if (filter.area) {
            targetTechs = technicians.filter(t => t.area === filter.area && t.telegramChatId);
        } else if (filter.status) {
            targetTechs = technicians.filter(t => t.status === filter.status && t.telegramChatId);
        } else if (filter.all) {
            targetTechs = technicians.filter(t => t.telegramChatId);
        }
    } else if (technicianIds) {
        targetTechs = technicians.filter(t => technicianIds.includes(t.id) && t.telegramChatId);
    }

    const chatIds = targetTechs.map(t => t.telegramChatId);
    const result = await sendBulkMessage(chatIds, message);

    res.json({
        message: 'Bulk message sent',
        targeted: targetTechs.length,
        ...result
    });
});

// Bulk send orders to technicians
router.post('/orders/bulk-send', async (req, res) => {
    const { technicianIds } = req.body;

    if (!technicianIds || !technicianIds.length) {
        return res.status(400).json({ error: 'No technicians selected' });
    }

    // Get all orders
    const allOrders = generateOrders(50);

    // Map technician IDs to their assigned orders
    const technicianOrders = technicianIds
        .map(id => {
            const tech = technicians.find(t => t.id === id);
            if (!tech) return null;

            // Get orders assigned to this technician
            const assignedOrders = allOrders.filter(
                order => order.assignee?.id === id &&
                    !['PS_DONE', 'COMPLETED', 'CANCELLED'].includes(order.status)
            );

            return {
                technician: tech,
                orders: assignedOrders
            };
        })
        .filter(item => item && item.orders.length > 0);

    if (technicianOrders.length === 0) {
        return res.status(400).json({
            error: 'No pending orders found for selected technicians',
            message: 'Selected technicians have no pending orders to send'
        });
    }

    const result = await sendBulkOrderNotifications(technicianOrders);

    const totalOrders = technicianOrders.reduce((sum, t) => sum + t.orders.length, 0);

    res.json({
        message: `Bulk orders sent to ${technicianOrders.length} technicians`,
        technicians: technicianOrders.length,
        totalOrders,
        ...result
    });
});

// Get pending technician registrations
router.get('/pending', (req, res) => {
    res.json({
        pending: pendingTechnicians,
        total: pendingTechnicians.length
    });
});

// Approve pending technician
router.post('/:id/approve', async (req, res) => {
    const { id } = req.params;
    const { nik, name, area, unit, phone } = req.body;

    const result = approveFunc(id, name, area, phone, nik, unit);

    if (!result.success) {
        return res.status(404).json({ error: result.message });
    }

    // Notify technician via Telegram
    if (result.data.telegramChatId) {
        await notifyTechnicianApproval(result.data.telegramChatId, result.data);
    }

    res.json({
        message: 'Technician approved successfully',
        technician: result.data
    });
});

// Reject pending technician
router.post('/:id/reject', async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    // Get pending technician data before rejection for notification
    const pending = pendingTechnicians.find(t => t.id === id);
    const chatId = pending?.telegramChatId;

    const result = rejectFunc(id, reason);

    if (!result.success) {
        return res.status(404).json({ error: result.message });
    }

    // Notify technician via Telegram
    if (chatId) {
        await notifyTechnicianRejection(chatId, reason);
    }

    res.json({
        message: 'Registration rejected',
        data: result.data
    });
});

export default router;
