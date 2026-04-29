/**
 * OCR service using Tesseract.js to read text from card images.
 * Runs entirely in the browser — no server needed.
 * Tesseract.js is loaded from CDN on first use.
 */
const OCR = (() => {
  let worker = null;
  let loading = false;

  async function ensureWorker() {
    if (worker) return worker;
    if (loading) {
      // Wait for in-progress load
      while (loading) await new Promise(r => setTimeout(r, 200));
      return worker;
    }
    loading = true;

    // Load Tesseract.js from CDN
    if (!window.Tesseract) {
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }

    worker = await Tesseract.createWorker('eng');
    loading = false;
    return worker;
  }

  // Known brand keywords to match against OCR text
  const BRAND_KEYWORDS = {
    'Panini Prizm': ['prizm'],
    'Topps Chrome': ['topps chrome', 'chrome'],
    'Upper Deck': ['upper deck'],
    'Panini Select': ['select'],
    'Panini Mosaic': ['mosaic'],
    'Panini Donruss': ['donruss'],
    'Panini Hoops': ['hoops'],
    'Panini Contenders': ['contenders'],
    'Panini National Treasures': ['national treasures'],
    'Panini Flawless': ['flawless'],
    'Bowman': ['bowman'],
    'Panini': ['panini'],
    'Topps': ['topps'],
  };

  // Common NBA teams for matching
  const NBA_TEAMS = [
    'Atlanta Hawks', 'Boston Celtics', 'Brooklyn Nets', 'Charlotte Hornets',
    'Chicago Bulls', 'Cleveland Cavaliers', 'Dallas Mavericks', 'Denver Nuggets',
    'Detroit Pistons', 'Golden State Warriors', 'Houston Rockets', 'Indiana Pacers',
    'LA Clippers', 'Los Angeles Clippers', 'Los Angeles Lakers', 'LA Lakers',
    'Memphis Grizzlies', 'Miami Heat', 'Milwaukee Bucks', 'Minnesota Timberwolves',
    'New Orleans Pelicans', 'New York Knicks', 'Oklahoma City Thunder',
    'Orlando Magic', 'Philadelphia 76ers', 'Phoenix Suns', 'Portland Trail Blazers',
    'Sacramento Kings', 'San Antonio Spurs', 'Toronto Raptors', 'Utah Jazz',
    'Washington Wizards',
  ];

  /**
   * Scan a card image and return best-guess fields.
   * Returns { playerName, team, brand, year, cardNumber }
   */
  async function scanCard(imageDataUrl) {
    const w = await ensureWorker();
    const { data: { text } } = await w.recognize(imageDataUrl);
    return parseCardText(text);
  }

  function parseCardText(raw) {
    const text = raw.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    const lower = text.toLowerCase();
    const result = {};

    // Year: look for 4-digit year between 1980-2030
    const yearMatch = text.match(/\b(19[89]\d|20[0-2]\d|2030)\b/);
    if (yearMatch) result.year = parseInt(yearMatch[1]);

    // Card number: look for #NNN or No. NNN patterns
    const numMatch = text.match(/#\s*(\d{1,4})/i) || text.match(/No\.?\s*(\d{1,4})/i);
    if (numMatch) result.cardNumber = '#' + numMatch[1];

    // Brand: check known keywords (longer matches first)
    const brandEntries = Object.entries(BRAND_KEYWORDS).sort((a, b) => b[1][0].length - a[1][0].length);
    for (const [brand, keywords] of brandEntries) {
      if (keywords.some(kw => lower.includes(kw))) {
        result.brand = brand;
        break;
      }
    }

    // Team: check NBA team names
    for (const team of NBA_TEAMS) {
      if (lower.includes(team.toLowerCase())) {
        result.team = team;
        break;
      }
    }

    // Player name: heuristic — look for two+ capitalized words in sequence
    // that aren't a known brand or team
    const skipWords = new Set([
      ...Object.keys(BRAND_KEYWORDS).join(' ').toLowerCase().split(/\s+/),
      ...NBA_TEAMS.join(' ').toLowerCase().split(/\s+/),
      'basketball', 'trading', 'card', 'cards', 'nba', 'rookie', 'insert',
      'base', 'parallel', 'autograph', 'memorabilia', 'edition', 'series',
    ]);
    const namePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g;
    let match;
    while ((match = namePattern.exec(text)) !== null) {
      const candidate = match[1];
      const words = candidate.toLowerCase().split(/\s+/);
      if (words.length >= 2 && words.length <= 4 && !words.every(w => skipWords.has(w))) {
        result.playerName = candidate;
        break;
      }
    }

    result._rawText = text;
    return result;
  }

  return { scanCard };
})();
