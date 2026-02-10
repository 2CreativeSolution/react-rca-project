// import { useAuth } from "../context/useAuth";
// import { useNavigate } from "react-router-dom";
import { loginWithSalesforce } from "../auth/salesforceLogin";


export default function Login() {
  // const { login } = useAuth();
  // const navigate = useNavigate();

  // const handleLogin = () => {
  //   login();
  //   navigate("/dashboard");
  // };

  return (
    <div>
      <h1>Login Page</h1>
      <button
        onClick={loginWithSalesforce}
        className="mt-4 bg-blue-600 text-white px-4 py-2"
      >
        Login with Salesforce
      </button>
    </div>
  );
}
