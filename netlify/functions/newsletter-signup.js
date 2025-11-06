// Newsletter Signup Function
// Handles email list subscriptions (Mailchimp, SendGrid, etc.)

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { email, name } = JSON.parse(event.body);

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid email address' })
      };
    }

    const fetch = require('node-fetch');

    // OPTION 1: Mailchimp
    if (process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_LIST_ID) {
      const datacenter = process.env.MAILCHIMP_API_KEY.split('-')[1];
      const response = await fetch(
        `https://${datacenter}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}/members`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.MAILCHIMP_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email_address: email,
            status: 'subscribed',
            merge_fields: {
              FNAME: name || '',
              SOURCE: 'Website'
            }
          })
        }
      );

      const data = await response.json();

      if (!response.ok && data.title !== 'Member Exists') {
        throw new Error(data.detail || 'Mailchimp signup failed');
      }

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          message: 'Successfully subscribed to newsletter!'
        })
      };
    }

    // OPTION 2: SendGrid (Marketing Campaigns)
    if (process.env.SENDGRID_API_KEY) {
      const response = await fetch(
        'https://api.sendgrid.com/v3/marketing/contacts',
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contacts: [{
              email: email,
              first_name: name || '',
              custom_fields: {
                source: 'website'
              }
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error('SendGrid signup failed');
      }

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          message: 'Successfully subscribed to newsletter!'
        })
      };
    }

    // OPTION 3: Store in Airtable (manual email management)
    if (process.env.AIRTABLE_API_KEY) {
      const response = await fetch(
        `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Newsletter`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fields: {
              'Email': email,
              'Name': name || '',
              'Subscribed': new Date().toISOString(),
              'Status': 'Active',
              'Source': 'Website'
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to store subscriber');
      }

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          message: 'Successfully subscribed to newsletter!'
        })
      };
    }

    // No service configured
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Newsletter service not configured'
      })
    };

  } catch (error) {
    console.error('Newsletter signup error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to subscribe',
        details: error.message
      })
    };
  }
};
