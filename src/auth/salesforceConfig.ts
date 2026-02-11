function resolveEnvValue(value: string | undefined, fallback: string) {
  const normalized = value?.trim();
  return normalized ? normalized : fallback;
}

export const SALESFORCE_DOMAIN = resolveEnvValue(
  import.meta.env.VITE_SALESFORCE_DOMAIN,
  "https://2creativercaplayground-dev-ed.develop.my.salesforce.com"
);

export const CLIENT_ID = resolveEnvValue(
  import.meta.env.VITE_SALESFORCE_CLIENT_ID,
  "PASTE_CONNECTED_APP_CONSUMER_KEY"
);

export const REDIRECT_URI = resolveEnvValue(
  import.meta.env.VITE_SALESFORCE_REDIRECT_URI,
  "http://localhost:5173/oauth/callback"
);
