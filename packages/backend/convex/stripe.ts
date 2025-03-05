import { asyncMap } from "convex-helpers";
import { v } from "convex/values";
import Stripe from "stripe";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { ERRORS } from "./utils/errors";
import { currencyValidator, intervalValidator, PLANS } from "./validators";

// Might want to uncomment this for production
// if (!STRIPE_SECRET_KEY) {
//   throw new Error(`Stripe - ${ERRORS.ENVS_NOT_INITIALIZED})`);
// }

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  // This will be constantly changing
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

export const PREAUTH_updateCustomerId = internalMutation({
  args: {
    orgId: v.id("organization"),
    customerId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orgId, { customerId: args.customerId });
  },
});

export const PREAUTH_getOrgById = internalQuery({
  args: {
    orgId: v.id("organization"),
  },
  handler: async (ctx, args) => {
    return ctx.db.get(args.orgId);
  },
});

export const PREAUTH_createStripeCustomer = internalAction({
  args: {
    currency: currencyValidator,
    orgId: v.id("organization"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const org = await ctx.runQuery(internal.stripe.PREAUTH_getOrgById, {
      orgId: args.orgId,
    });

    const user = await ctx.runQuery(internal.utils.helpers.currentUser);

    if (!user) throw new Error(ERRORS.STRIPE_SOMETHING_WENT_WRONG);

    if (!org || org.customerId)
      throw new Error(ERRORS.STRIPE_CUSTOMER_NOT_CREATED);

    const customer = await stripe.customers
      .create({
        metadata: { orgId: org._id },
        name: org.name,
        email: user.email,
      })
      .catch((err) => console.error("Error on 73", err)) as Stripe.Customer;

      if (!customer) throw new Error(ERRORS.STRIPE_CUSTOMER_NOT_CREATED);

      await ctx.runAction(
        internal.stripe.PREAUTH_createProTrialSubscription,
        {
          orgId: org._id,
          customerId: customer.id,
          currency: args.currency,
        }
      );
  },
});

export const UNAUTH_getProPlan = internalQuery({
  handler: async (ctx) => {
    const plan = await ctx.db
      .query("plans")
      .withIndex("by_key", (q) => q.eq("key", PLANS.PRO))
      .unique();

    if (!plan) {
      throw new Error("Default plan not found");
    }

    return plan;
  },
});

export const PREAUTH_getOrgByCustomerId = internalQuery({
  args: {
    customerId: v.string(),
  },
  handler: async (ctx, args) => {
    const org = await ctx.db
      .query("organization")
      .withIndex("by_customerId", (q) => q.eq("customerId", args.customerId))
      .unique();
    if (!org) {
      throw new Error(ERRORS.STRIPE_SOMETHING_WENT_WRONG);
    }
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_orgId", (q) => q.eq("orgId", org._id))
      .unique();
    if (!subscription) {
      throw new Error(ERRORS.STRIPE_SOMETHING_WENT_WRONG);
    }
    const plan = await ctx.db.get(subscription.planId);
    if (!plan) {
      throw new Error(ERRORS.STRIPE_SOMETHING_WENT_WRONG);
    }
    return {
      ...org,
      subscription: {
        ...subscription,
        planKey: plan.key,
      },
    };
  },
});

export const PREAUTH_createSubscription = internalMutation({
  args: {
    orgId: v.id("organization"),
    planId: v.id("plans"),
    priceStripeId: v.string(),
    currency: currencyValidator,
    stripeSubscriptionId: v.string(),
    status: v.string(),
    interval: intervalValidator,
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
    seats: v.number(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .unique();
    if (subscription) {
      throw new Error("Subscription already exists");
    }
    await ctx.db.insert("subscriptions", {
      orgId: args.orgId,
      planId: args.planId,
      priceStripeId: args.priceStripeId,
      stripeId: args.stripeSubscriptionId,
      currency: args.currency,
      interval: args.interval,
      status: args.status,
      currentPeriodStart: args.currentPeriodStart,
      currentPeriodEnd: args.currentPeriodEnd,
      cancelAtPeriodEnd: args.cancelAtPeriodEnd,
      seats: args.seats
    });
  },
});

export const PREAUTH_replaceSubscription = internalMutation({
  args: {
    orgId: v.id("organization"),
    subscriptionStripeId: v.string(),
    input: v.object({
      currency: currencyValidator,
      planStripeId: v.string(),
      priceStripeId: v.string(),
      interval: intervalValidator,
      status: v.string(),
      currentPeriodStart: v.number(),
      currentPeriodEnd: v.number(),
      cancelAtPeriodEnd: v.boolean(),
      seats: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .unique();
    if (!subscription) {
      throw new Error(ERRORS.STRIPE_SOMETHING_WENT_WRONG);
    }
    await ctx.db.delete(subscription._id);
    const plan = await ctx.db
      .query("plans")
      .withIndex("by_stripeId", (q) =>
        q.eq("stripeId", args.input.planStripeId)
      )
      .unique();
    if (!plan) {
      throw new Error(ERRORS.STRIPE_SOMETHING_WENT_WRONG);
    }
    await ctx.db.insert("subscriptions", {
      orgId: args.orgId,
      planId: plan._id,
      stripeId: args.subscriptionStripeId,
      priceStripeId: args.input.priceStripeId,
      interval: args.input.interval,
      status: args.input.status,
      currency: args.input.currency,
      currentPeriodStart: args.input.currentPeriodStart,
      currentPeriodEnd: args.input.currentPeriodEnd,
      cancelAtPeriodEnd: args.input.cancelAtPeriodEnd,
      seats: args.input.seats,
    });
  },
});

export const PREAUTH_deleteSubscription = internalMutation({
  args: {
    subscriptionStripeId: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripeId", (q) => q.eq("stripeId", args.subscriptionStripeId))
      .unique();
    if (!subscription) {
      throw new Error(ERRORS.STRIPE_SOMETHING_WENT_WRONG);
    }
    await ctx.db.delete(subscription._id);
  },
});

export const PREAUTH_createProTrialSubscription = internalAction({
  args: {
    orgId: v.id("organization"),
    customerId: v.string(),
    currency: currencyValidator,
  },
  handler: async (ctx, args) => {
    const plan = await ctx.runQuery(internal.stripe.UNAUTH_getProPlan);

    if (!plan) {
      throw new Error(ERRORS.STRIPE_SOMETHING_WENT_WRONG);
    }

    const monthlyPrice = plan.prices.month[args.currency];

    const stripeSubscription = await stripe.subscriptions.create({
      customer: args.customerId,
      items: [{ price: monthlyPrice?.stripeId }],
      trial_period_days: 14,
    });

    if (!stripeSubscription) {
      throw new Error(ERRORS.STRIPE_SOMETHING_WENT_WRONG);
    }

    await ctx.runMutation(internal.stripe.PREAUTH_createSubscription, {
      orgId: args.orgId,
      planId: plan._id,
      currency: args.currency,
      priceStripeId: stripeSubscription.items.data[0].price.id,
      stripeSubscriptionId: stripeSubscription.id,
      status: stripeSubscription.status,
      interval: "month",
      seats: 1,
      currentPeriodStart: stripeSubscription.current_period_start,
      currentPeriodEnd: stripeSubscription.current_period_end,
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
    });

    await ctx.runMutation(internal.stripe.PREAUTH_updateCustomerId, {
      orgId: args.orgId,
      customerId: args.customerId,
    });
  },
});

export const getCurrentOrgSubscription = internalQuery({
  args: {
    planId: v.id("plans"),
    orgId: v.id("organization"),
  },
  handler: async (ctx, args) => {
    const org = await ctx.db
      .query("organization")
      .withIndex("by_id", (q) => q.eq("_id", args.orgId))
      .first()

    if (!org) {
      throw new Error(ERRORS.STRIPE_SOMETHING_WENT_WRONG);
    }
    const [currentSubscription, newPlan] = await Promise.all([
      ctx.db
        .query("subscriptions")
        .withIndex("by_orgId", (q) => q.eq("orgId", org._id))
        .unique(),
      ctx.db.get(args.planId),
    ]);
    if (!currentSubscription) {
      throw new Error(ERRORS.STRIPE_SOMETHING_WENT_WRONG);
    }
    const currentPlan = await ctx.db.get(currentSubscription.planId);
    return {
      currentSubscription: {
        ...currentSubscription,
        plan: currentPlan,
      },
      newPlan,
    };
  },
});

export const createSubscriptionCheckout = action({
  args: {
    orgId: v.id("organization"),
    planId: v.id("plans"),
    planInterval: intervalValidator,
    currency: currencyValidator,
    seats: v.number(),
  },
  handler: async (ctx, args): Promise<string | undefined> => {
    const org = await ctx.runQuery(api.organization.getActiveOrganization, {});

    if (!org || !org.customerId) {
      throw new Error(ERRORS.STRIPE_SOMETHING_WENT_WRONG);
    }

    console.log("org", org)

    const { currentSubscription, newPlan } = await ctx.runQuery(
      internal.stripe.getCurrentOrgSubscription,
      {
        planId: args.planId,
        orgId: org._id,
      }
    );

    if (!currentSubscription?.plan) {
      throw new Error(ERRORS.STRIPE_SOMETHING_WENT_WRONG);
    }

    console.log("currentSubscription", currentSubscription)

    console.log("newPlan", newPlan)

    const price = newPlan?.prices[args.planInterval][args.currency];

    const checkout = await stripe.checkout.sessions.create({
      customer: org.customerId,
      line_items: [{ price: price?.stripeId, quantity: args.seats }],
      mode: "subscription",
      payment_method_types: ["card"],
      success_url: `${process.env.SITE_URL}/${org.slug}?success=true`,
      cancel_url: `${process.env.SITE_URL}/${org.slug}?success=false`,
      metadata: {
        seats: args.seats.toString()
      },
    });

    console.log("checkout", checkout)

    if (!checkout) {
      throw new Error(ERRORS.STRIPE_SOMETHING_WENT_WRONG);
    }

    return checkout.url || undefined;
  },
});

export const updateSubscription = action({
  args: {
    orgId: v.id("organization"),
    planId: v.id("plans"),
    planInterval: intervalValidator,
    currency: currencyValidator,
    seats: v.number(),
  },
  handler: async (ctx, args): Promise<string | undefined> => {
    const org = await ctx.runQuery(api.organization.getActiveOrganization, {});

    if (!org || !org.customerId) {
      throw new Error(ERRORS.STRIPE_SOMETHING_WENT_WRONG);
    }

    const { currentSubscription, newPlan } = await ctx.runQuery(
      internal.stripe.getCurrentOrgSubscription,
      {
        planId: args.planId,
        orgId: org._id,
      }
    );

    if (!currentSubscription || !newPlan) {
      throw new Error(ERRORS.STRIPE_SOMETHING_WENT_WRONG);
    }

    const price = newPlan.prices[args.planInterval][args.currency];

    if (!price) {
      throw new Error(ERRORS.STRIPE_SOMETHING_WENT_WRONG);
    }

    try {
      const updatedSubscription = await stripe.subscriptions.update(
        currentSubscription.stripeId,
        {
          items: [
            {
              id: currentSubscription.stripeId,
              price: price.stripeId,
              quantity: args.seats,
            },
          ],
          proration_behavior: 'always_invoice',
          metadata: { seats: args.seats.toString() },
        }
      );

      if (!updatedSubscription) {
        throw new Error(ERRORS.STRIPE_SOMETHING_WENT_WRONG);
      }

      await ctx.runMutation(internal.stripe.PREAUTH_replaceSubscription, {
        orgId: args.orgId,
        subscriptionStripeId: updatedSubscription.id,
        input: {
          currency: args.currency,
          planStripeId: newPlan.stripeId,
          priceStripeId: price.stripeId,
          interval: args.planInterval,
          status: updatedSubscription.status,
          currentPeriodStart: updatedSubscription.current_period_start,
          currentPeriodEnd: updatedSubscription.current_period_end,
          cancelAtPeriodEnd: updatedSubscription.cancel_at_period_end,
          seats: args.seats,
        },
      });

      return `${process.env.SITE_URL}/${org.slug}/settings/organization/billing`;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw new Error(ERRORS.STRIPE_SOMETHING_WENT_WRONG);
    }
  },
});

export const createCustomerPortal = action({
  args: {
    orgId: v.id("organization"),
  },
  handler: async (ctx, args) => {
    const org = await ctx.runQuery(api.organization.getActiveOrganization, {});

    if (!org || !org.customerId) {
      throw new Error(ERRORS.STRIPE_SOMETHING_WENT_WRONG);
    }

    const customerPortal = await stripe.billingPortal.sessions.create({
      customer: org.customerId,
      return_url: `${process.env.SITE_URL}/${org.slug}/settings/organization/billing`,
    });
    if (!customerPortal) {
      throw new Error(ERRORS.STRIPE_SOMETHING_WENT_WRONG);
    }
    return customerPortal.url;
  },
});

export const cancelCurrentOrgSubscriptions = internalAction({
  args: {
    orgId: v.id("organization"),
  },
  handler: async (ctx, args) => {
    const org = await ctx.runQuery(api.organization.getActiveOrganization, {});

    if (!org) {
      throw new Error(ERRORS.STRIPE_SOMETHING_WENT_WRONG);
    }
    const subscriptions = (
      await stripe.subscriptions.list({ customer: org.customerId })
    ).data.map((sub) => sub.items);

    await asyncMap(subscriptions, async (subscription) => {
      await stripe.subscriptions.cancel(subscription.data[0].subscription);
    });
  },
});

export const createPaymentIntent = action({
  args: {
    orgId: v.id("organization"),
    planId: v.id("plans"),
    planInterval: intervalValidator,
    currency: currencyValidator,
    seats: v.number(),
    priceCheck: v.boolean(),
  },
  handler: async (ctx, args): Promise<{ clientSecret: string | null, newPrice?: number, discount?: number, credits?: number }> => {
    const org = await ctx.runQuery(api.organization.getActiveOrganization, {});

    if (!org || !org.customerId) {
      throw new Error(ERRORS.STRIPE_SOMETHING_WENT_WRONG);
    }

    const { currentSubscription, newPlan } = await ctx.runQuery(
      internal.stripe.getCurrentOrgSubscription,
      {
        planId: args.planId,
        orgId: org._id,
      }
    );

    if (!currentSubscription || !newPlan) {
      throw new Error(ERRORS.STRIPE_SOMETHING_WENT_WRONG);
    }

    const price = newPlan.prices[args.planInterval][args.currency];

    if (!price) {
      throw new Error(ERRORS.STRIPE_SOMETHING_WENT_WRONG);
    }

    const priceValue = price.amount * args.seats;

    if (args.priceCheck && currentSubscription.stripeId) {
      // Calculate prorated amount
      const prorationDate = Math.floor(Date.now() / 1000);
      const invoice = await stripe.invoices.retrieveUpcoming({
        customer: org.customerId,
        subscription: currentSubscription.stripeId,
        subscription_items: [{ 
          id: currentSubscription.stripeId, 
          price: price.stripeId,
          quantity: args.seats
        }],
        subscription_proration_date: prorationDate
      });

      const discount = invoice.starting_balance ? -invoice.starting_balance : 0;
      const newPrice = (priceValue - discount) / 100;
      const credits = discount > priceValue ? discount - priceValue : 0;

      return { clientSecret: null, newPrice, discount: discount / 100, credits };
    }

    // Create or update PaymentIntent
    let paymentIntent;
    if (currentSubscription.paymentIntentId) {
      paymentIntent = await stripe.paymentIntents.update(currentSubscription.paymentIntentId, {
        amount: priceValue,
        currency: args.currency,
      });
    } else {
      paymentIntent = await stripe.paymentIntents.create({
        amount: priceValue,
        currency: args.currency,
        customer: org.customerId,
        automatic_payment_methods: { enabled: true },
      });
    }

    // Update subscription with new PaymentIntent
    await ctx.runMutation(internal.stripe.PREAUTH_updateSubscriptionPaymentIntent, {
      orgId: args.orgId,
      paymentIntentId: paymentIntent.id,
    });

    return { clientSecret: paymentIntent.client_secret };
  },
});

export const PREAUTH_updateSubscriptionPaymentIntent = internalMutation({
  args: {
    orgId: v.id("organization"),
    paymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .unique();
    
    if (!subscription) {
      throw new Error(ERRORS.STRIPE_SOMETHING_WENT_WRONG);
    }

    await ctx.db.patch(subscription._id, { paymentIntentId: args.paymentIntentId });
  },
});

export const getInvoiceHistory = action({
  args: {
    orgId: v.id("organization"),
  },
  handler: async (ctx, args): Promise<Stripe.Invoice[]> => {
    const org = await ctx.runQuery(api.organization.getActiveOrganization, {});

    if (!org || !org.customerId) {
      throw new Error(ERRORS.STRIPE_SOMETHING_WENT_WRONG);
    }

    try {
      const invoices = await stripe.invoices.list({
        customer: org.customerId,
        limit: 100,
      });

      return invoices.data;
    } catch (error) {
      console.error("Error fetching invoice history:", error);
      throw new Error(ERRORS.STRIPE_SOMETHING_WENT_WRONG);
    }
  },
});

export const isSubscriptionActive = query({
  args: {
    orgId: v.id("organization"),
  },
  handler: async (ctx, args) => {
    const [orgId, subscription] = await Promise.all([
      ctx.db.get(args.orgId as Id<"organization">),
      ctx.db
        .query("subscriptions")
        .filter((q) => q.eq(q.field("orgId"), args.orgId))
        .unique(),
    ]);

    if (!orgId) {
      throw new Error(ERRORS.STRIPE_SOMETHING_WENT_WRONG);
    }

    if (!subscription) {
      throw new Error(ERRORS.STRIPE_SOMETHING_WENT_WRONG);
    }

    return subscription.status === "active" || subscription.status === "trialing";
  },
});

export const getSubscriptionByOrgId = internalQuery({
  args: {
    orgId: v.id("organization"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .unique();
  },
});

export const querySubscriptions = internalMutation({
  handler: async (ctx, args) => {
    const now = Math.floor(Date.now() / 1000);

    const expiredTrials = await ctx.db
      .query("subscriptions")
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), "trialing"),
          q.lt(q.field("currentPeriodEnd"), now)
        )
      )
      .collect();

    for (const subscription of expiredTrials) {
      try {
        const updatedStripeSubscription = await stripe.subscriptions.update(
          subscription.stripeId,
          { trial_end: 'now' }
        );

        await ctx.db.patch(subscription._id, {
          status: updatedStripeSubscription.status,
          currentPeriodEnd: updatedStripeSubscription.current_period_end,
          currentPeriodStart: updatedStripeSubscription.current_period_start,
        });
      } catch (error) {
        console.error(`Failed to update subscription ${subscription._id}:`, error);
      }
    }
  }
});

export const checkExpiredTrials = internalAction({
  handler: async (ctx) => {
    await ctx.runMutation(internal.stripe.querySubscriptions, {});
  }
});