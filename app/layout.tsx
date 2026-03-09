import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import Footer from "./components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KeyDash - Speed Typing Game",
  description: "A fast-paced typing game that tests your speed and accuracy. Improve your WPM, track your progress, and compete with players worldwide.",
  keywords: ["typing game", "typing test", "WPM", "typing speed", "keyboard game"],
  openGraph: {
    title: "KeyDash - Speed Typing Game",
    description: "A fast-paced typing game that tests your speed and accuracy. Improve your WPM, track your progress, and compete with players worldwide.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen relative`}
      >
        {/* Subtle background grid */}
        <div
          className="fixed inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Glow blob */}
        <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-indigo-600 opacity-10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 min-h-screen">
          <AuthProvider>
            {children}
            <Footer />
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
