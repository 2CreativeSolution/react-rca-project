import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    login();
    navigate("/dashboard");
  };

  return (
    <div>
      <h1>Login Page</h1>
      <button
        onClick={handleLogin}
        className="mt-4 bg-black text-white px-4 py-2"
      >
        Fake Login
      </button>
    </div>
  );
}
