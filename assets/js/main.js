document.addEventListener('DOMContentLoaded', () => {
  const year = document.getElementById('year');
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  const searchInput = document.getElementById('publication-search');
  const yearFilter = document.getElementById('year-filter');
  const typeFilter = document.getElementById('type-filter');
  const topicFilter = document.getElementById('topic-filter');
  const cards = Array.from(document.querySelectorAll('.publication-card'));
  const pagination = document.getElementById('publication-pagination');
  const publicationCount = document.getElementById('publication-count');
  const pageSize = 10;
  let currentPage = 1;
  let filteredCards = cards;

  function renderPublicationPage() {
    const totalPages = Math.max(1, Math.ceil(filteredCards.length / pageSize));
    currentPage = Math.min(currentPage, totalPages);
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;

    cards.forEach((card) => {
      card.hidden = !filteredCards.includes(card) || filteredCards.indexOf(card) < start || filteredCards.indexOf(card) >= end;
    });

    if (publicationCount) {
      const visibleStart = filteredCards.length ? start + 1 : 0;
      const visibleEnd = Math.min(end, filteredCards.length);
      publicationCount.textContent = `${visibleStart}-${visibleEnd} of ${filteredCards.length} entries`;
    }

    if (!pagination) return;
    pagination.innerHTML = '';
    if (filteredCards.length <= pageSize) return;

    for (let page = 1; page <= totalPages; page += 1) {
      const button = document.createElement('button');
      const rangeStart = (page - 1) * pageSize + 1;
      const rangeEnd = Math.min(page * pageSize, filteredCards.length);
      button.type = 'button';
      button.textContent = `${rangeStart}-${rangeEnd}`;
      button.className = page === currentPage ? 'active' : '';
      button.setAttribute('aria-current', page === currentPage ? 'page' : 'false');
      button.addEventListener('click', () => {
        currentPage = page;
        renderPublicationPage();
        document.querySelector('.publication-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      pagination.appendChild(button);
    }
  }

  function applyFilters() {
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    const selectedYear = yearFilter ? yearFilter.value : 'all';
    const selectedType = typeFilter ? typeFilter.value : 'all';
    const selectedTopic = topicFilter ? topicFilter.value : 'all';

    filteredCards = cards.filter((card) => {
      const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
      const authors = card.querySelector('.authors')?.textContent.toLowerCase() || '';
      const year = card.dataset.year;
      const type = card.dataset.type;
      const topics = card.dataset.topics || '';
      const matchesQuery = title.includes(query) || authors.includes(query);
      const matchesYear = selectedYear === 'all' || year === selectedYear;
      const matchesType = selectedType === 'all' || type === selectedType;
      const matchesTopic = selectedTopic === 'all' || topics.includes(selectedTopic);
      return matchesQuery && matchesYear && matchesType && matchesTopic;
    });
    currentPage = 1;
    renderPublicationPage();
  }

  [searchInput, yearFilter, typeFilter, topicFilter].forEach((control) => {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });
  applyFilters();

  const revealItems = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealItems.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      });
    }, { rootMargin: '-18% 0px -55% 0px', threshold: 0.1 });

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }
});
