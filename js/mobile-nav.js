// This file consolidates mobile navigation and dropdown logic.

document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const navLinks = document.querySelectorAll('.main-nav .nav-link'); // All links in the main nav
    const dropdowns = document.querySelectorAll('.dropdown'); // Parent .nav-item with a .dropdown-menu

    // --- Mobile Menu Toggle Functionality ---
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            const isExpanded = mainNav.classList.contains('active');
            this.setAttribute('aria-expanded', isExpanded);

            // Close all dropdowns when main menu is toggled
            dropdowns.forEach(d => d.classList.remove('active'));
        });
    }

    // Close mobile menu when clicking on a main nav link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Only close if it's not a dropdown link (handled by its own logic)
            // or if it's a dropdown link on desktop (where click normally follows href)
            if (window.innerWidth <= 768 && !link.parentElement.classList.contains('dropdown')) {
                mainNav.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // Handle dropdown behavior on mobile
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('.nav-link');
        
        // Add click listener for mobile dropdowns
        link.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault(); // Prevent default link behavior on mobile
                const wasActive = dropdown.classList.contains('active');

                // Close all other dropdowns before opening current one
                dropdowns.forEach(d => {
                    if (d !== dropdown) { // Don't close itself
                        d.classList.remove('active');
                    }
                });
                
                // Toggle the current dropdown's active state
                dropdown.classList.toggle('active');
            }
        });

        // Add hover listener for desktop (optional, if you want JS to manage it)
        dropdown.addEventListener('mouseenter', function() {
            if (window.innerWidth > 768) {
                this.classList.add('active');
            }
        });
        dropdown.addEventListener('mouseleave', function() {
            if (window.innerWidth > 768) {
                this.classList.remove('active');
            }
        });
    });

    // Close dropdowns when clicking outside anywhere on the document
    document.addEventListener('click', function(e) {
        // Check if the click target is NOT inside the main nav and NOT the mobile toggle
        if (!e.target.closest('.main-nav') && !e.target.closest('.mobile-menu-toggle')) {
            mainNav.classList.remove('active'); // Close main mobile nav
            mobileMenuToggle.setAttribute('aria-expanded', 'false');

            // Close all dropdowns
            dropdowns.forEach(d => {
                d.classList.remove('active');
            });
        }
    });

    // Ensure dropdowns are closed on resize if they were open in mobile view
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            mainNav.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            dropdowns.forEach(d => d.classList.remove('active')); // Close all dropdowns on desktop
        }
    });
});