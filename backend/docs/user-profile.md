# User profile API

## GET /api/users/me

Returns the signed-in user's profile and their own pets or active listings.
Requires the existing Google-auth session cookie. Pending, rejected and suspended
users can still view their own profile; this endpoint does not grant booking access.
Anonymous users and users who have not finished registration receive `401`.

The user ID is taken only from the session. No user ID, role or owner/helper ID
parameter is accepted to select another account. Responses use `Cache-Control: no-store`.

```json
{
  "profile": {
    "id": 12,
    "first_name": "Ana",
    "last_name": "Test",
    "email": "ana@example.com",
    "photo_url": null,
    "role": "owner",
    "verification_status": "pending",
    "suspended_until": null,
    "created_at": "2026-11-10T12:00:00.000Z"
  },
  "pets": [
    {
      "id": 3,
      "name": "Luna",
      "species": "dog",
      "breed": null,
      "birth_date": "2023-05-01",
      "care_notes": "Afraid of loud noises",
      "photo_url": "https://example.com/luna.jpg"
    }
  ],
  "active_listings": []
}
```

### Role-specific content

| Role | `pets` | `active_listings` |
| --- | --- | --- |
| Owner | All pets owned by this user | Empty array |
| Helper | Empty array | Own listings with `status = 'published'` |
| Administrator | Empty array | Empty array |

Collections are ordered by descending ID. They are empty arrays when there are
no records. The current pet schema has no archive/delete flag, so all stored
owned pets are included. No schema migration is needed for this endpoint.

Each listing contains `id`, `service_type_id`, `service_type` (category name),
`description`, `rate`, `rate_unit`, `photo_url`, `latitude`, `longitude`, and
`status`. Draft and removed listings are excluded. Here, "active" means published;
this is a self-profile view, not a search for available dates. A published listing
is still visible to its owner if their account is suspended or its category was
deactivated for new listings.

PostgreSQL decimal values (`rate`, `latitude`, `longitude`) are returned as strings
by the existing `pg` driver. `birth_date` is a `YYYY-MM-DD` date; timestamps use ISO
8601. Google identifiers, credential references, session data and internal
administrator references are not returned.

### Responses

| Status | Meaning |
| --- | --- |
| `200` | Profile and collections returned |
| `401` | Missing/expired session or registration not completed |
| `404` | Account disappeared after authentication was checked |
| `503` | Session/profile database lookup failed; details are not exposed |

### Testing and frontend handoff

After Google sign-in and registration, open `/api/users/me` on the backend in the
same browser. To fetch it from a same-origin frontend:

```javascript
const response = await fetch('/api/users/me', { credentials: 'same-origin' });
const result = await response.json();
```

Cross-origin frontend integration follows the cookie/Origin constraints in
[Google sign-in](google-auth.md). No CORS change is included here.

The frontend team can render the profile and the relevant collection below it.
No HTML, edit button or other frontend code is included. Profile editing and
account deletion belong to the next user-settings step and are not implemented
by this read-only endpoint. Use `/api/auth/me` for the existing CSRF token when
working with mutation endpoints.

`npm test` covers access restrictions, role-specific responses, ownership-scoped
queries and error handling using test doubles. It does not connect to Render.
