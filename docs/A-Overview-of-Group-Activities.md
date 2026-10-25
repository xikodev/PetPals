# A. Overview of Group Activities

**Objective:** Show how the team organized the project, assigned work, responded to important problems, and contributed to the result. Entries should describe outcomes rather than only saying that a meeting was held or a topic was discussed.

## A.1 Meeting Log

**Objective:** Keep a brief record of project meetings and weekly coordination: who participated, what was decided, and which action followed. Record a discussion that produced no decision only if it left an important issue open.

**Team member abbreviations:** MC = Marta Cekić; BK = Borna Krpan; MM = Mato Marunović; TM = Tomislav Miletić; FI = Fran Ivanković; OO = Oluwafemi Olabinjo.

| Date and participants | Main topic | Decision, action, or open question | Link to task or resulting work, if available |
| --- | --- | --- | --- |
| 12 October 2026; MC, BK, MM, TM, FI, OO ([lab 1]) | Initial ideas and choice of topic | All members get acquainted with GitHub. [MC] writes the proposal for the team's custom topic (PetPals). |  |
| 22 October 2026; MC, BK, MM, TM, FI, OO ([WhatsApp]) | Documentation approach | [MC] writes the detailed document describing the topic. The documentation files are divided among members: [BK - database plan, MM - README, TM - 1, FI - 3, MC - 2, A]. All members join Trello and learn to work with GitHub. |  |



## A.2 Work Plan

**Objective:** Make the team's intended order of work and responsibility visible. Show the project weeks or other short periods used by the team, including preparation for the two formal reviews.

**Current plan:** The live plan is the team's Trello board, kept current by team members. The table below is a weekly summary of it.


| Period | Principal planned work | Responsible member(s) | Link to tasks, if used |
| --- | --- | --- | --- |
| Project weeks 3-4 | Project scope, requirements, and use case documents; preparation of the 10-minute presentation for the TA | [MC, BK, MM, TM, FI, OO] |  |
| --- | --- | --- | --- |
| --- | --- | --- | --- |

Keep the plan at a useful weekly level when a table is used; revise it when priorities change. If you use member abbreviations, define them in A.1 and use them consistently here; extend a code if two members share the same initials. The plan is not evidence that planned work was completed. Only the 8th and 14th weeks are formal course checkpoints; ordinary meetings and internal plans are not additional hand-ins.



## A.3 Activity Table

**Objective:** Show which members worked on the important project activities and the approximate effort they report. Include design, documentation, integration, testing, and deployment alongside implementation.

| Activity or deliverable | Member | Reported hours | Representative result or link |
| --- | --- | --- | --- |
|  |  |  |  |

Use project-specific activities rather than a mandatory row for every Wiki chapter or every UML diagram. The team should record hours consistently and avoid double-counting joint work; the representative result explains what the reported effort produced. Hours are self-reported effort, not a measure of quality or a substitute for examining code and artefacts.

<details>
<summary><strong>Recording feature, integration, and documentation work</strong></summary>

**Example — Crisis Guard:** The table distinguishes implementation, integration, and documentation work and links each activity to a result.

| Activity or deliverable | Member | Reported hours | Representative result or link |
| --- | --- | --- | --- |
| Manual map-position input | Ana | 8 | Example issue #21; frontend change. |
| Report validation and persistence | Luka | 10 | Example issue #23; backend change and test. |
| Client–API integration and public deployment | Ema | 7 | Example issue #25; deployment revision. |
| Report-submission use case and permission-denied check | Nika | 5 | Example UC-002 revision and test ST-03. |

**Effort and result:** The final column makes it possible to discuss a contribution without treating a high hour count as proof of delivery. A team can report a genuinely time-consuming unresolved integration problem as work and describe its outcome honestly.

</details>

## A.4 Change Overview Diagram

**Objective:** Show when changes were made in the repository and by whom, while recognizing that commit counts alone do not measure contribution quality.

**Repository activity view:** [Embed or link to the GitHub Contributors view or a generated graph for the project's repository; state the period it covers.]

The graph can show when commits were made and by whom, but it does not reveal all design, testing, integration, review, or documentation work. Explain a notable mismatch with the activity table if one exists; do not infer hours from the graph. Keep the generated view tied to the actual repository rather than drawing a second chart by hand.

## A.5 Key Challenges and Solutions

**Objective:** Describe a significant project problem, how the team responded, and what changed or remains unresolved. Choose concrete challenges rather than general praise of teamwork.

| Challenge | Action taken | Outcome or remaining limit |
| --- | --- | --- |
|  |  |  |

<details>
<summary><strong>Resolving a location-format mismatch</strong></summary>

**Example — Crisis Guard:**

| Challenge | Action taken | Outcome or remaining limit |
| --- | --- | --- |
| A selected map position appeared in the client, but a submitted report did not retain its coordinates. | Ana and Ema compared the browser request with the API's expected location fields; Ema aligned the request format and Luka checked backend validation. | A new report can be retrieved with its saved position in this scenario; the team links the corresponding integration change and check. |

**Problem, response, and outcome:** Each part can be checked against the project. A sentence such as “we faced integration difficulties and solved them through teamwork” would not tell a reader what failed or how the solution changed.

</details>

**Final consistency check:** Meetings identify meaningful outcomes and owners; the plan reflects intended work; the effort table and generated repository view refer to the same project; and concrete challenges are connected to actions and their results. The issue board remains the live source for task status.
