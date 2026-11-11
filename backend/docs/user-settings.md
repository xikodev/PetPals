# User settings API

API only; frontend controls are implemented separately. Existing migrations 001
and 002 are sufficient. No new migration or environment variables are needed.

## Edit your profile

`PATCH /api/users/me`

Requires an authenticated session cookie, the configured `Origin`, and an
`X-CSRF-Token` header containing `csrfToken` from `GET /api/auth/me`.
Pending, rejected and suspended users can edit their own profile.

Send a JSON object containing at least one of these fields:

| Field | Accepted value |
| --- | --- |
| `first_name` | String, trimmed, 1–100 characters |
| `last_name` | String, trimmed, 1–100 characters |
| `photo_url` | HTTPS URL up to 2048 characters without embedded credentials, or `null` to remove |

Omitted fields remain unchanged. Other fields are rejected, including `id`,
`email`, `role`, and `verification_status`. Email remains linked to Google.
Photo URLs are stored only; this endpoint does not upload, fetch or delete images.

Changing either name resets an owner/helper's verification to `pending` and
clears the previous reviewer and review date. Sending unchanged names or changing
only a photo preserves verification. Administrator verification is unchanged.
Suspensions remain in effect.

Example request:

```json
{
  "first_name": "Ana",
  "last_name": "Horvat",
  "photo_url": null
}
```

**200 response:** `{ "profile": { ... } }`, with the same profile fields documented
in [User profile API](user-profile.md): `id`, `first_name`, `last_name`, `email`,
`photo_url`, `role`, `verification_status`, `suspended_until`, `created_at`.
Pets and listings are not included in the PATCH response.

| Status | Meaning |
| --- | --- |
| `200` | Profile updated |
| `400` | Invalid or unsupported fields |
| `401` | Missing/expired session or registration incomplete |
| `403` | Origin or CSRF token invalid/missing |
| `404` | Profile no longer exists |
| `503` | Session/database operation temporarily unavailable |

Application-level JSON parsing also rejects malformed JSON (`400`) and bodies
over 16 KB (`413`) before the endpoint runs. These parser errors use Express's
default error response; endpoint errors use `{ "error": "message" }`.
Responses from the users router set `Cache-Control: no-store`.

## Try it after Google sign-in

From the browser developer console on the backend origin:

```javascript
const auth = await fetch('/api/auth/me').then(response => response.json());
const response = await fetch('/api/users/me', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': auth.csrfToken
  },
  body: JSON.stringify({ photo_url: null })
});
console.log(response.status, await response.json());
```

The browser sends the session cookie and Origin automatically for this same-origin
request. Use `GET /api/users/me` afterwards to verify persistence. Cross-origin
frontend constraints are documented in [Google sign-in](google-auth.md).

## Account deletion

Not implemented. `DELETE /api/users/me` returns `404`. No user, Google identity,
session, pet or listing is deleted by this feature.

## Automated checks

`npm test` uses test doubles and checks authentication, CSRF, field validation,
identity scoping, update parameters and safe errors. It does not connect to Render
or validate SQL execution against PostgreSQL.
