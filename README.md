# Jokes Viewer

A clean, interactive jokes browser built with vanilla HTML, CSS, and JavaScript using the [FreeAPI.app](https://freeapi.app) Random Jokes API.

## Live Demo

> Add your hosted link here after deployment.

## Features

- Browse 1,465+ jokes with smooth slide animations
- Previous / Next navigation with automatic page loading
- Progress bar showing your position in the joke library
- Category badges (e.g. Explicit) displayed per joke
- Copy joke to clipboard
- Save favorites — persisted in `localStorage`
- Native Web Share API support (with clipboard fallback)
- Dark / Light theme toggle
- Keyboard shortcuts
- Fully responsive — mobile, tablet, desktop

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `→` or `l` | Next joke |
| `←` or `h` | Previous joke |
| `c` | Copy joke |
| `s` | Save / unsave joke |
| `Esc` | Close favorites panel |

## Project Structure

```
FreeAPI-Jokes-Viewer-Application/
├── index.html   # Markup and layout
├── style.css    # Styles, theming, animations
└── app.js       # API calls, state, interactivity
```

## API

**Endpoint:** `GET https://api.freeapi.app/api/v1/public/randomjokes`

**Query params:** `page` (default 1), `limit` (default 10)

Each joke object contains:

```json
{
  "id": 42,
  "categories": ["explicit"],
  "content": "Why don't scientists trust atoms? Because they make up everything."
}
```

## Getting Started

No build step required — open `index.html` directly in a browser or serve locally:

```bash
npx serve .
```

Then open `http://localhost:3000`.

## Tech Stack

- Vanilla HTML5, CSS3, JavaScript (ES2020)
- [Font Awesome 6](https://fontawesome.com) for icons
- FreeAPI.app Random Jokes API
