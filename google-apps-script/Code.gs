/**
 * Smart Dispatcher - Google Apps Script
 * Deploy as Web App to enable API access
 * 
 * Setup:
 * 1. Open script.google.com
 * 2. Create new project or use existing
 * 3. Paste this code
 * 4. Deploy > New deployment > Web app
 * 5. Set "Execute as" = Me, "Who has access" = Anyone
 * 6. Copy Web App URL and add to backend .env as GOOGLE_APPS_SCRIPT_URL
 */

const SHEET_ID = "12pG-QhPCVuxcQwvePmoeTkYTe7WDeWGG8qnT9Vu6srk";

// Sheet names
const SHEETS = {
  ORDERS: "Orders",
  TECHNICIANS: "Technicians",
  CLAIMS: "Claims"
};

// Handle POST requests from backend
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    switch (action) {
      case "getOrders":
        return jsonResponse(getOrders());
      case "getTechnicians":
        return jsonResponse(getTechnicians());
      case "addOrder":
        return jsonResponse(addOrder(data.order));
      case "updateOrder":
        return jsonResponse(updateOrder(data.orderId, data.updates));
      case "addTechnician":
        return jsonResponse(addTechnician(data.technician));
      case "exportData":
        return jsonResponse(exportData(data.data, data.sheetName));
      default:
        return jsonResponse({ error: "Unknown action" });
    }
  } catch (error) {
    return jsonResponse({ error: error.message });
  }
}

// Handle GET requests (for testing)
function doGet(e) {
  const action = e.parameter.action || "status";

  switch (action) {
    case "getOrders":
      return jsonResponse(getOrders());
    case "getTechnicians":
      return jsonResponse(getTechnicians());
    case "status":
      return jsonResponse({ status: "ok", sheetId: SHEET_ID });
    default:
      return jsonResponse({ error: "Unknown action" });
  }
}

// JSON response helper
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Get all orders
function getOrders() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEETS.ORDERS);
  if (!sheet) return { data: [], error: "Orders sheet not found" };

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { data: [] };

  const headers = data[0];
  const orders = data.slice(1).map(row => {
    const order = {};
    headers.forEach((header, i) => {
      order[header.toLowerCase().replace(/\s/g, "_")] = row[i];
    });
    return order;
  });

  return { data: orders };
}

// Get all technicians
function getTechnicians() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEETS.TECHNICIANS);
  if (!sheet) return { data: [], error: "Technicians sheet not found" };

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { data: [] };

  const headers = data[0];
  const technicians = data.slice(1).map(row => {
    const tech = {};
    headers.forEach((header, i) => {
      tech[header.toLowerCase().replace(/\s/g, "_")] = row[i];
    });
    return tech;
  });

  return { data: technicians };
}

// Add new order
function addOrder(order) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEETS.ORDERS);
  if (!sheet) return { success: false, error: "Orders sheet not found" };

  // Get headers
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  // Create row from order object
  const row = headers.map(header => order[header.toLowerCase().replace(/\s/g, "_")] || "");

  sheet.appendRow(row);
  return { success: true, orderId: order.id || order.order_id };
}

// Update order
function updateOrder(orderId, updates) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEETS.ORDERS);
  if (!sheet) return { success: false, error: "Orders sheet not found" };

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIndex = headers.findIndex(h => h.toLowerCase() === "order_id" || h.toLowerCase() === "id");

  if (idIndex === -1) return { success: false, error: "ID column not found" };

  // Find row to update
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIndex] === orderId) {
      // Update values
      Object.keys(updates).forEach(key => {
        const colIndex = headers.findIndex(h => h.toLowerCase().replace(/\s/g, "_") === key);
        if (colIndex !== -1) {
          sheet.getRange(i + 1, colIndex + 1).setValue(updates[key]);
        }
      });
      return { success: true };
    }
  }

  return { success: false, error: "Order not found" };
}

// Add technician
function addTechnician(technician) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEETS.TECHNICIANS);
  if (!sheet) return { success: false, error: "Technicians sheet not found" };

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map(header => technician[header.toLowerCase().replace(/\s/g, "_")] || "");

  sheet.appendRow(row);
  return { success: true, techId: technician.id || technician.tech_id };
}

// Export data to sheet
function exportData(data, sheetName) {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  let sheet = spreadsheet.getSheetByName(sheetName);

  // Create sheet if doesn't exist
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  // Clear existing data
  sheet.clear();

  // Write headers
  if (data.length > 0) {
    const headers = Object.keys(data[0]);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // Write data
    const rows = data.map(item => headers.map(h => item[h] || ""));
    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    }
  }

  return { success: true, rowCount: data.length };
}
