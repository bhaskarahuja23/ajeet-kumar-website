(function () {
  const canvas = document.getElementById('site-background');
  if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let points = [];
  let frame = null;
  let tick = 0;

  function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const count = Math.max(28, Math.min(56, Math.floor((width * height) / 26000)));
    points = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      r: 1 + Math.random() * 1.2
    }));
  }

  function drawRadar(cx, cy, radius, dark) {
    const green = dark ? '58, 205, 116' : '40, 120, 88';
    const blue = dark ? '86, 172, 218' : '79, 100, 115';
    const sweep = tick * 0.012;

    ctx.save();
    ctx.translate(cx, cy);

    for (let i = 1; i <= 5; i += 1) {
      ctx.strokeStyle = `rgba(${green}, ${dark ? 0.13 : 0.08})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, (radius / 5) * i, 0, Math.PI * 2);
      ctx.stroke();
    }

    for (let i = 0; i < 8; i += 1) {
      const angle = (Math.PI * 2 * i) / 8;
      ctx.strokeStyle = `rgba(${blue}, ${dark ? 0.1 : 0.07})`;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
      ctx.stroke();
    }

    const gradient = ctx.createConicGradient(sweep, 0, 0);
    gradient.addColorStop(0, `rgba(${green}, 0)`);
    gradient.addColorStop(0.06, `rgba(${green}, ${dark ? 0.24 : 0.14})`);
    gradient.addColorStop(0.13, `rgba(${green}, 0)`);
    gradient.addColorStop(1, `rgba(${green}, 0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(${green}, ${dark ? 0.65 : 0.45})`;
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawNetwork(dark) {
    const dot = dark ? '180, 202, 214' : '79, 100, 115';
    const line = dark ? '143, 168, 182' : '79, 100, 115';

    points.forEach((point) => {
      point.x += point.vx;
      point.y += point.vy;
      if (point.x < -10) point.x = width + 10;
      if (point.x > width + 10) point.x = -10;
      if (point.y < -10) point.y = height + 10;
      if (point.y > height + 10) point.y = -10;
    });

    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const a = points[i];
        const b = points[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 118) {
          ctx.strokeStyle = `rgba(${line}, ${(1 - distance / 118) * (dark ? 0.12 : 0.08)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    points.forEach((point) => {
      ctx.fillStyle = `rgba(${dot}, ${dark ? 0.2 : 0.12})`;
      ctx.beginPath();
      ctx.arc(point.x, point.y, point.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const dark = isDark();
    drawRadar(width * 0.72, height * 0.28, Math.min(width, height) * 0.34, dark);
    drawNetwork(dark);
    tick += 1;
    frame = requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', () => {
    cancelAnimationFrame(frame);
    resize();
    draw();
  });
})();
