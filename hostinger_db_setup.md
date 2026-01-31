# Hostinger Database Setup Guide

Follow these steps to host your database on Hostinger and connect to it from your local machine.

## Step 1: Create the Database on Hostinger
1.  Log in to your **Hostinger hPanel**.
2.  Go to **Databases** -> **Management**.
3.  Create a **New MySQL Database**:
    *   **Database Name**: e.g., `u123456789_realm_crm` (Hostinger adds a prefix like `u123..._`).
    *   **Username**: e.g., `u123456789_admin`.
    *   **Password**: Create a strong password. **Write this down!**
4.  Click **Create**.

## Step 2: Enable Remote MySQL (Crucial for Local Development)
By default, Hostinger blocks outside connections for security. You must allow your computer's IP.
1.  In hPanel, go to **Databases** -> **Remote MySQL**.
2.  In the **IP (IPv4 or IPv6)** field, select **Any Host (%)** OR check "Add my current IP" (checking "Any Host" is easier for testing but less secure long-term).
3.  Select the database you just created.
4.  Click **Create**.

## Step 3: Get Connection Details
Under the "List of Remote MySQL IPs" or "Database Management" section, note down:
*   **Hostname**: It is usually NOT `localhost`. It is an IP address (e.g., `123.45.67.89`) or a domain like `sql.hostinger.com`. Look for "External Host" or "Remote MySQL Host".
*   **Port**: Usually `3306`.

## Step 4: Import the Schema
1.  Go to **Databases** -> **phpMyAdmin**.
2.  Click **Enter phpMyAdmin** for your new database.
3.  Click the **Import** tab.
4.  Choose the file: `backend/schema.sql` from your project folder.
5.  Click **Go** (or **Import**) at the bottom.
    *   *Note: If it complains about `CREATE DATABASE`, you might need to remove the first few lines of `schema.sql` that say `CREATE DATABASE` and `USE`, because Hostinger effectively creates the DB for you.*

## Step 5: Update Your Local Project
1.  Open `backend/.env`.
2.  Update the variables with your Hostinger details:
    ```env
    DB_HOST=123.45.67.89       # The Remote MySQL IP/Host from Step 3
    DB_USER=u123456789_admin   # The username from Step 1
    DB_PASSWORD=your_password  # The password from Step 1
    DB_NAME=u123456789_realm_crm # The database name from Step 1
    ```
3.  **Restart your backend**:
    *   Go to the terminal where `npm start` is running.
    *   Press `Ctrl+C` to stop it.
    *   Run `npm start` again.

## Step 6: Create Admin User (Seeding)
Since you can't run the `node seed.js` easily against a remote DB if the connection is slow or blocked, the easiest way is to Insert the Admin User manually in **phpMyAdmin** or run the seed script locally if the connection works.

**To run seed script locally against Hostinger DB:**
```bash
node backend/src/scripts/seed.js
```
*If this fails due to timeout, you can manually insert the user in phpMyAdmin > SQL tab:*
```sql
INSERT INTO tenants (id, name, subscription_status) VALUES (UUID(), 'My Real Estate', 'active');
-- Copy the ID generated above for the next query
INSERT INTO users (tenant_id, name, email, password_hash, role, status) 
VALUES ('REPLACE_WITH_TENANT_ID', 'Admin', 'admin@demo.com', '$2a$10$YourHashedPasswordHere', 'admin', 'active');
```
*(You can generate a hash for 'password123' online or use the seed script)*
