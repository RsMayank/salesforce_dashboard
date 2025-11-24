const axios = require('axios');
const sfAuth = require('./salesforceAuth');

/**
 * Minimal in-memory token store for demo.
 * Replace with DB per-user in production.
 */
const tokenStore = {}; // { userId: { accessToken, refreshToken, instanceUrl, expiresAt } }

/**
 * Helper to perform SOQL query (auto-refreshing token if needed)
 * @param {object} params
 *   - accessToken, instanceUrl, refreshToken
 */
async function soqlQuery({ accessToken, instanceUrl, refreshToken, soql }) {
    try {
        const url = `${instanceUrl}/services/data/v58.0/query?q=${encodeURIComponent(soql)}`;
        const resp = await axios.get(url, {
            headers: { Authorization: `Bearer ${accessToken}` },
            timeout: 15000
        });
        return resp.data;
    } catch (err) {
        // If token expired, refresh and retry once
        const status = err.response?.status;
        const body = err.response?.data;
        if ((status === 401 || body?.error === 'invalid_grant' || body?.error_description?.includes('expired')) && refreshToken) {
            console.log('Access token expired; attempting refresh');
            const tokenData = await sfAuth.refreshAccessToken(refreshToken);
            // The caller should persist tokenData; for demo return tokenData and re-run
            const newAccess = tokenData.access_token;
            const newInstance = tokenData.instance_url || instanceUrl;
            const retryUrl = `${newInstance}/services/data/v58.0/query?q=${encodeURIComponent(soql)}`;
            const resp = await axios.get(retryUrl, {
                headers: { Authorization: `Bearer ${newAccess}` },
                timeout: 15000
            });
            // return both data and new tokens so caller may persist
            return { data: resp.data, tokenData };
        }
        throw err;
    }
}

/**
 * Query Opportunities and return processed analytics data for dashboard
 */
async function queryOpportunities({ accessToken, instanceUrl, refreshToken }) {
    const soql = `SELECT Id, Name, StageName, Amount, CloseDate, Owner.Name FROM Opportunity WHERE IsDeleted = false ORDER BY CloseDate DESC LIMIT 200`;
    const result = await soqlQuery({ accessToken, instanceUrl, refreshToken, soql });

    // If token refresh occurred, unpack
    const raw = result.data ? result.data : result;

    // map and prepare some KPI aggregates
    const records = raw.records || [];
    const totalPipeline = records.reduce((s, r) => s + (r.Amount || 0), 0);
    const byStage = records.reduce((acc, r) => {
        acc[r.StageName] = (acc[r.StageName] || 0) + (r.Amount || 0);
        return acc;
    }, {});
    const monthlyTrend = {}; // YYYY-MM -> sum
    records.forEach(r => {
        const monthKey = (new Date(r.CloseDate)).toISOString().slice(0, 7);
        monthlyTrend[monthKey] = (monthlyTrend[monthKey] || 0) + (r.Amount || 0);
    });

    return {
        totals: {
            totalRecords: records.length,
            totalPipeline
        },
        byStage,
        monthlyTrend,
        records,
        tokenData: result.tokenData || null
    };
}

module.exports = { queryOpportunities, soqlQuery };
