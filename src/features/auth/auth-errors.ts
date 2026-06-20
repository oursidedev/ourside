/**
 * Maps low-level Supabase Auth errors into safe user-facing messages.
 *
 * Provider errors can be technical, inconsistent, or confusing for users.
 * Keep every auth screen on this mapper so signup, login, password reset,
 * and confirmation flows never expose raw provider details.
 */
export type AuthErrorCode =
  | "email_rate_limit"
  | "invalid_credentials"
  | "email_not_confirmed"
  | "email_exists"
  | "weak_password"
  | "network_error"
  | "unexpected";

export type AuthEmailAction = "verification" | "password_reset" | "generic";

type ProviderError = { message?: string; code?: string; status?: number };

function normalize(error: unknown) {
  if (typeof error === "string") return error.toLowerCase();
  if (error && typeof error === "object") {
    const value = error as ProviderError;
    return `${value.message || ""} ${value.code || ""} ${value.status || ""}`.toLowerCase();
  }
  return "";
}

export function getAuthErrorCode(error: unknown): AuthErrorCode {
  const value = normalize(error);
  if (/email rate limit|rate limit exceeded|too many requests|over_email_send_rate_limit|\b429\b/.test(value)) return "email_rate_limit";
  if (/invalid login credentials|invalid credentials/.test(value)) return "invalid_credentials";
  if (/email not confirmed/.test(value)) return "email_not_confirmed";
  if (/already registered|already exists|user already registered/.test(value)) return "email_exists";
  if (/password should be at least|weak password/.test(value)) return "weak_password";
  if (/network|fetch failed|failed to fetch|load failed/.test(value)) return "network_error";
  return "unexpected";
}

export function getAuthErrorMessage(
  code: AuthErrorCode,
  locale: "en" | "tr" = "en",
  action: AuthEmailAction = "generic",
) {
  const tr = locale === "tr";
  const messages: Record<Exclude<AuthErrorCode, "email_rate_limit">, [string, string]> = {
    invalid_credentials: ["The email address or password is incorrect.", "E-posta adresi veya şifre hatalı."],
    email_not_confirmed: ["Please verify your email before signing in.", "Giriş yapmadan önce e-posta adresinizi doğrulayın."],
    email_exists: ["An account already exists with this email address. Please sign in or reset your password.", "Bu e-posta adresiyle zaten bir hesap var. Giriş yapın veya şifrenizi sıfırlayın."],
    weak_password: ["Use a password that meets all security requirements.", "Tüm güvenlik kurallarını karşılayan bir şifre kullanın."],
    network_error: ["We could not reach Ourside. Check your connection and try again.", "Ourside'a ulaşılamadı. Bağlantınızı kontrol edip tekrar deneyin."],
    unexpected: ["We could not complete this request. Please try again.", "Bu işlem tamamlanamadı. Lütfen tekrar deneyin."],
  };
  if (code !== "email_rate_limit") return messages[code][tr ? 1 : 0];
  if (action === "password_reset") return tr
    ? "Çok fazla şifre sıfırlama maili istendi. Lütfen birkaç dakika sonra tekrar deneyin."
    : "Too many password reset emails were requested. Please wait a few minutes and try again.";
  return tr
    ? "Çok fazla doğrulama maili gönderildi. Lütfen birkaç dakika sonra tekrar deneyin."
    : "Too many verification emails were requested. Please wait a few minutes and try again.";
}

export function mapAuthError(error: unknown, action: AuthEmailAction = "generic") {
  const code = getAuthErrorCode(error);
  return { code, message: getAuthErrorMessage(code, "en", action) };
}
