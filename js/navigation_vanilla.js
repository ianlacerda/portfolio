/**
 * Navigation Menu Event Handler
 * Manages responsive navigation drawer toggle behaviors and outside click dismissals.
 */
document.addEventListener('DOMContentLoaded', () => {
  const navButtons = document.querySelectorAll('.w-nav-button');
  
  // Register click events on navigation bar toggles (mobile hamburger menus)
  navButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Locate the navigation wrapper container
      const navWrapper = button.closest('.w-nav') || button.closest('.navbar-case-study') || button.parentElement;
      if (navWrapper) {
        const menu = navWrapper.querySelector('.w-nav-menu');
        if (menu) {
          // Toggle native open class on button
          button.classList.toggle('w--open');
          
          // Toggle native open attribute and classes on menu and links
          menu.classList.toggle('w--open');
          
          const isOpening = menu.classList.contains('w--open');
          if (isOpening) {
            menu.setAttribute('data-nav-menu-open', '');
          } else {
            menu.removeAttribute('data-nav-menu-open');
          }
          
          // Toggle open class on individual navigation items to format them vertically
          const links = menu.querySelectorAll('.w-nav-link, .navigation-item');
          links.forEach(link => {
            if (isOpening) {
              link.classList.add('w--nav-link-open');
            } else {
              link.classList.remove('w--nav-link-open');
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
      const navWrapper = button.closest('.w-nav') || button.closest('.navbar-case-study') || button.parentElement;
      if (navWrapper && !navWrapper.contains(e.target)) {
        const menu = navWrapper.querySelector('.w-nav-menu');
        if (menu && (menu.classList.contains('w--open') || menu.hasAttribute('data-nav-menu-open'))) {
          button.classList.remove('w--open');
          menu.classList.remove('w--open');
          menu.removeAttribute('data-nav-menu-open');
          
          const links = menu.querySelectorAll('.w-nav-link, .navigation-item');
          links.forEach(link => {
            link.classList.remove('w--nav-link-open');
          });
          
          button.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });
});
