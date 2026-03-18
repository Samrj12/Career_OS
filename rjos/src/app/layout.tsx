import type { Metadata } from "next";
import { Inter, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/TopNav";
import { isOnboardingComplete } from "@/actions/onboarding";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
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
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} ${geistMono.variable} antialiased selection:bg-black selection:text-white`}>
        {!onboarded ? (
          <div className="min-h-screen">
            {children}
          </div>
        ) : (
          <div className="min-h-screen">
            <TopNav />
            <main className="pt-[56px]">
              {children}
            </main>
          </div>
        )}
      </body>
    </html>
  );
}

async function OnboardingGate({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
