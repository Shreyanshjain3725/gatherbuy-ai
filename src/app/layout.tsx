import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { DemoBanner } from "@/components/demo-banner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GatherBuy AI — Collaborative Purchasing and Payments",
  description:
    "An intelligent agent for collaborative purchasing and payments. Buy together. Save together. Pay fairly.",
  keywords: [
    "group buying",
    "collaborative payments",
    "PayPal Sandbox",
    "AI procurement",
    "FairShare",
    "fintech SaaS",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable} dark`}>
      <body className="bg-navy-950 text-slate-100 min-h-screen flex flex-col font-sans selection:bg-emerald-500 selection:text-navy-950">
        <DemoBanner />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
