"use client"

import { useState, useEffect, useRef } from "react";
import { Button } from "@workspace/ui/components/button";
import { api } from "@workspace/backend/convex/_generated/api";
import type { Id } from "@workspace/backend/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { useEnterCode } from "@/hooks/use-enter-code";
import { useQuery } from "convex/react";
import { CodeInput } from "@/components/auth/code-input";
import { useParams } from "next/navigation";

const JoinPage = () => {
  const router = useRouter();
  const params = useParams();
  const orgId = params.orgId;

  const [isLoading, setIsLoading] = useState(false);

  const user = useQuery(api.users.viewer);
  const { mutate } = useEnterCode();
  const targetOrg = useQuery(api.organization.checkOrganizationId, { orgId: orgId as Id<"organization"> | string })
  console.log("Check: ", targetOrg)

  if (!targetOrg) {
    return (
      <div className={"flex flex-col w-full gap-y-8 items-center justify-center p-8"}>
        <div className="flex flex-col justify-center items-center border p-8  gap-y-4 bg-accent/20 w-md">
          <div className={"flex flex-col gap-y-4 items-center justify-center max-w-md"}>
            <div className={"flex flex-col gap-y-2 items-center justify-center"}>
              <h1 className={"text-2xl font-bold"}>No organization found</h1>
              <p className={"text-sm text-gray-500"}>Check the organization ID and try again</p>
            </div>
            {user && (
              <div className="flex items-center gap-4">
                <Button
                  className='!border-none'
                  onClick={() => router.push(`/${targetOrg?.slug}/dashboard`)}
                >
                  <ChevronLeft />
                  Go to Dashboard
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // useEffect(() => {
  //   if (user) {
  //     if (user.orgIds?.some((org) => org.id === orgId)) {
  //       router.push(`/`);
  //     }
  //   } else {
  //     console.error("No user found");
  //   }
  // }, [user, router, targetOrg, orgId]);

  const handleSubmit = () => {
    // Get the code value from input-otp
    const codeElement = document.getElementById('code') as HTMLInputElement;
    const code = codeElement?.value || '';

    if (!code || code.length !== 8) {
      toast.error("Please enter a valid 8-character code");
      return;
    }

    if (user) {
      if (code === targetOrg?.joinCode) {
        setIsLoading(true);
        mutate({
          orgId: targetOrg._id,
          userId: user._id,
          code: code
        }, {
          onSuccess: () => {
            toast.success("You have successfully joined the organization");
            router.push(`/${targetOrg?.slug}/dashboard`);
          },
          onError: (error) => {
            const errorMessage = error.message || "Unknown error";

            // Handle specific error cases
            if (errorMessage.includes("INVALID_CODE")) {
              toast.error("The code you entered is invalid");
            } else if (errorMessage.includes("NOT_FOUND")) {
              toast.error("User or organization not found");
            } else {
              toast.error(`Failed to join: ${errorMessage}`);
            }
            setIsLoading(false);
          },
          onFinally: () => {
            // Optional cleanup
          }
        });
      } else {
        toast.error("Invalid join code");
      }
    } else {
      toast.error("You must be logged in to join an organization");
      // Redirect to login page
      router.push("/login?redirect=" + encodeURIComponent(`/organization/join/${orgId}`));
    }
  };

  return (
    <div className={"flex flex-col w-full gap-y-8 items-center justify-center p-8"}>
      <div className="flex flex-col justify-center items-center border p-8  gap-y-4 bg-accent/20 w-md">
        <Avatar className="h-16 w-16">
          <AvatarImage src={targetOrg?.image || ""} alt={targetOrg?.name || ""} />
          <AvatarFallback style={{ backgroundColor: targetOrg?.color, fontSize: '24px' }}>
            {targetOrg?.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className={"flex flex-col gap-y-4 items-center justify-center max-w-md"}>
          <div className={"flex flex-col gap-y-2 items-center justify-center"}>
            <h1 className={"text-2xl font-bold"}>Join {targetOrg?.name}</h1>
            <p className={"text-sm text-gray-500"}>Enter the organization code to join</p>
          </div>
          <CodeInput length={6} />
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="mt-4"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Joining...
              </div>
            ) : "Join Organization"}
          </Button>
          {user && (
            <div className="flex items-center gap-4">
              <Button
                className='!border-none'
                onClick={() => router.push(`/${targetOrg?.slug}/dashboard`)}
              >
                <ChevronLeft />
                Go to Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default JoinPage;
