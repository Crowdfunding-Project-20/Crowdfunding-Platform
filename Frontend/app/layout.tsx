import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Custom fonts, self-hosted from app/fonts/ (see DESIGN.md — Clash Display for headings, Epilogue for body).
const clashDisplay = localFont({
  src: [
    { path: "./fonts/ClashDisplay-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ClashDisplay-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/ClashDisplay-Semibold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/ClashDisplay-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-clash-display",
  display: "swap",
});

const epilogue = localFont({
  src: [
    { path: "./fonts/Epilogue-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Epilogue-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Epilogue-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/Epilogue-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-epilogue",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nkoso",
  description: "Crowdfunding for community projects",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
        clashDisplay.variable,
        epilogue.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
