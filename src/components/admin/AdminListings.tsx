"use client";
import { useCallback, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { adminApi, queryString } from "@/src/features/admin/client/api";
import { useAdminQuery } from "@/src/features/admin/client/hooks";
import { dateRange, type DatePreset } from "@/src/features/admin/client/format";
import ListingsSidebar, { type ListingFilter } from "./ListingsSidebar";
import RecentSubmissions from "./RecentSubmissions";
import { Pagination, QueryState, buttonClass, inputClass } from "./AdminUI";

export default function AdminListings({
  preset,
  initialStatus = "pending",
}: {
  preset: DatePreset | "ALL";
  initialStatus?: "pending" | "all";
}) {
  const [filters, setFilters] = useState<ListingFilter>({ status: initialStatus, category: "all" });
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [pagination, setPagination] = useState({ page: 1, page_size: 25 });
  const range = useMemo(() => (preset === "ALL" ? {} : dateRange(preset)), [preset]);
  // A date/filter change creates a new page scope rather than showing stale rows.
  const scope = queryString({
    ...range,
    status: filters.status,
    property_type: filters.category === "all" ? undefined : filters.category,
    query,
  });
  const [pageScope, setPageScope] = useState(scope);
  const page = pageScope === scope ? pagination.page : 1;
  const parameters = {
    ...range,
    status: filters.status,
    property_type: filters.category === "all" ? undefined : filters.category,
    query,
    page,
    page_size: pagination.page_size,
  };
  const key = queryString(parameters);
  const load = useCallback(
    (signal: AbortSignal) =>
      adminApi.properties(Object.fromEntries(new URLSearchParams(key)), signal),
    [key],
  );
  const result = useAdminQuery(key, load);
  const countKey = queryString({ ...range, status: "all", page_size: 1 });
  const countLoad = useCallback(
    (signal: AbortSignal) =>
      adminApi.properties(Object.fromEntries(new URLSearchParams(countKey)), signal),
    [countKey],
  );
  const counts = useAdminQuery(countKey, countLoad);
  function refresh(text: string) {
    setMessage(text);
    // A moderation decision can remove the final row of a filtered page.
    setPageScope(scope);
    setPagination((value) => ({ ...value, page: 1 }));
    result.reload();
    counts.reload();
  }
  return (
    <div className="flex flex-col xl:flex-row gap-6 items-stretch w-full min-w-0 flex-1">
      <ListingsSidebar
        filters={filters}
        totalCount={counts.data?.total}
        pendingCount={
          filters.status === "pending" && !query && filters.category === "all"
            ? result.data?.total
            : undefined
        }
        onFilterChange={setFilters}
      />
      <div className="flex-1 min-w-0 space-y-3">
        <form
          className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center min-w-0"
          onSubmit={(event) => {
            event.preventDefault();
            setQuery(search.trim());
            setPagination((value) => ({ ...value, page: 1 }));
          }}
        >
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-3 w-4 h-4 text-brand-slate" />
            <input
              aria-label="Search listings"
              value={search}
              maxLength={200}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search listings, owners or addresses…"
              className={inputClass + " pl-9"}
            />
          </div>
          <button className={buttonClass + " shrink-0"}>Search</button>
        </form>
        {message && (
          <p role="status" className="p-3 rounded-xl bg-emerald-50 text-sm text-emerald-700">
            {message}
          </p>
        )}
        <QueryState error={counts.error} retry={counts.reload} />
        <QueryState loading={result.loading} error={result.error} retry={result.reload} />
        {result.data && (
          <>
            <RecentSubmissions
              submissions={result.data.items}
              total={result.data.total}
              onChanged={refresh}
            />
            <Pagination
              page={page}
              pageSize={pagination.page_size}
              total={result.data.total}
              onPage={(next) => {
                setPageScope(scope);
                setPagination((value) => ({ ...value, page: next }));
              }}
              onPageSize={(size) => {
                setPageScope(scope);
                setPagination({ page: 1, page_size: size });
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
