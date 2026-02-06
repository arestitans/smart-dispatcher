// SMART DISPATCHER - BULLETPROOF VERSION
const SHEET_ID = "1zBLh6vHePpqwfo05xZQfo16xY7_DNTB7vUSGPlyth_Y";

function doGet(e) {
  if (!e.parameter.action) {
    return HtmlService.createHtmlOutput(getFrontend()).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  
  try {
    if (e.parameter.action == "getOrders") {
      return sendJSON({success: true, data: getOrders()});
    }
    if (e.parameter.action == "getTechnicians") {
      return sendJSON({success: true, data: getTechs()});
    }
    if (e.parameter.action == "getDashboard") {
      return sendJSON({success: true, data: getStats()});
    }
  } catch(err) {
    return sendJSON({success: false, error: err.toString()});
  }
  return sendJSON({success: false, error: "Unknown action"});
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    if (data.action == "login") {
      return sendJSON(loginUser(data.username, data.password));
    }
  } catch(err) {
    return sendJSON({success: false, error: "Parse error: " + err.toString()});
  }
  return sendJSON({success: false, error: "Unknown action"});
}

function sendJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function loginUser(username, password) {
  try {
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("Users");
    var data = sheet.getDataRange().getValues();
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][1] == username && data[i][2] == password) {
        return {
          success: true,
          user: {
            id: data[i][0],
            username: data[i][1],
            role: data[i][3],
            email: data[i][4],
            name: data[i][5]
          }
        };
      }
    }
    return {success: false, message: "Invalid username or password"};
  } catch(err) {
    return {success: false, error: err.toString()};
  }
}

function getOrders() {
  try {
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("Orders");
    var data = sheet.getDataRange().getValues();
    var result = [];
    for (var i = 1; i < data.length; i++) {
      if (data[i][0]) {
        result.push({
          id: data[i][0],
          title: data[i][1],
          status: data[i][3],
          priority: data[i][4]
        });
      }
    }
    return result;
  } catch(err) {
    return [];
  }
}

function getTechs() {
  try {
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("Technicians");
    var data = sheet.getDataRange().getValues();
    var result = [];
    for (var i = 1; i < data.length; i++) {
      if (data[i][0]) {
        result.push({
          id: data[i][0],
          name: data[i][1],
          status: data[i][4]
        });
      }
    }
    return result;
  } catch(err) {
    return [];
  }
}

function getStats() {
  try {
    var orders = getOrders();
    var techs = getTechs();
    var pending = 0, completed = 0, active = 0;
    
    for (var i = 0; i < orders.length; i++) {
      if (orders[i].status == "pending") pending++;
      if (orders[i].status == "completed") completed++;
    }
    
    for (var i = 0; i < techs.length; i++) {
      if (techs[i].status == "active") active++;
    }
    
    return {
      totalOrders: orders.length,
      pendingOrders: pending,
      completedOrders: completed,
      activeTechnicians: active
    };
  } catch(err) {
    return {totalOrders: 0, pendingOrders: 0, completedOrders: 0, activeTechnicians: 0};
  }
}

function getFrontend() {
  var html = "<!DOCTYPE html>\n";
  html += "<html>\n";
  html += "<head>\n";
  html += "  <meta charset=\"UTF-8\">\n";
  html += "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n";
  html += "  <title>Smart Dispatcher</title>\n";
  html += "  <style>\n";
  html += "    * { margin: 0; padding: 0; box-sizing: border-box; }\n";
  html += "    body { font-family: Arial, sans-serif; background: #f5f5f5; }\n";
  html += "    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }\n";
  html += "    .login { background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 40px; max-width: 400px; margin: 60px auto; }\n";
  html += "    .login h1 { color: #333; margin-bottom: 20px; }\n";
  html += "    .login p { color: #666; margin-bottom: 20px; }\n";
  html += "    .form-group { margin-bottom: 15px; }\n";
  html += "    .form-group label { display: block; margin-bottom: 5px; color: #333; font-weight: bold; }\n";
  html += "    .form-group input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; }\n";
  html += "    .btn { width: 100%; padding: 10px; background: #4CAF50; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; margin-top: 10px; }\n";
  html += "    .btn:hover { background: #45a049; }\n";
  html += "    .dashboard { display: none; }\n";
  html += "    .dashboard.show { display: block; }\n";
  html += "    .dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #ddd; padding-bottom: 20px; }\n";
  html += "    .dashboard-header h1 { color: #333; }\n";
  html += "    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }\n";
  html += "    .stat { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }\n";
  html += "    .stat h3 { color: #666; margin-bottom: 10px; font-size: 14px; }\n";
  html += "    .stat .value { font-size: 32px; color: #4CAF50; font-weight: bold; }\n";
  html += "    .section { background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }\n";
  html += "    .section h2 { color: #333; margin-bottom: 15px; }\n";
  html += "    table { width: 100%; border-collapse: collapse; }\n";
  html += "    th { background: #f5f5f5; padding: 12px; text-align: left; font-weight: bold; color: #333; border-bottom: 1px solid #ddd; }\n";
  html += "    td { padding: 12px; border-bottom: 1px solid #eee; }\n";
  html += "    .error { color: #d32f2f; margin-top: 10px; }\n";
  html += "  </style>\n";
  html += "</head>\n";
  html += "<body>\n";
  html += "  <div class=\"container\">\n";
  html += "    <div class=\"login\" id=\"loginDiv\">\n";
  html += "      <h1>Smart Dispatcher</h1>\n";
  html += "      <p>Google Sheets Dashboard</p>\n";
  html += "      <form onsubmit=\"handleLogin(event)\">\n";
  html += "        <div class=\"form-group\">\n";
  html += "          <label>Username</label>\n";
  html += "          <input type=\"text\" id=\"username\" required>\n";
  html += "        </div>\n";
  html += "        <div class=\"form-group\">\n";
  html += "          <label>Password</label>\n";
  html += "          <input type=\"password\" id=\"password\" required>\n";
  html += "        </div>\n";
  html += "        <button type=\"submit\" class=\"btn\">Login</button>\n";
  html += "        <div id=\"loginError\"></div>\n";
  html += "      </form>\n";
  html += "      <p style=\"margin-top: 15px; color: #999; font-size: 12px; text-align: center;\">Demo: admin / admin123</p>\n";
  html += "    </div>\n";
  html += "    <div class=\"dashboard\" id=\"dashDiv\">\n";
  html += "      <div class=\"dashboard-header\">\n";
  html += "        <h1>Dashboard</h1>\n";
  html += "        <button class=\"btn\" onclick=\"handleLogout()\" style=\"width: 100px;\">Logout</button>\n";
  html += "      </div>\n";
  html += "      <div class=\"stats\" id=\"statsDiv\"></div>\n";
  html += "      <div class=\"section\">\n";
  html += "        <h2>Orders</h2>\n";
  html += "        <table id=\"ordersTable\"></table>\n";
  html += "      </div>\n";
  html += "      <div class=\"section\">\n";
  html += "        <h2>Technicians</h2>\n";
  html += "        <table id=\"techsTable\"></table>\n";
  html += "      </div>\n";
  html += "    </div>\n";
  html += "  </div>\n";
  html += "  <script>\n";
  html += "    var currentUser = null;\n";
  html += "    function handleLogin(e) {\n";
  html += "      e.preventDefault();\n";
  html += "      var username = document.getElementById('username').value;\n";
  html += "      var password = document.getElementById('password').value;\n";
  html += "      fetch(location.href, {\n";
  html += "        method: 'POST',\n";
  html += "        body: JSON.stringify({action: 'login', username: username, password: password})\n";
  html += "      })\n";
  html += "      .then(r => r.json())\n";
  html += "      .then(d => {\n";
  html += "        if (d.success) {\n";
  html += "          currentUser = d.user;\n";
  html += "          showDashboard();\n";
  html += "        } else {\n";
  html += "          document.getElementById('loginError').innerHTML = '<div class=\"error\">Error: ' + (d.message || d.error) + '</div>';\n";
  html += "        }\n";
  html += "      })\n";
  html += "      .catch(e => {\n";
  html += "        document.getElementById('loginError').innerHTML = '<div class=\"error\">Request failed: ' + e + '</div>';\n";
  html += "      });\n";
  html += "    }\n";
  html += "    function showDashboard() {\n";
  html += "      document.getElementById('loginDiv').style.display = 'none';\n";
  html += "      document.getElementById('dashDiv').classList.add('show');\n";
  html += "      loadData();\n";
  html += "    }\n";
  html += "    function loadData() {\n";
  html += "      fetch(location.href + '?action=getDashboard').then(r => r.json()).then(d => showStats(d.data));\n";
  html += "      fetch(location.href + '?action=getOrders').then(r => r.json()).then(d => showOrders(d.data));\n";
  html += "      fetch(location.href + '?action=getTechnicians').then(r => r.json()).then(d => showTechs(d.data));\n";
  html += "    }\n";
  html += "    function showStats(s) {\n";
  html += "      var html = '';\n";
  html += "      html += '<div class=\"stat\"><h3>Total Orders</h3><div class=\"value\">' + s.totalOrders + '</div></div>';\n";
  html += "      html += '<div class=\"stat\"><h3>Pending</h3><div class=\"value\">' + s.pendingOrders + '</div></div>';\n";
  html += "      html += '<div class=\"stat\"><h3>Completed</h3><div class=\"value\">' + s.completedOrders + '</div></div>';\n";
  html += "      html += '<div class=\"stat\"><h3>Active Techs</h3><div class=\"value\">' + s.activeTechnicians + '</div></div>';\n";
  html += "      document.getElementById('statsDiv').innerHTML = html;\n";
  html += "    }\n";
  html += "    function showOrders(orders) {\n";
  html += "      var html = '<thead><tr><th>Title</th><th>Status</th><th>Priority</th></tr></thead><tbody>';\n";
  html += "      for (var i = 0; i < orders.length; i++) {\n";
  html += "        html += '<tr><td>' + orders[i].title + '</td><td>' + orders[i].status + '</td><td>' + orders[i].priority + '</td></tr>';\n";
  html += "      }\n";
  html += "      html += '</tbody>';\n";
  html += "      document.getElementById('ordersTable').innerHTML = html;\n";
  html += "    }\n";
  html += "    function showTechs(techs) {\n";
  html += "      var html = '<thead><tr><th>Name</th><th>Status</th></tr></thead><tbody>';\n";
  html += "      for (var i = 0; i < techs.length; i++) {\n";
  html += "        html += '<tr><td>' + techs[i].name + '</td><td>' + techs[i].status + '</td></tr>';\n";
  html += "      }\n";
  html += "      html += '</tbody>';\n";
  html += "      document.getElementById('techsTable').innerHTML = html;\n";
  html += "    }\n";
  html += "    function handleLogout() {\n";
  html += "      currentUser = null;\n";
  html += "      document.getElementById('loginDiv').style.display = 'block';\n";
  html += "      document.getElementById('dashDiv').classList.remove('show');\n";
  html += "      document.getElementById('username').value = '';\n";
  html += "      document.getElementById('password').value = '';\n";
  html += "    }\n";
  html += "  </script>\n";
  html += "</body>\n";
  html += "</html>\n";
  return html;
}
