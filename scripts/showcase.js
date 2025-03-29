const url = 'https://graphql.anilist.co/';

// Configuration for different anime sections
const animeConfigs = {
  airing: {
    containerId: 'airing-sct',
    expandBtnId: 'expand-btn',
    sliderClass: '.slider-showcase',
    variables: {
      page: 1,
      perPage: 5,
      season: 'WINTER',
      seasonYear: 2025,
      sort: ['SCORE_DESC'],
    },
    query: `
      query ($page: Int, $perPage: Int, $season: MediaSeason, $seasonYear: Int, $sort: [MediaSort]) {
        Page(page: $page, perPage: $perPage) {
          media(
            sort: $sort, 
            type: ANIME, 
            season: $season, 
            seasonYear: $seasonYear, 
            format_in: [TV, TV_SHORT]) {
            title {
              english
              romaji
            }
            seasonYear
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
            bannerImage
          }
        }
      }`,
  },
  upcoming: {
    containerId: 'airing-sctTwo',
    expandBtnId: 'expand-btnTwo',
    sliderClass: '.slider-showcaseTwo',
    variables: {
      page: 1,
      perPage: 5,
    },
    query: `
      query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          media(status: NOT_YET_RELEASED, sort: [POPULARITY_DESC], type: ANIME) {
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
            nextAiringEpisode {
              episode
              timeUntilAiring
            }
          }
        }
      }`,
  },
};

// Generic fetch function for anime data
async function fetchAnime(section) {
  const config = animeConfigs[section];

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query: config.query,
        variables: config.variables,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AniList API Error: ${errorText}`);
    }

    const data = await response.json();
    renderAnimeData(section, data);
  } catch (error) {
    console.error(error);
  }
}

// Generic render function for anime data
function renderAnimeData(section, data) {
  const config = animeConfigs[section];
  const container = document.getElementById(config.containerId);
  const animeList = data.data.Page.media;
  const fragment = document.createDocumentFragment();

  container.innerHTML = '';

  animeList.forEach((anime) => {
    const coverImage = anime.coverImage.large;
    const title = anime.title.english || anime.title.romaji;
    const bannerImage = anime.bannerImage;
    const mediaFormat = anime.format;
    const year = anime.startDate?.year || anime.seasonYear;
    const totalEpisodes = anime.episodes;

    const animeEntry = document.createElement('anicard');
    let animeHTML = `
    <div class="airing-parent">
      <div class="image-container-two">
        <img class="cover-image-two" src="${coverImage}" />
      </div>`;

    // Only add the banner image if it exists
    if (bannerImage) {
      animeHTML += `
  <div>
    <img class="airing-banner" src="${bannerImage}"/>
  </div>`;
    }

    // Add the title
    animeHTML += `
  <div class="anime-details">
    <div class="anime-title">${title}</div>
    <div class="ani-info">`;

    // Only add format if it exists
    if (mediaFormat) {
      animeHTML += `<div class="details-two">${mediaFormat}</div>`;
    }

    // Only add year if it exists
    if (year) {
      animeHTML += `<div class="details-two">${year}</div>`;
    }

    // Only add episodes if it exists
    if (totalEpisodes) {
      animeHTML += `<div class="details-two">${totalEpisodes}</div>`;
    }

    // Close the remaining divs
    animeHTML += `
    </div>
  </div>
</div>`;

    animeEntry.innerHTML = animeHTML;
    fragment.appendChild(animeEntry);
  });

  container.appendChild(fragment);
}

// Set up event listeners for expand buttons
Object.keys(animeConfigs).forEach((section) => {
  const config = animeConfigs[section];
  document
    .getElementById(config.expandBtnId)
    .addEventListener('click', function () {
      const animeList = document.querySelector(config.sliderClass);
      animeList.style.maxHeight = animeList.scrollHeight + 'px';
      animeList.style.overflow = 'auto';
      this.parentElement.style.display = 'none';
      config.variables.perPage = 25;
      fetchAnime(section);
    });
});

// Initial fetches
fetchAnime('airing');
fetchAnime('upcoming');
