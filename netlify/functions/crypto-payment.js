// Cryptocurrency Payment Function
// Handles Bitcoin/Ethereum payments via NOWPayments or CoinGate

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { amount, currency, orderId, customerEmail, crypto } = JSON.parse(event.body);
    const fetch = require('node-fetch');

    // OPTION 1: NOWPayments API
    if (process.env.NOWPAYMENTS_API_KEY) {
      const response = await fetch('https://api.nowpayments.io/v1/payment', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.NOWPAYMENTS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          price_amount: amount,
          price_currency: currency,
          pay_currency: crypto.toUpperCase(), // BTC, ETH, USDT, etc.
          order_id: orderId,
          order_description: `PeptidePlaza Order ${orderId}`,
          ipn_callback_url: `${process.env.URL}/.netlify/functions/crypto-webhook`,
          success_url: `${process.env.URL}/order-success.html?order=${orderId}`,
          cancel_url: `${process.env.URL}/checkout.html`
        })
      });

      const paymentData = await response.json();

      if (!response.ok) {
        throw new Error(paymentData.message || 'Payment creation failed');
      }

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          paymentId: paymentData.payment_id,
          paymentAddress: paymentData.pay_address,
          payAmount: paymentData.pay_amount,
          payCurrency: paymentData.pay_currency,
          paymentUrl: paymentData.payment_url || paymentData.invoice_url,
          expiresAt: paymentData.expiration_estimate_date
        })
      };
    }

    // OPTION 2: CoinGate API
    if (process.env.COINGATE_API_KEY) {
      const response = await fetch('https://api.coingate.com/v2/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.COINGATE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          order_id: orderId,
          price_amount: amount,
          price_currency: currency,
          receive_currency: crypto.toUpperCase(),
          title: `Order ${orderId}`,
          description: 'PeptidePlaza Research Peptides',
          callback_url: `${process.env.URL}/.netlify/functions/crypto-webhook`,
          success_url: `${process.env.URL}/order-success.html?order=${orderId}`,
          cancel_url: `${process.env.URL}/checkout.html`
        })
      });

      const paymentData = await response.json();

      if (!response.ok) {
        throw new Error(paymentData.message || 'Payment creation failed');
      }

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          paymentId: paymentData.id,
          paymentUrl: paymentData.payment_url,
          paymentAddress: paymentData.payment_address,
          payCurrency: paymentData.pay_currency,
          payAmount: paymentData.pay_amount
        })
      };
    }

    // No crypto provider configured
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Cryptocurrency payment provider not configured'
      })
    };

  } catch (error) {
    console.error('Crypto payment error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Crypto payment failed',
        details: error.message
      })
    };
  }
};
