import type { ReactNode } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";

type Props = {
  children: ReactNode;
};

export default function MainLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="flex min-h-screen flex-col">
        <Header />

        <main className="flex-1">
          <div className="mx-auto w-full max-w-6xl px-6 py-8">
            {children}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
