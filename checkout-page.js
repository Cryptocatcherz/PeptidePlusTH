// Clean Checkout Page Script
class CheckoutPage {
    constructor() {
        this.init();
    }

    async init() {
        this.initPaymentMethods();
        this.initForm();
        this.initCopyButtons();

        // Fetch payment addresses from backend first (secure)
        await this.fetchPaymentAddresses();

        // Fetch crypto prices first, then generate QR codes
        this.fetchCryptoPrices().then(() => {
            this.generateQRCodes();
        });

        // Wait for cart system to be ready, then update display
        if (window.cartSystem) {
            window.cartSystem.updateCartDisplay();
        } else {
            // Wait for cart system to initialize
            setTimeout(() => {
                if (window.cartSystem) {
                    window.cartSystem.updateCartDisplay();
                }
            }, 100);
        }

        console.log('Checkout page initialized');
    }

    async fetchPaymentAddresses() {
        const BACKEND_URL = 'http://localhost:3000'; // TODO: Change to production URL

        try {
            const response = await fetch(`${BACKEND_URL}/api/payment-addresses`);
            const data = await response.json();

            if (data.success) {
                this.btcAddress = data.addresses.bitcoin;
                this.ethAddress = data.addresses.ethereum;
                console.log('Payment addresses fetched securely from backend');
            } else {
                throw new Error('Failed to fetch addresses');
            }
        } catch (error) {
            console.error('Failed to fetch payment addresses:', error);
            // Fallback to hardcoded (NOT RECOMMENDED FOR PRODUCTION)
            this.btcAddress = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
            this.ethAddress = '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87';
            console.warn('Using fallback addresses - UPDATE FOR PRODUCTION!');
        }
    }

    async fetchCryptoPrices() {
        console.log('Fetching crypto prices...');

        try {
            // Using CoinGecko API (free, no auth required)
            // Get BTC and ETH prices in THB
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=thb');
            const data = await response.json();

            this.btcPriceInTHB = data.bitcoin.thb;
            this.ethPriceInTHB = data.ethereum.thb;

            console.log('Crypto prices fetched:', {
                BTC: `฿${this.btcPriceInTHB.toLocaleString()}`,
                ETH: `฿${this.ethPriceInTHB.toLocaleString()}`
            });

            return true;
        } catch (error) {
            console.error('Failed to fetch crypto prices:', error);
            // Set fallback prices (approximate)
            this.btcPriceInTHB = 3000000; // ~3M THB per BTC
            this.ethPriceInTHB = 100000;  // ~100K THB per ETH
            console.warn('Using fallback prices');
            return false;
        }
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
                const selectedDetails = document.querySelector(`#${option.value}-payment`);
                if (selectedDetails) {
                    selectedDetails.classList.add('active');
                }
            });
        });

        // Set first option as default
        if (paymentOptions.length > 0) {
            paymentOptions[0].checked = true;
            paymentOptions[0].dispatchEvent(new Event('change'));
        }
    }

    initForm() {
        const form = document.getElementById('checkoutForm');
        
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processOrder();
            });
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
                });
            });
        });
    }

    generateQRCodes() {
        console.log('Attempting to generate QR codes via API...');

        // Always generate QR codes using API method (doesn't require library)
        // The createBitcoinQR and createEthereumQR methods use the QR Server API
        // which is more reliable than the JavaScript library

        this.createBitcoinQR();
        this.createEthereumQR();

        console.log('QR code generation initiated (using API method)');
    }

    createBitcoinQR() {
        const btcAddress = this.btcAddress || '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
        const container = document.querySelector('#bitcoin-payment .qr-code');

        // Get the total amount from cart
        let totalAmount = 0;
        if (window.cartSystem) {
            const totals = window.cartSystem.getTotals();
            totalAmount = totals.total;
        }

        console.log('Creating Bitcoin QR code...', {
            address: btcAddress,
            container: !!container,
            amount: totalAmount
        });

        if (!container) {
            console.error('Bitcoin QR container not found');
            return;
        }

        container.innerHTML = '<div style="text-align:center;padding:20px;">Loading QR code...</div>';

        // Calculate BTC amount from THB
        let btcAmount = 0;
        if (this.btcPriceInTHB && totalAmount > 0) {
            btcAmount = totalAmount / this.btcPriceInTHB;
        }

        // Create Bitcoin URI with amount (BIP21 format)
        const label = `PeptidePlaza Order`;
        let bitcoinURI = `bitcoin:${btcAddress}`;

        if (btcAmount > 0) {
            // Format BTC to 8 decimal places (satoshi precision)
            bitcoinURI += `?amount=${btcAmount.toFixed(8)}`;
            bitcoinURI += `&label=${encodeURIComponent(label)}`;
            bitcoinURI += `&message=${encodeURIComponent(`฿${totalAmount.toLocaleString()} THB`)}`;
        } else {
            bitcoinURI += `?label=${encodeURIComponent(label)}`;
        }

        // Use QR code API as primary method (more reliable)
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(bitcoinURI)}`;

        console.log('Bitcoin amount:', btcAmount, 'BTC');
        console.log('Bitcoin URI:', bitcoinURI);
        console.log('Bitcoin QR API URL:', qrApiUrl);

        const img = document.createElement('img');
        img.src = qrApiUrl;
        img.alt = 'Bitcoin QR Code';
        img.style.width = '200px';
        img.style.height = '200px';
        img.style.display = 'block';
        img.style.margin = '0 auto';
        img.style.border = '10px solid white';
        img.style.borderRadius = '8px';
        img.style.background = 'white';

        // Handle image load success
        img.onload = () => {
            console.log('✅ Bitcoin QR code loaded successfully via API!');
            container.innerHTML = '';
            container.appendChild(img);
        };

        // Handle image load error - fallback to library method or text
        img.onerror = (error) => {
            console.error('❌ QR API failed:', error);
            console.warn('Trying library method...');
            this.tryLibraryQR(container, btcAddress, 'bitcoin');
        };

        // Append immediately to start loading
        container.innerHTML = '';
        container.appendChild(img);
    }

    tryLibraryQR(container, address, type) {
        if (typeof QRCode !== 'undefined') {
            try {
                container.innerHTML = '';
                const canvas = document.createElement('canvas');
                canvas.style.display = 'block';
                canvas.style.margin = '0 auto';
                container.appendChild(canvas);

                QRCode.toCanvas(canvas, address, {
                    width: 200,
                    height: 200,
                    colorDark: '#2d3436',
                    colorLight: '#ffffff',
                    margin: 2
                }, (error) => {
                    if (error) {
                        console.error('Library QR generation failed:', error);
                        this.showQRFallback(container, type);
                    } else {
                        console.log('QR code generated via library');
                    }
                });
            } catch (error) {
                console.error('Library QR exception:', error);
                this.showQRFallback(container, type);
            }
        } else {
            console.log('QRCode library not available');
            this.showQRFallback(container, type);
        }
    }

    createEthereumQR() {
        const ethAddress = this.ethAddress || '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87';
        const container = document.querySelector('#ethereum-payment .qr-code');

        // Get the total amount from cart
        let totalAmount = 0;
        if (window.cartSystem) {
            const totals = window.cartSystem.getTotals();
            totalAmount = totals.total;
        }

        console.log('Creating Ethereum QR code...', {
            address: ethAddress,
            container: !!container,
            amount: totalAmount
        });

        if (!container) {
            console.error('Ethereum QR container not found');
            return;
        }

        container.innerHTML = '<div style="text-align:center;padding:20px;">Loading QR code...</div>';

        // Calculate ETH amount from THB
        let ethAmount = 0;
        if (this.ethPriceInTHB && totalAmount > 0) {
            ethAmount = totalAmount / this.ethPriceInTHB;
        }

        // Create Ethereum URI with value (EIP-681 format)
        const label = `PeptidePlaza Order`;
        let ethereumURI = `ethereum:${ethAddress}@1`;

        if (ethAmount > 0) {
            // Convert ETH to wei (1 ETH = 10^18 wei)
            const weiAmount = Math.floor(ethAmount * Math.pow(10, 18));
            ethereumURI += `?value=${weiAmount}`;
            ethereumURI += `&label=${encodeURIComponent(label)}`;
        } else {
            ethereumURI += `?label=${encodeURIComponent(label)}`;
        }

        // Use QR code API as primary method (more reliable)
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ethereumURI)}`;

        console.log('Ethereum amount:', ethAmount, 'ETH');
        console.log('Ethereum URI:', ethereumURI);
        console.log('Ethereum QR API URL:', qrApiUrl);

        const img = document.createElement('img');
        img.src = qrApiUrl;
        img.alt = 'Ethereum QR Code';
        img.style.width = '200px';
        img.style.height = '200px';
        img.style.display = 'block';
        img.style.margin = '0 auto';
        img.style.border = '10px solid white';
        img.style.borderRadius = '8px';
        img.style.background = 'white';

        // Handle image load success
        img.onload = () => {
            console.log('✅ Ethereum QR code loaded successfully via API!');
            container.innerHTML = '';
            container.appendChild(img);
        };

        // Handle image load error - fallback to library method or text
        img.onerror = (error) => {
            console.error('❌ QR API failed:', error);
            console.warn('Trying library method...');
            this.tryLibraryQR(container, ethAddress, 'ethereum');
        };

        // Append immediately to start loading
        container.innerHTML = '';
        container.appendChild(img);
    }

    showQRFallback(container, type) {
        const icon = type === 'bitcoin' ? 'bitcoin' : 'ethereum';
        container.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <i class="fab fa-${icon}" style="font-size: 3rem; color: #8B5A96; margin-bottom: 10px;"></i>
                <p style="margin: 10px 0; color: #636e72;">Scan with wallet app</p>
                <small style="color: #636e72;">Use address below if QR unavailable</small>
            </div>
        `;
    }

    showQRFallbacks() {
        const btcContainer = document.querySelector('#bitcoin-payment .qr-code');
        const ethContainer = document.querySelector('#ethereum-payment .qr-code');
        
        if (btcContainer) this.showQRFallback(btcContainer, 'bitcoin');
        if (ethContainer) this.showQRFallback(ethContainer, 'ethereum');
    }

    async processOrder() {
        const formData = new FormData(document.getElementById('checkoutForm'));
        const orderData = {};

        // Collect form data
        for (let [key, value] of formData.entries()) {
            orderData[key] = value;
        }

        // Add cart and payment info
        if (window.cartSystem) {
            const totals = window.cartSystem.getTotals();
            orderData.items = window.cartSystem.getItems();
            orderData.subtotal = totals.subtotal;
            orderData.total = totals.total;
        }

        orderData.paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;

        // Add crypto amount if available
        if (orderData.paymentMethod === 'bitcoin' && this.btcPriceInTHB) {
            const btcAmount = orderData.total / this.btcPriceInTHB;
            orderData.cryptoAmount = btcAmount.toFixed(8) + ' BTC';
        } else if (orderData.paymentMethod === 'ethereum' && this.ethPriceInTHB) {
            const ethAmount = orderData.total / this.ethPriceInTHB;
            orderData.cryptoAmount = ethAmount.toFixed(6) + ' ETH';
        }

        // Add timestamp
        orderData.timestamp = new Date().toISOString();

        console.log('Submitting order:', orderData);

        // Send to backend
        try {
            const response = await this.submitOrderToBackend(orderData);

            if (response.success) {
                console.log('Order submitted successfully:', response.orderId);
                this.showOrderConfirmation(orderData, response.orderId);
            } else {
                throw new Error(response.error || 'Order submission failed');
            }
        } catch (error) {
            console.error('Order submission error:', error);
            this.showOrderError(error.message);
        }
    }

    async submitOrderToBackend(orderData) {
        // Backend URL - change this to your deployed backend URL
        const BACKEND_URL = 'http://localhost:3000'; // TODO: Change to production URL

        try {
            const response = await fetch(`${BACKEND_URL}/api/submit-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success) {
                return data;
            } else {
                throw new Error(data.error || 'Order submission failed');
            }

        } catch (error) {
            console.error('Backend request failed:', error);

            // CRITICAL: Do NOT fake success - show proper error
            throw new Error(`Unable to process order: ${error.message}. Please contact support at orders@peptideplaza.com with your cart details.`);
        }
    }

    showOrderConfirmation(orderData, orderId) {
        const message = `✅ Order Confirmed!\n\nOrder ID: ${orderId}\nTotal: ฿${orderData.total?.toLocaleString() || '0'}\n\nPayment Instructions:\n1. ${orderData.paymentMethod === 'bitcoin' ? 'Send Bitcoin' : 'Send Ethereum'} to the address shown\n2. Email transaction ID to orders@peptideplaza.com\n3. Include your Order ID: ${orderId}\n\nYou will receive confirmation within 30 minutes.`;

        alert(message);

        // Clear cart after successful order
        if (window.cartSystem) {
            window.cartSystem.clearCart();
        }

        // Redirect to thank you page or home after 2 seconds
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }

    showOrderError(errorMessage) {
        alert(`❌ Order submission failed:\n\n${errorMessage}\n\nPlease try again or contact support.`);
    }
}

// Initialize checkout page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on checkout page
    if (document.getElementById('checkoutForm')) {
        new CheckoutPage();
    }
});