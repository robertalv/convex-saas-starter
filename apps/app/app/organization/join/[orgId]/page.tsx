"use client"

import { useState, useEffect } from "react";
import { Button } from "@workspace/ui/components/button";
import { api } from "@workspace/backend/convex/_generated/api";
import type { Id } from "@workspace/backend/convex/_generated/dataModel";
import VerificationInput from "react-verification-input";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { useEnterCode } from "@/hooks/use-enter-code";
import { useQuery } from "convex/react";
import { OrganizationWithPlan } from "@/types";

interface JoinPageProps {
  params: {
    orgId: Id<"organization">;
  }
}

const JoinPage = ({ params }: JoinPageProps) => {
  console.log("PARAMS", params)
  const router = useRouter();
  const { orgId } = params;
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const targetOrg = useQuery(api.organization.getActiveOrganization, {})

  const user = useQuery(api.users.viewer);
  const { mutate } = useEnterCode();

  useEffect(() => {
    if (user) {
      if (user.orgIds?.some((org) => org.id === orgId)) {
        router.push(`/dashboard`);
      }
    } else {
      console.error("No user found");
    }
  }, [user, router, targetOrg, orgId]);

  const handleSubmit = (code: string) => {
    if (user) {
      if (code === targetOrg?.joinCode) {
        setIsLoading(true);
        mutate({
          orgId: orgId,
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

  if (!targetOrg || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className={"flex flex-col h-full gap-y-8 items-center justify-center p-8"}>
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
        <VerificationInput
          autoFocus
          length={8}
          value={code}
          onChange={(code) => setCode(code)}
          onComplete={(code) => handleSubmit(code)}
          classNames={{
            container: "flex gap-2",
            character: "w-10 h-10 bg-zinc-900 text-accent-foreground flex items-center justify-center text-2xl border border-zinc-800 rounded-lg",
            characterInactive: "bg-zinc-100",
            characterSelected: "bg-zinc-200 border-zinc-800",
            characterFilled: "bg-zinc-200 border-zinc-800",
          }}

        />
        <Button
          onClick={() => handleSubmit(code)}
          disabled={isLoading || code.length !== 8}
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
  )
}

export default JoinPage;
