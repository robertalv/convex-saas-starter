"use client";

import Signin from "app/(auth)/signin/page";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";

export default function RootPage() {
  return (
    <div>
      <AuthLoading>
        <span>Loading...</span>
      </AuthLoading>
      <Authenticated>
        <div>
          You're authenticated!
        </div>
      </Authenticated>
      <Unauthenticated>
        <Signin />
      </Unauthenticated>
    </div>
  );
}
