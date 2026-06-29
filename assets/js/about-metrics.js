(function () {
  const coauthorCanvas = document.getElementById('coauthor-chart');
  const radarCanvas = document.getElementById('metrics-chart');
  const yearCanvas = document.getElementById('year-chart');
  if (!coauthorCanvas && !radarCanvas && !yearCanvas) return;

  function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function palette() {
    return isDark()
      ? {
          text: '#ece8de',
          muted: '#b8c5c9',
          grid: 'rgba(184, 197, 201, 0.28)',
          primary: '#62c6b8',
          secondary: '#8fa8b6',
          fill: 'rgba(98, 198, 184, 0.18)'
        }
      : {
          text: '#1b1b1b',
          muted: '#4f5d62',
          grid: 'rgba(79, 93, 98, 0.22)',
          primary: '#2f7d72',
          secondary: '#4f6473',
          fill: 'rgba(47, 125, 114, 0.16)'
        };
  }

  function setup(canvas) {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * ratio);
    canvas.height = Math.floor(rect.height * ratio);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);
    return { ctx, width: rect.width, height: rect.height };
  }

  function displayName(name) {
    const [surname, given = ''] = name.split(',').map((part) => part.trim());
    return given ? `${given.charAt(0)}. ${surname}` : surname;
  }

  function drawCoauthors(data) {
    if (!coauthorCanvas) return;
    const { ctx, width, height } = setup(coauthorCanvas);
    const colors = palette();
    const top = data.topCoauthors.slice(0, 12);
    const max = Math.max(...top.map((item) => item.count), 1);
    const leftWidth = width * 0.52;
    const row = Math.min(25, (height - 70) / top.length);

    ctx.fillStyle = colors.text;
    ctx.font = '700 15px Inter, Segoe UI, Arial, sans-serif';
    ctx.fillText('Top collaborators', 18, 26);
    ctx.fillStyle = colors.muted;
    ctx.font = '600 11px Inter, Segoe UI, Arial, sans-serif';
    ctx.fillText(`${data.coauthors} total co-authors from BibTeX`, 18, 44);

    top.forEach((item, index) => {
      const y = 70 + index * row;
      const barMax = leftWidth - 160;
      const bar = (item.count / max) * barMax;
      ctx.fillStyle = colors.muted;
      ctx.font = '600 11px Inter, Segoe UI, Arial, sans-serif';
      ctx.fillText(displayName(item.name), 18, y + 9);
      ctx.fillStyle = 'rgba(127, 140, 145, 0.18)';
      ctx.fillRect(150, y, barMax, 11);
      ctx.fillStyle = index < 4 ? colors.primary : colors.secondary;
      ctx.fillRect(150, y, bar, 11);
      ctx.fillStyle = colors.text;
      ctx.font = '700 11px Inter, Segoe UI, Arial, sans-serif';
      ctx.fillText(String(item.count), 158 + barMax, y + 9);
    });

    const cx = width * 0.76;
    const cy = height * 0.52;
    const radius = Math.min(width, height) * 0.22;
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    for (let ring = 1; ring <= 3; ring += 1) {
      ctx.beginPath();
      ctx.arc(cx, cy, (radius * ring) / 3, 0, Math.PI * 2);
      ctx.stroke();
    }

    top.slice(0, 10).forEach((item, index) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / 10;
      const strength = item.count / max;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      ctx.strokeStyle = index < 4 ? colors.primary : colors.grid;
      ctx.globalAlpha = index < 4 ? 0.75 : 0.55;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = index < 4 ? colors.primary : colors.secondary;
      ctx.beginPath();
      ctx.arc(x, y, 4 + strength * 7, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = colors.primary;
    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = isDark() ? '#101414' : '#ffffff';
    ctx.font = '800 11px Inter, Segoe UI, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('AK', cx, cy);
    ctx.textAlign = 'start';
    ctx.textBaseline = 'alphabetic';
  }

  function drawRadar(data) {
    if (!radarCanvas) return;
    const { ctx, width, height } = setup(radarCanvas);
    const colors = palette();
    const values = [
      ['Publications', data.totalPublications, 60],
      ['Journals', data.journalArticles, 35],
      ['Conferences', data.conferenceArticles, 35],
      ['Co-authors', data.coauthors, 70],
      ['Venues', data.venues, 50],
      ['Years', data.activeYears, 15]
    ];
    const cx = width / 2;
    const cy = height / 2 + 10;
    const radius = Math.min(width, height) * 0.31;

    for (let ring = 1; ring <= 4; ring += 1) {
      ctx.strokeStyle = colors.grid;
      ctx.beginPath();
      values.forEach((_, index) => {
        const angle = -Math.PI / 2 + (Math.PI * 2 * index) / values.length;
        const r = (radius * ring) / 4;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.stroke();
    }

    values.forEach((_, index) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / values.length;
      ctx.strokeStyle = colors.grid;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
      ctx.stroke();
    });

    ctx.beginPath();
    values.forEach((item, index) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / values.length;
      const r = radius * Math.min(item[1] / item[2], 1);
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = colors.fill;
    ctx.fill();
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    values.forEach((item, index) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / values.length;
      const lx = cx + Math.cos(angle) * (radius + 34);
      const ly = cy + Math.sin(angle) * (radius + 34);
      ctx.fillStyle = colors.primary;
      ctx.font = '800 12px Inter, Segoe UI, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(item[1]), lx, ly - 8);
      ctx.fillStyle = colors.muted;
      ctx.font = '700 10px Inter, Segoe UI, Arial, sans-serif';
      ctx.fillText(item[0], lx, ly + 8);
    });
  }

  function drawYears(data) {
    if (!yearCanvas) return;
    const { ctx, width, height } = setup(yearCanvas);
    const colors = palette();
    const padX = 38;
    const base = height - 34;
    const max = Math.max(...data.byYear.map((item) => item.count), 1);
    const barWidth = (width - padX * 2) / data.byYear.length;

    ctx.strokeStyle = colors.grid;
    ctx.beginPath();
    ctx.moveTo(padX, base);
    ctx.lineTo(width - padX, base);
    ctx.stroke();

    data.byYear.forEach((item, index) => {
      const x = padX + index * barWidth + 5;
      const usable = height - 76;
      const barHeight = (usable * item.count) / max;
      const y = base - barHeight;
      ctx.fillStyle = colors.primary;
      ctx.fillRect(x, y, Math.max(8, barWidth - 10), barHeight);
      ctx.fillStyle = colors.text;
      ctx.font = '800 10px Inter, Segoe UI, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.count, x + (barWidth - 10) / 2, y - 5);
      ctx.fillStyle = colors.muted;
      ctx.font = '700 9px Inter, Segoe UI, Arial, sans-serif';
      ctx.save();
      ctx.translate(x + (barWidth - 10) / 2, height - 13);
      ctx.rotate(-0.55);
      ctx.fillText(item.year, 0, 0);
      ctx.restore();
    });
  }

  function drawAll(data) {
    drawCoauthors(data);
    drawRadar(data);
    drawYears(data);
  }

  fetch('data/publication-metrics.json')
    .then((response) => response.json())
    .then((data) => {
      drawAll(data);
      window.addEventListener('resize', () => drawAll(data));
      document.getElementById('theme-toggle')?.addEventListener('click', () => {
        window.setTimeout(() => drawAll(data), 0);
      });
    });
})();
