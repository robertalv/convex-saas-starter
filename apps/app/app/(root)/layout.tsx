import { SidebarProvider, SidebarTrigger } from "@workspace/ui/components/sidebar"
import { AppSidebar } from "./components/app-sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  )
}