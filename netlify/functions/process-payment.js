// Payment Processing Function
// Handles Stripe payments securely

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { amount, currency, orderId, customerEmail } = JSON.parse(event.body);

    // Validate input
    if (!amount || !currency || !orderId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required payment data' })
      };
    }

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        orderId: orderId,
        source: 'peptideplaza'
      },
      receipt_email: customerEmail,
      description: `PeptidePlaza Order ${orderId}`
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      })
    };

  } catch (error) {
    console.error('Payment processing error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Payment processing failed',
        details: error.message
      })
    };
  }
};
