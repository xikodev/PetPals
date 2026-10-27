# A. Overview of Group Activities

**Objective:** Show how the team organized the project, assigned work, responded to important problems, and contributed to the result. Entries should describe outcomes rather than only saying that a meeting was held or a topic was discussed.

## A.1 Meeting Log

**Objective:** Keep a brief record of project meetings and weekly coordination: who participated, what was decided, and which action followed. Record a discussion that produced no decision only if it left an important issue open.

**Team member abbreviations:** MC = Marta Cekić; BK = Borna Krpan; MM = Mato Marunović; TM = Tomislav Miletić; FI = Fran Ivanković; OO = Oluwafemi Olabinjo.

| Date and participants | Main topic | Decision, action, or open question | Link to task or resulting work, if available |
| --- | --- | --- | --- |
| 12 October 2026; MC, BK, MM, TM, FI, OO | Initial ideas and choice of topic | All members got acquainted with GitHub. The team co-wrote the proposal for the team's custom topic (PetPals). |  |
| 22 October 2026; MC, BK, MM, TM, FI | Documentation approach | Written the detailed document describing the topic. The documentation files are divided among members: [BK - database plan, MM - README, TM - 1-Project-Scope.md, FI - 3-use-cases.md, MC - 2-requirements.md]. All members join Trello and learn to work with GitHub. |  |
| 27 October 2026; MC, BK, MM, TM, FI | Application Architecture | Decided on which technologies will be used to implement the project: Node.js, PostgreSQL, React. Decided to create a progressive web app. | --- |
| week 5 | Development | --- | --- |
| week 6 | Testing and final checks | --- | --- |




## A.2 Work Plan

**Objective:** Make the team's intended order of work and responsibility visible. Show the project weeks or other short periods used by the team, including preparation for the two formal reviews.

**Current plan:** The live plan is the team's Trello board, kept current by team members. The table below is a weekly summary of it.


| Period | Principal planned work | Responsible member(s) |
| --- | --- | --- |
| Project week 2 | All team members to join GitHub and Trello board | [MC, BK, MM, TM, FI, OO] |
| Project week 3 | Project scope, requirements, and use case documents; README.md | [MC, BK, MM, TM, FI, OO] |
| Project week 4 | Decide on technologies and fill out document 4 | [MC, BK, MM, TM, FI] |
| Project week 5 | Start creating the first versions and features | [MC, BK, MM, TM, FI] |
| Project week 6 | Finish up testing the product and features, prepare for the first project-cycle submission. | [MC, BK, MM, TM, FI] |


Keep the plan at a useful weekly level when a table is used; revise it when priorities change. If you use member abbreviations, define them in A.1 and use them consistently here; extend a code if two members share the same initials. The plan is not evidence that planned work was completed. Only the 8th and 14th weeks are formal course checkpoints; ordinary meetings and internal plans are not additional hand-ins.



## A.3 Activity Table

**Objective:** Show which members worked on the important project activities and the approximate effort they report. Include design, documentation, integration, testing, and deployment alongside implementation.

| Activity or deliverable | Member | Reported hours | Representative result or link |
| --- | --- | --- | --- |
| Project proposal and topic selection | all | 2 |  |
| Requirements Analysis (Doc 2) | MC | 4 | --- |
| Use Cases (Doc 3) | FI | 4 | --- |
| Project Scope (Doc 1) | TM | 3 | --- |
| README | MM | 2.5 | --- |
| Repository Setup | BK | 1 | --- |
| Database Design Draft | BK | 4 | --- |
| Architecture & Design (Doc 4) | all | 6 | --- |
| Mutual PR Review | all | 4 | --- |
| --- | --- | --- | --- |
| --- | --- | --- | --- |

Use project-specific activities rather than a mandatory row for every Wiki chapter or every UML diagram. The team should record hours consistently and avoid double-counting joint work; the representative result explains what the reported effort produced. Hours are self-reported effort, not a measure of quality or a substitute for examining code and artefacts.


## A.4 Change Overview Diagram

**Objective:** Show when changes were made in the repository and by whom, while recognizing that commit counts alone do not measure contribution quality.

**Repository activity view:** [Embed or link to the GitHub Contributors view or a generated graph for the project's repository; state the period it covers.]

The graph can show when commits were made and by whom, but it does not reveal all design, testing, integration, review, or documentation work. Explain a notable mismatch with the activity table if one exists; do not infer hours from the graph. Keep the generated view tied to the actual repository rather than drawing a second chart by hand.

## A.5 Key Challenges and Solutions

**Objective:** Describe a significant project problem, how the team responded, and what changed or remains unresolved. Choose concrete challenges rather than general praise of teamwork.

| Challenge | Action taken | Outcome or remaining limit |
| --- | --- | --- |
| The team had varying levels of experience with Git and GitHub, and most members were unfamiliar with pull requests, branches, and merge conflicts. | BK guided the team through the initial repository setup and demonstrated the branching and PR workflow. | All team members successfully created branches, opened pull requests, and merged code without corrupting the main branch. |
| --- | --- | --- |
| --- | --- | --- |
| --- | --- | --- |

<details>
<summary><strong>Resolving a location-format mismatch</strong></summary>

**Example — Crisis Guard:**

| Challenge | Action taken | Outcome or remaining limit |
| --- | --- | --- |
| A selected map position appeared in the client, but a submitted report did not retain its coordinates. | Ana and Ema compared the browser request with the API's expected location fields; Ema aligned the request format and Luka checked backend validation. | A new report can be retrieved with its saved position in this scenario; the team links the corresponding integration change and check. |

**Problem, response, and outcome:** Each part can be checked against the project. A sentence such as “we faced integration difficulties and solved them through teamwork” would not tell a reader what failed or how the solution changed.

</details>

**Final consistency check:** Meetings identify meaningful outcomes and owners; the plan reflects intended work; the effort table and generated repository view refer to the same project; and concrete challenges are connected to actions and their results. The issue board remains the live source for task status.
