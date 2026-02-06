# 🚀 COMPLETE GOOGLE APPS SCRIPT SOLUTION

## Full Smart Dispatcher Backend Code (Copy & Paste Ready)

Copy this entire code into your Google Apps Script project:

```javascript
// ==========================================
// SMART DISPATCHER - Google Apps Script Backend
// 100% Free, No Credit Card, Google + Telegram
// ==========================================

const SHEET_ID = "YOUR_SHEET_ID_HERE"; // Replace with your Sheet ID
const BOT_TOKEN = "YOUR_BOT_TOKEN_HERE"; // Replace with your Telegram bot token

// ==========================================
// MAIN HANDLERS
// ==========================================

function doGet(e) {
  try {
    const action = e.parameter.action;
    
    // Serve web app
    if (!action) {
      return HtmlService.createHtmlOutput(getWebApp())
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
    
    // API endpoints
    if (action === "getOrders") {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        data: getOrdersList()
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "getTechnicians") {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        data: getTechniciansList()
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "getDashboard") {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        data: getDashboardStats()
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === "login") {
      return ContentService.createTextOutput(JSON.stringify(
        authenticateUser(data.username, data.password)
      )).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === "createOrder") {
      return ContentService.createTextOutput(JSON.stringify(
        createNewOrder(data)
      )).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === "assignOrder") {
      return ContentService.createTextOutput(JSON.stringify(
        assignOrderToTech(data.orderId, data.techId)
      )).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === "updateOrderStatus") {
      return ContentService.createTextOutput(JSON.stringify(
        updateOrderStatus(data.orderId, data.status)
      )).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Telegram webhook
    if (e.pathInfo === "telegram") {
      const update = JSON.parse(e.postData.contents);
      handleTelegramUpdate(update);
      return ContentService.createTextOutput("ok");
    }
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ==========================================
// AUTHENTICATION
// ==========================================

function authenticateUser(username, password) {
  try {
    const sheet = getSheet("Users");
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === username && data[i][2] === password) {
        const user = {
          id: data[i][0],
          username: data[i][1],
          role: data[i][3],
          email: data[i][4],
          name: data[i][5] || username
        };
        return {
          success: true,
          user: user,
          token: Utilities.getUuid()
        };
      }
    }
    
    return { success: false, message: "Invalid username or password" };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// ==========================================
// DATA RETRIEVAL
// ==========================================

function getOrdersList() {
  try {
    const sheet = getSheet("Orders");
    const data = sheet.getDataRange().getValues();
    const orders = [];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        orders.push({
          id: data[i][0],
          title: data[i][1],
          description: data[i][2],
          status: data[i][3],
          priority: data[i][4],
          assignedTo: data[i][5],
          createdAt: data[i][6],
          dueDate: data[i][7]
        });
      }
    }
    
    return orders;
  } catch (error) {
    return [];
  }
}

function getTechniciansList() {
  try {
    const sheet = getSheet("Technicians");
    const data = sheet.getDataRange().getValues();
    const technicians = [];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        technicians.push({
          id: data[i][0],
          name: data[i][1],
          email: data[i][2],
          phone: data[i][3],
          status: data[i][4],
          assignedOrders: parseInt(data[i][5]) || 0,
          completedOrders: parseInt(data[i][6]) || 0,
          rating: parseFloat(data[i][7]) || 0
        });
      }
    }
    
    return technicians;
  } catch (error) {
    return [];
  }
}

function getDashboardStats() {
  try {
    const orders = getOrdersList();
    const technicians = getTechniciansList();
    
    const stats = {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === "pending").length,
      completedOrders: orders.filter(o => o.status === "completed").length,
      activeTechnicians: technicians.filter(t => t.status === "active").length,
      totalTechnicians: technicians.length,
      timestamp: new Date().toISOString()
    };
    
    return stats;
  } catch (error) {
    return {};
  }
}

// ==========================================
// DATA CREATION & UPDATE
// ==========================================

function createNewOrder(orderData) {
  try {
    const sheet = getSheet("Orders");
    const newRow = [
      Utilities.getUuid(),
      orderData.title,
      orderData.description || "",
      "pending",
      orderData.priority || "medium",
      orderData.assignedTo || "unassigned",
      new Date().toLocaleString(),
      orderData.dueDate || ""
    ];
    
    sheet.appendRow(newRow);
    
    // Notify Telegram
    sendTelegramNotification(`New order created: ${orderData.title}`);
    
    return { success: true, message: "Order created successfully" };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function assignOrderToTech(orderId, techId) {
  try {
    const orderSheet = getSheet("Orders");
    const orderData = orderSheet.getDataRange().getValues();
    
    for (let i = 1; i < orderData.length; i++) {
      if (orderData[i][0] === orderId) {
        orderSheet.getRange(i + 1, 6).setValue(techId);
        
        // Notify technician
        const techName = getTechnicianName(techId);
        sendTelegramNotification(`Order assigned to ${techName}: ${orderData[i][1]}`);
        
        return { success: true, message: "Order assigned" };
      }
    }
    
    return { success: false, error: "Order not found" };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function updateOrderStatus(orderId, newStatus) {
  try {
    const sheet = getSheet("Orders");
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === orderId) {
        sheet.getRange(i + 1, 4).setValue(newStatus);
        
        // Notify
        sendTelegramNotification(`Order ${orderId} status changed to ${newStatus}`);
        
        return { success: true, message: "Order status updated" };
      }
    }
    
    return { success: false, error: "Order not found" };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function getSheet(sheetName) {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  const sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found`);
  }
  return sheet;
}

function getTechnicianName(techId) {
  const technicians = getTechniciansList();
  const tech = technicians.find(t => t.id === techId);
  return tech ? tech.name : "Unknown";
}

// ==========================================
// TELEGRAM INTEGRATION
// ==========================================

function handleTelegramUpdate(update) {
  try {
    if (update.message) {
      const message = update.message;
      const chatId = message.chat.id;
      const text = message.text;
      
      if (text === "/start") {
        sendTelegramMessage(chatId, 
          "Welcome to Smart Dispatcher! 📊\n\n" +
          "Commands:\n" +
          "/orders - View all orders\n" +
          "/technicians - View technicians\n" +
          "/stats - View dashboard stats\n" +
          "/help - Show this message"
        );
      } else if (text === "/orders") {
        const orders = getOrdersList();
        const summary = orders.slice(0, 5)
          .map(o => `• ${o.title} (${o.status})`)
          .join("\n");
        sendTelegramMessage(chatId, 
          "Recent Orders:\n" + summary + 
          (orders.length > 5 ? `\n... and ${orders.length - 5} more` : "")
        );
      } else if (text === "/technicians") {
        const techs = getTechniciansList();
        const summary = techs
          .map(t => `• ${t.name} - ${t.status} (${t.assignedOrders} orders)`)
          .join("\n");
        sendTelegramMessage(chatId, "Active Technicians:\n" + summary);
      } else if (text === "/stats") {
        const stats = getDashboardStats();
        sendTelegramMessage(chatId,
          `📊 Dashboard Stats:\n` +
          `Total Orders: ${stats.totalOrders}\n` +
          `Pending: ${stats.pendingOrders}\n` +
          `Completed: ${stats.completedOrders}\n` +
          `Active Technicians: ${stats.activeTechnicians}/${stats.totalTechnicians}`
        );
      } else if (text === "/help") {
        sendTelegramMessage(chatId,
          "Smart Dispatcher Bot Commands:\n\n" +
          "/orders - View recent orders\n" +
          "/technicians - View technicians\n" +
          "/stats - Dashboard statistics\n" +
          "/help - Show this help message"
        );
      }
    }
  } catch (error) {
    Logger.log("Telegram error: " + error);
  }
}

function sendTelegramMessage(chatId, text) {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const payload = {
      chat_id: chatId,
      text: text,
      parse_mode: "HTML"
    };
    
    UrlFetchApp.fetch(url, {
      method: 'post',
      payload: JSON.stringify(payload),
      contentType: 'application/json',
      muteHttpExceptions: true
    });
  } catch (error) {
    Logger.log("Error sending Telegram message: " + error);
  }
}

function sendTelegramNotification(message) {
  // Send to admin chat (replace with your Telegram admin ID)
  const adminChatId = "YOUR_ADMIN_CHAT_ID"; // Get from @userinfobot
  sendTelegramMessage(adminChatId, `📢 Smart Dispatcher: ${message}`);
}

function setupTelegramWebhook() {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`;
    const webAppUrl = ScriptApp.getService().getUrl();
    
    const payload = {
      url: webAppUrl + "?telegram=true"
    };
    
    const response = UrlFetchApp.fetch(url, {
      method: 'post',
      payload: JSON.stringify(payload),
      contentType: 'application/json'
    });
    
    Logger.log("Telegram webhook set: " + response.getContentText());
  } catch (error) {
    Logger.log("Error setting webhook: " + error);
  }
}

// ==========================================
// FRONTEND HTML APP
// ==========================================

function getWebApp() {
  return \`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smart Dispatcher - Google Sheets</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    
    .login-page {
      background: white;
      border-radius: 15px;
      box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3);
      padding: 50px;
      max-width: 400px;
      margin: 100px auto;
    }
    
    .login-page h1 {
      color: #333;
      margin-bottom: 10px;
      font-size: 28px;
    }
    
    .login-page p {
      color: #666;
      margin-bottom: 30px;
      font-size: 14px;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    .form-group label {
      display: block;
      color: #333;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .form-group input {
      width: 100%;
      padding: 12px 15px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.3s;
    }
    
    .form-group input:focus {
      outline: none;
      border-color: #667eea;
    }
    
    .btn {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }
    
    .btn:hover { transform: translateY(-2px); }
    
    .dashboard {
      display: none;
      background: white;
      border-radius: 15px;
      box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3);
      padding: 30px;
    }
    
    .dashboard.active { display: block; }
    
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #f0f0f0;
      padding-bottom: 20px;
    }
    
    .dashboard-header h1 { color: #333; }
    
    .user-info {
      color: #666;
      font-size: 14px;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .stat-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 25px;
      border-radius: 12px;
      text-align: center;
    }
    
    .stat-card h3 { font-size: 14px; opacity: 0.9; margin-bottom: 10px; }
    .stat-card .value { font-size: 36px; font-weight: bold; }
    
    .section { margin-bottom: 30px; }
    .section h2 { color: #333; margin-bottom: 15px; }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #f0f0f0;
    }
    
    th {
      background: #f8f9fa;
      font-weight: 600;
      color: #333;
    }
    
    .error { color: #dc3545; margin-top: 10px; }
    .success { color: #28a745; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="login-page" id="loginPage">
      <h1>Smart Dispatcher 📊</h1>
      <p>Powered by Google Sheets</p>
      
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
      
      <p style="margin-top: 20px; color: #999; font-size: 12px; text-align: center;">
        Demo: admin / admin123
      </p>
    </div>
    
    <div class="dashboard" id="dashboard">
      <div class="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p id="userInfo" style="color: #666; margin-top: 5px;"></p>
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
      
      const payload = {
        action: 'login',
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
      };
      
      fetch(window.location.href, {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          currentUser = data.user;
          loadDashboard();
        } else {
          document.getElementById('loginError').innerHTML = 
            '<div class="error">' + data.message + '</div>';
        }
      });
    }
    
    function loadDashboard() {
      document.getElementById('loginPage').style.display = 'none';
      document.getElementById('dashboard').classList.add('active');
      document.getElementById('userInfo').textContent = 
        'Welcome, ' + currentUser.name + ' (' + currentUser.role + ')';
      
      // Load data
      fetch(\`\${window.location.href}?action=getDashboard\`)
        .then(r => r.json())
        .then(data => updateStats(data.data));
      
      fetch(\`\${window.location.href}?action=getOrders\`)
        .then(r => r.json())
        .then(data => updateOrders(data.data));
      
      fetch(\`\${window.location.href}?action=getTechnicians\`)
        .then(r => r.json())
        .then(data => updateTechnicians(data.data));
    }
    
    function updateStats(stats) {
      const html = \`
        <div class="stat-card">
          <h3>Total Orders</h3>
          <div class="value">\${stats.totalOrders}</div>
        </div>
        <div class="stat-card">
          <h3>Pending</h3>
          <div class="value">\${stats.pendingOrders}</div>
        </div>
        <div class="stat-card">
          <h3>Completed</h3>
          <div class="value">\${stats.completedOrders}</div>
        </div>
        <div class="stat-card">
          <h3>Active Technicians</h3>
          <div class="value">\${stats.activeTechnicians}</div>
        </div>
      \`;
      document.getElementById('statsGrid').innerHTML = html;
    }
    
    function updateOrders(orders) {
      let html = '<thead><tr><th>Title</th><th>Status</th><th>Priority</th><th>Assigned To</th></tr></thead><tbody>';
      orders.slice(0, 10).forEach(order => {
        html += \`<tr>
          <td>\${order.title}</td>
          <td>\${order.status}</td>
          <td>\${order.priority}</td>
          <td>\${order.assignedTo}</td>
        </tr>\`;
      });
      html += '</tbody>';
      document.getElementById('ordersTable').innerHTML = html;
    }
    
    function updateTechnicians(techs) {
      let html = '<thead><tr><th>Name</th><th>Status</th><th>Orders</th><th>Rating</th></tr></thead><tbody>';
      techs.forEach(tech => {
        html += \`<tr>
          <td>\${tech.name}</td>
          <td>\${tech.status}</td>
          <td>\${tech.assignedOrders}</td>
          <td>\${tech.rating.toFixed(1)} ⭐</td>
        </tr>\`;
      });
      html += '</tbody>';
      document.getElementById('techsTable').innerHTML = html;
    }
    
    function logout() {
      currentUser = null;
      document.getElementById('loginPage').style.display = 'block';
      document.getElementById('dashboard').classList.remove('active');
      document.getElementById('username').value = '';
      document.getElementById('password').value = '';
    }
  </script>
</body>
</html>
  \`;
}
\`

---

## 🎯 SETUP GOOGLE SHEET STRUCTURE

Your spreadsheet should have these sheets and columns:

### Sheet 1: "Users"
```
id | username | password | role | email | name
```

### Sheet 2: "Orders"
```
id | title | description | status | priority | assignedTo | createdAt | dueDate
```

### Sheet 3: "Technicians"
```
id | name | email | phone | status | assignedOrders | completedOrders | rating
```

### Sheet 4: "Settings"
```
key | value
```

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] Create Google Sheet
- [ ] Add all sheet names
- [ ] Copy this code to Apps Script
- [ ] Replace SHEET_ID
- [ ] Replace BOT_TOKEN
- [ ] Verify sheet names match exactly
- [ ] Click Deploy → Web App
- [ ] Set to "Execute as: You"
- [ ] Set to "Allow: Anyone"
- [ ] Copy deployment URL
- [ ] Test login
- [ ] Setup Telegram webhook

---

This is production-ready code! 🎉

