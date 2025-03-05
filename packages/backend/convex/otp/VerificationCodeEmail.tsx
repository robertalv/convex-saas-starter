import {
  Body,
  Button,
  Container,
  Column,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Row,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";

export function VerificationCodeEmail({
  code,
  expires,
}: {
  code: string;
  expires: Date;
}) {
  const logo = `https://firebasestorage.googleapis.com/v0/b/relio-217bd.appspot.com/o/logo-white.png?alt=media&token=67f75ea8-d2b3-4721-9ff3-4bb6aee678a4`;

  return (
    <Html>
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
              Your one time verification code
            </Heading>

            <Section className="text-center">
              <Text className="text-zinc-200 text-[14px] leading-[24px]">
                We want to make sure it's really you. Please enter the following verification code when prompted.
              </Text>
            </Section>

            <Section className="bg-neutral-500 my-4 rounded-lg max-w-[280px]">
              <Text style={codeStyle}>{code}</Text>
            </Section>
            <Text className="text-center text-zinc-200 text-[14px] leading-[24px]">
              (This code is valid for 15 minutes)
            </Text>
            <Text style={paragraph}>Not expecting this email?</Text>
            <Text style={paragraph}>
              Contact{' '}
              <Link href="mailto:support@reliocrm.com" className="text-indigo-600 no-underline">
                support@reliocrm.com
              </Link>{' '}
              if you did not request this code.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}


const codeContainer = {
  background: 'rgba(0,0,0,.05)',
  borderRadius: '4px',
  margin: '16px auto 14px',
  verticalAlign: 'middle',
  width: '280px',
};

const codeStyle = {
  color: '#FFF',
  display: 'inline-block',
  fontFamily: 'HelveticaNeue-Bold',
  fontSize: '32px',
  fontWeight: 700,
  letterSpacing: '6px',
  lineHeight: '40px',
  paddingBottom: '8px',
  paddingTop: '8px',
  margin: '0 auto',
  width: '100%',
  textAlign: 'center' as const,
};

const paragraph = {
  color: '#888',
  fontSize: '15px',
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
  letterSpacing: '0',
  lineHeight: '23px',
  padding: '0 40px',
  margin: '0',
  textAlign: 'center' as const,
};