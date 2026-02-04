import express from 'express';
import { generateClaims, PRODUCT_TYPES } from '../data/mockData.js';

const router = express.Router();

// In-memory claims
let claims = generateClaims(20);

// Get all claims
router.get('/', (req, res) => {
    const { status, product } = req.query;

    let filtered = [...claims];

    if (status) {
        filtered = filtered.filter(c => c.status === status);
    }
    if (product) {
        filtered = filtered.filter(c => c.product === product);
    }

    const stats = {
        total: claims.length,
        within30Days: claims.filter(c => c.remainingDays <= 30).length,
        within60Days: claims.filter(c => c.remainingDays > 30 && c.remainingDays <= 60).length,
        needsReview: claims.filter(c => c.status === 'PENDING').length
    };

    res.json({
        claims: filtered,
        stats,
        productTypes: PRODUCT_TYPES
    });
});

// Get claim by ID
router.get('/:id', (req, res) => {
    const claim = claims.find(c => c.id === req.params.id);

    if (!claim) {
        return res.status(404).json({ error: 'Claim not found' });
    }

    res.json(claim);
});

// Create new claim
router.post('/', (req, res) => {
    const newClaim = {
        id: `CLM-${1000 + claims.length}`,
        ...req.body,
        claimDate: new Date().toISOString().split('T')[0],
        status: 'PENDING'
    };

    claims.unshift(newClaim);
    res.status(201).json(newClaim);
});

// Update claim status
router.patch('/:id/status', (req, res) => {
    const { status } = req.body;
    const claim = claims.find(c => c.id === req.params.id);

    if (!claim) {
        return res.status(404).json({ error: 'Claim not found' });
    }

    claim.status = status;
    res.json(claim);
});

export default router;
