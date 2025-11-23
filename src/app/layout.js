import { Geist, Geist_Mono, Inter, DM_Sans } from "next/font/google";
import "./globals.css";
import React from "react";
import Header from "./components/header";
import Footer from "./components/footer";
import Gradient from "./components/gradient";
import { SearchProvider } from "./context/SearchContext";
import { Suspense } from "react";
import LoadingScreen from "./components/LoadingScreen";
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
});

export const metadata = {
  title: "clubhouse",
  description: "Bruinwalk for Clubs",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${geistSans.variable} ${geistMono.variable} ${inter.variable} flex min-h-screen flex-col antialiased`}
      >
        <Suspense fallback={<LoadingScreen />}>
          <SearchProvider>
            <Header />
            <main className="relative min-h-screen overflow-hidden p-6 md:p-20 lg:px-30 md:py-20">
              <Gradient />
              {children}
              <Analytics />
            </main>
            <Footer />
          </SearchProvider>
        </Suspense>
      </body>
    </html>
  );
}
