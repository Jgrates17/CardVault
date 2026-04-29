const DetailPage = (() => {
  function render(cardId) {
    const card = DB.get(cardId);
    const main = document.getElementById('main');

    if (!card) {
      main.innerHTML = `<div class="empty">Card not found.</div>`;
      return;
    }

    const rows = [
      ['Sport', card.sport],
      ['Team', card.team],
      ['Brand', card.brand],
      ['Year', card.year],
      ['Card #', card.cardNumber],
      ['Type', card.cardType],
      ['Condition', card.condition],
      ['Numbered', card.isNumbered ? `Yes — ${card.serialNumber || 'N/A'}` : 'No'],
      ['Added', card.dateAdded ? new Date(card.dateAdded).toLocaleDateString() : ''],
      ['Notes', card.notes],
    ].filter(r => r[1]);

    main.innerHTML = `
      <div class="detail-images">
        ${card.frontImage
          ? `<img src="${card.frontImage}" class="detail-img" alt="Front">`
          : `<div class="detail-img-empty">🃏</div>`}
        ${card.backImage
          ? `<img src="${card.backImage}" class="detail-img" alt="Back">`
          : `<div class="detail-img-empty">No Back</div>`}
      </div>
      <div class="detail-name">${esc(card.playerName)}</div>
      <div class="detail-value">$${(card.estimatedValue || 0).toFixed(2)} est. value</div>
      <div class="detail-table">
        ${rows.map(([l, v]) => `
          <div class="detail-row">
            <span class="label">${l}</span>
            <span class="value">${esc(String(v))}</span>
          </div>
        `).join('')}
      </div>
      <div class="btn-row">
        <button class="btn btn-secondary" onclick="Router.go('editcard', '${card.id}')">Edit</button>
        <button class="btn btn-danger" id="delete-btn">Delete</button>
      </div>
    `;

    document.getElementById('delete-btn').addEventListener('click', () => {
      if (confirm(`Remove ${card.playerName} from your collection?`)) {
        DB.remove(card.id);
        Router.back();
      }
    });
  }

  return { render };
})();
