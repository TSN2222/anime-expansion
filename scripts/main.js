function getPopularAnime() {
  const query = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(sort: POPULARITY_DESC, type: ANIME) {
        title {
          english
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
  }
`;

  const variables = {
    page: 1,
    perPage: 24,
  };

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  };

  fetch('https://graphql.anilist.co', options)
    .then((response) => response.json())
    .then((data) => displayPopularAnime(data))
    .catch((err) => console.error(err));
}

function displayPopularAnime(data) {
  const popularAnime = document.getElementById('main-item-two');
  const animeSlice = data.data.Page.media.slice(0, 24);

  animeSlice.forEach((item) => {
    const englishTitle = item.title.english;
    const releaseDate = item.startDate.year;
    const coverImage = item.coverImage.large;
    const coverImageColor = item.coverImage.color;
    const mediaFormat = item.format;
    const rating = item.averageScore;
    const episodeCount = item.episodes;

    const popularAnimeHTML = `
      <a href="">
        <div>
          <div>
            <img
              id="coverImage"
              src="${coverImage}"
              alt="Cover image of ${englishTitle}" />
          </div>
          <div>
            <div>${englishTitle}</div>
            <div id="info-container">
              <div>${mediaFormat}</div>
              <div>${releaseDate}</div>
              <div>${episodeCount}</div>
              <div>${rating}</div>
            </div>
          </div>
        </div>
      </a>
    `;

    popularAnime.innerHTML += popularAnimeHTML;
  });
}

getPopularAnime();
