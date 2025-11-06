# PeptidePlaza - Order Management System

Complete e-commerce solution with Telegram notifications for order management.

## 🚀 Quick Start

### 1. Set Up Telegram Bot (5 minutes)

1. Open Telegram and message **@BotFather**
2. Send `/newbot` and follow prompts
3. Save your **Bot Token**
4. Message **@userinfobot** to get your **Chat ID**

### 2. Install Backend

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env and add your Telegram credentials
nano .env
```

### 3. Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:3000`

### 4. Test It Out

1. Open `checkout.html` in your browser
2. Add items to cart from product pages
3. Fill out the checkout form
4. Click "Place Order"
5. Check your Telegram - you should receive a notification! 📱

## 📋 What You Get

### Order Notifications Include:
- ✅ Unique Order ID
- ✅ Customer details (name, email, phone)
- ✅ Shipping address
- ✅ All ordered items with quantities
- ✅ Payment method (Bitcoin/Ethereum)
- ✅ Exact crypto amounts pre-calculated
- ✅ Order total
- ✅ Timestamp

### Example Telegram Message:
```
🆕 NEW ORDER - PP1234567890

👤 Customer Information
Name: John Doe
Email: john@example.com
Phone: +66812345678
Country: Thailand

📦 Shipping Address
123 Sukhumvit Road
Bangkok, 10110
Thailand

🛒 Order Items
1. BPC-157 5mg - 5 vials
   Qty: 5 | Price: ฿1,200
2. TB-500 5mg - 10 vials
   Qty: 10 | Price: ฿1,800

💳 Payment Information
Method: BITCOIN
Subtotal: ฿13,000
Shipping: ฿200
Total: ฿13,200

💰 Crypto Payment
Amount: 0.00440000 BTC

⏰ Time: 12/15/2024, 2:30:00 PM (Thailand)

🔔 Please process this order as soon as possible.
```

## 🌐 Deployment

### Option 1: Railway (Recommended - Free)
1. Push code to GitHub
2. Sign up at https://railway.app
3. Create new project from GitHub
4. Add environment variables
5. Deploy!

### Option 2: Vercel/Netlify
- Perfect for serverless functions
- Free tier available
- Easy GitHub integration

### Option 3: Your Own VPS
```bash
# Install PM2 for process management
npm install -g pm2

# Start server
pm2 start server.js --name peptideplaza

# Make it run on startup
pm2 startup
pm2 save
```

## 🔧 Configuration

### Frontend Configuration

In `checkout-page.js` line 397, update the backend URL:

```javascript
const BACKEND_URL = 'http://localhost:3000'; // Local testing
// const BACKEND_URL = 'https://your-domain.com'; // Production
```

### Environment Variables

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
PORT=3000
```

## 🛡️ Security

- ✅ CORS enabled for frontend integration
- ✅ Environment variables for sensitive data
- ✅ Request validation
- ✅ Error handling
- ⚠️ Consider adding rate limiting in production
- ⚠️ Use HTTPS in production

## 📱 Features

### QR Codes with Pre-filled Amounts
- Real-time crypto price fetching from CoinGecko
- Automatic BTC/ETH amount calculation
- QR codes include payment amounts
- Users just scan and confirm - no manual entry!

### Cart System
- Slideout cart panel
- Real-time total calculations
- Persistent storage (localStorage)
- Item management

### Checkout Process
1. Customer adds items to cart
2. Fills out shipping information
3. Selects payment method (BTC/ETH)
4. Scans QR code with pre-filled amount
5. Order details sent to your Telegram instantly
6. Customer receives order ID

## 🆘 Troubleshooting

**Telegram not receiving messages?**
- Make sure you messaged your bot first
- Check bot token and chat ID are correct
- View server logs: `npm start`

**CORS errors?**
- Check frontend URL in `server.js`
- Make sure backend is running

**QR codes not showing?**
- Check console for errors
- Verify QR API is accessible
- Try refreshing the page

## 📞 Support

Check the logs for detailed error messages:
```bash
npm start
```

All errors are logged with timestamps and details.

## 📄 License

MIT License - Free to use and modify

---

**Need help?** Check SETUP.md for detailed step-by-step instructions.
