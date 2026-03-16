"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import { FileText, Users, Megaphone } from "lucide-react"

const RecruitingLink = ({
  href,
  children,
  icon: Icon,
}: {
  href: string
  children: React.ReactNode
  icon: React.ElementType
}) => {
  const pathname = usePathname()
  const isActive = pathname.startsWith(href)

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} className="justify-start">
        <Link href={href}>
          <Icon className="h-5 w-5" />
          <span className="group-data-[collapsible=icon]:hidden">{children}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function RecruitingStatus() {
  return (
    <SidebarMenu className="pl-6">
      <RecruitingLink href="/selezioni" icon={FileText}>
        Selezioni
      </RecruitingLink>
      <RecruitingLink href="/annunci" icon={Megaphone}>
        Annunci
      </RecruitingLink>
      <RecruitingLink href="/candidature" icon={Users}>
        Candidature
      </RecruitingLink>
    </SidebarMenu>
  )
}
