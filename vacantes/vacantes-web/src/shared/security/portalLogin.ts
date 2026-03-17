const DEFAULT_PORTAL_LOGIN_URL = "http://localhost:5173/login-empleado";

function toAbsoluteReturnUrl(value: string): string {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  const normalized = value.startsWith("/") ? value : `/${value}`;
  return `${window.location.origin}${normalized}`;
}

export function buildPortalLoginUrl(returnUrl?: string): string {
  const loginUrl = import.meta.env.VITE_PORTAL_LOGIN_URL || DEFAULT_PORTAL_LOGIN_URL;
  const url = new URL(loginUrl, window.location.origin);

  if (returnUrl) {
    url.searchParams.set("returnUrl", toAbsoluteReturnUrl(returnUrl));
  }

  return url.toString();
}

export function currentReturnUrl(): string {
  const path = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  return path || "/app/vacantes/rh/dashboard";
}
