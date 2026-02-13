import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Navbar() {
  const { isLoggedIn, logout } = useAuth();
  const handleLogout = () => {
    void logout();
  };

  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Brand */}
        <Link to="/" className="text-xl font-semibold text-blue-700">
          MyConnect
        </Link>

        {/* Navigation */}
        {isLoggedIn && (
          <nav className="flex gap-6 text-sm font-medium text-gray-700">
            <Link to="/services">My Services</Link>
            <Link to="/plans">Plans & Upgrades</Link>
            <Link to="/billing">Billing</Link>
            <Link to="/support">Support</Link>
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-4 text-sm">
          {!isLoggedIn && (
            <Link
              to="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Login
            </Link>
          )}

          {isLoggedIn && (
            <>
              <Link to="/settings" className="text-gray-600">
                Account
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-black"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
