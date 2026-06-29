const fs = require('fs');
const path = require('path');

const root = __dirname;
const dataDir = path.join(root, 'data');
const publicationsPath = path.join(dataDir, 'publications.json');
const galleryPath = path.join(dataDir, 'gallery.json');
const scholarBibPath = path.join(dataDir, 'scholar.bib');
const publicationsBibPath = path.join(root, 'publications.bib');
const galleryDir = path.join(root, 'gallery');
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const autoAppendImageExtensions = new Set(['.jpg', '.jpeg', '.webp', '.gif']);

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function parseBibtex(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, 'utf8');
  const entries = [];
  let index = 0;
  while (index < raw.length) {
    const at = raw.indexOf('@', index);
    if (at < 0) break;
    const open = raw.indexOf('{', at);
    if (open < 0) break;
    const type = raw.slice(at + 1, open).trim().split(/\s+/)[0].toLowerCase();
    let depth = 0;
    let end = open;
    for (; end < raw.length; end += 1) {
      if (raw[end] === '{') depth += 1;
      if (raw[end] === '}') {
        depth -= 1;
        if (depth === 0) {
          end += 1;
          break;
        }
      }
    }
    const inner = raw.slice(open + 1, end - 1);
    const comma = inner.indexOf(',');
    if (comma < 0) {
      index = end;
      continue;
    }
    const citationKey = inner.slice(0, comma).trim();
    const body = inner.slice(comma + 1);
    const fields = {};
    let cursor = 0;
    while (cursor < body.length) {
      const match = body.slice(cursor).match(/\b(\w+)\s*=/);
      if (!match) break;
      const name = match[1].toLowerCase();
      let pos = cursor + match.index + match[0].length;
      while (/\s/.test(body[pos])) pos += 1;
      let value = '';
      if (body[pos] === '{') {
        let fieldDepth = 0;
        const start = pos + 1;
        for (let j = pos; j < body.length; j += 1) {
          if (body[j] === '{') fieldDepth += 1;
          if (body[j] === '}') {
            fieldDepth -= 1;
            if (fieldDepth === 0) {
              value = body.slice(start, j);
              cursor = j + 1;
              break;
            }
          }
        }
      } else if (body[pos] === '"') {
        const start = pos + 1;
        let j = start;
        while (j < body.length && body[j] !== '"') j += 1;
        value = body.slice(start, j);
        cursor = j + 1;
      } else {
        let j = pos;
        while (j < body.length && body[j] !== ',' && body[j] !== '\n') j += 1;
        value = body.slice(pos, j);
        cursor = j + 1;
      }
      fields[name] = value.replace(/\s+/g, ' ').replace(/\\&/g, '&').replace(/[{}]/g, '').trim();
    }
    entries.push({ type, citationKey, fields, raw: raw.slice(at, end).trim() });
    index = end;
  }
  return entries;
}

function bibEntriesToPublications(entries) {
  const typeMap = {
    article: 'journal',
    inproceedings: 'conference',
    incollection: 'book-chapter',
    phdthesis: 'thesis',
    misc: 'misc'
  };

  return entries.map((entry) => {
    const fields = entry.fields;
    const authors = (fields.author || '')
      .split(/\s+and\s+/i)
      .map((author) => author.trim())
      .filter(Boolean)
      .map((author) => {
        const parts = author.split(',').map((part) => part.trim());
        return parts.length > 1 ? `${parts[1]} ${parts[0]}` : author;
      });
    return {
      id: entry.citationKey,
      type: typeMap[entry.type] || entry.type,
      venue_tier: typeMap[entry.type] || entry.type,
      authors,
      title: fields.title || entry.citationKey,
      venue: fields.journal || fields.booktitle || fields.school || fields.publisher || 'Publication',
      volume: fields.volume,
      pages: fields.pages,
      year: Number(fields.year) || 0,
      doi: fields.doi,
      topics: [],
      bibtex: entry.raw
    };
  });
}

function toTitleCase(value) {
  return value
    .split(/[-_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function discoverGalleryItems(existingItems) {
  ensureDir(galleryDir);
  const discoveredFiles = fs.readdirSync(galleryDir)
    .filter((file) => imageExtensions.has(path.extname(file).toLowerCase()))
    .sort();
  const discoveredFilePaths = new Set(discoveredFiles.map((file) => `gallery/${file}`));
  const retainedExisting = (existingItems || []).filter((item) => item.file && discoveredFilePaths.has(item.file));
  const retainedFiles = new Set(retainedExisting.map((item) => item.file));
  const appended = discoveredFiles
    .filter((file) => !retainedFiles.has(`gallery/${file}`))
    .filter((file) => autoAppendImageExtensions.has(path.extname(file).toLowerCase()))
    .map((file) => {
      const filePath = `gallery/${file}`;
      return {
        file: filePath,
        caption: toTitleCase(path.basename(file, path.extname(file))),
        location: 'Gallery'
      };
    });
  return [...retainedExisting, ...appended];
}

function buildPublicationsPage(items) {
  const years = [...new Set(items.map((item) => item.year).filter(Boolean))].sort((a, b) => b - a);
  const types = [...new Set(items.map((item) => item.type).filter(Boolean))].sort();
  const cards = items
    .sort((a, b) => b.year - a.year)
    .map((item) => {
      const topics = (item.topics || []).map((topic) => `<span class="tag">${topic}</span>`).join('');
      const authors = (item.authors || []).map((author, index) => {
        const isMe = author === 'Ajeet Kumar' || author === 'A. Kumar' || author === 'Ajeet';
        return `<span class="${isMe ? 'author author--me' : 'author'}">${author}</span>`;
      }).join(' ');
      const bibId = `bib-${item.id}`;
      return `
        <article class="publication-card" data-year="${item.year}" data-type="${item.type}" data-topics="${(item.topics || []).join(' ')}">
          <div class="publication-meta">
            <span class="pill">${item.type}</span>
            <span class="pill pill--soft">${item.venue_tier || item.venue}</span>
          </div>
          <h3>${item.title}</h3>
          <p class="authors">${authors}</p>
          <p class="venue">${item.venue}${item.volume ? `, vol. ${item.volume}` : ''}${item.pages ? `, pp. ${item.pages}` : ''}, ${item.year}</p>
          <div class="tag-row">${topics}</div>
          <div class="publication-actions">
            ${item.doi ? `<a href="https://doi.org/${item.doi}" target="_blank" rel="noreferrer">DOI</a>` : ''}
            <button class="toggle-bib" type="button" aria-expanded="false" aria-controls="${bibId}">BibTeX</button>
          </div>
          <pre id="${bibId}" class="bibtex" hidden>${item.bibtex || ''}</pre>
        </article>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Publications | Ajeet Kumar</title>
    <meta name="description" content="Selected publications by Dr Ajeet Kumar in SAR, polarimetry, InISAR, lunar remote sensing, and machine learning for radar." />
    <meta property="og:title" content="Publications | Ajeet Kumar" />
    <meta property="og:description" content="Selected publications by Dr Ajeet Kumar in SAR, polarimetry, InISAR, lunar remote sensing, and machine learning for radar." />
    <meta property="og:type" content="website" />
    <meta property="twitter:card" content="summary" />
    <link rel="stylesheet" href="assets/css/styles.css" />
    <script>
      (function () {
        const saved = localStorage.getItem('theme');
        const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', saved || system);
      })();
    </script>
  </head>
  <body>
    <header class="site-header">
      <div class="wrap nav-bar">
        <a class="brand" href="index.html">Ajeet Kumar</a>
        <nav class="site-nav" aria-label="Primary">
          <a href="index.html">Home</a>
          <a href="about.html">About</a>
          <a href="research.html">Research</a>
          <a href="publications.html" class="active">Publications</a>
          <a href="talks.html">Talks</a>
          <a href="awards.html">Awards</a>
          <a href="gallery.html">Gallery</a>
          <a href="contact.html">Contact</a>
          <button id="theme-toggle" type="button" class="theme-toggle" aria-label="Toggle theme"></button>
        </nav>
      </div>
    </header>

    <main class="wrap page-shell">
      <section class="page-intro">
        <p class="eyebrow">Selected work</p>
        <h1>Publications</h1>
        <p>Research across polarimetric SAR, hybrid-pol SAR, InISAR, lunar remote sensing, environmental applications, and machine learning for SAR.</p>
      </section>

      <section class="panel" aria-labelledby="publication-filters">
        <div class="filters" id="publication-filters">
          <label>
            Search
            <input id="publication-search" type="search" placeholder="Search title or author" />
          </label>
          <label>
            Year
            <select id="year-filter">
              <option value="all">All years</option>
              ${years.map((year) => `<option value="${year}">${year}</option>`).join('')}
            </select>
          </label>
          <label>
            Type
            <select id="type-filter">
              <option value="all">All types</option>
              ${types.map((type) => `<option value="${type}">${toTitleCase(type)}</option>`).join('')}
            </select>
          </label>
        </div>
        <div class="summary-strip">
          <span id="publication-count">${items.length} entries</span>
          <span>Sorted by year descending</span>
        </div>
        <div class="publication-list">${cards}</div>
        <div class="publication-pagination" id="publication-pagination" aria-label="Publication pages"></div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="wrap footer-row">
        <p>© <span id="year"></span> Dr Ajeet Kumar</p>
        <p><a href="contact.html">Contact</a></p>
      </div>
    </footer>

    <script src="assets/js/theme.js"></script>
    <script src="assets/js/main.js"></script>
    <script>
      document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.toggle-bib').forEach((button) => {
          button.addEventListener('click', () => {
            const target = document.getElementById(button.getAttribute('aria-controls'));
            const expanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', String(!expanded));
            target.hidden = expanded;
          });
        });
      });
    </script>
  </body>
</html>`;
}

function buildGalleryPage(items) {
  const cards = items.length
    ? items.map((item) => `
      <article class="gallery-card">
        <a href="${item.file}" class="gallery-link" data-caption="${item.caption || ''}">
          <img src="${item.thumb || item.file}" alt="${item.caption || 'Gallery item'}" loading="lazy" />
        </a>
        <div class="gallery-caption">
          <strong>${item.caption || 'Gallery item'}</strong>
          <p>${item.location || ''}</p>
        </div>
      </article>
    `).join('')
    : `<div class="empty-state"><p>Photos coming soon.</p></div>`;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Gallery | Ajeet Kumar</title>
    <meta name="description" content="Photo gallery for Dr Ajeet Kumar." />
    <meta property="og:title" content="Gallery | Ajeet Kumar" />
    <meta property="og:description" content="Photo gallery for Dr Ajeet Kumar." />
    <meta property="og:type" content="website" />
    <meta property="twitter:card" content="summary" />
    <link rel="stylesheet" href="assets/css/styles.css" />
    <script>
      (function () {
        const saved = localStorage.getItem('theme');
        const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', saved || system);
      })();
    </script>
  </head>
  <body>
    <header class="site-header">
      <div class="wrap nav-bar">
        <a class="brand" href="index.html">Ajeet Kumar</a>
        <nav class="site-nav" aria-label="Primary">
          <a href="index.html">Home</a>
          <a href="about.html">About</a>
          <a href="research.html">Research</a>
          <a href="publications.html">Publications</a>
          <a href="talks.html">Talks</a>
          <a href="awards.html">Awards</a>
          <a href="gallery.html" class="active">Gallery</a>
          <a href="contact.html">Contact</a>
          <button id="theme-toggle" type="button" class="theme-toggle" aria-label="Toggle theme"></button>
        </nav>
      </div>
    </header>

    <main class="wrap page-shell">
      <section class="page-intro">
        <p class="eyebrow">Moments and meetings</p>
        <h1>Gallery</h1>
        <p>Selected photos from awards, conferences, field experiments, and research activity.</p>
      </section>
      <section class="panel">
        <div class="gallery-grid">${cards}</div>
      </section>
    </main>

    <div class="lightbox" id="lightbox" hidden>
      <button class="lightbox-close" type="button" aria-label="Close">×</button>
      <img id="lightbox-image" src="" alt="" />
      <p id="lightbox-caption"></p>
    </div>

    <footer class="site-footer">
      <div class="wrap footer-row">
        <p>© <span id="year"></span> Dr Ajeet Kumar</p>
      </div>
    </footer>

    <script src="assets/js/theme.js"></script>
    <script src="assets/js/gallery.js"></script>
    <script src="assets/js/main.js"></script>
  </body>
</html>`;
}

function ensureDataFiles() {
  const publications = fs.existsSync(publicationsBibPath)
    ? bibEntriesToPublications(parseBibtex(publicationsBibPath))
    : readJson(publicationsPath, []);
  const gallery = readJson(galleryPath, { items: [] });
  const bibEntries = parseBibtex(scholarBibPath);

  if (publications.length && bibEntries.length) {
    publications.forEach((publication) => {
      if (!publication.bibtex) {
        const match = bibEntries.find((entry) => entry.citationKey === publication.id || entry.citationKey === publication.bib_key);
        publication.bibtex = match ? match.raw : '';
      }
    });
    fs.writeFileSync(publicationsPath, JSON.stringify(publications, null, 2));
  }

  if (!fs.existsSync(galleryPath)) {
    fs.writeFileSync(galleryPath, JSON.stringify({ items: [] }, null, 2));
  }

  const galleryItems = discoverGalleryItems(gallery.items || []);
  fs.writeFileSync(galleryPath, JSON.stringify({ items: galleryItems }, null, 2));
}

function buildSite() {
  ensureDir(galleryDir);
  ensureDataFiles();

  const publications = fs.existsSync(publicationsBibPath)
    ? bibEntriesToPublications(parseBibtex(publicationsBibPath))
    : readJson(publicationsPath, []);
  const gallery = readJson(galleryPath, { items: [] });

  fs.writeFileSync(path.join(root, 'publications.html'), buildPublicationsPage(publications));
  fs.writeFileSync(path.join(root, 'gallery.html'), buildGalleryPage(gallery.items || []));
  console.log('Built publications and gallery pages.');
}

if (process.argv.includes('--gallery')) {
  const gallery = readJson(galleryPath, { items: [] });
  const items = discoverGalleryItems(gallery.items || []);
  fs.writeFileSync(galleryPath, JSON.stringify({ items }, null, 2));
  fs.writeFileSync(path.join(root, 'gallery.html'), buildGalleryPage(items));
  console.log('Refreshed gallery page.');
} else {
  buildSite();
}
