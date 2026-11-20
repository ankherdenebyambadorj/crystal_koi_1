import { getDb } from './db.js';

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

export function getPartners() {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, name, category, description, website_url
       FROM partners
       WHERE is_published = 1
       ORDER BY sort_order ASC, id ASC
       LIMIT 100`,
    )
    .all();

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

export function getStories() {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, customer_name, industry, headline, summary
       FROM customer_stories
       WHERE is_published = 1
       ORDER BY sort_order ASC, id ASC
       LIMIT 50`,
    )
    .all();

  return { items: rows };
}

export function getServiceStatus() {
  const db = getDb();
  const components = db
    .prepare(
      `SELECT id, component_name, state, note, updated_at
       FROM service_status
       WHERE is_published = 1
       ORDER BY sort_order ASC, id ASC
       LIMIT 100`,
    )
    .all();

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const incidents = db
    .prepare(
      `SELECT id, title, severity, summary, state, occurred_at
       FROM status_incidents
       WHERE is_published = 1 AND occurred_at >= ?
       ORDER BY occurred_at DESC, id DESC
       LIMIT 20`,
    )
    .all(ninetyDaysAgo);

  return { components, incidents };
}
