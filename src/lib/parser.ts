import { XMLParser } from 'fast-xml-parser';
import { FEED_MAX, FEED_MIN } from '../config/feeds.config.js';

export interface FeedItem {
  title: string;
  link: string;
  commentsLink?: string;
  pubDate?: string;
}

export interface ParsedFeed {
  title: string;
  items: FeedItem[];
  status: 'ok' | 'limited' | 'error';
  error?: string;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  isArray: (name) =>
    ['item', 'entry', 'link'].includes(name),
  allowBooleanAttributes: true,
});

function extractAtomLink(links: unknown): string {
  if (!Array.isArray(links)) return '';
  // Prefer alternate link, fall back to first available
  const alt = links.find(
    (l: Record<string, string>) =>
      l['@_rel'] === 'alternate' || !l['@_rel']
  );
  return alt?.['@_href'] ?? links[0]?.['@_href'] ?? '';
}

function parseRss(data: Record<string, unknown>): FeedItem[] {
  const channel =
    (data?.rss as Record<string, unknown>)?.channel as Record<string, unknown>;
  if (!channel) return [];
  const items = (channel.item as Record<string, unknown>[]) ?? [];
  return items.slice(0, FEED_MAX).map((item) => ({
    title: String(item.title ?? '').trim(),
    link: String(item.link ?? item.guid ?? '').trim(),
    commentsLink: item.comments ? String(item.comments).trim() : undefined,
    pubDate: item.pubDate ? String(item.pubDate).trim() : undefined,
  }));
}

function parseAtom(data: Record<string, unknown>): FeedItem[] {
  const feed = data?.feed as Record<string, unknown>;
  if (!feed) return [];
  const entries = (feed.entry as Record<string, unknown>[]) ?? [];
  return entries.slice(0, FEED_MAX).map((entry) => {
    const link = Array.isArray(entry.link)
      ? extractAtomLink(entry.link)
      : String((entry.link as Record<string, string>)?.['@_href'] ?? entry.link ?? '');
    return {
      title: String(
        (entry.title as Record<string, unknown>)?.['#text'] ?? entry.title ?? ''
      ).trim(),
      link: link.trim(),
      pubDate: entry.updated
        ? String(entry.updated).trim()
        : entry.published
        ? String(entry.published).trim()
        : undefined,
    };
  });
}

export async function parseFeed(url: string): Promise<ParsedFeed> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          '4TH AND BAILEY Business Journal/1.0 (+https://news.4thandbailey.com)',
        Accept:
          'application/rss+xml, application/atom+xml, application/xml, text/xml',
      },
      signal: AbortSignal.timeout(8000), // 8 second timeout per feed
    });

    if (!response.ok) {
      return {
        title: '',
        items: [],
        status: 'error',
        error: `HTTP ${response.status}`,
      };
    }

    const xml = await response.text();
    const data = parser.parse(xml) as Record<string, unknown>;

    let items: FeedItem[] = [];
    let feedTitle = '';

    if (data.rss) {
      const channel = (data.rss as Record<string, unknown>)
        ?.channel as Record<string, unknown>;
      feedTitle = String(channel?.title ?? '').trim();
      items = parseRss(data);
    } else if (data.feed) {
      const feed = data.feed as Record<string, unknown>;
      feedTitle = String(
        (feed.title as Record<string, unknown>)?.['#text'] ?? feed.title ?? ''
      ).trim();
      items = parseAtom(data);
    } else {
      return {
        title: '',
        items: [],
        status: 'error',
        error: 'Unrecognized feed format',
      };
    }

    // Filter out items with no title or link
    items = items.filter((item) => item.title && item.link);

    if (items.length === 0) {
      return { title: feedTitle, items: [], status: 'error', error: 'No items found' };
    }

    return {
      title: feedTitle,
      items,
      status: items.length >= FEED_MIN ? 'ok' : 'limited',
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unknown error';
    return { title: '', items: [], status: 'error', error: message };
  }
}
