# Ajeet Kumar academic website

## Run locally

From the project root, serve the site with:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000/.

## Add a publication

Edit [data/publications.json](data/publications.json) directly or add a record to [data/scholar.bib](data/scholar.bib) and run:

```bash
npm run build
```

## Refresh BibTeX from Google Scholar

Export your Scholar profile as BibTeX, replace [data/scholar.bib](data/scholar.bib), and run:

```bash
npm run build
```

## Add photos

Drop images into the [gallery](gallery/) folder, then run:

```bash
npm run build:gallery
```

This will refresh the gallery page. Future work can add thumbnail generation with sharp.

## Update the CV PDF

Replace [assets/docs/Ajeet_Kumar_CV_2026.pdf](assets/docs/Ajeet_Kumar_CV_2026.pdf) with the latest file.

## Switch the accent colour

Edit the accent variables in [assets/css/styles.css](assets/css/styles.css).

## Deploy later to GitHub Pages

Publish the repository to GitHub Pages from the main branch, either from the site root or from a /docs folder.

## License

- Code: MIT
- Content: CC-BY 4.0
