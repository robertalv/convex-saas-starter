import type { Id } from "../_generated/dataModel";
import { internalQuery, MutationCtx, QueryCtx } from "../_generated/server";

// Get the current user
export const user = async (
  ctx: QueryCtx | MutationCtx
) => {
  const identity = await ctx.auth.getUserIdentity();
  const subject = identity?.subject.split("|")[0] as Id<"users">;

  if (!identity) {
    return null;
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_id", (q) =>
      q.eq("_id", subject)
    )
    .first();

  if (!user) {
    return null;
  }

  return user;
}

// Check if the current user has access to an organization
export async function hasAccessToOrg(
  ctx: QueryCtx | MutationCtx,
  orgId: string
) {
  const currentUser = await user(ctx);

  if (!currentUser) {
    return null;
  }

  const orgIds = currentUser.orgIds ?? [];

  const hasAccess = orgIds.some((item) => item.id === orgId)

  if (!hasAccess) {
    return null;
  }

  return { user: currentUser };
}

// Internal query for actions to get the current user
export const currentUser = internalQuery({
  handler: async (ctx: QueryCtx | MutationCtx) => {
    return user(ctx);
  },
})