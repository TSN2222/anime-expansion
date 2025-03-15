// carousel.js

// 1) Fetch top 5 Winter 2025 anime (English titles only)
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
      season: "WINTER",
      seasonYear: 2025,
      sort: ["SCORE_DESC"]
    };
  
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ query, variables })
      });
      const json = await response.json();
      return json.data.Page.media;
    } catch (error) {
      console.error("AniList fetch error:", error);
      return [];
    }
  }