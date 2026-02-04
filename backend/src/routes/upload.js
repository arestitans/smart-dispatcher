import express from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { exportToSheet, syncFromSheet } from '../services/googleSheets.js';

const router = express.Router();

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel' ||
            file.mimetype === 'text/csv') {
            cb(null, true);
        } else {
            cb(new Error('Only Excel and CSV files are allowed'));
        }
    }
});

// Parse spreadsheet and return preview (for SpreadsheetImport component)
router.post('/parse', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert to array of arrays for preview
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (rawData.length === 0) {
            return res.json({ headers: [], sample: [], totalRows: 0 });
        }

        res.json({
            headers: rawData[0] || [],
            sample: rawData.slice(1, 6),
            totalRows: rawData.length - 1,
            filename: req.file.originalname
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Import data with column mapping
router.post('/import', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const mapping = JSON.parse(req.body.mapping || '{}');

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const headers = rawData[0] || [];
        const rows = rawData.slice(1);

        // Map data using provided mapping
        const orders = rows.map((row, index) => ({
            id: mapping.orderId !== undefined ? row[mapping.orderId] : `ORD-${5000 + index}`,
            product: mapping.product !== undefined ? row[mapping.product] : 'INDIHOME',
            customer: mapping.customer !== undefined ? row[mapping.customer] : '',
            phone: mapping.phone !== undefined ? row[mapping.phone] : '',
            address: mapping.address !== undefined ? row[mapping.address] : '',
            area: mapping.area !== undefined ? row[mapping.area] : '',
            priority: mapping.priority !== undefined ? row[mapping.priority] : 'NORMAL',
            technicianId: mapping.technicianId !== undefined ? row[mapping.technicianId] : null,
            schedule: mapping.schedule !== undefined ? row[mapping.schedule] : new Date().toISOString().split('T')[0],
            status: 'OPEN',
            createdAt: new Date().toISOString()
        }));

        // Try to sync to Google Sheets
        const sheetResult = await exportToSheet(orders, 'ImportedOrders');

        res.json({
            success: true,
            imported: orders.length,
            syncedToSheet: sheetResult?.success || false,
            orders: orders.slice(0, 5) // Return first 5 for preview
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Sync data from Google Sheets
router.get('/sync', async (req, res) => {
    try {
        const data = await syncFromSheet();
        res.json({
            success: true,
            orders: data.orders.length,
            technicians: data.technicians.length,
            data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Export to Google Sheets
router.post('/export-to-sheet', async (req, res) => {
    try {
        const { data, sheetName } = req.body;
        const result = await exportToSheet(data, sheetName);
        res.json(result || { success: false, error: 'Apps Script not configured' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Upload and parse spreadsheet (legacy)
router.post('/spreadsheet', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        res.json({
            success: true,
            filename: req.file.originalname,
            sheets: workbook.SheetNames,
            preview: data.slice(0, 10),
            totalRows: data.length,
            columns: data.length > 0 ? Object.keys(data[0]) : []
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Import orders from spreadsheet data (legacy)
router.post('/import/orders', async (req, res) => {
    try {
        const { data, columnMapping } = req.body;

        const orders = data.map((row, index) => ({
            id: `ORD-${5000 + index}`,
            customer: row[columnMapping.customer] || '',
            phone: row[columnMapping.phone] || '',
            address: row[columnMapping.address] || '',
            product: row[columnMapping.product] || 'Others',
            schedule: row[columnMapping.schedule] || new Date().toISOString().split('T')[0],
            status: 'OPEN',
            priority: row[columnMapping.priority] || 'NORMAL',
            createdAt: new Date().toISOString()
        }));

        res.json({
            success: true,
            imported: orders.length,
            orders
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Import technicians from spreadsheet data (legacy)
router.post('/import/technicians', async (req, res) => {
    try {
        const { data, columnMapping } = req.body;

        const technicians = data.map((row, index) => ({
            id: row[columnMapping.id] || `TX-${9100 + index}`,
            name: row[columnMapping.name] || '',
            area: row[columnMapping.area] || '',
            phone: row[columnMapping.phone] || '',
            status: 'AVAILABLE'
        }));

        res.json({
            success: true,
            imported: technicians.length,
            technicians
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;

