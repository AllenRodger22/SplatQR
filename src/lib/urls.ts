const ENV_BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.NEXT_PUBLIC_VERCEL_URL ??
  '';

const normalizeUrl = (url: string) =>
  url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;

export const resolveBaseUrl = () => {
  if (ENV_BASE_URL) {
    return normalizeUrl(ENV_BASE_URL);
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return '';
};
