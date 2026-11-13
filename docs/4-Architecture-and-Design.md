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

| Decision | Alternative considered | Project-specific rationale and trade-off |
| --- | --- | --- |
|  |  |  |

Explain the main architectural choices without repeating the technologies list. If an important choice has an ADR, its ID in the table is enough.

<details>
<summary><strong>Explaining a choice </strong></summary>

**Example — Crisis Guard:**

| Decision | Alternative considered | Project-specific rationale and trade-off |
| --- | --- | --- |
| Browser client and one backend API | Several separately deployed backend services | The client displays the map while the backend validates and stores reports. One backend is manageable for this scope; its failure may interrupt report operations. See ADR-01 for the reasoning. |
| Relational storage for reports | Document-oriented storage | Reports have identifiable links to users and locations. A relational schema makes these relationships explicit but requires migrations when the schema changes. |

**Analysis of the example:** Both decisions state a reason tied to the reporting application and acknowledge a trade-off. The backend choice links to ADR-01 rather than repeating the full comparison. Modules within one deployable backend are not separate microservices. In your own table, include alternatives that the team genuinely considered.

</details>

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

**ER diagram:** [Embed the project's readable diagram.]  
**Diagram source:** [Link to its versioned source.]  
**Implementation:** [Indicate where the corresponding data model is defined in the project.]

<details>
<summary><strong>One flood report and its related data</strong></summary>

**Example — Crisis Guard:** Ana submits flood report `R-104` using her citizen account. She selects a location on the map and records the severity as high. A citizen may submit several reports; each report belongs to one disaster category, such as *Flood*. The application stores the report and its coordinates. Map tiles come from an external provider and are not entities in the application's data model.

![Crisis Guard data ER diagram](./assets/diagrams/4-2-crisis-guard-data-ERD.svg)  
[PlantUML source](./puml/4-2-crisis-guard-data-ERD.puml)

**Analysis of the example:** `R-104` has one author and one category; Ana and the *Flood* category can each be linked to more reports. The diagram shows relationships without copying a database's columns or writing a second table description for every entity. If your application also accepts **anonymous** reports, represent that possibility in the relationship to `Citizen`. If categories are fixed values rather than stored records, do not invent a category table. Compare the final ER diagram with the persistence model and explain only differences that matter to understanding the project.

</details>

### 4.3.2 Representative UML Class Diagram

**Objective:** Before implementing a representative part of the system, model the classes or interfaces needed to assign responsibilities, operations, and relationships. Revise the design when those choices change.

**Class diagram:** [Embed a readable UML class diagram for a representative part of the design.]  
**PlantUML source:** [Link to the matching versioned `.puml` file.]  
**Code reference at the final review:** [Link to the corresponding implementation.]

<details>
<summary><strong>Designing report responsibilities and allowed changes</strong></summary>

**Example — Crisis Guard:** A report owns the rules for changing its status. A workflow class coordinates submission and review, while a repository interface describes the persistence operations it needs. The diagram proposes these responsibilities before implementation.

![Crisis Guard domain class diagram](./assets/diagrams/4-3-crisis-guard-domain-CD.svg)  
[PlantUML source](./puml/4-3-crisis-guard-domain-CD.puml)

**Analysis of the example:** `DisasterReport` owns its allowed state changes, so the workflow cannot silently approve a rejected report. `ReportWorkflow` coordinates an operation without owning the report's transition rules; `ReportRepository` defines the storage operations it needs. The `Location` composition and selected types show relationships useful to the design. The diagram intentionally omits database columns and unrelated classes: the ER model explains stored data, while this diagram assigns program responsibilities and operations. These classes are a design choice, not required layers for every team. Compare the finished implementation with the original design and revise the diagram where decisions changed; generating a diagram from code at the end cannot substitute for this initial modeling.

</details>

## 4.4 Runtime Behavior

**Objective:** Explain one important interaction among running parts and the lifecycle of one meaningful object. Choose cases that expose decisions or failure paths instead of making a diagram for every CRUD action.

### 4.4.1 Representative UML Sequence Diagram

**Objective:** Show the order of messages for one representative scenario and the responses to a meaningful alternative.

**Scenario:** [Name the interaction; add the UC ID if one exists.]  
**Sequence diagram:** [Embed a readable UML sequence diagram.]  
**PlantUML source:** [Link to the matching versioned `.puml` file.]

<details>
<summary><strong>Location selection, validation, and report submission</strong></summary>

**Example — Crisis Guard:** A citizen submits a disaster report after choosing a location manually or requesting the device's position. The interaction also shows what happens when location permission is denied, report data is invalid, or storage fails.

![Crisis Guard report submission sequence diagram](./assets/diagrams/4-4-crisis-guard-report-submission-SD.svg)  
[PlantUML source](./puml/4-4-crisis-guard-report-submission-SD.puml)

**Analysis of the example:** The two location paths and the validation and storage alternatives have different consequences for the user; compare them with the matching use case and its alternative flows. The browser location API is a browser capability; the web client, API, service, and store correspond to the component view. Select branches that help explain your project's scenario, and revise the final diagram to match the implemented interaction.

</details>

### 4.4.2 Representative UML State Diagram

**Objective:** Show the meaningful states of one domain object or an explicitly managed system mode, and the events or conditions that change it.

**State owner and reason for choosing it:** [Name the object or system mode, how its state is recognized, and why the transitions matter.]  
**State diagram:** [Embed a readable UML state diagram.]  
**PlantUML source:** [Link to the matching versioned `.puml` file.]

<details>
<summary><strong>Operating modes and service availability</strong></summary>

**Example — Crisis Guard:** The crisis coordination mode changes as an disaster is assessed and resolved. At the same time, the user-visible availability of the application may change independently when the map provider or backend becomes unavailable.

![Crisis Guard report state machine diagram](./assets/diagrams/4-5-crisis-guard-report-SM.svg)  
[PlantUML source](./puml/4-5-crisis-guard-report-SM.puml)

**Analysis of the example:** The two regions describe independent aspects of the modeled system: its crisis coordination mode and observed service availability. They run in parallel; an active crisis may coincide with normal or limited service. The branches after backend recovery account for a map provider that may still be unavailable. State transitions have named triggers or guards rather than being a list of screens. Use this form only if your application actually maintains or reliably derives both kinds of state. A project whose meaningful lifecycle belongs to a report, reservation, or order should model that object instead; diagram complexity is not an assessment criterion. At the final review, check the state model against the behavior the running application supports.

</details>

## 4.5 Architecture Decision Records

**Objective:** Preserve the reasons for consequential architectural choices so a future developer can understand what was decided, what alternative was considered, and which trade-off the team accepted.

**Decision index:** [List important architectural decisions in one place. A short row is sufficient for a straightforward decision.]

| ID | Date | Decision | Alternative considered | Rationale and trade-off | Status |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |

**Detailed ADR, when the decision needs more explanation:**

### ADR-[ID]: [Decision title]

| Field | Record of the decision |
| --- | --- |
| Context and goal | [Which architectural problem made this decision necessary?] |
| Decision criteria | [What actually mattered to the team?] |
| Alternatives considered | [Realistic options the team weighed, briefly.] |
| Decision and rationale | [Chosen option, why it won, and what is given up.] |
| Status | [Proposed, accepted, or superseded; link to the replacement when applicable.] |

Write an ADR only for a choice whose rationale will matter after the implementation changes. A significant change of decision can be recorded as a new ADR that supersedes the old one; routine tool choices do not need detailed records. Changes to agreed scope belong with requirements and their change history; feedback on a task stays with its issue.

<details>
<summary><strong>Choosing one backend instead of separately deployed services</strong></summary>

**Example — Crisis Guard, ADR-01:**

| ID | Date | Decision | Alternative considered | Rationale and trade-off | Status |
| --- | --- | --- | --- | --- | --- |
| ADR-01 | [Date of decision] | One backend API for report handling | Separate deployable report and resource services | Lower deployment and integration effort for the approved scope; a failure of the backend can affect both features. | Accepted |

### ADR-01: One backend API for report handling

| Field | Record of the decision |
| --- | --- |
| Context and goal | The team must deliver and publicly deploy reporting and a map-oriented view during one semester. |
| Decision criteria | The team can build, integrate, deploy, and explain the solution; components still have identifiable responsibilities. |
| Alternatives considered | **One backend:** modules share a deployable application. **Separate services:** each can run independently, but they require additional integration and deployment work. |
| Decision and rationale | Choose one backend, with distinguishable report responsibilities inside it. This limits deployment work but accepts that a failure of this backend may affect report operations together. |
| Status | Accepted. |

**Analysis of the example:** The solution strategy states the current approach; ADR-01 preserves the alternatives and criteria that led to it. The component and deployment diagrams should reflect the chosen approach as it develops. A separate ADR is useful for a consequential decision, not for every tool choice.

</details>

## 4.6 Crosscutting Concepts

**Objective:** Identify an important mechanism or design rule that applies to several parts of the application, describe where it is planned to apply, and update the explanation as the implementation takes shape. Include only concepts that matter to this project.

| Concern | Mechanism and where it applies | Evidence in the final implementation |
| --- | --- | --- |
|  |  |  |

<details>
<summary><strong>Describing a shared rule through its implementation</strong></summary>

**Example — Crisis Guard:**

| Concern | Mechanism and where it applies | Code or configuration reference |
| --- | --- | --- |
| System rule: authorization of report moderation | The backend checks the moderator's permissions before approving or rejecting a report; a login button in the client is insufficient protection. | At the final review, show the backend permission check and a test of unauthorized access. |
| Shared implementation rule: location validation | The report-submission boundary rejects missing or invalid coordinates before saving a report. | At the final review, show the validation rule and a test with invalid coordinates. |

**Analysis of the example:** The first row describes protection across the system boundary; the second describes a rule shared by report-submission paths. Choose concerns that actually affect your project.

Patterns such as Dependency Injection or Repository belong here only when the code uses them and they explain a shared design rule. “The system uses authentication” alone does not tell a reader where the check occurs or what it protects. Security, logging, and error handling need not each receive a subsection by default.

</details>

## 4.7 Architectural Risks and Technical Debt

**Objective:** State real technical or domain risks and consciously accepted design compromises, their consequences, and what the team will do about them.

**Technical risks and debt**

| Risk or compromise | Consequence | Current treatment |
| --- | --- | --- |
|  |  |  |

**Business or domain risks, if significant**

| Risk | Consequence | Current treatment |
| --- | --- | --- |
|  |  |  |

<details>
<summary><strong>Identifying a limitation without inventing production infrastructure</strong></summary>

**Example — Crisis Guard, technical risks:**

| Risk or compromise | Consequence | Current treatment |
| --- | --- | --- |
| One application instance handles report submissions. | Hosting failure temporarily prevents new reports. | Accepted within the course project; the team does not claim automatic failover. |
| External map tiles are unavailable. | The map view may fail even when stored reports remain available. | Explain the visible error or fallback that the implemented application actually provides. |

**Example — Crisis Guard, domain risk:** Readers may mistake an unverified citizen report for an official warning. The team can distinguish the report's verification status in the interface and direct readers to official channels.

**Analysis of the example:** The first technical risk accepts a realistic course-scope limitation; the domain risk concerns how a reader interprets a report. Record a limitation and a realistic response that belong to your own project. A missing mandatory feature is unfinished scope, not technical debt.

</details>

**Final consistency check:** Compare the component, data, class, sequence and state views with the implemented code, application behavior, and actual deployment. Update outdated design descriptions and explain any important difference that remains; links to relevant code or tests help when they resolve a concrete question.
