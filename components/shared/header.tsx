"use client";

import { useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { selectCurrentUser } from "@/lib/redux/features/auth/authSlice";
import { LogOut, ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV_LINKS = [
  { name: "Selezioni", href: "/selezioni" },
  { name: "Candidature", href: "/candidature" },
  { name: "Test BigsTer", href: "/test-bigster" },
];

function getInitials(nome?: string, cognome?: string): string {
  if (nome && cognome) return `${nome[0]}${cognome[0]}`.toUpperCase();
  return "BS";
}

function getDisplayName(nome?: string, cognome?: string): string {
  if (nome && cognome) return `${nome} ${cognome}`;
  return "Utente";
}

export function Header() {
  const user = useSelector(selectCurrentUser);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    router.push("/login");
  };

  const initials = getInitials(user?.nome, user?.cognome);
  const displayName = getDisplayName(user?.nome, user?.cognome);

  const isActive = (href: string) =>
    "/" + pathname.split("/")[1] === "/" + href.split("/")[1];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 bg-bigster-surface border-b border-bigster-border h-[69px]">

      <div className="flex items-center gap-8">

        <Link
          href="/selezioni"
          className="flex items-center gap-2"
          prefetch={false}
        >
          <Image
            src="/logo_header.png"
            alt="BigSter"
            width={120}
            height={40}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`px-4 py-2 text-[15px] transition-colors ${isActive(link.href)
                ? "bg-bigster-primary text-bigster-primary-text font-bold"
                : "text-bigster-text hover:bg-bigster-muted-bg"
                }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="rounded-none border border-bigster-border"
              >
                <Menu className="h-5 w-5 text-bigster-text" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-bigster-surface">
              <nav className="flex flex-col gap-1 mt-8">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-4 py-3 text-[15px] transition-colors ${isActive(link.href)
                      ? "bg-bigster-primary text-bigster-primary-text font-bold"
                      : "text-bigster-text hover:bg-bigster-muted-bg"
                      }`}
                  >
                    {link.name}
                  </Link>
                ))}

                <div className="mt-4 pt-4 border-t border-bigster-border">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-[15px] text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Esci
                  </button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-bigster-muted-bg transition-colors focus:outline-none">
              <div className="flex items-center justify-center w-9 h-9 bg-bigster-card-bg border border-bigster-border text-bigster-text font-semibold text-sm">
                {initials}
              </div>
              <span className="hidden sm:block text-sm font-medium text-bigster-text">
                {displayName}
              </span>
              <ChevronDown className="hidden sm:block w-4 h-4 text-bigster-text-muted" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56 rounded-none border border-bigster-border bg-bigster-surface p-0 shadow-lg"
          >

            <div className="px-4 py-3 border-b border-bigster-border bg-bigster-card-bg">
              <p className="text-sm font-semibold text-bigster-text">
                {displayName}
              </p>
              {user?.email && (
                <p className="text-xs text-bigster-text-muted mt-0.5">
                  {user.email}
                </p>
              )}
              {user?.ruolo && (
                <p className="text-xs text-bigster-text-muted mt-0.5">
                  {user.ruolo.replace(/_/g, " ")}
                </p>
              )}
            </div>

            <div className="p-1">
              <DropdownMenuItem
                onClick={handleLogout}
                className="rounded-none px-3 py-2.5 text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer focus:bg-red-50 focus:text-red-700"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Esci dall'account
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
