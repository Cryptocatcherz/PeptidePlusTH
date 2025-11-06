// Debug script to check cart state
console.log('=== CART DEBUG START ===');
console.log('Page URL:', window.location.href);
console.log('localStorage peptideCart:', localStorage.getItem('peptideCart'));

try {
    const cart = JSON.parse(localStorage.getItem('peptideCart') || '[]');
    console.log('Parsed cart:', cart);
    console.log('Cart length:', cart.length);
    console.log('Cart items:', cart.map(item => item.name));
} catch (error) {
    console.error('Error parsing cart:', error);
}

console.log('=== CART DEBUG END ===');

// Monitor localStorage changes
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
    if (key === 'peptideCart') {
        console.log('localStorage.setItem called for peptideCart:', value);
        console.trace('Call stack:');
    }
    return originalSetItem.apply(this, arguments);
};

// Monitor cart count updates
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.target.classList.contains('cart-count')) {
            console.log('Cart count changed to:', mutation.target.textContent);
        }
    });
});

// Start observing
document.addEventListener('DOMContentLoaded', function() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        observer.observe(cartCount, { childList: true, characterData: true, subtree: true });
        console.log('Started monitoring cart count element');
    }
});
//
 Add manual test functions to window
window.testCart = {
    add: function() {
        const testItem = {
            name: 'Test Product',
            price: '฿1000',
            quantity: 1,
            id: Date.now()
        };
        
        let cart = JSON.parse(localStorage.getItem('peptideCart') || '[]');
        cart.push(testItem);
        localStorage.setItem('peptideCart', JSON.stringify(cart));
        
        console.log('Added test item to cart:', testItem);
        console.log('Cart now contains:', cart);
        
        // Update cart count if element exists
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = cart.length;
        }
        
        return cart;
    },
    
    clear: function() {
        localStorage.removeItem('peptideCart');
        console.log('Cleared cart');
        
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = '0';
        }
    },
    
    show: function() {
        const cart = JSON.parse(localStorage.getItem('peptideCart') || '[]');
        console.log('Current cart:', cart);
        return cart;
    },
    
    goToCheckout: function() {
        window.location.href = 'checkout.html';
    }
};

console.log('Cart test functions available: testCart.add(), testCart.clear(), testCart.show(), testCart.goToCheckout()');