# CardVault — Basketball Trading Card Inventory (PWA)

A Progressive Web App for managing your basketball card collection. Works on iPhone (Add to Home Screen), Android, Windows, and any modern browser. No app store, no developer account, no build tools needed.

## Features

- Add cards with front/back photos (camera or gallery)
- Log player, team, brand, year, card number, type, condition, serial numbers, notes
- Automatic estimated value based on card attributes
- Portfolio dashboard with total value, highest/lowest/average/median, breakdowns by brand/team/type
- Search and filter with multiple sort options
- CSV import and export
- Offline support via service worker
- Installable as a home screen app on iPhone and Android

## How to Use Locally

Just open `index.html` in your browser. Everything runs client-side with localStorage.

## Deploy to GitHub Pages (Free Hosting)

1. Create a GitHub repo (e.g. `cardvault`)
2. Push the `CardVault` folder contents to the repo
3. Go to Settings > Pages > set source to `main` branch, root folder
4. Your app will be live at `https://yourusername.github.io/cardvault/`

## Install on iPhone

1. Open the GitHub Pages URL in Safari
2. Tap the Share button > "Add to Home Screen"
3. It now looks and works like a native app, including offline

## CSV Import Format

The CSV should have these headers:
```
playerName,team,brand,year,cardNumber,cardType,condition,isNumbered,serialNumber,notes
```

## Swapping in Real Pricing

Edit `js/services/pricing.js` and replace the `lookupCardValue()` logic with a real API call (eBay Browse API, PSA, SportsCardsPro, PriceCharting).
