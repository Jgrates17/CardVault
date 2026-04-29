const CollectionPage = (() => {
  function render() {
    const cards = DB.getAll();
    const main = document.getElementById('main');

    let html = `
      <input type="text" class="input mb-8" id="col-filter" placeholder="Filter by player, brand, or team...">
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <button class="btn btn-primary" style="flex:1" onclick="Router.go('addcard')">+ Add Card</button>
        ${cards.length > 0 ? `<button class="btn btn-secondary" style="flex:1" onclick="CollectionPage.showExport()">📤 Export</button>` : ''}
      </div>
    `;

    if (cards.length === 0) {
      html += `<div class="empty">No cards yet. Tap + Add Card to start!<br><br>Or import from CSV below.</div>`;
    } else {
      const usageKB = DB.getUsageKB();
      const usageMB = (usageKB / 1024).toFixed(1);
      const pct = Math.min(100, Math.round((usageKB / 5120) * 100));
      html += `
        <div class="storage-bar mb-8">
          <div class="storage-fill" style="width:${pct}%"></div>
          <span class="storage-text">${usageMB} MB / 5 MB used</span>
        </div>
      `;
      html += `<div id="col-list"></div>`;
    }

    html += `
      <div class="csv-section">
        <p>Import collection</p>
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
          <label class="file-input-label">
            CSV File
            <input type="file" accept=".csv" id="csv-import">
          </label>
          <label class="file-input-label">
            JSON Backup
            <input type="file" accept=".json" id="json-import">
          </label>
        </div>
      </div>
      <div id="export-modal" class="modal hidden">
        <div class="modal-content">
          <h3 style="margin-bottom:12px;color:var(--accent)">Export Collection</h3>
          <p style="color:var(--muted);font-size:13px;margin-bottom:16px">CSV exports card data only. JSON includes images and all fields (full backup).</p>
          <button class="btn btn-primary mb-8" onclick="CollectionPage.exportCSV()">Export as CSV</button>
          <button class="btn btn-secondary mb-8" style="width:100%" onclick="CollectionPage.exportJSON()">Export as JSON (full backup)</button>
          <button class="btn btn-sm" style="width:100%;background:transparent;color:var(--muted)" onclick="CollectionPage.hideExport()">Cancel</button>
        </div>
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

    document.getElementById('json-import')?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const imported = await CSV.importJSON(file);
        let all = DB.getAll();
        all = all.concat(imported);
        DB.save(all);
        Router.go('collection');
      } catch (err) {
        alert('Failed to import JSON: ' + err.message);
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
    hideExport();
  }

  function exportJSON() {
    CSV.exportJSON(DB.getAll());
    hideExport();
  }

  function showExport() {
    document.getElementById('export-modal')?.classList.remove('hidden');
  }

  function hideExport() {
    document.getElementById('export-modal')?.classList.add('hidden');
  }

  return { render, exportCSV, exportJSON, showExport, hideExport };
})();

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
