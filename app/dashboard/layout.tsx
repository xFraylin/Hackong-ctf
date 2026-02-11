import type React from "react"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { Breadcrumb } from "@/components/breadcrumb"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardNavbar />
      <Breadcrumb />
      <main className="flex-1">{children}</main>
    </div>
  )
}
