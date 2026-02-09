
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kimchi Premium Dashboard",
  description: "Real-time Kimchi Premium monitoring and backtesting",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <QueryProvider>
          <Navbar />
          <main className="container py-6">
            {children}
          </main>
        </QueryProvider>
      </body>
    </html>
  );
}
