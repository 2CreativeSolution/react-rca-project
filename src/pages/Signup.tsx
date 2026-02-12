import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { setAccessToken } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password.trim()
      );

      const idToken = await userCredential.user.getIdToken();

      setAccessToken(idToken);

      await fetch("http://localhost:4000/api/sync-user", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${idToken}`
        }
      });

      navigate("/dashboard");

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-semibold mb-6 text-center">
          Create Your Account
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <div className="text-red-600 text-sm mb-4 text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleSignup}
          className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-3 rounded-lg font-medium"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}
