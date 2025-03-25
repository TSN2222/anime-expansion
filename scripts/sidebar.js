const sidebarLinks = document.querySelectorAll('.sidebar a');

// spa-routing.js
const routes = {
  '#home': document.getElementById('home-content'),
  '#profile': document.getElementById('profile-content'),
  '#settings': document.getElementById('settings-content'),
};

function navigateTo(route) {
  // Hide all content sections
  Object.values(routes).forEach((section) => {
    section.style.display = 'none';
  });

  // Show selected route content
  if (routes[route]) {
    routes[route].style.display = 'block';
  }

  // Update active sidebar item
  sidebarLinks.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === route);
  });
}

// Add event listeners to sidebar links
sidebarLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const route = link.getAttribute('href');
    navigateTo(route);

    // Update browser URL without page reload
    history.pushState(null, '', route);
  });
});

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
  navigateTo(window.location.hash || '#home');
});

// Initial page load
navigateTo(window.location.hash || '#home');
