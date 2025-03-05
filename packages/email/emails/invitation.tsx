import { render } from "@react-email/render";
import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";

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
export default function InvitationSuccessEmail({ 
  email = "devwithbobby@gmail.com",
  orgName = "The Leeson Group", 
  orgImage = "https://firebasestorage.googleapis.com/v0/b/relio-217bd.appspot.com/o/logo-white.png?alt=media&token=67f75ea8-d2b3-4721-9ff3-4bb6aee678a4",
  userImage = "https://firebasestorage.googleapis.com/v0/b/relio-217bd.appspot.com/o/avatar.png?alt=media&token=f1a3f5e4-d2b3-4721-9ff3-4bb6aee678a4",
  invitedByUser = "Bobby",
  invitedByEmail = "metzgr@gmail.com",
  inviteLink = "https://app.reliocrm.com/organizations/join/the-leeson-group",
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
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="app-bg my-auto mx-auto font-sans px-2">
          <Container className="border border-zinc-800 rounded-lg bg-zinc-900 my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src={logo}
                width="60"
                height="60"
                alt="Relio"
                className="my-0 mx-auto rounded-full"
              />
            </Section>
            <Heading className="text-zinc-200 text-[24px] font-thin text-center p-0 my-[30px] mx-0">
              Join <span className="font-semibold">{orgName}</span> on <strong>Relio</strong>
            </Heading>
            <Text className="text-zinc-200 text-[14px] leading-[24px]">
              Hello,
            </Text>
            <Text className="text-zinc-200 text-[14px] leading-[24px]">
            <span className="font-semibold">{invitedByUser}</span> ( 
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
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              This invitation was intended for{' '}
              <span className="text-indigo-600">{email}</span>. This invite was
              sent from <span className="text-indigo-600">{invitedByEmail}</span>. If you
              were not expecting this invitation, you can ignore this email. If
              you are concerned about your account's safety, please reply to
              this email to get in touch with us.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
