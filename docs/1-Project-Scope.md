# 1. Project Scope

## 1.1 Problem and Project Objective

Pet owners who travel or work long hours may need someone trustworthy to look after their pet for a short period. When this is arranged informally, details such as dates, handover place and whether the service actually started and finished live only in chat messages, so there is no shared record if something goes wrong.

PetPals is a peer-to-peer mobile application that lets a pet owner find verified, nearby helpers who offer pet sitting, walking or feeding. The whole interaction (discovery, booking, on-service confirmation, completion and rating) is structured around a single shared object, the booking, so neither party has to negotiate details informally. A web administration panel gives administrators the records they need to verify users, moderate listings and resolve disputes.

The expected benefit is that owners can find and book a suitable helper in one place, both parties have a clear record of what was agreed and confirmed, and administrators can decide disputes from recorded evidence instead of conflicting accounts. We do not claim a measured improvement; the benefit is a clearer and more traceable process.

## 1.2 Intended Users and Stakeholders

| User or stakeholder group | Need or interest relevant to this project |
| --- | --- |
| Pet Owner | Find a trustworthy helper near a chosen location for a specific care period, check availability, send a booking request, confirm the service at each step, and rate the helper afterwards. |
| Pet Helper | Offer services (sitting, walking, feeding) with their own rates and availability, review incoming requests before accepting, confirm the service with the owner, and build a reputation through ratings. |
| Administrator | Maintain trust and safety: verify new users, remove inappropriate or misclassified listings, and resolve disputes using the platform's records. Uses the web administration panel only. |

**Verification rule:** Pet Owners may browse and prepare booking requests, but cannot submit them until an Administrator approves their account. Pet Helpers may prepare service listings, but cannot receive booking requests until approved.

## 1.3 Project Boundaries

**Included:** Mobile application for Pet Owners and Pet Helpers: OAuth 2.0 sign-in, profiles, pet profiles, service listings with availability calendars that block unavailable or already-booked time slots, map-based search with service type, date and price filters, booking requests with approval or decline by the helper, confirmation of service start and completion by both parties (QR code or in-app button), with both confirmations required at each milestone, messaging scoped to a booking, mutual 1-5 ratings with short reviews, and a helper view of completed bookings and recorded earnings. Web administration panel for Administrators: user verification queue, listing moderation, and dispute review with a recorded decision.

**Excluded or deferred:** Payment processing. Earnings are only a display of recorded totals and an administrator's dispute decision is recorded, not financially executed. Administrators do not use the mobile application, manage booking calendars, list services or take part in ratings. Automated background checks and insurance or guarantee schemes are not part of the project; verification is an administrator's review of the submitted identity information.

**External dependencies:** Google Maps API (map and search markers), Google Calendar API (events and reminders for both parties once a booking is approved), a QR Code API (unique QR image per booking for start and completion confirmation) and OAuth 2.0 with an external provider such as Google (authentication). The application keeps responsibility for its own booking, listing, review and dispute data.

## 1.4 Existing Approaches and Project Rationale

An owner can already use an established marketplace such as [Rover](https://www.rover.com/), which lists dog walking, drop-in visits and boarding, lets owners view a sitter's profile and availability and send a booking request, processes payments through its platform, and requires sitters to pass a background check. Rover also takes a 20% service fee from each booking ([NerdWallet comparison of Rover and Wag](https://www.nerdwallet.com/finance/learn/rover-vs-wag)). PetPals is motivated by a narrower, booking-centred workflow in which both parties confirm the start and the end of every service and an administrator can review the full record of a disputed booking. It deliberately leaves payments out of scope and is a student project with a much smaller scope than such a marketplace; it does not aim to replace it.
