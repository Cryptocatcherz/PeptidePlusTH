// Contact Form Handler
// Handles contact form submissions and sends emails

const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { name, email, subject, message } = JSON.parse(event.body);

    // Validate input
    if (!name || !email || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid email address' })
      };
    }

    // Send email if configured
    if (process.env.SMTP_HOST) {
      await sendContactEmail({ name, email, subject, message });
    }

    // Store in Airtable/database if configured
    if (process.env.AIRTABLE_API_KEY) {
      await storeContactInAirtable({ name, email, subject, message });
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Thank you for contacting us. We will respond within 24 hours.'
      })
    };

  } catch (error) {
    console.error('Contact form error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to submit contact form',
        details: error.message
      })
    };
  }
};

async function sendContactEmail(data) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  // Email to admin
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'contact@peptideplaza.com',
    to: process.env.ADMIN_EMAIL || 'support@peptideplaza.com',
    replyTo: data.email,
    subject: `Contact Form: ${data.subject || 'No Subject'}`,
    text: `
New contact form submission:

Name: ${data.name}
Email: ${data.email}
Subject: ${data.subject || 'No subject'}

Message:
${data.message}
    `,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Subject:</strong> ${data.subject || 'No subject'}</p>
      <h3>Message:</h3>
      <p>${data.message.replace(/\n/g, '<br>')}</p>
    `
  });

  // Auto-reply to customer
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'support@peptideplaza.com',
    to: data.email,
    subject: 'Thank you for contacting PeptidePlaza',
    text: `
Hi ${data.name},

Thank you for reaching out to us. We have received your message and will respond within 24 hours.

Your message:
${data.message}

Best regards,
PeptidePlaza Support Team
    `,
    html: `
      <h2>Thank you for contacting us!</h2>
      <p>Hi ${data.name},</p>
      <p>We have received your message and will respond within 24 hours.</p>
      <h3>Your message:</h3>
      <p>${data.message.replace(/\n/g, '<br>')}</p>
      <p>Best regards,<br>PeptidePlaza Support Team</p>
    `
  });
}

async function storeContactInAirtable(data) {
  const fetch = require('node-fetch');

  const response = await fetch(
    `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Contact`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          'Name': data.name,
          'Email': data.email,
          'Subject': data.subject || 'No subject',
          'Message': data.message,
          'Submitted': new Date().toISOString(),
          'Status': 'New'
        }
      })
    }
  );

  if (!response.ok) {
    console.error('Failed to store contact in Airtable');
  }
}
