import type { Metadata } from "next";
import "./globals.scss";

export const metadata: Metadata = {
  title: "CasAI",
  description: "AI-powered CRISPR base editor redesign workbench",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <a href="/" className="text-2xl font-bold text-blue-600">
                  CasAI
                </a>
                <span className="ml-4 text-sm text-gray-500">
                  CRISPR Base Editor Redesign Workbench
                </span>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
