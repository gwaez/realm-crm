# Realm CRM - Real Estate Lead Management System

A modern, full-stack CRM application for real estate lead management built with React, Node.js, Express, and MySQL.

## 🚀 Features

- **Dashboard** - Real-time statistics and analytics
- **Lead Management** - Create, view, update, and track leads
- **Activity Tracking** - Log calls, meetings, emails, and notes
- **Authentication** - Secure JWT-based authentication
- **Responsive Design** - Works on desktop and mobile
- **Multi-tenancy** - Support for multiple real estate offices

## 📋 Tech Stack

### Frontend
- React 18
- React Router v6
- Axios
- Tailwind CSS
- Lucide Icons
- Date-fns

### Backend
- Node.js
- Express.js
- MySQL
- JWT Authentication
- Bcrypt
- CORS

## 🛠️ Installation

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials:
```env
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=realm_crm
JWT_SECRET=your-secret-key
PORT=5000
```

5. Create database and run schema:
```bash
mysql -u your_user -p < schema.sql
```

6. Seed the database (optional):
```bash
node src/scripts/seed.js
```

7. Start the server:
```bash
npm start
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Update API URL in `src/api/axios.js` if needed

4. Start development server:
```bash
npm run dev
```

5. Open browser at `http://localhost:5173`

## 👤 Default Login Credentials

- **Admin**: admin@demo.com / password123
- **Agent**: agent@demo.com / password123

## 📁 Project Structure

```
realm-crm/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth middleware
│   │   ├── routes/         # API routes
│   │   └── scripts/        # Database scripts
│   ├── schema.sql          # Database schema
│   ├── working-server.js   # Main server file
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/            # API configuration
    │   ├── components/     # React components
    │   ├── context/        # React context
    │   ├── layout/         # Layout components
    │   └── pages/          # Page components
    └── package.json
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Leads
- `GET /api/leads` - Get all leads
- `GET /api/leads/:id` - Get single lead
- `POST /api/leads` - Create new lead
- `PUT /api/leads/:id` - Update lead

### Activities
- `GET /api/leads/:leadId/activities` - Get lead activities
- `POST /api/leads/:leadId/activities` - Add activity

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🚀 Deployment

### Hostinger Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## 📝 License

MIT License

## 👨‍💻 Author

Your Name

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
