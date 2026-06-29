(function () {
  const canvas = document.getElementById('sar-animation');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width = 0;
  let height = 0;
  let frame = 0;
  let animationFrame = null;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function drawSatellite(x, y, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.fillStyle = '#304b5d';
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 1.4;
    ctx.fillRect(-18, -12, 36, 24);
    ctx.strokeRect(-18, -12, 36, 24);

    ctx.fillStyle = '#1f3443';
    ctx.fillRect(-92, -14, 62, 28);
    ctx.fillRect(30, -14, 62, 28);
    ctx.strokeRect(-92, -14, 62, 28);
    ctx.strokeRect(30, -14, 62, 28);

    ctx.strokeStyle = 'rgba(143,168,182,0.8)';
    [-78, -62, -46, 46, 62, 78].forEach((lineX) => {
      ctx.beginPath();
      ctx.moveTo(lineX, -14);
      ctx.lineTo(lineX, 14);
      ctx.stroke();
    });

    ctx.fillStyle = '#c8974f';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const t = reduceMotion ? 0.25 : frame / 220;
    const scan = (Math.sin(t * Math.PI * 2) + 1) / 2;

    const sky = ctx.createLinearGradient(0, 0, width, height);
    sky.addColorStop(0, '#eef4f7');
    sky.addColorStop(0.55, '#dce9ef');
    sky.addColorStop(1, '#f9f7f2');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(79,100,115,0.12)';
    for (let i = 0; i < 44; i += 1) {
      const x = (i * 97 + frame * 0.08) % width;
      const y = (i * 53) % (height * 0.58);
      ctx.fillRect(x, y, 1.2, 1.2);
    }

    const earthY = height * 1.08;
    const earthR = width * 0.86;
    const earth = ctx.createRadialGradient(width * 0.55, earthY, earthR * 0.08, width * 0.52, earthY, earthR);
    earth.addColorStop(0, '#f8fbfc');
    earth.addColorStop(0.42, '#a8c2d1');
    earth.addColorStop(0.7, '#4f7286');
    earth.addColorStop(1, '#243f51');
    ctx.fillStyle = earth;
    ctx.beginPath();
    ctx.arc(width * 0.52, earthY, earthR, Math.PI * 1.08, Math.PI * 1.92);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(width * 0.52, earthY, earthR, Math.PI * 1.08, Math.PI * 1.92);
    ctx.stroke();

    const satX = width * (0.34 + scan * 0.24);
    const satY = height * (0.2 + Math.sin(t * Math.PI * 2) * 0.025);
    const targetX = width * (0.42 + scan * 0.24);
    const targetY = height * 0.72;

    const beam = ctx.createLinearGradient(satX, satY, targetX, targetY);
    beam.addColorStop(0, 'rgba(90, 196, 126, 0.36)');
    beam.addColorStop(1, 'rgba(90, 196, 126, 0.02)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(satX - 7, satY + 24);
    ctx.lineTo(targetX - width * 0.1, targetY);
    ctx.lineTo(targetX + width * 0.12, targetY + height * 0.04);
    ctx.lineTo(satX + 7, satY + 24);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(61, 174, 105, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(satX, satY + 22);
    ctx.lineTo(targetX, targetY + 8);
    ctx.stroke();

    ctx.save();
    ctx.translate(targetX, targetY + 14);
    ctx.rotate(-0.08);
    ctx.fillStyle = 'rgba(35, 48, 50, 0.62)';
    ctx.fillRect(-82, -18, 164, 48);
    ctx.fillStyle = 'rgba(238, 238, 226, 0.5)';
    ctx.fillRect(-76 + scan * 96, -13, 42, 38);
    ctx.strokeStyle = 'rgba(255,255,255,0.42)';
    ctx.strokeRect(-82, -18, 164, 48);
    ctx.restore();

    drawSatellite(satX, satY, 0.11);

    ctx.fillStyle = 'rgba(40,72,95,0.86)';
    ctx.font = '700 13px Inter, Segoe UI, Arial, sans-serif';
    ctx.fillText('SAR scan path', 18, height - 22);

    if (!reduceMotion) {
      frame += 1;
      animationFrame = requestAnimationFrame(draw);
    }
  }

  resize();
  draw();
  window.addEventListener('resize', () => {
    cancelAnimationFrame(animationFrame);
    resize();
    draw();
  });
})();
