# PetPals

PetPals is a planned peer-to-peer pet care platform that connects pet owners with nearby helpers offering pet sitting, walking, and feeding services.

**Course project:** This project is being developed as part of the Software Engineering course at the Faculty of Electrical Engineering and Computing (FER), University of Zagreb.

## App Description

Pet owners may need reliable help while travelling or working long hours. PetPals aims to help them find suitable pet helpers, arrange care, and track each booking from request to completion.

The planned system includes a mobile application for pet owners and helpers, and a web administration panel for user verification, service moderation, and dispute resolution.

**Planned key features**

- Pet profiles with care instructions and relevant information.
- Search for helpers by location, service type, availability, and price.
- Service listings and availability management for helpers.
- Booking requests that helpers can accept or decline.
- Confirmation of service start and completion by both parties using QR codes or in-app buttons.
- Booking-specific messaging and mutual ratings after completed services.
- Administrative tools for verification, moderation, and dispute review.

**Scope:** Payment processing is outside the planned scope. Helpers will be able to view recorded earnings calculated from completed bookings.

**Documentation:** Detailed scope, requirements, design, and test evidence will be maintained in the `docs/` folder.

<a id="deployment"></a>
## Deployment

Deployment details will be added once a working version is available. This section will include the public application URL, a verified demonstration flow, access instructions, and known limitations.

<a id="quick-start"></a>
## Quick Start / Installation

Installation and configuration instructions will be added after the technology stack and initial implementation are established. Instructions will be verified from a clean clone before publication.

## Technologies

The application frameworks and database are still to be confirmed. The project description identifies the following planned integrations; this list does not indicate that they have already been implemented.

| Technology or service | Planned role in this project | Reason for use or important constraint |
| --- | --- | --- |
| Google Maps API | Display nearby helpers and routes to agreed service locations. | Location helps owners find suitable nearby care. |
| Google Calendar API | Create calendar events and reminders after booking approval. | Both parties need a consistent record of the agreed care period; calendar access requires authorization. |
| QR code service | Generate QR codes for service start and completion confirmation. | Supports confirmation during physical meetings; in-app button confirmation is planned for remote handovers. |
| OAuth 2.0 / external sign-in provider | Support account sign-in through an external provider such as Google. | Signing in is separate from administrator verification, which is required before users can send or receive booking requests. |

## Team Members

Team member names and agreed responsibilities will be added after confirmation.

## Contributing

The team will document its agreed process for proposing tasks, reporting defects, and reviewing changes. A link to the selected work tracker will be added here.

<a id="license"></a>
## License

The original code, documentation, and other materials created by the PetPals team are licensed under [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/).

You may share and adapt these materials provided that you give appropriate credit, indicate any changes, use them only for non-commercial purposes, and distribute adaptations under the same license.

Documentation structure adapted from the FER Software Engineering course template by Vlado Sruk, licensed under CC BY-NC-SA 4.0.

Third-party materials retain their respective licenses.


<a id="ai-usage"></a>
## AI Usage

**Statement:** OpenAI Codex was used to help structure and draft this initial README from the PetPals project description and the course README template.

<a id="code-of-conduct-and-support"></a>
## Code of Conduct and Support

Team members are expected to follow the Student Code of Conduct of FER, the course teamwork guidelines, and the IEEE Code of Ethics.



---

**Course documentation template:** Documentation structure adapted from the FER Software Engineering course template by [Vlado Sruk](https://www.fer.unizg.hr/en/vlado.sruk), licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).
