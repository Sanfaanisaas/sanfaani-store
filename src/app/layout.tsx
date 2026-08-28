import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/lib/redux/Providers";
import ConsentBanner from "@/components/ConsentBanner";
import { siteMetadataBase, siteUrl } from "@/lib/site";
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", weight: ["500", "600", "700"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
export const metadata: Metadata = { metadataBase: siteMetadataBase, title: { default: "Sanfaani Store & Repair", template: "%s | Sanfaani" }, description: "Condition-checked devices and repair tracking from Sanfaani.", alternates: siteUrl ? { canonical: "/" } : undefined, openGraph: { type: "website", siteName: "Sanfaani Store & Repair", title: "Sanfaani Store & Repair", description: "Condition-checked devices and repair tracking from Sanfaani." } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body className={fraunces.variable + " " + inter.variable}><a href="#main-content" className="skip-link">Skip to content</a><Providers>{children}<ConsentBanner /></Providers></body></html>; }
