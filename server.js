// Order Processing Backend for PeptidePlaza
// Receives orders and sends notifications to Telegram

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Crypto Payment Addresses (SECURE - stored on server only)
const PAYMENT_ADDRESSES = {
    bitcoin: process.env.BITCOIN_ADDRESS || '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    ethereum: process.env.ETHEREUM_ADDRESS || '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87'
};

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Email Configuration (using Nodemailer)
const emailTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ status: 'PeptidePlaza Order Server Running', version: '1.0.0' });
});

// Get payment addresses endpoint
app.get('/api/payment-addresses', (req, res) => {
    try {
        res.json({
            success: true,
            addresses: PAYMENT_ADDRESSES
        });
    } catch (error) {
        console.error('Error fetching payment addresses:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch payment addresses'
        });
    }
});

// Order submission endpoint
app.post('/api/submit-order', async (req, res) => {
    try {
        const orderData = req.body;

        console.log('Received order:', orderData);

        // Validate order data
        if (!orderData.email || !orderData.phone || !orderData.items) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Generate unique order ID
        const orderId = `PP${Date.now()}`;
        orderData.orderId = orderId;

        // Send to Telegram
        const telegramSuccess = await sendToTelegram(orderData);

        // Send email confirmation to customer
        const emailSuccess = await sendOrderConfirmation(orderData);

        if (telegramSuccess) {
            res.json({
                success: true,
                orderId: orderId,
                message: 'Order received successfully',
                emailSent: emailSuccess
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to send notification'
            });
        }

    } catch (error) {
        console.error('Order processing error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Send order details to Telegram
async function sendToTelegram(orderData) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.error('Telegram credentials not configured');
        return false;
    }

    try {
        // Format order message
        const message = formatOrderMessage(orderData);

        // Send to Telegram
        const response = await axios.post(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            }
        );

        console.log('Telegram notification sent successfully');
        return response.data.ok;

    } catch (error) {
        console.error('Telegram send error:', error.message);
        return false;
    }
}

// Format order details for Telegram
function formatOrderMessage(order) {
    const currency = order.currency || 'THB';
    const currencySymbol = order.currencySymbol || '฿';

    let message = `🆕 <b>NEW ORDER - ${order.orderId}</b>\n\n`;

    // Customer Details
    message += `👤 <b>Customer Information</b>\n`;
    message += `Name: ${order.firstName} ${order.lastName}\n`;
    message += `Email: ${order.email}\n`;
    message += `Phone: ${order.phone}\n`;
    message += `Country: ${order.country}\n\n`;

    // Shipping Address
    message += `📦 <b>Shipping Address</b>\n`;
    message += `${order.address}\n`;
    message += `${order.city}, ${order.postcode}\n`;
    message += `${order.country}\n\n`;

    // Order Items
    message += `🛒 <b>Order Items</b>\n`;
    order.items.forEach((item, index) => {
        const unitPriceTHB = item.unitPriceTHB || item.unitPrice;
        message += `${index + 1}. ${item.name}\n`;
        message += `   Qty: ${item.quantity} | Price: ฿${unitPriceTHB.toLocaleString()} THB\n`;
    });
    message += `\n`;

    // Payment Details
    message += `💳 <b>Payment Information</b>\n`;
    message += `Method: ${order.paymentMethod.toUpperCase()}\n`;
    message += `Currency: ${currency}\n`;
    message += `Subtotal: ฿${order.subtotal.toLocaleString()} THB (${currencySymbol}${order.displaySubtotal} ${currency})\n`;
    message += `Shipping: ฿200 THB\n`;
    message += `<b>Total: ฿${order.total.toLocaleString()} THB (${currencySymbol}${order.displayTotal} ${currency})</b>\n\n`;

    // Crypto Details (if available)
    if (order.cryptoAmount) {
        message += `💰 <b>Crypto Payment</b>\n`;
        message += `Amount: ${order.cryptoAmount}\n\n`;
    }

    message += `⏰ Time: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' })} (Thailand)\n`;
    message += `\n🔔 Please process this order as soon as possible.`;

    return message;
}

// Send order confirmation email to customer
async function sendOrderConfirmation(order) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.warn('Email not configured, skipping email confirmation');
        return false;
    }

    try {
        const currency = order.currency || 'THB';
        const currencySymbol = order.currencySymbol || '฿';
        const displaySubtotal = order.displaySubtotal || order.subtotal;
        const displayTotal = order.displayTotal || order.total;

        const emailHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #8B5A96 0%, #6B4C93 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f8f9fa; padding: 30px; }
                    .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                    .item { border-bottom: 1px solid #e9ecef; padding: 10px 0; }
                    .total { font-size: 1.2em; font-weight: bold; color: #8B5A96; padding-top: 15px; }
                    .footer { text-align: center; padding: 20px; color: #636e72; font-size: 0.9em; }
                    .button { display: inline-block; padding: 12px 30px; background: #8B5A96; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Order Confirmation</h1>
                        <p>Thank you for your order!</p>
                    </div>
                    <div class="content">
                        <h2>Order #${order.orderId}</h2>
                        <p>Hi ${order.firstName},</p>
                        <p>We've received your order and will process it shortly. Below are your order details:</p>

                        <div class="order-details">
                            <h3>Order Items:</h3>
                            ${order.items.map(item => {
                                const unitPriceTHB = item.unitPriceTHB || item.unitPrice;
                                const itemSubtotal = item.quantity * unitPriceTHB;
                                return `
                                <div class="item">
                                    <strong>${item.name}</strong><br>
                                    Quantity: ${item.quantity} | Unit Price: ฿${unitPriceTHB.toLocaleString()} THB<br>
                                    <strong>Subtotal: ฿${itemSubtotal.toLocaleString()} THB</strong>
                                </div>
                            `}).join('')}

                            <div class="total">
                                <p>Subtotal: ${currencySymbol}${parseFloat(displaySubtotal).toLocaleString()} ${currency}</p>
                                <p>Shipping: ${currencySymbol}${(200 * (parseFloat(displayTotal) / order.total)).toFixed(2)} ${currency}</p>
                                <p>Total: ${currencySymbol}${parseFloat(displayTotal).toLocaleString()} ${currency}</p>
                            </div>
                        </div>

                        <div class="order-details">
                            <h3>Shipping Address:</h3>
                            <p>
                                ${order.firstName} ${order.lastName}<br>
                                ${order.address}<br>
                                ${order.city}, ${order.postcode}<br>
                                ${order.country}<br>
                                Phone: ${order.phone}
                            </p>
                        </div>

                        <div class="order-details">
                            <h3>Payment Instructions:</h3>
                            <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
                            ${order.cryptoAmount ? `<p><strong>Amount to Send:</strong> ${order.cryptoAmount}</p>` : ''}
                            <p>Please complete your payment and email the transaction ID to:</p>
                            <p><strong>orders@peptideplaza.com</strong></p>
                            <p>Include your Order ID: <strong>${order.orderId}</strong></p>
                        </div>

                        <p>We will confirm your payment and ship your order within 24 hours.</p>
                        <p>Expected delivery: 2-3 business days within Thailand</p>
                    </div>
                    <div class="footer">
                        <p>PeptidePlaza Thailand - Premium Research Peptides</p>
                        <p>For research purposes only</p>
                        <p>Questions? Contact us at info@peptideplaza.com</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        await emailTransporter.sendMail({
            from: `"PeptidePlaza" <${process.env.EMAIL_USER}>`,
            to: order.email,
            subject: `Order Confirmation - ${order.orderId}`,
            html: emailHTML
        });

        console.log('Order confirmation email sent to:', order.email);
        return true;

    } catch (error) {
        console.error('Email send error:', error.message);
        return false;
    }
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 PeptidePlaza Order Server running on port ${PORT}`);
    console.log(`📱 Telegram Bot: ${TELEGRAM_BOT_TOKEN ? 'Configured' : 'Not configured'}`);
    console.log(`💬 Chat ID: ${TELEGRAM_CHAT_ID ? 'Set' : 'Not set'}`);
});
