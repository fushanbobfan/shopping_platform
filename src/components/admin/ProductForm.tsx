"use client";

import Image from "next/image";
import { ArrowDown, ArrowLeft, ArrowUp, ImagePlus, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  productCategories,
  productConditions,
  slugify
} from "@/lib/product-data";

export type ProductFormInitial = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  description: string;
  story: string;
  priceCents: number;
  compareAtCents: number | null;
  size: string;
  category: string;
  condition: string;
  color: string;
  material: string;
  measurements: Record<string, string>;
  featured: boolean;
  status: "AVAILABLE" | "RESERVED" | "SOLD" | "HIDDEN";
  images: string[];
};

function measurementsToText(measurements: Record<string, string>) {
  return Object.entries(measurements)
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");
}

function textToMeasurements(value: string) {
  return Object.fromEntries(
    value
      .split("\n")
      .map((line) => line.split(":"))
      .filter((parts) => parts.length >= 2)
      .map(([label, ...rest]) => [label.trim(), rest.join(":").trim()])
      .filter(([label, measurement]) => label && measurement)
  );
}

export function ProductForm({ initial }: { initial?: ProductFormInitial }) {
  const router = useRouter();
  const editing = Boolean(initial);
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [story, setStory] = useState(initial?.story ?? "");
  const [price, setPrice] = useState(initial ? (initial.priceCents / 100).toString() : "");
  const [compareAt, setCompareAt] = useState(
    initial?.compareAtCents ? (initial.compareAtCents / 100).toString() : ""
  );
  const [size, setSize] = useState(initial?.size ?? "");
  const [category, setCategory] = useState(initial?.category ?? "Outerwear");
  const [condition, setCondition] = useState(initial?.condition ?? "Excellent");
  const [color, setColor] = useState(initial?.color ?? "");
  const [material, setMaterial] = useState(initial?.material ?? "");
  const [measurements, setMeasurements] = useState(
    measurementsToText(initial?.measurements ?? {})
  );
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [status, setStatus] = useState(initial?.status ?? "HIDDEN");
  const [images, setImages] = useState(initial?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadFiles(files: File[]) {
    setUploading(true);
    setError(null);
    try {
      for (const file of files.slice(0, 10 - images.length)) {
        const form = new FormData();
        form.append("file", file);
        const response = await fetch("/api/upload", { method: "POST", body: form });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.url) throw new Error(data.error || "upload-failed");
        setImages((current) => [...current, data.url]);
      }
    } catch (uploadError) {
      const reason = uploadError instanceof Error ? uploadError.message : "upload-failed";
      setError(reason === "too-large" ? "An image is larger than 12 MB." : "An image could not be processed or uploaded.");
    }
    setUploading(false);
  }

  function moveImage(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= images.length) return;
    setImages((current) => {
      const reordered = [...current];
      [reordered[index], reordered[next]] = [reordered[next], reordered[index]];
      return reordered;
    });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (images.length === 0) {
      setError("Add at least one image before saving.");
      return;
    }
    setSaving(true);
    setError(null);

    const payload = {
      name,
      slug: slugify(slug || name),
      brand: brand || null,
      description,
      story: story || null,
      priceCents: Math.round(Number(price) * 100),
      compareAtCents: compareAt ? Math.round(Number(compareAt) * 100) : null,
      size: size || null,
      category: category || null,
      condition: condition || null,
      color: color || null,
      material: material || null,
      measurements: textToMeasurements(measurements),
      featured,
      status,
      images
    };

    try {
      const response = await fetch(
        editing ? `/api/admin/products/${initial!.id}` : "/api/admin/products",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(
          data.error === "slug-exists"
            ? "That URL slug is already in use. Choose another."
            : data.error === "reserved"
              ? "This piece is in an active checkout and cannot be changed."
              : "Review the fields and try saving again."
        );
        setSaving(false);
        return;
      }
      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("The piece could not be saved. Check your connection and try again.");
      setSaving(false);
    }
  }

  const labelClass = "text-xs font-bold uppercase tracking-[0.11em] text-black/55";

  return (
    <form onSubmit={submit} className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-9">
        <section>
          <h2 className="text-base font-bold">Identity</h2>
          <p className="mt-1 text-sm text-black/50">The details customers scan first.</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="sm:col-span-2"><span className={labelClass}>Name</span><input required minLength={2} value={name} onChange={(event) => { const value = event.target.value; setName(value); if (!slugTouched) setSlug(slugify(value)); }} className="field mt-2 bg-white!" placeholder="Washed denim trucker" /></label>
            <label><span className={labelClass}>Brand</span><input value={brand} onChange={(event) => setBrand(event.target.value)} className="field mt-2 bg-white!" placeholder="Levi's" /></label>
            <label><span className={labelClass}>URL slug</span><input required value={slug} onChange={(event) => { setSlug(slugify(event.target.value)); setSlugTouched(true); }} className="field mt-2 bg-white! font-mono text-sm" placeholder="washed-denim-trucker" /></label>
          </div>
        </section>

        <section className="border-t border-black/15 pt-8">
          <h2 className="text-base font-bold">Description</h2>
          <p className="mt-1 text-sm text-black/50">Be precise about wear and flaws. The personal note is optional.</p>
          <div className="mt-5 space-y-5">
            <label className="block"><span className={labelClass}>Customer description</span><textarea required minLength={10} rows={5} value={description} onChange={(event) => setDescription(event.target.value)} className="field mt-2 resize-y bg-white!" /></label>
            <label className="block"><span className={labelClass}>From Mike</span><textarea rows={3} value={story} onChange={(event) => setStory(event.target.value)} className="field mt-2 resize-y bg-white!" placeholder="Where it came from, why you liked it, or why it is leaving." /></label>
          </div>
        </section>

        <section className="border-t border-black/15 pt-8">
          <h2 className="text-base font-bold">Garment details</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <label><span className={labelClass}>Size</span><input value={size} onChange={(event) => setSize(event.target.value)} className="field mt-2 bg-white!" placeholder="M or 31 × 30" /></label>
            <label><span className={labelClass}>Category</span><select value={category} onChange={(event) => setCategory(event.target.value)} className="field mt-2 bg-white!">{productCategories.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><span className={labelClass}>Condition</span><select value={condition} onChange={(event) => setCondition(event.target.value)} className="field mt-2 bg-white!">{productConditions.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><span className={labelClass}>Color</span><input value={color} onChange={(event) => setColor(event.target.value)} className="field mt-2 bg-white!" placeholder="Faded indigo" /></label>
            <label className="sm:col-span-2"><span className={labelClass}>Material</span><input value={material} onChange={(event) => setMaterial(event.target.value)} className="field mt-2 bg-white!" placeholder="100% cotton denim" /></label>
            <label className="sm:col-span-2 lg:col-span-3"><span className={labelClass}>Measurements · one per line</span><textarea rows={4} value={measurements} onChange={(event) => setMeasurements(event.target.value)} className="field mt-2 resize-y bg-white! font-mono text-sm" placeholder={"chest: 22 in\nlength: 25 in\nsleeve: 24 in"} /></label>
          </div>
        </section>
      </div>

      <aside className="space-y-8 xl:sticky xl:top-24 xl:self-start">
        <section className="border border-black/15 bg-white/55 p-5">
          <h2 className="text-sm font-bold">Publish settings</h2>
          <div className="mt-5 space-y-5">
            <label><span className={labelClass}>Price</span><div className="relative mt-2"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-black/45">$</span><input required type="number" min="0.01" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} className="field bg-white! pl-7" /></div></label>
            <label><span className={labelClass}>Original retail · optional</span><div className="relative mt-2"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-black/45">$</span><input type="number" min="0.01" step="0.01" value={compareAt} onChange={(event) => setCompareAt(event.target.value)} className="field bg-white! pl-7" /></div></label>
            <label className="block"><span className={labelClass}>Status</span><select value={status} disabled={status === "RESERVED"} onChange={(event) => setStatus(event.target.value as ProductFormInitial["status"])} className="field mt-2 bg-white! disabled:opacity-60"><option value="HIDDEN">Draft</option><option value="AVAILABLE">Live</option>{editing ? <option value="SOLD">Sold</option> : null}{status === "RESERVED" ? <option value="RESERVED">In checkout</option> : null}</select></label>
            <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} className="mt-1 size-4 accent-[var(--accent)]" /><span><strong className="block">Feature on home</strong><span className="text-xs leading-5 text-black/50">Used as the lead image when live.</span></span></label>
          </div>
        </section>

        <section className="border border-black/15 bg-white/55 p-5">
          <div className="flex items-center justify-between"><h2 className="text-sm font-bold">Images</h2><span className="text-xs text-black/45">{images.length}/10</span></div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {images.map((url, index) => (
              <div key={url} className="relative aspect-[4/5] overflow-hidden bg-black/5">
                <Image src={url} alt="" fill sizes="160px" className="object-cover" />
                {index === 0 ? <span className="absolute left-1.5 top-1.5 bg-black px-1.5 py-1 text-[0.55rem] font-bold uppercase tracking-[0.08em] text-white">Cover</span> : null}
                <div className="absolute inset-x-1 bottom-1 flex justify-end gap-1">
                  <button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0} aria-label="Move image earlier" className="grid size-7 place-items-center bg-white/90 disabled:opacity-30"><ArrowUp size={13} /></button>
                  <button type="button" onClick={() => moveImage(index, 1)} disabled={index === images.length - 1} aria-label="Move image later" className="grid size-7 place-items-center bg-white/90 disabled:opacity-30"><ArrowDown size={13} /></button>
                  <button type="button" onClick={() => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label="Remove image" className="grid size-7 place-items-center bg-[#a83220] text-white"><X size={13} /></button>
                </div>
              </div>
            ))}
          </div>
          <label className="button-secondary mt-3 w-full cursor-pointer bg-white!">
            <ImagePlus size={16} /> {uploading ? "Processing…" : "Add images"}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/heic" multiple disabled={uploading || images.length >= 10} className="hidden" onChange={(event) => { const files = Array.from(event.target.files ?? []); if (files.length) void uploadFiles(files); event.target.value = ""; }} />
          </label>
          <p className="mt-3 text-xs leading-5 text-black/45">JPEG, PNG, WebP, or HEIC up to 12 MB. Files are converted to WebP and metadata is removed.</p>
        </section>

        {error ? <p role="alert" className="border border-[#b63e28] bg-[#f5ded7] p-3 text-sm leading-5 text-[#792615]">{error}</p> : null}
        <div className="grid gap-2">
          <button disabled={saving || uploading} className="button-primary w-full"><Save size={16} /> {saving ? "Saving…" : "Save piece"}</button>
          <button type="button" onClick={() => router.back()} className="button-secondary w-full"><ArrowLeft size={16} /> Cancel</button>
        </div>
      </aside>
    </form>
  );
}
