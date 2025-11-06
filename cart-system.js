// Clean Cart System - Single source of truth
class CartSystem {
    constructor() {
        this.storageKey = 'peptideCart';
        this.items = this.loadFromStorage();
        this.init();
    }

    init() {
        this.createSlideoutCart();
        this.updateCartDisplay();
        this.bindEvents();
        
        // Ensure cart is hidden on initialization
        this.forceHideCart();
        
        // Make globally accessible
        window.cartSystem = this;
        
        console.log('Cart system initialized with', this.items.length, 'items');
    }
    
    forceHideCart() {
        // Force hide cart on page load
        setTimeout(() => {
            if (this.cartOverlay && this.cartSlideout) {
                this.cartOverlay.classList.remove('active');
                this.cartSlideout.classList.remove('active');
                document.body.style.overflow = '';
                console.log('Cart forced to hidden state');
            }
        }, 100);
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            const items = stored ? JSON.parse(stored) : [];
            
            // Clean up any items with invalid data
            const cleanedItems = items.map(item => {
                let unitPrice = item.unitPrice;
                
                // Fix NaN unitPrice
                if (isNaN(unitPrice)) {
                    unitPrice = this.extractPrice(item.price);
                    console.log('Fixed NaN unitPrice for item:', item.name, 'new price:', unitPrice);
                }
                
                return {
                    ...item,
                    unitPrice: unitPrice,
                    quantity: isNaN(item.quantity) ? 1 : item.quantity
                };
            });
            
            // Save cleaned data back to storage if we made changes
            if (JSON.stringify(items) !== JSON.stringify(cleanedItems)) {
                localStorage.setItem(this.storageKey, JSON.stringify(cleanedItems));
                console.log('Cleaned up cart data');
            }
            
            return cleanedItems;
        } catch (error) {
            console.error('Error loading cart from storage:', error);
            return [];
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.items));
            console.log('Cart saved to storage:', this.items.length, 'items');
        } catch (error) {
            console.error('Error saving cart to storage:', error);
        }
    }

    addItem(item) {
        // Ensure item has required properties
        let unitPrice = 0;
        
        if (item.unitPrice && !isNaN(item.unitPrice)) {
            unitPrice = item.unitPrice;
        } else if (item.price) {
            unitPrice = this.extractPrice(item.price);
        }
        
        const cartItem = {
            id: item.id || Date.now(),
            name: item.name || 'Unknown Product',
            price: item.price || '฿0',
            quantity: item.quantity || 1,
            unitPrice: unitPrice
        };

        console.log('Adding item to cart:', {
            original: item,
            processed: cartItem,
            extractedPrice: unitPrice
        });

        this.items.push(cartItem);
        this.saveToStorage();
        this.updateCartDisplay();
        
        return cartItem;
    }

    removeItem(id) {
        console.log('removeItem called with ID:', id);
        console.log('Items before removal:', this.items);
        this.items = this.items.filter(item => item.id !== id);
        console.log('Items after removal:', this.items);
        this.saveToStorage();
        this.updateCartDisplay();
        
        console.log('Item removed from cart:', id);
    }

    clearCart() {
        this.items = [];
        this.saveToStorage();
        this.updateCartDisplay();
        
        console.log('Cart cleared');
    }

    extractPrice(priceString) {
        // Extract numeric value from price string like "฿1,200"
        if (!priceString || typeof priceString !== 'string') {
            console.warn('Invalid price string:', priceString);
            return 0;
        }
        
        // Remove currency symbols and spaces, but keep numbers and commas
        const cleaned = priceString.replace(/[฿$€£¥₩₹\s]/g, '').replace(/,/g, '');
        const price = parseInt(cleaned);
        
        if (isNaN(price)) {
            console.warn('Could not parse price:', priceString, 'cleaned:', cleaned);
            return 0;
        }
        
        return price;
    }

    calculateTotals() {
        let subtotal = 0;
        
        this.items.forEach((item, index) => {
            const unitPrice = isNaN(item.unitPrice) ? 0 : item.unitPrice;
            const quantity = isNaN(item.quantity) ? 1 : item.quantity;
            const itemTotal = unitPrice * quantity;
            
            console.log(`Item ${index}: unitPrice=${unitPrice}, quantity=${quantity}, total=${itemTotal}`);
            
            if (!isNaN(itemTotal)) {
                subtotal += itemTotal;
            }
        });

        const shipping = 200;
        const total = subtotal + shipping;

        console.log('Calculated totals:', { subtotal, shipping, total });

        return {
            subtotal: isNaN(subtotal) ? 0 : subtotal,
            shipping,
            total: isNaN(total) ? shipping : total,
            itemCount: this.items.length
        };
    }

    updateCartDisplay() {
        const totals = this.calculateTotals();
        
        // Update cart count in header with animation
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(el => {
            el.textContent = totals.itemCount;
            el.classList.add('updated');
            setTimeout(() => el.classList.remove('updated'), 500);
        });

        // Update slideout cart if it exists
        if (this.cartSlideout) {
            this.updateSlideoutCart();
        }

        // Update checkout page if we're on it
        if (window.location.pathname.includes('checkout.html')) {
            this.updateCheckoutPage(totals);
        }
    }

    updateCheckoutPage(totals) {
        // Update order items
        const orderItems = document.getElementById('orderItems');
        if (orderItems) {
            if (this.items.length === 0) {
                orderItems.innerHTML = `
                    <div class="empty-cart">
                        <i class="fas fa-shopping-cart"></i>
                        <h3>Your cart is empty</h3>
                        <p>Add some products to your cart to proceed with checkout.</p>
                        <a href="index.html" class="continue-shopping-btn">Continue Shopping</a>
                    </div>
                `;
            } else {
                let itemsHTML = '';
                this.items.forEach(item => {
                    itemsHTML += `
                        <div class="order-item">
                            <div class="item-info">
                                <div class="item-name">${item.name}</div>
                                <div class="item-details">Quantity: ${item.quantity}</div>
                            </div>
                            <div class="item-price">฿${(item.unitPrice * item.quantity).toLocaleString()}</div>
                        </div>
                    `;
                });
                orderItems.innerHTML = itemsHTML;
            }
        }

        // Update totals
        const subtotalElement = document.getElementById('subtotal');
        const totalElement = document.getElementById('total');
        const btcAmountElement = document.getElementById('btcAmount');
        const ethAmountElement = document.getElementById('ethAmount');

        if (subtotalElement) {
            subtotalElement.textContent = `฿${totals.subtotal.toLocaleString()}`;
        }
        if (totalElement) {
            totalElement.textContent = `฿${totals.total.toLocaleString()}`;
        }
        if (btcAmountElement) {
            btcAmountElement.textContent = `฿${totals.total.toLocaleString()}`;
        }
        if (ethAmountElement) {
            ethAmountElement.textContent = `฿${totals.total.toLocaleString()}`;
        }

        // Show/hide sections based on cart content
        const orderTotals = document.querySelector('.order-totals');
        const paymentMethods = document.querySelector('.payment-methods');
        const placeOrderBtn = document.querySelector('.place-order-btn');

        if (this.items.length === 0) {
            if (orderTotals) orderTotals.style.display = 'none';
            if (paymentMethods) paymentMethods.style.display = 'none';
            if (placeOrderBtn) placeOrderBtn.style.display = 'none';
        } else {
            if (orderTotals) orderTotals.style.display = 'block';
            if (paymentMethods) paymentMethods.style.display = 'block';
            if (placeOrderBtn) placeOrderBtn.style.display = 'block';
        }

        console.log('Checkout page updated:', totals);
    }

    bindEvents() {
        console.log('Binding cart events...');

        // Cart button clicks - show slideout instead of going to checkout
        document.addEventListener('click', (e) => {
            if (e.target.closest('.cart-btn')) {
                console.log('Cart button clicked!');
                e.preventDefault();
                console.log('Calling showSlideoutCart, this:', this);
                console.log('cartOverlay exists:', !!this.cartOverlay);
                console.log('cartSlideout exists:', !!this.cartSlideout);
                this.showSlideoutCart();
            }
            
            // Close cart when clicking overlay
            if (e.target.classList.contains('cart-overlay')) {
                this.hideSlideoutCart();
            }
            
            // Close cart button
            if (e.target.closest('.cart-close')) {
                this.hideSlideoutCart();
            }
            
            // Remove item buttons
            if (e.target.closest('.cart-item-remove')) {
                console.log('Remove button clicked!');
                const removeBtn = e.target.closest('.cart-item-remove');
                const itemId = parseInt(removeBtn.dataset.itemId);
                console.log('Item ID to remove:', itemId);
                console.log('Current items:', this.items);
                this.removeItem(itemId);
            }
            
            // Clear cart button
            if (e.target.closest('.cart-clear-btn')) {
                if (confirm('Are you sure you want to clear your cart?')) {
                    this.clearCart();
                }
            }
            
            // Checkout button
            if (e.target.closest('.cart-checkout-btn')) {
                this.goToCheckout();
            }
            
            // Continue shopping button
            if (e.target.closest('.continue-shopping')) {
                this.hideSlideoutCart();
            }
        });
        
        // Close cart with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideSlideoutCart();
            }
        });
    }

    goToCheckout() {
        if (this.items.length === 0) {
            alert('Your cart is empty');
            return;
        }
        window.location.href = 'checkout.html';
    }

    // Public methods for external use
    getItems() {
        return [...this.items]; // Return copy to prevent external modification
    }

    getItemCount() {
        return this.items.length;
    }

    getTotals() {
        return this.calculateTotals();
    }
}

// Initialize cart system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Cart system initialization DISABLED to debug cart display issue');
    
    // Add global method to hide any cart displays
    window.hideCart = () => {
        // Remove any cart elements that might exist
        const cartElements = document.querySelectorAll('[class*="cart-"], .cart-overlay, .cart-slideout');
        cartElements.forEach(el => {
            if (!el.classList.contains('cart-btn') && !el.classList.contains('cart-count')) {
                el.style.display = 'none';
                el.remove();
            }
        });
        console.log('All cart displays forcefully hidden');
    };
    
    // Immediately hide any cart displays
    setTimeout(() => {
        window.hideCart();
    }, 100);
    
    /* TEMPORARILY DISABLED - UNCOMMENT TO RE-ENABLE CART
    try {
        const cartSystem = new CartSystem();
        console.log('Cart system initialized successfully');
        
        // Add global method to hide cart
        window.hideCart = () => {
            if (cartSystem.cartOverlay && cartSystem.cartSlideout) {
                cartSystem.cartOverlay.classList.remove('active');
                cartSystem.cartSlideout.classList.remove('active');
                document.body.style.overflow = '';
                console.log('Cart hidden via global method');
            }
        };
        
    } catch (error) {
        console.error('Error initializing cart system:', error);
    }
    */
});

// Extension methods for CartSystem removed - no debug buttons needed

CartSystem.prototype.createSlideoutCart = function() {
        // Create cart overlay
        const overlay = document.createElement('div');
        overlay.className = 'cart-overlay';
        
        // Create cart slideout
        const slideout = document.createElement('div');
        slideout.className = 'cart-slideout';
        
        slideout.innerHTML = `
            <div class="cart-header">
                <h3 class="cart-title">Shopping Cart</h3>
                <button class="cart-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="cart-items" id="slideout-cart-items">
                <!-- Cart items will be populated here -->
            </div>
            
            <div class="cart-footer">
                <div class="cart-totals">
                    <div class="cart-total-row">
                        <span>Subtotal</span>
                        <span id="slideout-subtotal">฿0</span>
                    </div>
                    <div class="cart-total-row">
                        <span>Shipping</span>
                        <span>฿200</span>
                    </div>
                    <div class="cart-total-row final">
                        <span>Total</span>
                        <span id="slideout-total">฿200</span>
                    </div>
                </div>
                
                <div class="cart-actions">
                    <button class="cart-checkout-btn">
                        <i class="fas fa-credit-card"></i>
                        Proceed to Checkout
                    </button>
                    <button class="cart-clear-btn">
                        <i class="fas fa-trash"></i>
                        Clear Cart
                    </button>
                </div>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(overlay);
        document.body.appendChild(slideout);
        
        // Store references
        this.cartOverlay = overlay;
        this.cartSlideout = slideout;
        
        console.log('Slideout cart created');
};

CartSystem.prototype.showSlideoutCart = function() {
        console.log('showSlideoutCart called');
        console.log('Overlay:', this.cartOverlay);
        console.log('Slideout:', this.cartSlideout);

        this.updateSlideoutCart();

        if (this.cartOverlay && this.cartSlideout) {
            this.cartOverlay.classList.add('active');
            this.cartSlideout.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
            console.log('Slideout cart shown');
        } else {
            console.error('Cart overlay or slideout not found!');
        }
};

CartSystem.prototype.hideSlideoutCart = function() {
        this.cartOverlay.classList.remove('active');
        this.cartSlideout.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
        
        console.log('Slideout cart hidden');
};

CartSystem.prototype.updateSlideoutCart = function() {
        const itemsContainer = document.getElementById('slideout-cart-items');
        const subtotalElement = document.getElementById('slideout-subtotal');
        const totalElement = document.getElementById('slideout-total');
        const checkoutBtn = document.querySelector('.cart-checkout-btn');
        
        if (!itemsContainer) return;
        
        // Update items
        if (this.items.length === 0) {
            itemsContainer.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Your cart is empty</h3>
                    <p>Add some products to get started</p>
                    <button class="continue-shopping">Continue Shopping</button>
                </div>
            `;
            
            if (checkoutBtn) checkoutBtn.disabled = true;
        } else {
            let itemsHTML = '';
            
            this.items.forEach(item => {
                const itemTotal = (item.unitPrice * item.quantity);
                
                itemsHTML += `
                    <div class="cart-item">
                        <div class="cart-item-image">
                            <i class="fas fa-flask"></i>
                        </div>
                        <div class="cart-item-details">
                            <div class="cart-item-name">${item.name}</div>
                            <div class="cart-item-meta">Quantity: ${item.quantity} • ฿${item.unitPrice.toLocaleString()} each</div>
                            <div class="cart-item-price">฿${itemTotal.toLocaleString()}</div>
                        </div>
                        <button class="cart-item-remove" data-item-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
            });
            
            itemsContainer.innerHTML = itemsHTML;
            
            if (checkoutBtn) checkoutBtn.disabled = false;
        }
        
        // Update totals
        const totals = this.calculateTotals();
        
        if (subtotalElement) {
            subtotalElement.textContent = `฿${totals.subtotal.toLocaleString()}`;
        }
        if (totalElement) {
            totalElement.textContent = `฿${totals.total.toLocaleString()}`;
        }
};