import { v } from "convex/values";
import { currencyValidator, intervalValidator, OrganizationRole } from "./validators";

export const userFields = {
  email: v.optional(v.string()),
  emailVerified: v.optional(v.boolean()),
  emailVerificationTime: v.optional(v.float64()),
  image: v.optional(v.string()),
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  name: v.optional(v.string()),
  phone: v.optional(v.string()),
  phoneVerified: v.optional(v.boolean()),
  phoneVerificationTime: v.optional(v.float64()),
  isOnboardingComplete: v.optional(v.boolean()),
  orgIds: v.optional(v.array(v.object({
    id: v.id("organization"),
    role: OrganizationRole,
    status: v.union(v.literal("pending"), v.literal("active"), v.literal("disabled")),
    invitedBy: v.optional(v.id("users")),
    invitedTime: v.optional(v.float64()),
  }))),
  providers: v.optional(v.array(v.string())),
  activeOrgId: v.union(v.id("organization"), v.literal("")),
  accounts: v.optional(v.array(v.id("accounts"))),
};

export const organizationFields = {
  name: v.string(),
  image: v.optional(v.string()),
  slug: v.string(),
  color: v.string(),
  customerId: v.optional(v.string()),
  extendedFreeTrial: v.optional(v.boolean()),
  updatedBy: v.optional(v.id("users")),
  updatedTime: v.optional(v.string()),
  ownerId: v.optional(v.id("users")),
  joinCode: v.optional(v.string()),
  plan: v.optional(v.string()),
};

export const subscriptionFields = {
  orgId: v.id("organization"),
  planId: v.id("plans"),
  priceStripeId: v.string(),
  stripeId: v.string(),
  currency: currencyValidator,
  interval: intervalValidator,
  status: v.string(),
  currentPeriodStart: v.number(),
  currentPeriodEnd: v.number(),
  cancelAtPeriodEnd: v.boolean(),
  seats: v.optional(v.number()),
  paymentIntentId: v.optional(v.string())
};

export const accountFields = {
  id: v.string(),
  userId: v.id("users"),
  orgId: v.optional(v.id("organization")),
  binaryIndex: v.optional(v.string()),
  token: v.string(),
  scope: v.string(),
  refreshToken: v.string(),
  provider: v.string(),
  emailAddress: v.string(),
  name: v.string(),
  nextDeltaToken: v.optional(v.string()),
  threads: v.optional(v.array(v.id("threads"))),
  emailAddresses: v.optional(v.array(v.id("emailAddresses"))),
  expiresAt: v.float64(),
}