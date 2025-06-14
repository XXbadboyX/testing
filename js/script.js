// This file will now primarily handle the hero background slider and objective item animations.
// Mobile navigation logic is consolidated in mobile-nav.js.

document.addEventListener('DOMContentLoaded', function() {
    // Hero background image slider
    const images = document.querySelectorAll('.hero-bg-image');
    if (images.length > 0) {
        let currentIndex = 0;

        // Ensure the first image is active initially if not set in HTML
        // This is safer than relying solely on HTML class for JS interaction
        if (!images[0].classList.contains('active')) {
            images[0].classList.add('active');
        }

        function showNextImage() {
            images[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % images.length;
            images[currentIndex].classList.add('active');
        }

        // Set interval for image change
        // Original was 10000ms (10 seconds), keeping it consistent.
        setInterval(showNextImage, 5000); 
    }

    // Objective items animation on scroll
    const objectiveItems = document.querySelectorAll('.objective-item');

    if (!objectiveItems.length) {
        // console.warn("No '.objective-item' elements found for animation."); // Optional: for debugging
        return; // Exit if no objective items found to prevent errors
    }

    const observerOptions = {
        root: null, // relative to document viewport
        rootMargin: '0px',
        threshold: 0.1 // percentage of item visible to trigger (10%)
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            } else {
                // Optional: Remove class to re-animate if it scrolls out and back in.
                // Keeping this commented out as per original behavior.
                // entry.target.classList.remove('is-visible');
            }
        });
    };

    // Create and observe all objective items
    const observer = new IntersectionObserver(observerCallback, observerOptions);

    objectiveItems.forEach(item => {
        observer.observe(item);
    });
});