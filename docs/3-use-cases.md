# 3. Use Cases

**Objective:** Show the principal interactions between the application's actors and the system. Describe how an actor achieves a goal and what happens when an important step fails. Base the interactions on the approved requirements and revise them as the application develops.

## 3.1 Use Case Diagram

**Rendered use case diagram:** ![Use case diagram](./assets/diagrams/3-1-petpals-system-UC.svg)  
**Versioned PlantUML source:** [`Source puml`](./puml/3-1-petpals-system-UC.puml)

The diagram shows the three roles that interact with PetPals. Pet Owner and Pet Helper use the mobile application and share a generalized actor, Registered User, for goals both can perform (signing in, confirming a service, messaging, rating, reporting a problem). The Administrator uses the web administration panel only. External systems appear as secondary actors where they take part in a user goal: the OAuth 2.0 provider during sign-in, Google Maps during search and route display, Google Calendar when a helper approves a request, and the QR Code API when a service is confirmed by QR code. QR confirmation is modelled as an `<<extend>>` of the general confirmation use case because the helper chooses between QR code and button for each confirmation.

---

## 3.2 Use Case Descriptions

Use case IDs follow the order below. The *Requirement ID(s)* field is completed from the traceability table in section 2 once the functional requirements are numbered. Alternative flows marked *(proposed)* are team design decisions that go beyond the approved role description and should be confirmed.

### UC-001: Sign in and set up profile

| Field | Description |
| --- | --- |
| Primary actor | Registered User (Pet Owner or Pet Helper); secondary actor: OAuth 2.0 provider |
| Requirement ID(s) | F-TBD |
| Preconditions, if any | None. |
| Main flow | 1. The user chooses to sign in with an external provider (for example Google).<br>2. The provider authenticates the user and returns their identity to the application.<br>3. On first sign-in the application asks for a minimal profile: display name and, optionally, a photo.<br>4. The user submits the profile; the application creates the account marked "unverified". |
| Alternative or failure flows, if any | **2a — Authentication fails or is cancelled:** the user stays signed out and the application explains how to retry.<br>**3a — Display name missing:** the application asks for it before continuing. |
| Result | The user is signed in. Until an Administrator approves the account (UC-015), an owner can browse and prepare bookings but cannot send requests, and a helper can prepare service listings but cannot receive requests. |

### UC-002: Manage pet profiles

| Field | Description |
| --- | --- |
| Primary actor | Pet Owner |
| Requirement ID(s) | F-TBD |
| Preconditions, if any | The owner is signed in. |
| Main flow | 1. The owner opens their pets and chooses to add a pet.<br>2. The owner enters the name, species, optional breed, age, a short free-text note (for example medication or fears) and a photo.<br>3. The owner saves; the application stores the pet profile. |
| Alternative or failure flows, if any | **3a — Required fields missing:** the application highlights them and does not save. |
| Result | The pet profile exists and can be chosen when sending a booking request. It is visible only to the owner and to a helper who receives a booking request for that pet. |

### UC-003: Manage service listings

| Field | Description |
| --- | --- |
| Primary actor | Pet Helper |
| Requirement ID(s) | F-TBD |
| Preconditions, if any | The helper is signed in. |
| Main flow | 1. The helper chooses to add a service listing.<br>2. The helper selects the service type (sitting, walking or feeding) and enters a description, a rate (for example per hour or per day), a photo and the service area.<br>3. The helper sets the availability calendar of the listing and saves.<br>4. The application stores the listing as a bookable, searchable entity with type, price, availability and location. |
| Alternative or failure flows, if any | **4a — Helper not yet verified:** the listing is saved but cannot receive booking requests until the helper is verified (UC-015).<br>**4b — Listing removed by an Administrator:** the listing is hidden from search and the helper is notified (UC-016). |
| Result | The listing appears in search results for matching owners, subject to the helper's verified status. |

### UC-004: Block unavailable dates

| Field | Description |
| --- | --- |
| Primary actor | Pet Helper |
| Requirement ID(s) | F-TBD |
| Preconditions, if any | The helper has at least one service listing. |
| Main flow | 1. The helper opens the calendar of a listing.<br>2. The helper selects dates on which they are unavailable and confirms.<br>3. The application marks the dates as blocked. |
| Alternative or failure flows, if any | None. |
| Result | Blocked dates do not appear in search results for that listing and cannot be booked. |

### UC-005: Search helpers on map

| Field | Description |
| --- | --- |
| Primary actor | Pet Owner; secondary actor: Google Maps API |
| Requirement ID(s) | F-TBD |
| Preconditions, if any | The owner is signed in (verified or not). |
| Main flow | 1. The owner enters a location, either the current location or a point chosen on the map, selects a service type and a date range, and optionally a price range.<br>2. The application returns the matching helpers as a list and as markers on an interactive map.<br>3. The owner selects a marker; the application shows a summary card with the helper's services, rates, average rating and availability for the requested period. |
| Alternative or failure flows, if any | **1a — Current location unavailable:** the owner chooses a point on the map manually (proposed).<br>**2a — No helper matches:** the application says so and the owner changes the criteria.<br>**2b — Map cannot be loaded:** the application reports the problem and the owner can retry (proposed). |
| Result | The owner can open a helper's availability and send a booking request (UC-006). |

### UC-006: Send booking request

| Field | Description |
| --- | --- |
| Primary actor | Pet Owner |
| Requirement ID(s) | F-TBD |
| Preconditions, if any | The owner is signed in and verified; a helper was chosen (UC-005). |
| Main flow | 1. The owner opens the helper's availability calendar; available slots are highlighted, booked and blocked dates are greyed out.<br>2. The owner selects a service and a date range.<br>3. The owner chooses one of their pet profiles and optionally adds a message.<br>4. The owner sends the request; the application creates a booking in the "Requested" state.<br>5. The owner can follow the request in their bookings list. |
| Alternative or failure flows, if any | **0a — Owner not yet verified:** the owner can prepare the booking but the application does not send it and explains that verification is pending.<br>**3a — No pet profile exists:** the owner creates one first (UC-002) and returns to step 3 (proposed). |
| Result | A booking in the "Requested" state awaits the helper's decision. |

### UC-007: Review booking request

| Field | Description |
| --- | --- |
| Primary actor | Pet Helper; secondary actor: Google Calendar API |
| Requirement ID(s) | F-TBD |
| Preconditions, if any | The helper is verified and a booking request is in the "Requested" state. |
| Main flow | 1. The helper opens the request and sees the owner's profile, the pet profile, the owner's previous ratings and the requested date range.<br>2. The helper accepts the request.<br>3. The application locks the time slot for that listing and updates the booking status for the owner.<br>4. The application creates Google Calendar events for both parties with start time, end time, handover address and automatic reminders before both boundaries. |
| Alternative or failure flows, if any | **2a — Helper declines:** the owner sees the updated status; no slot is locked and no calendar events are created.<br>**4a — Calendar events cannot be created:** the approval stays valid and the application reports that the events were not created (proposed). |
| Result | The booking is approved, the slot is locked and both parties have calendar events. |

### UC-008: Track booking and view route

| Field | Description |
| --- | --- |
| Primary actor | Pet Owner; secondary actor: Google Maps API |
| Requirement ID(s) | F-TBD |
| Preconditions, if any | The owner has sent at least one booking request. |
| Main flow | 1. The owner opens their bookings list and selects a booking.<br>2. The application shows the booking state (Requested, approved, In Progress or Completed).<br>3. Once the booking is approved, the application shows the helper's route on the map so the owner knows where to meet or which address to expect the helper at. |
| Alternative or failure flows, if any | **3a — Map cannot be loaded:** the application shows the handover address as text (proposed). |
| Result | The owner knows the current state of the booking and where the handover takes place. |

### UC-009: Confirm service start or completion

| Field | Description |
| --- | --- |
| Primary actor | Registered User (the helper initiates, the owner confirms their side) |
| Requirement ID(s) | F-TBD |
| Preconditions, if any | The booking is approved (to confirm the start) or In Progress (to confirm completion). |
| Main flow | 1. At the agreed time the helper initiates the confirmation and chooses the method: QR code when both parties are physically together, or a "Confirm" button for drop-in services where they are not.<br>2. The helper performs their side of the confirmation in the application.<br>3. The owner performs their side with the same method.<br>4. When both sides have confirmed, the booking moves to "In Progress" (start) or "Completed" (completion). |
| Alternative or failure flows, if any | **1a — QR method chosen:** see UC-010.<br>**3a — Only one side confirms:** the booking does not advance.<br>**3b — Confirmation is not given or is disputed:** either party can report a problem (UC-013). |
| Result | The booking state changes only after both parties confirmed. The confirmation events are kept in the booking record. |

### UC-010: Confirm by QR code

| Field | Description |
| --- | --- |
| Primary actor | Registered User; secondary actor: QR Code API |
| Requirement ID(s) | F-TBD |
| Preconditions, if any | A confirmation was initiated (UC-009) and the helper chose the QR method. |
| Main flow | 1. The application requests a unique QR image for the booking from the QR Code API and displays it.<br>2. Both parties scan the QR code in the application.<br>3. The application records both confirmations. |
| Alternative or failure flows, if any | **1a — QR image cannot be generated:** the application reports the failure and the helper can retry or choose the button method (proposed). |
| Result | The confirmation step is completed as in UC-009. |

### UC-011: Exchange booking messages

| Field | Description |
| --- | --- |
| Primary actor | Registered User (Pet Owner or Pet Helper) |
| Requirement ID(s) | F-TBD |
| Preconditions, if any | A booking between the owner and the helper exists. |
| Main flow | 1. The user opens the chat of the booking.<br>2. The user writes and sends a text message.<br>3. The application delivers it to the other party within the same booking. |
| Alternative or failure flows, if any | **3a — Message cannot be delivered:** the application shows that it was not sent and lets the user retry (proposed). |
| Result | The message is stored in the booking's chat log. It is visible only to the two parties and to the Administrator in case of a dispute. |

### UC-012: Rate the other party

| Field | Description |
| --- | --- |
| Primary actor | Registered User (Pet Owner or Pet Helper) |
| Requirement ID(s) | F-TBD |
| Preconditions, if any | The booking is "Completed". |
| Main flow | 1. The application prompts the user to rate the other party.<br>2. The user selects a rating from 1 to 5 and may add a short review.<br>3. The user submits; the application stores the rating. |
| Alternative or failure flows, if any | **2a — Rating missing:** the application asks the user to select a value from 1 to 5. |
| Result | An owner's rating contributes to the helper's displayed average rating. A helper's rating of the owner influences whether other helpers accept that owner's future requests. |

### UC-013: Report a problem with a booking

| Field | Description |
| --- | --- |
| Primary actor | Registered User (Pet Owner or Pet Helper) |
| Requirement ID(s) | F-TBD |
| Preconditions, if any | A booking exists, for example after a no-show, a pet returned with an issue, or a disputed completion confirmation. |
| Main flow | 1. The user opens the booking and chooses to report a problem.<br>2. The user describes the problem and submits.<br>3. The application marks the booking as disputed so that it appears among the open disputes for an Administrator. |
| Alternative or failure flows, if any | None. |
| Result | The dispute is available for review (UC-017). |

### UC-014: View history and earnings

| Field | Description |
| --- | --- |
| Primary actor | Pet Helper |
| Requirement ID(s) | F-TBD |
| Preconditions, if any | The helper is signed in. |
| Main flow | 1. The helper opens the history view.<br>2. The application lists the helper's completed bookings and shows the total earnings calculated from the rates and the completed bookings recorded in the system. |
| Alternative or failure flows, if any | **2a — No completed bookings:** the application shows an empty history and zero total. |
| Result | The helper sees recorded totals. The platform does not process payments; the figure is a display of recorded values. |

### UC-015: Verify users

| Field | Description |
| --- | --- |
| Primary actor | Administrator (web administration panel) |
| Requirement ID(s) | F-TBD |
| Preconditions, if any | The Administrator is signed in to the panel and new profiles are waiting in the verification queue. |
| Main flow | 1. The Administrator opens the verification queue and selects a profile.<br>2. The Administrator reviews the submitted identity information (name, email and any documents the team includes).<br>3. The Administrator approves the profile; the application marks the user as verified. |
| Alternative or failure flows, if any | **3a — Administrator rejects the profile:** the user stays unverified and cannot send or receive booking requests. |
| Result | Only approved users can send or receive booking requests. Verified status is a visible attribute of the profile and affects helper reputation. |

### UC-016: Moderate listings

| Field | Description |
| --- | --- |
| Primary actor | Administrator (web administration panel) |
| Requirement ID(s) | F-TBD |
| Preconditions, if any | The Administrator is signed in and a listing is inappropriate, illegal or misclassified (for example not really pet care). |
| Main flow | 1. The Administrator opens the listing.<br>2. The Administrator removes it.<br>3. The application hides the listing from search and notifies the owning helper. |
| Alternative or failure flows, if any | None. |
| Result | The removed listing no longer appears in search results. |

### UC-017: Resolve dispute

| Field | Description |
| --- | --- |
| Primary actor | Administrator (web administration panel) |
| Requirement ID(s) | F-TBD |
| Preconditions, if any | A booking was reported as problematic (UC-013). |
| Main flow | 1. The Administrator opens the dispute.<br>2. The application shows the full record: the initial request, both parties' profiles and ratings, the complete chat log, the confirmation events and the Google Calendar event metadata.<br>3. The Administrator decides an outcome, such as an account warning, a temporary suspension or a recorded decision affecting the parties' future use of the platform.<br>4. The Administrator records the decision. |
| Alternative or failure flows, if any | None. |
| Result | The decision is recorded on the booking. It is not financially executed because payment processing is out of scope. |

### UC-018: View platform statistics

| Field | Description |
| --- | --- |
| Primary actor | Administrator (web administration panel) |
| Requirement ID(s) | F-TBD |
| Preconditions, if any | The Administrator is signed in. |
| Main flow | 1. The Administrator opens the dashboard.<br>2. The application shows the number of active bookings, the most active helpers, the number of open disputes, the size of the verification queue and the total number of completed bookings. |
| Alternative or failure flows, if any | None. |
| Result | The Administrator can prioritize moderation work. |

### UC-019: Manage service types and settings

| Field | Description |
| --- | --- |
| Primary actor | Administrator (web administration panel) |
| Requirement ID(s) | F-TBD |
| Preconditions, if any | The Administrator is signed in. |
| Main flow | 1. The Administrator opens the settings area.<br>2. The Administrator changes the list of service types or a configuration value, for example the rate ranges used as filter hints.<br>3. The application saves the change. |
| Alternative or failure flows, if any | None. |
| Result | The changed service types and values are used by the application. This is a lightweight capability, not a general-purpose settings system. |

---

## 3.3 Use Case Consistency Check

| Check | Statement for the team |
| --- | --- |
| Requirement | Each use case above has a *Requirement ID(s)* field marked F-TBD. The IDs are filled in from the functional requirements of section 2; the mapping is kept once, in the requirement traceability table. |
| Actor | The actors match the three identified roles (Pet Owner, Pet Helper, Administrator) plus the four external systems that take part in a goal. Administrators appear only in use cases of the web panel and have no association with booking calendars, listings or ratings. Administrator account creation by existing Administrators is not yet described by a use case. |
| Application | No use case is implemented yet; all descriptions are the current design and are to be compared with the demonstrated application. |

Maintain the requirement-to-use-case-to-test mapping **once, in the [requirement traceability table](./2-requirements.md)**.
