// FAQ Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // FAQ Dropdown functionality
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            if (isActive) {
                item.classList.remove('active');
            } else {
                item.classList.add('active');
            }
        });
    });
    
    // Search functionality
    const searchInput = document.getElementById('faqSearch');
    const faqSections = document.querySelectorAll('.faq-section');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        faqSections.forEach(section => {
            const items = section.querySelectorAll('.faq-item');
            let sectionHasMatch = false;
            
            items.forEach(item => {
                const question = item.querySelector('.faq-question h3').textContent.toLowerCase();
                const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
                
                if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                    item.style.display = 'block';
                    sectionHasMatch = true;
                } else {
                    item.style.display = 'none';
                }
            });
            
            // Show/hide section based on matches
            if (sectionHasMatch || searchTerm === '') {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        });
    });
    
    // Category filtering
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Update active button
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Clear search
            searchInput.value = '';
            
            // Show/hide sections based on category
            faqSections.forEach(section => {
                const sectionCategory = section.getAttribute('data-category');
                
                if (category === 'all' || sectionCategory === category) {
                    section.style.display = 'block';
                    // Show all items in visible sections
                    section.querySelectorAll('.faq-item').forEach(item => {
                        item.style.display = 'block';
                    });
                } else {
                    section.style.display = 'none';
                }
            });
        });
    });
    
    // Navigation dropdown functionality (if exists)
    const navDropdown = document.querySelector('.navbar .dropdown');
    if (navDropdown) {
        const dropdownToggle = navDropdown.querySelector('.nav-link');
        const dropdownMenu = navDropdown.querySelector('.dropdown-menu');
        
        dropdownToggle.addEventListener('click', function(e) {
            e.preventDefault();
            navDropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!navDropdown.contains(e.target)) {
                navDropdown.classList.remove('active');
            }
        });
    }
    
    // Cart functionality (basic)
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', function() {
            window.location.href = 'checkout.html';
        });
    }
});