const button = document.querySelector('.dropbtn');
const lightButton = document.getElementById('light-theme-btn');
const darkButton = document.getElementById('dark-theme-btn');

// Close the dropdown if the user clicks outside of it
window.onclick = function (event) {
  if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName('dropdown-content');
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
};

button.addEventListener('click', () => {
  document.getElementById('myDropdown').classList.toggle('show');
});

// Function to set theme
function setTheme(themeName) {
  // Set the data-theme attribute on the document element
  document.documentElement.setAttribute('data-theme', themeName);

  // Save the theme preference to localStorage
  localStorage.setItem('theme', themeName);

  // Update active state on buttons
  if (themeName === 'light') {
    lightButton.classList.add('active');
    darkButton.classList.remove('active');
  } else {
    darkButton.classList.add('active');
    lightButton.classList.remove('active');
  }
}

// Add click events
lightButton.addEventListener('click', () => setTheme('light'));
darkButton.addEventListener('click', () => setTheme('dark'));

// On page load, check for saved theme
document.addEventListener('DOMContentLoaded', () => {
  // Check if user has a saved preference
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme) {
    // Apply saved theme
    setTheme(savedTheme);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // If no saved preference but system prefers dark mode
    setTheme('dark');
  } else {
    // Default to light theme (no data-theme attribute needed as it's the default)
    setTheme('light');
  }
});
