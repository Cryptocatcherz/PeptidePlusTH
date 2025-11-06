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
    
    // Validate required fields
    const requiredFields = ['customerInfo', 'items', 'totals', 'paymentMethod'];
    for (const field of requiredFields) {
      if (!orderData[field]) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: `Missing required field: ${field}` })
        };
      }
    }

    // Generate order ID
    const orderId = `PP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Create order object
    const order = {
      id: orderId,
      timestamp: new Date().toISOString(),
      customer: orderData.customerInfo,
      items: orderData.items,
      totals: orderData.totals,
      paymentMethod: orderData.paymentMethod,
      status: 'pending',
      currency: orderData.currency || 'THB'
    };

    // Send email notifications
    await sendOrderEmails(order);

    // Log order (in production, you'd save to a database)
    console.log('New Order:', JSON.stringify(order, null, 2));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        orderId: orderId,
        message: 'Order submitted successfully',
        order: order
      })
    };

  } catch (error) {
    console.error('Order processing error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Failed to process order',
        details: error.message
      })
    };
  }
};

async function sendOrderEmails(order) {
  // Configure email transporter (you'll need to set these environment variables in Netlify)
  const transporter = nodemailer.createTransporter({
    service: 'gmail', // or your email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Customer confirmation email
  const customerEmailHTML = generateCustomerEmailHTML(order);
  
  // Admin notification email
  const adminEmailHTML = generateAdminEmailHTML(order);

  try {
    // Send customer confirmation
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: order.customer.email,
      subject: `Order Confirmation - ${order.id}`,
      html: customerEmailHTML
    });

    // Send admin notification
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `New Order Received - ${order.id}`,
      html: adminEmailHTML
    });

    console.log('Order emails sent successfully');
  } catch (emailError) {
    console.error('Email sending failed:', emailError);
    // Don't fail the order if email fails
  }
}

function generateCustomerEmailHTML(order) {
  const itemsHTML = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.name}</strong><br>
        <small>Quantity: ${item.quantity}</small>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ${order.currency === 'THB' ? '฿' : '$'}${(item.unitPrice * item.quantity).toLocaleString()}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #8B5A96 0%, #6B4C93 100%); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">PEPTIDE PLAZA</h1>
          <p style="margin: 5px 0 0 0;">Premium Research Peptides</p>
        </div>
        
        <div style="padding: 20px; background: #f8f9fa;">
          <h2 style="color: #8B5A96;">Order Confirmation</h2>
          <p>Dear ${order.customer.firstName} ${order.customer.lastName},</p>
          <p>Thank you for your order! We've received your order and will process it shortly.</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #8B5A96;">Order Details</h3>
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Order Date:</strong> ${new Date(order.timestamp).toLocaleDateString()}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          </div>

          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #8B5A96;">Items Ordered</h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${itemsHTML}
              <tr style="background: #f8f9fa;">
                <td style="padding: 10px; font-weight: bold;">Subtotal</td>
                <td style="padding: 10px; text-align: right; font-weight: bold;">
                  ${order.currency === 'THB' ? '฿' : '$'}${order.totals.subtotal.toLocaleString()}
                </td>
              </tr>
              <tr style="background: #f8f9fa;">
                <td style="padding: 10px; font-weight: bold;">Shipping</td>
                <td style="padding: 10px; text-align: right; font-weight: bold;">
                  ${order.currency === 'THB' ? '฿' : '$'}${order.totals.shipping.toLocaleString()}
                </td>
              </tr>
              <tr style="background: #8B5A96; color: white;">
                <td style="padding: 15px; font-weight: bold; font-size: 1.1em;">Total</td>
                <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 1.1em;">
                  ${order.currency === 'THB' ? '฿' : '$'}${order.totals.total.toLocaleString()}
                </td>
              </tr>
            </table>
          </div>

          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #8B5A96;">Shipping Address</h3>
            <p>
              ${order.customer.firstName} ${order.customer.lastName}<br>
              ${order.customer.address}<br>
              ${order.customer.city}, ${order.customer.postalCode}<br>
              ${order.customer.country}
            </p>
          </div>

          <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; border-left: 4px solid #0066cc;">
            <h4 style="margin-top: 0; color: #0066cc;">What's Next?</h4>
            <ul style="margin: 0; padding-left: 20px;">
              <li>We'll process your order within 1-2 business days</li>
              <li>You'll receive a shipping confirmation with tracking information</li>
              <li>Estimated delivery: 3-7 business days</li>
            </ul>
          </div>

          <p style="margin-top: 30px;">
            If you have any questions about your order, please contact us at 
            <a href="mailto:support@peptideplaza.com" style="color: #8B5A96;">support@peptideplaza.com</a>
          </p>

          <p>Thank you for choosing Peptide Plaza!</p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #666; font-size: 0.9em;">
          <p>© 2024 Peptide Plaza. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateAdminEmailHTML(order) {
  const itemsHTML = order.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">
        ${order.currency === 'THB' ? '฿' : '$'}${item.unitPrice.toLocaleString()}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">
        ${order.currency === 'THB' ? '฿' : '$'}${(item.unitPrice * item.quantity).toLocaleString()}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Order - ${order.id}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #8B5A96;">New Order Received</h1>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2>Order Information</h2>
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p><strong>Date:</strong> ${new Date(order.timestamp).toLocaleString()}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          <p><strong>Total:</strong> ${order.currency === 'THB' ? '฿' : '$'}${order.totals.total.toLocaleString()}</p>
        </div>

        <div style="background: white; border: 1px solid #ddd; border-radius: 8px; margin: 20px 0;">
          <h3 style="background: #8B5A96; color: white; margin: 0; padding: 15px;">Customer Information</h3>
          <div style="padding: 15px;">
            <p><strong>Name:</strong> ${order.customer.firstName} ${order.customer.lastName}</p>
            <p><strong>Email:</strong> ${order.customer.email}</p>
            <p><strong>Phone:</strong> ${order.customer.phone}</p>
            <p><strong>Address:</strong><br>
              ${order.customer.address}<br>
              ${order.customer.city}, ${order.customer.postalCode}<br>
              ${order.customer.country}
            </p>
          </div>
        </div>

        <div style="background: white; border: 1px solid #ddd; border-radius: 8px; margin: 20px 0;">
          <h3 style="background: #8B5A96; color: white; margin: 0; padding: 15px;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Unit Price</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
            <tfoot>
              <tr style="background: #f8f9fa; font-weight: bold;">
                <td colspan="3" style="padding: 10px; border-top: 2px solid #ddd;">Subtotal</td>
                <td style="padding: 10px; text-align: right; border-top: 2px solid #ddd;">
                  ${order.currency === 'THB' ? '฿' : '$'}${order.totals.subtotal.toLocaleString()}
                </td>
              </tr>
              <tr style="background: #f8f9fa; font-weight: bold;">
                <td colspan="3" style="padding: 10px;">Shipping</td>
                <td style="padding: 10px; text-align: right;">
                  ${order.currency === 'THB' ? '฿' : '$'}${order.totals.shipping.toLocaleString()}
                </td>
              </tr>
              <tr style="background: #8B5A96; color: white; font-weight: bold; font-size: 1.1em;">
                <td colspan="3" style="padding: 15px;">TOTAL</td>
                <td style="padding: 15px; text-align: right;">
                  ${order.currency === 'THB' ? '฿' : '$'}${order.totals.total.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #856404;">Action Required</h4>
          <p style="margin-bottom: 0;">Please process this order and update the customer with shipping information.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}