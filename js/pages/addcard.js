const AddCardPage = (() => {
  let frontImg = null;
  let backImg = null;

  function render(editId) {
    const existing = editId ? DB.get(editId) : null;
    frontImg = existing?.frontImage || null;
    backImg = existing?.backImage || null;

    const main = document.getElementById('main');
    main.innerHTML = `
      <h2 class="section-title">Card Images</h2>
      <div class="image-row">
        <div class="image-col">
          <span class="label">Front</span>
          <div id="front-preview">${imgPreview(frontImg)}</div>
          <div class="img-btn-row">
            <label class="img-btn" title="Camera">📷<input type="file" accept="image/*" capture="environment" id="front-camera" hidden></label>
            <label class="img-btn" title="Gallery">🖼️<input type="file" accept="image/*" id="front-gallery" hidden></label>
          </div>
        </div>
        <div class="image-col">
          <span class="label">Back</span>
          <div id="back-preview">${imgPreview(backImg)}</div>
          <div class="img-btn-row">
            <label class="img-btn" title="Camera">📷<input type="file" accept="image/*" capture="environment" id="back-camera" hidden></label>
            <label class="img-btn" title="Gallery">🖼️<input type="file" accept="image/*" id="back-gallery" hidden></label>
          </div>
        </div>
      </div>

      <h2 class="section-title">Card Details</h2>
      <div id="scan-status" class="scan-status hidden"></div>
      <label class="form-label">Sport *</label>
      <div class="chip-row mb-8" id="sport-chips">
        ${Pricing.SPORTS.map(s => `<span class="chip${(existing?.sport || 'Basketball') === s ? ' active' : ''}" data-val="${s}">${s}</span>`).join('')}
      </div>

      <label class="form-label">Player Name *</label>
      <input class="input" id="f-player" value="${esc(existing?.playerName || '')}" placeholder="e.g. LeBron James">

      <label class="form-label">Team</label>
      <input class="input" id="f-team" value="${esc(existing?.team || '')}" placeholder="e.g. Los Angeles Lakers">

      <label class="form-label">Year</label>
      <input class="input" id="f-year" type="number" value="${existing?.year || ''}" placeholder="e.g. 2023">

      <label class="form-label">Card Number</label>
      <input class="input" id="f-cardnum" value="${esc(existing?.cardNumber || '')}" placeholder="e.g. #101">

      <label class="form-label">Brand</label>
      <div class="chip-row mb-8" id="brand-chips">
        ${Pricing.BRANDS.map(b => `<span class="chip${existing?.brand === b ? ' active' : ''}" data-val="${b}">${b}</span>`).join('')}
        <span class="chip${existing?.brand && !Pricing.BRANDS.includes(existing.brand) ? ' active' : ''}" data-val="__custom__">Other...</span>
      </div>
      <div id="custom-brand-section" style="display:${existing?.brand && !Pricing.BRANDS.includes(existing.brand) ? 'block' : 'none'}">
        <input class="input" id="f-custom-brand" value="${esc(existing?.brand && !Pricing.BRANDS.includes(existing.brand) ? existing.brand : '')}" placeholder="Enter brand name">
      </div>

      <label class="form-label">Card Type</label>
      <div class="chip-row mb-8" id="type-chips">
        ${Pricing.CARD_TYPES.map(t => `<span class="chip${(existing?.cardType || 'Base') === t ? ' active' : ''}" data-val="${t}">${t}</span>`).join('')}
      </div>

      <label class="form-label">Condition</label>
      <div class="chip-row mb-8" id="cond-chips">
        ${Pricing.CONDITIONS.map(c => `<span class="chip${(existing?.condition || 'Near Mint (7)') === c ? ' active' : ''}" data-val="${c}">${c}</span>`).join('')}
      </div>

      <div class="toggle-row">
        <label class="form-label" style="margin:0">Numbered / Serial Card?</label>
        <button class="toggle-btn${existing?.isNumbered ? ' on' : ''}" id="f-numbered">${existing?.isNumbered ? 'YES' : 'NO'}</button>
      </div>
      <div id="serial-section" style="display:${existing?.isNumbered ? 'block' : 'none'}">
        <label class="form-label">Serial # (e.g. 25/99)</label>
        <input class="input" id="f-serial" value="${esc(existing?.serialNumber || '')}" placeholder="25/99">
      </div>

      <label class="form-label">Notes</label>
      <textarea class="input" id="f-notes" placeholder="Any additional notes...">${esc(existing?.notes || '')}</textarea>

      <button class="btn btn-primary mt-16" id="save-btn">${editId ? 'Update Card' : 'Save Card'}</button>
    `;

    // Wire up chip selectors
    wireChips('sport-chips');
    wireChips('brand-chips', () => {
      const active = getActiveChip('brand-chips');
      document.getElementById('custom-brand-section').style.display = active === '__custom__' ? 'block' : 'none';
    });
    wireChips('type-chips');
    wireChips('cond-chips');

    // Numbered toggle
    document.getElementById('f-numbered').addEventListener('click', function() {
      const on = this.classList.toggle('on');
      this.textContent = on ? 'YES' : 'NO';
      document.getElementById('serial-section').style.display = on ? 'block' : 'none';
    });

    // Image inputs
    wireImage('front-camera', 'front');
    wireImage('front-gallery', 'front');
    wireImage('back-camera', 'back');
    wireImage('back-gallery', 'back');

    // Save
    document.getElementById('save-btn').addEventListener('click', () => save(editId, existing));
  }

  function imgPreview(src) {
    return src
      ? `<img src="${src}" class="img-preview" alt="Card image">`
      : `<div class="img-placeholder">No Image</div>`;
  }

  function wireChips(containerId, onChange) {
    const container = document.getElementById(containerId);
    container.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      container.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      if (onChange) onChange();
    });
  }

  function wireImage(inputId, side) {
    document.getElementById(inputId)?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target.result;
        if (side === 'front') { frontImg = dataUrl; }
        else { backImg = dataUrl; }
        document.getElementById(`${side}-preview`).innerHTML = imgPreview(dataUrl);

        // Auto-scan front image with OCR
        if (side === 'front') {
          scanFrontImage(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  async function scanFrontImage(dataUrl) {
    const status = document.getElementById('scan-status');
    status.classList.remove('hidden');
    status.className = 'scan-status scanning';
    status.textContent = '🔍 Scanning card image for details...';

    try {
      const result = await OCR.scanCard(dataUrl);
      applyOCRResults(result);
      const found = [result.playerName, result.team, result.brand, result.year, result.cardNumber].filter(Boolean);
      if (found.length > 0) {
        status.className = 'scan-status success';
        status.textContent = '✅ Found: ' + found.join(', ') + ' — review and adjust below';
      } else {
        status.className = 'scan-status warn';
        status.textContent = '⚠️ Could not read card details. Fill in manually below.';
      }
    } catch (err) {
      status.className = 'scan-status warn';
      status.textContent = '⚠️ Scan failed — fill in details manually.';
    }
  }

  function applyOCRResults(result) {
    // Only fill empty fields — don't overwrite what the user already typed
    const player = document.getElementById('f-player');
    if (!player.value && result.playerName) player.value = result.playerName;

    const team = document.getElementById('f-team');
    if (!team.value && result.team) team.value = result.team;

    const year = document.getElementById('f-year');
    if (!year.value && result.year) year.value = result.year;

    const cardNum = document.getElementById('f-cardnum');
    if (!cardNum.value && result.cardNumber) cardNum.value = result.cardNumber;

    // Select brand chip if detected and none is currently selected
    if (result.brand && !getActiveChip('brand-chips')) {
      const container = document.getElementById('brand-chips');
      const match = container.querySelector(`.chip[data-val="${result.brand}"]`);
      if (match) {
        container.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        match.classList.add('active');
      }
    }
  }

  function getActiveChip(containerId) {
    const el = document.querySelector(`#${containerId} .chip.active`);
    return el ? el.dataset.val : '';
  }

  function save(editId, existing) {
    const playerName = document.getElementById('f-player').value.trim();
    if (!playerName) { alert('Player name is required.'); return; }

    const card = {
      id: editId || DB.generateId(),
      playerName,
      sport: getActiveChip('sport-chips') || 'Basketball',
      team: document.getElementById('f-team').value.trim(),
      brand: getActiveChip('brand-chips') === '__custom__'
        ? (document.getElementById('f-custom-brand').value.trim() || 'Unknown')
        : getActiveChip('brand-chips'),
      year: parseInt(document.getElementById('f-year').value) || new Date().getFullYear(),
      cardNumber: document.getElementById('f-cardnum').value.trim(),
      cardType: getActiveChip('type-chips') || 'Base',
      condition: getActiveChip('cond-chips') || 'Near Mint (7)',
      isNumbered: document.getElementById('f-numbered').classList.contains('on'),
      serialNumber: document.getElementById('f-serial')?.value.trim() || '',
      notes: document.getElementById('f-notes').value.trim(),
      frontImage: frontImg,
      backImage: backImg,
      dateAdded: existing?.dateAdded || new Date().toISOString(),
    };
    card.estimatedValue = Pricing.lookupCardValue(card);

    if (editId) {
      DB.update(editId, card);
    } else {
      DB.add(card);
    }
    Router.back();
  }

  return { render };
})();
