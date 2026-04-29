/**
 * Mock pricing engine for basketball trading cards.
 * Replace lookupCardValue() internals with a real API call
 * (eBay Browse API, PSA, SportsCardsPro, PriceCharting) for live data.
 */
const Pricing = (() => {
  const BASE = {
    rookie: 25, insert: 15, base: 3, parallel: 20,
    autograph: 75, memorabilia: 40, default: 5,
  };

  const BRAND_MULT = {
    'Panini Prizm': 2.5, 'Topps Chrome': 2.0, 'Upper Deck': 1.8,
    'Panini Select': 2.2, 'Panini Mosaic': 1.6, 'Panini Donruss': 1.2,
    'Panini Hoops': 1.0, 'Panini Contenders': 1.5,
    'Panini National Treasures': 4.0, 'Panini Flawless': 5.0, 'Bowman': 1.3,
  };

  const PLAYER_MULT = {
    'LeBron James': 8, 'Michael Jordan': 15, 'Kobe Bryant': 10,
    'Stephen Curry': 6, 'Luka Doncic': 7, 'Giannis Antetokounmpo': 5,
    'Kevin Durant': 5, 'Jayson Tatum': 4, 'Anthony Edwards': 5,
    'Victor Wembanyama': 9, 'Ja Morant': 4, 'Zion Williamson': 4,
  };

  const COND_MULT = {
    'Gem Mint (10)': 3.0, 'Mint (9)': 2.0, 'NM-MT (8)': 1.5,
    'Near Mint (7)': 1.2, 'EX-MT (6)': 1.0, 'Excellent (5)': 0.7,
    'VG-EX (4)': 0.5, 'Good (3)': 0.3, 'Poor': 0.1,
  };

  const BRANDS = Object.keys(BRAND_MULT);
  const CONDITIONS = Object.keys(COND_MULT);
  const CARD_TYPES = ['Base', 'Rookie', 'Insert', 'Parallel', 'Autograph', 'Memorabilia'];
  const SPORTS = ['Basketball', 'Baseball', 'Football'];

  function lookupCardValue(card) {
    const type = (card.cardType || 'default').toLowerCase();
    const base = BASE[type] || BASE.default;
    const bm = BRAND_MULT[card.brand] || 1.0;
    const pm = PLAYER_MULT[card.playerName] || 1.0;
    const cm = COND_MULT[card.condition] || 1.0;
    const yf = card.year ? Math.max(0.5, 1 + (2024 - card.year) * 0.02) : 1.0;
    const nb = card.isNumbered ? 1.5 : 1.0;
    return Math.round(base * bm * pm * cm * yf * nb * 100) / 100;
  }

  return { lookupCardValue, BRANDS, CONDITIONS, CARD_TYPES, SPORTS };
})();
