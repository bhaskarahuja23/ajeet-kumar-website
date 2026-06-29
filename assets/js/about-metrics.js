(function () {
  const radialCanvas = document.getElementById('coauthor-chart');
  const radarCanvas = document.getElementById('metrics-chart');
  const yearCanvas = document.getElementById('year-chart');
  if (!radialCanvas && !radarCanvas && !yearCanvas) return;

  function css(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function setup(canvas) {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * ratio);
    canvas.height = Math.floor(rect.height * ratio);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    return { ctx, width: rect.width, height: rect.height };
  }

  function shortName(name) {
    const parts = name.split(',');
    if (parts.length > 1) return `${parts[0].trim()}, ${parts[1].trim().charAt(0)}.`;
    return name;
  }

  function drawCoauthors(data) {
    if (!radialCanvas) return;
    const { ctx, width, height } = setup(radialCanvas);
    const text = css('--text');
    const muted = css('--text-muted');
    const accent = css('--accent');
    const highlight = css('--highlight');
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2 + 10;
    const radius = Math.min(width, height) * 0.29;
    const max = Math.max(...data.topCoauthors.map((item) => item.count), 1);

    ctx.strokeStyle = muted;
    ctx.globalAlpha = 0.18;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    data.topCoauthors.forEach((item, index) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / data.topCoauthors.length;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      const node = 4 + (item.count / max) * 10;

      ctx.strokeStyle = index < 6 ? accent : muted;
      ctx.globalAlpha = index < 6 ? 0.42 : 0.18;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.globalAlpha = 1;

      ctx.fillStyle = index < 6 ? highlight : accent;
      ctx.beginPath();
      ctx.arc(x, y, node, 0, Math.PI * 2);
      ctx.fill();

      const labelRadius = radius + 42;
      const lx = cx + Math.cos(angle) * labelRadius;
      const ly = cy + Math.sin(angle) * labelRadius;
      ctx.fillStyle = text;
      ctx.font = '600 11px Inter, Segoe UI, Arial, sans-serif';
      ctx.textAlign = Math.cos(angle) > 0.15 ? 'left' : Math.cos(angle) < -0.15 ? 'right' : 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(shortName(item.name), lx, ly);
    });

    ctx.fillStyle = text;
    ctx.font = '700 15px Inter, Segoe UI, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${data.coauthors}`, cx, cy - 3);
    ctx.fillStyle = muted;
    ctx.font = '600 11px Inter, Segoe UI, Arial, sans-serif';
    ctx.fillText('co-authors', cx, cy + 14);
  }

  function drawRadar(data) {
    if (!radarCanvas) return;
    const { ctx, width, height } = setup(radarCanvas);
    const text = css('--text');
    const muted = css('--text-muted');
    const accent = css('--accent');
    const highlight = css('--highlight');
    const values = [
      ['Publications', data.totalPublications, 60],
      ['Journals', data.journalArticles, 35],
      ['Conferences', data.conferenceArticles, 35],
      ['Co-authors', data.coauthors, 70],
      ['Venues', data.venues, 50],
      ['Years', data.activeYears, 15]
    ];
    const cx = width / 2;
    const cy = height / 2 + 8;
    const radius = Math.min(width, height) * 0.34;

    ctx.clearRect(0, 0, width, height);
    for (let ring = 1; ring <= 4; ring += 1) {
      ctx.strokeStyle = muted;
      ctx.globalAlpha = 0.22;
      ctx.beginPath();
      values.forEach((_, i) => {
        const angle = -Math.PI / 2 + (Math.PI * 2 * i) / values.length;
        const r = (radius * ring) / 4;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    ctx.beginPath();
    values.forEach((item, i) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * i) / values.length;
      const r = radius * Math.min(item[1] / item[2], 1);
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(79, 100, 115, 0.22)';
    ctx.fill();
    ctx.strokeStyle = highlight;
    ctx.lineWidth = 2;
    ctx.stroke();

    values.forEach((item, i) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * i) / values.length;
      const lx = cx + Math.cos(angle) * (radius + 34);
      const ly = cy + Math.sin(angle) * (radius + 34);
      ctx.fillStyle = text;
      ctx.font = '700 12px Inter, Segoe UI, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(item[1]), lx, ly - 8);
      ctx.fillStyle = muted;
      ctx.font = '600 10px Inter, Segoe UI, Arial, sans-serif';
      ctx.fillText(item[0], lx, ly + 8);
    });
  }

  function drawYears(data) {
    if (!yearCanvas) return;
    const { ctx, width, height } = setup(yearCanvas);
    const text = css('--text');
    const muted = css('--text-muted');
    const highlight = css('--highlight');
    const pad = 34;
    const max = Math.max(...data.byYear.map((item) => item.count), 1);
    const barWidth = (width - pad * 2) / data.byYear.length;
    ctx.clearRect(0, 0, width, height);

    data.byYear.forEach((item, i) => {
      const x = pad + i * barWidth + 4;
      const h = ((height - 70) * item.count) / max;
      const y = height - 42 - h;
      ctx.fillStyle = highlight;
      ctx.globalAlpha = 0.78;
      ctx.fillRect(x, y, Math.max(8, barWidth - 8), h);
      ctx.globalAlpha = 1;
      ctx.fillStyle = text;
      ctx.font = '700 11px Inter, Segoe UI, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.count, x + (barWidth - 8) / 2, y - 6);
      ctx.fillStyle = muted;
      ctx.font = '600 10px Inter, Segoe UI, Arial, sans-serif';
      ctx.save();
      ctx.translate(x + (barWidth - 8) / 2, height - 22);
      ctx.rotate(-0.65);
      ctx.fillText(item.year, 0, 0);
      ctx.restore();
    });
  }

  fetch('data/publication-metrics.json')
    .then((response) => response.json())
    .then((data) => {
      drawCoauthors(data);
      drawRadar(data);
      drawYears(data);
      window.addEventListener('resize', () => {
        drawCoauthors(data);
        drawRadar(data);
        drawYears(data);
      });
    });
})();
