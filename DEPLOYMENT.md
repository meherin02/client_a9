# Deploy the Next.js client

Import the client GitHub repository into Vercel as a Next.js project. Use Node.js 24, install with `npm ci`, and build with `npm run build`. Keep the framework's normal output settings; this application uses a Next.js server and is not a static export.

## Production environment

```dotenv
API_PROXY_TARGET=https://YOUR_API.onrender.com
NEXT_PUBLIC_APP_URL=https://YOUR_CLIENT.vercel.app
```

Remove `NEXT_PUBLIC_API_URL` from the production environment, or set it to the exact public frontend origin. Do not copy the local `http://localhost:5000` value to Vercel. The browser will request `/api/*` on the frontend origin; Next.js forwards those requests to Express through `rewrites()`.

Set the backend's `CLIENT_ORIGIN` and `BETTER_AUTH_URL` to the same frontend origin. Complete Google and Stripe settings described in the server deployment guide. Redeploy when build-time environment variables or rewrite targets change. Stable production domains should be used for auth; random preview URLs need their own explicit origin and OAuth configuration.

## Acceptance checks

- Public home and catalog open without service errors, and six approved featured items are visible.
- `/api/health` through the frontend reports a connected database.
- Registration and Google sign-in work; new Google users receive Customer.
- Reloading Customer/Owner/Admin private routes preserves the session.
- Wrong-role routes/API requests are denied.
- Favorites, uploads, moderation and profiles work.
- Stripe test payment creates exactly one booking and one payment record.
- Owner earnings and Admin revenue agree with payments.
- Mobile/tablet/desktop layouts and keyboard navigation have been checked.
- 404 and recoverable error states work.

Add the verified live URL and repository links to the README after deployment. Supply examiner credentials only through the assignment submission channel.

References: [Next.js rewrites](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites), [Vercel environment variables](https://vercel.com/docs/environment-variables).
