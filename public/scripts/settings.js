/**
 * settings.js
 * Manages the settings dialog: open/close, focus trap, drag-to-reorder,
 * keyboard move buttons, add custom feed, remove feed, reset to defaults.
 */

import { getPrefs, setPref, resetPrefs, KEYS } from './preferences.js';

// ── Dialog open / close ───────────────────────────────────────────────────────

const dialog    = document.getElementById('settings-dialog');
const trigger   = document.getElementById('settings-btn');
const closeBtn  = dialog?.querySelector('[data-settings-close]');
const backdrop  = dialog?.querySelector('[data-settings-backdrop]');

function openDialog() {
  if (!dialog) return;
  dialog.setAttribute('aria-hidden', 'false');
  trigger?.setAttribute('aria-expanded', 'true');
  // Trap focus — move to close button
  closeBtn?.focus();
  document.addEventListener('keydown', handleDialogKey);
}

function closeDialog() {
  if (!dialog) return;
  dialog.setAttribute('aria-hidden', 'true');
  trigger?.setAttribute('aria-expanded', 'false');
  trigger?.focus();
  document.removeEventListener('keydown', handleDialogKey);
}

function handleDialogKey(e) {
  if (e.key === 'Escape') {
    e.preventDefault();
    closeDialog();
    return;
  }
  // Focus trap inside dialog panel
  if (e.key === 'Tab') {
    const panel   = dialog.querySelector('.settings-dialog__panel');
    const focusable = [...panel.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), a[href], [tabindex="0"]'
    )].filter((el) => !el.closest('[hidden]'));

    if (focusable.length === 0) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

trigger?.addEventListener('click', () => {
  const isOpen = dialog?.getAttribute('aria-hidden') === 'false';
  isOpen ? closeDialog() : openDialog();
});

closeBtn?.addEventListener('click', closeDialog);
backdrop?.addEventListener('click', closeDialog);

// ── Save feed order after any reorder operation ───────────────────────────────

function saveFeedOrder() {
  const list = document.getElementById('feed-reorder-list');
  if (!list) return;
  const ids = [...list.querySelectorAll('[data-feed-id]')]
    .map((el) => el.dataset.feedId);
  setPref(KEYS.feedOrder, ids);

  // Reorder the grid to match
  const grid = document.querySelector('.feed-grid');
  if (grid) {
    ids.forEach((id) => {
      const card = grid.querySelector(`[data-feed-id="${id}"]`);
      if (card) grid.appendChild(card);
    });
  }
}

// ── Drag to reorder ──────────────────────────────────────────────────────────

let dragSrc = null;

function setupDragReorder() {
  const list = document.getElementById('feed-reorder-list');
  if (!list) return;

  list.addEventListener('dragstart', (e) => {
    const item = e.target.closest('.feed-reorder-item');
    if (!item || item.dataset.pinned === 'true') {
      e.preventDefault();
      return;
    }
    dragSrc = item;
    item.classList.add('dragging');
    item.setAttribute('aria-grabbed', 'true');
    e.dataTransfer.effectAllowed = 'move';
  });

  list.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const item = e.target.closest('.feed-reorder-item');
    if (!item || item === dragSrc || item.dataset.pinned === 'true') return;

    const rect   = item.getBoundingClientRect();
    const midY   = rect.top + rect.height / 2;
    const after  = e.clientY > midY;

    list.querySelectorAll('.drag-over-top, .drag-over-bottom').forEach((el) => {
      el.classList.remove('drag-over-top', 'drag-over-bottom');
    });
    item.classList.add(after ? 'drag-over-bottom' : 'drag-over-top');
  });

  list.addEventListener('drop', (e) => {
    e.preventDefault();
    const target = e.target.closest('.feed-reorder-item');
    if (!target || target === dragSrc || target.dataset.pinned === 'true') return;

    const rect  = target.getBoundingClientRect();
    const after = e.clientY > (rect.top + rect.height / 2);

    if (after) {
      target.after(dragSrc);
    } else {
      target.before(dragSrc);
    }
    saveFeedOrder();
  });

  list.addEventListener('dragend', () => {
    list.querySelectorAll('.drag-over-top, .drag-over-bottom').forEach((el) => {
      el.classList.remove('drag-over-top', 'drag-over-bottom');
    });
    if (dragSrc) {
      dragSrc.classList.remove('dragging');
      dragSrc.setAttribute('aria-grabbed', 'false');
      dragSrc = null;
    }
  });
}

// ── Keyboard move buttons (accessibility alternative to drag) ─────────────────

function setupMoveButtons() {
  const list = document.getElementById('feed-reorder-list');
  if (!list) return;

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-move]');
    if (!btn) return;

    const item = btn.closest('.feed-reorder-item');
    if (!item) return;

    const direction = btn.dataset.move;
    const pinned    = list.querySelector('[data-pinned="true"]');

    if (direction === 'up') {
      const prev = item.previousElementSibling;
      // Cannot move above the pinned feed
      if (prev && prev !== pinned) {
        prev.before(item);
        btn.focus();
      }
    } else {
      const next = item.nextElementSibling;
      if (next) {
        next.after(item);
        btn.focus();
      }
    }
    saveFeedOrder();
  });
}

// ── Remove feed ───────────────────────────────────────────────────────────────

function setupRemoveFeed() {
  const list = document.getElementById('feed-reorder-list');
  if (!list) return;

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-remove-feed]');
    if (!btn) return;

    const feedId = btn.dataset.removeFeed;
    const item   = btn.closest('.feed-reorder-item');

    // Remove from reorder list
    item?.remove();

    // Hide the feed card in the grid
    const card = document.querySelector(`.feed-grid [data-feed-id="${feedId}"]`);
    if (card) card.hidden = true;

    // Persist to hiddenFeeds
    const prefs = getPrefs();
    if (!prefs.hiddenFeeds.includes(feedId)) {
      prefs.hiddenFeeds.push(feedId);
      setPref(KEYS.hiddenFeeds, prefs.hiddenFeeds);
    }

    saveFeedOrder();
    showToast(`Feed removed`, 'success');
  });
}

// ── Add custom feed ───────────────────────────────────────────────────────────

function setupAddFeed() {
  const addBtn  = document.getElementById('add-feed-btn');
  const nameIn  = document.getElementById('custom-feed-name');
  const urlIn   = document.getElementById('custom-feed-url');
  const nameErr = document.getElementById('custom-feed-name-error');
  const urlErr  = document.getElementById('custom-feed-url-error');

  if (!addBtn || !nameIn || !urlIn) return;

  function setError(el, errEl, msg) {
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    errEl.textContent = msg;
    errEl.setAttribute('aria-hidden', msg ? 'false' : 'true');
  }

  addBtn.addEventListener('click', async () => {
    const name = nameIn.value.trim();
    const url  = urlIn.value.trim();
    let valid  = true;

    setError(nameIn, nameErr, '');
    setError(urlIn,  urlErr,  '');

    if (!name) {
      setError(nameIn, nameErr, 'Display name is required.');
      valid = false;
    }
    if (!url) {
      setError(urlIn, urlErr, 'Feed URL is required.');
      valid = false;
    } else {
      try { new URL(url); } catch {
        setError(urlIn, urlErr, 'Enter a valid URL including https://');
        valid = false;
      }
    }
    if (!valid) return;

    addBtn.disabled = true;
    addBtn.textContent = 'Adding…';

    try {
      const res  = await fetch(`/api/validate-feed?url=${encodeURIComponent(url)}`);
      const json = await res.json();

      if (!res.ok || json.error) {
        setError(urlIn, urlErr, json.error ?? 'Could not load feed. Check the URL and try again.');
        return;
      }

      // Save custom feed
      const prefs      = getPrefs();
      const customId   = `custom-${Date.now()}`;
      const customFeed = { id: customId, name, url, homeUrl: new URL(url).origin };
      prefs.customFeeds.push(customFeed);
      setPref(KEYS.customFeeds, prefs.customFeeds);

      // Add to reorder list
      addFeedToReorderList(customFeed);

      nameIn.value = '';
      urlIn.value  = '';
      showToast(`${name} added`, 'success');
    } catch (err) {
      setError(urlIn, urlErr, 'Network error. Please try again.');
    } finally {
      addBtn.disabled    = false;
      addBtn.textContent = 'Add feed';
    }
  });
}

function addFeedToReorderList(feed) {
  const list = document.getElementById('feed-reorder-list');
  if (!list) return;

  const li = document.createElement('li');
  li.className         = 'feed-reorder-item';
  li.dataset.feedId    = feed.id;
  li.dataset.pinned    = 'false';
  li.setAttribute('draggable', 'true');
  li.setAttribute('role', 'option');
  li.setAttribute('aria-selected', 'false');
  li.setAttribute('aria-grabbed', 'false');
  li.setAttribute('aria-label', feed.name);
  li.innerHTML = `
    <span class="feed-reorder-item__drag-handle" aria-hidden="true">
      <svg focusable="false" style="width:14px;height:14px;fill:currentColor">
        <use href="#icon-drag"></use>
      </svg>
    </span>
    <span class="feed-reorder-item__name">${feed.name}</span>
    <div class="feed-reorder-item__move-btns" aria-label="Move ${feed.name}">
      <button class="btn" aria-label="Move ${feed.name} up" data-move="up" data-feed-id="${feed.id}">▲</button>
      <button class="btn" aria-label="Move ${feed.name} down" data-move="down" data-feed-id="${feed.id}">▼</button>
    </div>
    <button class="btn feed-reorder-item__remove" aria-label="Remove ${feed.name} from feed list" data-remove-feed="${feed.id}">
      <svg aria-hidden="true" focusable="false" style="width:14px;height:14px;fill:currentColor">
        <use href="#icon-remove"></use>
      </svg>
    </button>
  `;
  list.appendChild(li);
}

// ── Reset to defaults ─────────────────────────────────────────────────────────

function setupReset() {
  const resetBtn = document.getElementById('reset-feeds-btn');
  if (!resetBtn) return;

  resetBtn.addEventListener('click', () => {
    if (!confirm('Reset all feeds and preferences to defaults? This cannot be undone.')) return;
    resetPrefs();
    closeDialog();
    showToast('Reset to defaults — reloading…', 'success');
    setTimeout(() => window.location.reload(), 800);
  });
}

// ── Toast helper ──────────────────────────────────────────────────────────────

export function showToast(message, type = 'success') {
  const region = document.getElementById('toast-region');
  if (!region) return;

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  region.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 300ms ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ── Init ──────────────────────────────────────────────────────────────────────

setupDragReorder();
setupMoveButtons();
setupRemoveFeed();
setupAddFeed();
setupReset();
