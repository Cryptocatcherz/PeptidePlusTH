// Mobile Menu Handler
class MobileMenu {
    constructor() {
        this.init();
    }

    init() {
        this.createMobileToggle();
        this.bindEvents();
        console.log('Mobile menu initialized');
    }

    createMobileToggle() {
        // Check if toggle already exists
        if (document.querySelector('.mobile-menu-toggle')) {
            return;
        }

        // Find the navbar
        const navbar = document.querySelector('.navbar .container');
        if (!navbar) {
            console.warn('Navbar not found');
            return;
        }

        // Create mobile toggle button
        const toggle = document.createElement('button');
        toggle.className = 'mobile-menu-toggle';
        toggle.setAttribute('aria-label', 'Toggle mobile menu');
        toggle.innerHTML = '<i class="fas fa-bars"></i>';

        // Insert before nav-actions
        const navActions = navbar.querySelector('.nav-actions');
        if (navActions) {
            navbar.insertBefore(toggle, navActions);
        } else {
            navbar.appendChild(toggle);
        }

        this.toggle = toggle;
        this.menu = document.querySelector('.nav-menu');
    }

    bindEvents() {
        if (!this.toggle || !this.menu) {
            return;
        }

        // Toggle menu on button click
        this.toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMenu();
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.menu.classList.contains('active')) {
                if (!this.menu.contains(e.target) && !this.toggle.contains(e.target)) {
                    this.closeMenu();
                }
            }
        });

        // Close menu when clicking a link
        const menuLinks = this.menu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMenu();
            });
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.menu.classList.contains('active')) {
                this.closeMenu();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        if (this.menu.classList.contains('active')) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        this.menu.classList.add('active');
        this.toggle.classList.add('active');
        this.toggle.innerHTML = '<i class="fas fa-times"></i>';
        console.log('Mobile menu opened');
    }

    closeMenu() {
        this.menu.classList.remove('active');
        this.toggle.classList.remove('active');
        this.toggle.innerHTML = '<i class="fas fa-bars"></i>';
        console.log('Mobile menu closed');
    }
}

// Initialize mobile menu when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MobileMenu();
});
