import { Id } from "@workspace/backend/convex/_generated/dataModel";
import { ActiveOrg } from "./index.d";

export type Plan = {
  _id: Id<"plans">;
  _creationTime: number;
  seats?: number;
  name: string;
  key: "free" | "standard" | "pro" | "enterprise";
  stripeId: string;
  description: string;
  prices: Record<string, any>;
};

export type Subscription = {
  _id: Id<"subscriptions">;
  orgId: Id<"organization">;
  planId: Id<"plans">;
  status: string;
  stripeSubscriptionId?: string;
  planKey: "free" | "standard" | "pro" | "enterprise";
  trialEnd?: number;
  cancelAt?: number;
  canceledAt?: number;
  currentPeriodEnd?: number;
  currentPeriodStart?: number;
  currency: "usd" | "eur";
  interval: "month" | "year";
  cancelAtPeriodEnd?: boolean;
  seats?: number;
  priceStripeId?: string;
};

export type OrganizationWithPlan = (ActiveOrg & {
  plan?: Plan | null;
  subscription?: Subscription;
  image?: string;
}) | null | undefined;
