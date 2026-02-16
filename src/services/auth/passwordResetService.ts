import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../auth/firebaseClient";

export async function requestPasswordReset(email: string): Promise<void> {
  const normalizedEmail = email.trim();

  if (!normalizedEmail) {
    throw new Error("Email is required to reset your password.");
  }

  await sendPasswordResetEmail(auth, normalizedEmail);
}
