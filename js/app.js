// Register service worker for offline support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

// Tab bar navigation
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => Router.go(tab.dataset.page));
});

// Back button
document.getElementById('back-btn').addEventListener('click', () => Router.back());

// Boot
Router.init();
