// Create Order Function
// Handles order creation and stores in Airtable/Google Sheets/etc.

const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const orderData = JSON.parse(event.body);

    // Validate order data
    if (!orderData.items || !orderData.customer) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required order data' })
      };
    }

    // Generate order ID
    const orderId = `PEP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Prepare order object
    const order = {
      orderId: orderId,
      customer: orderData.customer,
      items: orderData.items,
      subtotal: orderData.subtotal,
      shipping: orderData.shipping,
      total: orderData.total,
      currency: orderData.currency,
      country: orderData.country,
      paymentMethod: orderData.paymentMethod,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Store order in your database (choose one):

    // OPTION 1: Airtable
    if (process.env.AIRTABLE_API_KEY) {
      await storeInAirtable(order);
    }

    // OPTION 2: Google Sheets
    // await storeInGoogleSheets(order);

    // OPTION 3: Supabase
    // await storeInSupabase(order);

    // OPTION 4: MongoDB Atlas
    // await storeInMongoDB(order);

    // Send confirmation email
    await sendOrderConfirmation(order);

    // Return success with order ID
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        orderId: orderId,
        message: 'Order created successfully'
      })
    };

  } catch (error) {
    console.error('Order creation error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to create order',
        details: error.message
      })
    };
  }
};

// Store in Airtable
async function storeInAirtable(order) {
  const fetch = require('node-fetch');

  const response = await fetch(
    `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Orders`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          'Order ID': order.orderId,
          'Customer Name': order.customer.name,
          'Customer Email': order.customer.email,
          'Customer Phone': order.customer.phone,
          'Items': JSON.stringify(order.items),
          'Total': order.total,
          'Currency': order.currency,
          'Country': order.country,
          'Payment Method': order.paymentMethod,
          'Status': order.status,
          'Created': order.createdAt
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error('Failed to store order in Airtable');
  }

  return await response.json();
}

// Send order confirmation email
async function sendOrderConfirmation(order) {
  // Skip if no email configured
  if (!process.env.SMTP_HOST || !order.customer.email) {
    console.log('Email not configured or customer email missing');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const itemsList = order.items.map(item =>
    `${item.name} - ${item.quantity}x ${item.price} = ${item.total}`
  ).join('\n');

  const mailOptions = {
    from: process.env.SMTP_FROM || 'orders@peptideplaza.com',
    to: order.customer.email,
    subject: `Order Confirmation - ${order.orderId}`,
    text: `
Thank you for your order!

Order ID: ${order.orderId}
Status: Pending Payment

ITEMS:
${itemsList}

Subtotal: ${order.currency} ${order.subtotal}
Shipping: ${order.currency} ${order.shipping}
Total: ${order.currency} ${order.total}

SHIPPING ADDRESS:
${order.customer.name}
${order.customer.address}
${order.customer.city}, ${order.customer.postalCode}
${order.customer.country}

Payment Method: ${order.paymentMethod}

We'll send you another email once your payment is confirmed.

Best regards,
PeptidePlaza Team
    `,
    html: `
      <h2>Thank you for your order!</h2>
      <p><strong>Order ID:</strong> ${order.orderId}</p>
      <p><strong>Status:</strong> Pending Payment</p>

      <h3>Items:</h3>
      <ul>
        ${order.items.map(item =>
          `<li>${item.name} - ${item.quantity}x ${item.price} = ${item.total}</li>`
        ).join('')}
      </ul>

      <p><strong>Subtotal:</strong> ${order.currency} ${order.subtotal}</p>
      <p><strong>Shipping:</strong> ${order.currency} ${order.shipping}</p>
      <h3>Total: ${order.currency} ${order.total}</h3>

      <h3>Shipping Address:</h3>
      <p>
        ${order.customer.name}<br>
        ${order.customer.address}<br>
        ${order.customer.city}, ${order.customer.postalCode}<br>
        ${order.customer.country}
      </p>

      <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>

      <p>We'll send you another email once your payment is confirmed.</p>

      <p>Best regards,<br>PeptidePlaza Team</p>
    `
  };

  await transporter.sendMail(mailOptions);
}
