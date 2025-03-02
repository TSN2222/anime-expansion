const backPageButton = document.getElementById('back-page');
const nextPageButton = document.getElementById('next-page');
const animeContainer = document.getElementById('main-item-two');
const pageNumber = document.getElementById('page-num');
const tabButtons = document.querySelectorAll('#tabs button');

// Object with page state settings
const state = {
  page: 1,
  perPage: 24,
  isLoading: false,
  currentSort: 'TRENDING_DESC', // Default sort
};

// Map tap names to GraphGL sort parameters
const sortMap = {
  Trending: 'TRENDING_DESC',
  Popular: 'POPULARITY_DESC',
  'Top Rated': 'SCORE_DESC',
};

// Switch between tabs
function switchTab(sortType) {
  // Update the state with new sort type
  state.currentSort = sortMap[sortType];

  // Reset to page 1 when changing tabs
  state.page = 1;

  // Update active tab style
  tabButtons.forEach((button) => {
    if (button.textContent === sortType) {
      button.classList.add('active-tab');
    } else {
      button.classList.remove('active-tab');
    }
  });

  // Fetch data with updated sort parameter
  fetchAnimeData();
}

// Fetch data from AniList
function fetchAnimeData() {
  // Show loading state
  state.isLoading = true;
  updateUI();

  const query = `
  query ($page: Int, $perPage: Int, $sort: [MediaSort]) {
    Page(page: $page, perPage: $perPage) {
      media(sort: $sort, type: ANIME) {
        title {
          english
          romaji
        }
        startDate {
          year
        }
        coverImage {
          large
          color
        }
        format
        averageScore
        episodes
      }
    }
  }`;

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: {
        page: state.page,
        perPage: state.perPage,
        sort: [state.currentSort], // Pass the current sort as an array
      },
    }),
  };

  fetch('https://graphql.anilist.co', options)
    .then((response) => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then((data) => {
      renderAnimeList(data);
      state.isLoading = false;
      updateUI();
    })
    .catch((err) => {
      console.error('Error fetching anime data:', err);
      state.isLoading = false;
      updateUI();
      // Show error message to user
      animeContainer.innerHTML =
        '<div class="error">Failed to load anime data. Please try again.</div>';
    });
}

// Render fetched data onto the screen
function renderAnimeList(data) {
  // Clear existing content
  animeContainer.innerHTML = '';

  // Create a document fragment to minimize DOM operations
  const fragment = document.createDocumentFragment();

  data.data.Page.media.forEach((item) => {
    const title =
      item.title.english || item.title.romaji || 'No title available';
    const releaseDate = item.startDate.year || 'N/A';
    const coverImage = item.coverImage.large;
    const avgColor = item.coverImage.color;
    const mediaFormat = item.format || 'N/A';
    const rating = item.averageScore ? `${item.averageScore}%` : 'N/A';
    const episodeCount = item.episodes ? `${item.episodes}Eps` : 'N/A';

    const animeCard = document.createElement('a');
    animeCard.classList.add('anime-link');
    animeCard.href = ''; // Add link here
    animeCard.innerHTML = `
      <div>
        <div class="image-container">
          <img
            class="cover-image"
            src="${coverImage}"
            alt="Cover image of ${title}" />
        </div>
        <div class="details">
          <div class="title">${title}</div>
          <div class="info-container">
            <div>${mediaFormat}</div>
            <div>${releaseDate}</div>
            <div>${episodeCount}</div>
            <div>${rating}</div>
          </div>
        </div>
      </div>
    `;

    fragment.appendChild(animeCard);
  });

  animeContainer.appendChild(fragment);
}

function updateUI() {
  // Update page number display
  if (pageNumber) {
    pageNumber.value = state.page;
  }

  // Disable back button on page 1 or while loading
  backPageButton.disabled = state.page <= 1 || state.isLoading;

  // Disable next button on page 5 or while loading
  nextPageButton.disabled = state.page >= 5 || state.isLoading;

  // Add loading indicator if needed
  if (state.isLoading) {
    animeContainer.innerHTML = '<div class="loading">Loading...</div>';
  }
}

function changePage(direction) {
  const newPage = state.page + direction;

  // Don't allow going below page 1
  if (newPage < 1) return;

  state.page = newPage;
  fetchAnimeData();
}

// Event Listeners
backPageButton.addEventListener('click', () => changePage(-1));
nextPageButton.addEventListener('click', () => changePage(1));

// Event Listeners for tabs
tabButtons.forEach((button) => {
  button.addEventListener('click', () => {
    // Don't do anything if this tab is already active or page is loading
    if (button.classList.contains('active-tab') || state.isLoading) return;

    // Switch to clicked tab
    switchTab(button.textContent);
  });
});

// Set initial active tab
document.querySelector('#tabs button:nth-child(1)').classList.add('active-tab');

// Initial load
fetchAnimeData();
