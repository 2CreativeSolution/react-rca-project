import { callSalesforceIntegration } from "../api/salesforceClient";

export async function callIntegration<T>(
  token: string,
  payload: Record<string, unknown>
): Promise<T> {
  return callSalesforceIntegration<T>(token, payload);
}
