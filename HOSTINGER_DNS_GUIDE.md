# Hostinger DNS guide

Use the exact records Vercel shows when they differ. The common Vercel records are:

| Type | Name | Value | TTL |
| --- | --- | --- | --- |
| A | `@` | `76.76.21.21` | Automatic/default |
| CNAME | `www` | `cname.vercel-dns.com` | Automatic/default |
| CNAME | `app` | `cname.vercel-dns.com` | Automatic/default |

Remove conflicting Hostinger parking, duplicate A/AAAA, or duplicate CNAME records for these names. DNS propagation can take time. Vercel issues SSL only after ownership and DNS are correct; do not manually proxy `app.getourside.com` through an unrelated service during validation.
