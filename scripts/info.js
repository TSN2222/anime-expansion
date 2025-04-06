/* ========== GET ANIME ID ========== */
const params = new URLSearchParams(window.location.search);
const animeId = params.get("id");

if (!animeId || isNaN(parseInt(animeId))) {
  document.getElementById("anime-title").textContent = "Invalid Anime ID.";
  throw new Error("Invalid or missing anime ID.");
}

/* ========== ANILIST GRAPHQL QUERY ========== */
const query = `
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      idMal
      title {
        romaji
        english
        native
      }
      format
      episodes
      status
      season
      seasonYear
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      studios {
        edges {
          node {
            name
          }
          isMain
        }
      }
      genres
      bannerImage
      coverImage {
        large
      }
      popularity
      averageScore
      rankings {
        rank
        type
        allTime
        context
      }
      description(asHtml: false)
      trailer {
        id
        site
      }
      characters(sort: ROLE) {
        edges {
          role
          node {
            id
            name {
              full
            }
            image {
              large
            }
          }
          voiceActors(language: JAPANESE) {
            id
            name {
              full
            }
            image {
              large
            }
          }
        }
      }
    }
  }
`;

fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query,
      variables: { id: parseInt(animeId) },
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      const anime = data.data.Media;
      if (!anime) {
        throw new Error("No anime data returned from AniList.");
      }

       /* ========== BANNER ========== */
    const bannerBg = document.getElementById("banner-bg");
    if (bannerBg && anime.bannerImage) {
      bannerBg.style.backgroundImage = `url(${anime.bannerImage})`;
    }

    /* ========== COVER IMAGE ========== */
    const coverImg = document.getElementById("cover-img");
    if (coverImg && anime.coverImage?.large) {
      coverImg.src = anime.coverImage.large;
    }

    /* ========== ENGLISH TITLE (Banner) ========== */
    const titleEl = document.getElementById("anime-title");
    if (titleEl) {
      titleEl.textContent = anime.title.english || "Title Unavailable";
    }
})