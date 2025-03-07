import { AppSidebar } from "@/components/sidebar/app-sidebar";
import Topbar from "@/components/topbar";
import { Toaster } from "@workspace/ui/components/sonner";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  return (
    <>
      <AppSidebar />
      <div className="flex flex-col w-full">
        <Topbar />
        <main className="p-4">
          {children}
        </main>
      </div>
      <Toaster />
    </>
  )
}
