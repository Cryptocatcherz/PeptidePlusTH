// Product Search Functionality
class ProductSearch {
    constructor() {
        this.init();
    }

    init() {
        const searchInput = document.getElementById('productSearch');
        if (!searchInput) return;

        // Add search functionality
        searchInput.addEventListener('input', (e) => {
            this.searchProducts(e.target.value);
        });

        // Add focus styles
        searchInput.addEventListener('focus', (e) => {
            e.target.style.borderColor = '#8B5A96';
            e.target.style.boxShadow = '0 0 0 3px rgba(139, 90, 150, 0.1)';
        });

        searchInput.addEventListener('blur', (e) => {
            e.target.style.borderColor = '#e9ecef';
            e.target.style.boxShadow = 'none';
        });

        console.log('Product search initialized');
    }

    searchProducts(query) {
        const searchTerm = query.toLowerCase().trim();
        const productCards = document.querySelectorAll('.product-card');

        if (!searchTerm) {
            // Show all products
            productCards.forEach(card => {
                card.style.display = '';
                card.style.animation = 'none';
            });
            return;
        }

        let visibleCount = 0;

        productCards.forEach(card => {
            const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const casNumber = card.querySelector('.cas-number')?.textContent.toLowerCase() || '';
            const productText = (title + ' ' + casNumber).toLowerCase();

            if (productText.includes(searchTerm)) {
                card.style.display = '';
                card.style.animation = 'fadeIn 0.3s ease';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Show no results message if nothing found
        this.showNoResultsMessage(visibleCount);
    }

    showNoResultsMessage(count) {
        // Remove existing message
        const existingMessage = document.querySelector('.no-results-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        if (count === 0) {
            const productsGrid = document.querySelector('.products-grid');
            if (!productsGrid) return;

            const message = document.createElement('div');
            message.className = 'no-results-message';
            message.style.cssText = `
                grid-column: 1 / -1;
                text-align: center;
                padding: 60px 20px;
                color: #636e72;
            `;
            message.innerHTML = `
                <i class="fas fa-search" style="font-size: 3rem; color: #dee2e6; margin-bottom: 20px;"></i>
                <h3 style="margin-bottom: 10px; color: #2d3436;">No products found</h3>
                <p>Try searching for different keywords or <a href="#products" style="color: #8B5A96;" onclick="document.getElementById('productSearch').value=''; document.getElementById('productSearch').dispatchEvent(new Event('input'));">view all products</a></p>
            `;

            productsGrid.appendChild(message);
        }
    }
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Initialize search when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ProductSearch();
});
