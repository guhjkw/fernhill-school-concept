# Fernhill Studio School (concept site)

A multi-page front-end prototype of a Squarespace 7.1 site for an online school that sells courses, memberships and 1:1 coaching to creative small business owners.

> **Concept project, fictional brand.** Fernhill Studio School, its teachers, courses, prices and contact details are invented for a freelance portfolio. Concept site by Emmanuel O. Nothing here is a real business, and every form, checkout, sign-in and booking is a demo that sends no data.

## The client brief it answers

Paraphrased from real Upwork job posts (October 2026):

1. A digital course business wants a responsive website with a filterable course catalogue page, a checkout flow and member access for buyers.
2. A coach wants courses, a membership and simple online booking for two services, with a member area for paying clients.
3. A coaching business with two offers wants a members-only area with a login and neatly organized content.

This concept shows all three in one coherent site: catalogue, course pages with enrollment, membership plans, a two-service booking flow and a member dashboard.

## Pages

| File | Page | What it shows |
| --- | --- | --- |
| `index.html` | Home | Hero, topic shortcuts into the filtered catalogue, featured courses, how it works, membership and coaching teasers, FAQ |
| `courses.html` | Course catalogue | Search, filters (topic, level, format, price), sort, live result count, empty state |
| `course.html` | Course detail | One template for every course: `course.html?course=<slug>`; no slug shows the default course |
| `membership.html` | Membership plans | Three plans with a monthly / yearly toggle, comparison table, policies |
| `coaching.html` | 1:1 coaching | Booking flow for two services: service, date, time slot, details, confirmation |
| `members.html` | Member area demo | Demo sign-in, dashboard with enrolled courses and lesson progress |

## Signature features

- **Filterable catalogue.** Search plus topic, level, format and price filters, sorting and an `aria-live` result count. Filters can be preselected from the URL, for example `courses.html?topic=money`, which the home page topic tiles use.
- **Course detail template.** Curriculum accordion (native `details` with an "Expand all" control), "What you will learn", fit check, teacher bio and related courses. All ten courses render from a JSON block inside `course.html`.
- **Demo checkout modal.** "Enroll now" opens a native `dialog` with an order summary, name and email validation and an on-page confirmation. It never asks for card details and nothing is charged.
- **Membership toggle.** Monthly / yearly switch updates prices, billing notes and the sign-up modal.
- **Coaching booking.** Two services, the next twelve Monday to Thursday dates, time slots with some marked as booked, a live summary and a demo confirmation. `coaching.html?service=shop-audit` preselects a service.
- **Member area.** The sign-in form shows the demo credentials on the page (`member@fernhill.example` / `demo1234`) and has a "Fill in the demo details" button. The dashboard lists enrolled courses with lesson checkboxes; progress and the demo session are saved in `localStorage` through a guarded wrapper, and the page still works when storage is blocked.

## How it maps to Squarespace 7.1

| Concept feature | Squarespace 7.1 build |
| --- | --- |
| Header, announcement bar, footer | Site header with navigation and a primary button, Announcement Bar, footer sections |
| Course catalogue | Squarespace Courses (Digital Products) or a Products page with categories; the search and multi-filter layout would be a Code block or a vetted filter plugin, since native summary filters are single-category |
| Course detail pages | One Squarespace Course or digital product page per course, with Accordion blocks for the curriculum |
| Enroll checkout | Squarespace Commerce checkout (card, Apple Pay, PayPal) |
| Membership plans and toggle | Member Areas with monthly and yearly pricing plans; the toggle is a small Code block, or two pricing sections |
| Member dashboard and progress | Member Areas gated pages; Squarespace Courses track lesson completion natively |
| Coaching booking | Acuity Scheduling block with two appointment types and an intake form |
| Newsletter signup | Newsletter block connected to Squarespace Email Campaigns |
| FAQ and policies | Accordion blocks |
| Social icons | Social Links block |

## Tech notes

- Plain HTML, CSS and vanilla JavaScript. No frameworks, no build step, no CDNs and no external requests (fonts, images and icons are local).
- Flat folder, ready for the GitHub web uploader and GitHub Pages (`.nojekyll` included).
- `styles.css` holds design tokens (fern green, cream paper, plum accent), components and page layouts. Mobile first, with breakpoints at 640 px and 900 px.
- `app.js` (about 410 lines) handles the mobile menu, form validation, modals, catalogue filters, course rendering, the billing toggle, booking and the member area.
- Illustrations are hand-written SVG files (`cover-*.svg`, `hero-fern.svg`, `leaf-sprig.svg`, `price-tag.svg`) plus inline SVG icons.
- No cookies, analytics or tracking. The only stored data is the member area demo progress, kept in this browser's `localStorage`.

## Run it locally

Open `index.html` in a browser. Everything works from `file://`, no server needed.

## Accessibility notes

- Semantic landmarks, a skip link, one `h1` per page and a logical heading order.
- Every input has a visible label; errors are announced and linked with `aria-describedby`, and focus moves to the first invalid field.
- Modals use the native `dialog` element: Esc closes, Tab is trapped inside, and focus returns to the button that opened it.
- Filters, chips, dates and time slots are real checkboxes and radio buttons, so they work with a keyboard and screen readers.
- Visible focus styles, AA color contrast, decorative SVG hidden from assistive tech, and `prefers-reduced-motion` respected.
- Tested at 375, 768 and 1440 px widths with no horizontal scrolling.

## Font credits

- **Space Grotesk** (headings) by Florian Karsten, SIL Open Font License 1.1, via Fontsource.
- **Source Serif 4** (body) by Frank Grießhammer for Adobe, SIL Open Font License 1.1, via Fontsource.

Only the latin subset and the weights in use are included: Space Grotesk 500 and 700, Source Serif 4 400, 400 italic and 600.
