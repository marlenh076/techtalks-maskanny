"use client";
import { Star } from "lucide-react";
export default function ReviewsSidebar() {
  return <div className="space-y-5 w-full"><div className="bg-white p-5 rounded-2xl border border-brand-slate/10 shadow-2xs flex items-center gap-3.5"><div className="w-10 h-10 rounded-xl bg-brand-navy/5 border border-brand-slate/10 flex items-center justify-center"><Star className="w-5 h-5 text-brand-gold" /></div><div><h2 className="font-bold text-brand-navy text-sm md:text-base">Reviews & Moderation</h2><p className="text-xs text-brand-slate">Unavailable until review ownership, submission and moderation requirements are defined.</p></div></div><div className="bg-white p-8 rounded-2xl border border-brand-slate/10 shadow-2xs text-sm text-brand-slate">Maskanny does not currently store reviews or ratings. Review search, publishing, hiding and deletion will be available after that feature is implemented.</div></div>;
}
