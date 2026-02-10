import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Header() {
  const { isLoggedIn, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          React RCA
        </Link>

        <nav className="flex flex-wrap items-center gap-4 text-sm">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <Link to="/products" className="hover:underline">
            Products
          </Link>
          <Link to="/cart" className="hover:underline">
            Cart
          </Link>
          <Link to="/dashboard" className="hover:underline">
            Dashboard
          </Link>
          <Link to="/settings" className="hover:underline">
            Settings
          </Link>

          {isLoggedIn ? (
            <button
              type="button"
              onClick={logout}
              className="rounded bg-gray-900 px-3 py-1.5 font-medium text-white hover:bg-gray-800"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded bg-gray-900 px-3 py-1.5 font-medium text-white hover:bg-gray-800"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

