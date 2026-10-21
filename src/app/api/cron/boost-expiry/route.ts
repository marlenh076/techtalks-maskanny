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
          <div style="font-family:Arial,sans-serif;line-height:1.7;color:#2B4162;max-width:600px;margin:auto">
            <h2>${expired ? "Your boost has expired" : "Your boost is expiring soon"}</h2>
            <p>Hello ${escapeHtml(boost.owner_firstname?.trim() || "there")},</p>
            <p>
              Your boost for <strong>${escapeHtml(boost.property_title)}</strong>
              ${expired ? "has expired" : "will expire in 3 days"}.
            </p>
            <p><strong>Expiry date:</strong> ${escapeHtml(boost.end_date.slice(0, 10))}</p>
            <p>
              ${
                expired
                  ? "Visit Maskanny to review the available boosting plans if you would like to boost your listing again."
                  : "Review your boosting options before the expiry date if you would like to keep your listing boosted."
              }
            </p>
            <p>Thank you for using Maskanny!</p>
            <p>The Maskanny Team</p>
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
