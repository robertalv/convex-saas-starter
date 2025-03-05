import {
    Body,
    Button,
    Column,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Row,
    Section,
    Tailwind,
    Text,
} from "@react-email/components";
import { render } from "@react-email/render";
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

/**
 * Templates.
 */
export function InvitationSuccessEmail({ 
  email, 
  orgName, 
  orgImage,
  userImage, 
  invitedByUser,
  invitedByEmail,
  inviteLink,
}: InvitationEmailOptions) {
  if (!orgName) {
    throw new Error("Organization name is required");
  }

  const previewText = `Join ${invitedByUser} on ${orgName}`;
  const logo = `https://firebasestorage.googleapis.com/v0/b/relio-217bd.appspot.com/o/logo-white.png?alt=media&token=67f75ea8-d2b3-4721-9ff3-4bb6aee678a4`;
  const arrow = `https://firebasestorage.googleapis.com/v0/b/relio-217bd.appspot.com/o/arrow.png?alt=media&token=8ad4ab9e-5bc2-49d3-aaa2-f636e8dfe892`;

  return (
    <Html>
      <Head />
      <Preview>{previewText} </Preview>
      <Tailwind>
        <Body className="app-bg my-auto mx-auto font-sans px-2">
          <Container className="border border-zinc-800 rounded-xl bg-zinc-900 my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src={logo}
                width="40"
                height="40"
                alt="Relio"
                className="my-0 mx-auto rounded-full"
              />
            </Section>
            <Heading className="text-zinc-200 text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Join <strong>{orgName}</strong> on <strong>Relio</strong>
            </Heading>
            <Text className="text-zinc-200 text-[14px] leading-[24px]">
              Hello,
            </Text>
            <Text className="text-zinc-200 text-[14px] leading-[24px]">
              <strong>{invitedByUser}</strong> (
              <Link
                href={`mailto:${invitedByEmail}`}
                className="text-indigo-600 no-underline"
              >
                {invitedByEmail}
              </Link>
              ) has invited you to the <strong>{orgName}</strong> organization on{" "}
              <strong>Relio</strong>.
            </Text>
            <Section>
              <Row>
                <Column align="right">
                {userImage ? (
                  <Img
                    className="rounded-full"
                    src={userImage}
                    width="64"
                    height="64"
                  />
                ) : (
                  <Text className="text-zinc-200 text-2xl h-[64px] w-[64px] rounded-full border border-zinc-800 flex justify-center items-center">
                    {email?.charAt(0) || email?.charAt(0)}
                  </Text>
                )}
                </Column>
                <Column align="center">
                  <Img
                    src={arrow}
                    width="12"
                    height="9"
                    alt="invited you to"
                  />
                </Column>
                <Column align="left">
                {orgImage ? (
                  <Img
                    className="rounded-full"
                    src={orgImage}
                    width="64"
                    height="64"
                  />
                ) : (
                  <Text className="text-zinc-200 text-2xl h-[64px] w-[64px] rounded-full border border-indigo-400 flex justify-center items-center bg-indigo-500">
                    {orgName?.charAt(0)}
                  </Text>
                )}
                </Column>
              </Row>
            </Section>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button className="bg-[#000000] rounded text-zinc-200 text-[12px] font-semibold no-underline text-center px-5 py-3" href={inviteLink}>
                Join the team
              </Button>
            </Section>
            <Text className="text-zinc-200 text-[14px] leading-[24px]">
              or copy and paste this URL into your browser:{" "}
              <Link href={inviteLink} className="text-indigo-600 no-underline">
                {inviteLink}
              </Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export function InvitationErrorEmail({ email }: InvitationEmailOptions) {
  return (
    <Html>
      <Head />
      <Preview>Subscription Issue - Customer Support</Preview>
      <Body
        style={{
          backgroundColor: "#ffffff",
          fontFamily:
            '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
        }}
      >
        <Container style={{ margin: "0 auto", padding: "20px 0 48px" }}>
          <Img
            src="https://react-email-demo-ijnnx5hul-resend.vercel.app/static/vercel-logo.png"
            width="40"
            height="37"
            alt=""
          />
          <Text style={{ fontSize: "16px", lineHeight: "26px" }}>
            Hello {email}.
          </Text>
          <Text style={{ fontSize: "16px", lineHeight: "26px" }}>
            We were unable to process your subscription to PRO tier.
            <br />
            But don&apos;t worry, we&apos;ll not charge you anything.
          </Text>
          <Text style={{ fontSize: "16px", lineHeight: "26px" }}>
            The <Link href="http://localhost:3000">domain-name.com</Link> team.
          </Text>
          <Hr style={{ borderColor: "#cccccc", margin: "20px 0" }} />
          <Text style={{ color: "#8898aa", fontSize: "12px" }}>
            200 domain-name.com
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

/**
 * Renders.
 */
export function renderInvitationSuccessEmail(args: InvitationEmailOptions) {
  return render(<InvitationSuccessEmail {...args} />);
}

export function renderSubscriptionErrorEmail(args: InvitationEmailOptions) {
  return render(<InvitationErrorEmail {...args} />);
}

/**
 * Senders.
 */
export async function sendInvitationSuccessEmail({
  email, 
  orgName, 
  orgImage,
  userImage,
  invitedByUser,
  invitedByEmail,
  inviteLink,
}: InvitationEmailOptions) {
  const html = await renderInvitationSuccessEmail({ 
    email, 
    orgName,
    orgImage,
    userImage,
    invitedByUser,
    invitedByEmail,
    inviteLink,
  });

  await sendEmail({
    to: email,
    subject: `You've been invited to join ${orgName}`,
    html,
  });
}

export async function sendInvitationErrorEmail({
  email,
  orgName,
}: InvitationEmailOptions) {
  const html = await renderSubscriptionErrorEmail({ email, orgName });

  await sendEmail({
    to: email,
    subject: "Invitation Issue - Customer Support",
    html,
  });
}
