import { Geist, Geist_Mono, Inter, DM_Sans } from "next/font/google";
import "./globals.css";
import React from 'react'
import Header from './components/header'

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
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
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
});

export const metadata = {
  title: "clubhouse",
  description: "Bruinwalk for Clubs",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${dmSans.variable} antialiased flex flex-col min-h-screen`}
      >
        <Header />
        <main className="grow">{children}</main>
        <footer className="bg-gray-200 h-auto py-15 px-30 mt-20 bg-gradient-to-b from-[#FFFFFF] to-[#DCE8FF] -z-10">
          <h3 className="text-lg mb-5">Have questions or feedback? Want to collaborate?</h3>
          <p>We’d love to hear from you!</p>
          <p>Whether you’re a student with suggestions, a club rep hoping to update your listing, or just curious about how we verify reviews — reach out anytime.</p>
          <br />
          <p>Email: clubhouseucla@gmail.com</p>
          <p>Instagram: INSTAGRAM</p>
          <p>LinkedIn: LINKEDIN</p>
          <br />
          <p>Let’s build a more transparent, connected UCLA community — together.</p>
        </footer>
      </body>
    </html>
  );
}
