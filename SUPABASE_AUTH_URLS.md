# Supabase Auth URL configuration

In Supabase Dashboard → Authentication → URL Configuration set:

**Site URL**

`https://app.getourside.com`

**Redirect URLs**

```text
https://app.getourside.com/**
https://getourside.com/**
https://www.getourside.com/**
https://*.vercel.app/**
http://localhost:3000/**
```

OAuth callbacks, email verification and password reset should normally return to the app domain because account/session logic lives there. Add the callback URLs required by Google and Apple provider consoles using the Supabase callback URL shown in the provider setup screen.

The marketing site does not require access to the app session. Keeping Supabase cookies on `app.getourside.com` is intentional and avoids unnecessarily sharing authentication state with public pages. Invite emails should point to `https://app.getourside.com/invite/[token]`; legal footer links point to the root marketing host.
