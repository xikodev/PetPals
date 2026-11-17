# Pet persistence

The My pets screen uses `/api/pets` and PostgreSQL. It no longer stores pets in
an in-memory frontend array. Both frontend and backend must be deployed together.
No new migration is needed if migration 001 has already created the `pets` table.

All endpoints require an authenticated owner session. Pending owners can manage
pets before verification; booking approval requirements are separate. The owner
ID always comes from the session. Clients cannot supply or change `owner_id`.

| Method | Endpoint | Success |
| --- | --- | --- |
| GET | `/api/pets` | 200 `{ "pets": [...] }`, newest first |
| POST | `/api/pets` | 201 `{ "pet": {...} }` |
| PATCH | `/api/pets/:id` | 200 `{ "pet": {...} }` |
| DELETE | `/api/pets/:id` | 204, no body |

POST, PATCH and DELETE require matching Origin and `X-CSRF-Token` from
`GET /api/auth/me`, plus the session cookie. Use the same-origin frontend API
proxy in production, as for profile updates. The backend must use the intended
database connection configuration for the Render environment.

POST requires `name`, `species`, `birth_date` (YYYY-MM-DD, not in the future),
and `photo_url`. Optional fields are `breed` and `care_notes`. PATCH accepts any
nonempty subset. Name, species and breed allow up to 100 characters; care notes
allow up to 1000. Optional text can be cleared with null or an empty string.
Unknown fields are rejected.

`photo_url` accepts an HTTPS URL or a JPEG/PNG/WebP data URL from the photo picker.
Uploaded image data is validated, resized and re-encoded before storage in the
existing text column. JSON requests are limited to 512 KiB.

Errors use `{ "error": "..." }`: 400 for invalid details or IDs, 401 for a missing
session, 403 for role/CSRF/Origin rejection, 404 for a missing or other owner's pet,
409 when a booking prevents deletion, 413 for oversized requests, and 503 for
database/service failures. Private database error details are not returned.

## Verify after deploying to Render

Sign in as an owner, add a pet and check that `POST /api/pets` returns 201 in
browser developer tools. Reload the page and confirm `GET /api/pets` returns it.
Check the same pet in the Render database's `pets` table. Edit it, reload again,
then delete an unbooked test pet and confirm the database row is removed.

Run `npm test` from `backend` for HTTP, validation, image processing and query
tests. These tests use injected repositories/database doubles, not a live Render
database. Production deployment and live database verification are separate.
