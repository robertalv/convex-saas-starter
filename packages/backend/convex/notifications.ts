import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getNotificationsByOrgId = query({
  args: {
    id: v.union(v.id("organization"), v.null()),
    userId: v.union(v.id("users"), v.null()),
  },
  handler: async (ctx, args) => {
    if (!args.id || !args.userId) {
      return [];
    }

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.id as Id<"organization">))
      .filter((q) => q.eq(q.field("notificationType"), "notification"))
      .filter((q) => q.eq(q.field("userId"), args.userId as Id<"users">))
      .collect();

    const populatedNotifications = await Promise.all(
      notifications.map(async (notification) => {
        const user = notification?.requestUserId 
          ? await ctx.db.get(notification.requestUserId)
          : null;
        return {
          ...notification,
          user
        };
      })
    );

    return populatedNotifications;
  },
});

export const getRequestsByOrgId = query({
  args: {
    id: v.id("organization"),
    userId: v.union(v.id("users"), v.null()),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.id))
      .filter((q) => q.eq(q.field("notificationType"), "request"))
      .collect();

    const populatedNotifications = await Promise.all(
      notifications.map(async (notification) => {
        const user = notification?.requestUserId 
          ? await ctx.db.get(notification.requestUserId)
          : null;
        return {
          ...notification,
          user
        };
      })
    );

    return populatedNotifications;
  },
});

export const toggleNotificationReadStatus = mutation({
  args: {
    id: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.id);
    if (!notification) {
      throw new Error("Notification not found");
    }
    
    await ctx.db.patch(args.id, {
      read: !notification.read,
      archived: !notification.read,
    });
  },
});

export const removeNotification = mutation({
  args: {
    id: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const createNotification = mutation({
  args: {
    orgId: v.id("organization"),
    userId: v.optional(v.id("users")),
    type: v.string(),
    message: v.string(),
    notificationType: v.string(),
    requestUserId: v.optional(v.id("users")),
    archived: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("notifications", {
      ...args,
      notificationType: args.notificationType as "notification" | "request",
      read: false,
      archived: false,
    });

    return {
      success: true,
      message: "Notification created",
    };
  },
});

export const markAllAsRead = mutation({
  args: {
    orgId: v.id("organization"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .filter((q) => 
        q.and(
          q.eq(q.field("orgId"), args.orgId),
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("archived"), false)
        )
      )
      .collect();
  
    await Promise.all(
      notifications.map((notification) =>
        ctx.db.patch(notification._id, { read: true, archived: true })
      )
    );

    return {
      success: true,
      message: "All notifications marked as read and archived",
    };
  },
});

export const getNotifications = query({
  args: {
    orgId: v.id("organization"),
    userId: v.id("users"),
    type: v.optional(v.union(v.literal("all"), v.literal("notifications"), v.literal("requests"), v.literal("archived"))),
  },
  handler: async (ctx, args) => {
    let notificationsQuery = ctx.db
      .query("notifications")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .filter((q) => q.eq(q.field("userId"), args.userId));

    if (args.type === "notifications") {
      notificationsQuery = notificationsQuery.filter((q) => 
        q.and(
          q.eq(q.field("notificationType"), "notification"),
          q.eq(q.field("archived"), false)
        )
      );
    } else if (args.type === "requests") {
      notificationsQuery = notificationsQuery.filter((q) => 
        q.and(
          q.eq(q.field("notificationType"), "request"),
          q.eq(q.field("archived"), false)
        )
      );
    } else if (args.type === "archived") {
      notificationsQuery = notificationsQuery.filter((q) => q.eq(q.field("archived"), true));
    }
    // If type is "all" or not specified, we don't add any additional filters

    const notifications = await notificationsQuery.collect();

    const populatedNotifications = await Promise.all(
      notifications.map(async (notification) => {
        const user = notification?.requestUserId 
          ? await ctx.db.get(notification.requestUserId)
          : null;
        return {
          ...notification,
          user
        };
      })
    );

    return populatedNotifications;
  },
});