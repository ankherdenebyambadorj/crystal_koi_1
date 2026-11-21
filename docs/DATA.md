# Crystal Koi — Data Model & Access Rules

## Storage Engine
- Selected at runtime by `functions/db.js`:
  - **PostgreSQL (`functions/repository/pgRepo.js`)**: Active whenever `DATABASE_URL` is configured (recommended for Cloud Run and multi-instance deployments).
  - **SQLite (`functions/repository/sqliteRepo.js`)**: Local fallback (`node:sqlite`, `DB_PATH`, defaults to `data/crystalkoi.sqlite`) for local development and single-instance testing.
- Zero seed rows are inserted automatically by application startup.

## Lead & Intake Tables (Create via `POST /api/fn/submitForm`; Admin-only Read/Update)
| Table | Columns | Constraints / Notes |
| --- | --- | --- |
| `call_requests` | `id`, `request_id`, `full_name`, `email`, `phone`, `company`, `preferred_window`, `consent_given`, `consent_at`, `status`, `source_path`, `created_at` | `request_id` UNIQUE UUID; `preferred_window` in `morning\|afternoon\|evening`; `consent_given` boolean `true`; `status` `'new'` |
| `access_requests` | `id`, `request_id`, `full_name`, `email`, `phone`, `company`, `role`, `monthly_volume`, `consent_given`, `consent_at`, `status`, `source_path`, `created_at` | `request_id` UNIQUE UUID; `role` & `monthly_volume` enums; `consent_given` boolean `true`; `status` `'new'` |
| `contact_messages` | `id`, `request_id`, `full_name`, `email`, `phone`, `company`, `topic`, `message`, `consent_given`, `consent_at`, `status`, `source_path`, `created_at` | `request_id` UNIQUE UUID; `topic` in `general\|partnership\|support`; `message` 1..2000 chars; `consent_given` boolean `true` |
| `opt_out_requests` | `id`, `request_id`, `email`, `reason`, `status`, `source_path`, `created_at` | `request_id` UNIQUE UUID; `reason` optional `<= 500` chars; `status` `'new'` |

## Published Public Content Tables (Whitelisted Server Reads Only)
| Table | Public Columns Returned | Server Function |
| --- | --- | --- |
| `partners` | `id`, `name`, `category`, `description`, `website_url` | `getPartners` (`is_published = 1`, `ORDER BY sort_order, id`, `LIMIT 100`) |
| `customer_stories` | `id`, `customer_name`, `industry`, `headline`, `summary` | `getStories` (`is_published = 1`, `ORDER BY sort_order, id`, `LIMIT 50`) |
| `service_status` | `id`, `component_name`, `state`, `note`, `updated_at` | `getServiceStatus` (`is_published = 1`, `ORDER BY sort_order, id`) |
| `status_incidents` | `id`, `title`, `severity`, `summary`, `state`, `occurred_at` | `getServiceStatus` (`is_published = 1` within last 90 days, newest first, `LIMIT 20`) |

## Auth Tables (Server-Only)
- `users`: `id`, `email` (lowercase UNIQUE), `full_name`, `password_hash`, `role` (`user\|admin`), `email_verified`, `google_sub` (UNIQUE), `created_at`
- `email_verifications`: `id`, `user_id`, `email`, `purpose` (`verify_email\|reset_password`), `code_hash` (HMAC-SHA256), `attempts`, `expires_at`, `consumed_at`, `created_at`
- `sessions`: `id` (HMAC-SHA256 token digest), `user_id`, `expires_at`, `created_at`
