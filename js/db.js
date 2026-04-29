/**
 * Simple localStorage-based database for card storage.
 * Handles quota errors gracefully.
 */
const DB = {
  _key: 'cardvault_cards',

  getAll() {
    try {
      return JSON.parse(localStorage.getItem(this._key)) || [];
    } catch { return []; }
  },

  save(cards) {
    try {
      localStorage.setItem(this._key, JSON.stringify(cards));
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        alert('Storage is full. Try removing some cards or using lower quality images. Your card was NOT saved.');
      } else {
        alert('Failed to save: ' + e.message);
      }
      return false;
    }
  },

  add(card) {
    const cards = this.getAll();
    cards.push(card);
    if (!this.save(cards)) {
      cards.pop(); // rollback
      return null;
    }
    return cards;
  },

  update(id, updates) {
    const original = this.getAll();
    const cards = original.map(c => c.id === id ? { ...c, ...updates } : c);
    if (!this.save(cards)) return null;
    return cards;
  },

  remove(id) {
    const cards = this.getAll().filter(c => c.id !== id);
    this.save(cards);
    return cards;
  },

  get(id) {
    return this.getAll().find(c => c.id === id) || null;
  },

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
  },

  /** Returns approximate storage usage in KB */
  getUsageKB() {
    try {
      const data = localStorage.getItem(this._key) || '';
      return Math.round(data.length / 1024);
    } catch { return 0; }
  }
};
