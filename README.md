# 4TH AND BAILEY Business Journal

Professional business intelligence and technology news aggregator for IT leaders, InfoSec officers, and enterprise decision-makers.

**Live:** [news.4thandbailey.com](https://news.4thandbailey.com)  
**Author:** Lionel Mosley — [trust-lionel.com](https://trust-lionel.com)  
**Company:** [4th and Bailey, LLC](https://4thandbailey.com)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Astro 7, SSR mode |
| Runtime | Node.js v24.16.0 |
| Hosting | Railway (persistent Node process) |
| CDN | BunnyCDN Pull Zone |
| Feed parser | fast-xml-parser |
| Styling | CSS custom properties, zero framework |
| PWA | Service worker, Web Manifest |
| Auth (v2) | Microsoft Entra ID — SAML 2.0 SSO |

---

## Architecture

### Feed caching
All feeds are cached in-memory on the Railway Node process with a 5-minute TTL.
A background `setInterval` refreshes feeds silently — page loads always read from
cache, never waiting on upstream RSS endpoints.

Cold-start fetches all 21 default feeds in parallel using `Promise.allSettled`,
so one slow or failing feed never blocks the rest.

### Feed configuration
All feeds are defined in `src/config/feeds.config.ts`. The pinned feed
(Lionel Mosley | ahr-ki-tekt) is non-removable. All other feeds are ad hoc —
editable via the settings panel without touching application code.

### User preferences
Stored in `localStorage` under the `4bj_` namespace:
- `4bj_showFavicons` — boolean
- `4bj_largeText` — boolean
- `4bj_feedOrder` — array of feed IDs
- `4bj_hiddenFeeds` — array of feed IDs
- `4bj_customFeeds` — array of `{ id, name, url, homeUrl }` objects

### Theming
Driven entirely by `prefers-color-scheme`. No manual toggle. The OS/device
setting is respected — users are met where they are.

---

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Deployment — Railway

1. Connect the `/business-journal` GitHub repository to Railway.
2. Railway auto-detects `railway.toml` and builds with Nixpacks.
3. Set environment variable `PORT=3000` in Railway dashboard (already in `railway.toml`).
4. Configure BunnyCDN Pull Zone pointing to your Railway service URL.
5. Set custom hostname `news.4thandbailey.com` in BunnyCDN.

## Accessibility

WCAG 2.1 AA compliant. Tested against:
- VoiceOver on iOS (iPad Mini, iPhone)
- VoiceOver on macOS
- NVDA on Windows
- Keyboard-only navigation

All icon buttons have descriptive `aria-label` attributes.
The settings dialog implements full focus trapping and focus restoration.
Drag-to-reorder has a full keyboard alternative (move up/down buttons).

## Feed Limits

- **Minimum:** 5 articles per feed (fewer shows "Limited content available")
- **Maximum:** 20 articles per feed (caps payload, filters syndicated duplicates)

## v2 Roadmap

- Microsoft Entra ID SAML 2.0 SSO
- Per-user feed preferences synced server-side
- Microsoft Tech Community ad hoc feed additions
