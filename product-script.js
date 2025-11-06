// Product Page Functionality
class ProductPage {
    constructor() {
        this.currentPrice = 1200;
        this.selectedQuantity = 5;
        this.init();
    }

    init() {
        this.initQuantityButtons();
        this.initTabs();
        this.initThumbnails();
        this.initAddToCart();
        this.initClearButton();
        this.calculateDeliveryDate();
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

    initQuantityButtons() {
        const quantityBtns = document.querySelectorAll('.quantity-btn');
        const currentAmount = document.querySelector('.current-amount');

        quantityBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                quantityBtns.forEach(b => b.classList.remove('active'));
                
                // Add active class to clicked button
                btn.classList.add('active');
                
                // Update price and quantity
                this.selectedQuantity = parseInt(btn.dataset.qty);
                this.currentPrice = parseInt(btn.dataset.price);
                
                // Update display with currency conversion
                if (currentAmount) {
                    if (window.currencyConverter) {
                        currentAmount.textContent = window.currencyConverter.convertPrice(this.currentPrice);
                    } else {
                        currentAmount.textContent = `฿${this.currentPrice.toLocaleString()}`;
                    }
                }

                // Add animation effect
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    btn.style.transform = 'scale(1)';
                }, 150);
            });
        });
    }

    initTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabPanels = document.querySelectorAll('.tab-panel');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;

                // Remove active class from all tabs and panels
                tabBtns.forEach(b => b.classList.remove('active'));
                tabPanels.forEach(p => p.classList.remove('active'));

                // Add active class to clicked tab and corresponding panel
                btn.classList.add('active');
                const targetPanel = document.getElementById(targetTab);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }

                // Smooth scroll to tabs section
                document.querySelector('.product-details').scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            });
        });
    }

    initThumbnails() {
        const thumbnails = document.querySelectorAll('.thumbnail');
        
        thumbnails.forEach((thumb, index) => {
            thumb.addEventListener('click', () => {
                // Remove active class from all thumbnails
                thumbnails.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked thumbnail
                thumb.classList.add('active');

                // Here you could switch the main image if you had multiple product images
                // For now, we'll just add a visual feedback
                thumb.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    thumb.style.transform = 'scale(1)';
                }, 150);
            });
        });
    }

    initAddToCart() {
        const addToCartBtn = document.querySelector('.add-to-cart-btn');
        
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                this.addToCart();
            });
        }
    }

    initClearButton() {
        const clearBtn = document.querySelector('.clear-btn');
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                // Reset to first option
                const firstBtn = document.querySelector('.quantity-btn');
                if (firstBtn) {
                    firstBtn.click();
                }
            });
        }
    }

    addToCart() {
        const productName = document.querySelector('.product-info h1').textContent;
        const productPrice = `฿${this.currentPrice.toLocaleString()}`;
        
        // Create cart item
        const cartItem = {
            name: `${productName} - ${this.selectedQuantity} vials`,
            price: productPrice,
            quantity: this.selectedQuantity,
            unitPrice: this.currentPrice,
            id: Date.now()
        };

        console.log('Attempting to add to cart:', cartItem);
        console.log('Window cart system exists:', !!window.cartSystem);

        // Use the global cart system if available
        if (window.cartSystem) {
            window.cartSystem.addItem(cartItem);
            console.log('Added to cart system:', cartItem);
        } else {
            // Fallback: store in localStorage directly
            let cart = JSON.parse(localStorage.getItem('peptideCart') || '[]');
            cart.push(cartItem);
            localStorage.setItem('peptideCart', JSON.stringify(cart));
            console.log('Added to localStorage (fallback):', cartItem);

            // Update cart count manually
            const cartCount = document.querySelector('.cart-count');
            if (cartCount) {
                cartCount.textContent = cart.length;
                console.log('Updated cart count to:', cart.length);
            }
        }

        this.showAddedToCartFeedback();
    }

    showAddedToCartFeedback() {
        const addToCartBtn = document.querySelector('.add-to-cart-btn');
        const originalText = addToCartBtn.innerHTML;
        
        // Change button appearance
        addToCartBtn.innerHTML = '<i class="fas fa-check"></i> Added to Cart!';
        addToCartBtn.style.background = '#00b894';
        addToCartBtn.disabled = true;

        // Reset after 2 seconds
        setTimeout(() => {
            addToCartBtn.innerHTML = originalText;
            addToCartBtn.style.background = '';
            addToCartBtn.disabled = false;
        }, 2000);

        // Show success message
        this.showNotification('Product added to cart successfully!', 'success');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#00b894' : '#8B5A96'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Product Image Zoom functionality
class ProductImageZoom {
    constructor() {
        this.init();
    }

    init() {
        const mainImage = document.querySelector('.main-image');
        
        if (mainImage) {
            mainImage.addEventListener('click', () => {
                this.openImageModal();
            });

            // Add cursor pointer to indicate clickable
            mainImage.style.cursor = 'pointer';
        }
    }

    openImageModal() {
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="modal-backdrop">
                <div class="modal-content">
                    <button class="close-modal">&times;</button>
                    <div class="zoomed-image">
                        <div class="peptide-vial-large">
                            <div class="vial-container-large">
                                <div class="vial-body-large"></div>
                                <div class="vial-cap-large"></div>
                                <div class="vial-label-large">
                                    <div class="brand">PEPTIDE PLUS TH</div>
                                    <div class="compound">BPC-157</div>
                                    <div class="details">
                                        <div class="usage">Healing Peptide</div>
                                        <div class="note">For research use only</div>
                                        <div class="reconstitution">This product contains lyophilized peptide and requires reconstitution before use</div>
                                    </div>
                                    <div class="cas">CAS: 137525-51-0</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .image-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            .image-modal.show {
                opacity: 1;
            }
            .modal-content {
                position: relative;
                max-width: 90vw;
                max-height: 90vh;
            }
            .close-modal {
                position: absolute;
                top: -40px;
                right: 0;
                background: none;
                border: none;
                color: white;
                font-size: 30px;
                cursor: pointer;
                z-index: 10001;
            }
            .zoomed-image {
                transform: scale(1.5);
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(modal);

        // Show modal
        setTimeout(() => modal.classList.add('show'), 10);

        // Close modal functionality
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(modal);
                document.head.removeChild(style);
            }, 300);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeBtn.click();
            }
        });
    }
}

// Smooth scrolling for anchor links
class SmoothScrolling {
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

// Initialize all product page functionality
document.addEventListener('DOMContentLoaded', () => {
    new ProductPage();
    new ProductImageZoom();
    new SmoothScrolling();

    // Call again to ensure delivery date is updated
    calculateAndDisplayDeliveryDate();

    console.log('Product page initialized successfully!');
});