const airingContainer = document.getElementById("airing-sct");
const url = 'https://graphql.anilist.co/';
document.getElementById("expand-btn").addEventListener("click", function() {
    const animeList = document.querySelector(".content-showcase"); 
    animeList.style.maxHeight = animeList.scrollHeight + "px";
    this.parentElement.style.display = "none";
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

  const variables = {
    page: 1,
    perPage: 5,
    season: "WINTER",
    seasonYear: 2025,
    sort: ["SCORE_DESC"]
  };
  
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({ query, variables }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`AniList API Error: ${errorText}`);
        }
        const data = await response.json();
        renderAnimeList(data);
    } catch(error) {
        console.error(error);
    }
}

function renderAnimeList(data) {
  const animeList = data.data.Page.media;
 

  const fragment = document.createDocumentFragment();

  animeList.forEach((anime) => {
      const coverImage = anime.coverImage.large;
      const title = anime.title.english || anime.title.romaji;
      const bannerImage = anime.bannerImage;
      const mediaFormat = anime.format;
      const Year = anime.seasonYear

      const airingEntry = document.createElement('anicard');
      airingEntry.innerHTML = `
      <div class="airing-parent">
          <div class="image-container">
              <img class="cover-image" src="${coverImage}" />
          </div>
          <div class="anime-details" style="background-image: url('${bannerImage}');"> 
              <div class="anime-title">${title}</div>
              <div class="ani-info">
                <div class="details">${mediaFormat}</div>
                <div class="details"></div>
                <div class="details"></div>
                <div class="details"></div>
            </div>
          </div>
      `;

      fragment.appendChild(airingEntry);
  });

  airingContainer.appendChild(fragment); 
}
fetchAiringAnime();
