import { SALESFORCE_DOMAIN } from "../auth/salesforceConfig";
import { httpClient, normalizeApiError } from "./httpClient";

const SF_INTEGRATION_URL = `${SALESFORCE_DOMAIN}/services/apexrest/api/integration`;

type SalesforceApiResponse<T> = {
  success: boolean;
  result?: T;
  message?: string;
};

export async function callSalesforceIntegration<T>(
  token: string,
  payload: Record<string, unknown>
): Promise<T> {
  try {
    const response = await httpClient.post<SalesforceApiResponse<T>>(
      SF_INTEGRATION_URL,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = response.data;
    if (!data.success) {
      throw new Error(data.message || "Salesforce API error");
    }

    return data.result as T;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
