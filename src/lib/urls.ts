export const resolveBaseUrl = () => {
  const envBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL;

  if (envBaseUrl) {
    return envBaseUrl.startsWith('http') ? envBaseUrl : `https://${envBaseUrl}`;
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Fallback for server-side rendering if no env var is set
  return 'http://localhost:3000';
};
