
import { Resend } from "resend";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;

    if (!apiKey || !from) {
      return NextResponse.json(
        { error: "Email service is not configured." },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from,
      to: [email],
      subject: "Welcome to Maskanny — Test Email",
      html: `
  <div style="margin:0; padding:0; background-color:#f5f5f5; font-family:Arial,Helvetica,sans-serif; color:#111111;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f5f5f5; padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px; background-color:#ffffff; border:1px solid #e5e5e5;">

            <!-- Brand header -->
            <tr>
              <td style="padding:26px 32px; border-bottom:1px solid #e5e5e5;">
                <p style="margin:0; font-size:24px; font-weight:700; letter-spacing:-0.7px; color:#111111;">
                  Maskanny
                </p>
              </td>
            </tr>

            <!-- Email content -->
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 12px; font-size:12px; font-weight:600; letter-spacing:1px; color:#777777;">
                  NOTIFICATION
                </p>

                <h1 style="margin:0 0 20px; font-size:25px; line-height:1.35; font-weight:600; color:#111111;">
                  Your email notifications are working
                </h1>

                <p style="margin:0 0 16px; font-size:15px; line-height:1.7; color:#333333;">
                  Hello,
                </p>

                <p style="margin:0 0 16px; font-size:15px; line-height:1.7; color:#333333;">
                  This is a test of the Maskanny notification system. If you're reading this email, your email integration is working correctly.
                </p>

                <p style="margin:0 0 24px; font-size:15px; line-height:1.7; color:#333333;">
                  You'll receive important updates about your listings, payments, and activity on Maskanny through this email address.
                </p>

                <p style="margin:0; font-size:15px; line-height:1.7; color:#333333;">
                  Best regards,<br />
                  <strong style="color:#111111;">Maskanny Team</strong>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:22px 32px; border-top:1px solid #e5e5e5; background-color:#fafafa;">
                <p style="margin:0 0 8px; font-size:12px; line-height:1.6; color:#777777;">
                  Maskanny · Student Housing
                </p>
                <p style="margin:0; font-size:12px; line-height:1.6; color:#777777;">
                  This is an automated notification from Maskanny.
                </p>
                <p style="margin:12px 0 0; font-size:12px; color:#999999;">
                  © ${new Date().getFullYear()} Maskanny. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>
`,

    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send the test email." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id,
    });
  } catch (error) {
    console.error("Test email route error:", error);

    return NextResponse.json(
      { error: "An unexpected error occurred. Check the server terminal." },
      { status: 500 }
    );
  }
}