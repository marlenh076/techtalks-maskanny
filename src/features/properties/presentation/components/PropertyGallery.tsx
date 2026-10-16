"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff, Play, X } from "lucide-react";
import type { Media } from "../../models/media.model";
import { PropertyImage } from "./PropertyImage";
import styles from "./PropertyGallery.module.css";

export function orderPropertyMedia(media: Media[]) {
  return [...media].sort(
    (a, b) =>
      (a.sort_order ?? Number.MAX_SAFE_INTEGER) -
        (b.sort_order ?? Number.MAX_SAFE_INTEGER) ||
      (a.media_id < b.media_id ? -1 : a.media_id > b.media_id ? 1 : 0),
  );
}

function GalleryVideo({ item, title }: { item: Media; title: string }) {
  const [failed, setFailed] = useState(false);

  return failed ? (
    <p role="status" className={styles.videoError}>
      This video couldn’t be played. Try another photo or video.
    </p>
  ) : (
    <video
      src={item.url}
      controls
      playsInline
      preload="metadata"
      aria-label={`${title} property video`}
      onError={() => setFailed(true)}
      className={styles.fullMedia}
    />
  );
}

export function PropertyGallery({
  media,
  title,
}: {
  media: Media[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);

  const ordered = orderPropertyMedia(media);
  const count = ordered.length;
  const selected = ordered[Math.min(active, count - 1)];
  const photos = ordered.filter((item) => item.type === "image").length;
  const videos = count - photos;

  const mediaSummary = [
    photos ? `${photos} ${photos === 1 ? "photo" : "photos"}` : "",
    videos ? `${videos} ${videos === 1 ? "video" : "videos"}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  useEffect(() => {
    if (open || count < 2) return;

    const timer = window.setInterval(() => {
      setActive((index) => (index + 1) % count);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [open, count]);

  useEffect(() => {
    if (!open || !count) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [open, count]);

  const previousMedia = () => {
    setActive((index) => (index - 1 + count) % count);
  };

  const nextMedia = () => {
    setActive((index) => (index + 1) % count);
  };

  const preview = (item: Media, index: number) =>
    item.type === "image" ? (
      <PropertyImage
        src={item.url}
        alt={`${title} — photo ${index + 1}`}
        className={styles.photo}
      />
    ) : (
      <span className={styles.videoPreview}>
        <Play size={32} aria-hidden="true" />
        <span>Property video</span>
      </span>
    );

  if (!count) {
    return (
      <div className={styles.noMedia}>
        <ImageOff size={30} aria-hidden="true" />
        <p>No photos or videos added yet</p>
      </div>
    );
  }

  return (
    <section aria-label="Property gallery">
      {/* Default slideshow */}
      <div className={styles.slideshow}>
        <button
          type="button"
          className={styles.cover}
          aria-label="Open property media gallery"
          onClick={(event) => {
            trigger.current = event.currentTarget;
            dialog.current?.showModal();
            setOpen(true);
          }}
        >
          <span key={selected.media_id} className={styles.slideFrame}>
            {preview(selected, active)}
          </span>
        </button>

        {count > 1 && (
          <>
            <button
              type="button"
              className={`${styles.slideArrow} ${styles.slidePrevious}`}
              aria-label="Previous photo"
              onClick={previousMedia}
            >
              <ChevronLeft size={25} aria-hidden="true" />
            </button>

            <button
              type="button"
              className={`${styles.slideArrow} ${styles.slideNext}`}
              aria-label="Next photo"
              onClick={nextMedia}
            >
              <ChevronRight size={25} aria-hidden="true" />
            </button>

            <span className={styles.slideCounter} aria-live="polite">
              {active + 1} / {count}
            </span>
          </>
        )}
      </div>

      <p className={styles.caption}>{mediaSummary} provided by the host</p>

      {/* Existing full-screen gallery */}
      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-label="Property media gallery"
        aria-modal="true"
        onClose={() => {
          setOpen(false);
          trigger.current?.focus({ preventScroll: true });
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            dialog.current?.close();
          }
        }}
        onKeyDown={(event) => {
          if (event.target instanceof HTMLVideoElement) return;

          if (event.key === "ArrowRight") {
            event.preventDefault();
            nextMedia();
          }

          if (event.key === "ArrowLeft") {
            event.preventDefault();
            previousMedia();
          }
        }}
      >
        {open && selected && (
          <>
            <div className={styles.dialogHeader}>
              <span aria-live="polite">
                {active + 1} / {count}
              </span>

              <button
                type="button"
                autoFocus
                aria-label="Close gallery"
                className={styles.roundButton}
                onClick={() => dialog.current?.close()}
              >
                <X size={23} aria-hidden="true" />
              </button>
            </div>

            <div className={styles.stage}>
              {selected.type === "image" ? (
                <PropertyImage
                  key={selected.media_id}
                  src={selected.url}
                  alt={`${title} — photo ${active + 1}`}
                  className={styles.fullMedia}
                />
              ) : (
                <GalleryVideo
                  key={selected.media_id}
                  item={selected}
                  title={title}
                />
              )}
            </div>

            <div className={styles.navigation}>
              {count > 1 && (
                <button
                  type="button"
                  aria-label="Previous media"
                  className={styles.roundButton}
                  onClick={previousMedia}
                >
                  <ChevronLeft aria-hidden="true" />
                </button>
              )}

              <span className={styles.mediaLabel}>
                {selected.type === "video"
                  ? "Property video"
                  : `Photo ${active + 1}`}
              </span>

              {count > 1 && (
                <button
                  type="button"
                  aria-label="Next media"
                  className={styles.roundButton}
                  onClick={nextMedia}
                >
                  <ChevronRight aria-hidden="true" />
                </button>
              )}
            </div>
          </>
        )}
      </dialog>
    </section>
  );
}
