import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Fonte profissional
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Queridômetro",
  description: "Vote nos seus amigos diariamente."
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" className={inter.variable}>
      <body className="bg-zinc-950 text-zinc-50 antialiased font-sans selection:bg-red-500/30">
        {children}
      </body>
    </html>
  );
}