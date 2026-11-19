# 2. Requirement Analysis

**Objective:** Derive identifiable, prioritized, and verifiable requirements project scope. The requirements may evolve; by the final submission, they must reflect the agreed application.

---

## 2.1 Functional Requirements

**Objective:** State what the application must do for its users, where each capability comes from, and what observable result counts as acceptance. 

| ID | Description | Priority | Source | Acceptance criteria |
| :--- | --- | :---: | --- | --- |
| F-001 | Users can authenticate via OAuth 2.0 (external provider such as Google). | High | [Project Scope, 1.3](1-Project-Scope.md#13-project-boundaries) | After successful OAuth 2.0 authentication, the user’s display name is shown in the application. A new user first chooses a role (owner or helper) and enters their name. If the user cancels at the provider's consent screen, the login screen is shown and no session is created. |
| F-002 | Pet Owners can create, view, edit, and delete pet profiles with photos and notes. | High | [Project Scope, 1.3](1-Project-Scope.md#13-project-boundaries) | After saving a new pet profile (name, species, optional breed, birth date, notes, photo), the pet appears in the owner's pet list. Edited values are shown after saving. A deleted pet no longer appears in the list. |
| F-003 | Pet Owners can search for helpers by location, service type, price range, and availability. | High | [Project Scope, 1.3](1-Project-Scope.md#13-project-boundaries) | After the owner enters search criteria, the result list contains only helpers that match all entered criteria; only published listings of verified helpers are returned. If no helper matches, a message stating that no results were found is shown. |
| F-004 | Search results are displayed on an interactive map showing nearby helpers. | High | [Project Scope, 1.3](1-Project-Scope.md#13-project-boundaries) | Each helper in the result list is shown as a marker on the map. Selecting a marker displays the helper's name, service type, and rate. |
| F-005 | Pet Owners can view a helper's availability calendar and send a booking request for a specific start and end date and time. | High | [Project Scope, 1.3](1-Project-Scope.md#13-project-boundaries) | The calendar shows available and blocked dates. After the owner selects an available start and end date and time, a service type, a pet and the handover address and submits the request, the booking appears in the owner's booking list with the status Requested. Blocked dates cannot be selected. An owner whose account is not yet verified cannot submit the request; the application explains why. |
| F-006 | Pet Helpers can accept or decline booking requests after reviewing the owner's profile and ratings. | High | [Project Scope, 1.3](1-Project-Scope.md#13-project-boundaries) | The request view shows the owner's profile and past ratings. After Accept, the booking status is Accepted for both parties and the requested dates are marked unavailable in the helper's calendar. After Decline, the status is Declined, the dates remain available, and the owner sees the new status. |
| F-007 | When a booking is accepted, the system creates Google Calendar events for both parties with reminders before start and end. | High | [Project Scope, 1.3](1-Project-Scope.md#13-project-boundaries) | After acceptance, an event containing the start time, end time, and handover address appears in the Google Calendar of both users, with a reminder before the start and a reminder before the end. |
| F-008 | Both parties confirm the start of service, either via QR code scan or a Confirm button (helper chooses method). | High | [Project Scope, 1.3](1-Project-Scope.md#13-project-boundaries) | The helper selects QR code or Confirm button when initiating the step. With QR, the helper's application displays the code and the owner scans it; with the button, each party taps Confirm. The booking status changes from Accepted to In Progress only after both parties have confirmed; until then it remains Accepted. |
| F-009 | Both parties confirm the completion of service, either via QR code scan or a Confirm button (helper chooses method). | High | [Project Scope, 1.3](1-Project-Scope.md#13-project-boundaries) | The helper selects QR code or Confirm button when initiating the step. With QR, the helper's application displays the code and the owner scans it; with the button, each party taps Confirm. The booking status changes from In Progress to Completed only after both parties have confirmed; until then it remains In Progress. |
| F-010 | After completion, both parties rate and review each other. | Medium | [Project Scope, 1.3](1-Project-Scope.md#13-project-boundaries) | After submission, a rating from 1 to 5 stars and the review text appear on the reviewed user’s profile. The rating form is available only for bookings with the status Completed, and each party can submit one review per booking. |
| F-011 | Pet Helpers can create and manage service listings with a photo, description, rate, and availability. | High | [Project Scope, 1.3](1-Project-Scope.md#13-project-boundaries) | After saving a listing with service type (sitting, walking, or feeding), description, a photo, rate, and availability, it appears in owner search results matching its data. Edits are visible after saving. A deleted listing no longer appears in search results. A helper who is not yet verified can save listings, but they are not shown in search results. |
| F-012 | Pet Helpers can block specific dates on their availability calendar. | High | [Project Scope, 1.3](1-Project-Scope.md#13-project-boundaries) | Dates blocked by the helper are shown as unavailable in the helper's calendar and in the owner's view of that calendar, and cannot be selected in a booking request. Unblocking a date makes it selectable again. |
| F-013 | Pet Helpers can view their booking history and a summary of total earnings from completed bookings. | Medium | [Project Scope, 1.3](1-Project-Scope.md#13-project-boundaries) | The history lists each booking with date range, owner, service type, and status. The earnings summary shows the sum of the recorded total prices of bookings with the status Completed; Requested, Accepted, Declined, and In Progress bookings are not included. |
| F-014 | Administrators can verify new user profiles (approve or reject). | High | [Project Scope, 1.3](1-Project-Scope.md#13-project-boundaries) | The admin panel lists profiles awaiting verification. After Approve, the profile is shown as verified; after Reject, it is shown as rejected. The affected user can see the resulting status. If an approved user changes their name, the status returns to pending. |
| F-015 | Administrators can moderate service listings. | High | [Project Scope, 1.3](1-Project-Scope.md#13-project-boundaries) | The admin panel lists service listings. After an administrator removes a listing, it no longer appears in search results and the helper sees that it has been removed. |
| F-016 | Administrators can resolve disputes by reviewing booking history and chat records. | High | [Project Scope, 1.3](1-Project-Scope.md#13-project-boundaries) | For an open dispute, the admin panel shows the booking history and the chat messages of the related booking. After the administrator records an outcome (account warning, suspension, or note), the dispute status changes to Resolved and the outcome is stored with the dispute. |
| F-017 | Both parties can exchange text messages within a booking. | Medium | [Project Scope, 1.3](1-Project-Scope.md#13-project-boundaries) | A text message sent by one party of a booking appears in the booking's message thread of the other party. The thread is accessible only to the two parties of that booking and, during a dispute, to the administrator. |
| F-018 | Pet Owners and Pet Helpers can report a problem with a booking. | High | [Project Scope, 1.3](1-Project-Scope.md#13-project-boundaries) | After the user describes the problem and submits, a dispute with the status Open appears in the administrator's dispute list. A problem can be reported only for bookings with the status Accepted, In Progress, or Completed. |

**High** – the core booking flow and anything that makes the platform trustworthy. **Medium** – features that support the flow but are not needed for it to work. **Low** – not used. Most requirements are High because they make up the booking flow; the three Medium ones (reviews, earnings summary, messages) can be left out without breaking it.

---

## 2.2 Non-Functional Requirements

**Objective:** Specify the important quality properties and operating conditions of the approved application in a way the team can reasonably check. 

| ID | Description | Priority | Source |
| :--- | --- | :---: | --- |
| NF-01 | Search results are returned within 3 seconds under normal conditions. Check: measure the response time of a set of sample searches on the deployed application with a test data set (100 helpers). | High | Team decision (see 2.5) |
| NF-02 | A map with up to 100 helper markers loads all markers and stays responsive to panning and zooming. Check: load a test data set of 100 markers and pan and zoom the map. | Medium | Team decision (see 2.5); ToolShare assignment (map display) |
| NF-03 | All client-server traffic uses HTTPS. The application stores no passwords; session tokens are stored only as hashes, and any Google tokens stored later (for Calendar events) are encrypted. Check: inspect the deployed configuration and the database contents.| High | Team decision (see 2.5) |
| NF-04 | Authentication uses OAuth 2.0, and a session expires after a period of inactivity (30 min). Check: remain inactive beyond the timeout and attempt a protected action. | High | ToolShare assignment (OAuth 2.0 login); team decision (see 2.5) |
| NF-05 | The PWA is usable on common Android screen sizes for owners and helpers, and the administrator views are usable in desktop browsers. Check: run the application on several emulated Android screen sizes and in at least two desktop browsers. | Medium | Team decision (see 2.5) |
| NF-06 | If creating a Google Calendar event fails, the system retries three times, and the booking stays Accepted. Check: simulate a failed API call and observe the retry and the booking status. | Medium | ToolShare assignment (Google Calendar integration); team decision (see 2.5) |
| NF-07 | Deleting an account removes the user’s personal data (GDPR-aligned); booking records shared with other users are kept in anonymized form. Check: delete a test account and verify that no personal data remains in the database. | High | GDPR (right to erasure); team decision (see 2.5) |
| NF-08 | External APIs are accessed only through abstractions: Google Calendar and the QR Code API through the backend service layer, and Google Maps through one map component in the client. Check: code review of the service layer and the map component. | Medium | Team decision (see 2.5) |




## 2.3 Stakeholders and Actors

**Objective:** Identify roles that affect requirements and distinguish stakeholders from actors who interact with the application.

| Role or actor ID | Relation to the system | Relevant requirements |
|---|---|---|
| A-01 | **Pet Owner**: needs care for a pet; uses the PWA on a mobile device to manage pet profiles, search for helpers, book services, confirm service steps, message the helper, and review the helper. | F-001, F-002, F-003, F-004, F-005, F-007, F-008, F-009, F-010, F-017, F-018 |
| A-02 | **Pet Helper**: offers pet care services; uses the PWA on a mobile device to manage listings and availability, handle booking requests, confirm service steps, message the owner, view history and earnings, and review the owner. | F-001, F-006, F-007, F-008, F-009, F-010, F-011, F-012, F-013, F-017, F-018 |
| A-03 | **Administrator**: oversees the platform; uses the administrator views of the PWA in a desktop browser only to verify users, moderate listings, and resolve disputes. | F-001, F-014, F-015, F-016 |
| A-04 | External systems (Google Maps, Google Calendar, QR Code API, OAuth provider): supporting systems used by the application; not primary actors. | F-001, F-004, F-007, F-008, F-009 |
| SH-01 | **Course staff**: review the project and its documentation at the checkpoints; not actors in the application. | No application requirements |
| SH-02 | **PetPals team**: builds, deploys and documents the application and decides its scope; not an actor in the application. | No application requirements |




---

## 2.4 Constraints and Assumptions

**Objective:** Record project-specific boundaries and assumptions that affect requirements or design, including their source and practical consequence. This is their authoritative location.

| ID | Constraint or assumption | Source | Consequence or way to verify |
| :--- | --- | --- | --- |
| C-01 | The technical scope matches the assigned ToolShare topic: every ToolShare capability has a PetPals equivalent, and no capability beyond it is added. | Course assignment (ToolShare) | Requirements and use cases are limited to F-001 to F-018 and UC-001 to UC-017; any addition is flagged for team review. |
| C-02 | Out of scope: real-time location tracking, in-app payment processing (wallets, deposits, escrow), machine learning or recommendation, image analysis, push notification services, and social features beyond reviews. | [Project Scope, 1.3](1-Project-Scope.md#13-project-boundaries) | Reminders are provided by Google Calendar; a Confirm button replaces live tracking. Payment between owner and helper takes place outside the platform, listed rates are informational, and the earnings summary (F-013) is not a financial record. Dispute outcomes are recorded as notes and sanctions without payment handling. Notifications are in-app status changes only; there are no push messages. |
| C-03 | The booking flow is one-directional: pet owners send requests to helpers; helpers do not browse owner-posted jobs. | [Project Scope, 1.3](1-Project-Scope.md#13-project-boundaries) | No job-posting or application features are designed; verify against the use case list. |
| C-04 | Four external systems are used: Google Maps API, Google Calendar API, QR Code API (the third API, in place of ToolShare's YouTube Data API), and OAuth 2.0. | [Project Scope, 1.3](1-Project-Scope.md#13-project-boundaries) | Each integration sits behind a service layer (NF-08); no further external services are introduced. |
| C-05 | One React PWA serves all roles: pet owners and pet helpers use it on mobile devices, administrators use its administration views in a desktop browser only. | [Project Scope, 1.3](1-Project-Scope.md#13-project-boundaries), team decision (ADR-01) | One client is developed; the administration views are designed and tested for desktop browsers only (NF-05). |
| AS-01 | Users have a Google account and grant calendar access so that events can be created. | Team assumption | Test sign-in and event creation with test accounts. If access is denied, the booking stays Accepted, no event is created and the user is informed. |
| AS-02 | Each helper listing has a location that can be shown on the map. | Team assumption | Test listings with and without a valid location. A listing cannot be saved without a valid location. |
| AS-03 | A booking request captures a start and an end date and time inside an available period, so that calendar events (F-007) carry exact times. | Team assumption | Check the booking request form and the resulting calendar event. |
| AS-04 | The free usage tiers of the Google Maps and Google Calendar APIs are sufficient for development and demonstration. | Team assumption | Monitor API usage in the provider console during testing and check the current quota and billing terms before relying on it. |
| AS-05 | No registration flow for administrators is designed; verify that an administrator can sign in to the administrator views. Not implemented in the first cycle (see Testing 5.4). | Team assumption | Not implemented in the first cycle (see Testing 5.4). |

---

## 2.5 Significant Requirement Changes

**Objective:** Preserve the reason for changes that alter agreed scope, priority, or acceptance criteria, while keeping the current requirements above up to date.

| Date | Requirement ID | Change and reason | Agreed with / evidence |
| --- | --- | --- | --- |
| 27.10.2026. | NF-01 to NF-08 | The course topic gives no figures, so the team set the measurable targets: search within 3 seconds, 100 map markers, HTTPS and encrypted tokens, 30-minute session timeout, Android screen sizes, three Calendar retries, and external APIs only behind abstractions. Reason: make the requirements verifiable. | Team (MC, BK, MM, TM, FI); recorded here after TA feedback of 19 Nov 2026 |
| 30.10.2026. | C-05, NF-05 | Two clients (mobile application and web administration panel) replaced by one React PWA for all roles; administrators use it in a desktop browser. Reason: one codebase for mobile and desktop (ADR-01). | Team (all members) |
| 30.10.2026. | UC-008 | Route display to the handover address removed from scope; the map shows helper markers only. Reason: Out of the scope of this project | Team (all members) |



---

## 2.6 Requirement Traceability

**Objective:** Show where important requirements are described in use cases, where relevant, and where they are checked.

| Requirement ID | Use case or design location | Test or verification location |
| --- | --- | --- |
| F-001 | [UC-001](3-use-cases.md#uc-001-sign-in-and-set-up-profile) | AUTH-01 to AUTH-05, REG-01 ([5-Testing](5-Testing.md#52-test-cases)); automated in `backend/test/auth-flow.test.js` and `auth-security.test.js`; the sign-in itself was also checked by hand on the public application |
| F-002 | [UC-002](3-use-cases.md#uc-002-manage-pet-profiles)| PETS-01 to PETS-04 ([5-Testing](5-Testing.md#52-test-cases)); automated in `backend/test/pets.test.js`, with a manual pass on My pets (PETS-01) |
| F-003 | [UC-005](3-use-cases.md#uc-005-search-helpers-on-map) | Not testable yet (not implemented in cycle 1) |
| F-004 | [UC-005](3-use-cases.md#uc-005-search-helpers-on-map) | Not testable yet (not implemented in cycle 1) |
| F-005 | [UC-006](3-use-cases.md#uc-006-send-booking-request), [UC-008](3-use-cases.md#uc-008-track-booking) | Not testable yet (not implemented in cycle 1) |
| F-006 | [UC-007](3-use-cases.md#uc-007-review-booking-request) | Not testable yet (not implemented in cycle 1) |
| F-007 | [UC-007](3-use-cases.md#uc-007-review-booking-request) (calendar step) | Not testable yet (not implemented in cycle 1) |
| F-008 | [UC-009](3-use-cases.md#uc-009-confirm-service-start-or-completion), [UC-010](3-use-cases.md#uc-010-confirm-by-qr-code) | Not testable yet (not implemented in cycle 1) |
| F-009 | [UC-009](3-use-cases.md#uc-009-confirm-service-start-or-completion), [UC-010](3-use-cases.md#uc-010-confirm-by-qr-code) | Not testable yet (not implemented in cycle 1) |
| F-010 | [UC-012](3-use-cases.md#uc-012-rate-the-other-party) | Not testable yet (not implemented in cycle 1) |
| F-011 | [UC-003](3-use-cases.md#uc-003-manage-service-listings) | Not testable yet (not implemented in cycle 1) |
| F-012 | [UC-004](3-use-cases.md#uc-004-block-unavailable-dates) | Not testable yet (not implemented in cycle 1) |
| F-013 | [UC-014](3-use-cases.md#uc-014-view-history-and-earnings) | Not testable yet (not implemented in cycle 1) |
| F-014 | [UC-015](3-use-cases.md#uc-015-verify-users) | Not testable yet (not implemented in cycle 1) |
| F-015 | [UC-016](3-use-cases.md#uc-016-moderate-listings) | Not testable yet (not implemented in cycle 1) |
| F-016 | [UC-017](3-use-cases.md#uc-017-resolve-dispute) | Not testable yet (not implemented in cycle 1) |
| F-017 | [UC-011](3-use-cases.md#uc-011-exchange-booking-messages) | Not testable yet (not implemented in cycle 1) |
| F-018 | [UC-013](3-use-cases.md#uc-013-report-a-problem-with-a-booking) | Not testable yet (not implemented in cycle 1) |
| NF-04 | Not use-case based (see checks in 2.2) | AUTH-03 ([5-Testing](5-Testing.md#52-test-cases)); session expiry tested automatically |
| NF-01 to NF-03, NF-05 to NF-08 | Not use-case based (see checks in 2.2) | Not testable yet (not implemented in cycle 1) |



---

## 2.7 Review of Requirements

**Objective:** Record meaningful feedback on requirements and the resulting decisions at the two formal project checkpoints, in weeks 7 and 14.

| Checkpoint | Feedback or finding | Resulting requirement or scope decision |
| --- | --- | --- |
| Checkpoint 1 (week 7) | At the demo on 16 Nov 2026, the TA liked the application and the work so far and asked us to finish and review all documentation. | No requirement or scope change. We completed and checked all pages before the 20 Nov submission. |
| Checkpoint 1, written review (19 Nov 2026) | TA comments: (1) 1.2 mixed users and stakeholders; (2) "Approved project scope" is too vague as a source; (3) "Team decision" sources should be tracked in 2.5; (4) mostly High priorities are acceptable. | (1) 1.2 split into Users and Stakeholders; (2) sources now point to Project Scope 1.3; (3) team decisions recorded in 2.5 (NF-01 to NF-08); (4) no change. |
| Checkpoint 2 (week 14) | Not held yet. | --- |


