/**
 * show-more.js
 * Handles the "Show more / Show less" toggle on each feed card.
 * Updates aria-expanded and toggles the feed-card--expanded class.
 */

document.querySelectorAll('[data-show-more]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const card     = btn.closest('.feed-card');
    const expanded = card?.classList.toggle('feed-card--expanded');

    btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    btn.textContent = expanded ? 'Show less' : 'Show more';

    // Announce change to screen readers
    btn.setAttribute(
      'aria-label',
      expanded
        ? `Show fewer articles from ${card?.querySelector('.feed-card__source-name')?.textContent}`
        : `Show more articles from ${card?.querySelector('.feed-card__source-name')?.textContent}`
    );
  });
});
