import { authorized, json, query } from "@/src/features/admin/http";
import { reportSchema } from "@/src/features/admin/validation/admin.schema";
import { AdminService } from "@/src/features/admin/service/admin";
export async function GET(request: Request) {
  return authorized(request, async (repo) => {
    const filters = query(request, reportSchema);
    const report = await new AdminService(repo).report(
      filters.type,
      filters.from,
      filters.to,
    );
    if (filters.format === "csv")
      return new Response(report.csv(), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Cache-Control": "no-store",
          "Content-Disposition":
            'attachment; filename="maskanny-' + filters.type + '.csv"',
          "X-Total-Count": String(report.total),
          "X-Content-Type-Options": "nosniff",
        },
      });
    const { csv, ...result } = report;
    void csv;
    return json(result);
  });
}
