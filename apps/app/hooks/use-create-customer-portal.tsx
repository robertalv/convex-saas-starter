import { useAction } from "convex/react";
import { api } from "@workspace/backend/convex/_generated/api";
import type { Id } from "@workspace/backend/convex/_generated/dataModel";

export function useCreateCustomerPortal(orgId: Id<"organization"> | undefined) {
  const createCustomerPortalAction = useAction(api.stripe.createCustomerPortal);

  const createCustomerPortal = async () => {
    try {
      const url = await createCustomerPortalAction({ orgId: orgId as Id<"organization"> });
      return url;
    } catch (error) {
      console.error("Error creating customer portal:", error);
      throw error;
    }
  };

  return createCustomerPortal;
}
