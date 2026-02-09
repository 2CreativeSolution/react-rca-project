import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex gap-6">
      <Link to="/" className="hover:underline">
        Home
      </Link>
      <Link to="/login" className="hover:underline">
        Login
      </Link>
      <Link to="/dashboard" className="hover:underline">
        Dashboard
      </Link>
      <Link to="/cart" className="hover:underline">
        Cart
      </Link>
    </nav>
  );
}
