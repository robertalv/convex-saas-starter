"use client";

import Signin from "@/app/(auth)/signin/[[...signin]]/page";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";

export default function RootPage() {
  const { signOut } = useAuthActions();

  return (
    <div>
      <AuthLoading>
        <span>Loading...</span>
      </AuthLoading>
      <Authenticated>
        <div>
          You're authenticated!
          <button onClick={() => signOut()}>Sign out</button>
        </div>
      </Authenticated>
      <Unauthenticated>
        <Signin />
      </Unauthenticated>
    </div>
  );
}
