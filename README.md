# 🚀 Salesforce Dashboard (Next.js + Node.js + Salesforce OAuth2)

A full-stack analytics dashboard built with **Next.js (App Router)**, **Node.js + Express**, and **Salesforce OAuth2**.  
This app connects to Salesforce, fetches **Opportunities**, and displays a modern dashboard with charts, KPIs, and tables.


## 📸 Features

### 🔐 Salesforce Authentication
- OAuth 2.0 Web Server Flow  
- Auto token refresh  
- Secure cookie-based session  

### 📊 Analytics Dashboard
- Opportunity pipeline by stage  
- Monthly revenue trend  
- KPI cards (Total Pipeline, Total Opps, Active Quotes, Closed Won)  
- Latest opportunities table  
- Fully responsive UI  
- Built with **Recharts + TailwindCSS**


## 📁 Folder Structure

salesforce_dashboard/
│
├── backend/                # Express API server
│   ├── routes/
│   ├── services/
│   ├── server.js
│   ├── .env
│   └── package.json
│
└── frontend/               # Next.js web app
    ├── app/
    │   ├── page.tsx
    │   ├── layout.tsx
    │   └── globals.css
    ├── components/
    │   └── Dashboard.tsx
    ├── public/
    ├── .env.local
    └── package.json


## 1️⃣ Clone the Repository
git clone https://github.com/RsMayank/salesforce_dashboard.git
cd salesforce_dashboard


## 🔐 Salesforce Connected App Setup

Go to Salesforce Setup → App Manager → New Connected App

Enable:
- OAuth settings  
- Web Server Flow  
- Require secret for web server flow  
- Refresh token  

Callback URL:
http://localhost:3001/auth/callback

Scopes:
- Full (full)
- Refresh token / offline access
- Access identity URL
- Access Lightning applications


## 🧩 Backend Setup (Express)

cd backend
npm install

Create .env:

SF_CLIENT_ID=YOUR_CLIENT_ID
SF_CLIENT_SECRET=YOUR_CLIENT_SECRET
SF_CALLBACK_URL=http://localhost:3001/auth/callback
SF_LOGIN_URL=https://login.salesforce.com

APP_PORT=3001
FRONTEND_URL=http://localhost:3000

SESSION_SECRET=a_super_secret_key

Start backend:
npm run dev



## 🎨 Frontend Setup (Next.js)

cd frontend
npm install

Create .env.local:
NEXT_PUBLIC_API_URL=http://localhost:3001

Start frontend:
npm run dev

Frontend: http://localhost:3000


## 🔄 Full Flow

1. Open http://localhost:3000  
2. Click Login with Salesforce  
3. Approve Salesforce OAuth  
4. App returns to frontend  
5. Dashboard loads Salesforce data  


## 🧪 API Endpoints

GET /auth/login           → Redirects to Salesforce
GET /auth/callback        → Handles OAuth response
GET /api/opportunities    → Fetches Opportunity analytics

✅ Troubleshooting

invalid_client_id / invalid_client → Verify SF_CLIENT_ID and SF_CLIENT_SECRET are copied exactly from Connected App. Use the Copy button in Salesforce to avoid hidden characters.

invalid_grant / redirect_uri_mismatch → Ensure SF_CALLBACK_URL matches the Connected App callback exactly (protocol, host, port, trailing slash).

Cookies not set / CORS issues → Ensure backend cors is configured: origin matches FRONTEND_URL and credentials: true. Frontend fetch must use { credentials: 'include' }.

ERR_CONNECTION_REFUSED → Start backend and confirm it listens on port 3001.

## 🚧 Future Enhancements

- AI-powered summary (Einstein GPT / ChatGPT)
- Real-time filters (date range, owners)
- DB token persistence
- Redis caching for Salesforce calls
- Deployment (Vercel + Render)


