"use client";
import { useCallback, useMemo, useState } from "react";
import { Building2, Users, ShieldCheck, Search } from "lucide-react";
import { adminApi, queryString } from "@/src/features/admin/client/api";
import { useAdminQuery } from "@/src/features/admin/client/hooks";
import { dateLabel, dateRange } from "@/src/features/admin/client/format";
import { AdminModal, EmptyState, Pagination, QueryState, buttonClass, inputClass } from "./AdminUI";

export function UsersSidebar() {
  const [kind, setKind] = useState<"users" | "hosts">("users");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [preset, setPreset] = useState("ALL");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(25);
  const [selected, setSelected] = useState<string | null>(null);
  const range = useMemo(
    () => (preset === "ALL" ? {} : dateRange(preset as "TODAY" | "WEEK" | "MONTH")),
    [preset],
  );
  const key = queryString({
    ...range,
    page,
    page_size: size,
    query,
    role: kind === "users" ? role : undefined,
  });
  const load = useCallback(
    (signal: AbortSignal) =>
      adminApi.directory(kind, Object.fromEntries(new URLSearchParams(key)), signal),
    [key, kind],
  );
  const result = useAdminQuery(kind + key, load);
  const detailLoad = useCallback(
    (signal: AbortSignal) =>
      selected
        ? adminApi.directoryDetail(kind, selected, signal)
        : Promise.reject(new Error("Choose an account.")),
    [kind, selected],
  );
  const detail = useAdminQuery(selected === null ? null : kind + selected, detailLoad);
  function switchKind(next: "users" | "hosts") {
    setKind(next);
    setPage(1);
    setRole("");
    setSearch("");
    setQuery("");
    setSelected(null);
  }
  return (
    <div className="space-y-5 w-full">
      <div className="bg-white p-5 rounded-2xl border border-brand-slate/10 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-brand-navy/5 border border-brand-navy/10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm md:text-base">Directory & Access Control</h2>
            <p className="text-xs text-brand-slate">
              Stored accounts and Host property relationships. No student application workflow is
              available.
            </p>
          </div>
        </div>
        <div className="flex p-1 rounded-xl bg-brand-light/70 border border-brand-slate/10">
          {[
            { id: "users", label: "Accounts", icon: Users },
            { id: "hosts", label: "Property Owners", icon: Building2 },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => switchKind(item.id as "users" | "hosts")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold ${kind === item.id ? "bg-white shadow-2xs" : "text-brand-slate"}`}
              >
                <Icon className="w-4 h-4 text-brand-gold" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
      <form
        className="bg-white p-3.5 rounded-xl border border-brand-slate/10 shadow-2xs flex flex-wrap items-center gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          setQuery(search.trim());
          setPage(1);
        }}
      >
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-3 w-4 h-4 text-brand-slate" />
          <input
            aria-label="Search accounts or Hosts"
            value={search}
            maxLength={200}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={
              kind === "hosts" ? "Search owners or properties…" : "Search names or email…"
            }
            className={inputClass + " pl-9"}
          />
        </div>
        <button className={buttonClass}>Search</button>
        {kind === "users" && (
          <label className="!inline-flex !mb-0 items-center gap-1.5 text-xs text-brand-slate">
            Role{" "}
            <select
              value={role}
              onChange={(event) => {
                setRole(event.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-brand-slate/15 p-2"
            >
              <option value="">All roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </label>
        )}
        <label className="!inline-flex !mb-0 items-center gap-1.5 text-xs text-brand-slate">
          Joined{" "}
          <select
            value={preset}
            onChange={(event) => {
              setPreset(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-brand-slate/15 p-2"
          >
            <option value="ALL">All Time</option>
            <option value="TODAY">Today</option>
            <option value="WEEK">Last 7 Days</option>
            <option value="MONTH">Last 30 Days</option>
          </select>
        </label>
      </form>
      <QueryState loading={result.loading} error={result.error} retry={result.reload} />
      {result.data && (
        <div className="bg-white rounded-2xl border border-brand-slate/10 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-navy">
              <thead className="bg-brand-light/50 text-[11px] font-bold text-brand-slate uppercase tracking-wider">
                <tr>
                  <th className="p-4">Account</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Joined</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Properties</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-slate/10">
                {result.data.items.map((row) => (
                  <tr key={row.user_id} className="hover:bg-brand-light/20">
                    <td className="p-4 font-bold">
                      {row.firstname} {row.lastname}
                    </td>
                    <td className="p-3">{row.email}</td>
                    <td className="p-3">
                      {dateLabel(kind === "hosts" ? row.host_created_at : row.user_created_at)}
                    </td>
                    <td className="p-3 capitalize">
                      {row.role}
                      {row.host_id ? " · Host" : ""}
                    </td>
                    <td className="p-3">
                      {row.property_count}{" "}
                      <span className="text-brand-slate">
                        ({row.pending_property_count} pending moderation)
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelected(kind === "hosts" ? row.host_id : row.user_id)}
                        className="px-3 py-1.5 rounded-lg bg-brand-light border border-brand-slate/15 font-semibold"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!result.data.items.length && <EmptyState>No accounts match these filters.</EmptyState>}
          </div>
          <Pagination
            page={page}
            total={result.data.total}
            pageSize={size}
            onPage={setPage}
            onPageSize={(next) => {
              setSize(next);
              setPage(1);
            }}
          />
        </div>
      )}
      {selected && (
        <AdminModal
          title={kind === "hosts" ? "Host details" : "Account details"}
          onClose={() => setSelected(null)}
        >
          <QueryState loading={detail.loading} error={detail.error} retry={detail.reload} />
          {detail.data && (
            <>
              <h4 className="font-bold">
                {detail.data.account.firstname} {detail.data.account.lastname}
              </h4>
              <dl className="grid grid-cols-2 gap-3 text-xs">
                {Object.entries({
                  Email: detail.data.account.email,
                  Phone: detail.data.account.phone,
                  Role: detail.data.account.role,
                  "Account created": dateLabel(detail.data.account.created_at),
                  "Host since": detail.data.account.host_id
                    ? dateLabel(detail.data.account.host_since)
                    : "Not a Host",
                  Properties: detail.data.property_total,
                  "Last property": dateLabel(detail.data.account.last_property_at),
                }).map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-brand-slate">{label}</dt>
                    <dd className="break-words font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
              <h4 className="text-xs font-bold uppercase">Property submissions</h4>
              {detail.data.properties.length ? (
                detail.data.properties.map((row) => (
                  <div
                    key={row.property_id}
                    className="text-xs border-t border-brand-slate/10 pt-3"
                  >
                    <p className="font-semibold">{row.title}</p>
                    <p className="text-brand-slate capitalize">
                      {row.property_type} · ${row.price.toLocaleString()}/mo · Moderation:{" "}
                      {row.approval_status}
                    </p>
                    <p className="text-brand-slate">{dateLabel(row.created_at)}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-brand-slate">No owned property submissions.</p>
              )}
              {detail.data.property_total > detail.data.properties.length && (
                <p className="text-xs text-brand-slate">
                  Showing the newest {detail.data.properties_limit} of {detail.data.property_total}{" "}
                  properties. Use Listings to browse all submissions.
                </p>
              )}
            </>
          )}
        </AdminModal>
      )}
    </div>
  );
}
export default UsersSidebar;
