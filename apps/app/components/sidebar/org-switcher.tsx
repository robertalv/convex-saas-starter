"use client"

import * as React from "react"
import { Building, CheckCircle, ChevronsUpDown, LogOut, Palette, Plus, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar"
import { ActiveOrg } from "@/types"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { useMutation } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api"
import { Id } from "@workspace/backend/convex/_generated/dataModel"
import { useTheme } from "next-themes"
import { useAuthActions } from "@convex-dev/auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"

export function OrgSwitcher({
  orgs,
  activeOrg
}: {
  orgs: ActiveOrg[],
  activeOrg: ActiveOrg | undefined
}) {
  const { isMobile } = useSidebar()
  const setActive = useMutation(api.organization.setActiveOrganization)
  const { theme, setTheme } = useTheme()
  const { signOut } = useAuthActions();

  if (!activeOrg) {
    return null
  }

  const handleSetActive = (orgId: string) => {
    if (orgId !== activeOrg._id) {
      setActive({ orgId: orgId as Id<"organization"> });
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center text-sidebar-primary-foreground">
                <Avatar>
                  <AvatarImage src={activeOrg.image} alt={activeOrg.name} />
                  <AvatarFallback style={{ backgroundColor: activeOrg.color }}>
                    {activeOrg.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeOrg.name}
                </span>
                <span className="truncate text-xs">{activeOrg.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-72"
            align="start"
            side={"bottom"}
            sideOffset={4}
          >
            {orgs.map((org, index) => (
              <DropdownMenuItem
                key={org.name}
                onClick={() => handleSetActive(org?._id)}
                className="gap-2"
              >
                <div className="flex size-6 items-center justify-center border">
                  <Avatar className="size-6">
                    <AvatarImage src={org.image} alt={org.name} />
                    <AvatarFallback style={{ backgroundColor: org.color }}>
                      {org.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{org.name}</span>
                  <span className="truncate text-xs">{org.plan}</span>
                </div>
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add organization</div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center">
                <User className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                Account Settings
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center">
                <Building className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                Organization Settings
              </div>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center ml-1">
                  <Palette className="size-4 opacity-70" />
                </div>
                <div className="flex flex-row items-center justify-between w-full">
                  <span className="font-medium text-muted-foreground">Theme</span>
                  <span className="font-mono text-xs">
                    {(theme ?? '').charAt(0).toUpperCase() + (theme ?? '').slice(1)}
                  </span>
                </div>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="gap-2">
                <DropdownMenuItem
                  onClick={() => setTheme("light")}
                  className="gap-2 p-2"
                >
                  <div className="flex items-center justify-between w-full">
                    Light
                    {theme === "light" && <CheckCircle className="ml-2 h-4 w-4" />}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("dark")}
                  className="gap-2 p-2"
                >
                  <div className="flex items-center justify-between w-full">
                    Dark
                    {theme === "dark" && <CheckCircle className="ml-2 h-4 w-4" />}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("system")}
                  className="gap-2 p-2"
                >
                  <div className="flex items-center justify-between w-full">
                    System
                    {theme === "system" && <CheckCircle className="ml-2 h-4 w-4" />}
                  </div>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2" onClick={() => signOut()}>
              <div className="flex size-6 items-center justify-center">
                <LogOut className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Signout</div>
            </DropdownMenuItem>

          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
