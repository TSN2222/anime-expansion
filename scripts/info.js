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

      /* ========== TITLES SECTION ========== */
    document.getElementById("anime-english-title").textContent = anime.title.english || "N/A";
    document.getElementById("anime-native-title").textContent = anime.title.native || "N/A";
    document.getElementById("anime-romaji-title").textContent = anime.title.romaji || "N/A";

    /* ========== INFORMATION SECTION ========== */
    document.getElementById("anime-format").textContent = anime.format || "N/A";
    document.getElementById("anime-episodes").textContent = anime.episodes || "N/A";
    document.getElementById("anime-status").textContent = anime.status?.replace(/_/g, " ") || "N/A";

    const start = formatDate(anime.startDate);
    const end = formatDate(anime.endDate);
    document.getElementById("anime-aired").textContent = start && end ? `${start} to ${end}` : start || "N/A";

    if (anime.season && anime.seasonYear) {
      document.getElementById("anime-premiered").textContent = `${capitalize(anime.season.toLowerCase())} ${anime.seasonYear}`;
    }

    const studios = anime.studios.edges.filter(edge => edge.isMain).map(edge => edge.node.name).join(', ');
    document.getElementById("anime-studios").textContent = studios || "N/A";

    const producers = anime.studios.edges.filter(edge => !edge.isMain).map(edge => edge.node.name).join(', ');
    document.getElementById("anime-producers").textContent = producers || "N/A";

    document.getElementById("anime-genres").textContent = anime.genres?.join(', ') || "N/A";

    /* ========== STATISTICS SECTION ========== */
    document.getElementById("anime-score").textContent = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : "N/A";

    const ratingRank = anime.rankings.find(r => r.type === "RATED" && r.allTime);
    document.getElementById("anime-rank").textContent = ratingRank ? `#${ratingRank.rank}` : "N/A";

    document.getElementById("anime-popularity").textContent = anime.popularity || "N/A";
  })
  .catch((error) => {
    console.error("Failed to load anime:", error);
  });

/* ========== HELPER FUNCTIONS ========== */
function formatDate(dateObj) {
  if (!dateObj?.year) return "N/A";
  const { year, month, day } = dateObj;
  if (!month || !day) return `${year}`;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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
      tabLinks.forEach((tab) => tab.classList.remove("active"));
      sections.forEach((sec) => sec.classList.remove("active"));
      link.classList.add("active");

      const target = link.getAttribute("data-target");
      const targetSection = document.querySelector(target);
      if (targetSection) {
        targetSection.classList.add("active");
      }
    });
  });
});
