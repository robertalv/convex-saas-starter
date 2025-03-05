import { SidebarProvider, SidebarTrigger } from "@cvxstarter/ui/components/ui/sidebar"
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