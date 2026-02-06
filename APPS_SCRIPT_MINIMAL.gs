// SMART DISPATCHER - MINIMAL WORKING VERSION
const SHEET_ID = "1zBLh6vHePpqwfo05xZQfo16xY7_DNTB7vUSGPlyth_Y";

function doGet(e) {
  if (!e.parameter.action) {
    return HtmlService.createHtmlOutput(getWebApp()).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  
  if (e.parameter.action === "getOrders") {
    return jsonResponse({ success: true, data: getOrdersList() });
  }
  if (e.parameter.action === "getTechnicians") {
    return jsonResponse({ success: true, data: getTechniciansList() });
  }
  if (e.parameter.action === "getDashboard") {
    return jsonResponse({ success: true, data: getDashboardStats() });
  }
  return jsonResponse({ success: false, error: "Unknown action" });
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    if (data.action === "login") {
      return jsonResponse(authenticateUser(data.username, data.password));
    }
    
    return jsonResponse({ success: false, error: "Unknown action" });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function authenticateUser(username, password) {
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
            name: data[i][5] || username
          }
        };
      }
    }
    return { success: false, message: "Invalid credentials" };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function getOrdersList() {
  try {
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("Orders");
    var data = sheet.getDataRange().getValues();
    var orders = [];
    for (var i = 1; i < data.length; i++) {
      if (data[i][0]) {
        orders.push({ id: data[i][0], title: data[i][1], status: data[i][3], priority: data[i][4], assignedTo: data[i][5] });
      }
    }
    return orders;
  } catch (e) {
    return [];
  }
}

function getTechniciansList() {
  try {
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("Technicians");
    var data = sheet.getDataRange().getValues();
    var techs = [];
    for (var i = 1; i < data.length; i++) {
      if (data[i][0]) {
        techs.push({ id: data[i][0], name: data[i][1], status: data[i][4], assignedOrders: data[i][5], rating: data[i][7] });
      }
    }
    return techs;
  } catch (e) {
    return [];
  }
}

function getDashboardStats() {
  try {
    var orders = getOrdersList();
    var techs = getTechniciansList();
    return {
      totalOrders: orders.length,
      pendingOrders: orders.filter(function(o) { return o.status === "pending"; }).length,
      completedOrders: orders.filter(function(o) { return o.status === "completed"; }).length,
      activeTechnicians: techs.filter(function(t) { return t.status === "active"; }).length
    };
  } catch (e) {
    return { totalOrders: 0, pendingOrders: 0, completedOrders: 0, activeTechnicians: 0 };
  }
}

function getWebApp() {
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;background:linear-gradient(135deg,#667eea,#764ba2);min-height:100vh}.container{max-width:1200px;margin:0 auto;padding:20px}.login{background:white;border-radius:15px;box-shadow:0 15px 50px rgba(0,0,0,.3);padding:50px;max-width:400px;margin:100px auto}h1{color:#333;margin-bottom:10px}p{color:#666;margin-bottom:30px}.form-group{margin-bottom:20px}label{display:block;color:#333;font-weight:600;margin-bottom:8px}input{width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:8px;font-size:14px}input:focus{outline:0;border-color:#667eea}.btn{width:100%;padding:12px;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:0;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer}.dashboard{display:none;background:white;border-radius:15px;box-shadow:0 15px 50px rgba(0,0,0,.3);padding:30px}.dashboard.active{display:block}.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:30px;border-bottom:2px solid #f0f0f0;padding-bottom:20px}.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;margin-bottom:30px}.stat{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;padding:25px;border-radius:12px;text-align:center}.stat h3{font-size:14px;opacity:.9;margin-bottom:10px}.stat .value{font-size:36px;font-weight:bold}table{width:100%;border-collapse:collapse}th,td{padding:12px;text-align:left;border-bottom:1px solid #f0f0f0}th{background:#f8f9fa;font-weight:600;color:#333}.error{color:#dc3545;margin-top:10px}</style></head><body><div class="container"><div class="login" id="login"><h1>Smart Dispatcher</h1><p>Google Sheets Dashboard</p><form onsubmit="login(event)"><div class="form-group"><label>Username</label><input type="text" id="user" required></div><div class="form-group"><label>Password</label><input type="password" id="pass" required></div><button type="submit" class="btn">Login</button><div id="err"></div></form><p style="margin-top:20px;color:#999;font-size:12px;text-align:center">admin / admin123</p></div><div class="dashboard" id="dash"><div class="header"><h1>Dashboard</h1><button class="btn" onclick="logout()" style="width:100px">Logout</button></div><div class="stats" id="stats"></div><div style="margin:30px 0"><h2>Orders</h2><table id="orders"></table></div><div style="margin:30px 0"><h2>Technicians</h2><table id="techs"></table></div></div></div><script>var user=null;function login(e){e.preventDefault();fetch(location.href,{method:"POST",body:JSON.stringify({action:"login",username:document.getElementById("user").value,password:document.getElementById("pass").value})}).then(r=>r.json()).then(d=>{if(d.success){user=d.user;loadDash()}else document.getElementById("err").innerHTML="<div class=error>"+d.message+"</div>"}).catch(e=>document.getElementById("err").innerHTML="<div class=error>Error: "+e+"</div>")}function loadDash(){document.getElementById("login").style.display="none";document.getElementById("dash").classList.add("active");fetch(location.href+"?action=getDashboard").then(r=>r.json()).then(d=>showStats(d.data));fetch(location.href+"?action=getOrders").then(r=>r.json()).then(d=>showOrders(d.data));fetch(location.href+"?action=getTechnicians").then(r=>r.json()).then(d=>showTechs(d.data))}function showStats(s){var h="<div class=stat><h3>Total Orders</h3><div class=value>"+s.totalOrders+"</div></div><div class=stat><h3>Pending</h3><div class=value>"+s.pendingOrders+"</div></div><div class=stat><h3>Completed</h3><div class=value>"+s.completedOrders+"</div></div><div class=stat><h3>Active Techs</h3><div class=value>"+s.activeTechnicians+"</div></div>";document.getElementById("stats").innerHTML=h}function showOrders(o){var h="<thead><tr><th>Title</th><th>Status</th></tr></thead><tbody>";o.forEach(x=>h+="<tr><td>"+x.title+"</td><td>"+x.status+"</td></tr>");h+="</tbody>";document.getElementById("orders").innerHTML=h}function showTechs(t){var h="<thead><tr><th>Name</th><th>Status</th></tr></thead><tbody>";t.forEach(x=>h+="<tr><td>"+x.name+"</td><td>"+x.status+"</td></tr>");h+="</tbody>";document.getElementById("techs").innerHTML=h}function logout(){user=null;document.getElementById("login").style.display="block";document.getElementById("dash").classList.remove("active");document.getElementById("user").value="";document.getElementById("pass").value=""}</script></body></html>';
}
';
