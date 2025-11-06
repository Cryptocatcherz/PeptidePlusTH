// Simple, reliable cart system
console.log('Simple cart script loading...');

// Global cart object
window.simpleCart = {
    items: [],
    
    init: function() {
        console.log('Initializing simple cart...');
        this.loadFromStorage();
        this.bindEvents();
        this.updateDisplay();
        console.log('Simple cart initialized with', this.items.length, 'items');
    },
    
    loadFromStorage: function() {
        try {
            const stored = localStorage.getItem('peptideCart');
            this.items = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading cart:', error);
            this.items = [];
        }
    },
    
    saveToStorage: function() {
        try {
            localStorage.setItem('peptideCart', JSON.stringify(this.items));
            console.log('Cart saved:', this.items.length, 'items');
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    },
    
    addItem: function(name, price, quantity) {
        const item = {
            id: Date.now(),
            name: name,
            price: price,
            quantity: quantity || 1,
            unitPrice: this.extractPrice(price)
        };
        
        this.items.push(item);
        this.saveToStorage();
        this.updateDisplay();
        
        console.log('Item added:', item);
        alert('Added to cart: ' + name);
        
        return item;
    },
    
    extractPrice: function(priceString) {
        if (!priceString) return 0;
        const cleaned = priceString.replace(/[฿,$\s]/g, '');
        return parseInt(cleaned) || 0;
    },
    
    updateDisplay: function() {
        // Update cart count
        const cartCounts = document.querySelectorAll('.cart-count');
        cartCounts.forEach(el => {
            el.textContent = this.items.length;
        });
    },
    
    bindEvents: function() {
        // Cart button click
        document.addEventListener('click', (e) => {
            if (e.target.closest('.cart-btn')) {
                e.preventDefault();
                this.showCart();
            }
        });
        
        // Add to cart button click
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart-btn')) {
                e.preventDefault();
                this.handleAddToCart();
            }
        });
    },
    
    handleAddToCart: function() {
        console.log('Add to cart clicked');
        
        // Get product info
        const productName = document.querySelector('.product-info h1');
        if (!productName) {
            console.error('Product name not found');
            return;
        }
        
        // For now, use default values
        const name = productName.textContent + ' - 5 vials';
        const price = '฿1,200';
        const quantity = 5;
        
        this.addItem(name, price, quantity);
    },
    
    showCart: function() {
        if (this.items.length === 0) {
            alert('Your cart is empty');
            return;
        }
        
        let cartText = 'Cart Contents:\n\n';
        let total = 0;
        
        this.items.forEach((item, index) => {
            const itemTotal = item.unitPrice * item.quantity;
            total += itemTotal;
            cartText += `${index + 1}. ${item.name}\n`;
            cartText += `   Price: ฿${itemTotal.toLocaleString()}\n\n`;
        });
        
        cartText += `Total: ฿${total.toLocaleString()}\n\n`;
        cartText += 'Go to checkout?';
        
        if (confirm(cartText)) {
            window.location.href = 'checkout.html';
        }
    },
    
    clear: function() {
        this.items = [];
        this.saveToStorage();
        this.updateDisplay();
        console.log('Cart cleared');
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM ready, initializing simple cart...');
    window.simpleCart.init();
});

// Also initialize immediately in case DOM is already ready
if (document.readyState === 'loading') {
    console.log('DOM still loading, waiting...');
} else {
    console.log('DOM already ready, initializing simple cart now...');
    window.simpleCart.init();
}

console.log('Simple cart script loaded');