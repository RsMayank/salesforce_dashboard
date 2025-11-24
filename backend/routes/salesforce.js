const express = require('express');
const router = express.Router();
const sfAuth = require('../services/salesforceAuth');
const sfApi = require('../services/salesforceApi');

// 1) Redirect user to Salesforce auth page
router.get('/auth/login', (req, res) => {
    const authUrl = sfAuth.getAuthUrl();
    res.redirect(authUrl);
});

// 2) OAuth callback
router.get('/auth/callback', async (req, res) => {
    const { code, error, error_description } = req.query;
    if (error) {
        return res.status(400).send({ error, error_description });
    }
    try {
        const tokenData = await sfAuth.exchangeCodeForToken(code);
        // In production you should persist tokenData (refresh_token) securely per user
        // For demo we set them as httpOnly cookies
        res.cookie('sf_access_token', tokenData.access_token, { httpOnly: true, sameSite: 'lax' });
        res.cookie('sf_refresh_token', tokenData.refresh_token || '', { httpOnly: true, sameSite: 'lax' });
        res.cookie('sf_instance_url', tokenData.instance_url, { httpOnly: true, sameSite: 'lax' });
        // redirect back to frontend app
        res.redirect(process.env.FRONTEND_URL + '/?auth=success');
    } catch (err) {
        console.error('Callback error', err.response?.data || err.message || err);
        res.status(500).send({ error: 'token_exchange_failed', details: err.message });
    }
});

// 3) Example API: get opportunities (calls Salesforce with token)
router.get('/api/opportunities', async (req, res) => {
    try {
        // In demo we read tokens from cookies. In real app read from DB/session.
        const accessToken = req.cookies?.sf_access_token;
        const refreshToken = req.cookies?.sf_refresh_token;
        const instanceUrl = req.cookies?.sf_instance_url;

        if (!accessToken || !instanceUrl) {
            return res.status(401).json({ error: 'not_authenticated' });
        }

        const data = await sfApi.queryOpportunities({ accessToken, instanceUrl, refreshToken });
        res.json(data);
    } catch (err) {
        console.error('Opportunities error', err);
        res.status(500).json({ error: 'fetch_failed', details: err.message || err });
    }
});

module.exports = router;
