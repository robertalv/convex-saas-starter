"use client";

import Signin from "@/app/(auth)/signin/[[...signin]]/page";
import { Authenticated, AuthLoading, Unauthenticated, useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend/convex/_generated/api";
import OnboardingPage from "./onboarding/page";
import { useRouter } from "next/navigation";
import { ViewerUser } from "@/types";
import Image from "next/image";
import { useEffect } from "react";

export default function RootPage() {
  const router = useRouter();

  const user = useQuery(api.users.viewer) as ViewerUser;
  const update = useMutation(api.users.update);

  useEffect(() => {
    if (user?.isOnboardingComplete) {
      router.push(`${user.activeOrg?.slug}/dashboard`);
    }
  }, [user?.isOnboardingComplete, router]);

  return (
    <div>
      <AuthLoading>
        <div className="flex items-center justify-center h-screen w-screen">
          <div className="animate-spin">
            <Image src="/convex.png" alt="Convex Logo" width={60} height={60} />
          </div>
        </div>
      </AuthLoading>
      <Authenticated>
        {!user?.isOnboardingComplete ? (
          <div>
            {user && (
              <div className="flex items-center justify-center h-screen w-screen">
                <OnboardingPage
                  update={update}
                  user={user}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-screen w-screen">
            <div className="animate-spin">
              <Image src="/convex.png" alt="Convex Logo" width={60} height={60} />
            </div>
          </div>
        )}
      </Authenticated>
      <Unauthenticated>
        <div className="flex items-center justify-center h-screen w-screen">
          <Signin />
        </div>
      </Unauthenticated>
    </div>
  );
}