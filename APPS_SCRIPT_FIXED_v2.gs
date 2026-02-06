// SMART DISPATCHER - Google Apps Script (FIXED VERSION)
const SHEET_ID = "1zBLh6vHePpqwfo05xZQfo16xY7_DNTB7vUSGPlyth_Y";

function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (!action) {
      return HtmlService.createHtmlOutput(getWebApp())
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
    
    if (action === "getOrders") {
      return createJsonResponse({
        success: true,
        data: getOrdersList()
      });
    }
    
    if (action === "getTechnicians") {
      return createJsonResponse({
        success: true,
        data: getTechniciansList()
      });
    }
    
    if (action === "getDashboard") {
      return createJsonResponse({
        success: true,
        data: getDashboardStats()
      });
    }
    
    return createJsonResponse({
      success: false,
      error: "Unknown action: " + action
    });
    
  } catch (error) {
    Logger.log("doGet error: " + error.toString());
    return createJsonResponse({
      success: false,
      error: "Server error: " + error.toString()
    });
  }
}

function doPost(e) {
  try {
    const postData = e.postData.contents;
    Logger.log("POST received: " + postData);
    
    const data = JSON.parse(postData);
    
    if (data.action === "login") {
      const result = authenticateUser(data.username, data.password);
      Logger.log("Login result: " + JSON.stringify(result));
      return createJsonResponse(result);
    }
    
    if (data.action === "createOrder") {
      return createJsonResponse(createNewOrder(data));
    }
    
    if (data.action === "assignOrder") {
      return createJsonResponse(assignOrderToTech(data.orderId, data.techId));
    }
    
    if (data.action === "updateOrderStatus") {
      return createJsonResponse(updateOrderStatus(data.orderId, data.status));
    }
    
    return createJsonResponse({
      success: false,
      error: "Unknown action: " + data.action
    });
    
  } catch (error) {
    Logger.log("doPost error: " + error.toString());
    return createJsonResponse({
      success: false,
      error: "Server error: " + error.toString()
    });
  }
}

// Helper to return JSON
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Get sheet safely
function getSheet(sheetName) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      throw new Error("Sheet '" + sheetName + "' not found. Available sheets: check your spreadsheet.");
    }
    return sheet;
  } catch (e) {
    Logger.log("getSheet error: " + e.toString());
    throw e;
  }
}

// Authentication
function authenticateUser(username, password) {
  try {
    const sheet = getSheet("Users");
    const data = sheet.getDataRange().getValues();
    Logger.log("Users sheet has " + data.length + " rows");
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === username && data[i][2] === password) {
        Logger.log("User found: " + username);
        return {
          success: true,
          user: {
            id: data[i][0],
            username: data[i][1],
            role: data[i][3],
            email: data[i][4],
            name: data[i][5] || username
          },
          token: Utilities.getUuid()
        };
      }
    }
    
    Logger.log("User not found: " + username);
    return { success: false, message: "Invalid username or password" };
  } catch (error) {
    Logger.log("authenticateUser error: " + error.toString());
    return { success: false, error: error.toString() };
  }
}

// Get orders
function getOrdersList() {
  try {
    const sheet = getSheet("Orders");
    const data = sheet.getDataRange().getValues();
    const orders = [];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        orders.push({
          id: data[i][0],
          title: data[i][1] || "",
          description: data[i][2] || "",
          status: data[i][3] || "",
          priority: data[i][4] || "",
          assignedTo: data[i][5] || "",
          createdAt: data[i][6] || "",
          dueDate: data[i][7] || ""
        });
      }
    }
    
    return orders;
  } catch (error) {
    Logger.log("getOrdersList error: " + error.toString());
    return [];
  }
}

// Get technicians
function getTechniciansList() {
  try {
    const sheet = getSheet("Technicians");
    const data = sheet.getDataRange().getValues();
    const technicians = [];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        technicians.push({
          id: data[i][0],
          name: data[i][1] || "",
          email: data[i][2] || "",
          phone: data[i][3] || "",
          status: data[i][4] || "",
          assignedOrders: parseInt(data[i][5]) || 0,
          completedOrders: parseInt(data[i][6]) || 0,
          rating: parseFloat(data[i][7]) || 0
        });
      }
    }
    
    return technicians;
  } catch (error) {
    Logger.log("getTechniciansList error: " + error.toString());
    return [];
  }
}

// Get stats
function getDashboardStats() {
  try {
    const orders = getOrdersList();
    const technicians = getTechniciansList();
    
    return {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === "pending").length || 0,
      completedOrders: orders.filter(o => o.status === "completed").length || 0,
      activeTechnicians: technicians.filter(t => t.status === "active").length || 0,
      totalTechnicians: technicians.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    Logger.log("getDashboardStats error: " + error.toString());
    return { totalOrders: 0, pendingOrders: 0, completedOrders: 0, activeTechnicians: 0 };
  }
}

// Create order
function createNewOrder(orderData) {
  try {
    const sheet = getSheet("Orders");
    const newRow = [
      Utilities.getUuid(),
      orderData.title || "",
      orderData.description || "",
      "pending",
      orderData.priority || "medium",
      orderData.assignedTo || "unassigned",
      new Date().toLocaleString(),
      orderData.dueDate || ""
    ];
    
    sheet.appendRow(newRow);
    return { success: true, message: "Order created" };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Assign order
function assignOrderToTech(orderId, techId) {
  try {
    const sheet = getSheet("Orders");
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === orderId) {
        sheet.getRange(i + 1, 6).setValue(techId);
        return { success: true, message: "Order assigned" };
      }
    }
    
    return { success: false, error: "Order not found" };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Update order status
function updateOrderStatus(orderId, newStatus) {
  try {
    const sheet = getSheet("Orders");
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === orderId) {
        sheet.getRange(i + 1, 4).setValue(newStatus);
        return { success: true, message: "Status updated" };
      }
    }
    
    return { success: false, error: "Order not found" };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// FRONTEND HTML
function getWebApp() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    .login-page { background: white; border-radius: 15px; box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3); padding: 50px; max-width: 400px; margin: 100px auto; }
    .login-page h1 { color: #333; margin-bottom: 10px; font-size: 28px; }
    .login-page p { color: #666; margin-bottom: 30px; }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; color: #333; font-weight: 600; margin-bottom: 8px; }
    .form-group input { width: 100%; padding: 12px 15px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px; }
    .form-group input:focus { outline: none; border-color: #667eea; }
    .btn { width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; }
    .btn:hover { transform: translateY(-2px); }
    .dashboard { display: none; background: white; border-radius: 15px; box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3); padding: 30px; }
    .dashboard.active { display: block; }
    .dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #f0f0f0; padding-bottom: 20px; }
    .dashboard-header h1 { color: #333; }
    .user-info { color: #666; font-size: 14px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 12px; text-align: center; }
    .stat-card h3 { font-size: 14px; opacity: 0.9; margin-bottom: 10px; }
    .stat-card .value { font-size: 36px; font-weight: bold; }
    .section { margin-bottom: 30px; }
    .section h2 { color: #333; margin-bottom: 15px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #f0f0f0; }
    th { background: #f8f9fa; font-weight: 600; color: #333; }
    .error { color: #dc3545; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="login-page" id="loginPage">
      <h1>Smart Dispatcher 📊</h1>
      <p>Google Sheets Dashboard</p>
      <form onsubmit="handleLogin(event)">
        <div class="form-group">
          <label>Username</label>
          <input type="text" id="username" required>
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" id="password" required>
        </div>
        <button type="submit" class="btn">Login</button>
        <div id="loginError"></div>
      </form>
      <p style="margin-top: 20px; color: #999; font-size: 12px; text-align: center;">Demo: admin / admin123</p>
    </div>
    <div class="dashboard" id="dashboard">
      <div class="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p id="userInfo" class="user-info"></p>
        </div>
        <button class="btn" onclick="logout()" style="width: 100px;">Logout</button>
      </div>
      <div class="stats-grid" id="statsGrid"></div>
      <div class="section">
        <h2>Recent Orders</h2>
        <table id="ordersTable"></table>
      </div>
      <div class="section">
        <h2>Technicians</h2>
        <table id="techsTable"></table>
      </div>
    </div>
  </div>
  <script>
    let currentUser = null;
    function handleLogin(event) {
      event.preventDefault();
      const payload = { action: 'login', username: document.getElementById('username').value, password: document.getElementById('password').value };
      fetch(window.location.href, { method: 'POST', body: JSON.stringify(payload) })
        .then(r => r.json())
        .then(data => { if (data.success) { currentUser = data.user; loadDashboard(); } else { document.getElementById('loginError').innerHTML = '<div class="error">❌ ' + (data.message || data.error) + '</div>'; } })
        .catch(err => { document.getElementById('loginError').innerHTML = '<div class="error">❌ Error: ' + err + '</div>'; });
    }
    function loadDashboard() {
      document.getElementById('loginPage').style.display = 'none';
      document.getElementById('dashboard').classList.add('active');
      document.getElementById('userInfo').textContent = 'Welcome, ' + currentUser.name + ' (' + currentUser.role + ')';
      fetch(window.location.href + '?action=getDashboard').then(r => r.json()).then(d => updateStats(d.data)).catch(e => console.error(e));
      fetch(window.location.href + '?action=getOrders').then(r => r.json()).then(d => updateOrders(d.data)).catch(e => console.error(e));
      fetch(window.location.href + '?action=getTechnicians').then(r => r.json()).then(d => updateTechnicians(d.data)).catch(e => console.error(e));
    }
    function updateStats(stats) {
      const html = \`<div class="stat-card"><h3>Total Orders</h3><div class="value">\${stats.totalOrders}</div></div><div class="stat-card"><h3>Pending</h3><div class="value">\${stats.pendingOrders}</div></div><div class="stat-card"><h3>Completed</h3><div class="value">\${stats.completedOrders}</div></div><div class="stat-card"><h3>Active Technicians</h3><div class="value">\${stats.activeTechnicians}</div></div>\`;
      document.getElementById('statsGrid').innerHTML = html;
    }
    function updateOrders(orders) {
      let html = '<thead><tr><th>Title</th><th>Status</th><th>Priority</th><th>Assigned</th></tr></thead><tbody>';
      orders.slice(0, 10).forEach(o => { html += \`<tr><td>\${o.title}</td><td>\${o.status}</td><td>\${o.priority}</td><td>\${o.assignedTo}</td></tr>\`; });
      html += '</tbody>';
      document.getElementById('ordersTable').innerHTML = html;
    }
    function updateTechnicians(techs) {
      let html = '<thead><tr><th>Name</th><th>Status</th><th>Orders</th><th>Rating</th></tr></thead><tbody>';
      techs.forEach(t => { html += \`<tr><td>\${t.name}</td><td>\${t.status}</td><td>\${t.assignedOrders}</td><td>\${t.rating.toFixed(1)} ⭐</td></tr>\`; });
      html += '</tbody>';
      document.getElementById('techsTable').innerHTML = html;
    }
    function logout() { currentUser = null; document.getElementById('loginPage').style.display = 'block'; document.getElementById('dashboard').classList.remove('active'); document.getElementById('username').value = ''; document.getElementById('password').value = ''; }
  </script>
</body>
</html>
  `;
}
`;
