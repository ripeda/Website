// File: api/log-access.js (for Vercel) or netlify/functions/log-access.js (for Netlify)

// For Vercel:
export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    
    try {
        const { storeCode, timestamp, userAgent } = req.body;
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        
        // Create log entry
        const logEntry = {
            storeCode,
            timestamp,
            userAgent,
            ip: ip.split(',')[0], // Handle multiple IPs
            accessTime: new Date().toISOString()
        };
        
        // Here you would typically save to a database
        // For now, we'll just log to console (visible in Vercel/Netlify logs)
        console.log('Business Resources Access:', JSON.stringify(logEntry, null, 2));
        
        // Optional: Send to external service like Google Sheets, Airtable, or database
        // await saveToDatabase(logEntry);
        
        res.status(200).json({ success: true, message: 'Access logged' });
    } catch (error) {
        console.error('Logging error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// For Netlify Functions (alternative implementation):
/*
exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
    
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers };
    }
    
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
    
    try {
        const { storeCode, timestamp, userAgent } = JSON.parse(event.body);
        const ip = event.headers['x-forwarded-for'] || event.headers['client-ip'];
        
        const logEntry = {
            storeCode,
            timestamp,
            userAgent,
            ip: ip ? ip.split(',')[0] : 'unknown',
            accessTime: new Date().toISOString()
        };
        
        console.log('Business Resources Access:', JSON.stringify(logEntry, null, 2));
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, message: 'Access logged' })
        };
    } catch (error) {
        console.error('Logging error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
*/

// Enhanced logging with Google Sheets integration (optional)
async function saveToGoogleSheets(logEntry) {
    // This would require setting up Google Sheets API
    // and storing credentials in environment variables
    const SHEET_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL;
    
    if (!SHEET_URL) return;
    
    try {
        const response = await fetch(SHEET_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logEntry)
        });
        
        if (!response.ok) {
            throw new Error('Failed to log to Google Sheets');
        }
    } catch (error) {
        console.error('Google Sheets logging failed:', error);
    }
}

// Environment variables you'll need to set:
// GOOGLE_SHEET_WEBHOOK_URL - for Google Sheets integration
// DATABASE_URL - if using a database like PostgreSQL or MongoDB