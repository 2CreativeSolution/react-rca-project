const SF_BASE_URL =
  "https://2creativercaplayground-dev-ed.develop.my.salesforce.com/services/apexrest/api/integration";

type ApiResponse<T> = {
  success: boolean;
  result?: T;
  message?: string;
};

export async function callIntegration<T>(
  token: string,
  payload: Record<string, unknown>
): Promise<T> {
  const res = await fetch(SF_BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data: ApiResponse<T> = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Salesforce API error");
  }

  return data.result as T;
}
