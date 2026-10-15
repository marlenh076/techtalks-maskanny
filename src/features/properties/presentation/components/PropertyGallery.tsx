"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, ImageOff, Play, X } from "lucide-react";
import type { Media } from "../../models/media.model";
import { PropertyImage } from "./PropertyImage";
import styles from "./PropertyGallery.module.css";

export function orderPropertyMedia(media: Media[]) {
  return [...media].sort((a, b) => (a.sort_order ?? Number.MAX_SAFE_INTEGER) - (b.sort_order ?? Number.MAX_SAFE_INTEGER) ||
    (a.media_id < b.media_id ? -1 : a.media_id > b.media_id ? 1 : 0));
}

function GalleryVideo({ item, title }: { item: Media; title: string }) {
  const [failed, setFailed] = useState(false);
  return failed ? <p role="status" className={styles.videoError}>This video couldn’t be played. Try another photo or video.</p> :
    <video src={item.url} controls playsInline preload="metadata" aria-label={`${title} property video`} onError={() => setFailed(true)} className={styles.fullMedia} />;
}

export function PropertyGallery({ media, title }: { media: Media[]; title: string }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const ordered = orderPropertyMedia(media);
  const count = ordered.length;
  const selected = ordered[Math.min(active, count - 1)];
  const photos = ordered.filter((item) => item.type === "image").length;
  const videos = count - photos;
  const mediaSummary = [photos ? `${photos} ${photos === 1 ? "photo" : "photos"}` : "", videos ? `${videos} ${videos === 1 ? "video" : "videos"}` : ""].filter(Boolean).join(" · ");
  const actionLabel = videos && photos ? "View photos & video" : videos ? "Watch video" : count > 1 ? `View all ${count} photos` : "View photo";

  useEffect(() => {
    if (!open || !count) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open, count]);

  const preview = (item: Media, index: number) => item.type === "image" ?
    <PropertyImage src={item.url} alt={`${title} — photo ${index + 1}`} className={styles.photo} /> :
    <span className={styles.videoPreview}><Play size={32} aria-hidden="true" /><span>Property video</span></span>;

  if (!count) return <div className={styles.noMedia}><ImageOff size={30} aria-hidden="true" /><p>No photos or videos added yet</p></div>;

  return <section aria-label="Property gallery">
    <div className={`${styles.grid} ${count > 1 ? styles.multiple : ""}`}>
      <button type="button" className={styles.cover} aria-label="Open property media gallery"
        onClick={(event) => { trigger.current = event.currentTarget; setActive(0); dialog.current?.showModal(); setOpen(true); }}>
        {preview(ordered[0], 0)}
        <span className={styles.galleryAction}><Expand size={16} aria-hidden="true" />{actionLabel}</span>
      </button>
      {count > 1 && <div className={styles.side}>
        {ordered.slice(1, 3).map((item, offset) => <button key={item.media_id} type="button" className={styles.preview}
          aria-label={`Open ${item.type === "video" ? "video" : "photo"} ${offset + 2}`}
          onClick={(event) => { trigger.current = event.currentTarget; setActive(offset + 1); dialog.current?.showModal(); setOpen(true); }}>
          {preview(item, offset + 1)}
        </button>)}
      </div>}
    </div>
    <p className={styles.caption}>{mediaSummary} provided by the host</p>
    <dialog ref={dialog} className={styles.dialog} aria-label="Property media gallery" aria-modal="true"
      onClose={() => { setOpen(false); trigger.current?.focus({ preventScroll: true }); }}
      onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}
      onKeyDown={(event) => {
        if (event.target instanceof HTMLVideoElement) return;
        if (event.key === "ArrowRight") { event.preventDefault(); setActive((index) => (index + 1) % count); }
        if (event.key === "ArrowLeft") { event.preventDefault(); setActive((index) => (index - 1 + count) % count); }
      }}>
      {open && selected && <>
        <div className={styles.dialogHeader}><span aria-live="polite">{Math.min(active + 1, count)} / {count}</span>
          <button type="button" autoFocus aria-label="Close gallery" className={styles.roundButton} onClick={() => dialog.current?.close()}><X size={23} aria-hidden="true" /></button>
        </div>
        <div className={styles.stage}>
          {selected.type === "image" ? <PropertyImage key={selected.media_id} src={selected.url} alt={`${title} — photo ${active + 1}`} className={styles.fullMedia} /> : <GalleryVideo key={selected.media_id} item={selected} title={title} />}
        </div>
        <div className={styles.navigation}>
          {count > 1 && <button type="button" aria-label="Previous media" className={styles.roundButton} onClick={() => setActive((active - 1 + count) % count)}><ChevronLeft aria-hidden="true" /></button>}
          <span className={styles.mediaLabel}>{selected.type === "video" ? "Property video" : `Photo ${active + 1}`}</span>
          {count > 1 && <button type="button" aria-label="Next media" className={styles.roundButton} onClick={() => setActive((active + 1) % count)}><ChevronRight aria-hidden="true" /></button>}
        </div>
      </>}
    </dialog>
  </section>;
}
