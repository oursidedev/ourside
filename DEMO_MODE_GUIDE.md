# Public demo mode

`https://app.getourside.com/demo` is a public portfolio sandbox. It is intentionally separate from authenticated application routes and never receives a Supabase session requirement.

## Data behavior

- All displayed couple names, dates, letters, plans, and memories are fictional.
- Interactive additions use React component state only.
- The demo does not import a Supabase client or call an application API.
- It does not write visitor input to cookies, `localStorage`, `sessionStorage`, a database, storage bucket, email provider, or analytics event payload.
- Refreshing, closing, or navigating away destroys temporary input.
- File upload, camera, microphone, clipboard sharing, and download controls are not offered.
- Existing authenticated routes remain protected and continue using RLS-backed data.

The global operational analytics tracker explicitly excludes `/demo`; it does not create visitor/session identifiers or send demo page events.

## Configuration

```env
NEXT_PUBLIC_PRODUCT_MODE=portfolio
NEXT_PUBLIC_PUBLIC_SIGNUP_ENABLED=false
NEXT_PUBLIC_DEMO_ACCESS_ENABLED=true
```

The app subdomain root redirects to `/demo`. Disable the public sandbox by setting `NEXT_PUBLIC_DEMO_ACCESS_ENABLED=false` and redeploying. Do not point `/demo` at real repositories or add persistent storage without a separate privacy/security review.

## Safety boundary

Public demo access does not make `/dashboard`, `/memories`, `/gallery`, `/vault`, `/settings`, or `/admin` public. Those routes remain authenticated. Never reuse real user data, signed private media URLs, production IDs, or invitation tokens in the demo dataset.
