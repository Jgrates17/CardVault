const CollectionPage = (() => {
  function render() {
    const cards = DB.getAll();
    const main = document.getElementById('main');

    let html = `
      <input type="text" class="input mb-8" id="col-filter" placeholder="Filter by player, brand, or team...">
      <button class="btn btn-primary mb-12" onclick="Router.go('addcard')">+ Add Card</button>
    `;

    if (cards.length === 0) {
      html += `<div class="empty">No cards yet. Tap + Add Card to start!<br><br>Or import from CSV below.</div>`;
    } else {
      html += `<div id="col-list"></div>`;
    }

    html += `
      <div class="csv-section">
        <p>Import cards from CSV</p>
        <label class="file-input-label">
          Choose CSV File
          <input type="file" accept=".csv" id="csv-import">
        </label>
        ${cards.length > 0 ? `<button class="btn btn-sm btn-secondary mt-16" onclick="CollectionPage.exportCSV()">Export CSV</button>` : ''}
      </div>
    `;

    main.innerHTML = html;
    renderList(cards);

    document.getElementById('col-filter')?.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const filtered = cards.filter(c =>
        (c.playerName || '').toLowerCase().includes(q) ||
        (c.brand || '').toLowerCase().includes(q) ||
        (c.team || '').toLowerCase().includes(q) ||
        (c.sport || '').toLowerCase().includes(q)
      );
      renderList(filtered);
    });

    document.getElementById('csv-import')?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const imported = await CSV.importCards(file);
        let all = DB.getAll();
        all = all.concat(imported);
        DB.save(all);
        Router.go('collection');
      } catch (err) {
        alert('Failed to import CSV: ' + err.message);
      }
    });
  }

  function renderList(cards) {
    const list = document.getElementById('col-list');
    if (!list) return;
    if (cards.length === 0) {
      list.innerHTML = `<div class="empty">No cards match your filter.</div>`;
      return;
    }
    list.innerHTML = cards.map(c => `
      <div class="card-item" onclick="Router.go('detail', '${c.id}')">
        ${c.frontImage
          ? `<img src="${c.frontImage}" class="card-thumb" alt="${c.playerName} front">`
          : `<div class="card-thumb-placeholder">🃏</div>`}
        <div class="card-info">
          <div class="name">${esc(c.playerName)}</div>
          <div class="meta">${esc(c.sport || 'Basketball')} · ${esc(c.brand || '')} · ${c.year || ''}</div>
          <div class="meta">${esc(c.team || '')}</div>
        </div>
        <div class="card-value">$${(c.estimatedValue || 0).toFixed(2)}</div>
      </div>
    `).join('');
  }

  function exportCSV() {
    CSV.exportCards(DB.getAll());
  }

  return { render, exportCSV };
})();

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
