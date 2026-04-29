const PortfolioPage = (() => {
  function render() {
    const cards = DB.getAll();
    const main = document.getElementById('main');

    if (cards.length === 0) {
      main.innerHTML = `<div class="empty">Add some cards to see your portfolio stats.</div>`;
      return;
    }

    const values = cards.map(c => c.estimatedValue || 0);
    const total = values.reduce((a, b) => a + b, 0);
    const sorted = [...cards].sort((a, b) => (b.estimatedValue || 0) - (a.estimatedValue || 0));
    const highest = sorted[0];
    const lowest = sorted[sorted.length - 1];
    const avg = total / cards.length;
    const median = sorted[Math.floor(sorted.length / 2)]?.estimatedValue || 0;

    const byBrand = groupBy(cards, 'brand');
    const byTeam = groupBy(cards, 'team');
    const byType = groupBy(cards, 'cardType');
    const bySport = groupBy(cards, 'sport');

    let html = `
      <div class="total-card">
        <div class="total-label">Total Collection Value</div>
        <div class="total-value">$${total.toFixed(2)}</div>
        <div class="total-sub">${cards.length} card${cards.length !== 1 ? 's' : ''}</div>
      </div>
      <div class="stats-row">
        <div class="stat-card" style="border-left-color:var(--green)">
          <div class="stat-label">Highest</div>
          <div class="stat-value" style="color:var(--green)">$${(highest.estimatedValue || 0).toFixed(2)}</div>
          <div class="stat-sub">${esc(highest.playerName)}</div>
        </div>
        <div class="stat-card" style="border-left-color:var(--red)">
          <div class="stat-label">Lowest</div>
          <div class="stat-value" style="color:var(--red)">$${(lowest.estimatedValue || 0).toFixed(2)}</div>
          <div class="stat-sub">${esc(lowest.playerName)}</div>
        </div>
      </div>
      <div class="stats-row">
        <div class="stat-card" style="border-left-color:var(--blue)">
          <div class="stat-label">Average</div>
          <div class="stat-value" style="color:var(--blue)">$${avg.toFixed(2)}</div>
        </div>
        <div class="stat-card" style="border-left-color:var(--purple)">
          <div class="stat-label">Median</div>
          <div class="stat-value" style="color:var(--purple)">$${median.toFixed(2)}</div>
        </div>
      </div>

      <div class="section-title">Top 5 Most Valuable</div>
      ${sorted.slice(0, 5).map((c, i) => `
        <div class="rank-row" onclick="Router.go('detail', '${c.id}')">
          <span class="rank-num">#${i + 1}</span>
          <div class="rank-info">
            <div class="name">${esc(c.playerName)}</div>
            <div class="meta">${esc(c.brand || '')} · ${c.year || ''} · ${esc(c.cardType || '')}</div>
          </div>
          <span class="rank-value">$${(c.estimatedValue || 0).toFixed(2)}</span>
        </div>
      `).join('')}

      ${breakdownSection('Value by Sport', bySport)}
      ${breakdownSection('Value by Brand', byBrand)}
      ${breakdownSection('Value by Team', byTeam)}
      ${breakdownSection('Value by Card Type', byType)}

      <button class="btn btn-secondary mt-16" style="width:100%" onclick="PortfolioPage.refresh()">🔄 Refresh All Values</button>
    `;

    main.innerHTML = html;
  }

  function groupBy(cards, key) {
    const map = {};
    cards.forEach(c => {
      const k = c[key] || 'Unknown';
      if (!map[k]) map[k] = { count: 0, value: 0 };
      map[k].count++;
      map[k].value += c.estimatedValue || 0;
    });
    return Object.entries(map).sort((a, b) => b[1].value - a[1].value);
  }

  function breakdownSection(title, entries) {
    return `
      <div class="section-title">${title}</div>
      ${entries.map(([label, data]) => `
        <div class="breakdown-row">
          <span class="bl">${esc(label)}</span>
          <span class="bc">${data.count} cards</span>
          <span class="bv">$${data.value.toFixed(2)}</span>
        </div>
      `).join('')}
    `;
  }

  function refresh() {
    const cards = DB.getAll().map(c => ({
      ...c,
      estimatedValue: Pricing.lookupCardValue(c),
    }));
    DB.save(cards);
    render();
  }

  return { render, refresh };
})();
