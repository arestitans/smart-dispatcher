# 🚀 DEPLOY NOW: Google Apps Script + Sheets Step-by-Step (15 minutes)

## STEP 1: Create Google Sheet (2 minutes)

1. Go to [https://sheets.google.com](https://sheets.google.com)
2. Click **+ Create new spreadsheet**
3. Name it: `Smart Dispatcher Dashboard`
4. Click the **Share** button (top right)
5. Change to **"Anyone with the link"** → **Editor**
6. **Copy the Sheet ID from the URL**
   - URL looks like: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`
   - Copy everything between `/d/` and `/edit`
   - Save this ID somewhere safe 📝

---

## STEP 2: Add Sheets (1 minute)

At the bottom of your spreadsheet, you should see "Sheet1". 

**Rename it to: `Users`**

Then **add 3 more sheets:**
1. Right-click on sheet tab
2. Select **Duplicate** or **Insert sheet**
3. Create: `Orders`, `Technicians`, `Settings`

**Your tabs should now be:** Users | Orders | Technicians | Settings

---

## STEP 3: Add Headers (2 minutes)

**In Users sheet, Row 1, add headers:**
```
A1: id
B1: username
C1: password
D1: role
E1: email
F1: name
```

**In Orders sheet, Row 1:**
```
A1: id
B1: title
C1: description
D1: status
E1: priority
F1: assignedTo
G1: createdAt
H1: dueDate
```

**In Technicians sheet, Row 1:**
```
A1: id
B1: name
C1: email
D1: phone
E1: status
F1: assignedOrders
G1: completedOrders
H1: rating
```

**In Settings sheet, Row 1:**
```
A1: key
B1: value
```

---

## STEP 4: Add Sample Data (2 minutes)

**Users sheet, add these demo users:**
```
Row 2: user1 | admin | admin123 | Admin | admin@dashboard.com | Administrator
Row 3: user2 | supervisor | super123 | Supervisor | supervisor@dashboard.com | John Supervisor
Row 4: user3 | helpdesk | help123 | Helpdesk | help@dashboard.com | Marie Helpdesk
Row 5: user4 | guest | guest123 | Guest | guest@dashboard.com | Guest User
```

**Technicians sheet, add some techs:**
```
Row 2: tech1 | Ahmed Hassan | ahmed@company.com | +1234567890 | active | 3 | 12 | 4.8
Row 3: tech2 | Sarah Ahmed | sarah@company.com | +9876543210 | active | 2 | 8 | 4.6
Row 4: tech3 | Karim Mohamed | karim@company.com | +1112223333 | on-leave | 0 | 15 | 5.0
```

**Orders sheet, add some orders:**
```
Row 2: order1 | Router Setup | Install new ADSL router | pending | high | tech1 | 2024-01-15 | 2024-01-20
Row 3: order2 | WiFi Issues | Fix weak WiFi signal | in-progress | medium | tech2 | 2024-01-16 | 2024-01-22
Row 4: order3 | Line Issues | Internet line down | urgent | high | unassigned | 2024-01-17 | 2024-01-18
Row 5: order4 | Maintenance | Monthly maintenance | completed | low | tech3 | 2024-01-01 | 2024-01-15
```

**Settings sheet:**
```
Row 2: deployed_date | 2024-01-17
Row 3: version | 1.0
Row 4: admin_chat_id | YOUR_CHAT_ID (add later)
```

---

## STEP 5: Create Google Apps Script (3 minutes)

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. A new tab opens with `Code.gs`
3. **DELETE** the existing code (the `function myFunction...` part)
4. Go to [CODE_GOOGLE_APPS_SCRIPT_COMPLETE.md](CODE_GOOGLE_APPS_SCRIPT_COMPLETE.md) in this repo
5. **COPY** the entire code block (starting from `// SMART DISPATCHER`)
6. **PASTE** into your `Code.gs` file
7. Click **Save**

---

## STEP 6: Configure Your IDs (2 minutes)

Now you need to add your Sheet ID:

1. In `Code.gs`, find line 4: `const SHEET_ID = "YOUR_SHEET_ID_HERE";`
2. Replace `YOUR_SHEET_ID_HERE` with your Sheet ID (from Step 1)
3. For now, leave BOT_TOKEN as is (we'll set this up later for Telegram)
4. Click **Save**

---

## STEP 7: Deploy as Web App (2 minutes)

1. Click **Deploy** (top right button)
2. Click **New deployment** (or if you see a dropdown, select "Web app")
3. Select type: **Web app**
4. Configuration:
   - Execute as: **[Your email]**
   - With access for: **Anyone**
5. Click **Deploy**
6. You'll see a popup: "New deployment created"
7. **Copy the URL** - this is your dashboard!
8. It looks like: `https://script.google.com/macros/d/YOUR_SCRIPT_ID/userweb`
9. Click **Done**

---

## STEP 8: Test Your Dashboard! (2 minutes)

1. **Open the deployment URL** in a new browser tab
2. You should see the login page
3. Try logging in with:
   - Username: `admin`
   - Password: `admin123`
4. ✅ If you see the dashboard with stats and tables, it's working!

**Test the dashboard:**
- [ ] Login works
- [ ] Dashboard shows stats (total orders, pending, etc.)
- [ ] Orders table displays
- [ ] Technicians table displays
- [ ] Logout works

---

## STEP 9: Setup Telegram Bot (Optional but Recommended) (3 minutes)

### Get Bot Token:

1. Open Telegram
2. Find bot: **@BotFather**
3. Send: `/newbot`
4. Give it a name: `Smart Dispatcher`
5. Give it a username: `smart_dispatcher_bot` (or any unique name)
6. @BotFather gives you a token: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`
7. **Copy this token**

### Get Your Chat ID:

1. Find bot: **@userinfobot**
2. Click **Start**
3. It shows your **Chat ID** (a number like `123456789`)
4. **Copy this ID**

### Setup in Google Apps Script:

1. Go back to your `Code.gs`
2. Find line 5: `const BOT_TOKEN = "YOUR_BOT_TOKEN_HERE";`
3. Replace with your token from @BotFather
4. Find line 40: `const adminChatId = "YOUR_ADMIN_CHAT_ID";`
5. Replace with your Chat ID from @userinfobot
6. Click **Save**

### Deploy Update:

1. Click **Deploy** again
2. Select "New deployment"
3. Follow same steps as before
4. Get new URL

### Set Telegram Webhook:

1. In Apps Script, open **Execution log** (click clock icon)
2. No need to run anything - the webhook will be set automatically
3. Or paste this in Telegram to @BotFather:
   ```
   /setwebhook
   https://script.google.com/macros/d/YOUR_SCRIPT_ID/userweb?telegram=true
   ```

---

## 🎉 YOU'RE LIVE!

Your Smart Dispatcher dashboard is now:
- ✅ Online (Google Apps Script hosts it)
- ✅ Always free ($0/month forever)
- ✅ No credit card ever needed
- ✅ Your data in Google Sheets (you control it)
- ✅ Telegram notifications (optional)
- ✅ No external dependencies

---

## 📱 Share the Dashboard

Your deployment URL is like:
```
https://script.google.com/macros/d/YOUR_SCRIPT_ID/userweb
```

**Share this link with anyone:**
- Give friends the URL
- They login with: admin / admin123 (or create new users in your sheet)
- They see the dashboard
- No installation needed!

---

## 🔧 Adding More Users

Just add rows to your **Users sheet**:
```
id | username | password | role | email | name
new_id | new_user | pass123 | Guest | user@email.com | John Doe
```

Next time they login with those credentials!

---

## 🚀 Next Steps (Optional Enhancements)

1. **Customize the look**: Edit the CSS in `getWebApp()` function
2. **Add more features**: Create new `doGet` endpoints
3. **Setup Telegram commands**: /orders, /stats, /help already work!
4. **Schedule reports**: Use `ScriptApp.newTrigger()` to email reports

---

## ❌ Troubleshooting

**"Sheet not found" error:**
- Check your SHEET_ID is correct
- Check sheet names exactly match: Users, Orders, Technicians, Settings

**Login not working:**
- Make sure row 2 of Users sheet has: `user1 | admin | admin123 | Admin | admin@dashboard.com | Administrator`
- Check spacing in data

**"Permission denied":**
- Click Deploy → Manage deployments
- Make sure "With access for" is set to "Anyone"

**Telegram not working:**
- Make sure BOT_TOKEN is set correctly (no spaces)
- Make sure adminChatId is your chat ID (number only, no quotes)

---

## 📊 Your Dashboard Features

- ✅ Login system (4 demo users)
- ✅ Dashboard stats (total orders, pending, completed, etc.)
- ✅ Orders management (view and update)
- ✅ Technician management (view assignments and ratings)
- ✅ Real-time data from Google Sheets
- ✅ Telegram bot for notifications
- ✅ Fully responsive design
- ✅ Beautiful modern UI
- ✅ No monthly costs

**That's it! Enjoy your free Smart Dispatcher dashboard!** 🎊

