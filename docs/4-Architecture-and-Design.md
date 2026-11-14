# 4. Architecture and Design

**Objective:** Design and explain the application's boundary, main choices, parts, data, and important behavior. Start with an architecture that guides implementation; revise it when design decisions change. At the final review, the descriptions and diagrams should explain the application that was actually built.

The page contains the **UML component, class, sequence, and state diagrams** and the data model. The use case diagram describes user goals; the deployment diagram shows where the finished application actually runs. Keep a readable image and versioned PlantUML source for each UML diagram, as described on [Home](./Home.md).

The expandable Crisis Guard examples illustrate a proposed design. Use your project's own decisions and models in the completed page.

| View | Main question |
| --- | --- |
| Solution strategy | Which architectural choices were made, and why? |
| Building blocks | What are the principal parts, their responsibilities, and their external connections? |
| Data and class design | What information is stored, and how is a representative part of the code structured? |
| Runtime behavior | How do parts collaborate, and how does a meaningful object change state? |
| Architectural decisions | Why was a consequential option chosen over alternatives? |
| Crosscutting concepts and risks | Which shared mechanisms and important compromises affect the design? |

## 4.1 Solution Strategy

**Objective:** Explain the few architectural choices that most affect the solution and their project-specific reasons.

PetPals uses a React web application with Progressive Web App (PWA) capabilities, a Node.js backend, and a PostgreSQL database. The architecture is designed to support a five-person student team working within a limited development timeline.

The frontend communicates with a single backend API, which applies business rules and accesses the database. The following decisions guide the implementation.

| Decision | Alternative considered | Project-specific rationale and trade-off |
| --- | --- | --- |
| React web application with PWA capabilities (ADR-01). | Native mobile applications with a separate web client. | A shared frontend codebase supports mobile and desktop use, reducing implementation and maintenance effort for a five-person team. On supported browsers and devices, users can install the PWA on their home screen and access an app-like interface without app store approval. The trade-off is that installation behavior and access to device features depend on browser and platform support. |
| Node.js backend with Express.| A backend implemented in another language, such as Java or Python. | Using JavaScript across the frontend and backend reduces language switching and makes it easier for team members to contribute across application layers. It also simplifies coordination of API data formats. The trade-off is that using the same language does not remove the need for explicit API contracts, server-side validation, and careful handling of asynchronous operations. |
| PostgreSQL for persistent application data (ADR-02). | A document-oriented database such as MongoDB. | Users, pets, bookings, and reviews have clear relationships. Foreign keys, constraints, and transactions support consistent data and reliable booking operations. Preventing double-bookings requires availability checks combined with suitable database constraints or transaction-level concurrency control. The trade-off is the need to maintain a structured schema and database migrations. |
| A modular monolithic backend. | Independently deployed microservices. | A single backend application is easier to develop, test, deploy, and manage within the team's size and course timeline. Internal modules separate responsibilities without introducing communication between independently deployed services. The trade-off is that backend modules are deployed and scaled together. |

## 4.2 Building Blocks and UML Component Diagram

**Objective:** Propose the principal parts of the application, assign their responsibilities, and show their dependencies without diagramming every file or class. Revise this view as the system takes shape.

PetPals consists of one React PWA client, one Node.js API and one PostgreSQL database. The client serves all three roles (Pet Owner, Pet Helper and Administrator) and shows different views depending on the signed-in user's role. The API applies the business rules and is the only part that accesses the database. Four external systems (Google OAuth 2.0, Google Maps API, Google Calendar API and the QR Code API) lie outside the system boundary.

**Component diagram:**

![PetPals system component diagram](./assets/diagrams/4-2-petpals-system-CMP.svg)  
**PlantUML source:** [4-2-petpals-system-CMP.puml](./puml/4-2-petpals-system-CMP.puml)

| Component | Responsibility | Reason for this boundary |
| --- | --- | --- |
| React PWA | Shows the interface for all three roles: sign-in, pet profiles, listings, map search, booking requests and confirmations, messages, reviews and the administrator views. Displays the map and sends all requests to the API. | User interaction and map display run in the browser, while the rules that must not be bypassed stay on the server. One installable client serves all roles and reduces effort for the team (ADR-01). |
| Node.js API | Receives HTTPS requests from the client, checks the user's role and verification status, applies the business rules and reads and writes the database. | Rules such as who may send a booking request or confirm a service are enforced in one place and cannot be bypassed from the client. A single modular application is simpler to develop and deploy for the team than separate services. |
| Users & Verification | Signs users in through Google, keeps profiles and pet profiles, and records the administrators' approval or rejection and suspensions. | Account status decides what every other module may do, so it has a clear owner. |
| Listings & Search | Stores service listings and availability, including blocked dates, and finds helpers by location, service type, price and dates. | Search and availability have their own rules (location, service type, price and dates) and are a distinct responsibility from handling bookings. |
| Bookings & Confirmations | Creates booking requests, applies the helper's decision, reserves the time slot so that bookings do not overlap, and records the two-sided start and completion confirmation (QR code or button). | The booking lifecycle (see the state diagram in 4.4.2) and the overlap check belong together, because both change the booking status. |
| Messages & Reviews | Stores the messages of a booking and the ratings and reviews after completion. | Both belong to one booking and only its two participants may create them. |
| Disputes & Moderation | Records disputes, lets administrators review the booking records, record decisions and remove listings. | Administrator actions are separate from the everyday user flows and need wider access to booking data. |
| External Service Adapters | Contains the clients for Google OAuth, Google Calendar and the QR Code API and hides their details from the other modules. | External integrations sit behind one service layer (NF-08, C-04). A failure of an external call, such as a Calendar event that cannot be created, must not break the booking (NF-06). |
| PostgreSQL | Stores users, pets, listings, availability, bookings, confirmations, messages, reviews, disputes and calendar event records. | The data is highly relational, and constraints and transactions help to keep it consistent, for example to prevent double bookings (ADR-02). Only the API accesses it. |
| Google OAuth 2.0 | Authenticates users with their Google account. | The application does not need to store passwords. Identity is provided by an external system outside the boundary. |
| Google Maps API | Supplies the map and markers shown in the client. | The map is rendered in the browser, so the client calls Google Maps directly. The Node.js API only stores the coordinates. |
| Google Calendar API | Creates calendar events with reminders for both participants once a booking is accepted. | A user's calendar is outside the application. Access needs the user's separate consent. |
| QR Code API | Creates the QR image for a booking's start or completion confirmation. | Image generation is an external service. The API keeps the confirmation attempt and its token record. |

The outer boundary separates the PetPals system from the four external systems. The Node.js API is one application: the modules inside it are logical modules with separate responsibilities, not separately deployed services. The arrows summarize dependencies and are not the order of a transaction. The order of messages for a booking is shown in the sequence diagram in 4.4.1.


## 4.3 Data and Detailed Design

**Objective:** Explain the important information the application stores and one representative area of class-level design. The data model and UML class diagram answer different questions; one does not replace the other.

### 4.3.1 ER Diagram and Data Model

**Objective:** Show the important stored entities, their identifiers and relationships, and enough attributes to explain the application's data. The ER diagram is separate from the representative UML class diagram below.

**ER diagram:**

![PetPals data ER diagram](./assets/diagrams/4-3-1-petpals-data-ERD.svg)    
**Diagram source:** [4-3-1-petpals-data-ERD.puml](./puml/4-3-1-petpals-data-ERD.puml)    
**Implementation:** The columns, types and rules of every table are described in the [database design](./database.md). The schema definition and migrations will be linked here once the implementation exists.

A booking is the central record. It links one service listing, one pet owner and one pet; the helper is reached through the listing. Confirmations of the service start and completion, messages, reviews, disputes and calendar event references each belong to one booking. Users of all three roles share one users table with a role column. Administrative actions (admin_actions) refer to the affected user and, where relevant, to a dispute or a listing. A dispute has its own status and does not change the booking status. Records that bookings refer to are not deleted: a removed listing is hidden and a deleted account is anonymized (NF-07).

The diagram shows keys and the attributes needed to understand the relationships. All columns, types and rules are in the database design; optional links to the reviewing administrator are omitted.


### 4.3.2 Representative UML Class Diagram

**Objective:** Before implementing a representative part of the system, model the classes or interfaces needed to assign responsibilities, operations, and relationships. Revise the design when those choices change.

**Class diagram:**

![PetPals booking class diagram](./assets/diagrams/4-3-2-petpals-booking-CD.svg)  
**PlantUML source:** [4-3-2-petpals-booking-CD.puml](./puml/4-3-2-petpals-booking-CD.puml)    
**Code reference at the final review:** team to add the link to the implementation of the booking module

The representative part is the booking lifecycle (requesting, the helper's decision and the two-sided confirmation of start and completion). It is the same flow as in 4.4.1 and 4.4.2 and lies in the Bookings & Confirmations module of 4.2.
 
`Booking` owns the rules for changing its status, so a declined booking cannot be accepted and a booking that never started cannot be completed. `BookingConfirmation` models one confirmation attempt and reports whether both participants have confirmed. `BookingService` coordinates the use cases (UC-006, UC-007, UC-009) without owning those rules: it checks permissions, asks `BookingRepository` to reserve the time slot atomically (ADR-02), saves the booking, and uses the calendar and QR code interfaces. These interfaces keep Google Calendar and the QR Code API behind the service layer (NF-06, NF-08). The stored status value is `accepted`; the interface shows it as "Approved".
 
The diagram omits database columns and unrelated classes; the ER diagram covers the stored data. It is a design made before implementation and is revised if the code differs.



## 4.4 Runtime Behavior

**Objective:** Explain one important interaction among running parts and the lifecycle of one meaningful object. Choose cases that expose decisions or failure paths instead of making a diagram for every CRUD action.

PetPals uses a booking-centered workflow to coordinate interactions between Pet Owners and Pet Helpers. The following UML diagrams describe the proposed runtime behavior of the system, based on the functional requirements, use cases, and database design.

The Sequence Diagram illustrates the communication between the React Progressive Web Application (PWA), Node.js backend, PostgreSQL database, and Google Calendar API during a representative booking scenario.

The State Diagram describes the lifecycle of a booking, including the conditions required for each state transition and the handling of incomplete or unsuccessful operations.

These diagrams represent the planned system architecture and may be updated as implementation decisions are finalized.

### 4.4.1 Representative UML Sequence Diagram

**Objective:** Show the order of messages for one representative scenario and the responses to meaningful alternatives.

**Selected scenario:** Booking request, helper acceptance or rejection, Google Calendar synchronization, and two-sided service start confirmation.

The selected scenario covers the following use cases:

- UC-006: Submit Booking Request
- UC-007: Accept or Decline Booking
- UC-009: Confirm Service Start
- UC-010: QR Code Confirmation (alternative method)

**Sequence Diagram:**

![PetPals Booking Lifecycle Sequence Diagram](./assets/diagrams/4-4-1-booking-lifecycle-sequence.svg)

**PlantUML source:** [4-4-1-booking-lifecycle-sequence.puml](./puml/4-4-1-booking-lifecycle-sequence.puml)

#### Booking Request

The booking process begins when a Pet Owner selects a service listing, a pet, the requested service period, and a handover address through the React PWA.

The application submits the booking request to the Node.js API. The backend uses PostgreSQL to validate the user's approval status, pet ownership, service listing eligibility, and requested availability.

If the request is invalid or the requested period is unavailable, the backend rejects it with an appropriate reason, and no booking is created.

Otherwise, the system creates a new booking with the database status `requested` and returns a successful response to the application.

#### Helper Decision

The Pet Helper reviews the booking request and chooses whether to accept or decline it.

If the helper declines, the backend verifies that the helper is authorized and that the booking is still in the `requested` state. The booking status is then updated to `declined`.

If the helper accepts, the backend verifies authorization and atomically reserves the requested time slot. Atomic reservation is necessary to prevent overlapping bookings for the same helper and time period.

When acceptance succeeds, the booking status changes to `accepted`. The user interface may display this status as "Approved", depending on the final terminology selected by the team.

If the helper is unauthorized, the request is no longer eligible for acceptance, or the selected period conflicts with an existing reservation, the acceptance operation is rejected without committing a conflicting reservation.

#### Google Calendar Synchronization

After successful booking acceptance, the backend attempts to create Google Calendar events for participants who have granted calendar authorization.

The events contain relevant booking information, and the backend records synchronization results or errors in the `calendar_events` table.

Calendar synchronization is independent of the booking acceptance process. If event creation fails, the booking remains in the `accepted` state.

A failed event creation is retried three times and then recorded as `failed` (NF-06).

#### Service Start Confirmation

The service start confirmation process begins when the booked Pet Helper initiates a Start confirmation attempt through the application.

In the button-based method, the backend creates a pending confirmation attempt with an expiration time.

The Pet Helper submits their confirmation, followed by the Pet Owner. The backend verifies that both confirmations belong to the same unexpired attempt.

If both confirmations are valid, the confirmation attempt is marked as `confirmed`, and the booking transitions from `accepted` to `in_progress`.

If a confirmation is missing, incomplete, or expired, the booking remains in the `accepted` state.

QR code confirmation is an alternative method. The helper displays a QR code, and the Pet Owner scans it to participate in the confirmation process. The same two-participant confirmation requirement applies.

#### Alternative and Failure Paths

The Sequence Diagram includes several important alternative and failure paths:

- Invalid or unavailable booking requests are rejected without creating a booking.
- The helper can decline the booking, moving it to the `declined` state.
- Unauthorized acceptance or reservation conflicts prevent successful booking approval.
- Google Calendar synchronization failures do not reverse an accepted booking.
- Incomplete or expired service start confirmations do not advance the booking to `in_progress`.

The selected scenario concludes when both participants successfully confirm the service start and the booking enters the `in_progress` state.

Service completion is represented in the State Diagram.

### 4.4.2 Representative UML State Diagram

**Objective:** Show the meaningful states of one domain object or an explicitly managed system mode, and the events or conditions that change it.

**Selected domain object:** Booking

The Booking object is central to the PetPals workflow because it connects Pet Owners, Pet Helpers, service listings, and the confirmation process.

The persistent booking state is stored in the `bookings.status` field. It determines which operations are permitted at each stage of the service lifecycle.

The State Diagram illustrates the five defined booking states and the conditions required to transition between them.

**State Diagram:**

![PetPals Booking Lifecycle State Diagram](./assets/diagrams/4-4-2-booking-lifecycle-state.svg)

**PlantUML source:** [4-4-2-booking-lifecycle-state.puml](./puml/4-4-2-booking-lifecycle-state.puml)

#### Booking States

The booking lifecycle contains five persistent states:

| State | Description |
| --- | --- |
| `requested` | A valid booking request has been submitted and is awaiting the Pet Helper's decision. |
| `accepted` | The Pet Helper accepted the request, and the requested service time slot was successfully reserved. |
| `declined` | The Pet Helper rejected the booking request. This is a terminal state. |
| `in_progress` | Both participants successfully confirmed the start of the service. |
| `completed` | Both participants successfully confirmed service completion. This is a terminal state. |

The `declined` and `completed` states are terminal because no additional booking state transitions are defined after reaching them.

#### State Transitions

**Requested to Accepted**

The Pet Helper accepts a pending booking request.

The backend verifies that the decision comes from the authorized helper and that the booking can still be accepted.

The requested time slot must be reserved atomically to prevent overlapping reservations.

The transition succeeds only when all required conditions are satisfied.

**Requested to Declined**

The authorized Pet Helper rejects the booking request.

The booking enters the `declined` state and cannot proceed to service start or completion confirmation.

**Accepted to In Progress**

The booked Pet Helper initiates a Start confirmation attempt using either the QR code method or in-app buttons.

Both the Pet Owner and Pet Helper must confirm the same unexpired attempt.

Once both confirmations are valid, the booking transitions from `accepted` to `in_progress`.

A one-sided, incomplete, or expired attempt does not advance the booking.

**In Progress to Completed**

The Pet Helper initiates the service completion confirmation process using either QR codes or in-app buttons.

Both participants must confirm the same unexpired Completion attempt.

After successful validation, the booking status changes from `in_progress` to `completed`.

Incomplete or expired confirmation attempts leave the booking in the `in_progress` state.

#### Validation and Business Rules

The booking lifecycle is subject to several important validation and business rules.

Only approved and unsuspended users may submit valid booking requests.

The selected pet must belong to the requesting Pet Owner, and the requested service listing and time period must be valid and available.

Invalid requests are rejected before creating a booking.

The acceptance operation requires atomic time-slot reservation to prevent conflicting bookings for the same helper.

Google Calendar synchronization occurs after booking acceptance and does not control the booking state. A failed synchronization attempt does not reverse acceptance.

Both service start and service completion require valid confirmations from both participants on the same unexpired confirmation attempt.

Reviews are permitted only after the booking reaches the `completed` state. Both participants may leave a review according to the system's review rules.

#### Independent Status Fields

PetPals manages several related processes using status fields that are independent of the booking lifecycle.

**Booking confirmations**

The `booking_confirmations.status` field tracks the state of individual confirmation attempts:

- `pending`
- `confirmed`
- `expired`

**Google Calendar synchronization**

The `calendar_events.sync_status` field tracks calendar event synchronization:

- `pending`
- `synced`
- `failed`

**Dispute management**

The `disputes.status` field tracks dispute resolution:

- `open`
- `resolved`

These statuses are not additional booking lifecycle states.

For example, a booking can remain `accepted` even if its Google Calendar synchronization fails. Similarly, an expired Start confirmation attempt does not automatically change the booking status.

Disputes are managed independently and do not directly introduce new booking states.

#### Known Limitations

Cancellation, no-show handling, and rescheduling transitions are not currently defined in the database draft and are therefore not represented as booking states in this diagram.

Any future changes to these workflows should be reflected consistently in the database model, application logic, and UML diagrams.

The diagrams document the proposed architecture rather than a completed or fully tested implementation.

## 4.5 Architecture Decision Records

**Objective:** Preserve the reasons for consequential architectural choices so a future developer can understand what was decided, what alternative was considered, and which trade-off the team accepted.

The following records document the architectural choices agreed for PetPals, including the alternatives and their consequences.

| ID | Date | Decision | Alternative considered | Rationale and trade-off | Status |
| --- | --- | --- | --- | --- | --- |
| ADR-01 | 2026-10-31 | Use a React web application with PWA capabilities. | Native mobile applications and a separate web client. | One frontend codebase supports mobile and desktop use and reduces development effort. Installation and device capabilities depend on browser and platform support. | Accepted |
| ADR-02 | 2026-10-31 | Use PostgreSQL for relational data storage. | A document-oriented database such as MongoDB. | Relationships, constraints, and transactions support data integrity and consistent booking operations. Schema changes require migrations, and concurrent booking requests require explicit safeguards. | Accepted |

### ADR-01: Choosing React PWA over Native Mobile

| Field | Record of the decision |
| --- | --- |
| Context and goal | PetPals must provide convenient access for pet owners and helpers on mobile devices and support desktop access, including administration. The five-person team must deliver the application within the course timeline. |
| Decision criteria | Development time, maintenance effort, mobile and desktop accessibility, and distribution simplicity. |
| Alternatives considered | Native mobile applications with a separate web client; a React web application enhanced with PWA capabilities. |
| Decision and rationale | Use React with PWA capabilities to maintain a shared frontend codebase for mobile and desktop. Responsive layouts adapt the interface to different screen sizes. On supported devices and browsers, users can install the application on their home screen without app store approval. This reduces separate platform development and release work. The accepted trade-off is that PWA installation and device integration vary across platforms and may provide fewer capabilities than a native application. |
| Status | Accepted. |

### ADR-02: Choosing PostgreSQL for Relational Data Integrity

| Field | Record of the decision |
| --- | --- |
| Context and goal | PetPals stores related information about users, pets, service listings, bookings, and reviews. Booking operations must preserve these relationships and handle concurrent requests consistently. |
| Decision criteria | Referential integrity, transactional consistency, support for relational queries, and reliable enforcement of booking rules. |
| Alternatives considered | PostgreSQL as a relational database; a document-oriented database such as MongoDB. |
| Decision and rationale | Use PostgreSQL because the application's core entities have explicit relationships that can be represented using foreign keys and constraints. Transactions allow related changes to succeed or fail together. When accepting a booking, the backend must check availability and use appropriate database constraints or concurrency control to prevent conflicting bookings from being accepted simultaneously. The accepted trade-off is the need to design and maintain the schema, migrations, and concurrency safeguards. |
| Status | Accepted. |

## 4.6 Crosscutting Concepts

**Objective:** Identify an important mechanism or design rule that applies to several parts of the application, describe where it is planned to apply, and update the explanation as the implementation takes shape. Include only concepts that matter to this project.

| Concern | Mechanism and where it applies | Evidence in the final implementation |
| --- | --- | --- |
| System rule: authentication and authorization | Users sign in with Google through the OAuth 2.0 authorization code flow: Google redirects to a callback of the Node.js API, which exchanges the code and creates the session (NF-04); a session expires after a period of inactivity. On every protected request the Node.js API checks the user's role (owner, helper or administrator), that the account is approved and not suspended, and that the user is a participant of the booking concerned. Administrator functions are available only to the administrator role. Hiding a button in the React PWA is not protection. | At the final review, show the permission check in the API and tests of unauthorized access: an unverified owner sending a booking request, an owner calling an administrator function, and a user reading the messages of a booking they do not take part in. |
| Shared rule: booking status changes | Only the Bookings & Confirmations module changes `bookings.status`, and only through the transitions of the state diagram (4.4.2): the helper's decision, and confirmation of both participants on the same unexpired attempt for the start and for the completion. Requests are validated at the API boundary before anything is saved (approved and unsuspended users, the pet belongs to the owner, start before end, available time). | At the final review, show the `Booking` transition operations and tests that an invalid transition is rejected (for example completing a booking that was never started) and that a one-sided or expired confirmation does not advance the booking. |
| System rule: no overlapping reservations | When the helper accepts a request, the API checks and reserves the time slot in one database transaction, supported by a constraint or lock in PostgreSQL (ADR-02), so two simultaneous acceptances cannot both succeed for one listing. The same availability data is used by search and by the booking request. | At the final review, show the reservation code or constraint and a test with two concurrent acceptances of overlapping requests. |
| Shared rule: access to external services | Google Calendar and the QR Code API are called only through the External Service Adapters (NF-08, C-04), and Google Maps is used only through one map component in the client. A failure of an external call does not break the booking: a failed Calendar call is retried three times and recorded as `failed` in `calendar_events` while the booking stays `accepted` (NF-06); if the QR image cannot be created, the helper can retry or use the button method (UC-010). | At the final review, show the adapters, the retry and the recorded status, and a test with a simulated failing Calendar call that leaves the booking accepted. |
| System rule: protection of personal data | All client-server traffic uses HTTPS (NF-03). The application stores no passwords; stored Google calendar credentials are encrypted or kept as a reference, and QR tokens are stored only as hashes with an expiry time. Messages and booking details are visible only to the two participants and, during a dispute, to the administrator (F-017). Deleting an account removes personal data, and booking records shared with others remain in anonymized form (NF-07). | At the final review, show the deployed HTTPS configuration, the stored token and credential fields, and a test that deleting an account removes personal data but keeps the booking record. |
| Shared rule: records kept for disputes | Confirmation attempts (also expired ones), messages, reviews and administrator actions are kept and are not overwritten. Listings removed by an administrator are hidden instead of deleted, and prices and notes are copied into the booking when it is created. An administrator decides a dispute from these records (UC-017). | At the final review, show the schema and a test that editing a listing or pet profile does not change an existing booking and that a removed listing keeps its bookings. |


## 4.7 Architectural Risks and Technical Debt

**Objective:** State real technical or domain risks and consciously accepted design compromises, their consequences, and what the team will do about them.

**Technical risks and debt**

| Risk or compromise | Consequence | Current treatment |
| --- | --- | --- |
| One Node.js API instance and one PostgreSQL database serve all users and roles. | A hosting or database failure stops all operations at once, and the traffic of all roles shares one instance. | Accepted within the course project (ADR-01, ADR-02 and the modular monolith in 4.1); the team does not claim automatic failover. The application is hosted on Render; the setup is described in the deployment guide. |
| PWA installation and device features depend on the browser and platform (ADR-01). | The installed experience may differ between phones, and a browser may not allow camera access for scanning the QR code. | The QR scan is only one method: the Confirm button method (UC-009) works without the camera. The team tests on the screen sizes and desktop browsers described in NF-05 and does not claim native-app behavior. |
| Two accepted requests could overlap if the slot reservation is not atomic. | A helper could be double-booked, which would undermine the booking record the application is built around. | The reservation runs in one transaction with a database constraint or lock (4.4.1, 4.6) and is tested with concurrent acceptances. |
| The booking lifecycle has no cancellation, no-show or rescheduling state. | A booking that is accepted but never started keeps the time slot reserved, and neither party can release it in the application. | Accepted compromise for the approved scope. Either participant can report a problem for an accepted booking (F-018) and an administrator records the decision (UC-017); the missing states are listed as known limitations in 4.4.2 and are not claimed as features. |
| Calendar events depend on Google Calendar and on the user's consent (AS-01). | Events may be missing when the call fails or access is denied. | The booking stays accepted, a failed call is retried three times and recorded as `failed` (NF-06), and the user is informed. There is no manual resynchronization in the current scope. |
| Google Maps and Google Calendar free usage limits (AS-04). | Search or calendar creation may stop when a quota is exceeded during testing or the demonstration. | The team monitors usage in the provider console, uses test data for the demonstration and checks the current limits before relying on them. |
| The rule for turning an hourly or daily rate into the recorded total price is not yet defined. | Totals and the helper's earnings summary (F-013) could be calculated inconsistently. | One rule for rounding is agreed before the price calculation is implemented and then documented here and in the database design. |
| Deleting an account must remove personal data while bookings, messages and reviews of other users keep their references (NF-07). | Rows cannot simply be deleted because other records refer to them. | Personal fields are anonymized instead of deleting the user row; the procedure is defined in the data model before implementation and checked with a test account. |

**Business or domain risks, if significant**

| Risk | Consequence | Current treatment |
| --- | --- | --- |
| Verification checks only an administrator's review of name and email; there is no background check. | Users may read "approved" as a guarantee that a helper is safe and trustworthy. | The interface and documentation describe the status as approved by an administrator after a name and email check, and the application makes no claim of background checks or guarantees (Scope 1.3). |
| Payment between owner and helper takes place outside the platform (C-02). | The platform cannot enforce or verify payment, and a disagreement about money cannot be resolved by it. | Rates and the earnings summary are described as recorded values, not financial records. A dispute decision is recorded and is not financially executed. |
| A dispute is decided from recorded data only. | Evidence outside the application, such as what happened at the handover, may be missing or contradictory. | Confirmations, messages and booking details are kept as the record (4.6), and the administrator's decision is limited to an account warning, a suspension or a recorded note (F-016). |



**Final consistency check:** Compare the component, data, class, sequence and state views with the implemented code, application behavior, and actual deployment. Update outdated design descriptions and explain any important difference that remains; links to relevant code or tests help when they resolve a concrete question.
