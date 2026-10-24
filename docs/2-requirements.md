# 2. Requirement Analysis

**Objective:** Derive identifiable, prioritized, and verifiable requirements from the approved project scope. The requirements may evolve; by the final submission, they must reflect the agreed application. Sources, decisions and links in course examples are teaching scenarios, not project records.

---

## 2.1 Functional Requirements

**Objective:** State what the application must do for its users, where each capability comes from, and what observable result counts as acceptance. what the system does

| ID | Description | Priority | Source | Acceptance criteria |
| :--- | --- | :---: | --- | --- |
| F-000 | [Observable capability] | [High/Medium/Low] | [Approved task / stakeholder request / feedback] | [Observable result] |
| F-001 | Users can authenticate via OAuth 2.0 (external provider such as Google). | High | Approved project scope | After successful OAuth 2.0 authentication, the user is redirected to the home screen and the navigation bar shows the user's display name. If the user cancels at the provider's consent screen, the login screen is shown and no session is created. |
| F-002 | Pet Owners can create, view, edit, and delete pet profiles with photos and notes. | High | Approved project scope | After saving a new pet profile (name, species, breed, age, notes, photo), the pet appears in the owner's pet list. Edited values are shown after saving. A deleted pet no longer appears in the list. |
| F-003 | Pet Owners can search for helpers by location, service type, price range, and availability. | High | Approved project scope | After the owner enters search criteria, the result list contains only helpers that match all entered criteria. If no helper matches, a message stating that no results were found is shown. |
| F-004 | Search results are displayed on an interactive map showing nearby helpers. | High | Approved project scope | Each helper in the result list is shown as a marker on the map. Selecting a marker displays the helper's name, service type, and rate. |
| F-005 | Pet Owners can view a helper's availability calendar and send a booking request for a specific date range. | High | Approved project scope | The calendar shows available and blocked dates. After the owner selects an available date range and a service type and submits the request, the booking appears in the owner's booking list with the status Pending. Blocked dates cannot be selected. |
| F-006 | Pet Helpers can accept or decline booking requests after reviewing the owner's profile and ratings. | High | Approved project scope | The request view shows the owner's profile and past ratings. After Accept, the booking status is Approved for both parties and the requested dates are marked unavailable in the helper's calendar. After Decline, the status is Declined, the dates remain available, and the owner sees the new status. |
| F-007 | On booking approval, the system creates Google Calendar events for both parties with reminders before start and end. | High | Approved project scope | After approval, an event containing the start time, end time, and handover address appears in the Google Calendar of both users, with a reminder before the start and a reminder before the end. |
| F-008 | Both parties confirm the start of service, either via QR code scan or a Confirm button (helper chooses method). | High | Approved project scope | The helper selects QR code or Confirm button when initiating the step. With QR, one party displays the code and the other scans it. The booking status changes from Approved to In Progress only after both parties have confirmed; until then it remains Approved. |
| F-009 | Both parties confirm the completion of service, either via QR code scan or a Confirm button (helper chooses method). | High | Approved project scope | The helper selects QR code or Confirm button when initiating the step. The booking status changes from In Progress to Completed only after both parties have confirmed; until then it remains In Progress. |
| F-010 | After completion, both parties rate and review each other. | Medium | Approved project scope | After submission, a rating from 1 to 5 stars and the review text appear on the reviewed user’s profile. The rating form is available only for bookings with the status Completed, and each party can submit one review per booking. |
| F-011 | Pet Helpers can create and manage service listings with photos, description, rate, and availability. | High | Approved project scope | After saving a listing with service type (sitting, walking, or feeding), description, photos, rate, and availability, it appears in owner search results matching its data. Edits are visible after saving. A deleted listing no longer appears in search results. |
| F-012 | Pet Helpers can block specific dates on their availability calendar. | High | Approved project scope | Dates blocked by the helper are shown as unavailable in the helper's calendar and in the owner's view of that calendar, and cannot be selected in a booking request. Unblocking a date makes it selectable again. |
| F-013 | Pet Helpers can view their booking history and a summary of total earnings from completed bookings. | Medium | Approved project scope | The history lists each booking with date range, owner, service type, and status. The earnings summary shows the sum of the rates of bookings with the status Completed; Pending, Declined, and In Progress bookings are not included. |
| F-014 | Administrators can verify new user profiles (approve or reject). | High | Approved project scope | The admin panel lists profiles awaiting verification. After Approve, the profile is shown as verified; after Reject, it is shown as rejected. The affected user can see the resulting status. |
| F-015 | Administrators can moderate service listings. | High | Approved project scope | The admin panel lists service listings. After an administrator removes a listing, it no longer appears in search results and the helper sees that it has been removed. |
| F-016 | Administrators can resolve disputes by reviewing booking history and chat records. | High | Approved project scope | For an open dispute, the admin panel shows the booking history and the chat messages of the related booking. After the administrator records an outcome (account warning, suspension, or note), the dispute status changes to Resolved and the outcome is stored with the dispute. |
| F-017 | Both parties can exchange text messages within a booking. | Medium | Approved project scope | A text message sent by one party of a booking appears in the booking's message thread of the other party. The thread is accessible only to the two parties of that booking and, during a dispute, to the administrator. |

**High** - core booking flow and to anything that makes the platform trustworthy

**Medium** - features that support the flow but aren’t needed for it to work
	

---

## 2.2 Non-Functional Requirements

**Objective:** Specify the important quality properties and operating conditions of the approved application in a way the team can reasonably check. how well it does it and under what conditions

| ID | Description | Priority | Source |
| :--- | --- | :---: | --- |
| NF-01 | Search results are returned within 3 seconds under normal conditions. Check: measure the response time of a set of sample searches on the deployed application with a test data set (100 helpers). | High | Team decision |
| NF-02 | A map with up to 100 helper markers loads all markers and stays responsive to panning and zooming. Check: load a test data set of 100 markers and pan and zoom the map. | Medium | Team decision; ToolShare assignment (map display) |
| NF-03 | All client-server traffic uses HTTPS. Any stored passwords are hashed, and stored OAuth tokens are encrypted. Check: inspect the deployed configuration and the database contents. | High | Team decision |
| NF-04 | Authentication uses OAuth 2.0, and a session expires after a period of inactivity (30 min). Check: remain inactive beyond the timeout and attempt a protected action. | High | ToolShare assignment (OAuth 2.0 login); team decision |
| NF-05 | The mobile application is usable on common Android screen sizes, and the admin panel is usable in desktop browsers. Check: run the application on several emulated Android screen sizes and in at least two desktop browsers. | Medium | Team decision |
| NF-06 | If creating a Google Calendar event fails, the system retries three times, and the booking stays Approved. Check: simulate a failed API call and observe the retry and the booking status. | Medium | ToolShare assignment (Google Calendar integration); team decision |
| NF-07 | Deleting an account removes the user’s personal data (GDPR-aligned); booking records shared with other users are kept in anonymized form. Check: delete a test account and verify that no personal data remains in the database. | High | GDPR (right to erasure); team decision |
| NF-08 | External APIs (Google Maps, Google Calendar, QR Code API) are accessed only through service-layer abstractions. Check: code review of the service layer. | Medium | Team decision |

Performance, Security, Usability, Reliability, Privacy, Maintainability


## 2.3 Stakeholders and Actors

**Objective:** Identify roles that affect requirements and distinguish stakeholders from actors who interact with the application.

| Role or actor ID | Relation to the system | Relevant requirements |
|---|---|---|
| A-01 | **Pet Owner**: needs care for a pet; uses the mobile application to manage pet profiles, search for helpers, book services, confirm service steps, message the helper, and review the helper. | F-001, F-002, F-003, F-004, F-005, F-007, F-008, F-009, F-010, F-017 |
| A-02 | **Pet Helper**: offers pet care services; uses the mobile application to manage listings and availability, handle booking requests, confirm service steps, message the owner, view history and earnings, and review the owner. | F-001, F-006, F-007, F-008, F-009, F-010, F-011, F-012, F-013, F-017 |
| A-03 | **Administrator**: oversees the platform; uses the web admin panel only to verify users, moderate listings, and resolve disputes. | F-001, F-014, F-015, F-016 |
| A-04 | External systems (Google Maps, Google Calendar, QR Code API, OAuth provider): supporting systems used by the application; not primary actors. | F-001, F-004, F-007, F-008, F-009 |
| Course staff | Stakeholders who review the project and its documentation; not actors in the application. | None |




---

## 2.4 Constraints and Assumptions

**Objective:** Record project-specific boundaries and assumptions that affect requirements or design, including their source and practical consequence. This is their authoritative location.

| ID | Constraint or assumption | Source | Consequence or way to verify |
| --- | --- | --- | --- |
|  |  |  |  |

<details>
<summary><strong>Constraints versus assumptions</strong></summary>

A constraint is a restriction the team must respect; an assumption is a condition it relies on and should revisit.

**Example — Crisis Guard design context:**

| ID | Constraint or assumption | Source | Consequence or way to verify |
| --- | --- | --- | --- |
| C-01 | Approved task requires OAuth sign-in for editing a user's own reports. | Approved task **in this example scenario** | Design protected editing around the chosen provider; verify both authorized and unauthorized requests. |
| AS-01 | Reports used for the map have usable coordinates. | Data assumption **in this example scenario** | Inspect sample and imported reports; plan how to display reports without valid coordinates. |

**Constraint versus assumption:** C-01 identifies a binding decision and its architectural effect; AS-01 is testable and may prove false. Do not copy C-01 if OAuth is absent from the actual approved task. Explain the design response in the architecture without copying this table.

</details>

---

## 2.5 Significant Requirement Changes

**Objective:** Preserve the reason for changes that alter agreed scope, priority, or acceptance criteria, while keeping the current requirements above up to date.

| Date | Requirement ID | Change and reason | Agreed with / evidence |
| --- | --- | --- | --- |
|  |  |  |  |

<details>
<summary><strong>Recording a significant change</strong></summary>

**Example scenario — a decision during a Crisis Guard review:**

| Date | Requirement ID | Change and reason | Agreed with / evidence |
| --- | --- | --- | --- |
| [Date of review] | F-004, NF-01 | Add manual location selection when browser geolocation is denied; without it, a citizen cannot submit a located report. | [Link to the team's actual review note or issue] |

**Reason for the change:** It names the affected records and explains the user-facing reason, then points to the decision's evidence. The review and change are **constructed examples**, not events attributed to the published project. Update the current requirements after a real decision; a wording fix needs no log entry. Keep the current task queue in the issue tracker.

</details>

---

## 2.6 Requirement Traceability

**Objective:** Show where important requirements are described in use cases, where relevant, and where they are checked.

| Requirement ID | Use case or design location | Test or verification location |
| --- | --- | --- |
| F-001 | [UC-001] | [ST-001, CT-001] | [Passed / Failed / Pending – reason] |
|  |  |  |

<details>
<summary><strong>Linking requirements, use cases, and tests</strong></summary>

**Example — Crisis Guard requirement links:**

| Requirement ID | Use case or design location | Test or verification location |
| --- | --- | --- |
| F-001 | UC-001 Register account | T-04 Valid registration; T-05 Existing email |
| F-004 | UC-002 Submit disaster report | T-01 Valid report; T-02 Missing location |
| NF-01 | Report location fallback | T-03 Denied geolocation permission |

**Coverage and evidence:** F-004 leads to a user interaction and two concrete checks. NF-01 refers to the **adapted example requirement above**, not to the nine original NF rows; it leads to a check without inventing a separate use case. UC-002 and T-01–T-03 are example identifiers, not existing Crisis Guard documents or executed tests. In your project, link the actual use cases and checks here, and mark a missing link *pending* with a reason. Record observed test results with the tests; this table identifies where to find them.

</details>

---

## 2.7 Review of Requirements

**Objective:** Record meaningful feedback on requirements and the resulting decisions at the two formal project checkpoints, in weeks 7 and 14.

| Checkpoint | Feedback or finding | Resulting requirement or scope decision |
| --- | --- | --- |
| Checkpoint 1 (week 7) | [Feedback] | [Decision; see 2.5] |
| Demo 2 (week 11) | [Feedback] | [Decision; see 2.5] |  |  |  |

<details>
<summary><strong>Recording decisions from a review</strong></summary>

**Example scenario — review of a Crisis Guard requirement:**

| Checkpoint | Feedback or finding | Resulting requirement or scope decision |
| --- | --- | --- |
| Week 7 (example) | The demonstration reveals that denying browser location access prevents report submission. | Agree on a manual location fallback; update F-004 and the example NF-01 and record the reason in §2.5. |

**Decision linked to feedback:** It connects observed behavior to a specific requirement change and avoids minutes of the entire meeting. The entry is **not a historical Crisis Guard milestone**. Write only actual feedback and decisions for this team's two formal checkpoints, weeks 8 and 14. Consultation in another week does not create an additional required submission.

</details>
