import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { aggregateUsers, aggregateUsersByOrg } from "./custom";
import { sendInvitationSuccessEmail } from "./email/templates/invitationEmails";
import { userFields } from "./fields";
import { hasAccessToOrg } from "./utils/helpers";
import { OrganizationRole } from "./validators";
import { getRandomColor } from "./utils/tools";
import { env } from "./env";

export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email?.toLowerCase()))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const newUser = {
      ...args,
      email: args.email?.toLowerCase(),
      emailVerified: args.emailVerified ?? false,
      emailVerificationTime: args.emailVerified ? Date.now() : undefined,
      isOnboardingComplete: args.isOnboardingComplete ?? false,
      name: args.name,
      firstName: args.firstName,
      lastName: args.lastName,
      phone: args.phone ?? '',
      phoneVerified: false,
      phoneVerificationTime: undefined,
      providers: args.providers ?? [],
      orgIds: args.orgIds?.filter(org => org.id !== undefined).map(org => ({
        id: org.id as Id<"organization">,
        invitedTime: Date.now(),
        role: org.role as "org:admin" | "org:member",
        status: org.status as "pending" | "active" | "disabled"
      })) ?? [],
      activeOrgId: args.activeOrgId as Id<"organization"> | "",
      color: getRandomColor()
    };

    const userId = await ctx.db.insert("users", newUser);

    const userDoc = await ctx.db.get(userId);
    if (userDoc) {
      await aggregateUsers.insertIfDoesNotExist(ctx, userDoc);
    }

    return { userId };
  }
});

export const update = mutation({
  args: {
    id: v.id("users"),
    email: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
    image: v.optional(v.string()),
    isOnboardingComplete: v.optional(v.boolean()),
    name: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    orgIds: v.optional(v.array(v.object({
      id: v.id("organization"),
      role: v.union(v.literal("org:admin"), v.literal("org:member")),
      status: v.union(v.literal("pending"), v.literal("active"), v.literal("disabled"))
    }))),
    activeOrgId: v.optional(v.id("organization")),
    providers: v.optional(v.array(v.string())),
    accounts: v.optional(v.array(v.id("accounts"))),
    color: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { id, ...userFields } = args;

    if (!id) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(id);

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(id, {
      ...userFields
    });
  },
});

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    const activeOrg = user?.activeOrgId ? await ctx.db.get(user.activeOrgId as Id<"organization">) : null;

    return userId !== null ? { ...user, ...(activeOrg ? { activeOrg } : {}), } : null;
  },
});

export const getUser = query({
  args: {
    id: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_id", (q) =>
        q.eq("_id", args.id as Id<"users">)
      )
      .first();
  },
});

export const getUsers = query({
  args: {
    orgId: v.optional(v.id("organization")),
  },
  async handler(ctx, args) {
    const hasAccess = await hasAccessToOrg(ctx, args.orgId as Id<"organization">);

    if (!hasAccess) {
      return [];
    }

    let users = await ctx.db
      .query("users")
      .collect();

    users = users.filter(user => user.orgIds?.some(user => user.id === args.orgId));

    return users;
  },
});

export const createNewUserAndSetOrg = mutation({
  args: {
    orgId: v.id("organization"),
    code: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: `${args.firstName} ${args.lastName}`,
      firstName: args.firstName,
      lastName: args.lastName,
      image: args.image,
      isOnboardingComplete: true,
      orgIds: [{
        id: args.orgId,
        role: "org:owner",
        status: "active",
      }],
      activeOrgId: args.orgId,
      color: getRandomColor(),
    });

    const userDoc = await ctx.db.get(userId);
    if (userDoc) {
      await aggregateUsersByOrg.insertIfDoesNotExist(ctx, userDoc);
    }

    return userId;
  },
});

export const addUserToOrg = mutation({
  args: {
    orgId: v.id("organization"),
    userId: v.id("users"),
    code: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const user = await ctx.db.get(args.userId);
    const org = await ctx.db.get(args.orgId as Id<"organization">);

    if (!user || !org) {
      return {
        success: false,
        message: "User or organization not found",
      };
    }

    if (user.orgIds?.some(org => org.id === args.orgId)) {
      return {
        success: false,
        message: "User already in organization",
      };
    }

    if (org.joinCode !== args.code) {
      return {
        success: false,
        message: "Invalid code",
      };
    }

    await ctx.db.patch(args.userId, {
      orgIds: [...(user.orgIds || []), {
        id: args.orgId as Id<"organization">,
        role: "org:member",
        status: "pending",
      }],
    });

    if (user) {
      await aggregateUsersByOrg.insertIfDoesNotExist(ctx, user);
    }

    await ctx.db.insert("notifications", {
      orgId: args.orgId,
      type: "org:join",
      message: `${user.name} has requested to join ${org.name}`,
      read: false,
      notificationType: "request",
      requestUserId: args.userId,
      archived: false,
    });

    return {
      success: true,
      message: "User added to organization",
    };
  },
});

export const inviteUserMutation = internalMutation({
  args: {
    orgId: v.id("organization"),
    email: v.string(),
    role: v.string(),
  },
  async handler(ctx, args) {
    const user = await ctx.db.query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    const org = await ctx.db.get(args.orgId);
    if (!org) {
      return {
        success: false,
        message: "Organization not found",
      };
    }

    if (user) {
      const orgUser = user.orgIds?.find(org => org.id === args.orgId);

      if (orgUser) {
        return {
          success: false,
          message: "User already in organization",
        };
      }

      await ctx.db.patch(user._id, {
        orgIds: [...(user.orgIds || []), {
          id: args.orgId,
          role: args.role as "org:admin" | "org:member",
          status: "pending",
        }],
      });
    } else {
      await ctx.db.insert("users", {
        email: args.email,
        name: "",
        firstName: "",
        lastName: "",
        image: "",
        orgIds: [{
          id: args.orgId,
          role: args.role as "org:admin" | "org:member",
          status: "pending",
        }],
        activeOrgId: args.orgId,
      });
    }

    return {
      success: true,
      message: "User invited",
      email: args.email,
      role: args.role,
    };
  },
});

export const inviteUserAction = action({
  args: {
    invitations: v.optional(v.array(v.object({
      email: v.string(),
      role: v.string(),
    }))),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.runQuery(internal.utils.helpers.currentUser);
    const orgId = currentUser?.activeOrgId as Id<"organization">;

    if (!args.invitations) {
      return new ConvexError("no invitations we're added")
    }

    const results = await Promise.all(args.invitations.map(invitation =>
      ctx.runMutation(internal.users.inviteUserMutation, {
        orgId,
        email: invitation.email,
        role: invitation.role,
      })
    )) as any;

    const org = await ctx.runQuery(internal.organization.getOrganization, {
      orgId,
    });

    const invitationLink = `${env.SITE_URL}/organization/join/${orgId}`;

    try {
      for (const result of results) {
        if (!result.email) {
          console.error("Missing email for invitation", result);
          continue;
        }

        await sendInvitationSuccessEmail({
          email: result.email,
          orgName: org?.name,
          orgImage: org?.image,
          userImage: currentUser?.image,
          invitedByUser: currentUser?.name,
          invitedByEmail: currentUser?.email,
          inviteLink: invitationLink,
        });
      }
    } catch (error) {
      console.error("Failed to send invitation email:", error);
      throw new Error("Failed to send invitation email");
    }

    return results;
  },
});

export const getUserByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      return null;
    }

    return {
      _id: user._id,
      ...userFields
    };
  },
});

export const getLoggedInUser = internalQuery({
  args: {
    id: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_id", (q) =>
        q.eq("_id", args.id as Id<"users">)
      )
      .unique();
  },
});