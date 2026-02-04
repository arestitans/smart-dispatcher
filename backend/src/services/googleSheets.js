import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const SHEET_ID = process.env.GOOGLE_SHEETS_ID;
const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL;

// Sheets names
const SHEETS = {
    ORDERS: 'Orders',
    TECHNICIANS: 'Technicians',
    CLAIMS: 'Claims'
};

// Initialize using Apps Script Web App (simpler, no service account needed)
const callAppsScript = async (action, data = {}) => {
    if (!APPS_SCRIPT_URL) {
        console.log('⚠️ Google Apps Script URL not configured');
        return null;
    }

    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, ...data })
        });
        return await response.json();
    } catch (error) {
        console.error('Apps Script error:', error.message);
        return null;
    }
};

// Fetch orders from Google Sheets
export const getOrdersFromSheet = async () => {
    const result = await callAppsScript('getOrders');
    return result?.data || [];
};

// Fetch technicians from Google Sheets
export const getTechniciansFromSheet = async () => {
    const result = await callAppsScript('getTechnicians');
    return result?.data || [];
};

// Add new order to Google Sheets
export const addOrderToSheet = async (order) => {
    return await callAppsScript('addOrder', { order });
};

// Update order status in Google Sheets
export const updateOrderInSheet = async (orderId, updates) => {
    return await callAppsScript('updateOrder', { orderId, updates });
};

// Add technician to Google Sheets
export const addTechnicianToSheet = async (technician) => {
    return await callAppsScript('addTechnician', { technician });
};

// Sync all data from sheet
export const syncFromSheet = async () => {
    const orders = await getOrdersFromSheet();
    const technicians = await getTechniciansFromSheet();
    return { orders, technicians };
};

// Export data to sheet
export const exportToSheet = async (data, sheetName) => {
    return await callAppsScript('exportData', { data, sheetName });
};

// Direct Google Sheets API access (requires service account)
let sheets = null;

const initSheetsAPI = () => {
    if (sheets) return sheets;

    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

    if (!privateKey || !clientEmail) {
        console.log('⚠️ Google Service Account not configured - using Apps Script');
        return null;
    }

    const auth = new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    sheets = google.sheets({ version: 'v4', auth });
    return sheets;
};

// Read range from sheet
export const readSheet = async (range) => {
    const api = initSheetsAPI();
    if (!api) return null;

    try {
        const response = await api.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range
        });
        return response.data.values;
    } catch (error) {
        console.error('Sheet read error:', error.message);
        return null;
    }
};

// Write to sheet
export const writeSheet = async (range, values) => {
    const api = initSheetsAPI();
    if (!api) return null;

    try {
        await api.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values }
        });
        return true;
    } catch (error) {
        console.error('Sheet write error:', error.message);
        return false;
    }
};

// Append row to sheet
export const appendSheet = async (sheetName, values) => {
    const api = initSheetsAPI();
    if (!api) return null;

    try {
        await api.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: `${sheetName}!A:Z`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [values] }
        });
        return true;
    } catch (error) {
        console.error('Sheet append error:', error.message);
        return false;
    }
};

export default {
    getOrdersFromSheet,
    getTechniciansFromSheet,
    addOrderToSheet,
    updateOrderInSheet,
    addTechnicianToSheet,
    syncFromSheet,
    exportToSheet,
    readSheet,
    writeSheet,
    appendSheet
};
