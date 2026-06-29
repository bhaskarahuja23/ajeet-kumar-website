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

  let tooltip;

  function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function colors() {
    return isDark()
      ? {
          text: '#ece8de',
          muted: '#b8c5c9',
          line: 'rgba(143,168,182,0.42)',
          soft: 'rgba(98,198,184,0.18)',
          primary: '#62c6b8',
          secondary: '#8fa8b6',
          hot: '#f0b65d'
        }
      : {
          text: '#1b1b1b',
          muted: '#3f5058',
          line: 'rgba(79,100,115,0.32)',
          soft: 'rgba(47,125,114,0.14)',
          primary: '#2f7d72',
          secondary: '#4f6473',
          hot: '#b65e26'
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

  function ensureTooltip() {
    if (tooltip) return tooltip;
    tooltip = document.createElement('div');
    tooltip.className = 'chart-tooltip';
    document.body.appendChild(tooltip);
    return tooltip;
  }

  function showTooltip(event, html) {
    const tip = ensureTooltip();
    tip.innerHTML = html;
    tip.classList.add('is-visible');
    moveTooltip(event);
  }

  function moveTooltip(event) {
    if (!tooltip || !tooltip.classList.contains('is-visible')) return;
    const pad = 14;
    const rect = tooltip.getBoundingClientRect();
    let x = event.clientX + pad;
    let y = event.clientY + pad;
    if (x + rect.width > window.innerWidth - 8) x = event.clientX - rect.width - pad;
    if (y + rect.height > window.innerHeight - 8) y = event.clientY - rect.height - pad;
    tooltip.style.transform = `translate(${Math.max(8, x)}px, ${Math.max(8, y)}px)`;
  }

  function hideTooltip() {
    tooltip?.classList.remove('is-visible');
  }

  function renderCoauthors() {
    const c = colors();
    const top = metrics.topCoauthors;
    const max = Math.max(...top.map((item) => item.count));
    const nodes = top.map((item, index) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / top.length;
      const r = 138;
      const x = 250 + Math.cos(angle) * r;
      const y = 178 + Math.sin(angle) * r;
      const size = 6 + (item.count / max) * 14;
      return { ...item, index, x, y, size };
    });

    const links = nodes.map((node) => `
      <line class="coauthor-link" data-key="${node.index}" x1="250" y1="178" x2="${node.x}" y2="${node.y}" stroke="${node.index < 4 ? c.primary : c.line}" stroke-width="${node.index < 4 ? 1.8 : 1}" opacity="${node.index < 4 ? 0.72 : 0.42}" />
    `).join('');

    const nodeSvg = nodes.map((node) => `
      <g class="coauthor-node metric-hit" data-group="coauthor" data-key="${node.index}" data-tip="<strong>${displayName(node.name)}</strong><span>${node.count} shared publications</span>" tabindex="0">
        <circle class="coauthor-halo" cx="${node.x}" cy="${node.y}" r="${node.size + 8}" fill="${c.soft}" />
        <circle cx="${node.x}" cy="${node.y}" r="${node.size}" fill="${node.index < 4 ? c.primary : c.secondary}" />
        <text x="${node.x}" y="${node.y + node.size + 18}" text-anchor="middle" fill="${c.text}" font-size="10" font-weight="800">${displayName(node.name)}</text>
      </g>
    `).join('');

    const bars = top.slice(0, 8).map((item, index) => {
      const width = 100 * item.count / max;
      return `
        <button class="coauthor-row metric-hit" type="button" data-group="coauthor" data-key="${index}" data-tip="<strong>${displayName(item.name)}</strong><span>${item.count} shared publications</span>">
          <span>${displayName(item.name)}</span>
          <div><i style="width:${width}%;background:${index < 4 ? c.primary : c.secondary}"></i></div>
          <strong>${item.count}</strong>
        </button>
      `;
    }).join('');

    setHtml('coauthor-chart', `
      <div class="chart-note" id="coauthor-note">Hover or focus a node to inspect collaboration strength.</div>
      <div class="coauthor-visual">
        <svg viewBox="0 0 500 365" role="img" aria-label="Interactive co-author network">
          <circle cx="250" cy="178" r="142" fill="none" stroke="${c.line}" />
          <circle cx="250" cy="178" r="86" fill="none" stroke="${c.line}" opacity="0.55" />
          ${links}
          <circle cx="250" cy="178" r="25" fill="${c.primary}" />
          <text x="250" y="183" text-anchor="middle" fill="${isDark() ? '#111' : '#fff'}" font-size="13" font-weight="900">AK</text>
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
    const cy = 188;
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
      return `<line class="radar-axis" data-key="${index}" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="${c.line}" />`;
    }).join('');
    const area = values.map((item, index) => point(item, index, Math.min(item[1] / item[2], 1)).join(',')).join(' ');
    const labels = values.map((item, index) => {
      const [x, y] = point(item, index, 1.26);
      return `
        <g class="radar-label metric-hit" data-group="radar" data-key="${index}" data-tip="<strong>${item[0]}</strong><span>${item[1]} total</span>" tabindex="0">
          <text x="${x}" y="${y - 8}" text-anchor="middle" fill="${c.primary}" font-size="16" font-weight="900">${item[1]}</text>
          <text x="${x}" y="${y + 10}" text-anchor="middle" fill="${c.muted}" font-size="11" font-weight="800">${item[0]}</text>
        </g>
      `;
    }).join('');

    setHtml('metrics-chart', `
      <div class="metric-cards">
        <button type="button" class="metric-hit" data-group="radar" data-key="0" data-tip="<strong>Publications</strong><span>${metrics.totalPublications} total entries</span>"><strong>${metrics.totalPublications}</strong> publications</button>
        <button type="button" class="metric-hit" data-group="radar" data-key="3" data-tip="<strong>Co-authors</strong><span>${metrics.coauthors} unique collaborators</span>"><strong>${metrics.coauthors}</strong> co-authors</button>
        <button type="button" class="metric-hit" data-group="radar" data-key="4" data-tip="<strong>Venues</strong><span>${metrics.venues} publication venues</span>"><strong>${metrics.venues}</strong> venues</button>
      </div>
      <svg viewBox="0 0 500 395" role="img" aria-label="Interactive publication metrics radar chart">
        ${rings}
        ${axes}
        <polygon class="radar-area" points="${area}" fill="${c.soft}" stroke="${c.primary}" stroke-width="3" />
        ${values.map((item, index) => {
          const [x, y] = point(item, index, Math.min(item[1] / item[2], 1));
          return `<circle class="radar-point metric-hit" data-group="radar" data-key="${index}" data-tip="<strong>${item[0]}</strong><span>${item[1]} total</span>" cx="${x}" cy="${y}" r="6" fill="${index === 0 ? c.hot : c.primary}" tabindex="0" />`;
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
        <button class="year-bar metric-hit" type="button" data-group="year" data-key="${item.year}" data-tip="<strong>${item.year}</strong><span>${item.count} publications</span>">
          <strong>${item.count}</strong>
          <i style="height:${height}px"></i>
          <span>${item.year}</span>
        </button>
      `;
    }).join('');
    setHtml('year-chart', `
      <div class="chart-note" id="year-note">Select a year to compare publication output.</div>
      <div class="year-bars" style="--bar:${c.primary};--muted:${c.muted};--text:${c.text}">${bars}</div>
    `);
  }

  function clearActive(group) {
    document.querySelectorAll(`[data-group="${group}"].is-active, [data-group="${group}"][aria-pressed="true"], .${group}-link.is-active, .${group}-axis.is-active`)
      .forEach((node) => {
        node.classList.remove('is-active');
        if (node.hasAttribute('aria-pressed')) node.setAttribute('aria-pressed', 'false');
      });
  }

  function activate(group, key) {
    clearActive(group);
    document.querySelectorAll(`[data-group="${group}"][data-key="${key}"]`).forEach((node) => {
      node.classList.add('is-active');
      if (node.tagName === 'BUTTON') node.setAttribute('aria-pressed', 'true');
    });
    document.querySelectorAll(`.${group}-link[data-key="${key}"], .${group}-axis[data-key="${key}"]`).forEach((node) => node.classList.add('is-active'));

    if (group === 'coauthor') {
      const item = metrics.topCoauthors[Number(key)];
      const note = document.getElementById('coauthor-note');
      if (item && note) note.textContent = `${displayName(item.name)} has ${item.count} shared publications with Dr Ajeet Kumar.`;
    }
    if (group === 'year') {
      const item = metrics.byYear.find((entry) => entry.year === key);
      const note = document.getElementById('year-note');
      if (item && note) note.textContent = `${item.year}: ${item.count} publication${item.count === 1 ? '' : 's'}.`;
    }
  }

  function bindInteractions() {
    document.querySelectorAll('.metric-hit').forEach((node) => {
      const group = node.dataset.group;
      const key = node.dataset.key;
      const tip = node.dataset.tip;
      node.addEventListener('mouseenter', (event) => {
        activate(group, key);
        if (tip) showTooltip(event, tip);
      });
      node.addEventListener('mousemove', moveTooltip);
      node.addEventListener('mouseleave', hideTooltip);
      node.addEventListener('focus', (event) => {
        activate(group, key);
        if (tip) showTooltip(event, tip);
      });
      node.addEventListener('blur', hideTooltip);
      node.addEventListener('click', (event) => {
        activate(group, key);
        if (tip) showTooltip(event, tip);
      });
    });
  }

  function renderAll() {
    renderCoauthors();
    renderRadar();
    renderYears();
    bindInteractions();
  }

  renderAll();
  window.addEventListener('resize', renderAll);
  document.getElementById('theme-toggle')?.addEventListener('click', () => window.setTimeout(renderAll, 0));
})();
