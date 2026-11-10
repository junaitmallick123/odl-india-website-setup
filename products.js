
const cards = [...document.querySelectorAll('[data-category]')];
const filters = [...document.querySelectorAll('[data-filter]')];
const search = document.querySelector('#search');
let category = 'all';

function updateCatalogue() {
  const terms = search.value.toLowerCase().trim().split(/\s+/);
  let visible = 0;
  for (const card of cards) {
    const searchable = card.textContent.toLowerCase();
    const matchesCategory = category === 'all' || card.dataset.category === category;
    card.hidden = !matchesCategory || !terms.every(term => searchable.includes(term));
    if (!card.hidden) visible++;
  }
  document.querySelector('#count').textContent = visible
    ? `${visible} of ${cards.length} products`
    : 'No products match. Try another search or category.';
}
for (const button of filters) {
  button.addEventListener('click', () => {
    category = button.dataset.filter;
    for (const filter of filters) filter.setAttribute('aria-pressed', String(filter === button));
    updateCatalogue();
  });
}
search.addEventListener('input', updateCatalogue);
const requestedCategory = new URLSearchParams(location.search).get('category');
const requestedFilter = filters.find(button => button.dataset.filter === requestedCategory);
document.querySelector('.controls').hidden = false;
if (requestedFilter) requestedFilter.click();
else updateCatalogue();
