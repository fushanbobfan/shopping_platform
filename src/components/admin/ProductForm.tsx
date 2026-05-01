"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { t } from "@/lib/i18n";

type Initial = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  size: string;
  category: string;
  condition: string;
  status: string;
  images: string[];
};

export function ProductForm({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const editing = Boolean(initial);

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priceYuan, setPriceYuan] = useState(
    initial ? (initial.priceCents / 100).toString() : ""
  );
  const [size, setSize] = useState(initial?.size ?? "");
  const [category, setCategory] = useState(initial?.category ?? "top");
  const [condition, setCondition] = useState(initial?.condition ?? "like-new");
  const [status, setStatus] = useState(initial?.status ?? "AVAILABLE");
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        setImages((prev) => [...prev, data.url]);
      } else {
        setError(data?.error ?? "上传失败");
      }
    } catch {
      setError("上传失败");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const body = {
      name,
      description,
      priceCents: Math.round(parseFloat(priceYuan || "0") * 100),
      size: size || null,
      category: category || null,
      condition: condition || null,
      status,
      images
    };
    const url = editing
      ? `/api/admin/products/${initial!.id}`
      : "/api/admin/products";
    const res = await fetch(url, {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "保存失败");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 bg-white p-6 rounded-xl">
      <label className="block">
        <span className="text-sm text-neutral-600">{t.admin.form.name}</span>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full px-3 py-2 border border-brand-200 rounded-lg"
        />
      </label>
      <label className="block">
        <span className="text-sm text-neutral-600">
          {t.admin.form.description}
        </span>
        <textarea
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full px-3 py-2 border border-brand-200 rounded-lg"
        />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm text-neutral-600">{t.admin.form.price}</span>
          <input
            required
            type="number"
            step="0.01"
            min="0"
            value={priceYuan}
            onChange={(e) => setPriceYuan(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-brand-200 rounded-lg"
          />
        </label>
        <label className="block">
          <span className="text-sm text-neutral-600">{t.admin.form.size}</span>
          <input
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-brand-200 rounded-lg"
          />
        </label>
        <label className="block">
          <span className="text-sm text-neutral-600">
            {t.admin.form.category}
          </span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-brand-200 rounded-lg bg-white"
          >
            <option value="top">上衣</option>
            <option value="bottom">裤子</option>
            <option value="dress">连衣裙</option>
            <option value="outer">外套</option>
            <option value="accessory">配饰</option>
            <option value="shoes">鞋</option>
            <option value="bag">包</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm text-neutral-600">
            {t.admin.form.condition}
          </span>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-brand-200 rounded-lg bg-white"
          >
            <option value="new">全新</option>
            <option value="like-new">几乎全新</option>
            <option value="good">九成新</option>
            <option value="fair">七八成新</option>
          </select>
        </label>
      </div>

      {editing && (
        <label className="block">
          <span className="text-sm text-neutral-600">状态</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-brand-200 rounded-lg bg-white"
          >
            <option value="AVAILABLE">在售</option>
            <option value="HIDDEN">下架</option>
            <option value="SOLD">已售出</option>
          </select>
        </label>
      )}

      <div>
        <div className="text-sm text-neutral-600 mb-2">
          {t.admin.form.images}
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {images.map((url, i) => (
            <div key={url + i} className="relative group">
              <div className="relative w-20 h-24 bg-brand-100 rounded overflow-hidden">
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  setImages((prev) => prev.filter((_, idx) => idx !== i))
                }
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-600 text-white text-xs opacity-0 group-hover:opacity-100"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <label className="inline-block cursor-pointer px-3 py-1.5 rounded-lg bg-neutral-200 text-sm hover:bg-neutral-300">
          {uploading ? "上传中…" : t.admin.form.uploadImage}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadFile(f);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? "保存中…" : t.admin.form.save}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 rounded-lg bg-neutral-200 hover:bg-neutral-300"
        >
          {t.admin.form.cancel}
        </button>
      </div>
    </form>
  );
}
