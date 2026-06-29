(function () {
  const lightbox = document.getElementById('lightbox');
  const image = document.getElementById('lightbox-image');
  const caption = document.getElementById('lightbox-caption');
  const closeButton = document.querySelector('.lightbox-close');

  document.querySelectorAll('.gallery-link').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      image.src = link.getAttribute('href');
      image.alt = link.dataset.caption || 'Gallery item';
      caption.textContent = link.dataset.caption || '';
      lightbox.hidden = false;
    });
  });

  if (closeButton) {
    closeButton.addEventListener('click', () => {
      lightbox.hidden = true;
    });
  }

  if (lightbox) {
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) {
        lightbox.hidden = true;
      }
    });
  }
})();
