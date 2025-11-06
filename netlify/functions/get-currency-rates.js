// Real-time Currency Conversion Function
// Fetches live exchange rates from API

exports.handler = async (event, context) => {
  try {
    const fetch = require('node-fetch');

    // Use ExchangeRate-API (free tier available)
    // Sign up at https://www.exchangerate-api.com/
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;

    if (!apiKey) {
      // Return static rates if no API key
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
        },
        body: JSON.stringify({
          base: 'THB',
          rates: {
            'THB': 1.00,
            'USD': 0.028,
            'EUR': 0.026,
            'GBP': 0.022,
            'AUD': 0.042,
            'CAD': 0.038,
            'SGD': 0.038,
            'JPY': 4.12,
            'CNY': 0.20,
            'KRW': 37.5,
            'INR': 2.35,
            'MYR': 0.13,
            'PHP': 1.58,
            'VND': 690,
            'IDR': 430
          },
          lastUpdated: new Date().toISOString()
        })
      };
    }

    // Fetch live rates
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/THB`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      },
      body: JSON.stringify({
        base: 'THB',
        rates: data.conversion_rates,
        lastUpdated: data.time_last_update_utc
      })
    };

  } catch (error) {
    console.error('Currency API error:', error);

    // Return fallback rates on error
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        base: 'THB',
        rates: {
          'THB': 1.00,
          'USD': 0.028,
          'EUR': 0.026,
          'GBP': 0.022,
          'AUD': 0.042,
          'CAD': 0.038,
          'SGD': 0.038,
          'JPY': 4.12,
          'CNY': 0.20,
          'KRW': 37.5,
          'INR': 2.35
        },
        lastUpdated: new Date().toISOString(),
        fallback: true
      })
    };
  }
};
