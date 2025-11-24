require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const salesforceRoutes = require('./routes/salesforce');

const app = express();
app.get('/', (req, res) => {
  res.send(`
    <h2>Salesforce Dashboard Backend</h2>
    <p><a href="/auth/login">Log in to Salesforce (start OAuth)</a></p>
    <p>API: <a href="/api/opportunities">/api/opportunities</a></p>
  `);
});

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/', salesforceRoutes);

const port = process.env.APP_PORT || 3001;
app.listen(port, () => console.log(`Backend listening on http://localhost:${port}`));
