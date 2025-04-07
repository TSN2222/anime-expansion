/* ========== GET ANIME ID ========== */
const params = new URLSearchParams(window.location.search);
const animeId = params.get("id");

if (!animeId || isNaN(parseInt(animeId))) {
  document.getElementById("anime-title").textContent = "Invalid Anime ID.";
  throw new Error("Invalid or missing anime ID.");
}

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
      startDate { year month day }
      endDate { year month day }
      studios { edges { node { name } isMain } }
      genres
      bannerImage
      coverImage { large }
      popularity
      averageScore
      rankings { rank type allTime context }
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

let trailerSrc = null;

/* ========== FETCH DATA ========== */
async function fetchAnimeData(id) {
  try {
    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query, variables: { id: parseInt(id) } })
    });

    const { data } = await response.json();
    if (!data?.Media) throw new Error("No anime data returned from AniList.");

    renderAnimeData(data.Media);
  } catch (error) {
    console.error("Failed to load anime:", error);
  }
}

/* ========== RENDER DATA ========== */
function renderAnimeData(anime) {
  // Banner Image
  const bannerBg = document.getElementById("banner-bg");
  if (bannerBg && anime.bannerImage) bannerBg.style.backgroundImage = `url(${anime.bannerImage})`;

  // Cover Image
  const coverImg = document.getElementById("cover-img");
  if (coverImg && anime.coverImage?.large) coverImg.src = anime.coverImage.large;

  // Titles
  document.getElementById("anime-title").textContent = anime.title.english || "Title Unavailable";
  document.getElementById("anime-english-title").textContent = anime.title.english || "N/A";
  document.getElementById("anime-native-title").textContent = anime.title.native || "N/A";
  document.getElementById("anime-romaji-title").textContent = anime.title.romaji || "N/A";

  // Render Trailer
  renderTrailer(anime);

  renderStats(anime);
}

/* ========== RENDER TRAILER ========== */
function renderTrailer(anime) {
  const trailerContainer = document.getElementById("overview-trailer-container");
  trailerContainer.innerHTML = ""; // Clear previous content

  if (anime.trailer && anime.trailer.site.toLowerCase() === "youtube") {
    trailerSrc = `https://www.youtube.com/embed/${anime.trailer.id}`;

    const trailerIframe = document.createElement("iframe");
    trailerIframe.src = trailerSrc;
    trailerIframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    trailerIframe.allowFullscreen = true;
    trailerIframe.style.border = "none";
    trailerIframe.classList.add("trailer-iframe");

    const iframeWrapper = document.createElement("div");
    iframeWrapper.classList.add("trailer-wrapper");
    iframeWrapper.appendChild(trailerIframe);

    trailerContainer.appendChild(iframeWrapper);
  } else {
    trailerContainer.textContent = "No trailer available.";
  }
}

/* ========== RENDER STATS ========== */
function renderStats(anime) {
  const ratingRank = anime.rankings?.find(r => r.type === "RATED" && r.allTime);
  const rankValue = ratingRank ? `#${ratingRank.rank}` : "N/A";
  const scoreValue = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : "N/A";
  const popularityValue = anime.popularity || "N/A";

  /* ========== RENDER STATS IN OVERVIEW SECTION========== */
  const overviewTopStatsEl = document.getElementById("overview-top-stats");
  if (overviewTopStatsEl) {
    overviewTopStatsEl.innerHTML = `
      <div class="overview-top-stats-container">
        <div class="score-section">
          <div class="score-label">SCORE</div>
          <div class="score-value">${scoreValue}</div>
          <div class="score-users">${popularityValue} users</div>
        </div>
        <div class="divider"></div>
        <div class="rank-section">
          <p>Ranked <strong>${rankValue}</strong></p>
          <p>Popularity <strong>#${popularityValue}</strong></p>
        </div>
      </div>
    `;
  }
/* ========== RENDER STATS IN INFO SECTION========== */
  document.getElementById("anime-score").textContent = scoreValue;
  document.getElementById("anime-rank").textContent = rankValue;
  document.getElementById("anime-popularity").textContent = popularityValue;
}

/* ========== HELPER FUNCTIONS ========== */
function formatDate(dateObj) {
  if (!dateObj?.year) return "N/A";
  const { year, month, day } = dateObj;
  if (!month || !day) return `${year}`;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ========== TAB NAVIGATION ========== */
document.addEventListener("DOMContentLoaded", () => {
  const tabLinks = document.querySelectorAll(".anime-nav a");
  const sections = document.querySelectorAll(".anime-section");

  tabLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      tabLinks.forEach(tab => tab.classList.remove("active"));
      sections.forEach(sec => sec.classList.remove("active"));
      link.classList.add("active");

      const target = document.querySelector(link.getAttribute("data-target"));
      if (target) target.classList.add("active");

      const trailerContainer = document.getElementById("overview-trailer-container");
      const iframe = trailerContainer?.querySelector("iframe");

      if (target !== document.querySelector("#overview-section") && iframe) {
        iframe.src = "";
      } else if (iframe && trailerSrc) {
        iframe.src = trailerSrc;
      }
    });
  });

  fetchAnimeData(animeId);
});
