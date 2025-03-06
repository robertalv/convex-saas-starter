"use client"

import * as React from "react"

import { NavMain } from "./nav-main"
import { NavProjects } from "./nav-projects"
import { OrgSwitcher } from "./org-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@workspace/ui/components/sidebar"
import { useQuery } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api"
import { ActiveOrg } from "@/types"
import { navMain, projects } from "@/lib/constants"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useQuery(api.users.viewer);
  const orgs = useQuery(api.organization.getUserOrganizations, {
    id: user?._id,
    status: "active"
  });

  if (user === undefined) {
    return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarContent>
          <NavMain items={navMain} />
          <NavProjects projects={projects} />
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    );
  }

  const userOrgs = orgs || [];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrgSwitcher activeOrg={user?.activeOrg} orgs={userOrgs as ActiveOrg[]} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={projects} />
      </SidebarContent>
      <SidebarFooter>
        {/* <NavUser user={demoUser} /> */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
