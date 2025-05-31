"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useIsMobile } from "@/hooks/use-mobile"
import { LayoutDashboard, ListTodo, BarChart2, Users, Settings, HelpCircle } from "lucide-react"

interface SidebarProps {
  pathname: string
}

export function Sidebar({ pathname }: SidebarProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return null
  }

  return (
    <div className="hidden border-r bg-background md:block">
      <div className="flex h-[calc(100vh-4rem)] flex-col gap-2">
        <ScrollArea className="flex-1 px-3 py-4">
          <div className="flex flex-col gap-1">
            <Link href="/dashboard">
              <Button
                variant={pathname === "/dashboard" ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/habits">
              <Button
                variant={pathname.startsWith("/habits") ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
              >
                <ListTodo className="h-4 w-4" />
                Habits
              </Button>
            </Link>
            <Link href="/analytics">
              <Button
                variant={pathname === "/analytics" ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
              >
                <BarChart2 className="h-4 w-4" />
                Analytics
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant={pathname === "/settings" ? "secondary" : "ghost"} className="w-full justify-start gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </Link>
          </div>
        </ScrollArea>
        <div className="mt-auto p-4">
          <Link href="/help">
            <Button variant="outline" className="w-full justify-start gap-2">
              <HelpCircle className="h-4 w-4" />
              Help & Support
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
