# Netlify Deployment Guide

## Overview
This project uses Netlify Functions to handle order processing without a traditional backend. Orders are processed serverlessly and email notifications are sent automatically.

## Setup Instructions

### 1. Deploy to Netlify

#### Option A: Git Integration (Recommended)
1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository to Netlify
3. Netlify will automatically detect the `netlify.toml` configuration

#### Option B: Manual Deploy
1. Run `npm run build` (if needed)
2. Drag and drop your project folder to Netlify dashboard
3. Or use Netlify CLI: `netlify deploy --prod`

### 2. Configure Environment Variables

In your Netlify dashboard, go to **Site Settings > Environment Variables** and add:

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=admin@peptideplaza.com
```

#### Gmail Setup:
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security > 2-Step Verification > App passwords
   - Generate password for "Mail"
   - Use this password as `EMAIL_PASS`

#### Other Email Providers:
Update the `nodemailer` configuration in `netlify/functions/submit-order.js`:

```javascript
const transporter = nodemailer.createTransporter({
  host: 'your-smtp-host.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

### 3. Test the Order System

1. Add items to cart on your deployed site
2. Go through checkout process
3. Submit a test order
4. Check that emails are sent to both customer and admin

### 4. Customize Order Processing

#### Email Templates
Edit the email templates in `netlify/functions/submit-order.js`:
- `generateCustomerEmailHTML()` - Customer confirmation email
- `generateAdminEmailHTML()` - Admin notification email

#### Order Storage
Currently orders are logged to console. For production, consider:
- **Netlify Forms**: Simple form submissions
- **Airtable**: Spreadsheet-like database
- **FaunaDB**: Serverless database
- **Google Sheets**: Via Google Sheets API

#### Payment Integration
The current system shows payment instructions. To integrate real payments:
- **Stripe**: Add Stripe Elements and webhook
- **PayPal**: PayPal SDK integration
- **Crypto**: Blockchain payment verification

### 5. Domain and SSL

1. **Custom Domain**: Add your domain in Netlify dashboard
2. **SSL**: Automatically provided by Netlify
3. **DNS**: Update your domain's nameservers to Netlify's

### 6. Performance Optimization

#### Automatic Optimizations:
- Asset optimization (images, CSS, JS)
- CDN distribution
- Gzip compression

#### Manual Optimizations:
- Optimize images before upload
- Minify CSS/JS if needed
- Use WebP images for better compression

### 7. Monitoring and Analytics

#### Built-in Analytics:
- Netlify Analytics (paid feature)
- Function logs in dashboard

#### External Analytics:
- Google Analytics
- Hotjar for user behavior
- Sentry for error tracking

## File Structure

```
├── netlify/
│   └── functions/
│       └── submit-order.js     # Order processing function
├── netlify.toml                # Netlify configuration
├── package.json                # Dependencies
├── .env.example               # Environment variables template
└── [your website files]
```

## API Endpoints

Once deployed, your order endpoint will be available at:
```
https://your-site.netlify.app/.netlify/functions/submit-order
```

## Troubleshooting

### Function Errors
1. Check function logs in Netlify dashboard
2. Verify environment variables are set
3. Test email credentials separately

### Email Issues
1. Check spam folders
2. Verify SMTP settings
3. Test with a simple email service first

### CORS Issues
The function includes CORS headers, but if you encounter issues:
1. Check the `Access-Control-Allow-Origin` header
2. Verify the request method is POST
3. Ensure Content-Type is application/json

## Security Considerations

1. **Environment Variables**: Never commit real credentials to git
2. **Input Validation**: The function validates required fields
3. **Rate Limiting**: Consider adding rate limiting for production
4. **HTTPS**: Always use HTTPS in production (automatic with Netlify)

## Cost Considerations

### Netlify Free Tier:
- 100GB bandwidth/month
- 125,000 function invocations/month
- 100 hours function runtime/month

### Paid Plans:
- Higher limits
- Analytics
- Form submissions
- Identity management

## Support

For issues with:
- **Netlify Platform**: Netlify Support
- **Code Issues**: Check the function logs
- **Email Delivery**: Verify email provider settings