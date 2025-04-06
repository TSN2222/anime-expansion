const button = document.querySelector('.dropbtn');
const lightButton = document.getElementById('light-theme-btn');
const darkButton = document.getElementById('dark-theme-btn');
const defaultAccent = document.getElementById('default-accent');
const redAccent = document.getElementById('red-accent');
const greenAccent = document.getElementById('green-accent');
const pinkAccent = document.getElementById('pink-accent');
const dropdownText = document.getElementById('dropdown-content');

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

function setAccent(accentColor) {
  document.documentElement.setAttribute('accent-color', accentColor);

  localStorage.setItem('accent-color', accentColor);

  if (accentColor === 'Default') {
    defaultAccent.classList.add('active');
    redAccent.classList.remove('active');
    greenAccent.classList.remove('active');
    pinkAccent.classList.remove('active');
  } else if (accentColor === 'Red') {
    defaultAccent.classList.remove('active');
    redAccent.classList.add('active');
    greenAccent.classList.remove('active');
    pinkAccent.classList.remove('active');
  } else if (accentColor === 'Green') {
    defaultAccent.classList.remove('active');
    redAccent.classList.remove('active');
    greenAccent.classList.add('active');
    pinkAccent.classList.remove('active');
  } else if (accentColor === 'Pink') {
    defaultAccent.classList.remove('active');
    redAccent.classList.remove('active');
    greenAccent.classList.remove('active');
    pinkAccent.classList.add('active');
  }

  dropdownText.innerHTML = accentColor;
}

// Theme click listener
lightButton.addEventListener('click', () => setTheme('light'));
darkButton.addEventListener('click', () => setTheme('dark'));

// Accent color click listener
defaultAccent.addEventListener('click', () => setAccent('Default'));
redAccent.addEventListener('click', () => setAccent('Red'));
greenAccent.addEventListener('click', () => setAccent('Green'));
pinkAccent.addEventListener('click', () => setAccent('Pink'));

// On page load, check for saved theme
document.addEventListener('DOMContentLoaded', () => {
  // Check if user has a saved preference
  const savedTheme = localStorage.getItem('theme');
  const savedAccentColor = localStorage.getItem('accent-color');

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

  if (savedAccentColor) {
    setAccent(savedAccentColor);
    dropdownText.innerHTML = savedAccentColor;
  } else {
    setAccent('Default');
    dropdownText.innerHTML = savedAccentColor;
  }
});
