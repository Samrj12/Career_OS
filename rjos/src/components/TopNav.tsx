"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitBranch,
  MessageCircle,
  BookOpen,
  PenLine,
  BarChart3,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/graph", label: "Graph", icon: GitBranch },
  { href: "/meet", label: "Meet", icon: MessageCircle },
  { href: "/log", label: "Log", icon: BookOpen },
  { href: "/reflect", label: "Reflect", icon: PenLine },
  { href: "/review", label: "Review", icon: BarChart3 },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[56px] backdrop-blur-lg bg-[var(--paper)]/80 border-b-0">
      <div className="max-w-[1200px] mx-auto h-full flex items-center justify-between px-6">
        {/* Left: Logo with pushpin */}
        <Link href="/" className="flex items-center gap-1 relative">
          <Image
            src="/assets/stationary_elements/Effx968261ztSs30esQUEHvmIsM (1).png"
            alt=""
            width={22}
            height={22}
            className="absolute -top-2 -left-3 -rotate-[15deg] pointer-events-none select-none"
          />
          <span className="font-[family-name:var(--font-playfair)] text-[18px] font-bold text-[var(--ink)] tracking-tight pl-2">
            RJ-OS
          </span>
        </Link>

        {/* Center: Nav links */}
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            const pinColor = item.href === "/meet" ? "orange" : "blue";

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-full transition-colors ${
                  isActive
                    ? "text-[var(--ink)]"
                    : "text-[var(--ink-3)] hover:text-[var(--ink-2)]"
                }`}
              >
                {/* Active pushpin */}
                {isActive && (
                  <Image
                    src={
                      pinColor === "orange"
                        ? "/assets/stationary_elements/Effx968261ztSs30esQUEHvmIsM (1).png"
                        : "/assets/stationary_elements/8dV3aCqzCVySc1GF1CYVK0gQcQI.png"
                    }
                    alt=""
                    width={16}
                    height={16}
                    className="absolute -top-2.5 left-1/2 -translate-x-1/2 animate-pin-drop pointer-events-none select-none"
                  />
                )}
                <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2 : 1.5} />
                <span className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.1em]">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Right: Profile sticker badge */}
        <div className="flex items-center">
          <Image
            src="/assets/stationary_elements/nyvSVKFMBtlEMCzUKDHWMx8VNYs.png"
            alt="Profile"
            width={28}
            height={28}
            className="cursor-pointer hover:scale-110 transition-transform select-none"
          />
        </div>
      </div>

      {/* Bottom dashed border using squiggly SVG */}
      <div className="absolute bottom-0 left-0 right-0 h-[4px] overflow-hidden opacity-40">
        <img
          src="/assets/swiggly_lines/71bb5fe4-3604-472e-822f-19b217bdddd6.svg"
          alt=""
          className="w-full h-[4px] object-cover pointer-events-none select-none"
        />
      </div>
    </nav>
  );
}
