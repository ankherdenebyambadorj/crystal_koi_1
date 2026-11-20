# Crystal Koi — Data Model & Access Rules

## Storage
- Engine: SQLite (`node:sqlite` `DatabaseSync`), path outside `public/` and `src/` (`data/crystalkoi.sqlite`).
- Zero seed records inserted by application code.

## Lead & Intake Entities (Create via `submitForm` only; Admin-only Read/Update/Delete)
| Table | Columns | Constraints / Notes |
| --- | --- | --- |
| `call_requests` | `id`, `request_id`, `full_name`, `email`, `phone`, `company`, `preferred_window`, `status`, `source_path`, `created_at` | `request_id` UNIQUE UUID; `preferred_window` in `morning\|afternoon\|evening`; `status` forced `'new'` |
| `access_requests` | `id`, `request_id`, `full_name`, `email`, `phone`, `company`, `role`, `monthly_volume`, `status`, `source_path`, `created_at` | `request_id` UNIQUE UUID; `role` & `monthly_volume` enums; `status` forced `'new'` |
| `contact_messages` | `id`, `request_id`, `full_name`, `email`, `phone`, `company`, `topic`, `message`, `status`, `source_path`, `created_at` | `request_id` UNIQUE UUID; `topic` in `general\|partnership\|support`; `message` 1..2000 chars |
| `opt_out_requests` | `id`, `request_id`, `email`, `reason`, `status`, `source_path`, `created_at` | `request_id` UNIQUE UUID; `reason` optional <= 500 chars; `status` forced `'new'` |

## Published Public Content Entities (Read via whitelisted functions only; Admin-only Write)
| Table | Public Columns Returned | Server Function |
| --- | --- | --- |
| `partners` | `id`, `name`, `category`, `description`, `website_url` | `getPartners` (`is_published = 1`, `ORDER BY sort_order, id`, `LIMIT 100`) |
| `customer_stories` | `id`, `customer_name`, `industry`, `headline`, `summary` | `getStories` (`is_published = 1`, `ORDER BY sort_order, id`, `LIMIT 50`) |
| `service_status` | `id`, `component_name`, `state`, `note`, `updated_at` | `getServiceStatus` (`is_published = 1`, `ORDER BY sort_order, id`) |
| `status_incidents` | `id`, `title`, `severity`, `summary`, `state`, `occurred_at` | `getServiceStatus` (`is_published = 1` within last 90 days, newest first, `LIMIT 20`) |

## Auth Tables (Server-only)
- `users`: `id`, `email` (lowercase UNIQUE), `full_name`, `password_hash`, `role` (`user\|admin`), `email_verified`, `google_sub` (UNIQUE), `created_at`
- `email_verifications`: `id`, `user_id`, `email`, `purpose` (`verify_email\|reset_password`), `code_hash`, `attempts`, `expires_at`, `consumed_at`, `created_at`
- `sessions`: `id` (SHA-256 token hash), `user_id`, `expires_at`, `created_at`
