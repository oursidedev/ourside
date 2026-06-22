/**
 * Product availability configuration.
 *
 * Portfolio mode keeps the public case study online while preventing new
 * accounts and shared spaces from being created. Existing authorized users
 * can still log in. Supabase must also disable new-user registration so this
 * client-visible setting cannot be bypassed with a direct Auth API call.
 */
export const PRODUCT_STATUS = {
  mode: process.env.NEXT_PUBLIC_PRODUCT_MODE || "portfolio",
  publicSignupEnabled: process.env.NEXT_PUBLIC_PUBLIC_SIGNUP_ENABLED === "true",
  demoAccessEnabled: process.env.NEXT_PUBLIC_DEMO_ACCESS_ENABLED !== "false",
} as const;

export const isPortfolioMode = PRODUCT_STATUS.mode === "portfolio";

export const SIGNUP_CLOSED_MESSAGE =
  "Ourside is currently in private portfolio mode. New signups are closed for now.";
