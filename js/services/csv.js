/**
 * CSV import/export for card collection.
 */
const CSV = (() => {
  const HEADERS = [
    'sport','playerName','team','brand','year','cardNumber','cardType',
    'condition','isNumbered','serialNumber','notes'
  ];

  function exportCards(cards) {
    const rows = [HEADERS.join(',')];
    cards.forEach(c => {
      rows.push(HEADERS.map(h => {
        let v = c[h] ?? '';
        if (typeof v === 'boolean') v = v ? 'true' : 'false';
        v = String(v);
        if (v.includes(',') || v.includes('"') || v.includes('\n')) {
          v = '"' + v.replace(/"/g, '""') + '"';
        }
        return v;
      }).join(','));
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cardvault_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return [];
    const headers = parseLine(lines[0]);
    const cards = [];
    for (let i = 1; i < lines.length; i++) {
      const vals = parseLine(lines[i]);
      const card = {};
      headers.forEach((h, idx) => {
        card[h.trim()] = (vals[idx] || '').trim();
      });
      card.id = DB.generateId();
      card.year = parseInt(card.year) || new Date().getFullYear();
      card.isNumbered = card.isNumbered === 'true';
      card.dateAdded = new Date().toISOString();
      card.estimatedValue = Pricing.lookupCardValue(card);
      cards.push(card);
    }
    return cards;
  }

  function parseLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
        else if (ch === '"') { inQuotes = false; }
        else { current += ch; }
      } else {
        if (ch === '"') { inQuotes = true; }
        else if (ch === ',') { result.push(current); current = ''; }
        else { current += ch; }
      }
    }
    result.push(current);
    return result;
  }

  function importCards(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const cards = parseCSV(e.target.result);
          resolve(cards);
        } catch (err) { reject(err); }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  return { exportCards, importCards };
})();
