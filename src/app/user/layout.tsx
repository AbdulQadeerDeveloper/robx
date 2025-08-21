import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import SidebarWrapper from "@/Components/Sidebar/SidebarWrapper";
import Navbar from "@/Components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Task Management App",
  description: "A simple and responsive task management application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <div
        className={`h-screen grid grid-cols-1 md:grid-cols-12 grid-rows-[auto_1fr_auto] overflow-hidden ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SidebarWrapper />

        <nav className="col-span-full xl:col-span-9 2xl:col-span-10 xl:col-start-4 2xl:col-start-3 row-start-1">
          <Navbar />
        </nav>

        <main className="relative col-span-full xl:col-span-9 2xl:col-span-10 xl:col-start-4 2xl:col-start-3 row-start-2 overflow-y-auto">
          {children}
        </main>
      </div>
    </html>
  );
}
