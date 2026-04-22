# RecipePlanner

Small modern static website for recipe management and meal planning.

## Features
- Add, edit, remove recipes with persistent JSON-backed browser storage (localStorage).
- Import/export recipes as JSON files.
- Random recipe picker.
- Weekly planner: two meals per day, non-repeating when enough meal recipes exist.
- Seeded with starter snack, breakfast, and lunch entries.

## Run locally
Open `index.html` directly, or use a local server:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deploy to GitHub Pages
This repository includes a GitHub Actions workflow at `.github/workflows/pages.yml`.

1. Push to `main`.
2. In GitHub repository settings, set **Pages > Source** to **GitHub Actions**.
3. The workflow deploys the static site automatically.
