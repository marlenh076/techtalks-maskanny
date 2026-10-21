import { Resend } from "resend";

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "Maskanny <onboarding@resend.dev>",
    to: [to],
    subject,
    html,
  });

  if (error) {
    throw new Error(`Email sending failed: ${error.message}`);
  }
  console.log("Resend accepted email:", data?.id);
}
