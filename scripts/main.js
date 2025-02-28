const backPageButton = document.getElementById('backPage');
const nextPageButton = document.getElementById('nextPage');
const popularAnimeContainer = document.getElementById('main-item-two');
const pageNumber = document.getElementById('pageNum');

const state = {
  page: 1,
  perPage: 24,
  isLoading: false,
};

function fetchAnimeData() {
  // Show loading state
  state.isLoading = true;
  updateUI();

  const query = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(sort: POPULARITY_DESC, type: ANIME) {
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
      variables: { page: state.page, perPage: state.perPage },
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
      popularAnimeContainer.innerHTML =
        '<div class="error">Failed to load anime data. Please try again.</div>';
    });
}

function renderAnimeList(data) {
  // Clear existing content
  popularAnimeContainer.innerHTML = '';

  // Create a document fragment to minimize DOM operations
  const fragment = document.createDocumentFragment();

  data.data.Page.media.forEach((item) => {
    const title =
      item.title.english || item.title.romaji || 'No title available';
    const releaseDate = item.startDate.year || 'N/A';
    const coverImage = item.coverImage.large;
    const mediaFormat = item.format || 'N/A';
    const rating = item.averageScore ? `${item.averageScore}%` : 'N/A';
    const episodeCount = item.episodes ? `${item.episodes} Eps` : 'N/A';

    const animeCard = document.createElement('a');
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

  popularAnimeContainer.appendChild(fragment);
}

function updateUI() {
  // Update page number display
  if (pageNumber) {
    pageNumber.value = state.page;
  }

  // Disable back button on page 1
  backPageButton.disabled = state.page <= 1 || state.isLoading;

  // Disable both buttons during loading
  nextPageButton.disabled = state.isLoading;

  // Add loading indicator if needed
  if (state.isLoading) {
    popularAnimeContainer.innerHTML = '<div class="loading">Loading...</div>';
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

// Initial load
fetchAnimeData();
