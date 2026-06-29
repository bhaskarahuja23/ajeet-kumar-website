(function () {
  const metrics = {
    totalPublications: 51,
    journalArticles: 26,
    conferenceArticles: 22,
    bookChapters: 1,
    theses: 1,
    coauthors: 54,
    venues: 40,
    activeYears: 12,
    byYear: [
      { year: '2015', count: 1 },
      { year: '2016', count: 2 },
      { year: '2017', count: 3 },
      { year: '2018', count: 1 },
      { year: '2019', count: 6 },
      { year: '2020', count: 2 },
      { year: '2021', count: 3 },
      { year: '2022', count: 8 },
      { year: '2023', count: 5 },
      { year: '2024', count: 8 },
      { year: '2025', count: 10 },
      { year: '2026', count: 2 }
    ],
    topCoauthors: [
      { name: 'Panigrahi, Rajib Kumar', count: 20 },
      { name: 'Martorella, Marco', count: 20 },
      { name: 'Giusti, Elisa', count: 13 },
      { name: 'Das, Anup', count: 11 },
      { name: 'Mancuso, Francesco', count: 7 },
      { name: 'Ghio, Selenia', count: 7 },
      { name: 'Awasthi, Shubham', count: 4 },
      { name: 'Jain, Kamal', count: 4 },
      { name: 'Meucci, Giulio', count: 3 },
      { name: 'Bhatt, Avinash', count: 3 },
      { name: 'Goel, Tushar', count: 3 },
      { name: 'Oveis, Amir Hosein', count: 3 }
    ]
  };

  function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function colors() {
    return isDark()
      ? {
          text: '#ece8de',
          muted: '#b8c5c9',
          line: 'rgba(143,168,182,0.42)',
          soft: 'rgba(98,198,184,0.16)',
          primary: '#62c6b8',
          secondary: '#8fa8b6',
          card: 'rgba(255,255,255,0.04)'
        }
      : {
          text: '#1b1b1b',
          muted: '#3f5058',
          line: 'rgba(79,100,115,0.32)',
          soft: 'rgba(47,125,114,0.13)',
          primary: '#2f7d72',
          secondary: '#4f6473',
          card: 'rgba(255,255,255,0.72)'
        };
  }

  function displayName(name) {
    const [surname, given = ''] = name.split(',').map((part) => part.trim());
    return given ? `${given.charAt(0)}. ${surname}` : surname;
  }

  function setHtml(id, html) {
    const target = document.getElementById(id);
    if (target) target.innerHTML = html;
  }

  function renderCoauthors() {
    const c = colors();
    const top = metrics.topCoauthors;
    const max = Math.max(...top.map((item) => item.count));
    const nodes = top.slice(0, 10).map((item, index) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / 10;
      const r = 128;
      const x = 250 + Math.cos(angle) * r;
      const y = 172 + Math.sin(angle) * r;
      const size = 7 + (item.count / max) * 10;
      return { ...item, x, y, size };
    });

    const links = nodes.map((node, index) => `
      <line x1="250" y1="172" x2="${node.x}" y2="${node.y}" stroke="${index < 4 ? c.primary : c.line}" stroke-width="${index < 4 ? 1.8 : 1}" opacity="${index < 4 ? 0.72 : 0.45}" />
    `).join('');

    const nodeSvg = nodes.map((node, index) => `
      <g>
        <circle cx="${node.x}" cy="${node.y}" r="${node.size + 5}" fill="${c.soft}" />
        <circle cx="${node.x}" cy="${node.y}" r="${node.size}" fill="${index < 4 ? c.primary : c.secondary}" />
        <text x="${node.x}" y="${node.y + node.size + 18}" text-anchor="middle" fill="${c.text}" font-size="10" font-weight="700">${displayName(node.name)}</text>
      </g>
    `).join('');

    const bars = top.slice(0, 8).map((item, index) => {
      const width = 180 * item.count / max;
      return `
        <div class="coauthor-row">
          <span>${displayName(item.name)}</span>
          <div><i style="width:${width}px;background:${index < 4 ? c.primary : c.secondary}"></i></div>
          <strong>${item.count}</strong>
        </div>
      `;
    }).join('');

    setHtml('coauthor-chart', `
      <div class="coauthor-visual">
        <svg viewBox="0 0 500 350" role="img" aria-label="Co-author network">
          <circle cx="250" cy="172" r="132" fill="none" stroke="${c.line}" />
          <circle cx="250" cy="172" r="82" fill="none" stroke="${c.line}" opacity="0.55" />
          ${links}
          <circle cx="250" cy="172" r="24" fill="${c.primary}" />
          <text x="250" y="177" text-anchor="middle" fill="${isDark() ? '#111' : '#fff'}" font-size="13" font-weight="900">AK</text>
          ${nodeSvg}
        </svg>
      </div>
      <div class="coauthor-bars">${bars}</div>
    `);
  }

  function renderRadar() {
    const c = colors();
    const values = [
      ['Publications', metrics.totalPublications, 60],
      ['Journals', metrics.journalArticles, 35],
      ['Conferences', metrics.conferenceArticles, 35],
      ['Co-authors', metrics.coauthors, 70],
      ['Venues', metrics.venues, 50],
      ['Years', metrics.activeYears, 15]
    ];
    const cx = 250;
    const cy = 185;
    const radius = 118;
    const point = (item, index, scale = 1) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / values.length;
      const r = radius * scale;
      return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
    };
    const rings = [0.25, 0.5, 0.75, 1].map((scale) => {
      const pts = values.map((_, index) => point(_, index, scale).join(',')).join(' ');
      return `<polygon points="${pts}" fill="none" stroke="${c.line}" />`;
    }).join('');
    const axes = values.map((item, index) => {
      const [x, y] = point(item, index, 1);
      return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="${c.line}" />`;
    }).join('');
    const area = values.map((item, index) => point(item, index, Math.min(item[1] / item[2], 1)).join(',')).join(' ');
    const labels = values.map((item, index) => {
      const [x, y] = point(item, index, 1.26);
      return `
        <text x="${x}" y="${y - 8}" text-anchor="middle" fill="${c.primary}" font-size="16" font-weight="900">${item[1]}</text>
        <text x="${x}" y="${y + 10}" text-anchor="middle" fill="${c.muted}" font-size="11" font-weight="800">${item[0]}</text>
      `;
    }).join('');

    setHtml('metrics-chart', `
      <div class="metric-cards">
        <span><strong>${metrics.totalPublications}</strong> publications</span>
        <span><strong>${metrics.coauthors}</strong> co-authors</span>
        <span><strong>${metrics.venues}</strong> venues</span>
      </div>
      <svg viewBox="0 0 500 390" role="img" aria-label="Publication metrics radar chart">
        ${rings}
        ${axes}
        <polygon points="${area}" fill="${c.soft}" stroke="${c.primary}" stroke-width="3" />
        ${values.map((item, index) => {
          const [x, y] = point(item, index, Math.min(item[1] / item[2], 1));
          return `<circle cx="${x}" cy="${y}" r="5" fill="${c.primary}" />`;
        }).join('')}
        ${labels}
      </svg>
    `);
  }

  function renderYears() {
    const c = colors();
    const max = Math.max(...metrics.byYear.map((item) => item.count));
    const bars = metrics.byYear.map((item) => {
      const height = 112 * item.count / max;
      return `
        <div class="year-bar" title="${item.year}: ${item.count} publications">
          <strong>${item.count}</strong>
          <i style="height:${height}px"></i>
          <span>${item.year}</span>
        </div>
      `;
    }).join('');
    setHtml('year-chart', `<div class="year-bars" style="--bar:${c.primary};--muted:${c.muted};--text:${c.text}">${bars}</div>`);
  }

  function renderAll() {
    renderCoauthors();
    renderRadar();
    renderYears();
  }

  renderAll();
  window.addEventListener('resize', renderAll);
  document.getElementById('theme-toggle')?.addEventListener('click', () => window.setTimeout(renderAll, 0));
})();
