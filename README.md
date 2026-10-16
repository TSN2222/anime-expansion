# Anime Expansion

Anime Expansion is a browser-based anime discovery project built with HTML, CSS,
and vanilla JavaScript. It fetches anime data from AniList and synopsis text from
Jikan, with YouTube trailers embedded when available.

## Features

- Browse Trending, Popular, and Top Rated anime with paginated results.
- Explore a featured carousel and expandable Top Airing and Upcoming sections.
- Open anime details with titles, episode counts, airing dates, studios, genres,
  scores, rankings, and synopses.
- View characters, Japanese voice actors, and available trailers.
- Choose a light or dark theme and an accent color on the home page. Preferences
  are saved in the browser's `localStorage`.

## Run locally

There is no build step, package installation, backend, or API key configuration.
Serve the repository root with a static HTTP server and open `index.html` in a
modern browser.

For example, if Python 3 is installed, run this from the repository root:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Then visit <http://127.0.0.1:8000/>. Stop the server with `Ctrl+C`.
An editor's static server can also serve the project.

An internet connection is required for anime data, remote images, YouTube
trailers, and the Swiper and Google Material Icons resources loaded by the pages.

## Project structure

| Path | Purpose |
| --- | --- |
| `index.html` | Home page, browsing controls, and settings interface |
| `pages/details.html` | Anime details page; accepts an AniList ID through `?id=...` |
| `scripts/anime-cards.js` | Anime grid, sorting, and pagination |
| `scripts/carousel.js` | Featured anime queries and Swiper carousel |
| `scripts/showcase.js` | Top Airing and Upcoming sections |
| `scripts/info.js` | Anime details, synopses, trailers, and characters |
| `scripts/settings.js` | Theme and accent preferences |
| `scripts/sidebar.js` | Home, Profile, and Settings navigation |
| `styles/` | Shared styles and component stylesheets |

API requests run directly in the browser. AniList supplies the catalog and
metadata; the details page requests a Jikan synopsis when a MyAnimeList ID is
available and falls back to the AniList description. Swiper powers the carousel.

## Current limitations

This project is a work in progress:

- Search, shuffle, notifications, account controls, Profile, and Add to List are
  placeholders.
- The featured carousel and Top Airing section query Winter 2025 explicitly in
  `scripts/carousel.js` and `scripts/showcase.js`; they do not follow the current
  season automatically.
- Upcoming detail links are incomplete because that query does not request anime
  IDs.
- Theme settings are loaded on the home page only. Profile and Settings navigation
  on the details page still needs integration.
- Generated detail links assume the site is served at the domain root. Hosting
  under a subdirectory requires adjusting those paths.

There is no automated test suite or build tooling configured. After changing the
app, manually check browsing tabs, pagination, detail pages, and saved settings
in the browser.
