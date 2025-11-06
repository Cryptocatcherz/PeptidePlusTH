// Emergency cart hiding script
console.log('Loading emergency cart hiding script...');

function forceHideAllCarts() {
    console.log('Force hiding all cart displays...');
    
    // Remove any elements that might be cart displays
    const selectors = [
        '.cart-slideout',
        '.cart-overlay', 
        '.cart-widget',
        '.mini-cart',
        '.cart-summary',
        '.persistent-cart',
        '[class*="cart-display"]',
        '[class*="shopping-cart"]'
    ];
    
    selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            console.log('Removing cart element:', el);
            el.remove();
        });
    });
    
    // Hide any elements with cart-related text content
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
        if (el.textContent && el.textContent.includes('Shopping Cart') && 
            !el.classList.contains('cart-btn') && 
            !el.classList.contains('cart-count')) {
            console.log('Hiding element with cart text:', el);
            el.style.display = 'none';
        }
    });
    
    // Remove any fixed positioned elements at the bottom
    const fixedElements = document.querySelectorAll('*');
    fixedElements.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.position === 'fixed' && 
            (style.bottom === '0px' || parseInt(style.bottom) < 100) &&
            el.textContent && 
            (el.textContent.includes('Subtotal') || el.textContent.includes('Total'))) {
            console.log('Removing fixed bottom element:', el);
            el.remove();
        }
    });
}

// Run immediately
forceHideAllCarts();

// Run when DOM is ready
document.addEventListener('DOMContentLoaded', forceHideAllCarts);

// Run after a delay to catch dynamically created elements
setTimeout(forceHideAllCarts, 500);
setTimeout(forceHideAllCarts, 1000);
setTimeout(forceHideAllCarts, 2000);

// Make globally available
window.forceHideAllCarts = forceHideAllCarts;

console.log('Emergency cart hiding script loaded');