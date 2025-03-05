import {
  internalMutation,
  action,
  mutation,
  internalQuery,
} from "./_generated/server";
import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError("you must be logged in to upload a file");
  }

  return await ctx.storage.generateUploadUrl();
});

export const getTypeById = internalQuery({
  args: {
    id: v.union(v.id("organization"), v.id("users")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const deleteFileById = internalMutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.delete(args.storageId as Id<"_storage">);
  },
});

export const updateTypeById = internalMutation({
  args: {
    id: v.union(v.id("organization"), v.id("users")),
    image: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, { image: args.image });
  },
});

export const deleteById = action({
  args: {
    id: v.optional(v.union(v.id("organization"), v.id("users"))),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const { id, storageId } = args;

    if (id) {
      // Get the type by ID
      const type = await ctx.runQuery(internal.files.getTypeById, { id: args.id as Id<"organization"> | Id<"users"> });

      // If the type doesn't exist, throw an error
      if (!type) {
        throw new Error(`Type with ID ${id} not found`);
      }

      // If the type has an image, delete the image
      await ctx.runMutation(internal.files.updateTypeById, { id: args.id as Id<"organization"> | Id<"users">, image: "" });
    }

    // If the storageId exists, delete the file by ID
    if (storageId) {
      await ctx.runMutation(internal.files.deleteFileById, {
        storageId: storageId as Id<"_storage">,
      });
    }

    return { success: true, id };
  },
});
