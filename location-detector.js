// Location-based dynamic content
class LocationDetector {
    constructor() {
        this.countryData = {
            'US': { code: 'US', name: 'United States', possessive: 'America\'s' },
            'GB': { code: 'UK', name: 'United Kingdom', possessive: 'UK\'s' },
            'CA': { code: 'CA', name: 'Canada', possessive: 'Canada\'s' },
            'AU': { code: 'AU', name: 'Australia', possessive: 'Australia\'s' },
            'DE': { code: 'DE', name: 'Germany', possessive: 'Germany\'s' },
            'FR': { code: 'FR', name: 'France', possessive: 'France\'s' },
            'NL': { code: 'NL', name: 'Netherlands', possessive: 'Netherlands\'' },
            'SG': { code: 'SG', name: 'Singapore', possessive: 'Singapore\'s' },
            'MY': { code: 'MY', name: 'Malaysia', possessive: 'Malaysia\'s' },
            'PH': { code: 'PH', name: 'Philippines', possessive: 'Philippines\'' },
            'VN': { code: 'VN', name: 'Vietnam', possessive: 'Vietnam\'s' },
            'ID': { code: 'ID', name: 'Indonesia', possessive: 'Indonesia\'s' },
            'TH': { code: 'TH', name: 'Thailand', possessive: 'Thailand\'s' }
        };
        
        this.defaultCountry = { code: 'TH', name: 'Thailand', possessive: 'Thailand\'s' };
        this.detectedCountry = null;
        
        this.init();
    }
    
    async init() {
        // Hide content initially to prevent flash
        this.hideContent();
        
        try {
            await this.detectLocation();
            this.updateContent();
        } catch (error) {
            console.log('Location detection failed, using default');
            this.detectedCountry = this.defaultCountry;
            this.updateContent();
        } finally {
            // Show content after location is set
            this.showContent();
        }
    }
    
    hideContent() {
        // Content is hidden via CSS using .location-loading class
        // This method is kept for compatibility but CSS handles the hiding
    }
    
    showContent() {
        // Remove loading class to show content with smooth transition
        document.body.classList.remove('location-loading');
    }
    
    async detectLocation() {
        // Set a maximum timeout for all detection methods
        const detectionTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Detection timeout')), 2000)
        );
        
        try {
            await Promise.race([
                this.tryLocationDetection(),
                detectionTimeout
            ]);
        } catch (error) {
            console.log('Location detection timed out or failed, using default');
            this.detectedCountry = this.defaultCountry;
        }
    }
    
    async tryLocationDetection() {
        // Method 1: Try IP geolocation API
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1500);
            
            const response = await fetch('https://ipapi.co/json/', {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const data = await response.json();
                const countryCode = data.country_code;
                
                if (this.countryData[countryCode]) {
                    this.detectedCountry = this.countryData[countryCode];
                    console.log('Location detected:', this.detectedCountry);
                    return;
                }
            }
        } catch (error) {
            console.log('Primary location API failed');
        }
        
        // Method 2: Try alternative API
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1000);
            
            const response = await fetch('https://api.country.is/', {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const data = await response.json();
                const countryCode = data.country;
                
                if (this.countryData[countryCode]) {
                    this.detectedCountry = this.countryData[countryCode];
                    console.log('Location detected (backup):', this.detectedCountry);
                    return;
                }
            }
        } catch (error) {
            console.log('Backup location API failed');
        }
        
        // Method 3: Try timezone-based detection
        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const countryFromTimezone = this.getCountryFromTimezone(timezone);
            
            if (countryFromTimezone && this.countryData[countryFromTimezone]) {
                this.detectedCountry = this.countryData[countryFromTimezone];
                console.log('Location detected from timezone:', this.detectedCountry);
                return;
            }
        } catch (error) {
            console.log('Timezone detection failed');
        }
        
        // Fallback to default
        this.detectedCountry = this.defaultCountry;
    }
    
    getCountryFromTimezone(timezone) {
        const timezoneMap = {
            'America/New_York': 'US',
            'America/Chicago': 'US',
            'America/Denver': 'US',
            'America/Los_Angeles': 'US',
            'America/Toronto': 'CA',
            'America/Vancouver': 'CA',
            'Europe/London': 'GB',
            'Europe/Berlin': 'DE',
            'Europe/Paris': 'FR',
            'Europe/Amsterdam': 'NL',
            'Australia/Sydney': 'AU',
            'Australia/Melbourne': 'AU',
            'Asia/Singapore': 'SG',
            'Asia/Kuala_Lumpur': 'MY',
            'Asia/Manila': 'PH',
            'Asia/Ho_Chi_Minh': 'VN',
            'Asia/Jakarta': 'ID',
            'Asia/Bangkok': 'TH'
        };
        
        return timezoneMap[timezone] || null;
    }
    
    updateContent() {
        if (!this.detectedCountry) return;
        
        const { code, name, possessive } = this.detectedCountry;
        
        // Update all country code elements
        const countryCodeElements = [
            'country-code',
            'country-code-2', 
            'country-code-3',
            'country-code-4'
        ];
        
        countryCodeElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = code;
            }
        });
        
        // Update all country name elements
        const countryNameElements = [
            'country-name',
            'country-name-2',
            'country-name-3',
            'country-name-4',
            'country-name-5',
            'country-name-6'
        ];
        
        countryNameElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = name;
            }
        });
        
        // Update possessive forms (e.g., "Thailand's" -> "America's")
        const possessiveElements = document.querySelectorAll('[data-possessive]');
        possessiveElements.forEach(element => {
            element.textContent = possessive;
        });
        
        // Update vial labels
        const vialLabelElements = document.querySelectorAll('.country-code-label');
        vialLabelElements.forEach(element => {
            element.textContent = code;
        });
        
        // Update brand elements in vial labels
        const brandElements = document.querySelectorAll('.brand');
        brandElements.forEach(element => {
            if (element.textContent.includes('PEPTIDE PLAZA TH')) {
                element.textContent = `PEPTIDE PLAZA ${code}`;
            }
        });
        
        // Update brand-name elements (for different vial styles)
        const brandNameElements = document.querySelectorAll('.brand-name');
        brandNameElements.forEach(element => {
            if (element.textContent.includes('PEPTIDE PLAZA TH')) {
                element.textContent = `PEPTIDE PLAZA ${code}`;
            }
        });
        
        // Update support email
        const supportEmailElement = document.getElementById('support-email');
        if (supportEmailElement) {
            supportEmailElement.textContent = `support@peptideplaza${code.toLowerCase()}.com`;
        }
        
        // Update page title
        const titleElement = document.querySelector('title');
        if (titleElement && titleElement.textContent.includes('Thailand')) {
            titleElement.textContent = titleElement.textContent.replace('Thailand', name);
        }
        
        if (titleElement && titleElement.textContent.includes('PeptidePlaza')) {
            titleElement.textContent = titleElement.textContent.replace('PeptidePlaza', `PeptidePlaza${code}`);
        }
        
        // Store detected country for other scripts
        window.detectedCountry = this.detectedCountry;
        
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('countryDetected', {
            detail: this.detectedCountry
        }));
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add loading class to body
    document.body.classList.add('location-loading');
    
    const detector = new LocationDetector();
    
    // Remove loading class after detection
    window.addEventListener('countryDetected', () => {
        document.body.classList.remove('location-loading');
    });
});