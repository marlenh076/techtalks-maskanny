"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

export function PropertyImage({ src, alt, className = "" }: { src: string | null; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <div className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-[var(--placeholder-bg)] text-[var(--soft)] ${className}`}><ImageOff size={32} /><span className="text-sm">Photo unavailable</span></div>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
}
