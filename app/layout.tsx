import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "nomi-nomi",
  description: "AI-powered restaurant search application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${inter.className} bg-gray-50 text-gray-800`}>
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <h1 className="text-2xl font-bold text-gray-900">nomi-nomi</h1>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
