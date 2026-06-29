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

  function applyFilters() {
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    const selectedYear = yearFilter ? yearFilter.value : 'all';
    const selectedType = typeFilter ? typeFilter.value : 'all';
    const selectedTopic = topicFilter ? topicFilter.value : 'all';

    cards.forEach((card) => {
      const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
      const authors = card.querySelector('.authors')?.textContent.toLowerCase() || '';
      const year = card.dataset.year;
      const type = card.dataset.type;
      const topics = card.dataset.topics || '';
      const matchesQuery = title.includes(query) || authors.includes(query);
      const matchesYear = selectedYear === 'all' || year === selectedYear;
      const matchesType = selectedType === 'all' || type === selectedType;
      const matchesTopic = selectedTopic === 'all' || topics.includes(selectedTopic);
      card.style.display = matchesQuery && matchesYear && matchesType && matchesTopic ? '' : 'none';
    });
  }

  [searchInput, yearFilter, typeFilter, topicFilter].forEach((control) => {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });

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
