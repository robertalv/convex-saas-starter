import { httpRouter } from "convex/server";
import Stripe from "stripe";
import { z } from "zod";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import { ActionCtx, httpAction } from "./_generated/server";
import { auth } from "./auth";
import {
  sendSubscriptionErrorEmail,
  sendSubscriptionSuccessEmail,
} from "./email/templates/subscriptionEmails";
import { stripe } from "./stripe";
import { ERRORS } from "./utils/errors";
import { Currency, Interval } from "./validators";
import { env } from "./env";

const http = httpRouter();

auth.addHttpRoutes(http);

/**
 * Gets and constructs a Stripe event signature.
 *
 * @throws An error if Stripe signature is missing or if event construction fails.
 * @returns The Stripe event object.
 */
async function getStripeEvent(request: Request) {
  if (process.env.STRIPE_WEBHOOK_SECRET!) {
    throw new Error(`Stripe - ${ERRORS.ENVS_NOT_INITIALIZED}`);
  }

  try {
    const signature = request.headers.get("Stripe-Signature");
    if (!signature) throw new Error(ERRORS.STRIPE_MISSING_SIGNATURE);
    const payload = await request.text();
    const event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
    return event;
  } catch (err: unknown) {
    throw new Error(ERRORS.STRIPE_SOMETHING_WENT_WRONG);
  }
}

const handleUpdateSubscription = async (
  ctx: ActionCtx,
  org: Doc<"organization">,
  subscription: Stripe.Subscription,
) => {
  const subscriptionItem = subscription.items.data[0];

  if (!subscriptionItem) {
    throw new Error(ERRORS.STRIPE_SOMETHING_WENT_WRONG);
  }
  
  await ctx.runMutation(internal.stripe.PREAUTH_replaceSubscription, {
    orgId: org._id,
    subscriptionStripeId: subscription.id,
    input: {
      currency: subscription.items.data[0]?.price?.currency as Currency,
      planStripeId: subscriptionItem.plan.product as string,
      priceStripeId: subscriptionItem.price.id,
      interval: subscriptionItem.plan.interval as Interval,
      status: subscription.status,
      currentPeriodStart: subscription.current_period_start,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      seats: parseInt(subscription.metadata.seats),
    },
  });
};

const handleCheckoutSessionCompleted = async (
  ctx: ActionCtx,
  event: Stripe.CheckoutSessionCompletedEvent,
) => {
  const session = event.data.object;

  const { customer: customerId, subscription: subscriptionId } = z
    .object({ customer: z.string(), subscription: z.string() })
    .parse(session);

  const org = await ctx.runQuery(internal.stripe.PREAUTH_getOrgByCustomerId, {
    customerId,
  });

  if (!org) {
    throw new Error(ERRORS.SOMETHING_WENT_WRONG);
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  await handleUpdateSubscription(ctx, org, subscription);

  const identity = await ctx.auth.getUserIdentity();
  const subject = identity?.subject.split("|")[0] as Id<"users">;

  const user = await ctx.runQuery(internal.users.getLoggedInUser, {
    id: subject,
  });

  if (!user || !user.email) {
    throw new Error(ERRORS.USER_EMAIL_NOT_FOUND);
  }

  await sendSubscriptionSuccessEmail({
    email: user.email,
    subscriptionId,
  });

  return new Response(null);
};

const handleCheckoutSessionCompletedError = async (
  ctx: ActionCtx,
  event: Stripe.CheckoutSessionCompletedEvent,
) => {
  const session = event.data.object;

  const { customer: customerId, subscription: subscriptionId } = z
    .object({ customer: z.string(), subscription: z.string() })
    .parse(session);

  const org = await ctx.runQuery(internal.stripe.PREAUTH_getOrgByCustomerId, {
    customerId,
  });

  const identity = await ctx.auth.getUserIdentity();
  const subject = identity?.subject.split("|")[0] as Id<"users">;

  const user = await ctx.runQuery(internal.users.getLoggedInUser, {
    id: subject,
  });

  if (!user || !user.email) {
    throw new Error(ERRORS.USER_EMAIL_NOT_FOUND);
  }

  await sendSubscriptionErrorEmail({
    email: user.email,
    subscriptionId,
  });
  return new Response(null);
};

const handleCustomerSubscriptionUpdated = async (
  ctx: ActionCtx,
  event: Stripe.CustomerSubscriptionUpdatedEvent,
) => {
  const subscription = event.data.object;
  const { customer: customerId } = z
    .object({ customer: z.string() })
    .parse(subscription);

  const org = await ctx.runQuery(internal.stripe.PREAUTH_getOrgByCustomerId, {
    customerId,
  });
  if (!org) throw new Error(ERRORS.SOMETHING_WENT_WRONG);

  await handleUpdateSubscription(ctx, org, subscription);

  return new Response(null);
};

const handleCustomerSubscriptionUpdatedError = async (
  ctx: ActionCtx,
  event: Stripe.CustomerSubscriptionUpdatedEvent,
) => {
  const subscription = event.data.object;

  const { id: subscriptionId, customer: customerId } = z
    .object({ id: z.string(), customer: z.string() })
    .parse(subscription);

  const org = await ctx.runQuery(internal.stripe.PREAUTH_getOrgByCustomerId, {
    customerId,
  });
  if (!org) throw new Error(ERRORS.STRIPE_SOMETHING_WENT_WRONG);

  const identity = await ctx.auth.getUserIdentity();
  const subject = identity?.subject.split("|")[0] as Id<"users">;

  const user = await ctx.runQuery(internal.users.getLoggedInUser, {
    id: subject,
  });

  if (!user || !user.email) {
    throw new Error(ERRORS.USER_EMAIL_NOT_FOUND);
  }

  await sendSubscriptionErrorEmail({
    email: user.email,
    subscriptionId,
  });
  return new Response(null);
};

const handleCustomerSubscriptionDeleted = async (
  ctx: ActionCtx,
  event: Stripe.CustomerSubscriptionDeletedEvent,
) => {
  const subscription = event.data.object;
  await ctx.runMutation(internal.stripe.PREAUTH_deleteSubscription, {
    subscriptionStripeId: subscription.id,
  });
  return new Response(null);
};

http.route({
  path: "/stripe",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await getStripeEvent(request);

    try {
      switch (event.type) {
        /**
         * Occurs when a Checkout Session has been successfully completed.
         */
        case "checkout.session.completed": {
          return handleCheckoutSessionCompleted(ctx, event);
        }

        /**
         * Occurs when a Stripe subscription has been updated.
         * E.g. when a user upgrades or downgrades their plan.
         */
        case "customer.subscription.updated": {
          return handleCustomerSubscriptionUpdated(ctx, event);
        }

        /**
         * Occurs whenever a customer’s subscription ends.
         */
        case "customer.subscription.deleted": {
          return handleCustomerSubscriptionDeleted(ctx, event);
        }
      }
    } catch (err: unknown) {
      switch (event.type) {
        case "checkout.session.completed": {
          return handleCheckoutSessionCompletedError(ctx, event);
        }

        case "customer.subscription.updated": {
          return handleCustomerSubscriptionUpdatedError(ctx, event);
        }
      }

      throw err;
    }

    return new Response(null);
  }),
});

http.route({
  path: "/getImage",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const { searchParams } = new URL(request.url);
    const storageId = searchParams.get("storageId")!;
    const blob = await ctx.storage.get(storageId as Id<"_storage">);

    if (blob === null) {
      return new Response("Image not found", {
        status: 404,
      });
    }

    return new Response(blob);
  }),
});

export default http;
