import {
  SALESFORCE_DOMAIN,
  CLIENT_ID,
  REDIRECT_URI,
} from "./salesforceConfig";

export function loginWithSalesforce() {
  const params = new URLSearchParams({
    response_type: "token", // implicit flow (simpler for now)
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
  });

  window.location.href =
    `${SALESFORCE_DOMAIN}/services/oauth2/authorize?${params.toString()}`;
}
