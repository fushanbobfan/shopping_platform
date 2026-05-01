"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ImageCarousel({
  images,
  alt
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  if (images.length === 0) {
    return (
      <div className="aspect-[4/5] bg-brand-100 flex items-center justify-center text-neutral-400 rounded-xl">
        无图
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/5] bg-brand-100 rounded-xl overflow-hidden">
        <Image
          src={images[active]}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActive(i)}
              className={cn(
                "relative w-16 h-20 rounded-md overflow-hidden border-2 shrink-0",
                i === active ? "border-brand-600" : "border-transparent"
              )}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
