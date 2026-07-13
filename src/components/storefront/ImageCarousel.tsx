"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export function ImageCarousel({
  images,
  alt
}: {
  images: { url: string; alt: string | null }[];
  alt: string;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center bg-[var(--paper-deep)] text-xs uppercase tracking-[0.15em] text-[var(--muted)]">
        Photograph coming soon
      </div>
    );
  }

  const move = (direction: number) =>
    setActive((current) => (current + direction + images.length) % images.length);

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--paper-deep)]">
        <Image
          key={images[active].url}
          src={images[active].url}
          alt={images[active].alt || alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 58vw"
          className="object-cover"
        />
        {images.length > 1 ? (
          <div className="absolute inset-x-3 top-1/2 flex -translate-y-1/2 justify-between">
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Previous image"
              className="grid size-10 place-items-center bg-[color:rgba(241,237,228,0.9)] hover:bg-[var(--paper)]"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Next image"
              className="grid size-10 place-items-center bg-[color:rgba(241,237,228,0.9)] hover:bg-[var(--paper)]"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        ) : null}
        <span className="absolute bottom-3 right-3 bg-[color:rgba(23,23,20,0.86)] px-2 py-1 text-[0.65rem] font-bold tracking-[0.12em] text-white">
          {active + 1} / {images.length}
        </span>
      </div>
      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`View image ${index + 1}`}
              aria-current={active === index}
              className={`relative aspect-[4/5] overflow-hidden border ${
                active === index ? "border-[var(--ink)]" : "border-transparent opacity-65 hover:opacity-100"
              }`}
            >
              <Image src={image.url} alt="" fill sizes="120px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
