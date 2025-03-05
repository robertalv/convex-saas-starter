import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import Resend from "@auth/core/providers/resend";
import { Profile } from "@auth/core/types";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import { aggregateUsers } from "./custom";
import { ResendOTP } from "./otp/ResendOTP";
import { ResendOTPPasswordReset } from "./passwordReset/ResendOTPPasswordReset";

interface ExtendedProfile extends Profile {
  // Standard OpenID Connect fields
  sub?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  middle_name?: string;
  nickname?: string;
  preferred_username?: string;
  profile?: string;
  picture?: string;
  website?: string;
  gender?: string;
  birthdate?: string;
  zoneinfo?: string;
  locale?: string;
  updated_at?: string;

  // Email related
  email?: string;
  email_verified?: boolean;

  // Phone related
  phone_number?: string;
  phone_number_verified?: boolean;

  // Address
  address?: {
    formatted?: string;
    street_address?: string;
    locality?: string;
    region?: string;
    postal_code?: string;
    country?: string;
  };

  // Google specific fields
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  expires_in?: number;
  token_type?: string;
  id_token?: string;
  scope?: string;

  // Additional Google profile fields
  hd?: string;
  verified_email?: boolean;
  language?: string;
  avatar_url?: string;

  // Any additional fields that might come from Google
  [key: string]: any;
}

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    GitHub,
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "https://mail.google.com https://www.googleapis.com/auth/userinfo.profile"
        }
      },
      profile(profile, tokens) {
        return {
          ...profile,
          id: profile.sub,
          email: profile.email,
          name: profile.name,
          image: profile.picture,
          scope: tokens.scope,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: Date.now() + (tokens.expires_in ?? 3600) * 1000
        };
      }
    }),
    ResendOTP,
    Password,
    Password({ id: "password-with-reset", reset: ResendOTPPasswordReset }),
    Password({
      id: "password-code",
      reset: ResendOTPPasswordReset,
      verify: ResendOTP,
    }),
    Password({ id: "password-link", verify: Resend }),
    Resend({
      apiKey: process.env.RESEND_API_KEY,
    }),
  ],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      const profile = args.profile as ExtendedProfile;
      const provider = args.provider;
      const type = args.type;
      const existingUserId = args.existingUserId;

      console.log("profile", profile);
      console.log("provider", provider);
      console.log("type", type);
      console.log("existingUserId", existingUserId);

      // If we have an existing user ID, return it immediately
      if (existingUserId) {
        return existingUserId;
      }

      // Refresh Google token if needed
      // if (profile.expires_at && profile.expires_at - 300000 < Date.now()) {
      //   const response = await fetch('https://oauth2.googleapis.com/token', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      //     body: new URLSearchParams({
      //       client_id: process.env.AUTH_GOOGLE_ID!,
      //       client_secret: process.env.AUTH_GOOGLE_SECRET!,
      //       refresh_token: profile.refresh_token!,
      //       grant_type: 'refresh_token',
      //     }),
      //   });

      //   const newTokens = await response.json();

      //   profile.access_token = newTokens.access_token;
      //   profile.expires_at = Date.now() + (newTokens.expires_in ?? 3600) * 1000;
      // }

      // Check for existing user by email
      // const existingUser = profile.email ? await ctx.db.query("users")
      //   .filter((q) => q.eq(q.field("email"), profile.email))
      //   .first() : null;

      // if (existingUser) {
      //   const providers = existingUser.providers || [];

      //   if (!providers.includes(provider.id)) {
      //     await ctx.db.patch(existingUser._id, {
      //       providers: [...providers, provider.id],
      //       ...(provider.id === 'google' && profile.access_token && {
      //         googleTokens: {
      //           accessToken: profile.access_token,
      //           refreshToken: profile.refresh_token,
      //           expiresAt: profile.expires_at,
      //         }
      //       })
      //     });
      //   }

      //   return existingUser._id;
      // }

      // Create new user
      console.log("creating new user");

      const newUser = await ctx.db.insert("users", {
        email: profile?.email || "",
        emailVerified: profile?.email ? true : false,
        emailVerificationTime: profile?.email ? new Date().getTime() : undefined,
        phoneVerified: false,
        name: profile?.name,
        firstName: profile?.given_name,
        lastName: profile?.family_name,
        image: profile?.image || profile?.picture,
        isOnboardingComplete: false,
        orgIds: [],
        providers: [provider.id],
        activeOrgId: "",
      });

      return newUser;
    },
  },
  session: {
    totalDurationMs: 1000 * 60 * 60 * 24 * 30,
    inactiveDurationMs: 1000 * 60 * 60 * 24 * 7,
  },
  jwt: {
    durationMs: 1000 * 60 * 60 * 24 * 7,
  },
});
