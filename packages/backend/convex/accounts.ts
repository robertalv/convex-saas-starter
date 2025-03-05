import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internalQuery, mutation, query } from "./_generated/server";
import { internalMutation } from "./custom";
import { user } from "./utils/helpers";

export const create = mutation({
  args: {
    id: v.string(),
    userId: v.optional(v.id("users")),
    token: v.string(),
    provider: v.string(),
    emailAddress: v.string(),
    name: v.string(),
    scope: v.string(),
    refreshToken: v.string(),
    expiresAt: v.float64(),
  },
  handler: async (ctx, args) => {
   const currentUser = await user(ctx);

   if (!currentUser) {
     throw new Error("Not authenticated");
   }

   await ctx.db.insert("accounts", {
     id: args.id,
     userId: args.userId || currentUser._id as Id<"users">,
     orgId: currentUser.activeOrgId as Id<"organization"> || undefined,
     token: args.token,
     provider: args.provider,
     emailAddress: args.emailAddress,
     name: args.name,
     scope: args.scope,
     refreshToken: args.refreshToken,
     expiresAt: args.expiresAt,
   });

   return {
     success: true,
     message: "Account created",
   };
  }
});

export const getAccountsByUserId = query({
  args: {
    userId: v.id("users"),
  },
  async handler(ctx, args) {
    const accounts = await ctx.db
      .query("accounts")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    return accounts;
  },
});

export const queryAccounts = internalQuery({
  args: {
    userId: v.id("users"),
  },
  async handler(ctx, args) {
    const accounts = await ctx.db
      .query("accounts")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    return accounts;
  },
});

export const patchAccountToken = internalMutation({
  args: {
    accountId: v.id("accounts"),
    accessToken: v.string(),
    expiresIn: v.float64(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.accountId, {
      token: args.accessToken,
      expiresAt: Date.now() + (args.expiresIn ?? 3600) * 1000,
    });
  }
})

// export const refreshGoogleTokens = internalAction({
//   handler: async (ctx) => {
//     const user = await ctx.runMutation(internal.helpers.standardHelpers.getUserId);

//     const accounts = await ctx.runQuery(internal.accounts.queryAccounts, {
//       userId: user?._id as Id<"users">
//     });

//     for (const account of accounts) {
//       if (account.refreshToken && account.expiresAt - 300000 < Date.now()) {
//         const response = await fetch('https://oauth2.googleapis.com/token', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//           body: new URLSearchParams({
//             client_id: process.env.AUTH_GOOGLE_ID!,
//             client_secret: process.env.AUTH_GOOGLE_SECRET!,
//             refresh_token: account.refreshToken,
//             grant_type: 'refresh_token',
//           }),
//         });

//         const newTokens = await response.json();
        
//         await ctx.runMutation(internal.accounts.patchAccountToken, {
//           accountId: account._id,
//           accessToken: newTokens.access_token,
//           expiresIn: newTokens.expires_in
//         });
//       }
//     }
//   },
// });