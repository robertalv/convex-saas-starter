import { z } from "zod";
import { ERRORS } from "../utils/errors";

const AUTH_RESEND_KEY = process.env.AUTH_RESEND_KEY;
const AUTH_EMAIL = process.env.AUTH_EMAIL;

const ResendSuccessSchema = z.object({
  id: z.string(),
});
const ResendErrorSchema = z.union([
  z.object({
    name: z.string(),
    message: z.string(),
    statusCode: z.number(),
  }),
  z.object({
    name: z.literal("UnknownError"),
    message: z.literal("Unknown Error"),
    statusCode: z.literal(500),
    cause: z.any(),
  }),
]);

export type SendEmailOptions = {
  to: string | string[] | undefined;
  subject: string;
  html: string;
  text?: string;
  email?: string;
  orgName?: string | null | undefined;
  orgImage?: string;
  userImage?: string;
  invitedByUser?: string;
  invitedByEmail?: string;
  inviteLink?: string;
};

export async function sendEmail(options: SendEmailOptions) {
  if (!AUTH_RESEND_KEY) {
    throw new Error(`Resend - ${ERRORS.ENVS_NOT_INITIALIZED}`);
  }

  // Validate that 'to' field exists and is not empty
  if (!options.to) {
    throw new Error("Missing `to` field. Email recipient is required.");
  }

  const from = AUTH_EMAIL ?? "Relio CRM <onboarding@reliocrm.com>";
  const email = { from, ...options };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AUTH_RESEND_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(email),
    });

    const data = await response.json();
    const parsedData = ResendSuccessSchema.safeParse(data);

    if (response.ok && parsedData.success) {
      return { status: "success", data: parsedData } as const;
    } else {
      const parsedErrorResult = ResendErrorSchema.safeParse(data);
      if (parsedErrorResult.success) {
        console.error(parsedErrorResult.data);
        throw new Error(ERRORS.AUTH_EMAIL_NOT_SENT);
      } else {
        console.error(data);
        throw new Error(ERRORS.AUTH_EMAIL_NOT_SENT);
      }
    }
  } catch (error) {
    console.error(error);
    throw new Error(ERRORS.AUTH_EMAIL_NOT_SENT);
  }
}
