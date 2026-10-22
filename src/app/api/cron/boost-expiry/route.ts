import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/src/lib/email/send-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ExpiringBoost = {
  boost_id: string;
  property_title: string;
  owner_firstname: string | null;
  owner_email: string;
  end_date: string;
  notification_type: "three_day_reminder" | "expired";
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return entities[character];
  });
}

function getBeirutDate(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Beirut",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return `${values.year}-${values.month}-${values.day}`;
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Server environment is not configured" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await supabase.rpc("get_boosts_needing_expiry_notifications", {
    p_today: getBeirutDate(),
  });

  if (error) {
    console.error("Could not fetch expiring boosts:", error.message);

    return NextResponse.json({ error: "Could not fetch expiring boosts" }, { status: 500 });
  }

  const boosts = (data ?? []) as ExpiringBoost[];
  const results: { boostId: string; status: string }[] = [];

  for (const boost of boosts) {
    const expired = boost.notification_type === "expired";

    try {
      await sendEmail({
        to: boost.owner_email,
        subject: expired
          ? "Your Maskanny boost has expired"
          : "Your Maskanny boost expires in 3 days",

        html: `
  <div style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#111111;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f5f5f5;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background-color:#ffffff;border:1px solid #e5e5e5;">

            <!-- Header -->
            <tr>
              <td style="padding:26px 32px;border-bottom:1px solid #e5e5e5;">
                <p style="margin:0;font-size:24px;font-weight:700;letter-spacing:-0.7px;color:#111111;">
                  Maskanny
                </p>
                <p style="margin:6px 0 0;font-size:12px;color:#777777;">
                  Student Housing
                </p>
              </td>
            </tr>

            <!-- Main content -->
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 12px;font-size:12px;font-weight:600;letter-spacing:1px;color:#777777;">
                  BOOST NOTIFICATION
                </p>

                <h1 style="margin:0 0 24px;font-size:25px;line-height:1.35;font-weight:600;color:#111111;">
                  ${expired ? "Your boost has expired" : "Your boost expires soon"}
                </h1>

                <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#333333;">
                  Hello ${escapeHtml(boost.owner_firstname?.trim() || "there")},
                </p>

                <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#333333;">
                  ${expired
            ? `Your boost for <strong style="color:#111111;">${escapeHtml(boost.property_title)}</strong> has expired.`
            : `Your boost for <strong style="color:#111111;">${escapeHtml(boost.property_title)}</strong> will expire in 3 days.`
          }
                </p>

                <!-- Boost details -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e5e5e5;margin:0 0 24px;">
                  <tr>
                    <td colspan="2" style="padding:14px 16px;background-color:#fafafa;border-bottom:1px solid #e5e5e5;">
                      <p style="margin:0;font-size:14px;font-weight:600;color:#111111;">
                        Boost details
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:14px 16px;font-size:14px;color:#777777;border-bottom:1px solid #eeeeee;">
                      Property
                    </td>
                    <td align="right" style="padding:14px 16px;font-size:14px;font-weight:600;color:#111111;border-bottom:1px solid #eeeeee;">
                      ${escapeHtml(boost.property_title)}
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:14px 16px;font-size:14px;color:#777777;border-bottom:1px solid #eeeeee;">
                      Expiry date
                    </td>
                    <td align="right" style="padding:14px 16px;font-size:14px;font-weight:600;color:#111111;border-bottom:1px solid #eeeeee;">
                      ${escapeHtml(
            new Date(`${boost.end_date.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              timeZone: "UTC",
            })
          )}
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:14px 16px;font-size:14px;color:#777777;">
                      Status
                    </td>
                    <td align="right" style="padding:14px 16px;font-size:14px;font-weight:600;color:#111111;">
                      ${expired ? "Expired" : "Expiring in 3 days"}
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#333333;">
                  ${expired
            ? "If you would like to promote your property again, visit Maskanny to review the available boosting plans."
            : "If you would like to keep your property boosted, visit Maskanny to review your boosting options before the expiry date."
          }
                </p>

                <p style="margin:24px 0 0;font-size:15px;line-height:1.7;color:#333333;">
                  Best regards,<br />
                  <strong style="color:#111111;">Maskanny Team</strong>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:22px 32px;border-top:1px solid #e5e5e5;background-color:#fafafa;">
                <p style="margin:0 0 8px;font-size:12px;line-height:1.6;color:#777777;">
                  Maskanny · Student Housing
                </p>
                <p style="margin:0;font-size:12px;line-height:1.6;color:#777777;">
                  This is an automated notification from Maskanny.
                </p>
                <p style="margin:12px 0 0;font-size:12px;color:#999999;">
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

      results.push({ boostId: boost.boost_id, status: "sent" });
    } catch (emailError) {
      console.error(`Expiry email failed for boost ${boost.boost_id}:`, emailError);

      results.push({ boostId: boost.boost_id, status: "failed" });
    }
  }

  return NextResponse.json({
    date: getBeirutDate(),
    total: boosts.length,
    sent: results.filter((item) => item.status === "sent").length,
    failed: results.filter((item) => item.status === "failed").length,
    results,
  });
}
