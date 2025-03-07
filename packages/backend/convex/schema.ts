import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { currencyValidator, INTERVALS, intervalValidator, OrganizationRole, planKeyValidator, pricesValidator } from "./validators";

const schema = defineSchema({
  ...authTables,
  /**
   * @name users
   * @description Users table
   * @index by_email
   * @index by_orgIds
   * @index by_phone
   */
  users: defineTable({
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
    color: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_orgIds", ["orgIds"])
    .index("by_phone", ["phone"]),

  /**
   * @name organization
   * @description Organization table
   * @index by_slug
   * @index by_customerId
   */
  organization: defineTable({
    name: v.string(),
    image: v.optional(v.string()),
    slug: v.string(),
    color: v.string(),
    customerId: v.optional(v.string()),
    extendedFreeTrial: v.optional(v.boolean()),
    updatedBy: v.optional(v.id("users")),
    updatedTime: v.optional(v.float64()),
    ownerId: v.optional(v.id("users")),
    joinCode: v.optional(v.string()),
    plan: v.optional(v.string()),
  })
    .index("by_customerId", ["customerId"])
    .index("by_slug", ["slug"]),

  /**
   * @name plans
   * @description Plans table
   * @index by_key
   * @index by_stripeId
   */
  plans: defineTable({
    key: planKeyValidator,
    stripeId: v.string(),
    name: v.string(),
    description: v.string(),
    prices: v.object({
      [INTERVALS.MONTH]: pricesValidator,
      [INTERVALS.YEAR]: pricesValidator,
    }),
    seats: v.optional(v.number()),
  })
    .index("by_key", ["key"])
    .index("by_stripeId", ["stripeId"]),

  /**
   * @name subscriptions
   * @description Subscriptions table
   * @index by_orgId
   * @index by_stripeId
   * @index by_status
   */
  subscriptions: defineTable({
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
  })
    .index("by_orgId", ["orgId"])
    .index("by_stripeId", ["stripeId"])
    .index("by_status", ["status"]),

  /**
   * @name accounts
   * @description Accounts table
   * @index by_userId
   */
  accounts: defineTable({
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
  })
    .index("by_userId", ["userId"])
    .index("by_emailAddress", ["emailAddress"]),

  /**
   * @name notifications
   * @description Notifications table
   * @index by_userId
   * @index by_orgId
   */
  notifications: defineTable({
    userId: v.optional(v.id("users")),
    orgId: v.id("organization"),
    notificationType: v.union(v.literal("notification"), v.literal("request")),
    type: v.string(),
    message: v.string(),
    read: v.boolean(),
    link: v.optional(v.string()),
    requestUserId: v.optional(v.id("users")),
    archived: v.boolean(),
  })
    .index("by_userId", ["userId"])
    .index("by_orgId", ["orgId"]),

  /**
   * @name sessions
   * @description Sessions table
   * @index by_anonymous_id
   */
  sessions: defineTable({
    anonymousId: v.string(),
    createdAt: v.string(),
    lastActive: v.string(),
    actions: v.array(v.object({
      action: v.string(),
      timestamp: v.string(),
      resourceId: v.optional(v.string()),
      metadata: v.optional(v.any())
    }))
  }).index("by_anonymous_id", ["anonymousId"]),
});

export default schema;