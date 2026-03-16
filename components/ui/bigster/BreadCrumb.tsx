"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BreadcrumbProps {

  title: string;
}

export function Breadcrumb({ title }: BreadcrumbProps) {
  const router = useRouter();

  return (
    <div
      className="flex items-center justify-between py-4 px-5 bg-bigster-background"
      style={{ background: "rgb(254, 241, 154)" }}
    >

      <h3 className="text-[18px] font-bold text-bigster-text">{title}</h3>

      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 bg-transparent border-none cursor-pointer text-bigster-text hover:opacity-70 transition-opacity"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-semibold underline underline-offset-2">
          Torna indietro
        </span>
      </button>
    </div>
  );
}

export default Breadcrumb;
