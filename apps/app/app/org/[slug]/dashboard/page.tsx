"use client";

import { useParams } from "next/navigation";
import { api } from "@workspace/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { OrganizationWithPlan } from "@/types";

export default function OrganizationDashboardPage() {
  const params = useParams();
  const { slug } = params as { slug: string };
  
  // Get organization by slug
  const organization = useQuery(api.organization.getOrganizationBySlug, {
    slug
  }) as OrganizationWithPlan;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {organization?.name} Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome to your organization dashboard
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Dashboard content would go here */}
        <div className="border rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-medium mb-2">Overview</h3>
          <p>Your organization dashboard content</p>
        </div>
      </div>
    </div>
  );
}
