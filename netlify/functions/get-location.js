// Geolocation Function
// More reliable server-side geolocation

exports.handler = async (event, context) => {
  try {
    // Get client IP from Netlify context
    const clientIP = event.headers['x-nf-client-connection-ip'] ||
                     event.headers['client-ip'] ||
                     event.headers['x-forwarded-for'];

    // For development/testing, return default location
    if (!clientIP || clientIP === '127.0.0.1' || clientIP === '::1') {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          country: 'TH',
          countryName: 'Thailand',
          city: 'Bangkok',
          currency: 'THB',
          detected: false
        })
      };
    }

    const fetch = require('node-fetch');

    // Use ipapi.co (free tier: 1000 requests/day)
    const response = await fetch(`https://ipapi.co/${clientIP}/json/`);

    if (!response.ok) {
      throw new Error('Geolocation API failed');
    }

    const data = await response.json();

    // Map country to currency
    const countryToCurrency = {
      'TH': 'THB', 'US': 'USD', 'GB': 'GBP', 'AU': 'AUD',
      'CA': 'CAD', 'SG': 'SGD', 'JP': 'JPY', 'CN': 'CNY',
      'KR': 'KRW', 'IN': 'INR', 'MY': 'MYR', 'PH': 'PHP',
      'VN': 'VND', 'ID': 'IDR',
      'DE': 'EUR', 'FR': 'EUR', 'IT': 'EUR', 'ES': 'EUR',
      'NL': 'EUR', 'AT': 'EUR', 'BE': 'EUR'
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600'
      },
      body: JSON.stringify({
        country: data.country_code || 'TH',
        countryName: data.country_name || 'Thailand',
        city: data.city,
        region: data.region,
        currency: countryToCurrency[data.country_code] || 'THB',
        timezone: data.timezone,
        detected: true
      })
    };

  } catch (error) {
    console.error('Geolocation error:', error);

    // Return default location on error
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        country: 'TH',
        countryName: 'Thailand',
        city: 'Bangkok',
        currency: 'THB',
        detected: false,
        error: 'Using default location'
      })
    };
  }
};
