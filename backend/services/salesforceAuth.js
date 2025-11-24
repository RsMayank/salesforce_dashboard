// backend/services/salesforceAuth.js
const axios = require('axios');
const qs = require('querystring');

const CLIENT_ID = process.env.SF_CLIENT_ID;
const CLIENT_SECRET = process.env.SF_CLIENT_SECRET;
const REDIRECT_URI = process.env.SF_CALLBACK_URL;
const LOGIN_URL = process.env.SF_LOGIN_URL || 'https://login.salesforce.com';
const API_VERSION = process.env.SF_API_VERSION || 'v58.0';

/**
 * Build the authorization URL for the Web Server OAuth flow.
 * NOTE: Ensure SF_LOGIN_URL matches the domain you will use for token exchange (login/test/your MyDomain).
 */
function getAuthUrl() {
    const params = {
        response_type: 'code',
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        prompt: 'consent' // ensures refresh_token granted on first auth (user will be prompted)
    };
    return `${LOGIN_URL}/services/oauth2/authorize?${qs.stringify(params)}`;
}

/**
 * Exchange authorization code for tokens.
 * Throws an error and logs Salesforce response body on failure.
 */
async function exchangeCodeForToken(code) {
    const tokenUrl = `${LOGIN_URL}/services/oauth2/token`;
    const body = {
        grant_type: 'authorization_code',
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI
    };

    try {
        const resp = await axios.post(tokenUrl, qs.stringify(body), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 20000
        });
        // resp.data contains: access_token, refresh_token (if granted), instance_url, id, issued_at, signature
        return resp.data;
    } catch (err) {
        // Helpful debug logs to paste here if you need further help
        console.error('--- TOKEN EXCHANGE ERROR START ---');
        console.error('tokenUrl:', tokenUrl);
        console.error('request (masked):', {
            client_id: CLIENT_ID ? (CLIENT_ID.slice(0, 8) + '...') : 'MISSING',
            redirect_uri: REDIRECT_URI
        });
        if (err.response) {
            console.error('status:', err.response.status);
            // Print full Salesforce JSON response if any
            console.error('body:', JSON.stringify(err.response.data, null, 2));
        } else {
            console.error('no response from server, error:', err.message);
        }
        console.error('--- TOKEN EXCHANGE ERROR END ---');
        // Re-throw so caller route can return a 500 with details (or handle as needed)
        throw err;
    }
}

/**
 * Refresh an access token using refresh_token.
 * Returns new token data (access_token and possibly instance_url).
 */
async function refreshAccessToken(refreshToken) {
    if (!refreshToken) throw new Error('Missing refreshToken for token refresh');

    const tokenUrl = `${LOGIN_URL}/services/oauth2/token`;
    const body = {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
    };

    try {
        const resp = await axios.post(tokenUrl, qs.stringify(body), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 20000
        });
        return resp.data;
    } catch (err) {
        console.error('--- TOKEN REFRESH ERROR START ---');
        console.error('tokenUrl:', tokenUrl);
        console.error('request (masked):', {
            client_id: CLIENT_ID ? (CLIENT_ID.slice(0, 8) + '...') : 'MISSING'
        });
        if (err.response) {
            console.error('status:', err.response.status);
            console.error('body:', JSON.stringify(err.response.data, null, 2));
        } else {
            console.error('no response from server, error:', err.message);
        }
        console.error('--- TOKEN REFRESH ERROR END ---');
        throw err;
    }
}

module.exports = {
    getAuthUrl,
    exchangeCodeForToken,
    refreshAccessToken
};
