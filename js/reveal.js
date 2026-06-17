/**
 * Scroll Reveal, Section Backgrounds & Image Parallax Script
 * 
 * 1. Alternates background colors (light/dark) on content sections dynamically.
 * 2. IntersectionObserver triggers smooth fade-in/slide transitions when sections load.
 * 3. requestAnimationFrame binds a scroll event to apply dynamic parallax shifts on case study images.
 */
(function() {
  // Selectors of elements to be animated on scroll (excluding nested sub-sections to prevent animation clipping)
  const revealElements = [
    '.card-infinity',
    '.card-report',
    '.bento-card',
    '.photography-grid a',
    '.w-row',
    '.style-guide-card',
    '.persona-validation-section',
    '.sitemap-section',
    '.interface-dev-section',
    '.conclusion-section-inf',
    '.visual-direction-section',
    '.layout-architecture-section',
    '.live-preview-section-ux',
    '.layout-details-grid',
    '.navigation-item',
    '.content-section-cs'
  ];

  document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // Alternate Background Colors for Content Sections
    // ----------------------------------------------------
    const sectionSelectors = [
      '.content-section-cs',
      '.persona-validation-section',
      '.sitemap-section',
      '.interface-dev-section',
      '.live-preview-section-inf',
      '.conclusion-section-inf',
      '.visual-direction-section',
      '.layout-architecture-section',
      '.live-preview-section-ux',
      '.conclusion-section-ux'
    ].join(', ');

    const sections = Array.from(document.querySelectorAll(sectionSelectors));
    sections.forEach((section, index) => {
      if (index % 2 === 0) {
        section.classList.add('section-bg-light');
      } else {
        section.classList.add('section-bg-dark');
      }
    });

    // ----------------------------------------------------
    // Scroll Reveal (Fade-in / Slide-up) Animations
    // ----------------------------------------------------
    // Observer options: delay triggering until element is 20% inside the viewport
    const observerOptions = {
      root: null, // Viewport
      rootMargin: '0px 0px -20% 0px',
      threshold: 0.01 // Small threshold so that very tall sections are not blocked from triggering
    };

    // IntersectionObserver instance
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add 'revealed' class to trigger CSS transition
          entry.target.classList.add('revealed');
          // Stop observing once animation has triggered
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Attach class names and observe each matched element
    revealElements.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.classList.add('reveal-element');
        observer.observe(el);
      });
    });

    // ----------------------------------------------------
    // Dynamic Scroll-Based Parallax for Images
    // ----------------------------------------------------
    const isHome = document.body.classList.contains('home-body');
    const isInfinity = document.body.classList.contains('infinity-art-body');
    const isUxReport = document.body.classList.contains('ux-report-body');

    if (!isHome && !isInfinity && !isUxReport) {
      return;
    }

    let targetImages = [];
    if (isHome) {
      // For the homepage, apply parallax to the entire bento project cards and photography grid images
      targetImages = Array.from(document.querySelectorAll('.bento-card, .photography-grid img'));
    } else {
      // For case study detail pages, target normal flow images
      const parallaxImages = document.querySelectorAll('.infinity-art-body img, .ux-report-body img');
      targetImages = Array.from(parallaxImages).filter(img => {
        return !img.classList.contains('menu-icon') && 
               !img.classList.contains('logo-link') && 
               !img.closest('.navbar-case-study') &&
               !img.closest('.footer-wrap');
      });
    }

    let ticking = false;

    function updateParallax() {
      const viewportHeight = window.innerHeight;

      targetImages.forEach(img => {
        const rect = img.getBoundingClientRect();
        // Check if the image is within the viewport
        if (rect.bottom > 0 && rect.top < viewportHeight) {
          // Calculate the image's center position relative to the viewport
          const elementCenter = rect.top + rect.height / 2;
          const viewportCenter = viewportHeight / 2;
          
          // Calculate distance from viewport center (normalized from -1 to 1)
          const distanceFromCenter = (elementCenter - viewportCenter) / (viewportCenter);
          
          // Calculate parallax shift (max 25px offset on homepage, 35px on case study details)
          const maxShift = isHome ? 25 : 35;
          const shift = distanceFromCenter * maxShift;

          // Set the custom property on the image
          img.style.setProperty('--parallax-y', `${shift.toFixed(1)}px`);
        }
      });

      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    // Run initial positioning on page load
    window.addEventListener('load', updateParallax);
    updateParallax();
  });
})();
