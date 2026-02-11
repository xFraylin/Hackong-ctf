import type React from "react"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { Breadcrumb } from "@/components/breadcrumb"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/acceso-denegado")
  }

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardNavbar />
      <Breadcrumb />
      <main className="flex-1">{children}</main>
    </div>
  )
}
