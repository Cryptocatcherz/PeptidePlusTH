# PeptidePlaza Backend Setup Guide

This guide will help you set up the order notification system with Telegram.

## Step 1: Create a Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Send `/newbot` command
3. Follow the prompts:
   - Choose a name: `PeptidePlaza Orders`
   - Choose a username: `peptideplaza_orders_bot` (must end with 'bot')
4. **Save the bot token** - it looks like: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`

## Step 2: Get Your Chat ID

1. Start a chat with your new bot by clicking the link BotFather provides
2. Send any message to your bot (like "hello")
3. Open this URL in your browser (replace YOUR_BOT_TOKEN):
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
   ```
4. Look for `"chat":{"id":123456789}` in the response
5. **Save that number** - that's your Chat ID

## Step 3: Configure Backend

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file and add your credentials:
   ```
   TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   TELEGRAM_CHAT_ID=123456789
   PORT=3000
   ```

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Start the Server

For development (with auto-restart):
```bash
npm run dev
```

For production:
```bash
npm start
```

## Step 6: Test the Setup

1. Visit `http://localhost:3000` - you should see:
   ```json
   {"status":"PeptidePlaza Order Server Running","version":"1.0.0"}
   ```

2. Your backend is now ready to receive orders!

## Step 7: Update Frontend

The frontend (`checkout-page.js`) needs to know where your backend is:

- **Local testing**: `http://localhost:3000`
- **Production**: Your server URL (e.g., `https://your-domain.com`)

## Deployment Options

### Option 1: Railway (Recommended - Free)
1. Sign up at https://railway.app
2. Create new project from GitHub
3. Add environment variables in Railway dashboard
4. Deploy!

### Option 2: Heroku
1. Install Heroku CLI
2. Run:
   ```bash
   heroku create peptideplaza-orders
   heroku config:set TELEGRAM_BOT_TOKEN=your_token
   heroku config:set TELEGRAM_CHAT_ID=your_chat_id
   git push heroku main
   ```

### Option 3: DigitalOcean/AWS/VPS
1. Upload files to your server
2. Install Node.js
3. Install PM2: `npm install -g pm2`
4. Start: `pm2 start server.js`
5. Set up reverse proxy with Nginx

## Testing

Send a test order through your website. You should receive a formatted message in Telegram with:
- Order ID
- Customer details
- Shipping address
- Items ordered
- Payment method
- Total amount

## Troubleshooting

**Bot not sending messages?**
- Check that you've messaged your bot first
- Verify bot token is correct
- Verify chat ID is correct
- Check server logs: `npm start`

**CORS errors?**
- The server already has CORS enabled
- If still having issues, specify your frontend domain in `server.js`

**Server not starting?**
- Check if port 3000 is already in use
- Try changing PORT in `.env` file

## Security Notes

- Never commit `.env` file to git
- Keep your bot token secret
- Use HTTPS in production
- Consider adding rate limiting
- Add request validation

## Support

If you need help, check the server logs for errors:
```bash
npm start
```

All errors will be logged to the console.
