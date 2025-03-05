import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export const VerificationCodeEmail = ({
  code,
  expires,
}: {
  code: string;
  expires: Date;
}) => {
  return (
    <Html>
      <Head />
      <Preview>Your verification code for Convex Starter</Preview>
      <Body style={{ margin: 0, padding: 0, backgroundColor: "#f6f9fc" }}>
        <Container style={{ padding: "40px 0", textAlign: "center" }}>
          <Heading style={{ fontSize: "24px", fontWeight: "normal" }}>
            Your verification code
          </Heading>
          <Section style={{ padding: "20px 0" }}>
            <Text style={{ fontSize: "32px", fontWeight: "bold", letterSpacing: "6px" }}>
              {code}
            </Text>
          </Section>
          <Text style={{ color: "#666" }}>
            This code will expire in 15 minutes
          </Text>
        </Container>
      </Body>
    </Html>
  );
};