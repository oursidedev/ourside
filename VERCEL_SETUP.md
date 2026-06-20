# Vercel setup

Attach all three domains to the same production project:

- `getourside.com` — public marketing canonical host
- `www.getourside.com` — redirected by middleware to `getourside.com`
- `app.getourside.com` — authenticated app

Set the production environment values described in `DEPLOYMENT_GUIDE.md` and redeploy after changing them. Vercel previews keep their native host and are not forced to production domains, so pull-request testing continues to work. Middleware owns host redirects; do not add conflicting Vercel redirects.

After DNS verification, confirm Vercel reports a valid SSL certificate for every host. If Vercel displays different DNS targets from the common values documented here, Vercel's project-specific values take precedence.
