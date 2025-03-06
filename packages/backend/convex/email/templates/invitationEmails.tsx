import { sendEmail } from "../index";

interface InvitationEmailOptions {
  email?: string;
  userImage?: string;
  invitedByUser?: string;
  invitedByEmail?: string;
  orgName?: string | null | undefined;
  orgImage?: string;
  inviteLink?: string;
  inviteFromIp?: string;
  inviteFromLocation?: string
}

// Generate HTML for the invitation success email
const generateInvitationSuccessHtml = (options: InvitationEmailOptions) => {
  const {
    email,
    orgName = "an organization",
    orgImage,
    userImage,
    invitedByUser = "Someone",
    invitedByEmail = "a team member",
    inviteLink = "https://app.reliocrm.com/organizations"
  } = options;

  const logo = "https://firebasestorage.googleapis.com/v0/b/relio-217bd.appspot.com/o/logo-white.png?alt=media&token=67f75ea8-d2b3-4721-9ff3-4bb6aee678a4";
  const arrow = "https://firebasestorage.googleapis.com/v0/b/relio-217bd.appspot.com/o/arrow.png?alt=media&token=8ad4ab9e-5bc2-49d3-aaa2-f636e8dfe892";
  const defaultUserImage = "https://firebasestorage.googleapis.com/v0/b/relio-217bd.appspot.com/o/avatar-placeholder.png?alt=media&token=60c66f02-5c16-47f7-9e0c-ed3680496dbd";
  const defaultOrgImage = "https://firebasestorage.googleapis.com/v0/b/relio-217bd.appspot.com/o/org-placeholder.png?alt=media&token=67f75ea8-d2b3-4721-9ff3-4bb6aee678a4";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Join ${orgName} on Relio</title>
      </head>
      <body style="margin: 0; padding: 0 10px; background-color: #131313; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <div style="border: 1px solid #27272a; border-radius: 12px; background-color: #18181b; margin: 40px auto; padding: 20px; max-width: 465px;">
          <div style="margin-top: 32px; text-align: center;">
            <img src="${logo}" width="40" height="40" alt="Relio" style="margin: 0 auto; border-radius: 50%;">
          </div>
          
          <h1 style="color: #e4e4e7; font-size: 24px; font-weight: normal; text-align: center; padding: 0; margin: 30px 0;">
            Join <strong>${orgName}</strong> on <strong>Relio</strong>
          </h1>
          
          <p style="color: #e4e4e7; font-size: 14px; line-height: 24px;">
            Hello,
          </p>
          
          <p style="color: #e4e4e7; font-size: 14px; line-height: 24px;">
            <strong>${invitedByUser}</strong> (<a href="mailto:${invitedByEmail}" style="color: #818cf8; text-decoration: none;">${invitedByEmail}</a>) 
            has invited you to the <strong>${orgName}</strong> organization on <strong>Relio</strong>.
          </p>
          
          <div style="text-align: center; margin-top: 32px; margin-bottom: 32px;">
            <a href="${inviteLink}" style="background-color: #000000; border-radius: 4px; color: #e4e4e7; font-size: 12px; font-weight: 600; text-decoration: none; text-align: center; padding: 15px 20px; display: inline-block;">
              Join the team
            </a>
          </div>
          
          <p style="color: #e4e4e7; font-size: 14px; line-height: 24px;">
            or copy and paste this URL into your browser: <a href="${inviteLink}" style="color: #818cf8; text-decoration: none;">${inviteLink}</a>
          </p>
        </div>
      </body>
    </html>
  `;
};

// Generate HTML for the invitation error email
const generateInvitationErrorHtml = (options: InvitationEmailOptions) => {
  const { email = "there", orgName = "an organization" } = options;
  const logo = "https://firebasestorage.googleapis.com/v0/b/relio-217bd.appspot.com/o/logo-white.png?alt=media&token=67f75ea8-d2b3-4721-9ff3-4bb6aee678a4";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Subscription Issue - Customer Support</title>
      </head>
      <body style="margin: 0; padding: 0 10px; background-color: #131313; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <div style="border: 1px solid #27272a; border-radius: 12px; background-color: #18181b; margin: 40px auto; padding: 20px; max-width: 465px;">
          <div style="margin-top: 32px; text-align: center;">
            <img src="${logo}" width="40" height="40" alt="Relio" style="margin: 0 auto; border-radius: 50%;">
          </div>
          
          <h1 style="color: #e4e4e7; font-size: 24px; font-weight: normal; text-align: center; padding: 0; margin: 30px 0;">
            Subscription Issue
          </h1>
          
          <p style="color: #e4e4e7; font-size: 14px; line-height: 24px;">
            Hello ${email}.
          </p>
          
          <p style="color: #e4e4e7; font-size: 14px; line-height: 24px;">
            We were unable to process your subscription to PRO tier.
            <br>
            But don't worry, we'll not charge you anything.
          </p>
          
          <p style="color: #e4e4e7; font-size: 14px; line-height: 24px;">
            The <a href="https://reliocrm.com" style="color: #818cf8; text-decoration: none;">Relio</a> team.
          </p>
          
          <hr style="border: none; border-top: 1px solid #27272a; margin: 20px 0;">
          
          <p style="color: #71717a; font-size: 12px;">
            &copy; 2025 Relio
          </p>
        </div>
      </body>
    </html>
  `;
};

/**
 * Sends an invitation success email to the specified user
 */
export async function sendInvitationSuccessEmail(options: InvitationEmailOptions) {
  try {
    // Check if any required props are missing to prevent errors
    if (!options.email) {
      console.error("Missing email for invitation");
      return;
    }
    
    // Generate HTML for the email
    const html = generateInvitationSuccessHtml(options);

    // Send the email with the HTML content
    await sendEmail({
      to: options.email,
      subject: `You've been invited to join ${options.orgName || "an organization"}`,
      html,
    });
  } catch (error) {
    console.error("Error sending invitation email:", error);
    throw new Error(`Failed to send invitation email: ${error}`);
  }
}

/**
 * Sends an error notification email
 */
export async function sendInvitationErrorEmail(options: InvitationEmailOptions) {
  try {
    // Check if email is missing to prevent errors
    if (!options.email) {
      console.error("Missing email for error notification");
      return;
    }
    
    // Generate HTML for the email
    const html = generateInvitationErrorHtml(options);

    // Send the email with the HTML content
    await sendEmail({
      to: options.email,
      subject: `Subscription Issue - Customer Support`,
      html,
    });
  } catch (error) {
    console.error("Error sending error email:", error);
    throw new Error(`Failed to send error notification email: ${error}`);
  }
}
