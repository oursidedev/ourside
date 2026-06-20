# Email OTP configuration

In Supabase Dashboard, open **Authentication → Email Templates**.

For both **Confirm signup** and **Magic Link**, use the token variable instead of a confirmation link:

```html
<h2>Your Ourside verification code</h2>
<p>Enter this code in Ourside:</p>
<p style="font-size:32px;font-weight:700;letter-spacing:8px">{{ .Token }}</p>
<p>This code expires in 10 minutes. If you did not request it, ignore this email.</p>
```

Turkish copy can be added below the English copy in the same template until locale-specific transactional templates are introduced.

Required dashboard values:

- Site URL: `http://localhost:3000` during development.
- Redirect URL: `http://localhost:3000/**`.
- OTP expiry: 600 seconds.
- OTP length: 6.
- Minimum email frequency: 60 seconds.

Before production, replace the Site URL with the production HTTPS domain and retain localhost only as an additional development redirect.
