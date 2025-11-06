// Currency Conversion System
class CurrencyConverter {
    constructor() {
        this.baseCurrency = 'THB'; // Thai Baht as base currency
        this.currentCurrency = 'THB';
        this.exchangeRates = {
            'THB': 1.00,      // Thai Baht (base)
            'USD': 0.028,     // US Dollar
            'EUR': 0.026,     // Euro
            'GBP': 0.022,     // British Pound
            'AUD': 0.042,     // Australian Dollar
            'CAD': 0.038,     // Canadian Dollar
            'SGD': 0.038,     // Singapore Dollar
            'JPY': 4.12,      // Japanese Yen
            'CNY': 0.20,      // Chinese Yuan
            'KRW': 37.5,      // Korean Won
            'INR': 2.35,      // Indian Rupee
            'MYR': 0.13,      // Malaysian Ringgit
            'PHP': 1.58,      // Philippine Peso
            'VND': 690,       // Vietnamese Dong
            'IDR': 430,       // Indonesian Rupiah
            'BTC': 0.0000008, // Bitcoin (approximate)
            'ETH': 0.000012   // Ethereum (approximate)
        };
        
        this.currencySymbols = {
            'THB': '฿',
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'AUD': 'A$',
            'CAD': 'C$',
            'SGD': 'S$',
            'JPY': '¥',
            'CNY': '¥',
            'KRW': '₩',
            'INR': '₹',
            'MYR': 'RM',
            'PHP': '₱',
            'VND': '₫',
            'IDR': 'Rp',
            'BTC': '₿',
            'ETH': 'Ξ'
        };
        
        this.countryToCurrency = {
            'TH': 'THB', // Thailand
            'US': 'USD', // United States
            'DE': 'EUR', 'FR': 'EUR', 'IT': 'EUR', 'ES': 'EUR', 'NL': 'EUR', 'AT': 'EUR', 'BE': 'EUR', // Europe
            'GB': 'GBP', // United Kingdom
            'AU': 'AUD', // Australia
            'CA': 'CAD', // Canada
            'SG': 'SGD', // Singapore
            'JP': 'JPY', // Japan
            'CN': 'CNY', // China
            'KR': 'KRW', // South Korea
            'IN': 'INR', // India
            'MY': 'MYR', // Malaysia
            'PH': 'PHP', // Philippines
            'VN': 'VND', // Vietnam
            'ID': 'IDR'  // Indonesia
        };
        
        this.countryNames = {
            'TH': 'Thailand',
            'US': 'United States',
            'DE': 'Germany', 'FR': 'France', 'IT': 'Italy', 'ES': 'Spain', 'NL': 'Netherlands', 'AT': 'Austria', 'BE': 'Belgium',
            'GB': 'United Kingdom',
            'AU': 'Australia',
            'CA': 'Canada',
            'SG': 'Singapore',
            'JP': 'Japan',
            'CN': 'China',
            'KR': 'South Korea',
            'IN': 'India',
            'MY': 'Malaysia',
            'PH': 'Philippines',
            'VN': 'Vietnam',
            'ID': 'Indonesia'
        };
        
        this.userCountry = 'TH';
        this.userCountryName = 'Thailand';
        
        this.init();
    }

    async init() {
        await this.detectUserLocation();
        this.updateLocationText();
        this.createCurrencySelector();
        this.convertAllPrices();
        this.updateCartCurrency();
    }

    async detectUserLocation() {
        try {
            // Try to get user's country from IP geolocation
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            
            if (data.country_code) {
                this.userCountry = data.country_code;
                this.userCountryName = data.country_name || this.countryNames[data.country_code] || 'Unknown';
                
                // Update the trust badge
                this.updateTrustBadge();
                
                if (this.countryToCurrency[data.country_code]) {
                    this.currentCurrency = this.countryToCurrency[data.country_code];
                    console.log(`Detected location: ${this.userCountryName}, Currency: ${this.currentCurrency}`);
                }
            } else {
                // Fallback to browser language/locale detection
                const locale = navigator.language || navigator.languages[0];
                const countryCode = locale.split('-')[1];
                
                if (countryCode) {
                    this.userCountry = countryCode;
                    this.userCountryName = this.countryNames[countryCode] || countryCode;
                    this.updateTrustBadge();
                    
                    if (this.countryToCurrency[countryCode]) {
                        this.currentCurrency = this.countryToCurrency[countryCode];
                    }
                }
            }
        } catch (error) {
            console.log('Could not detect location, using default currency (THB)');
            // Check if user has previously selected a currency
            const savedCurrency = localStorage.getItem('selectedCurrency');
            if (savedCurrency && this.exchangeRates[savedCurrency]) {
                this.currentCurrency = savedCurrency;
            }
        }
    }
    
    updateTrustBadge() {
        const trustBadge = document.querySelector('.trust-badge');
        if (trustBadge) {
            trustBadge.textContent = `Reliable source in ${this.userCountryName}`;
        }
    }

    updateLocationText() {
        // Update all location-based text on the page
        const countryName = this.userCountryName;

        // Update navigation links - "Buy Peptides in Thailand"
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            if (link.innerHTML.includes('Buy Peptides in Thailand')) {
                link.innerHTML = link.innerHTML.replace(
                    /Buy Peptides in Thailand/g,
                    `Buy Peptides in ${countryName}`
                );
            }
        });

        // Update product descriptions - be specific to avoid breaking other content
        const productDescriptions = document.querySelectorAll('.product-description p');
        productDescriptions.forEach(element => {
            let html = element.innerHTML;
            // Only replace "buy [product] in Thailand" patterns
            if (html.match(/buy .+ in Thailand/i)) {
                html = html.replace(/in Thailand/g, `in ${countryName}`);
                element.innerHTML = html;
            }
        });

        // Update shipping-related text
        const highlightSpans = document.querySelectorAll('.highlight-item span');
        highlightSpans.forEach(element => {
            if (element.textContent.includes('Within Thailand')) {
                element.textContent = element.textContent.replace('Within Thailand', `Within ${countryName}`);
            }
        });

        // Update shipping info sections in tabs
        const shippingHeaders = document.querySelectorAll('.tab-panel h4');
        shippingHeaders.forEach(element => {
            if (element.textContent.includes('Domestic Shipping (Thailand)')) {
                element.textContent = element.textContent.replace('Domestic Shipping (Thailand)', `Domestic Shipping (${countryName})`);
            }
        });

        // Update "within Thailand" in shipping sections
        const shippingParagraphs = document.querySelectorAll('.tab-panel p');
        shippingParagraphs.forEach(element => {
            if (element.textContent.includes('within Thailand')) {
                element.textContent = element.textContent.replace(/within Thailand/g, `within ${countryName}`);
            }
        });

        // Update page titles if they exist
        const pageTitle = document.querySelector('title');
        if (pageTitle && pageTitle.textContent.includes('Thailand')) {
            pageTitle.textContent = pageTitle.textContent.replace(/Thailand/g, countryName);
        }

        console.log(`✅ Location text updated to: ${countryName}`);
    }

    createCurrencySelector() {
        // Create currency selector in the header
        const navActions = document.querySelector('.nav-actions');
        if (navActions) {
            const currencySelector = document.createElement('div');
            currencySelector.className = 'currency-selector';
            currencySelector.innerHTML = `
                <div class="currency-dropdown">
                    <button class="currency-btn" id="currencyBtn">
                        <span class="currency-symbol">${this.currencySymbols[this.currentCurrency]}</span>
                        <span class="currency-code">${this.currentCurrency}</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="currency-menu" id="currencyMenu">
                        ${Object.keys(this.exchangeRates).map(currency => 
                            `<div class="currency-option ${currency === this.currentCurrency ? 'active' : ''}" data-currency="${currency}">
                                <span class="currency-symbol">${this.currencySymbols[currency]}</span>
                                <span class="currency-info">
                                    <span class="currency-code">${currency}</span>
                                    <span class="currency-name">${this.getCurrencyName(currency)}</span>
                                </span>
                            </div>`
                        ).join('')}
                    </div>
                </div>
            `;
            
            navActions.insertBefore(currencySelector, navActions.firstChild);
            
            // Add event listeners
            this.setupCurrencyDropdown();
        }

        // Add CSS for currency selector
        const style = document.createElement('style');
        style.textContent = `
            .currency-selector {
                position: relative;
                display: inline-block;
                flex-shrink: 0;
            }

            .currency-dropdown {
                position: relative;
                display: inline-block;
            }

            .currency-btn {
                background: white;
                border: 2px solid #e9ecef;
                border-radius: 20px;
                padding: 8px 10px;
                font-size: 0.7rem;
                color: #2d3436;
                font-weight: 600;
                cursor: pointer;
                outline: none;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 3px;
                width: 75px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                height: 36px;
            }

            .currency-btn:hover {
                border-color: #8B5A96;
                box-shadow: 0 4px 15px rgba(139, 90, 150, 0.15);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(139, 90, 150, 0.2);
            }
            
            .currency-btn.active {
                background: linear-gradient(135deg, rgba(139, 90, 150, 0.08) 0%, rgba(107, 76, 147, 0.08) 100%);
                border-color: #8B5A96;
            }

            .currency-symbol {
                font-size: 1.05rem;
                font-weight: 700;
                color: #8B5A96;
            }

            .currency-code {
                font-size: 0.85rem;
                font-weight: 700;
                color: #2d3436;
            }

            .currency-btn i {
                font-size: 0.7rem;
                transition: transform 0.3s ease;
                color: #636e72;
            }

            .currency-btn.active i {
                transform: rotate(180deg);
                color: #8B5A96;
            }

            .currency-menu {
                position: absolute;
                top: 100%;
                right: 0;
                background: white;
                border: 1px solid #e9ecef;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                min-width: 240px;
                max-height: 320px;
                overflow-y: auto;
                z-index: 1001;
                opacity: 0;
                visibility: hidden;
                transform: translateY(-10px);
                transition: all 0.3s ease;
                margin-top: 10px;
            }

            .currency-menu.show {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }

            .currency-option {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 18px;
                cursor: pointer;
                transition: all 0.3s ease;
                border-bottom: 1px solid #f8f9fa;
            }

            .currency-option:last-child {
                border-bottom: none;
            }

            .currency-option:hover {
                background: linear-gradient(135deg, rgba(139, 90, 150, 0.08) 0%, rgba(107, 76, 147, 0.08) 100%);
                padding-left: 22px;
            }

            .currency-option.active {
                background: linear-gradient(135deg, rgba(139, 90, 150, 0.12) 0%, rgba(107, 76, 147, 0.12) 100%);
                color: #8B5A96;
            }

            .currency-option .currency-symbol {
                width: 24px;
                text-align: center;
                font-size: 1.2rem;
            }

            .currency-info {
                display: flex;
                flex-direction: column;
                gap: 2px;
                flex: 1;
            }

            .currency-option .currency-code {
                font-size: 0.9rem;
                font-weight: 700;
                color: #2d3436;
            }

            .currency-option.active .currency-code {
                color: #8B5A96;
            }

            .currency-name {
                font-size: 0.75rem;
                color: #636e72;
                font-weight: 500;
            }

            .currency-option.active .currency-name {
                color: #8B5A96;
            }

            /* Custom scrollbar */
            .currency-menu::-webkit-scrollbar {
                width: 6px;
            }

            .currency-menu::-webkit-scrollbar-track {
                background: #f8f9fa;
                border-radius: 3px;
            }

            .currency-menu::-webkit-scrollbar-thumb {
                background: linear-gradient(135deg, #8B5A96 0%, #6B4C93 100%);
                border-radius: 3px;
            }

            .currency-menu::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(135deg, #6B4C93 0%, #8B5A96 100%);
            }

            /* Mobile responsive */
            @media (max-width: 768px) {
                .currency-selector {
                    order: -1;
                }

                .currency-btn {
                    padding: 8px 14px;
                    min-width: 85px;
                }

                .currency-menu {
                    min-width: 200px;
                    max-height: 250px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    getCurrencyName(currency) {
        const names = {
            'THB': 'Thai Baht',
            'USD': 'US Dollar',
            'EUR': 'Euro',
            'GBP': 'British Pound',
            'AUD': 'Australian Dollar',
            'CAD': 'Canadian Dollar',
            'SGD': 'Singapore Dollar',
            'JPY': 'Japanese Yen',
            'CNY': 'Chinese Yuan',
            'KRW': 'Korean Won',
            'INR': 'Indian Rupee',
            'MYR': 'Malaysian Ringgit',
            'PHP': 'Philippine Peso',
            'VND': 'Vietnamese Dong',
            'IDR': 'Indonesian Rupiah',
            'BTC': 'Bitcoin',
            'ETH': 'Ethereum'
        };
        return names[currency] || currency;
    }
    
    setupCurrencyDropdown() {
        const currencyBtn = document.getElementById('currencyBtn');
        const currencyMenu = document.getElementById('currencyMenu');
        
        if (currencyBtn && currencyMenu) {
            // Toggle dropdown
            currencyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                currencyBtn.classList.toggle('active');
                currencyMenu.classList.toggle('show');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                currencyBtn.classList.remove('active');
                currencyMenu.classList.remove('show');
            });
            
            // Handle currency selection
            currencyMenu.addEventListener('click', (e) => {
                const option = e.target.closest('.currency-option');
                if (option) {
                    const currency = option.dataset.currency;
                    this.changeCurrency(currency);
                    
                    // Close dropdown
                    currencyBtn.classList.remove('active');
                    currencyMenu.classList.remove('show');
                }
            });
        }
    }

    convertPrice(thbPrice, targetCurrency = this.currentCurrency) {
        const rate = this.exchangeRates[targetCurrency];
        const convertedPrice = thbPrice * rate;
        
        // Format based on currency
        let formattedPrice;
        if (targetCurrency === 'JPY' || targetCurrency === 'KRW' || targetCurrency === 'VND' || targetCurrency === 'IDR') {
            // No decimal places for these currencies
            formattedPrice = Math.round(convertedPrice).toLocaleString();
        } else if (targetCurrency === 'BTC' || targetCurrency === 'ETH') {
            // More decimal places for crypto
            formattedPrice = convertedPrice.toFixed(8);
        } else {
            // 2 decimal places for most currencies
            formattedPrice = convertedPrice.toFixed(2);
        }
        
        return `${this.currencySymbols[targetCurrency]}${formattedPrice}`;
    }

    convertAllPrices() {
        // Store original THB prices if not already stored
        this.storeOriginalPrices();
        
        // Convert price ranges
        document.querySelectorAll('.price-range').forEach(priceRange => {
            const priceFromElement = priceRange.querySelector('.price-from');
            const priceToElement = priceRange.querySelector('.price-to');
            
            if (priceFromElement && priceToElement) {
                const thbPriceFrom = priceFromElement.dataset.originalPrice || this.extractTHBPrice(priceFromElement.textContent);
                const thbPriceTo = priceToElement.dataset.originalPrice || this.extractTHBPrice(priceToElement.textContent);
                
                if (thbPriceFrom && thbPriceTo) {
                    priceFromElement.dataset.originalPrice = thbPriceFrom;
                    priceToElement.dataset.originalPrice = thbPriceTo;
                    priceFromElement.textContent = this.convertPrice(parseInt(thbPriceFrom));
                    priceToElement.textContent = this.convertPrice(parseInt(thbPriceTo));
                }
            }
        });

        // Convert individual prices
        document.querySelectorAll('.price').forEach(priceElement => {
            const thbPrice = priceElement.dataset.originalPrice || this.extractTHBPrice(priceElement.textContent);
            if (thbPrice) {
                priceElement.dataset.originalPrice = thbPrice;
                priceElement.textContent = this.convertPrice(parseInt(thbPrice));
            }
        });

        // Convert current amount in product pages
        const currentAmount = document.querySelector('.current-amount');
        if (currentAmount) {
            const thbPrice = currentAmount.dataset.originalPrice || this.extractTHBPrice(currentAmount.textContent);
            if (thbPrice) {
                currentAmount.dataset.originalPrice = thbPrice;
                currentAmount.textContent = this.convertPrice(parseInt(thbPrice));
            }
        }

        // Convert checkout page prices
        this.convertCheckoutPrices();

        // Update quantity button prices
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            const thbPrice = parseInt(btn.dataset.price);
            if (thbPrice) {
                btn.dataset.convertedPrice = (thbPrice * this.exchangeRates[this.currentCurrency]).toFixed(2);
            }
        });
    }
    
    convertCheckoutPrices() {
        // Convert subtotal
        const subtotal = document.getElementById('subtotal');
        if (subtotal) {
            const thbPrice = subtotal.dataset.originalPrice || this.extractTHBPrice(subtotal.textContent);
            if (thbPrice) {
                subtotal.dataset.originalPrice = thbPrice;
                subtotal.textContent = this.convertPrice(parseInt(thbPrice));
            }
        }

        // Convert total
        const total = document.getElementById('total');
        if (total) {
            const thbPrice = total.dataset.originalPrice || this.extractTHBPrice(total.textContent);
            if (thbPrice) {
                total.dataset.originalPrice = thbPrice;
                total.textContent = this.convertPrice(parseInt(thbPrice));
            }
        }

        // Convert shipping cost
        const shippingElements = document.querySelectorAll('.total-row span');
        shippingElements.forEach(element => {
            if (element.textContent.includes('Flat rate:') || element.textContent.includes('฿')) {
                const thbPrice = element.dataset.originalPrice || this.extractTHBPrice(element.textContent);
                if (thbPrice && thbPrice > 0) {
                    element.dataset.originalPrice = thbPrice;
                    const prefix = element.textContent.includes('Flat rate:') ? 'Flat rate: ' : '';
                    element.textContent = prefix + this.convertPrice(parseInt(thbPrice));
                }
            }
        });

        // Convert item prices in checkout
        document.querySelectorAll('.item-price').forEach(priceElement => {
            const thbPrice = priceElement.dataset.originalPrice || this.extractTHBPrice(priceElement.textContent);
            if (thbPrice) {
                priceElement.dataset.originalPrice = thbPrice;
                priceElement.textContent = this.convertPrice(parseInt(thbPrice));
            }
        });
    }
    
    storeOriginalPrices() {
        // Store original THB prices for accurate conversion
        const priceSelectors = '.price-from, .price-to, .price, .current-amount, #subtotal, #total, .item-price';
        document.querySelectorAll(priceSelectors).forEach(element => {
            if (!element.dataset.originalPrice) {
                const thbPrice = this.extractTHBPrice(element.textContent);
                if (thbPrice) {
                    element.dataset.originalPrice = thbPrice;
                }
            }
        });

        // Store shipping costs
        document.querySelectorAll('.total-row span').forEach(element => {
            if (!element.dataset.originalPrice && (element.textContent.includes('Flat rate:') || element.textContent.includes('฿'))) {
                const thbPrice = this.extractTHBPrice(element.textContent);
                if (thbPrice && thbPrice > 0) {
                    element.dataset.originalPrice = thbPrice;
                }
            }
        });
    }

    extractTHBPrice(priceText) {
        // Extract numeric value from price text (remove currency symbols and commas)
        const match = priceText.replace(/[^\d]/g, '');
        return match ? parseInt(match) : null;
    }

    changeCurrency(newCurrency) {
        this.currentCurrency = newCurrency;
        localStorage.setItem('selectedCurrency', newCurrency);
        
        // Update button display
        const currencyBtn = document.getElementById('currencyBtn');
        if (currencyBtn) {
            currencyBtn.querySelector('.currency-symbol').textContent = this.currencySymbols[newCurrency];
            currencyBtn.querySelector('.currency-code').textContent = newCurrency;
        }
        
        // Update active option
        document.querySelectorAll('.currency-option').forEach(option => {
            option.classList.remove('active');
            if (option.dataset.currency === newCurrency) {
                option.classList.add('active');
            }
        });
        
        // Reload prices with new currency
        this.convertAllPrices();
        this.updateCartCurrency();
        
        // Update product page quantity buttons
        this.updateQuantityButtons();
        
        console.log(`Currency changed to: ${newCurrency}`);
    }

    updateQuantityButtons() {
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            const thbPrice = parseInt(btn.dataset.price);
            if (thbPrice) {
                const convertedPrice = thbPrice * this.exchangeRates[this.currentCurrency];
                btn.dataset.convertedPrice = convertedPrice.toFixed(2);
                
                // Update current amount if this button is active
                if (btn.classList.contains('active')) {
                    const currentAmount = document.querySelector('.current-amount');
                    if (currentAmount) {
                        currentAmount.textContent = this.convertPrice(thbPrice);
                    }
                }
            }
        });
    }

    updateCartCurrency() {
        // Update cart items currency if cart exists
        if (window.shoppingCart && window.shoppingCart.items) {
            window.shoppingCart.items.forEach(item => {
                if (item.unitPrice) {
                    item.displayPrice = this.convertPrice(item.unitPrice);
                }
            });
        }
    }

    // Method to get current currency info
    getCurrentCurrencyInfo() {
        return {
            code: this.currentCurrency,
            symbol: this.currencySymbols[this.currentCurrency],
            rate: this.exchangeRates[this.currentCurrency]
        };
    }
}

// Initialize currency converter when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for other scripts to load
    setTimeout(() => {
        window.currencyConverter = new CurrencyConverter();
    }, 500);
});