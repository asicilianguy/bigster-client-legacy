"use client";

import type React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Menu,
  FileText,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/selezioni", label: "Selezioni", icon: Briefcase },
  { href: "/annunci", label: "Annunci", icon: FileText },
  { href: "/candidature", label: "Candidature", icon: ClipboardCheck },
  {
    href: "/gestione/figure-professionali",
    label: "Gestione",
    icon: Users,
  },
];

function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
}) {
  return (
    <Link href={href} legacyBehavior passHref>
      <a
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
          isActive && "bg-muted text-primary"
        )}
      >
        <Icon className="h-4 w-4" />
        {label}
      </a>
    </Link>
  );
}

function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="grid items-start gap-2 px-2 text-sm font-medium lg:px-4">
      {navItems.map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
          label={item.label}
          icon={item.icon}
          isActive={pathname === item.href}
        />
      ))}
    </nav>
  );
}

export function AppSidebar() {
  return (
    <>

      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Image
                src="/logo.png"
                alt="Bigster Logo"
                width={24}
                height={24}
              />
              <span className="">Bigster</span>
            </Link>
          </div>
          <div className="flex-1"></div>
        </div>
      </div>

      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-0">
            <div className="flex h-14 items-center border-b px-4">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <Image
                  src="/logo.png"
                  alt="Bigster Logo"
                  width={24}
                  height={24}
                />
                <span className="">Bigster</span>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </header>
    </>
  );
}
