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
  .then((data) => console.log(data))
  .catch((err) => console.error(err));
