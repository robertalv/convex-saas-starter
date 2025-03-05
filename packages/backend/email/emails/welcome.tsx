import {
  Body,
  Button,
  Container,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
} from "@react-email/components";

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3001";

export default function WelcomeEmail() {
  return (
    <Html>
      <Preview>Welcome</Preview>
      <Tailwind>
        <Body className="my-auto mx-auto font-sans">
          <Container className="border-transparent my-[40px] mx-auto max-w-[600px]">
            <Img src="/logo.png" alt="logo" width={100} height={100} />
            <Heading className="font-normal text-center p-0 my-[30px] mx-0">
              Welcome to Relio
            </Heading>
            <Section className="mb-4">
              Hi, I'm Pontus, one of the founders.
            </Section>
            <Section className="mb-6">
              <Link href={baseUrl}>
                <Button className="bg-black text-white p-4 text-center">
                  Get started
                </Button>
              </Link>
            </Section>
            <Hr />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
