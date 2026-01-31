# 🚀 Deployment Guide - Hostinger

This guide will help you deploy Realm CRM to Hostinger with automatic updates from GitHub.

## 📋 Prerequisites

1. **Hostinger Account** with:
   - VPS or Business hosting plan
   - SSH access enabled
   - MySQL database access
   - Node.js support

2. **GitHub Account**
3. **Domain name** (optional, can use Hostinger subdomain)

---

## 🎯 Step 1: Prepare Your Code

### 1.1 Initialize Git Repository (if not done)

```bash
cd d:\AI Studio\7-ZrealetorZ
git init
git add .
git commit -m "Initial commit - Realm CRM"
```

### 1.2 Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository named `realm-crm`
3. **Don't** initialize with README (we already have one)

### 1.3 Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/realm-crm.git
git branch -M main
git push -u origin main
```

---

## 🗄️ Step 2: Setup MySQL Database on Hostinger

### 2.1 Create Database

1. Login to **Hostinger hPanel**
2. Go to **Databases** → **MySQL Databases**
3. Click **Create New Database**
4. Fill in:
   - Database name: `u123456789_realm_crm` (Hostinger adds prefix)
   - Username: `u123456789_admin`
   - Password: (generate strong password)
5. Note down these credentials!

### 2.2 Import Database Schema

1. Go to **phpMyAdmin** (in Hostinger panel)
2. Select your database
3. Click **Import** tab
4. Upload `backend/schema.sql`
5. Click **Go**

### 2.3 Seed Database (Optional)

You can run the seed script later via SSH, or manually insert users via phpMyAdmin.

---

## 🖥️ Step 3: Setup Hostinger VPS/Hosting

### 3.1 Connect via SSH

```bash
ssh u123456789@your-server-ip
# Or use Hostinger's built-in SSH terminal
```

### 3.2 Install Node.js (if not installed)

```bash
# Check if Node.js is installed
node --version

# If not installed, install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 3.3 Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

---

## 📦 Step 4: Deploy Backend

### 4.1 Clone Repository

```bash
cd ~/domains/your-domain.com/public_html
# Or wherever you want to deploy

git clone https://github.com/YOUR_USERNAME/realm-crm.git
cd realm-crm/backend
```

### 4.2 Install Dependencies

```bash
npm install --production
```

### 4.3 Create Production .env File

```bash
nano .env
```

Add your production credentials:

```env
DB_HOST=localhost
DB_USER=u123456789_admin
DB_PASSWORD=your_database_password
DB_NAME=u123456789_realm_crm
JWT_SECRET=your-super-secret-production-key-change-this
PORT=5000
NODE_ENV=production
```

Save with `Ctrl+X`, then `Y`, then `Enter`

### 4.4 Start Backend with PM2

```bash
pm2 start working-server.js --name realm-crm-api
pm2 save
pm2 startup
```

### 4.5 Verify Backend is Running

```bash
pm2 status
pm2 logs realm-crm-api
```

Test the API:
```bash
curl http://localhost:5000/
```

---

## 🎨 Step 5: Deploy Frontend

### 5.1 Update API URL

Before building, update the API URL in `frontend/src/api/axios.js`:

```javascript
const api = axios.create({
    baseURL: 'https://your-domain.com/api',  // Your production API URL
    headers: {
        'Content-Type': 'application/json',
    },
});
```

### 5.2 Build Frontend

```bash
cd ~/domains/your-domain.com/public_html/realm-crm/frontend
npm install
npm run build
```

### 5.3 Configure Web Server

#### Option A: Using Apache (.htaccess)

Create `.htaccess` in `dist` folder:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

#### Option B: Using Nginx

Add to your nginx config:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/realm-crm/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5.4 Copy Build Files

```bash
# If using public_html
cp -r dist/* ~/domains/your-domain.com/public_html/
```

---

## 🔄 Step 6: Auto-Deployment with GitHub

### 6.1 Create Deployment Script

```bash
cd ~/domains/your-domain.com/public_html/realm-crm
nano deploy.sh
```

Add this script:

```bash
#!/bin/bash

echo "🚀 Starting deployment..."

# Pull latest changes
git pull origin main

# Backend deployment
echo "📦 Updating backend..."
cd backend
npm install --production
pm2 restart realm-crm-api

# Frontend deployment
echo "🎨 Building frontend..."
cd ../frontend
npm install
npm run build
cp -r dist/* ~/domains/your-domain.com/public_html/

echo "✅ Deployment complete!"
```

Make it executable:
```bash
chmod +x deploy.sh
```

### 6.2 Setup GitHub Webhook (Optional)

For automatic deployment on push:

1. Install webhook listener:
```bash
npm install -g github-webhook-handler
```

2. Create webhook server (advanced - optional)

---

## 🔧 Step 7: Manual Deployment Process

Whenever you make changes:

### On Your Local Machine:

```bash
# 1. Make your changes
# 2. Test locally
# 3. Commit and push

git add .
git commit -m "Description of changes"
git push origin main
```

### On Hostinger Server:

```bash
# SSH into server
ssh u123456789@your-server-ip

# Navigate to project
cd ~/domains/your-domain.com/public_html/realm-crm

# Run deployment script
./deploy.sh
```

---

## 🔒 Step 8: Security & SSL

### 8.1 Enable SSL Certificate

1. In Hostinger hPanel
2. Go to **SSL** section
3. Enable **Free SSL** (Let's Encrypt)
4. Wait for activation (few minutes)

### 8.2 Update API URL to HTTPS

In `frontend/src/api/axios.js`:
```javascript
baseURL: 'https://your-domain.com/api',
```

Rebuild and redeploy frontend.

---

## 📊 Step 9: Monitoring & Maintenance

### Monitor Backend

```bash
pm2 status
pm2 logs realm-crm-api
pm2 monit
```

### View Error Logs

```bash
pm2 logs realm-crm-api --err
```

### Restart Services

```bash
pm2 restart realm-crm-api
```

### Database Backup

```bash
mysqldump -u u123456789_admin -p u123456789_realm_crm > backup_$(date +%Y%m%d).sql
```

---

## 🎯 Quick Deployment Checklist

- [ ] GitHub repository created and code pushed
- [ ] MySQL database created on Hostinger
- [ ] Database schema imported
- [ ] SSH access to server
- [ ] Node.js and PM2 installed
- [ ] Backend deployed and running
- [ ] Frontend built and deployed
- [ ] API URL updated in frontend
- [ ] SSL certificate enabled
- [ ] Deployment script created
- [ ] Test the live application

---

## 🆘 Troubleshooting

### Backend not starting?
```bash
pm2 logs realm-crm-api
# Check for errors in .env file
```

### Database connection error?
- Verify credentials in `.env`
- Check if MySQL is running
- Ensure database exists

### Frontend shows blank page?
- Check browser console for errors
- Verify API URL is correct
- Check if backend is running

### Can't connect to database remotely?
- Hostinger databases usually only allow localhost
- Use SSH tunnel if needed

---

## 📞 Support

For Hostinger-specific issues:
- Hostinger Support: https://www.hostinger.com/support
- Hostinger Tutorials: https://www.hostinger.com/tutorials

---

## 🎉 Success!

Your Realm CRM should now be live at:
- **Frontend**: https://your-domain.com
- **Backend API**: https://your-domain.com/api

Login with:
- Email: admin@demo.com
- Password: password123

**Don't forget to change the default password in production!**
