import {
  Card,
  CardContent,
  CardHeader,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { useCreateCustomerPortal } from "@/hooks/use-create-customer-portal";
import { OrganizationWithPlan } from "@/types";
import { api } from "@workspace/backend/convex/_generated/api";
import { useQuery } from "convex/react";

interface BillingCardProps {
  org: OrganizationWithPlan;
}

const BillingCard = ({ org }: BillingCardProps) => {
  const organization = useQuery(api.organization.getActiveOrganization) as OrganizationWithPlan;
  const subscription = organization?.subscription;
  const createCustomerPortal = useCreateCustomerPortal(org?._id);

  if (!organization) {
    return null;
  }

  if (!subscription) {
    return null;
  }

  const handleCreateCustomerPortal = async () => {
    if (!org?.customerId) {
      return;
    }

    const customerPortalUrl = await createCustomerPortal();

    if (!customerPortalUrl) {
      return;
    }

    window.location.href = customerPortalUrl;
  };

  const daysLeft = subscription?.currentPeriodEnd
    ? Math.ceil((subscription.currentPeriodEnd - Date.now() / 1000) / (60 * 60 * 24))
    : 0;
  console.log("Days left in subscription:", daysLeft);

  return (
    <Card>
      <CardHeader className="pb-3">
        <h2 className="text-xl font-semibold">Billing</h2>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="font-semibold">Current Plan</h3>
              <div className="flex flex-col space-y-1">
                <div className="text-lg font-medium">
                  {subscription?.planKey.toUpperCase()}
                </div>
                {subscription?.status === "trialing" && (
                  <Badge variant="secondary" className="w-fit text-xs bg-green-50 text-green-600 border-green-100">
                    {daysLeft} days left in trial
                  </Badge>
                )}
              </div>
            </div>
            <Button variant="outline" onClick={handleCreateCustomerPortal}>
              Upgrade to Pro
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <span className="underline cursor-pointer hover:text-accent-foreground" onClick={handleCreateCustomerPortal}>Cancel anytime</span> • 14-day money-back guarantee
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline">
              <span className="text-2xl font-bold font-mono">
                {organization.subscription?.currency === "usd" ? "$" : "€"}
                {organization.subscription?.interval && organization.subscription?.currency && organization.plan?.prices?.[organization.subscription.interval]?.[organization.subscription.currency]?.amount
                  ? (organization.plan.prices[organization.subscription.interval][organization.subscription.currency].amount / 100).toFixed(2)
                  : "0.00"
                }
              </span>
              {organization.subscription?.status === "trialing" && organization.subscription?.interval && organization.subscription?.currency && organization.plan?.prices?.[organization.subscription.interval]?.[organization.subscription.currency]?.amount && (
                <span className="text-sm text-muted-foreground line-through ml-2 font-mono">
                  {organization.subscription.currency === "usd" ? "$" : "€"}
                  {((organization.plan.prices[organization.subscription.interval][organization.subscription.currency].amount * 1.5) / 100).toFixed(2)}
                </span>
              )}
              <span className="text-sm text-muted-foreground ml-2">/{organization.subscription?.interval || "month"}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <div className="h-5 w-5 mr-2 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="text-sm">Unlimited active subscriptions</span>
            </div>
            <div className="flex items-center">
              <div className="h-5 w-5 mr-2 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="text-sm">Export subscription data</span>
            </div>
            <div className="flex items-center">
              <div className="h-5 w-5 mr-2 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="text-sm">Priority support</span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Current Usage</h3>
          <p className="text-sm text-muted-foreground">{subscription?.seats || 0} seat{(subscription?.seats || 0) > 1 ? "s" : ""} used</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default BillingCard