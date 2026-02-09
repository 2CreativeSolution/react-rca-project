import type { ReactNode } from "react";
import Navbar from "../components/Navbar";

type Props = {
  children: ReactNode;
};

export default function MainLayout({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 p-6">
        {children}
      </main>

      <footer className="bg-gray-100 text-center p-4 text-sm">
        © 2026 My App
      </footer>
    </div>
  );
}
