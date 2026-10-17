"use client";

interface StatusCounts {
  active: number;
  pending: number;
  approved: number;
  rejected: number;
}

export function CategoryDonuts({ counts }: { counts: StatusCounts }) {
  const total = counts.active + counts.pending + counts.approved + counts.rejected;
  const activeEnd = total ? (counts.active / total) * 100 : 0;
  const pendingEnd = total ? activeEnd + (counts.pending / total) * 100 : 0;
  const approvedEnd = total ? pendingEnd + (counts.approved / total) * 100 : 0;
  const donutStyle = {
    background: total
      ? `conic-gradient(#2B4162 0% ${activeEnd}%, #D7B377 ${activeEnd}% ${pendingEnd}%, #385F71 ${pendingEnd}% ${approvedEnd}%, #8F5D38 ${approvedEnd}% 100%)`
      : "conic-gradient(#F5F0F6 0% 100%)",
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-brand-slate/15 shadow-sm flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-brand-navy text-base mb-1">Status Distribution</h3>
        <p className="text-xs text-brand-slate mb-6">Breakdown of current listing statuses</p>

        <div className="h-47 flex items-center justify-center">
          <div
            className="w-36 h-36 rounded-full p-3.5 flex items-center justify-center relative shadow-inner"
            style={donutStyle}
          >
            <div className="w-full h-full bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
              <span className="text-lg font-bold text-brand-navy leading-tight">{total}</span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-brand-slate">
                Total
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2.5 text-xs">
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-2 text-brand-slate">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-navy shrink-0" />
            Active
          </span>
          <span className="font-bold text-brand-navy">
            {total ? Math.round((counts.active / total) * 100) : 0}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-2 text-brand-slate">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-gold shrink-0" />
            Pending
          </span>
          <span className="font-bold text-brand-navy">
            {total ? Math.round((counts.pending / total) * 100) : 0}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-2 text-brand-slate">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-slate shrink-0" />
            Approved
          </span>
          <span className="font-bold text-brand-navy">
            {total ? Math.round((counts.approved / total) * 100) : 0}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-2 text-brand-slate">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-bronze shrink-0" />
            Rejected
          </span>
          <span className="font-bold text-brand-navy">
            {total ? Math.round((counts.rejected / total) * 100) : 0}%
          </span>
        </div>
      </div>
    </div>
  );
}
