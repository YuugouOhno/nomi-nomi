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
         <header className="bg-white shadow-sm main-header">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex flex-col items-center text-center">
                <img src="/nomi-nomi.png" alt="nomi-nomi logo" className="w-1/8" />
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                  AIが見つける、あなたにぴったりの一軒
                </h2>
            </div>
           </div> 
         </header>
          <main>{children}</main> 
      </body>
    </html>
  );
}
