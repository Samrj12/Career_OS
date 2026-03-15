import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarNav } from "@/components/SidebarNav";
import { isOnboardingComplete } from "@/actions/onboarding";
import { redirect } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RJ-OS — Career Operating System",
  description: "Personal AI-powered career coach, planner, and graph",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const onboarded = await isOnboardingComplete();

  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {!onboarded ? (
          // Onboarding: full screen, no sidebar
          <OnboardingGate>{children}</OnboardingGate>
        ) : (
          // Main app: sidebar + content
          <div className="flex h-screen overflow-hidden bg-[hsl(var(--background))]">
            <SidebarNav />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        )}
      </body>
    </html>
  );
}

// Simple gate: if not onboarded and not on /onboarding, redirect
async function OnboardingGate({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
