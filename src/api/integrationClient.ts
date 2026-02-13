import { httpClient, normalizeApiError } from "./httpClient";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000").trim();

function toPath(endpoint: string) {
  if (endpoint.startsWith("/")) {
    return endpoint;
  }

  return `/${endpoint}`;
}

export async function postIntegration<T, P = unknown>(
  endpoint: string,
  payload: P,
  accessToken: string
): Promise<T> {
  try {
    const response = await httpClient.post<T>(`${API_BASE_URL}${toPath(endpoint)}`, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
