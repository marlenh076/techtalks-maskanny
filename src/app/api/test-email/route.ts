import { Resend } from "resend";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Email service is not configured." }, { status: 500 });
    }

    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from: "Maskanny <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to Maskanny — Test Email",
      html: `
        <div style="font-family: Arial, sans-serif; color: #2B4162;">
          <h1>Welcome to Maskanny!</h1>
          <p>This is a test email from the Maskanny notification system.</p>
          <p>Your email integration is working.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send the test email." }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id,
    });
  } catch (error) {
    console.error("Test email route error:", error);

    return NextResponse.json(
      { error: "An unexpected error occurred. Check the server terminal." },
      { status: 500 },
    );
  }
}
