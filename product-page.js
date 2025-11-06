// Clean Product Page Script
class ProductPage {
    constructor() {
        this.currentPrice = 1200;
        this.currentPriceTHB = 1200; // Always store original THB price
        this.selectedQuantity = 5;
        this.init();
    }

    init() {
        this.initQuantityButtons();
        this.initAddToCart();
        this.calculateDeliveryDate();
    }

    getCurrencyInfo() {
        // Get currency info from global currency converter
        if (window.currencyConverter) {
            return window.currencyConverter.getCurrentCurrencyInfo();
        }
        // Fallback to THB
        return { code: 'THB', symbol: '฿', rate: 1 };
    }

    initQuantityButtons() {
        const quantityButtons = document.querySelectorAll('.quantity-btn');

        quantityButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                quantityButtons.forEach(b => b.classList.remove('active'));

                // Add active class to clicked button
                btn.classList.add('active');

                // Update selected quantity and price
                this.selectedQuantity = parseInt(btn.dataset.quantity) || 1;
                this.currentPriceTHB = parseInt(btn.dataset.price) || 1200;

                // Convert price to current currency
                const currencyInfo = this.getCurrencyInfo();
                this.currentPrice = this.currentPriceTHB * currencyInfo.rate;

                // Update price display
                this.updatePriceDisplay();

                console.log('Selected:', this.selectedQuantity, 'vials at', currencyInfo.symbol + this.currentPrice.toFixed(2));
            });
        });

        // Set first button as active by default
        if (quantityButtons.length > 0) {
            quantityButtons[0].click();
        }
    }

    updatePriceDisplay() {
        const currencyInfo = this.getCurrencyInfo();
        const formattedPrice = this.formatPrice(this.currentPrice, currencyInfo.code);

        const priceElements = document.querySelectorAll('.current-price');
        priceElements.forEach(el => {
            el.textContent = `${currencyInfo.symbol}${formattedPrice}`;
        });
    }

    formatPrice(price, currencyCode) {
        // Format based on currency
        if (currencyCode === 'JPY' || currencyCode === 'KRW' || currencyCode === 'VND' || currencyCode === 'IDR') {
            return Math.round(price).toLocaleString();
        } else if (currencyCode === 'BTC' || currencyCode === 'ETH') {
            return price.toFixed(8);
        } else {
            return price.toFixed(2);
        }
    }

    initAddToCart() {
        const addToCartBtn = document.querySelector('.add-to-cart-btn');
        
        console.log('Add to cart button found:', !!addToCartBtn);
        
        if (addToCartBtn) {
            console.log('Adding click listener to add to cart button');
            addToCartBtn.addEventListener('click', () => {
                console.log('Add to cart button clicked!');
                this.addToCart();
            });
        } else {
            console.error('Add to cart button not found!');
        }
    }

    addToCart() {
        console.log('addToCart method called');

        // Get product name from page
        const productNameElement = document.querySelector('.product-info h1');
        console.log('Product name element:', productNameElement);

        if (!productNameElement) {
            console.error('Product name not found');
            return;
        }

        const productName = productNameElement.textContent.trim();
        console.log('Product name:', productName);

        // Get current currency info
        const currencyInfo = this.getCurrencyInfo();
        const formattedPrice = this.formatPrice(this.currentPrice, currencyInfo.code);

        // Create cart item with both THB and current currency
        const cartItem = {
            id: Date.now(),
            name: `${productName} - ${this.selectedQuantity} vials`,
            price: `${currencyInfo.symbol}${formattedPrice}`,
            quantity: this.selectedQuantity,
            unitPrice: this.currentPrice,
            unitPriceTHB: this.currentPriceTHB, // Store THB price for conversion
            currency: currencyInfo.code
        };

        console.log('Cart item to add:', cartItem);
        console.log('Window cart system available:', !!window.cartSystem);

        // Add to cart using global cart system
        if (window.cartSystem) {
            console.log('Adding item to cart system...');
            window.cartSystem.addItem(cartItem);
            this.showAddedToCartFeedback();
        } else {
            console.error('Cart system not available');

            // Fallback: try to wait for cart system
            setTimeout(() => {
                if (window.cartSystem) {
                    console.log('Cart system now available, adding item...');
                    window.cartSystem.addItem(cartItem);
                    this.showAddedToCartFeedback();
                } else {
                    console.error('Cart system still not available after timeout');
                }
            }, 500);
        }
    }

    showAddedToCartFeedback() {
        const addToCartBtn = document.querySelector('.add-to-cart-btn');
        if (!addToCartBtn) return;

        const originalText = addToCartBtn.textContent;
        const originalBg = addToCartBtn.style.backgroundColor;

        addToCartBtn.textContent = '✓ Added to Cart!';
        addToCartBtn.style.backgroundColor = '#00b894';
        addToCartBtn.disabled = true;

        setTimeout(() => {
            addToCartBtn.textContent = originalText;
            addToCartBtn.style.backgroundColor = originalBg;
            addToCartBtn.disabled = false;
        }, 2000);
    }

    calculateDeliveryDate() {
        try {
            const today = new Date();
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
        }
    }
}

// Initialize product page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Product page script loaded');
    
    // Only initialize on product pages
    const productInfo = document.querySelector('.product-info');
    console.log('Product info element found:', !!productInfo);
    
    if (productInfo) {
        console.log('Initializing ProductPage...');
        new ProductPage();
    } else {
        console.log('Not a product page, skipping ProductPage initialization');
    }
});