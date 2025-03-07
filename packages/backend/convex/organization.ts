import { getAuthUserId } from "@convex-dev/auth/server";
import { asyncMap } from "convex-helpers";
import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import {
  internalQuery,
  mutation,
  MutationCtx,
  query,
  QueryCtx
} from "./_generated/server";
import { hasAccessToOrg, user } from "./utils/helpers";
import { currencyValidator, PLANS } from "./validators";
import { getRandomColor } from "./utils/tools";
import { aggregateUsersByOrg, aggregateOrganizations } from "./custom";

const generateUniqueCode = () => {
  return Math.random().toString(36).substring(2, 10).replace(/[^a-zA-Z0-9]/g, '');
}

export const refreshJoinCode = mutation({
  args: {
    orgId: v.id("organization"),
  },
  handler: async (ctx, args) => {
    const currentUser = await user(ctx) as any;


    const userOrgIds = currentUser?.orgIds;
    if (!userOrgIds || !userOrgIds.some((org: any) => org.role === "org:owner" || "org:admin")) {
      throw new ConvexError("You are not authorized to refresh the join code");
    }

    const joinCode = generateUniqueCode();
    await ctx.db.patch(args.orgId, { joinCode });

    return {
      id: args.orgId,
    }
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    image: v.optional(v.string()),
    plan: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await user(ctx) as any;

    if (!currentUser) {
      throw new ConvexError("User is not authenticated");
    }

    const disallowedSlugs = [
      "organization",
      "onboarding",
      "no-access",
      "signin",
      "signup",
      "organizations",
      "document",
      "api",
      "getImage",
    ];

    if (disallowedSlugs.includes(args.slug.toLowerCase())) {
      throw new ConvexError("This organization slug is not allowed");
    }

    const org = await ctx.db.query("organization")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (org) {
      throw new ConvexError("Organization with that slug already exists");
    }

    const joinCode = generateUniqueCode();

    const newOrg = await ctx.db.insert("organization", {
      name: args.name,
      image: args.image,
      slug: args.slug,
      color: getRandomColor(),
      ownerId: currentUser?._id as Id<"users">,
      joinCode: joinCode,
      plan: args.plan,
    });

    const orgDoc = await ctx.db.get(newOrg);
    if (orgDoc) {
      await aggregateOrganizations.insertIfDoesNotExist(ctx, orgDoc);
    }

    const updatedOrgIds = [
      ...(currentUser?.orgIds || []),
      {
        id: newOrg as Id<"organization">,
        role: "org:owner" as "org:owner" | "org:admin" | "org:member",
        status: "active" as "pending" | "active" | "disabled",
      },
    ];

    await ctx.db.patch(currentUser?._id as Id<"users">, {
      activeOrgId: newOrg as Id<"organization">,
    });

    await ctx.db.patch(currentUser?._id as Id<"users">, {
      orgIds: updatedOrgIds,
    });

    if (currentUser) {
      await aggregateUsersByOrg.insertIfDoesNotExist(ctx, currentUser);

      console.log("Aggregate user created");
    }

    return {
      error: false,
      id: newOrg as Id<"organization">,
      message: "Organization created successfully"
    };
  },
});

export const getActiveOrganization = query({
  args: {},
  handler: async (ctx, args) => {
    const currentUser = await user(ctx);

    const org = await ctx.db
      .query("organization")
      .withIndex("by_id", (q) =>
        q.eq("_id", currentUser?.activeOrgId as Id<"organization">)
      )
      .unique();

    if (!org) {
      return;
    }

    const [orgId, subscription] = await Promise.all([
      ctx.db.get(currentUser?.activeOrgId as Id<"organization">),
      ctx.db
        .query("subscriptions")
        .filter((q) => q.eq(q.field("orgId"), currentUser?.activeOrgId))
        .unique(),
    ]);


    if (!orgId) {
      return;
    }

    const imageId = org.image?.split("storageId=")[1];

    const plan = subscription?.planId
      ? await ctx.db.get(subscription.planId)
      : undefined;

    const imageUrl = org.image
      ? await ctx.storage.getUrl(imageId as Id<"_storage">)
      : undefined;


    return {
      ...org,
      _id: orgId._id,
      image: imageUrl || undefined,
      plan,
      subscription:
        subscription && plan
          ? {
            ...subscription,
            planKey: plan.key
          }
          : undefined,
    }
  },
});

export const completeOnboarding = mutation({
  args: {
    orgId: v.id("organization"),
    currency: currencyValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return;
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return;

    }

    const org = await ctx.db.get(args.orgId);
    if (!org) {
      return;
    }

    await ctx.db.patch(userId, { isOnboardingComplete: true });

    if (org.customerId) {
      return;
    }

    await ctx.scheduler.runAfter(
      0,
      internal.stripe.PREAUTH_createStripeCustomer,
      {
        currency: args.currency,
        orgId: args.orgId,
        userId
      },
    );
  },
});

export const acceptUser = mutation({
  args: {
    orgId: v.id("organization"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const org = await ctx.db.get(args.orgId);
    const user = await ctx.db.get(args.userId);

    if (!org) {
      throw new Error("Organization not found");
    }

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.orgIds || user.orgIds.length === 0) {
      throw new Error("User has no organization IDs");
    }

    const orgIndex = user.orgIds?.findIndex(org => org.id === args.orgId);

    user.orgIds[orgIndex].status = "active";

    await ctx.db.patch(args.userId, {
      orgIds: user.orgIds,
    });

    if (user) {
      aggregateUsersByOrg.insertIfDoesNotExist(ctx, user);
    }
  },
});

export const removeUser = mutation({
  args: {
    orgId: v.id("organization"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const org = await ctx.db.get(args.orgId);
    const user = await ctx.db.get(args.userId);

    if (!org) {
      throw new Error("Organization not found");
    }

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.orgIds || user.orgIds.length === 0) {
      throw new Error("User has no organization IDs");
    }

    const orgIndex = user.orgIds?.findIndex(org => org.id === args.orgId);

    if (orgIndex !== undefined && orgIndex !== -1) {
      user.orgIds.splice(orgIndex, 1);

      await ctx.db.patch(args.userId, {
        orgIds: user.orgIds,
      });

      if (user) {
        aggregateUsersByOrg.deleteIfExists(ctx, user);
      }
    }
  },
});

export const getUserOrganizations = query({
  args: {
    id: v.optional(v.id("users")),
    status: v.optional(v.union(v.literal("active"), v.literal("pending"), v.literal("disabled"))),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_id", (q) => q.eq("_id", args.id as Id<"users">))
      .first();

    if (!user || !user.orgIds) {
      return [];
    }

    let filteredOrgIds = user.orgIds;

    if (args.status) {
      filteredOrgIds = user.orgIds.filter(org => org.status === args.status);
    }

    const organizationIds = filteredOrgIds.map(org => org.id);

    const organizations: any[] = [];

    for (const orgId of organizationIds) {
      const organization = await ctx.db
        .query("organization")
        .withIndex("by_id", (q) => q.eq("_id", orgId))
        .first();
      organizations.push(organization);
    }

    return organizations;
  },
});

export const setActiveOrganization = mutation({
  args: {
    orgId: v.optional(v.id("organization")),
  },
  handler: async (ctx, args) => {
    const currentUser = await user(ctx);

    if (!currentUser) {
      throw new Error("No user id");
    }

    await ctx.db.patch(currentUser?._id as Id<"users">, {
      activeOrgId: args.orgId as Id<"organization">,
    });
  },
});

export const setActiveOrganizationBySlug = mutation({
  args: {
    slug: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId } = args;
    const user = await ctx.db.get(userId);

    const organization = await ctx.db
      .query("organization")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!organization) {
      throw new Error("Organization not found");
    }

    if (!user?.orgIds?.some(org => org.id === organization._id)) {
      throw new Error("User is not part of the organization");
    }

    await ctx.db.patch(userId, {
      activeOrgId: organization._id,
    });

    return { success: true };
  },
});

export const update = mutation({
  args: {
    id: v.union(v.literal(""), v.id("organization")),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    isDeleted: v.optional(v.boolean()),
    deletedTime: v.optional(v.string()),
    slug: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const currentUser = await user(ctx);
    const { id, name, ...updateFields } = args;

    if (!currentUser) {
      throw new Error("Not authenticated");
    }

    const hasAccess = await hasAccessToOrg(ctx, args.id);

    if (!hasAccess) {
      return [];
    }

    let updates: any = {
      ...updateFields,
      updatedBy: currentUser._id as Id<"users">,
      updatedTime: new Date().getTime(),
    };

    if (name) {
      updates.name = name;
      updates.slug = name.toLowerCase().replace(/\s+/g, '-');
    }

    await ctx.db.patch(id as Id<"organization">, updates);
  }
});

export const getOrgData = internalQuery({
  args: {
    orgId: v.id("organization"),
  },
  handler: async (ctx, args) => {
    const { orgId } = args;

    // Fetch the organization data
    const organizationData = await ctx.db.get(orgId);

    if (!organizationData) {
      throw new Error(`Organization with ID ${orgId} not found`);
    }

    return { orgId, organizationData };
  },
});

export const getOrganization = internalQuery({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    return getFullOrganization(ctx, args.orgId);
  },
});

export const getActivePlans = query({
  args: {
    orgId: v.id("organization"),
  },
  handler: async (ctx) => {
    const [standard, pro, enterprise] = await asyncMap(
      [PLANS.STANDARD, PLANS.PRO, PLANS.ENTERPRISE] as const,
      (key) =>
        ctx.db
          .query("plans")
          .withIndex("by_key", (q) => q.eq("key", key))
          .first(),
    );
    if (!standard || !pro || !enterprise) {
      throw new Error("Plan not found");
    }
    return { standard, pro, enterprise };
  },
});

export const deleteOrganization = mutation({
  args: {
    id: v.union(v.literal(""), v.id("organization")),
  },
  handler: async (ctx, args) => {
    const u = await user(ctx);
    await ctx.db.delete(args.id as Id<"organization">);

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.id as Id<"organization">))
      .unique();
    if (!subscription) {
      console.error("No subscription found");
    } else {
      await ctx.db.delete(subscription._id);
      await ctx.scheduler.runAfter(
        0,
        internal.stripe.cancelCurrentOrgSubscriptions,
        { orgId: args.id as Id<"organization"> }
      );
    }

    let newOrg;
    if (u?.activeOrgId === args.id) {
      const firstOrg = u?.orgIds?.[0]?.id;
      if (firstOrg) {
        await ctx.db.patch(u?._id as Id<"users">, {
          activeOrgId: firstOrg
        });

        newOrg = await ctx.db.get(firstOrg);
      }
    }

    await ctx.db.patch(u?._id as Id<"users">, {
      orgIds: (u?.orgIds || []).filter(org => org.id !== args.id)
    });

    return {
      currentOrgId: u?.activeOrgId,
      newOrg: newOrg,
    }

  },
});

export const checkUserOrganizationSlug = query({
  args: {
    userId: v.id("users"),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    const orgSlugs = await Promise.all(
      (user?.orgIds || []).map(async org => {
        const organization = await ctx.db.get(org.id);
        return organization?.slug;
      })
    );

    console.log("Organization Slug Check", orgSlugs.includes(args.slug))

    return orgSlugs.includes(args.slug);
  },
});

export function getFullOrganization(ctx: QueryCtx | MutationCtx, orgId: string) {
  return ctx.db
    .query("organization")
    .withIndex("by_id", (q) => q.eq("_id", orgId as Id<"organization">))
    .first();
}

export const checkOrganizationId = query({
  args: {
    orgId: v.union(v.id("organization"), v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.orgId || args.orgId === "") {
      return false;
    }

    try {
      const orgId = args.orgId as Id<"organization">;
      const org = await ctx.db.get(orgId);

      return org;
    } catch (error) {
      console.error("Invalid organization ID format", error);
      return false;
    }
  },
});
