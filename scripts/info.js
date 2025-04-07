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

  // Information Section
  document.getElementById("anime-format").textContent = anime.format || "N/A";
  document.getElementById("anime-episodes").textContent = anime.episodes || "N/A";
  document.getElementById("anime-status").textContent = anime.status?.replace(/_/g, " ") || "N/A";
  
  const start = formatDate(anime.startDate);
  const end = formatDate(anime.endDate);
  document.getElementById("anime-aired").textContent = start && end ? `${start} to ${end}` : start || "N/A";

  if (anime.season && anime.seasonYear) {
    document.getElementById("anime-premiered").textContent = `${capitalize(anime.season.toLowerCase())} ${anime.seasonYear}`;
  }

  const studios = anime.studios.edges.filter(edge => edge.isMain).map(edge => edge.node.name).join(', ') || "N/A";
  document.getElementById("anime-studios").textContent = studios;

  const producers = anime.studios.edges.filter(edge => !edge.isMain).map(edge => edge.node.name).join(', ') || "N/A";
  document.getElementById("anime-producers").textContent = producers;

  document.getElementById("anime-genres").textContent = anime.genres?.join(', ') || "N/A";

  renderStats(anime);
}

/* ========== RENDER STATS ========== */
function renderStats(anime) {
  const ratingRank = anime.rankings?.find(r => r.type === "RATED" && r.allTime);
  const rankValue = ratingRank ? `#${ratingRank.rank}` : "N/A";
  const scoreValue = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : "N/A";
  const popularityValue = anime.popularity || "N/A";

  // Render Stats in Overview Section
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

  // Render Stats in Info Section 
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
    });
  });

  fetchAnimeData(animeId);
});
