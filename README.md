# GearHarbor

GearHarbor is an equipment rental marketplace built for Assignment 9 Category 003. Customers discover equipment, save favorites, and pay for date-based rentals. Owners manage listings and rentals; admins moderate equipment and manage users.

## Live URL

Not deployed yet. Add the verified production URL before submission.

## Local setup

1. Run `npm install` in this client folder.
2. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_API_URL` to the Express API origin.
3. Configure and run the separate server, following its README.
4. Run `npm run dev` and open http://localhost:3000.
5. Run `npm run build` to verify production output, then `npm start`.

The application uses Next.js App Router, React, TypeScript, Tailwind CSS, DaisyUI, Framer Motion, Better Auth and Sonner. PostCSS integrates Tailwind and DaisyUI. Public environment variables are browser-visible; never put secrets in them.

## Features

- Responsive homepage with animated banner, six approved featured listings requested through a database-limited API, categories, benefits, how-it-works, recently added equipment and four explicitly illustrative reviews.
- Public catalog with backend search, filters, sorting and pagination.
- Private equipment details, saved favorites, booking modal and inclusive date pricing.
- Better Auth email/password and Google sign-in, persistent sessions and role-based JWT API access.
- Stripe Checkout with server pricing, transactional inventory reservations and signed webhook fulfillment.
- Customer rental history, owner equipment management, admin moderation, user management and role-scoped analytics.
- Editable profiles, loading UI, retryable route errors and not-found pages.

## Billing policy

Start and end dates are both billable. Daily rentals count calendar days; weekly and monthly prices use rounded-up 7-day and 30-day periods. Quantity multiplies the charge. The server verifies availability and pricing before payment.

## Verification and limitations

Production build and configured lint/type checks are required before submission. End-to-end authentication, MongoDB concurrency, imgbb uploads, Stripe payments, responsive browser checks and deployed route refreshes still need verification with configured services. Verified Google email addresses remain read-only; unverified email addresses use Better Auth's change-email flow. Reviews are labeled illustrative and must be replaced with authorized genuine reviews if presented as real testimonials.

Separate repositories are required. Replace this section with client/server repository URLs before submission. The brief requires at least 20 meaningful client commits and 12 server commits. Do not fabricate or split unrelated changes simply to inflate history.

## Deployment

Follow [DEPLOYMENT.md](DEPLOYMENT.md) for the same-origin API proxy configuration.

Client repository: https://github.com/meherin02/client_a9

Server repository: https://github.com/meherin02/server_a9
