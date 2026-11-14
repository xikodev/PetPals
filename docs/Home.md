# PetPals — Project Documentation

**Course:** [Software Engineering](https://www.fer.unizg.hr/predmet/proinz), Faculty of Electrical Engineering and Computing, University of Zagreb  
**Academic year:** [2026/2027]  
**Team:** TG01.1 — PetOps 
**Instructor:** Vlado Sruk  
**Assistant / Demonstrator:** Athanasios Papanikolaou, Goran Rajić, Borna Gojšić

## Project Overview

**Objective:** Let a first-time reader identify the application, its intended users, and its principal purpose in two or three sentences.

PetPals is a peer-to-peer pet care platform for pet owners who need someone to look after their pet, and for helpers who offer pet sitting, walking and feeding. A booking is the shared record of the arrangement, from request to approval, confirmation and completion. Administrators verify users and resolve disputes. The application is one React Progressive Web App (PWA) with a Node.js backend and a PostgreSQL database. In the first cycle, users can sign in with Google, choose the owner or helper role, and view and edit their profile; the other planned features are described in the documentation as planned.


**Application and basic setup:** [Repository README](../README.md#quick-start)  
**Public application:** see [README – Deployment](../README.md#deployment)

## Team Members and Roles

The maintained list of members, GitHub profiles, and their roles or principal contributions is in the [repository README](../#team-members).

## Documentation Index

| Page | Purpose |
| --- | --- |
| [1. Project Scope](1-Project-Scope.md) | Problem, objective, and boundary of the project |
| [2. Requirement Analysis](2-requirements.md) | Requirements, constraints, and traceability |
| [3. Use Cases](3-use-Cases.md) | Actors and representative user interactions |
| [4. Architecture and Design](4-Architecture-and-Design.md) | Main design decisions, structure, data, and behavior |
| [5. Testing](5-Testing.md) | Test approach, actual results, and known defects |
| [6. Deployment, Installation, and Configuration](6-Deployment-Installation-and-Configuration.md) | Local installation, configuration, public deployment, and administration |
| [7. Conclusion and Future Work](7-Conclusion-and-Future-Work.md) | Conclusion and Future Work |
| [A. Overview of Group Activities](A-Overview-of-Group-Activities.md) | Team activities, contributions, and challenges. |

## Project Milestones

| Checkpoint | Demonstration | Video |
| --- | --- | --- |
| Week 7 — first review | [Public application](https://petpals-frontend.onrender.com) | [Demo 1 video link, if recorded] |
| Week 14 — final review | [Link to the final demonstration or project version] | [Final demo video link, if recorded] |

The Wiki is updated as the application develops; only weeks 7 and 14 are formal checkpoints.

## Project Organization and Development Process

**Working approach:** Work is split into cards by role (backend, login, two frontend roles, documentation) on the team's Trello board. Each card is developed on its own branch and merged into `main` through a pull request that a teammate reviews. The team meets briefly each week; decisions are recorded in A.1 of the group activities document.

**Current task and defect tracking:** [Trello board](TRELLO LINK)  



## Documentation Conventions

The documentation consists of linked Markdown pages. Required UML diagrams use PlantUML, with versioned source and a readable image in the Wiki. The examples in this course template show how to write a record; they are not results of the student's project.

PetPals uses a React (Vite) PWA client, a Node.js (Express) backend, PostgreSQL, and Render for hosting. PlantUML sources are in `docs/puml/`; a GitHub Actions workflow generates the images in `docs/assets/diagrams/` after changes are merged into `main`.

## Academic Integrity, Conduct, and Licensing

The repository README contains the project's [AI usage statement](../#ai-usage), [code of conduct and support information](../#code-of-conduct-and-support), and [license or reuse status](../#license). Access credentials and other secrets are never published in the Wiki or shared through ordinary messages.

## AI Usage Statement

Short summary: [README – AI Usage](../#ai-usage). This section records which tools were used, for which documentation or code, and how the team verified the result. It follows the FER [Policy on the Appropriate Use of Artificial Intelligence](https://www.fer.unizg.hr/_download/repository/Policy%20on%20the%20appropriate%20use%20of%20artificial%20intelligence%20at%20the%20faculty%20of%20electrical%20engineering%20and%20computing%5B1%5D.pdf).

### Tools Used

<!-- to do: supply with use cases of AI -->

| Tool | Version or model | Used by | Main purpose |
| --- | --- | --- | --- |
| Claude (Anthropic) | Sonnet 5.5 | MC | Task planning, understanding materials, document drafting and organisation |
| OpenAI Codex | --- | MM, FI, TM | Code organisation, developing |

### Scope of AI Contribution

| Page, file or artifact | Type of assistance | What the tool produced | What the team supplied and changed | Location |
| --- | --- | --- | --- | --- |
| [e.g. 3. Use Cases, UC-002] | [Drafting / rewording / translation / diagram source / summarizing] | [Short description] | [Input given to the tool; facts added, corrected or removed] | [Wiki page, `.puml` file, PR] |
| Documents 1-6 | Drafting | --- | --- | --- |
| README | Drafting | Initial structure and text | Team supplied the real project facts and corrected the planned features and technologies | README |

Pages and artifacts not listed above were written without generative AI assistance. [Optional: list any AI-assisted code or tests here as further rows.]

### Verification of Generated Content

| Check | How it was performed | Evidence |
| --- | --- | --- |
| Factual accuracy | [Each statement about features, behavior or architecture was compared with the running application and the code] | [Reviewer names; PR or issue links] |
| No unimplemented claims | [Features, tests and results described in the text were confirmed to exist; planned work is labeled as planned] | [Comparison with Testing (5.4) and Conclusion (7.1)] |
| Consistency with other pages | [Names, IDs and diagrams checked against Requirements, Use Cases, Architecture and Testing] | [Checklist or review note] |
| Diagram sources | [Generated PlantUML was rendered, corrected and matches the implemented system] | [`.puml` file and rendered image] |
| Confidential content | [How the team ensured no secrets, credentials or personal data entered prompts or the Wiki] | [Practice used] |

### Errors Found in AI Output

| Problem | How it was found | Resolution |
| --- | --- | --- |
| [Incorrect, invented or template-copied statement] | [Review, test or comparison with the application] | [Correction, with a link] |

<!-- INSTRUCTION: Record real corrections, or write "None identified". A blanket statement such as "all text was reviewed" is not evidence; the tables above are. The team must be able to explain every sentence it publishes. -->

