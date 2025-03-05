import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { accountFields, organizationFields, subscriptionFields, userFields } from "./fields";
import { INTERVALS, planKeyValidator, pricesValidator } from "./validators";

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
    ...userFields
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
    ...organizationFields
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
    ...subscriptionFields
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
    ...accountFields
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
});

export default schema;