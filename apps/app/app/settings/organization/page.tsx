"use client";

import React, { memo } from "react";
import { api } from "@workspace/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import OrgCard from "./org-card";
import BillingCard from "./billing-card";
import { OrganizationWithPlan } from "@/types";

const OrganizationSettingsPage = memo(function OrganizationSettingsPage() {
    const organization = useQuery(api.organization.getActiveOrganization) as OrganizationWithPlan;

    return (
        <div className="max-w-full space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
                <p className="text-muted-foreground">Manage your organization settings and preferences</p>
            </div>

            <div className="flex flex-col space-y-6 md:flex-row md:space-x-6 md:space-y-0">
                {/* Profile Section */}
                <div className="w-full md:w-1/2">
                    <OrgCard org={organization} />
                </div>

                {/* Billing Section */}
                <div className="w-full md:w-1/2">
                    <BillingCard org={organization} />
                </div>
            </div>
        </div>
    );
});

OrganizationSettingsPage.displayName = "OrganizationSettingsPage";

export default OrganizationSettingsPage;