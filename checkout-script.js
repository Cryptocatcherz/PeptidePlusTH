// Checkout Page Functionality
class CheckoutPage {
    constructor() {
        // Debug localStorage before loading
        console.log('Checkout: Raw localStorage data:', localStorage.getItem('peptideCart'));
        
        this.cart = JSON.parse(localStorage.getItem('peptideCart') || '[]');
        this.shippingCost = 200;
        
        // Debug cart loading
        console.log('Checkout: Loading cart from localStorage');
        console.log('Cart data:', this.cart);
        console.log('Cart length:', this.cart.length);
        console.log('Cart JSON:', JSON.stringify(this.cart));
        
        // Check if global ShoppingCart exists (it shouldn't on checkout page)
        console.log('Global ShoppingCart exists:', !!window.shoppingCart);
        
        this.init();
    }

    init() {
        this.loadCartItems();
        this.calculateTotals();
        this.initPaymentMethods();
        this.initForm();
        this.updateCartCount();
        this.calculateDeliveryDate();
        this.initCopyButtons();
        this.updateProgressBar();
        
        // Add debug button in development
        this.addDebugButton();
        
        // Add manual reload button for testing
        this.addReloadButton();
        
        // Auto-refresh cart every 2 seconds to catch updates
        setInterval(() => {
            this.refreshCart();
        }, 2000);
    }

    calculateDeliveryDate() {
        try {
            const today = new Date();
            // Add 2-3 business days for delivery
            const deliveryDays = 3;
            const deliveryDate = new Date(today);

            let daysAdded = 0;
            while (daysAdded < deliveryDays) {
                deliveryDate.setDate(deliveryDate.getDate() + 1);
                // Skip weekends
                if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) {
                    daysAdded++;
                }
            }

            const options = { weekday: 'long', month: 'short', day: 'numeric' };
            const dateString = deliveryDate.toLocaleDateString('en-US', options);

            const deliveryDateElement = document.getElementById('deliveryDate');
            if (deliveryDateElement) {
                deliveryDateElement.textContent = dateString;
            }
        } catch (error) {
            console.error('Error calculating delivery date:', error);
            const deliveryDateElement = document.getElementById('deliveryDate');
            if (deliveryDateElement) {
                deliveryDateElement.textContent = 'within 3 business days';
            }
        }
    }

    updateProgressBar() {
        // Update to 50% for step 2 (Details)
        const progressLine = document.querySelector('.progress-line');
        if (progressLine) {
            progressLine.style.width = '33.33%';
        }
    }

    initCopyButtons() {
        const copyButtons = document.querySelectorAll('.copy-address');
        copyButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const address = btn.getAttribute('data-address');

                navigator.clipboard.writeText(address).then(() => {
                    const originalHTML = btn.innerHTML;
                    btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    btn.style.background = '#00b894';

                    setTimeout(() => {
                        btn.innerHTML = originalHTML;
                        btn.style.background = '';
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy address:', err);
                    btn.innerHTML = '<i class="fas fa-times"></i> Failed';
                    setTimeout(() => {
                        btn.innerHTML = originalHTML;
                    }, 2000);
                });
            });
        });
    }

    loadCartItems() {
        const orderItems = document.getElementById('orderItems');
        
        // Debug cart loading
        console.log('loadCartItems: Cart length is', this.cart.length);
        console.log('loadCartItems: Cart contents:', this.cart);
        console.log('loadCartItems: orderItems element found:', !!orderItems);
        
        if (!orderItems) {
            console.error('orderItems element not found!');
            return;
        }
        
        if (this.cart.length === 0) {
            orderItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Your cart is empty</h3>
                    <p>Add some products to your cart to proceed with checkout.</p>
                    <a href="index.html" class="continue-shopping-btn">Continue Shopping</a>
                </div>
            `;
            
            // Hide order totals and payment sections
            document.querySelector('.order-totals').style.display = 'none';
            document.querySelector('.payment-methods').style.display = 'none';
            document.querySelector('.place-order-btn').style.display = 'none';
            return;
        }

        let itemsHTML = '';
        console.log('Processing cart items...');
        
        this.cart.forEach((item, index) => {
            console.log(`Processing item ${index}:`, item);
            itemsHTML += `
                <div class="order-item">
                    <div class="item-info">
                        <div class="item-name">${item.name}</div>
                        <div class="item-details">Quantity: ${item.quantity || 1}</div>
                    </div>
                    <div class="item-price">${item.price}</div>
                </div>
            `;
        });

        console.log('Generated HTML:', itemsHTML);
        orderItems.innerHTML = itemsHTML;
        console.log('Items loaded into DOM');
    }

    calculateTotals() {
        console.log('calculateTotals: Starting calculation...');
        console.log('calculateTotals: Cart length:', this.cart.length);
        
        if (this.cart.length === 0) {
            console.log('calculateTotals: Cart is empty, returning');
            return;
        }

        let subtotal = 0;
        this.cart.forEach((item, index) => {
            console.log(`calculateTotals: Processing item ${index}:`, item);
            console.log(`calculateTotals: Original price: "${item.price}"`);
            
            // Extract numeric value from price string - handle commas properly
            const cleanPrice = item.price.replace(/[฿$€£¥₩₹]/g, '').replace(/,/g, '').replace(/[^\d]/g, '');
            console.log(`calculateTotals: Cleaned price: "${cleanPrice}"`);
            
            const price = parseInt(cleanPrice);
            console.log(`calculateTotals: Parsed price: ${price}`);
            
            if (isNaN(price)) {
                console.error(`calculateTotals: Failed to parse price for item ${index}:`, item);
            } else {
                subtotal += price;
                console.log(`calculateTotals: Running subtotal: ${subtotal}`);
            }
        });

        const total = subtotal + this.shippingCost;
        
        console.log(`calculateTotals: Final subtotal: ${subtotal}`);
        console.log(`calculateTotals: Shipping cost: ${this.shippingCost}`);
        console.log(`calculateTotals: Final total: ${total}`);

        const subtotalElement = document.getElementById('subtotal');
        const totalElement = document.getElementById('total');
        
        console.log('calculateTotals: subtotalElement found:', !!subtotalElement);
        console.log('calculateTotals: totalElement found:', !!totalElement);

        if (subtotalElement) {
            subtotalElement.dataset.originalPrice = subtotal;
            const displayPrice = `฿${subtotal.toLocaleString()}`;
            console.log(`calculateTotals: Setting subtotal to: ${displayPrice}`);
            
            if (window.currencyConverter) {
                subtotalElement.textContent = window.currencyConverter.convertPrice(subtotal);
            } else {
                subtotalElement.textContent = displayPrice;
            }
            
            console.log(`calculateTotals: Subtotal element now shows: ${subtotalElement.textContent}`);
        } else {
            console.error('calculateTotals: subtotal element not found!');
        }

        if (totalElement) {
            totalElement.dataset.originalPrice = total;
            if (window.currencyConverter) {
                totalElement.textContent = window.currencyConverter.convertPrice(total);
            } else {
                totalElement.textContent = `฿${total.toLocaleString()}`;
            }
        }

        // Update payment amount displays
        const btcAmountElement = document.getElementById('btcAmount');
        const ethAmountElement = document.getElementById('ethAmount');

        if (btcAmountElement) {
            if (window.currencyConverter) {
                btcAmountElement.textContent = window.currencyConverter.convertPrice(total);
            } else {
                btcAmountElement.textContent = `฿${total.toLocaleString()}`;
            }
        }

        if (ethAmountElement) {
            if (window.currencyConverter) {
                ethAmountElement.textContent = window.currencyConverter.convertPrice(total);
            } else {
                ethAmountElement.textContent = `฿${total.toLocaleString()}`;
            }
        }

        // Update shipping cost display
        const shippingElement = document.querySelector('.total-row span:contains("Flat rate")');
        if (shippingElement) {
            shippingElement.dataset.originalPrice = this.shippingCost;
            if (window.currencyConverter) {
                shippingElement.textContent = `Flat rate: ${window.currencyConverter.convertPrice(this.shippingCost)}`;
            } else {
                shippingElement.textContent = `Flat rate: ฿${this.shippingCost}`;
            }
        }
        
        // Update QR codes with new amounts
        setTimeout(() => this.updateQRCodesWithAmount(), 1000);
    }

    initPaymentMethods() {
        const paymentOptions = document.querySelectorAll('input[name="payment"]');
        const paymentDetails = document.querySelectorAll('.payment-details');

        paymentOptions.forEach(option => {
            option.addEventListener('change', () => {
                // Remove active class from all payment details
                paymentDetails.forEach(detail => {
                    detail.classList.remove('active');
                });

                // Add active class to selected payment details
                const selectedDetails = document.querySelector(`.${option.value}-details`);
                if (selectedDetails) {
                    selectedDetails.classList.add('active');
                }
            });
        });
        
        // Generate QR codes when page loads with retry mechanism
        this.waitForQRLibraryAndGenerate();
    }
    
    generateQRCodes() {
        console.log('Generating QR codes...');
        
        // Check if QRCode library is loaded
        if (typeof QRCode === 'undefined') {
            console.error('QRCode library not loaded');
            this.showFallbackQRCodes();
            return;
        }
        
        // Bitcoin QR Code
        this.generateBitcoinQR();
        
        // Ethereum QR Code  
        this.generateEthereumQR();
    }
    
    generateBitcoinQR() {
        const btcAddress = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
        const btcQRContainer = document.querySelector('#bitcoin-payment .qr-code');
        
        if (!btcQRContainer) {
            console.error('Bitcoin QR container not found');
            return;
        }
        
        try {
            btcQRContainer.innerHTML = '';
            
            if (typeof QRCode !== 'undefined') {
                // Try canvas method first
                const canvas = document.createElement('canvas');
                btcQRContainer.appendChild(canvas);
                
                QRCode.toCanvas(canvas, btcAddress, {
                    width: 200,
                    height: 200,
                    colorDark: '#2d3436',
                    colorLight: '#ffffff',
                    margin: 2,
                    errorCorrectionLevel: 'M'
                }, (error) => {
                    if (error) {
                        console.error('Bitcoin QR Code generation failed:', error);
                        this.generateQRWithImage(btcQRContainer, btcAddress);
                    } else {
                        console.log('Bitcoin QR code generated successfully');
                    }
                });
            } else {
                // Fallback to image-based QR code
                this.generateQRWithImage(btcQRContainer, btcAddress);
            }
        } catch (error) {
            console.error('Bitcoin QR generation error:', error);
            this.generateQRWithImage(btcQRContainer, btcAddress);
        }
    }
    
    generateEthereumQR() {
        const ethAddress = '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87';
        const ethQRContainer = document.querySelector('#ethereum-payment .qr-code');
        
        if (!ethQRContainer) {
            console.error('Ethereum QR container not found');
            return;
        }
        
        try {
            ethQRContainer.innerHTML = '';
            
            if (typeof QRCode !== 'undefined') {
                // Try canvas method first
                const canvas = document.createElement('canvas');
                ethQRContainer.appendChild(canvas);
                
                QRCode.toCanvas(canvas, ethAddress, {
                    width: 200,
                    height: 200,
                    colorDark: '#2d3436',
                    colorLight: '#ffffff',
                    margin: 2,
                    errorCorrectionLevel: 'M'
                }, (error) => {
                    if (error) {
                        console.error('Ethereum QR Code generation failed:', error);
                        this.generateQRWithImage(ethQRContainer, ethAddress);
                    } else {
                        console.log('Ethereum QR code generated successfully');
                    }
                });
            } else {
                // Fallback to image-based QR code
                this.generateQRWithImage(ethQRContainer, ethAddress);
            }
        } catch (error) {
            console.error('Ethereum QR generation error:', error);
            this.generateQRWithImage(ethQRContainer, ethAddress);
        }
    }
    
    showFallbackBitcoinQR(container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <i class="fab fa-bitcoin" style="font-size: 3rem; color: #8B5A96; margin-bottom: 10px;"></i>
                <p style="margin: 10px 0; color: #636e72;">Scan with wallet app</p>
                <small style="color: #636e72;">Use address below if QR unavailable</small>
            </div>
        `;
    }
    
    showFallbackEthereumQR(container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <i class="fab fa-ethereum" style="font-size: 3rem; color: #8B5A96; margin-bottom: 10px;"></i>
                <p style="margin: 10px 0; color: #636e72;">Scan with wallet app</p>
                <small style="color: #636e72;">Use address below if QR unavailable</small>
            </div>
        `;
    }
    
    showFallbackQRCodes() {
        const btcQRContainer = document.querySelector('#bitcoin-payment .qr-code');
        const ethQRContainer = document.querySelector('#ethereum-payment .qr-code');
        
        if (btcQRContainer) this.showFallbackBitcoinQR(btcQRContainer);
        if (ethQRContainer) this.showFallbackEthereumQR(ethQRContainer);
    }

    initForm() {
        const form = document.getElementById('checkoutForm');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.processOrder();
        });
    }

    async processOrder() {
        const form = document.getElementById('checkoutForm');
        const submitBtn = form.querySelector('.place-order-btn');
        
        // Disable submit button and show loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Order...';
        
        try {
            const formData = new FormData(form);
            
            // Collect customer information
            const customerInfo = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                address: formData.get('address'),
                city: formData.get('city'),
                postalCode: formData.get('postcode'),
                country: formData.get('country') || 'Thailand'
            };
            
            // Calculate totals
            const subtotalText = document.getElementById('subtotal').textContent;
            const totalText = document.getElementById('total').textContent;
            
            const subtotal = this.extractNumericValue(subtotalText);
            const total = this.extractNumericValue(totalText);
            
            const totals = {
                subtotal: subtotal,
                shipping: this.shippingCost,
                total: total
            };
            
            // Get payment method
            const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
            
            // Get current currency
            const currency = window.currencyConverter ? window.currencyConverter.currentCurrency : 'THB';
            
            // Prepare order data for Netlify function
            const orderData = {
                customerInfo: customerInfo,
                items: this.cart,
                totals: totals,
                paymentMethod: paymentMethod,
                currency: currency
            };
            
            console.log('Submitting order:', orderData);
            
            // Submit to Netlify function
            const response = await fetch('/.netlify/functions/submit-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                // Order submitted successfully
                console.log('Order submitted successfully:', result);
                this.showOrderConfirmation(result.order, result.orderId);
                
                // Clear cart
                localStorage.removeItem('peptideCart');
                this.cart = [];
                
            } else {
                throw new Error(result.error || 'Failed to submit order');
            }
            
        } catch (error) {
            console.error('Order submission error:', error);
            this.showOrderError(error.message);
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-credit-card"></i> Place Order';
        }
    }
    
    extractNumericValue(priceText) {
        // Extract numeric value from price string, handling different currencies
        const cleaned = priceText.replace(/[^\d.,]/g, '').replace(/,/g, '');
        return parseFloat(cleaned) || 0;
    }
    
    showOrderError(errorMessage) {
        const modal = document.createElement('div');
        modal.className = 'order-error-modal';
        
        modal.innerHTML = `
            <div class="modal-backdrop">
                <div class="modal-content error">
                    <div class="modal-header">
                        <h3><i class="fas fa-exclamation-triangle"></i> Order Error</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>We encountered an error while processing your order:</p>
                        <div class="error-message">${errorMessage}</div>
                        <p>Please try again or contact our support team if the problem persists.</p>
                        <div class="contact-info">
                            <p><strong>Email:</strong> support@peptideplaza.com</p>
                            <p><strong>Phone:</strong> +66 (0) 123-456-789</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="retry-btn" onclick="this.closest('.order-error-modal').remove()">Try Again</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add error modal styles
        const style = document.createElement('style');
        style.textContent = `
            .order-error-modal .modal-content.error {
                border-top: 5px solid #dc3545;
            }
            .order-error-modal .modal-header h3 {
                color: #dc3545;
            }
            .error-message {
                background: #f8d7da;
                color: #721c24;
                padding: 15px;
                border-radius: 8px;
                margin: 15px 0;
                border: 1px solid #f5c6cb;
            }
            .contact-info {
                background: #d1ecf1;
                padding: 15px;
                border-radius: 8px;
                margin: 15px 0;
            }
            .retry-btn {
                background: #dc3545;
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 25px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
            }
            .retry-btn:hover {
                background: #c82333;
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(modal);
        
        // Close modal functionality
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
            style.remove();
        });
    }

    showOrderConfirmation(orderData, orderId) {
        const modal = document.createElement('div');
        modal.className = 'order-confirmation-modal';
        
        let paymentInstructions = '';
        if (orderData.paymentMethod === 'bitcoin') {
            paymentInstructions = `
                <div class="payment-instructions">
                    <h4><i class="fab fa-bitcoin"></i> Bitcoin Payment Instructions</h4>
                    <p>Please send <strong>${orderData.total}</strong> worth of Bitcoin to:</p>
                    <div class="crypto-address">
                        <code>1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa</code>
                        <button class="copy-address-btn" onclick="navigator.clipboard.writeText('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                    <p class="payment-note">After sending payment, please email us at <strong>orders@peptideplaza.com</strong> with your transaction ID and order details.</p>
                </div>
            `;
        } else if (orderData.paymentMethod === 'ethereum') {
            paymentInstructions = `
                <div class="payment-instructions">
                    <h4><i class="fab fa-ethereum"></i> Ethereum Payment Instructions</h4>
                    <p>Please send <strong>${orderData.total}</strong> worth of ETH or ERC20 tokens to:</p>
                    <div class="crypto-address">
                        <code>0x742d35Cc6634C0532925a3b8D4C9db96590c6C87</code>
                        <button class="copy-address-btn" onclick="navigator.clipboard.writeText('0x742d35Cc6634C0532925a3b8D4C9db96590c6C87')">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                    <p class="payment-note">After sending payment, please email us at <strong>orders@peptideplaza.com</strong> with your transaction ID and order details.</p>
                </div>
            `;
        }

        modal.innerHTML = `
            <div class="modal-backdrop">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-check-circle"></i> Order Confirmed!</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>Thank you for your order! Your order has been received and is being processed.</p>
                        
                        <div class="order-summary-modal">
                            <h4>Order Summary</h4>
                            <div class="order-details">
                                <p><strong>Order Total:</strong> ${orderData.total}</p>
                                <p><strong>Shipping Address:</strong> ${orderData.address}, ${orderData.city}, ${orderData.postcode}</p>
                                <p><strong>Email:</strong> ${orderData.email}</p>
                                <p><strong>Phone:</strong> ${orderData.phone}</p>
                            </div>
                        </div>

                        ${paymentInstructions}

                        <div class="next-steps">
                            <h4>What happens next?</h4>
                            <ol>
                                <li>Complete your payment using the instructions above</li>
                                <li>Email us your transaction ID</li>
                                <li>We'll confirm payment and prepare your order</li>
                                <li>Your order will be shipped within 1-2 business days</li>
                                <li>You'll receive tracking information via email</li>
                            </ol>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="continue-btn" onclick="window.location.href='index.html'">Continue Shopping</button>
                    </div>
                </div>
            </div>
        `;

        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .order-confirmation-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }
            .modal-content {
                background: white;
                border-radius: 15px;
                max-width: 600px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
            }
            .modal-header {
                padding: 25px 30px 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .modal-header h3 {
                color: #00b894;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .close-modal {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #999;
            }
            .modal-body {
                padding: 20px 30px;
            }
            .order-summary-modal {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
            }
            .order-summary-modal h4 {
                color: #2d3436;
                margin-bottom: 15px;
            }
            .payment-instructions {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
            }
            .payment-instructions h4 {
                color: #d68910;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .crypto-address {
                display: flex;
                align-items: center;
                gap: 10px;
                margin: 15px 0;
                padding: 15px;
                background: white;
                border-radius: 8px;
                border: 1px solid #ddd;
            }
            .crypto-address code {
                flex: 1;
                font-family: monospace;
                word-break: break-all;
                font-size: 0.9rem;
            }
            .copy-address-btn {
                background: #8B5A96;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 5px;
                cursor: pointer;
            }
            .payment-note {
                font-size: 0.9rem;
                color: #856404;
                margin-top: 15px;
            }
            .next-steps {
                background: #d1ecf1;
                border: 1px solid #bee5eb;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
            }
            .next-steps h4 {
                color: #0c5460;
                margin-bottom: 15px;
            }
            .next-steps ol {
                color: #0c5460;
                padding-left: 20px;
            }
            .next-steps li {
                margin-bottom: 8px;
            }
            .modal-footer {
                padding: 0 30px 30px;
                text-align: center;
            }
            .continue-btn {
                background: linear-gradient(135deg, #8B5A96 0%, #6B4C93 100%);
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 25px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
            }
            .continue-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(139, 90, 150, 0.3);
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(modal);

        // Close modal functionality
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
            style.remove();
        });

        // Clear cart after successful order
        localStorage.removeItem('peptideCart');
        
        console.log('Order processed:', orderData);
    }

    updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = this.cart.length;
        }
    }
}

// Calculate delivery date immediately (for banner)
function calculateAndDisplayDeliveryDate() {
    try {
        const today = new Date();
        const deliveryDays = 3;
        const deliveryDate = new Date(today);

        let daysAdded = 0;
        while (daysAdded < deliveryDays) {
            deliveryDate.setDate(deliveryDate.getDate() + 1);
            if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) {
                daysAdded++;
            }
        }

        const options = { weekday: 'long', month: 'short', day: 'numeric' };
        const dateString = deliveryDate.toLocaleDateString('en-US', options);

        const deliveryDateElement = document.getElementById('deliveryDate');
        if (deliveryDateElement) {
            deliveryDateElement.textContent = dateString;
        }
    } catch (error) {
        console.error('Error calculating delivery date:', error);
        const deliveryDateElement = document.getElementById('deliveryDate');
        if (deliveryDateElement) {
            deliveryDateElement.textContent = 'within 3 business days';
        }
    }
}

// Run immediately
if (document.getElementById('deliveryDate')) {
    calculateAndDisplayDeliveryDate();
}

// Initialize checkout page
document.addEventListener('DOMContentLoaded', () => {
    new CheckoutPage();
    // Call again to ensure it's updated
    calculateAndDisplayDeliveryDate();
    console.log('Checkout page initialized successfully!');
}); 
   // Update QR codes with payment amount
    updateQRCodesWithAmount() {
        const totalElement = document.getElementById('total');
        if (!totalElement) return;
        
        const totalAmount = totalElement.textContent.replace(/[^\d.]/g, '');
        const btcAddress = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
        const ethAddress = '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87';
        
        // Bitcoin QR Code with amount
        const btcQRContainer = document.querySelector('#bitcoin-payment .qr-code');
        if (btcQRContainer && typeof QRCode !== 'undefined') {
            btcQRContainer.innerHTML = '';
            const btcURI = `bitcoin:${btcAddress}?amount=${(totalAmount / 50000).toFixed(8)}&label=PeptidePlaza%20Order`;
            QRCode.toCanvas(btcQRContainer, btcURI, {
                width: 200,
                height: 200,
                colorDark: '#2d3436',
                colorLight: '#ffffff',
                margin: 2
            });
        }
        
        // Ethereum QR Code with amount
        const ethQRContainer = document.querySelector('#ethereum-payment .qr-code');
        if (ethQRContainer && typeof QRCode !== 'undefined') {
            ethQRContainer.innerHTML = '';
            const ethURI = `ethereum:${ethAddress}?value=${(totalAmount / 3000 * 1e18).toFixed(0)}`;
            QRCode.toCanvas(ethQRContainer, ethURI, {
                width: 200,
                height: 200,
                colorDark: '#2d3436',
                colorLight: '#ffffff',
                margin: 2
            });
        }
    }
    
    
    waitForQRLibraryAndGenerate() {
        // Try immediate generation first
        setTimeout(() => {
            console.log('Starting QR code generation...');
            this.generateQRCodes();
        }, 100);
        
        // Backup attempt after longer delay
        setTimeout(() => {
            const btcContainer = document.querySelector('#bitcoin-payment .qr-code');
            const ethContainer = document.querySelector('#ethereum-payment .qr-code');
            
            // Check if QR codes were generated successfully
            if (btcContainer && btcContainer.innerHTML.includes('Generating QR Code')) {
                console.log('Retrying QR code generation...');
                this.generateQRCodes();
            }
        }, 2000);
    }    
    ge
nerateQRWithImage(container, data) {
        console.log('Using image-based QR code generation');
        
        // Use QR Server API as fallback
        const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}&bgcolor=ffffff&color=2d3436&margin=10`;
        
        const img = document.createElement('img');
        img.src = qrImageUrl;
        img.alt = 'QR Code';
        img.style.width = '200px';
        img.style.height = '200px';
        img.style.borderRadius = '8px';
        img.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        
        img.onload = () => {
            console.log('QR code image loaded successfully');
            container.innerHTML = '';
            container.appendChild(img);
        };
        
        img.onerror = () => {
            console.error('QR code image failed to load');
            this.showFallbackIcon(container);
        };
        
        // Show loading state
        container.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 0.9rem; color: #636e72;">Loading QR Code...</div>
            </div>
        `;
    }
    
    showFallbackIcon(container) {
        const isBitcoin = container.closest('#bitcoin-payment');
        const icon = isBitcoin ? 'bitcoin' : 'ethereum';
        const color = '#8B5A96';
        
        container.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <i class="fab fa-${icon}" style="font-size: 3rem; color: ${color}; margin-bottom: 10px;"></i>
                <p style="margin: 10px 0; color: #636e72;">Scan with wallet app</p>
                <small style="color: #636e72;">Use address below to send payment</small>
            </div>
        `;
    }  
  
    // Refresh cart from localStorage (in case it was updated)
    refreshCart() {
        console.log('Refreshing cart from localStorage...');
        const newCart = JSON.parse(localStorage.getItem('peptideCart') || '[]');
        console.log('New cart data:', newCart);
        
        if (JSON.stringify(newCart) !== JSON.stringify(this.cart)) {
            console.log('Cart has changed, updating...');
            this.cart = newCart;
            this.loadCartItems();
            this.calculateTotals();
            this.updateCartCount();
        } else {
            console.log('Cart unchanged');
        }
    }
    
    // Add a button to manually refresh cart for debugging
    addDebugButton() {
        const debugBtn = document.createElement('button');
        debugBtn.textContent = 'Refresh Cart';
        debugBtn.style.position = 'fixed';
        debugBtn.style.top = '10px';
        debugBtn.style.right = '10px';
        debugBtn.style.zIndex = '9999';
        debugBtn.style.background = '#8B5A96';
        debugBtn.style.color = 'white';
        debugBtn.style.border = 'none';
        debugBtn.style.padding = '10px';
        debugBtn.style.borderRadius = '5px';
        debugBtn.style.cursor = 'pointer';
        
        debugBtn.addEventListener('click', () => {
            this.refreshCart();
        });
        
        document.body.appendChild(debugBtn);
    }    
    
addReloadButton() {
        const reloadBtn = document.createElement('button');
        reloadBtn.textContent = 'Reload Cart';
        reloadBtn.style.position = 'fixed';
        reloadBtn.style.top = '50px';
        reloadBtn.style.right = '10px';
        reloadBtn.style.zIndex = '9999';
        reloadBtn.style.background = '#00b894';
        reloadBtn.style.color = 'white';
        reloadBtn.style.border = 'none';
        reloadBtn.style.padding = '10px';
        reloadBtn.style.borderRadius = '5px';
        reloadBtn.style.cursor = 'pointer';
        
        reloadBtn.addEventListener('click', () => {
            console.log('=== MANUAL CART RELOAD ===');
            
            // Reload cart from localStorage
            this.cart = JSON.parse(localStorage.getItem('peptideCart') || '[]');
            console.log('Reloaded cart:', this.cart);
            
            // Reload items and recalculate
            this.loadCartItems();
            this.calculateTotals();
            
            console.log('=== RELOAD COMPLETE ===');
        });
        
        document.body.appendChild(reloadBtn);
    }
// Fallbac
k function to load cart if main class fails
function fallbackCartLoad() {
    console.log('Running fallback cart loading...');
    
    try {
        const cart = JSON.parse(localStorage.getItem('peptideCart') || '[]');
        console.log('Fallback: Cart loaded:', cart);
        
        if (cart.length > 0) {
            // Load items
            const orderItems = document.getElementById('orderItems');
            if (orderItems) {
                let html = '';
                cart.forEach(item => {
                    html += `
                        <div class="order-item">
                            <div class="item-info">
                                <div class="item-name">${item.name}</div>
                                <div class="item-details">Quantity: ${item.quantity || 1}</div>
                            </div>
                            <div class="item-price">${item.price}</div>
                        </div>
                    `;
                });
                orderItems.innerHTML = html;
                console.log('Fallback: Items loaded');
            }
            
            // Calculate totals
            let subtotal = 0;
            cart.forEach(item => {
                let price = 0;
                if (item.unitPrice) {
                    price = item.unitPrice * (item.quantity || 1);
                } else {
                    const cleanPrice = item.price.replace(/[฿,$]/g, '');
                    price = parseInt(cleanPrice) || 0;
                }
                subtotal += price;
            });
            
            // Update totals
            const subtotalElement = document.getElementById('subtotal');
            const totalElement = document.getElementById('total');
            const btcAmountElement = document.getElementById('btcAmount');
            const ethAmountElement = document.getElementById('ethAmount');
            
            const total = subtotal + 200; // Add shipping
            
            if (subtotalElement) {
                subtotalElement.textContent = `฿${subtotal.toLocaleString()}`;
            }
            if (totalElement) {
                totalElement.textContent = `฿${total.toLocaleString()}`;
            }
            if (btcAmountElement) {
                btcAmountElement.textContent = `฿${total.toLocaleString()}`;
            }
            if (ethAmountElement) {
                ethAmountElement.textContent = `฿${total.toLocaleString()}`;
            }
            
            console.log('Fallback: Totals calculated - Subtotal:', subtotal, 'Total:', total);
        }
        
    } catch (error) {
        console.error('Fallback cart loading failed:', error);
    }
}

// Add fallback initialization
setTimeout(() => {
    console.log('Running fallback check...');
    
    // Check if cart was loaded properly
    const orderItems = document.getElementById('orderItems');
    const subtotalElement = document.getElementById('subtotal');
    
    if (orderItems && subtotalElement) {
        const hasItems = orderItems.innerHTML.includes('order-item');
        const hasSubtotal = subtotalElement.textContent !== '฿0';
        
        console.log('Cart check - Has items:', hasItems, 'Has subtotal:', hasSubtotal);
        
        if (!hasItems || !hasSubtotal) {
            console.log('Cart not loaded properly, running fallback...');
            fallbackCartLoad();
        }
    }
}, 2000);