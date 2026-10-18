"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

export function PropertyImage({
  src,
  alt,
  className = "",
  optimized = false,
}: {
  src: string | null;
  alt: string;
  className?: string;
  optimized?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [transformFailed, setTransformFailed] = useState(false);
  const publicStorage = `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "")}/storage/v1/object/public/`;
  const transformedSrc =
    optimized && src?.startsWith(publicStorage)
      ? `${src.replace(publicStorage, publicStorage.replace("/object/", "/render/image/"))}${src.includes("?") ? "&" : "?"}width=960&quality=85&resize=contain`
      : src;
  if (!src || failed)
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-[var(--placeholder-bg)] text-[var(--soft)] ${className}`}
      >
        <ImageOff size={32} />
        <span className="text-sm">Photo unavailable</span>
      </div>
    );
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={transformFailed ? src : transformedSrc!}
      alt={alt}
      className={className}
      onError={() => {
        if (!transformFailed && transformedSrc !== src) setTransformFailed(true);
        else setFailed(true);
      }}
    />
  );
}
