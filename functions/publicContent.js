import {
  getPublishedPartners,
  getPublishedServiceStatus,
  getPublishedStories,
  initStore,
} from './db.js';

function safeHttpsUrl(value) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' ? parsed.toString() : '';
  } catch {
    return '';
  }
}

export async function getPartners() {
  await initStore();
  const rows = await getPublishedPartners();

  return {
    items: rows.map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      description: row.description,
      website_url: safeHttpsUrl(row.website_url),
    })),
  };
}

export async function getStories() {
  await initStore();
  const rows = await getPublishedStories();
  return { items: rows };
}

export async function getServiceStatus() {
  await initStore();
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  return getPublishedServiceStatus(ninetyDaysAgo);
}
