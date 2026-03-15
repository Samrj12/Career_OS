"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitGraph,
  MessageSquareHeart,
  PenLine,
  BookOpen,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/graph", icon: GitGraph, label: "Career Graph" },
  { href: "/meet", icon: MessageSquareHeart, label: "Meet AI" },
  { href: "/log", icon: PenLine, label: "Log Activity" },
  { href: "/reflect", icon: BookOpen, label: "Reflect" },
  { href: "/review", icon: BarChart3, label: "Weekly Review" },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="flex w-16 flex-col items-center border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] py-4 gap-1 lg:w-56 lg:items-start lg:px-3">
      {/* Logo */}
      <div className="mb-4 flex items-center gap-2 px-1 lg:px-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold text-sm shrink-0">
          RJ
        </div>
        <span className="hidden text-sm font-bold lg:block">RJ-OS</span>
      </div>

      {/* Nav links */}
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            title={label}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg transition-colors lg:w-full lg:justify-start lg:gap-3 lg:px-3",
              isActive
                ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
                : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="hidden text-sm font-medium lg:block">{label}</span>
          </Link>
        );
      })}
    </aside>
  );
}
