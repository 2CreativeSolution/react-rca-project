import { postIntegration } from "../api/integrationClient";
import { auth } from "../auth/firebaseClient";

export async function callIntegration<T, P = unknown>(
  endpoint: string,
  payload: P
): Promise<T> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User not authenticated");
  }

  const token = await user.getIdToken();
  return postIntegration<T, P>(endpoint, payload, token);
}
