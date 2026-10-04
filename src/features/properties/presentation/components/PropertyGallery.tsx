"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, Play, X } from "lucide-react";
import type { Media } from "../../models/media.model";
import type { Property } from "../../models/property.model";
import { PropertyImage } from "./PropertyImage";

export function PropertyGallery({ media, title, propertyType }: { media: Media[]; title: string; propertyType: Property["property_type"] }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const ordered = [...media].sort((a, b) => Number(b.type === "image") - Number(a.type === "image"));
  const count = ordered.length;
  const actionLabel = ordered.some((item) => item.type === "video")
    ? ordered.some((item) => item.type === "image") ? "View all photos & video" : "View video"
    : count > 1 ? "View all photos" : "View photo";

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "ArrowRight") setActive((index) => (index + 1) % count);
      if (event.key === "ArrowLeft") setActive((index) => (index - 1 + count) % count);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", onKeyDown); };
  }, [open, count]);

  const show = (index: number) => { setActive(index); setOpen(true); };

  if (count === 0) return <div className="grid h-[530px] place-items-center overflow-hidden rounded-[var(--radius-xl)] bg-[var(--placeholder-bg)] text-sm text-[var(--soft)] max-[1000px]:h-[450px] max-[520px]:h-[300px]">Photos have not been added yet</div>;

  return (
    <section aria-label="Property gallery">
      <div className={`grid h-[530px] gap-2.5 overflow-hidden rounded-[var(--radius-xl)] bg-[var(--placeholder-bg)] max-[1000px]:h-[450px] max-[760px]:h-auto ${count === 1 ? "grid-cols-1" : "grid-cols-[minmax(0,2fr)_minmax(240px,0.8fr)] max-[760px]:grid-cols-1"}`}>
        <button type="button" onClick={() => show(0)} className="relative min-h-0 min-w-0 overflow-hidden border-0 bg-[var(--placeholder-bg)] p-0 text-left focus-visible:outline-2 focus-visible:outline-[var(--ink)] focus-visible:outline-offset-[3px] max-[760px]:min-h-[380px] max-[520px]:min-h-[300px]" aria-label="Open property media gallery">
          {ordered[0].type === "image" ? <PropertyImage src={ordered[0].url} alt={`${title} photo 1`} className="h-full w-full object-cover transition duration-300 hover:scale-105" /> : <div className="flex h-full items-center justify-center bg-[var(--ink)] text-[var(--surface)]"><Play size={50} /></div>}
          <span className="absolute top-5 left-5 inline-flex items-center gap-2 rounded-full bg-[var(--gallery-badge)] px-[13px] py-2 text-xs font-medium text-[var(--ink)] capitalize backdrop-blur-sm"><span className="h-[7px] w-[7px] rounded-full bg-[var(--ink-2)]" />{propertyType}</span>
          <span className="absolute right-4 bottom-4 flex items-center gap-2 rounded-[12px] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--ink)] shadow"><Expand size={16} />{actionLabel}</span>
        </button>
        {count > 1 && <div className="grid min-h-0 min-w-0 grid-rows-2 gap-2.5 max-[760px]:h-[180px] max-[760px]:grid-cols-2 max-[760px]:grid-rows-none max-[520px]:hidden">{[1,2].map((index) => ordered[index] ? <button key={ordered[index].media_id} type="button" onClick={() => show(index)} className="relative min-h-0 min-w-0 overflow-hidden border-0 bg-[var(--placeholder-bg)] p-0 text-left focus-visible:outline-2 focus-visible:outline-[var(--ink)] focus-visible:outline-offset-[3px]" aria-label={`Open media ${index + 1}`}>{ordered[index].type === "image" ? <PropertyImage src={ordered[index].url} alt={`${title} photo ${index + 1}`} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center bg-[var(--ink)] text-[var(--surface)]"><Play size={35} /><span className="ml-2">Video</span></div>}</button> : <div key={index} className="min-h-0 min-w-0 bg-[var(--placeholder-bg)]" />)}</div>}
      </div>
      {open && <div role="dialog" aria-modal="true" aria-label="Property media gallery" className="fixed inset-0 z-50 flex flex-col bg-[var(--gallery-overlay)] text-[var(--surface)]">
        <div className="flex items-center justify-between px-5 py-4"><span className="text-sm">{active + 1} / {count}</span><button type="button" autoFocus onClick={() => setOpen(false)} aria-label="Close gallery" className="rounded-full p-2 hover:bg-[var(--gallery-control)]"><X size={24} /></button></div>
        <div className="relative flex min-h-0 flex-1 items-center justify-center px-12 pb-4 sm:px-20">
          {ordered[active].type === "image" ? <PropertyImage key={ordered[active].media_id} src={ordered[active].url} alt={`${title} photo ${active + 1}`} className="max-h-full max-w-full object-contain" /> : <video key={ordered[active].media_id} src={ordered[active].url} controls autoPlay className="max-h-full max-w-full" />}
          {count > 1 && <><button type="button" onClick={() => setActive((active - 1 + count) % count)} aria-label="Previous media" className="absolute left-2 rounded-full bg-[var(--gallery-control)] p-2 hover:bg-[var(--gallery-control-hover)] sm:left-5"><ChevronLeft /></button><button type="button" onClick={() => setActive((active + 1) % count)} aria-label="Next media" className="absolute right-2 rounded-full bg-[var(--gallery-control)] p-2 hover:bg-[var(--gallery-control-hover)] sm:right-5"><ChevronRight /></button></>}
        </div>
        {count > 1 && <div className="flex justify-center gap-2 overflow-x-auto px-5 py-4">{ordered.map((item, index) => <button type="button" key={item.media_id} onClick={() => setActive(index)} aria-label={`Show media ${index + 1}`} aria-current={index === active} className={`h-14 w-20 shrink-0 overflow-hidden rounded-[8px] border-2 ${index === active ? "border-[var(--ink-2)]" : "border-transparent"}`}>{item.type === "image" ? <PropertyImage src={item.url} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center bg-[var(--soft)]"><Play size={18} /></span>}</button>)}</div>}
      </div>}
    </section>
  );
}
