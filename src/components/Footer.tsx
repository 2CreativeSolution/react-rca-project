import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-gray-700">© 2026 React RCA</p>

        <nav className="flex flex-wrap gap-4">
          <Link to="/terms" className="hover:underline">
            Terms
          </Link>
          <Link to="/privacy" className="hover:underline">
            Privacy
          </Link>
          <Link to="/contact" className="hover:underline">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}

