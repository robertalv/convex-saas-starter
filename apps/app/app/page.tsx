"use client";

import Signin from "@/app/(auth)/signin/[[...signin]]/page";
import { Authenticated, AuthLoading, Unauthenticated, useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@workspace/backend/convex/_generated/api";
import { Onboarding } from "@/app/(root)/onboarding/page";
import { useRouter } from "next/navigation";
import { User, ActiveOrg } from "@/types";
import Image from "next/image";

export default function RootPage() {
  const router = useRouter();
  const { signOut } = useAuthActions();

  const user = useQuery(api.users.viewer) as (User & { activeOrg?: ActiveOrg }) | null;
  const update = useMutation(api.users.update);

  return (
    <div>
      <AuthLoading>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin">
            <Image src="/convex.png" alt="Convex Logo" width={60} height={60} />
          </div>
        </div>
      </AuthLoading>
      <Authenticated>
        {!user?.isOnboardingComplete ? (
          <div>
            {user && (
              <Onboarding
                update={update}
                user={user}
              />
            )}
          </div>
        ) : (
          <div>
            Dashboard
          </div>
        )}
      </Authenticated>
      <Unauthenticated>
        <Signin />
      </Unauthenticated>
    </div>
  );
}
