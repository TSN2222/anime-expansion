const airingContainer = document.getElementById("airing-sct");

document.getElementById("expand-btn").addEventListener("click", function() {
    const animeList = document.querySelector(".content-showcase"); 
    animeList.style.maxHeight = animeList.scrollHeight + "px";
    this.parentElement.style.display = "none";
});

async function fetchAiringAnime() {
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
    try {
        const response = await fetch('https://graphql.anilist.co/', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({
                query: query,
                variables: { page: 1, perPage: 5 },
            }),
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

      const airingEntry = document.createElement('anicard');
      airingEntry.innerHTML = `
      <div class="airing-parent">
          <div class="image-container">
              <img class="cover-image" src="${coverImage}" />
          </div>
          <div class="anime-details">
              <div class="anime-title">${title}</div>
          </div>
      `;

      fragment.appendChild(airingEntry);
  });

  airingContainer.appendChild(fragment); 
}
fetchAiringAnime();
