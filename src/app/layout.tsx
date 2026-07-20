import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/lib/redux/Providers";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Sanfaani Store & Repair",
  description: "Better Tech. Less Stress. The Sanfaani Way.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${inter.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}