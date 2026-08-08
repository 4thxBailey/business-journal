export interface FeedConfig {
  id: string;
  name: string;
  url: string;
  homeUrl: string;
  pinned?: boolean;
}

/**
 * Pinned feed — Lionel Mosley | ahr-ki-tekt
 * Non-removable. Always rendered first regardless of user sort order.
 */
export const PINNED_FEED: FeedConfig = {
  id: 'trust-lionel',
  name: 'Lionel Mosley | ahr-ki-tekt',
  url: 'https://trust-lionel.com/atom.xml',
  homeUrl: 'https://trust-lionel.com',
  pinned: true,
};

/**
 * Default ad hoc feeds — alphabetical order.
 * All user-editable: reorderable, hideable, and removable.
 * Users may also add their own RSS/Atom feeds via the settings panel.
 */
export const DEFAULT_FEEDS: FeedConfig[] = [
  {
    id: 'aljazeera',
    name: 'Al Jazeera',
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
    homeUrl: 'https://www.aljazeera.com',
  },
  {
    id: 'arstechnica',
    name: 'Ars Technica',
    url: 'https://feeds.arstechnica.com/arstechnica/index',
    homeUrl: 'https://arstechnica.com',
  },
  {
    id: 'bbc',
    name: 'BBC News',
    url: 'https://feeds.bbci.co.uk/news/rss.xml',
    homeUrl: 'https://www.bbc.co.uk/news',
  },
  {
    id: 'cio',
    name: 'CIO',
    url: 'https://www.cio.com/feed/',
    homeUrl: 'https://www.cio.com',
  },
  {
    id: 'darkreading',
    name: 'Dark Reading',
    url: 'https://www.darkreading.com/rss.xml',
    homeUrl: 'https://www.darkreading.com',
  },
  {
    id: 'engadget',
    name: 'Engadget',
    url: 'https://www.engadget.com/rss.xml',
    homeUrl: 'https://www.engadget.com',
  },
  {
    id: 'hackernews',
    name: 'Hacker News',
    url: 'https://news.ycombinator.com/rss',
    homeUrl: 'https://news.ycombinator.com',
  },
  {
    id: 'houstonbj',
    name: 'Houston Business Journal',
    url: 'https://feeds.bizjournals.com/bizj_houston',
    homeUrl: 'https://www.bizjournals.com/houston',
  },
  {
    id: 'houstonlanding',
    name: 'Houston Landing',
    url: 'https://houstonlanding.org/feed',
    homeUrl: 'https://houstonlanding.org',
  },
  {
    id: 'krebs',
    name: 'Krebs on Security',
    url: 'https://krebsonsecurity.com/feed/',
    homeUrl: 'https://krebsonsecurity.com',
  },
  {
    id: 'lobsters',
    name: 'Lobsters',
    url: 'https://lobste.rs/rss',
    homeUrl: 'https://lobste.rs',
  },
  {
    id: 'macrumors',
    name: 'MacRumors',
    url: 'https://feeds.macrumors.com/MacRumors-All',
    homeUrl: 'https://www.macrumors.com',
  },
  {
    id: 'nyt',
    name: 'NYT World News',
    url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
    homeUrl: 'https://www.nytimes.com/section/world',
  },
  {
    id: 'slashdot',
    name: 'Slashdot',
    url: 'http://rss.slashdot.org/Slashdot/slashdotMain',
    homeUrl: 'https://slashdot.org',
  },
  {
    id: 'techcrunch',
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    homeUrl: 'https://techcrunch.com',
  },
  {
    id: 'guardian',
    name: 'The Guardian',
    url: 'https://www.theguardian.com/uk/rss',
    homeUrl: 'https://www.theguardian.com',
  },
  {
    id: 'nextweb',
    name: 'The Next Web',
    url: 'https://thenextweb.com/feed',
    homeUrl: 'https://thenextweb.com',
  },
  {
    id: 'register',
    name: 'The Register',
    url: 'https://www.theregister.com/headlines.atom',
    homeUrl: 'https://www.theregister.com',
  },
  {
    id: 'verge',
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    homeUrl: 'https://www.theverge.com',
  },
  {
    id: 'wired',
    name: 'Wired',
    url: 'https://www.wired.com/feed/rss',
    homeUrl: 'https://www.wired.com',
  },
];

export const FEED_MIN = 5;
export const FEED_MAX = 20;
export const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
