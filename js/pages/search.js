const SearchPage = (() => {
  let state = { query: '', sortBy: 'value_desc', filterBrand: '', filterTeam: '', filterType: '', filterSport: '' };

  const SORT_OPTIONS = [
    { key: 'value_desc', label: 'Value ↓' },
    { key: 'value_asc', label: 'Value ↑' },
    { key: 'name_asc', label: 'Name A-Z' },
    { key: 'year_desc', label: 'Newest' },
    { key: 'year_asc', label: 'Oldest' },
    { key: 'date_desc', label: 'Recently Added' },
  ];

  function render() {
    const cards = DB.getAll();
    const brands = [...new Set(cards.map(c => c.brand).filter(Boolean))];
    const teams = [...new Set(cards.map(c => c.team).filter(Boolean))];
    const types = [...new Set(cards.map(c => c.cardType).filter(Boolean))];
    const sports = [...new Set(cards.map(c => c.sport).filter(Boolean))];

    const main = document.getElementById('main');
    let html = `
      <input type="text" class="input mb-8" id="search-input" placeholder="Search cards..." value="${esc(state.query)}">

      <label class="form-label" style="margin-top:4px">Sort by</label>
      <div class="chip-row mb-8">
        ${SORT_OPTIONS.map(o => `<span class="chip sort-chip${state.sortBy === o.key ? ' active' : ''}" data-val="${o.key}">${o.label}</span>`).join('')}
      </div>

      ${filterChips('Sport', 'sport-filter', sports, state.filterSport)}
      ${filterChips('Brand', 'brand-filter', brands, state.filterBrand)}
      ${filterChips('Team', 'team-filter', teams, state.filterTeam)}
      ${filterChips('Type', 'type-filter', types, state.filterType)}

      <div class="result-header">
        <span class="count" id="res-count"></span>
        <span class="total" id="res-total"></span>
      </div>
      <div id="search-results"></div>
    `;
    main.innerHTML = html;

    // Wire events
    document.getElementById('search-input').addEventListener('input', (e) => {
      state.query = e.target.value;
      updateResults(cards);
    });

    wireFilterChips('sort-chip', (v) => { state.sortBy = v; updateResults(cards); }, true);
    wireFilterGroup('sport-filter', (v) => { state.filterSport = v; updateResults(cards); });
    wireFilterGroup('brand-filter', (v) => { state.filterBrand = v; updateResults(cards); });
    wireFilterGroup('team-filter', (v) => { state.filterTeam = v; updateResults(cards); });
    wireFilterGroup('type-filter', (v) => { state.filterType = v; updateResults(cards); });

    updateResults(cards);
  }

  function filterChips(label, cls, options, selected) {
    if (options.length === 0) return '';
    return `
      <label class="form-label" style="margin-top:4px">${label}</label>
      <div class="chip-row mb-8">
        <span class="chip ${cls}${!selected ? ' active' : ''}" data-val="">All</span>
        ${options.map(o => `<span class="chip ${cls}${selected === o ? ' active' : ''}" data-val="${esc(o)}">${esc(o)}</span>`).join('')}
      </div>
    `;
  }

  function wireFilterChips(cls, cb, isSingle) {
    document.querySelectorAll(`.${cls}`).forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll(`.${cls}`).forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        cb(chip.dataset.val);
      });
    });
  }

  function wireFilterGroup(cls, cb) {
    wireFilterChips(cls, cb, true);
  }

  function updateResults(allCards) {
    let list = [...allCards];
    const q = state.query.toLowerCase();
    if (q) {
      list = list.filter(c =>
        (c.playerName || '').toLowerCase().includes(q) ||
        (c.brand || '').toLowerCase().includes(q) ||
        (c.team || '').toLowerCase().includes(q) ||
        (c.sport || '').toLowerCase().includes(q) ||
        (c.notes || '').toLowerCase().includes(q)
      );
    }
    if (state.filterSport) list = list.filter(c => c.sport === state.filterSport);
    if (state.filterBrand) list = list.filter(c => c.brand === state.filterBrand);
    if (state.filterTeam) list = list.filter(c => c.team === state.filterTeam);
    if (state.filterType) list = list.filter(c => c.cardType === state.filterType);

    switch (state.sortBy) {
      case 'value_desc': list.sort((a, b) => (b.estimatedValue || 0) - (a.estimatedValue || 0)); break;
      case 'value_asc': list.sort((a, b) => (a.estimatedValue || 0) - (b.estimatedValue || 0)); break;
      case 'name_asc': list.sort((a, b) => (a.playerName || '').localeCompare(b.playerName || '')); break;
      case 'year_desc': list.sort((a, b) => (b.year || 0) - (a.year || 0)); break;
      case 'year_asc': list.sort((a, b) => (a.year || 0) - (b.year || 0)); break;
      case 'date_desc': list.sort((a, b) => new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0)); break;
    }

    const total = list.reduce((s, c) => s + (c.estimatedValue || 0), 0);
    document.getElementById('res-count').textContent = `${list.length} card${list.length !== 1 ? 's' : ''}`;
    document.getElementById('res-total').textContent = `$${total.toFixed(2)}`;

    const container = document.getElementById('search-results');
    if (list.length === 0) {
      container.innerHTML = `<div class="empty">No cards match your search.</div>`;
      return;
    }
    container.innerHTML = list.map(c => `
      <div class="card-item" onclick="Router.go('detail', '${c.id}')">
        <div class="card-info">
          <div class="name">${esc(c.playerName)}</div>
          <div class="meta">${[c.sport, c.brand, c.year, c.team, c.cardType].filter(Boolean).join(' · ')}</div>
        </div>
        <div class="card-value">$${(c.estimatedValue || 0).toFixed(2)}</div>
      </div>
    `).join('');
  }

  return { render };
})();
