# PetPals

PetPals is a planned peer-to-peer pet care platform that connects pet owners with nearby helpers offering pet sitting, walking, and feeding services.

**Course project:** This project is being developed by a student team as part of the [Software Engineering](https://www.fer.unizg.hr/predmet/proinz) course at the Faculty of Electrical Engineering and Computing (FER), University of Zagreb.

## App Description

Pet owners who travel or work long hours often arrange care informally, without availability calendars, verified users, or a structured way to resolve disagreements. PetPals is planned for three groups of users: pet owners, who search for and book care; pet helpers, who offer sitting, walking, and feeding services; and administrators, who verify users and resolve disputes. A booking follows a defined sequence from request to approval, confirmation, and completion, so both parties share one record of the arrangement.

The planned system includes a mobile application for pet owners and helpers, and a web administration panel for administrators.

**Current functionality:** None implemented yet; the project is in the documentation phase.

**Planned key features**

- Pet profiles with care instructions and relevant information.
- Search for helpers by location, service type, availability, and price.
- Service listings and availability management for helpers.
- Booking requests that helpers can accept or decline.
- Confirmation of service start and completion by both parties using QR codes or in-app buttons.
- Booking-specific messaging and mutual ratings after completed services.
- Administrative tools for verification, moderation, and dispute review.

**Scope:** Payment processing is outside the planned scope. Helpers will be able to view recorded earnings calculated from completed bookings.

For the complete scope, requirements, design, and test evidence as they are developed, see the [project documentation](docs/Home.md).

<a id="deployment"></a>
## Deployment

Deployment details will be added once a working version is available.

**Live application:** To be added once a working version is deployed.
<!-- TODO: Add the public application URL. -->

**Explore:** To be added.
<!-- TODO: Describe one or two actions that demonstrate a working user flow. -->

**Demo:** To be added.
<!-- TODO: Explain how to obtain limited access if sign-in is required. Never publish passwords or tokens. -->

**Limitations:** To be added.
<!-- TODO: List limitations of the deployed version or link to the known-issues documentation. -->

The deployment and running guide will describe the hosting setup used by the team.
<!-- TODO: Add a link to the deployment and running guide. -->

<a id="quick-start"></a>
## Quick Start / Installation

Installation and configuration instructions will be completed as development progresses and verified from a clean clone before publication.

**Prerequisites:** To be added.
<!-- TODO: List required runtimes and versions, package managers, database requirements, and essential external services. -->

```bash
git clone https://github.com/xikodev/PetPals.git
cd PetPals

# TODO: Add dependency installation commands.
# TODO: Add commands to run the backend, mobile application, and administration panel.
```

**Address:** To be added.
<!-- TODO: Provide the actual local address or instructions for opening the mobile application. -->

**Configuration:** The planned integrations include Google sign-in, Google Maps, Google Calendar, and a QR code service. Required environment variables, database configuration, and a safe `.env.example` file will be documented once the implementation is established. Service credentials will be obtained from the respective providers.

Never put real credentials in this README, example configuration files, screenshots, logs, or commits.

**Verification:** To be added.
<!-- TODO: Describe a basic check confirming that the application runs correctly. -->

For detailed setup, see the [project documentation](docs/Home.md).

## Technologies

The application frameworks and database are still to be confirmed. The following integrations are planned and are not presented as implemented functionality.

| Technology or service | Planned role in this project | Reason for use or important constraint |
| --- | --- | --- |
| Google Maps API | Display nearby helpers and routes to service locations. | Location helps owners find suitable nearby care. |
| Google Calendar API | Create calendar events and reminders after booking approval. | Both parties need reminders for the care period; calendar access requires authorization. |
| QR code service | Generate QR codes for service start and completion confirmation. | Supports confirmation during physical meetings; in-app buttons support confirmation when the parties are apart. |
| OAuth 2.0 / external sign-in provider | Support sign-in through an external provider such as Google. | Sign-in is separate from administrator verification, which is required before users can send or receive booking requests. |

<!-- TODO: Add confirmed application frameworks and the database, explaining their roles and project-specific reasons for use. -->

## Team Members

| Member | Main role or contribution |
| --- | --- |
| Marta Cekić | Project organization, documentation, development |
| Borna Krpan | Backend development and integration |
| Mato Marunović | Documentation, development and integration |
| Tomislav Miletić | Documentation, development and integration |
| Fran Ivanković | Documentation, development and integration |
| Oluwafemi Olabinjo | Documentation, development and integration |

Roles may change during the project. The repository and the agreed task tracker provide supporting evidence of teamwork.

## Contributing

Tasks are assigned and their progress is tracked on the team's Trello board. Documentation and code changes are made on separate branches and merged into the main branch through pull requests after review.

<!-- TODO: Add the link to the team's Trello board. -->

<a id="license"></a>
## License [![CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

**License status:** The documentation in this repository is licensed under [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/).

No public reuse license has been granted for the original application source code.

You may share and adapt the documentation provided that you give appropriate credit, indicate any changes, use it only for non-commercial purposes, and distribute adaptations under the same license.

Third-party code, datasets, images, icons, and other assets retain their own licenses and attribution requirements.

<!-- TODO: Link additional credits where relevant. -->

<a id="ai-usage"></a>
## AI Usage [![AI Usage: Disclosed](https://img.shields.io/badge/AI%20Usage-Disclosed-blue.svg)](https://www.fer.unizg.hr/_download/repository/Policy%20on%20the%20appropriate%20use%20of%20artificial%20intelligence%20at%20the%20faculty%20of%20electrical%20engineering%20and%20computing%5B1%5D.pdf)

This project follows FER's [Policy on the Appropriate Use of Artificial Intelligence](https://www.fer.unizg.hr/_download/repository/Policy%20on%20the%20appropriate%20use%20of%20artificial%20intelligence%20at%20the%20faculty%20of%20electrical%20engineering%20and%20computing%5B1%5D.pdf).

**Statement:** AI tools were used to draft and revise project documentation based on the PetPals project description and the course templates:

- **OpenAI Codex:** Initial README structure, drafting, and revisions based on team feedback.
- **Claude by Anthropic:** Drafting and revising project documentation.

Team members are responsible for reviewing and editing AI-assisted material before accepting it and for being able to explain their own contributions.

<!-- TODO: Record the review performed and any additional AI tools used, including their use in application development. -->

<a id="code-of-conduct-and-support"></a>
## Code of Conduct and Support [![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

Team members are expected to follow the **STUDENT CODE OF CONDUCT** of the Faculty of Electrical Engineering and Computing, University of Zagreb, the course teamwork guidelines, and the [IEEE Code of Ethics](https://www.ieee.org/about/corporate/governance/p7-8.html).

See the repository's [Code of Conduct](CODE_OF_CONDUCT.md).

---

**Course documentation template:** Documentation structure adapted from the FER Software Engineering course template by [Vlado Sruk](https://www.fer.unizg.hr/en/vlado.sruk), licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). The application and its content are being created by the student team named above.
