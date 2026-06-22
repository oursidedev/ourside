# Ourside

Ourside is a full-stack portfolio case study for a private digital memory space for couples. The product concept combines shared memories, galleries, future letters, milestones, partner invitations, notifications, plan limits, and internal administration in a responsive web application.

## Current status

Ourside is preserved in **portfolio mode**. The marketing site remains public, while public registration and new shared-space creation are disabled. Existing authorized users and the owner can still log in.

- Marketing: <https://getourside.com>
- Public non-persistent demo: <https://app.getourside.com/demo>
- Authorized app access: <https://app.getourside.com/login>
- Stack: Next.js, React, TypeScript, Tailwind CSS, Supabase, Vercel

## Local development

Copy `.env.example` to `.env.local`, provide the required Supabase public values, and run:

```powershell
npm install
npm run dev
```

Product availability is centralized in `src/config/product-status.ts`. See `PORTFOLIO_MODE_GUIDE.md` and `DEMO_MODE_GUIDE.md` before changing it.

## Privacy

Never publish Supabase service-role keys, Resend keys, private media, real user emails, invite tokens, or couple content. Public marketing examples must remain fictional.
