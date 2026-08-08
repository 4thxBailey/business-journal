/**
 * refresh.js
 * Triggers a server-side cache refresh and reloads the feed grid.
 */

import { showToast } from './settings.js';

const refreshBtn = document.getElementById('refresh-btn');

refreshBtn?.addEventListener('click', async () => {
  refreshBtn.disabled = true;
  refreshBtn.setAttribute('aria-label', 'Refreshing feeds…');

  try {
    const res = await fetch('/api/refresh', { method: 'POST' });
    if (res.ok) {
      showToast('Feeds refreshed', 'success');
      setTimeout(() => window.location.reload(), 600);
    } else {
      showToast('Refresh failed — please try again', 'error');
    }
  } catch {
    showToast('Network error during refresh', 'error');
  } finally {
    refreshBtn.disabled = false;
    refreshBtn.setAttribute('aria-label', 'Refresh all feeds');
  }
});
