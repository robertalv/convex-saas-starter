"use client";

import { useEffect } from "react";
import { notFound, useParams } from "next/navigation";
import { api } from "@workspace/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { Loader } from "lucide-react";

export default function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const { slug } = params as { slug: string };
  
  // Get organization by slug
  const organization = useQuery(api.organization.getOrganizationBySlug, {
    slug
  });
  
  // Check if the user has access to this organization
  const user = useQuery(api.users.viewer);
  const hasOrgAccess = user?.orgIds?.some(org => org.id === organization?._id);
  
  // Handle loading state
  if (!organization || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  // Handle organization not found
  if (!organization) {
    notFound();
  }
  
  // Handle unauthorized access
  if (!hasOrgAccess) {
    // Redirect to join page or login
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-y-4">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p>You don't have access to this organization.</p>
      </div>
    );
  }
  
  return <>{children}</>;
}
