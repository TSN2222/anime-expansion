// Fetch top 5 Winter 2025 anime (English titles only)
async function fetchTopAnime() {
  const url = 'https://graphql.anilist.co';
  const query = `
      query ($page: Int, $perPage: Int, $season: MediaSeason, $seasonYear: Int, $sort: [MediaSort]) {
        Page(page: $page, perPage: $perPage) {
          media(
            season: $season,
            seasonYear: $seasonYear,
            sort: $sort,
            type: ANIME,
            format_in: [TV, TV_SHORT]
          ) {
            id
            title {
              english
              romaji
            }
            format
            episodes
            averageScore
            duration
            bannerImage
            coverImage {
              color
            }
            description
          }
        }
      }
    `;
  const variables = {
    page: 1,
    perPage: 5,
    season: 'WINTER',
    seasonYear: 2025,
    sort: ['SCORE_DESC'],
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });
    const json = await response.json();
    return json.data.Page.media;
  } catch (error) {
    console.error('AniList fetch error:', error);
    return [];
  }
}

// Build slides and initialize Swiper
async function initAnimeCarousel() {
  // Async function that waits for the fetch to complete before building the carousel
  const animeList = await fetchTopAnime();
  const carouselWrapper = document.getElementById('anime-carousel-slides');
  if (!carouselWrapper) return;

  // Clear existing slides
  carouselWrapper.innerHTML = '';

  // Create each slide
  animeList.forEach((anime) => {
    const slide = document.createElement('div');
    slide.classList.add('swiper-slide');
    slide.style.backgroundImage = `url(${anime.bannerImage})`;

    // Info container (left/bottom area)
    const infoDiv = document.createElement('div');
    infoDiv.classList.add('anime-info');

    // Title
    const titleEl = document.createElement('h2');
    titleEl.textContent = anime.title.english || '(No English Title)';

    // Apply AniList average color (from coverImage.color) to title. Turnary operator to see if there is a color. if not title will be white.
    const averageColor =
      anime.coverImage && anime.coverImage.color
        ? anime.coverImage.color
        : '#fff';
    titleEl.style.color = averageColor;

    // Info (format, episodes, duration, score)
    const metaInfoEl = document.createElement('div');
    metaInfoEl.classList.add('anime-meta');

    const formatText = anime.format || 'N/A';
    const episodesText =
      anime.episodes != null ? `${anime.episodes} eps` : 'N/A';
    const durationText =
      anime.duration != null ? `${anime.duration} mins` : 'N/A';
    const scoreText =
      anime.averageScore != null ? `${anime.averageScore}%` : 'N/A';

    // Combine them into a single line
    metaInfoEl.textContent = `${formatText} • ${episodesText} • ${durationText} • ${scoreText}`;

    // Description Cleanup
    let desc = anime.description
      ? anime.description
      : 'No description available.';
    desc = desc.replace(/\s+/g, ' '); // Remove extra whitespace
    desc = desc.replace(/<[^>]*>/g, ''); // Remove HTML tags
    desc = desc.replace(/\(Source[^)]*\)/gi, '');
    desc = desc.replace(/\[.*?\]/g, '');
    desc =
      new DOMParser().parseFromString(desc, 'text/html').body.textContent || '';
    if (desc.length > 200) {
      desc = desc.slice(0, 200) + '...';
    }

    const descEl = document.createElement('p');
    descEl.textContent = desc;

    // Append title, meta info, and description to info container
    infoDiv.appendChild(titleEl);
    infoDiv.appendChild(metaInfoEl);
    infoDiv.appendChild(descEl);

    // Append info container to the slide
    slide.appendChild(infoDiv);

    // Create "details" link to the slides
    const detailsLink = document.createElement('a');
    detailsLink.classList.add('slide-details-button');
    detailsLink.textContent = 'Details';
    detailsLink.href = `details.html?id=${anime.id}`;
    slide.appendChild(detailsLink);

    // Add this slide to the carousel wrapper
    carouselWrapper.appendChild(slide);
  });

  // Initialize Swiper with auto-slide every 4s
  new Swiper('.swiper-container', {
    loop: true,
    speed: 200,
    effect: 'slide',
    autoplay: {
      delay: 10000,
      disableOnInteraction: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
  });
}

// Start the carousel once the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initAnimeCarousel();
});
