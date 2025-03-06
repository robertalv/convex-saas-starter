"use client";

import { api } from "@workspace/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { OrganizationWithPlan } from "@/types/organization";

export function useOrganization() {
  const organization = useQuery(api.organization.getActiveOrganization) as OrganizationWithPlan | undefined;

  return {
    organization,
    isLoading: organization === undefined,
  };
}
