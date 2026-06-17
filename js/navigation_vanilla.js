/**
 * Navigation Menu Event Handler
 * Manages responsive navigation drawer toggle behaviors and outside click dismissals.
 */
document.addEventListener('DOMContentLoaded', () => {
  const navButtons = document.querySelectorAll('.pf-nav-button');
  
  // Register click events on navigation bar toggles (mobile hamburger menus)
  navButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Locate the navigation wrapper container
      const navWrapper = button.closest('.pf-nav') || button.closest('.navbar-case-study') || button.parentElement;
      if (navWrapper) {
        const menu = navWrapper.querySelector('.pf-nav-menu');
        if (menu) {
          // Toggle native open class on button
          button.classList.toggle('pf-open');
          
          // Toggle native open attribute and classes on menu and links
          menu.classList.toggle('pf-open');
          
          const isOpening = menu.classList.contains('pf-open');
          if (isOpening) {
            menu.setAttribute('data-pf-menu-open', '');
          } else {
            menu.removeAttribute('data-pf-menu-open');
          }
          
          // Toggle open class on individual navigation items to format them vertically
          const links = menu.querySelectorAll('.pf-nav-link, .navigation-item');
          links.forEach(link => {
            if (isOpening) {
              link.classList.add('pf-nav-link-open');
            } else {
              link.classList.remove('pf-nav-link-open');
            }
          });
          
          // Accessibility and state handling
          button.setAttribute('aria-expanded', isOpening ? 'true' : 'false');
        }
      }
    });
  });
  
  // Close menu if user clicks outside of the navbar area
  document.addEventListener('click', (e) => {
    navButtons.forEach(button => {
      const navWrapper = button.closest('.pf-nav') || button.closest('.navbar-case-study') || button.parentElement;
      if (navWrapper && !navWrapper.contains(e.target)) {
        const menu = navWrapper.querySelector('.pf-nav-menu');
        if (menu && (menu.classList.contains('pf-open') || menu.hasAttribute('data-pf-menu-open'))) {
          button.classList.remove('pf-open');
          menu.classList.remove('pf-open');
          menu.removeAttribute('data-pf-menu-open');
          
          const links = menu.querySelectorAll('.pf-nav-link, .navigation-item');
          links.forEach(link => {
            link.classList.remove('pf-nav-link-open');
          });
          
          button.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });
});
