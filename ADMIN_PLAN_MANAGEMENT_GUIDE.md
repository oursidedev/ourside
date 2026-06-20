# Dynamic plan management

Open `/admin/plans`, choose a plan, edit pricing, structured limits, feature flags or marketing bullets, enter a reason, and publish. The save operation runs through `admin_save_plan`, which atomically writes plan history and an admin audit event.

To change Free memories from 50 to 20, edit **Free → Limits → Memories**, enter a reason, save, then verify `getourside.com/#pricing`, `/pricing`, Settings billing usage and the memory creation flow. Public pricing fetches `/api/public/plans`; it does not contain hardcoded prices or limits.

`null` means unlimited and `0` means disabled. Lowering a limit never deletes existing content. Users already above the new value retain read access but database triggers reject new rows until usage falls below quota or the plan changes.

Display-price changes do not synchronize a future Stripe/Paddle/iyzico catalog. Provider price synchronization must be added with verified provider APIs and webhooks.
