// Shopping Cart Functionality
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('peptideCart') || '[]');
        this.cartCount = document.querySelector('.cart-count');
        this.cartBtn = document.querySelector('.cart-btn');
        this.init();
        this.updateCartCount();
        
        // Make cart globally accessible
        window.shoppingCart = this;
        
        // Sync cart every 2 seconds to catch external updates
        setInterval(() => {
            this.syncWithStorage();
        }, 2000);
    }

    init() {
        // Only add cart functionality to actual "Add to Cart" buttons, not "Select options"
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // This will be handled by product-specific scripts
                console.log('Add to cart button clicked');
            });
        });

        // Cart button click handler
        if (this.cartBtn) {
            this.cartBtn.addEventListener('click', () => {
                console.log('Cart button clicked!');
                console.log('Current cart items:', this.items);
                console.log('Cart length:', this.items.length);
                console.log('localStorage cart:', localStorage.getItem('peptideCart'));
                
                // Sync before showing cart
                this.syncWithStorage();
                console.log('After sync - cart items:', this.items);
                
                this.showCart();
            });
        }
    }

    addItem(item) {
        this.items.push(item);
        localStorage.setItem('peptideCart', JSON.stringify(this.items));
        this.updateCartCount();
        console.log('Added to cart:', item);
    }
    
    // Sync cart with localStorage (for when other scripts add items)
    syncWithStorage() {
        const storedItems = JSON.parse(localStorage.getItem('peptideCart') || '[]');
        console.log('Syncing cart - Current items:', this.items.length, 'Stored items:', storedItems.length);
        
        if (JSON.stringify(storedItems) !== JSON.stringify(this.items)) {
            console.log('Cart changed! Old:', this.items, 'New:', storedItems);
            this.items = storedItems;
            this.updateCartCount();
            console.log('Cart synced with localStorage:', this.items);
        }
    }

    updateCartCount() {
        if (this.cartCount) {
            this.cartCount.textContent = this.items.length;
            
            // Animate cart icon
            this.cartBtn.style.transform = 'scale(1.1)';
            setTimeout(() => {
                this.cartBtn.style.transform = 'scale(1)';
            }, 200);
        }
    }

    showAddedToCart(button) {
        const originalText = button.textContent;
        button.textContent = 'Added!';
        button.style.background = '#00b894';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 1500);
    }

    showCart() {
        if (this.items.length === 0) {
            alert('Your cart is empty');
            return;
        }

        // Redirect to checkout page
        window.location.href = 'checkout.html';
    }
}

// Bitcoin Payment Integration
class BitcoinPayment {
    constructor() {
        this.btcAddress = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'; // Example address
        this.init();
    }

    init() {
        // Add Bitcoin payment option to payment methods
        this.addBitcoinPaymentHandler();
    }

    addBitcoinPaymentHandler() {
        const bitcoinMethod = document.querySelector('.payment-method');
        if (bitcoinMethod) {
            bitcoinMethod.addEventListener('click', () => {
                this.showBitcoinPayment();
            });
        }
    }

    showBitcoinPayment() {
        const modal = this.createPaymentModal();
        document.body.appendChild(modal);
    }

    createPaymentModal() {
        const modal = document.createElement('div');
        modal.className = 'bitcoin-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fab fa-bitcoin"></i> Bitcoin Payment</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Send Bitcoin to the address below:</p>
                    <div class="btc-address">
                        <code>${this.btcAddress}</code>
                        <button class="copy-btn" onclick="navigator.clipboard.writeText('${this.btcAddress}')">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                    <div class="qr-placeholder">
                        <i class="fas fa-qrcode"></i>
                        <p>QR Code would appear here</p>
                    </div>
                    <p class="payment-note">
                        <strong>Note:</strong> After sending payment, please contact us with your transaction ID for order confirmation.
                    </p>
                </div>
            </div>
        `;

        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .bitcoin-modal {
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
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
            }
            .modal-header {
                padding: 20px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .modal-header h3 {
                margin: 0;
                color: #f39c12;
            }
            .close-modal {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #999;
            }
            .modal-body {
                padding: 20px;
            }
            .btc-address {
                display: flex;
                align-items: center;
                gap: 10px;
                margin: 20px 0;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 8px;
            }
            .btc-address code {
                flex: 1;
                font-family: monospace;
                word-break: break-all;
            }
            .copy-btn {
                background: #8B5A96;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 5px;
                cursor: pointer;
            }
            .qr-placeholder {
                text-align: center;
                padding: 40px;
                background: #f8f9fa;
                border-radius: 8px;
                margin: 20px 0;
                color: #999;
            }
            .qr-placeholder i {
                font-size: 48px;
                margin-bottom: 10px;
            }
            .payment-note {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                padding: 15px;
                border-radius: 8px;
                margin-top: 20px;
            }
        `;
        document.head.appendChild(style);

        // Close modal functionality
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        return modal;
    }
}

// Smooth Scrolling for Navigation
class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

// Product Search and Filter
class ProductFilter {
    constructor() {
        this.products = document.querySelectorAll('.product-card');
        this.init();
    }

    init() {
        // Add search functionality if needed
        this.addSearchBox();
    }

    addSearchBox() {
        const productsSection = document.querySelector('.products');
        if (productsSection) {
            const searchBox = document.createElement('div');
            searchBox.className = 'search-container';
            searchBox.innerHTML = `
                <input type="text" placeholder="Search peptides..." class="search-input">
                <i class="fas fa-search search-icon"></i>
            `;
            
            const container = productsSection.querySelector('.container');
            container.insertBefore(searchBox, container.firstChild);

            // Add search functionality
            const searchInput = searchBox.querySelector('.search-input');
            searchInput.addEventListener('input', (e) => {
                this.filterProducts(e.target.value);
            });
        }
    }

    filterProducts(searchTerm) {
        this.products.forEach(product => {
            const productName = product.querySelector('h3').textContent.toLowerCase();
            const isVisible = productName.includes(searchTerm.toLowerCase());
            product.style.display = isVisible ? 'block' : 'none';
        });
    }
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ShoppingCart();
    new BitcoinPayment();
    new SmoothScroll();
    new ProductFilter();
    
    // Add loading animation
    document.body.classList.add('loaded');
    
    console.log('PeptidePlaza website initialized successfully!');
    
    // Debug: Log current cart state
    console.log('Current cart items:', JSON.parse(localStorage.getItem('peptideCart') || '[]'));
});

// Add some CSS for search functionality
const searchStyles = document.createElement('style');
searchStyles.textContent = `
    .search-container {
        position: relative;
        max-width: 400px;
        margin: 0 auto 40px;
    }
    
    .search-input {
        width: 100%;
        padding: 15px 50px 15px 20px;
        border: 2px solid #e9ecef;
        border-radius: 25px;
        font-size: 16px;
        outline: none;
        transition: all 0.3s;
    }
    
    .search-input:focus {
        border-color: #8B5A96;
        box-shadow: 0 0 0 3px rgba(139, 90, 150, 0.1);
    }
    
    .search-icon {
        position: absolute;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        color: #8B5A96;
        font-size: 18px;
    }
    
    body.loaded {
        animation: fadeIn 0.5s ease-in;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;
document.head.appendChild(searchStyles);/
/ Dropdown functionality
document.addEventListener('DOMContentLoaded', function() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const dropdownToggle = dropdown.querySelector('.nav-link');
        const dropdownMenu = dropdown.querySelector('.dropdown-menu');
        
        if (dropdownToggle && dropdownMenu) {
            // Toggle dropdown on click
            dropdownToggle.addEventListener('click', function(e) {
                e.preventDefault();
                dropdown.classList.toggle('active');
                
                // Close other dropdowns
                dropdowns.forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        otherDropdown.classList.remove('active');
                    }
                });
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function(e) {
                if (!dropdown.contains(e.target)) {
                    dropdown.classList.remove('active');
                }
            });
        }
    });
});