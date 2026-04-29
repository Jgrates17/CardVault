const Router = (() => {
  const history = [];
  const titles = {
    collection: 'My Collection',
    addcard: 'Add Card',
    editcard: 'Edit Card',
    detail: 'Card Details',
    portfolio: 'Portfolio Value',
    search: 'Search & Filter',
  };
  const tabPages = ['collection', 'portfolio', 'search'];

  function go(page, param) {
    history.push({ page, param });
    renderPage(page, param);
  }

  function back() {
    history.pop();
    const prev = history[history.length - 1] || { page: 'collection' };
    renderPage(prev.page, prev.param);
  }

  function renderPage(page, param) {
    document.getElementById('page-title').textContent = titles[page] || 'CardVault';

    const backBtn = document.getElementById('back-btn');
    const brand = document.getElementById('brand');
    const isSubPage = !tabPages.includes(page);
    if (isSubPage) {
      backBtn.classList.remove('hidden');
      brand.classList.add('hidden');
    } else {
      backBtn.classList.add('hidden');
      brand.classList.remove('hidden');
    }
    document.getElementById('tab-bar').style.display = isSubPage ? 'none' : 'flex';

    // Update active tab
    document.querySelectorAll('.tab').forEach(t => {
      t.classList.toggle('active', t.dataset.page === page || (isSubPage && t.dataset.page === 'collection'));
    });

    // Scroll to top
    document.getElementById('main').scrollTop = 0;

    switch (page) {
      case 'collection': CollectionPage.render(); break;
      case 'addcard': AddCardPage.render(); break;
      case 'editcard': AddCardPage.render(param); break;
      case 'detail': DetailPage.render(param); break;
      case 'portfolio': PortfolioPage.render(); break;
      case 'search': SearchPage.render(); break;
      default: CollectionPage.render();
    }
  }

  function init() {
    history.push({ page: 'collection' });
    renderPage('collection');
  }

  return { go, back, init };
})();
