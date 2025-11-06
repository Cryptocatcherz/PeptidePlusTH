# Netlify Functions Setup Guide for PeptidePlaza

This guide explains how to use serverless functions to run your e-commerce site **without a backend server**.

## What Are Netlify Functions?

Netlify Functions are serverless functions that run on-demand. They allow you to:
- ✅ Process payments securely
- ✅ Send emails
- ✅ Store orders in databases
- ✅ Handle contact forms
- ✅ Convert currencies in real-time
- ✅ **All without maintaining a server!**

---

## 🚀 Functions You Now Have

### 1. **create-order.js** - Create and Store Orders
**Endpoint:** `/.netlify/functions/create-order`

**What it does:**
- Creates unique order IDs
- Stores orders in Airtable/Google Sheets/MongoDB
- Sends order confirmation emails
- Returns order ID to customer

**How to use:**
```javascript
fetch('/.netlify/functions/create-order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customer: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      address: '123 Main St',
      city: 'Bangkok',
      postalCode: '10100',
      country: 'Thailand'
    },
    items: [
      {
        name: 'BPC-157 5mg',
        quantity: 2,
        price: '1200',
        total: '2400'
      }
    ],
    subtotal: '2400',
    shipping: '150',
    total: '2550',
    currency: 'THB',
    paymentMethod: 'Stripe'
  })
})
.then(res => res.json())
.then(data => {
  console.log('Order created:', data.orderId);
});
```

---

### 2. **process-payment.js** - Stripe Payment Processing
**Endpoint:** `/.netlify/functions/process-payment`

**What it does:**
- Creates Stripe Payment Intents
- Handles credit card payments securely
- Returns client secret for Stripe.js

**How to use:**
```javascript
// First, create payment intent
const response = await fetch('/.netlify/functions/process-payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 2550, // in THB
    currency: 'THB',
    orderId: 'PEP-123456',
    customerEmail: 'john@example.com'
  })
});

const { clientSecret } = await response.json();

// Then use with Stripe.js
const stripe = Stripe('your_publishable_key');
const { error } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: { name: 'John Doe' }
  }
});
```

---

### 3. **crypto-payment.js** - Bitcoin/Ethereum Payments
**Endpoint:** `/.netlify/functions/crypto-payment`

**What it does:**
- Creates cryptocurrency payment requests
- Supports BTC, ETH, USDT, and more
- Works with NOWPayments or CoinGate APIs

**How to use:**
```javascript
const response = await fetch('/.netlify/functions/crypto-payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 71.40, // in USD (crypto usually priced in USD)
    currency: 'USD',
    crypto: 'BTC', // or 'ETH', 'USDT', etc.
    orderId: 'PEP-123456',
    customerEmail: 'john@example.com'
  })
});

const data = await response.json();
// Redirect user to: data.paymentUrl
window.location.href = data.paymentUrl;
```

---

### 4. **contact-form.js** - Contact Form Handler
**Endpoint:** `/.netlify/functions/contact-form`

**What it does:**
- Handles contact form submissions
- Sends emails to admin and customer
- Stores inquiries in Airtable

**How to use:**
```javascript
fetch('/.netlify/functions/contact-form', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Product Inquiry',
    message: 'I have a question about BPC-157...'
  })
})
.then(res => res.json())
.then(data => alert(data.message));
```

---

### 5. **get-currency-rates.js** - Live Currency Conversion
**Endpoint:** `/.netlify/functions/get-currency-rates`

**What it does:**
- Fetches live exchange rates
- Caches for 1 hour
- Falls back to static rates if API fails

**How to use:**
```javascript
const response = await fetch('/.netlify/functions/get-currency-rates');
const data = await response.json();

console.log('USD rate:', data.rates.USD);
console.log('GBP rate:', data.rates.GBP);

// Convert price
const priceInTHB = 1200;
const priceInUSD = priceInTHB * data.rates.USD;
```

---

### 6. **get-location.js** - Server-Side Geolocation
**Endpoint:** `/.netlify/functions/get-location`

**What it does:**
- Detects visitor's country from IP
- More reliable than client-side detection
- Returns country, city, and currency

**How to use:**
```javascript
const response = await fetch('/.netlify/functions/get-location');
const data = await response.json();

console.log('Country:', data.countryName);
console.log('Currency:', data.currency);

// Update UI based on location
document.getElementById('country').textContent = data.countryName;
```

---

### 7. **newsletter-signup.js** - Newsletter Subscriptions
**Endpoint:** `/.netlify/functions/newsletter-signup`

**What it does:**
- Adds subscribers to Mailchimp/SendGrid
- Validates email addresses
- Prevents duplicate signups

**How to use:**
```javascript
fetch('/.netlify/functions/newsletter-signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    name: 'John Doe'
  })
})
.then(res => res.json())
.then(data => alert(data.message));
```

---

### 8. **check-inventory.js** - Stock Availability
**Endpoint:** `/.netlify/functions/check-inventory`

**What it does:**
- Checks real-time product availability
- Prevents overselling
- Returns stock levels

**How to use:**
```javascript
const response = await fetch('/.netlify/functions/check-inventory', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId: 'BPC-5MG',
    quantity: 2
  })
});

const data = await response.json();

if (!data.available) {
  alert(`Only ${data.stock} units available!`);
}
```

---

## 🔧 Setup Instructions

### Step 1: Install Dependencies

```bash
cd netlify/functions
npm install
```

### Step 2: Configure Environment Variables

Go to **Netlify Dashboard** → **Site Settings** → **Environment Variables** and add:

#### For Payments (Stripe):
```
STRIPE_SECRET_KEY=sk_test_xxxxx
```

#### For Crypto Payments (NOWPayments):
```
NOWPAYMENTS_API_KEY=your_api_key
```

#### Or for CoinGate:
```
COINGATE_API_KEY=your_api_key
```

#### For Email (SMTP):
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@peptideplaza.com
ADMIN_EMAIL=support@peptideplaza.com
```

#### For Order Storage (Airtable):
```
AIRTABLE_API_KEY=keyXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
```

#### For Currency Conversion:
```
EXCHANGE_RATE_API_KEY=your_key_from_exchangerate-api.com
```

#### For Newsletter (Mailchimp):
```
MAILCHIMP_API_KEY=your_api_key-us21
MAILCHIMP_LIST_ID=your_list_id
```

#### Or for SendGrid:
```
SENDGRID_API_KEY=SG.xxxxxx
```

---

## 📊 Database Options

You can use any of these (no server required):

### 1. **Airtable** (Recommended - Easiest)
- Visual spreadsheet interface
- Free tier: 1,200 records
- Easy to set up
- Sign up: https://airtable.com

**Tables to create:**
- `Orders` - Store customer orders
- `Contact` - Store contact form submissions
- `Newsletter` - Store email subscribers
- `Inventory` - Track product stock

### 2. **Supabase** (Postgres database)
- Free tier: 500MB database
- Real-time subscriptions
- Sign up: https://supabase.com

### 3. **MongoDB Atlas**
- Free tier: 512MB storage
- NoSQL database
- Sign up: https://www.mongodb.com/cloud/atlas

### 4. **Google Sheets**
- Completely free
- Familiar interface
- Use with Google Sheets API

---

## 💳 Payment Provider Setup

### Stripe Setup (Credit Cards)
1. Sign up at https://stripe.com
2. Get your **Secret Key** from Dashboard
3. Add to Netlify environment variables
4. Install Stripe.js on your site:
```html
<script src="https://js.stripe.com/v3/"></script>
```

### NOWPayments Setup (Crypto)
1. Sign up at https://nowpayments.io
2. Get API key from Dashboard
3. Add to Netlify environment variables
4. Accepts: BTC, ETH, USDT, and 200+ cryptos

### CoinGate Setup (Crypto - Alternative)
1. Sign up at https://coingate.com
2. Get API key
3. Add to environment variables

---

## 📧 Email Setup Options

### Option 1: Gmail (Free, Easy)
1. Enable 2FA on your Gmail
2. Create an App Password
3. Use these settings:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_char_app_password
```

### Option 2: SendGrid (Free tier: 100 emails/day)
1. Sign up at https://sendgrid.com
2. Create API key
3. Use SendGrid SMTP or API

### Option 3: Mailgun
- Free tier: 5,000 emails/month
- Professional email delivery

---

## 🧪 Testing Functions Locally

### Install Netlify CLI:
```bash
npm install -g netlify-cli
```

### Run functions locally:
```bash
netlify dev
```

Your functions will be available at:
- http://localhost:8888/.netlify/functions/create-order
- http://localhost:8888/.netlify/functions/process-payment
- etc.

---

## 🔒 Security Best Practices

✅ **Never commit API keys** - Use environment variables
✅ **Validate all inputs** - Check data before processing
✅ **Use HTTPS only** - Netlify provides this automatically
✅ **Rate limit** - Prevent abuse (Netlify does this automatically)
✅ **Sanitize emails** - Prevent injection attacks

---

## 💰 Cost Estimates (All Free Tiers)

- **Netlify Functions:** 125,000 requests/month FREE
- **Airtable:** 1,200 records FREE
- **Stripe:** No monthly fees, only transaction fees
- **SendGrid:** 100 emails/day FREE
- **Currency API:** 1,500 requests/month FREE
- **Geolocation API:** 1,000 requests/day FREE

**Total monthly cost for small site: $0**

---

## 📞 Support & Resources

- Netlify Functions Docs: https://docs.netlify.com/functions/overview/
- Stripe Docs: https://stripe.com/docs
- Airtable API: https://airtable.com/developers/web/api/introduction
- Need help? Check the code comments in each function

---

## 🚨 Troubleshooting

### Function not working?
1. Check Netlify function logs: Dashboard → Functions → View logs
2. Verify environment variables are set
3. Test locally with `netlify dev`

### Email not sending?
1. Check SMTP credentials
2. For Gmail, make sure App Password is used (not regular password)
3. Check spam folder

### Payment not processing?
1. Verify API keys are correct (test vs live mode)
2. Check Stripe/NOWPayments dashboard for errors
3. Ensure amount is in correct format (cents for Stripe)

---

## 🎉 You're All Set!

Your e-commerce site now has a complete backend without needing to manage any servers!

All functions are secure, scalable, and cost-effective.
