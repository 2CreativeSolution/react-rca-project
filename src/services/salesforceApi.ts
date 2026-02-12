// import { auth } from "../firebase";

// const BASE_URL = "https://2creativercaplayground-dev-ed.develop.my.salesforce-sites.com";


// export async function callIntegration<T>(payload: unknown): Promise<T> {
//   const user = auth.currentUser;

//   if (!user) {
//     throw new Error("User not authenticated");
//   }

//   const token = await user.getIdToken();

//   console.log("Calling Salesforce API with token:", token);

//   const response = await fetch(
//     `${BASE_URL}/services/apexrest/api/integration`,
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "X-Auth-Token": `Bearer ${token}`,
//       },
//       body: JSON.stringify(payload),
//     }
//   );

//   const data = await response.json();

//   if (!data.success) {
//     throw new Error(data.message || "API error");
//   }

//   return data.result as T;
// }

import { auth } from "../firebase";

const BASE_URL = "http://localhost:4000";

export async function callIntegration<T, P = unknown>(
  endpoint: string,
  payload: P
): Promise<T> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User not authenticated");
  }

  const token = await user.getIdToken();

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Backend error");
  }

  return response.json() as Promise<T>;
}

