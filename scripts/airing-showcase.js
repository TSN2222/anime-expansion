const airingContainer = document.getElementById('airing-sct');
const url = 'https://graphql.anilist.co/';

const variables = {
  page: 1,
  perPage: 5,
  season: 'WINTER',
  seasonYear: 2025,
  sort: ['SCORE_DESC'],
};

document.getElementById('expand-btn').addEventListener('click', function () {
  const animeList = document.querySelector('.slider-showcase');
  animeList.style.maxHeight = animeList.scrollHeight + 'px';
  animeList.style.overflow = 'auto';
  this.parentElement.style.display = 'none';
  variables.perPage = 25;
  fetchAiringAnime(variables);
});

async function fetchAiringAnime() {
  const query = `
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
  }`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AniList API Error: ${errorText}`);
    }
    const data = await response.json();
    renderAnime(data);
  } catch (error) {
    console.error(error);
  }
}

function renderAnime(data) {
  const animeList = data.data.Page.media;
  const fragment = document.createDocumentFragment();

  airingContainer.innerHTML = '';

  animeList.forEach((anime) => {
    const coverImage = anime.coverImage.large;
    const title = anime.title.english || anime.title.romaji;
    const bannerImage = anime.bannerImage;
    const mediaFormat = anime.format;
    const year = anime.seasonYear;
    const totalEpisodes = anime.episodes;

    const airingEntry = document.createElement('anicard');
    let animeHTML = `
    <div class="airing-parent">
      <div class="image-container-two">
        <img class="cover-image-two" src="${coverImage}" />
      </div>`;

    // Only add the banner image if it exists
    if (bannerImage) {
      animeHTML += `
      <div class="anime-banner">
        <img class="airing-banner" src="${bannerImage}"/>
      </div>`;
    }

    // Add the rest of the HTML
    animeHTML += `
      <div class="anime-details">
        <div class="anime-title">${title}</div>
        <div class="ani-info">
          <div class="details-two">${mediaFormat}</div>
          <div class="details-two">${year}</div>
          <div class="details-two">${totalEpisodes}</div>
        </div>
      </div>
    </div>`;

    airingEntry.innerHTML = animeHTML;
    fragment.appendChild(airingEntry);
  });

  airingContainer.appendChild(fragment);
}

fetchAiringAnime();
