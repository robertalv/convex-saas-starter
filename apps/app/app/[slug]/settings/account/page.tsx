"use client";

import React, { memo } from "react";
import ProfileCard from "@/app/[slug]/settings/account/profile-card";
import { api } from "@workspace/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { ViewerUser } from "@/types";

const AccountSettingsPage = memo(function AccountSettingsPage() {
  const user = useQuery(api.users.viewer) as ViewerUser | null;

  return (
    <div className="max-w-full space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <div className="flex flex-col space-y-6 md:flex-row md:space-x-6 md:space-y-0">
        {/* Profile Section */}
        <div className="w-full md:w-1/2">
          <ProfileCard user={user} />
        </div>
      </div>
    </div>
  );
});

AccountSettingsPage.displayName = "AccountSettingsPage";

export default AccountSettingsPage;
