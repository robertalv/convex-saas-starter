import { AppSidebar } from "../../../components/sidebar/app-sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppSidebar />
      <main className="p-4 w-full md:px-64 sm:px-4">
        {children}
      </main>
    </>
  )
}