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

let trailerSrc = null; //  store the original trailer URL here

async function initAnime() {
  try {
    // Fetch from AniList
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { id: parseInt(animeId) },
      }),
    });
    const { data } = await res.json();
    const anime = data?.Media;
    if (!anime) throw new Error("No anime data returned from AniList.");

    // === OVERVIEW TOP STATS ===
    const ratingRank = anime.rankings?.find(r => r.type === "RATED" && r.allTime);
    const rankValue = ratingRank ? `#${ratingRank.rank}` : "N/A";
    const scoreValue = typeof anime.averageScore === "number"
      ? (anime.averageScore / 10).toFixed(1)
      : "N/A";
    const popularityValue = anime.popularity ?? "N/A";

    const overviewEl = document.getElementById("overview-top-stats");
    if (overviewEl) {
      overviewEl.innerHTML = `
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

    // === IMAGES & TITLES ===
    if (anime.bannerImage) {
      document.getElementById("banner-bg").style.backgroundImage = `url(${anime.bannerImage})`;
    }
    const coverImg = document.getElementById("cover-img");
    if (coverImg && anime.coverImage?.large) coverImg.src = anime.coverImage.large;

    document.getElementById("anime-title").textContent =
      anime.title.english || "Title Unavailable";
    document.getElementById("anime-english-title").textContent = anime.title.english || "N/A";
    document.getElementById("anime-native-title").textContent = anime.title.native || "N/A";
    document.getElementById("anime-romaji-title").textContent = anime.title.romaji || "N/A";

    // === SYNOPSIS (with Jikan fallback) ===
    const synopsisEl = document.getElementById("anime-synopsis");
    if (anime.idMal) {
      try {
        const jikanRes = await fetch(`https://api.jikan.moe/v4/anime/${anime.idMal}`);
        const jikanJson = await jikanRes.json();
        const syn = jikanJson.data?.synopsis || anime.description;
        synopsisEl.innerHTML = syn
          ? syn.replace(/(?:\r\n|\r|\n)/g, "<br>")
          : "Synopsis not available.";
      } catch {
        const desc = anime.description || "";
        synopsisEl.innerHTML = desc
          ? desc.replace(/(?:\r\n|\r|\n)/g, "<br>")
          : "Synopsis not available.";
      }
    } else {
      const desc = anime.description || "";
      synopsisEl.innerHTML = desc
        ? desc.replace(/(?:\r\n|\r|\n)/g, "<br>")
        : "Synopsis not available.";
    }

    // === TRAILER RENDERING ===
    function renderTrailerAndSynopsis() {
      const container = document.getElementById("overview-trailer-container");
      container.innerHTML = "";
      if (anime.trailer?.site?.toLowerCase() === "youtube") {
        trailerSrc = `https://www.youtube.com/embed/${anime.trailer.id}`;
        const iframe = document.createElement("iframe");
        iframe.src = trailerSrc;
        iframe.allow =
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;
        iframe.style.border = "none";
        iframe.classList.add("trailer-iframe");

        const title = document.createElement("h3");
        title.textContent = "Trailer";
        title.style.color = "#f39c12";

        const wrapper = document.createElement("div");
        wrapper.classList.add("trailer-wrapper");
        wrapper.appendChild(iframe);

        container.appendChild(title);
        container.appendChild(wrapper);
      } else {
        container.textContent = "No trailer available.";
      }
    }
    renderTrailerAndSynopsis();

    // === EXTRA INFO PANEL ===
    if (typeof anime.averageScore === "number") {
      document.getElementById("anime-score").textContent = (anime.averageScore / 10).toFixed(1);
    }
    const ratedRank = anime.rankings?.find(r => r.type === "RATED" && r.allTime);
    if (ratedRank) {
      document.getElementById("anime-rank").textContent = `#${ratedRank.rank}`;
    }
    document.getElementById("anime-popularity").textContent = anime.popularity ?? "N/A";

    // === META DATA ===
    document.getElementById("anime-format").textContent = anime.format || "N/A";
    document.getElementById("anime-episodes").textContent = anime.episodes ?? "N/A";
    document.getElementById("anime-status").textContent =
      (anime.status || "N/A").replace(/_/g, " ");

    const airedEl = document.getElementById("anime-aired");
    const start = formatDate(anime.startDate);
    const end = formatDate(anime.endDate);
    if (airedEl) {
      airedEl.textContent = end ? `${start} to ${end}` : start ? `From ${start}` : "N/A";
    }

    const premieredEl = document.getElementById("anime-premiered");
    if (premieredEl) {
      premieredEl.textContent =
        anime.season && anime.seasonYear
          ? `${capitalize(anime.season.toLowerCase())} ${anime.seasonYear}`
          : "N/A";
    }

    const studios = anime.studios?.edges || [];
    const mainStudios = studios.filter(e => e.isMain).map(e => e.node.name).join(", ") || "N/A";
    const producers = studios.filter(e => !e.isMain).map(e => e.node.name).join(", ") || "N/A";
    document.getElementById("anime-studios").textContent = mainStudios;
    document.getElementById("anime-producers").textContent = producers;
    document.getElementById("anime-genres").textContent = anime.genres?.join(", ") || "N/A";

    // === CHARACTERS ===
    const charactersList = document.getElementById("characters-list");
    charactersList.innerHTML = "";
    const chars = anime.characters?.edges || [];
    if (chars.length === 0) {
      charactersList.textContent = "No character information found.";
    } else {
      chars.forEach(edge => {
        const { node: character, role } = edge;
        const va = edge.voiceActors?.[0] || null;

        const card = document.createElement("div");
        card.classList.add("character-card");

        const img = document.createElement("img");
        img.classList.add("character-img");
        img.src = character.image?.large || "";
        img.alt = character.name?.full || "";

        const info = document.createElement("div");
        info.classList.add("char-info");
        info.innerHTML = `
          <p class="char-name">${character.name?.full}</p>
          <p class="char-role">${role || "SUPPORTING"}</p>
        `;

        const vaDiv = document.createElement("div");
        vaDiv.classList.add("va-info");
        if (va) {
          vaDiv.innerHTML = `
            <div class="va-data">
              <p class="va-name">${va.name.full}</p>
              <p class="va-lang">Japanese</p>
            </div>
            <img class="va-img" src="${va.image.large}" alt="${va.name.full}" />
          `;
        } else {
          vaDiv.textContent = "No VA info";
        }

        card.append(img, info, vaDiv);
        charactersList.appendChild(card);
      });
    }

  } catch (error) {
    console.error("Failed to load anime:", error);
    const titleEl = document.getElementById("anime-title");
    if (titleEl) titleEl.textContent = "Error loading anime.";
  }
}

/* ========== HELPER FUNCTIONS ========== */
function formatDate({ year, month, day } = {}) {
  if (!year) return "";
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

/* ========== INIT ON DOM READY ========== */
document.addEventListener("DOMContentLoaded", () => {
  initAnime();

  const tabLinks = document.querySelectorAll(".anime-nav a");
  const sections = document.querySelectorAll(".anime-section");
  const trailerContainer = document.getElementById("overview-trailer-container");

  tabLinks.forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      tabLinks.forEach(tab => tab.classList.remove("active"));
      sections.forEach(sec => sec.classList.remove("active"));
      link.classList.add("active");

      const target = link.getAttribute("data-target");
      const targetSection = document.querySelector(target);
      if (targetSection) targetSection.classList.add("active");

      // Pause or resume trailer
      const iframe = trailerContainer.querySelector("iframe");
      if (iframe) {
        iframe.src = target === "#overview-section" ? trailerSrc : "";
      }
    });
  });
});
