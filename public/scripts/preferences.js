/**
 * preferences.js
 * Reads localStorage on page load and applies stored user preferences.
 * All preference keys are namespaced under '4bj_'.
 */

const KEYS = {
  showFavicons: '4bj_showFavicons',
  largeText:    '4bj_largeText',
  feedOrder:    '4bj_feedOrder',
  hiddenFeeds:  '4bj_hiddenFeeds',
  customFeeds:  '4bj_customFeeds',
};

function getPref(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function setPref(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage unavailable — preferences are session-only
  }
}

export function getPrefs() {
  return {
    showFavicons: getPref(KEYS.showFavicons, true),
    largeText:    getPref(KEYS.largeText, false),
    feedOrder:    getPref(KEYS.feedOrder, null),
    hiddenFeeds:  getPref(KEYS.hiddenFeeds, []),
    customFeeds:  getPref(KEYS.customFeeds, []),
  };
}

export function resetPrefs() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}

export { KEYS };

// ── Apply preferences on load ─────────────────────────────────────────────────

(function applyPreferencesOnLoad() {
  const prefs = getPrefs();

  // Large text
  if (prefs.largeText) {
    document.body.setAttribute('data-size', 'large');
  }

  // Favicons
  if (!prefs.showFavicons) {
    document.querySelectorAll('[data-favicon]').forEach((el) => {
      el.setAttribute('hidden', '');
    });
  }

  // Hidden feeds
  if (prefs.hiddenFeeds.length > 0) {
    prefs.hiddenFeeds.forEach((id) => {
      const card = document.querySelector(`[data-feed-id="${id}"]`);
      if (card) card.hidden = true;
    });
  }

  // Feed order — reorder the grid children to match stored order
  if (prefs.feedOrder && prefs.feedOrder.length > 0) {
    const grid = document.querySelector('.feed-grid');
    if (grid) {
      const cards = [...grid.querySelectorAll('[data-feed-id]')];
      const ordered = [];
      prefs.feedOrder.forEach((id) => {
        const card = cards.find((c) => c.dataset.feedId === id);
        if (card) ordered.push(card);
      });
      // Append any cards not in stored order (new feeds added server-side)
      cards.forEach((c) => {
        if (!ordered.includes(c)) ordered.push(c);
      });
      ordered.forEach((card) => grid.appendChild(card));
    }
  }

  // Sync toggle checkboxes to stored values
  document.querySelector('[data-pref="showFavicons"]')
    ?.setAttribute('checked', prefs.showFavicons ? '' : null);
  document.querySelector('[data-pref="largeText"]')
    ?.setAttribute('checked', prefs.largeText ? '' : null);

  const faviconToggle  = document.getElementById('toggle-favicons');
  const textSizeToggle = document.getElementById('toggle-textsize');
  if (faviconToggle)  faviconToggle.checked  = prefs.showFavicons;
  if (textSizeToggle) textSizeToggle.checked = prefs.largeText;

  // Preference toggles
  document.querySelectorAll('[data-pref]').forEach((input) => {
    const key = input.dataset.pref;
    input.addEventListener('change', () => {
      const newVal = input.checked;
      setPref(KEYS[key], newVal);

      if (key === 'largeText') {
        document.body.setAttribute('data-size', newVal ? 'large' : 'normal');
      }

      if (key === 'showFavicons') {
        document.querySelectorAll('[data-favicon]').forEach((img) => {
          if (newVal) img.removeAttribute('hidden');
          else img.setAttribute('hidden', '');
        });
      }
    });
  });
})();
// Convert UTC cache timestamps to local device time
document.querySelectorAll('[data-local-time]').forEach((span) => {
  const time = span.closest('[data-cached-at]');
  if (!time) return;
  const ms = Number(time.dataset.cachedAt);
  if (!ms) return;
  span.textContent = new Date(ms).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
});
