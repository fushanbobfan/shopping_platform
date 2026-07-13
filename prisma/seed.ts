import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const samples = [
  {
    slug: "washed-denim-trucker",
    name: "Washed Denim Trucker",
    brand: "Levi's",
    description:
      "A softly faded denim jacket with an easy, boxy cut. Clean cuffs, intact hardware, and the kind of wear that already feels lived in.",
    story:
      "Mike found this one in Silver Lake and wore it through two LA winters. It layers well over a tee without feeling bulky.",
    priceCents: 6800,
    compareAtCents: 12800,
    size: "M",
    category: "Outerwear",
    condition: "Excellent",
    color: "Faded indigo",
    material: "100% cotton denim",
    measurements: { chest: "22 in", length: "25 in", sleeve: "24 in" },
    featured: true,
    image:
      "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?auto=format&fit=crop&w=1600&q=88"
  },
  {
    slug: "rust-rib-knit",
    name: "Rust Rib Knit",
    brand: "ARKET",
    description:
      "A mid-weight ribbed crewneck in a warm rust tone. Relaxed through the body with a clean neckline and no visible flaws.",
    story:
      "An easy travel layer that works on its own or under a jacket. Selling only because the fit is a little too relaxed now.",
    priceCents: 5400,
    compareAtCents: 9900,
    size: "M",
    category: "Knitwear",
    condition: "Like new",
    color: "Rust",
    material: "Cotton and wool blend",
    measurements: { chest: "21.5 in", length: "26 in", sleeve: "25 in" },
    featured: true,
    image:
      "https://images.unsplash.com/photo-1667996112040-15e2cb3ea7d5?auto=format&fit=crop&w=1600&q=88"
  },
  {
    slug: "essential-white-tee",
    name: "Essential White Tee",
    brand: "Uniqlo U",
    description:
      "A clean heavyweight crewneck tee with a slightly boxy fit. Opaque cotton, straight hem, and plenty of life left.",
    priceCents: 2400,
    size: "M",
    category: "Shirts",
    condition: "Excellent",
    color: "White",
    material: "100% heavyweight cotton",
    measurements: { chest: "21 in", length: "27 in", sleeve: "8.5 in" },
    featured: false,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1600&q=88"
  },
  {
    slug: "charcoal-wool-blazer",
    name: "Charcoal Wool Blazer",
    brand: "Suitsupply",
    description:
      "A softly structured charcoal blazer with a natural shoulder and a modern, close fit. Fully lined and clean throughout.",
    priceCents: 11800,
    compareAtCents: 39900,
    size: "38R",
    category: "Outerwear",
    condition: "Excellent",
    color: "Charcoal",
    material: "100% wool",
    measurements: { chest: "20.5 in", length: "29 in", sleeve: "25 in" },
    featured: false,
    image:
      "https://images.unsplash.com/photo-1646562389619-1521a74d3c3b?auto=format&fit=crop&w=1600&q=88"
  },
  {
    slug: "black-penny-loafer",
    name: "Black Penny Loafer",
    brand: "G.H. Bass",
    description:
      "Classic leather penny loafers with a low profile and broken-in sole. Light creasing across the vamp, polished and ready to wear.",
    priceCents: 8200,
    compareAtCents: 17500,
    size: "US 9",
    category: "Footwear",
    condition: "Good",
    color: "Black",
    material: "Leather upper and sole",
    measurements: { outsole: "11.25 in", width: "3.75 in" },
    featured: false,
    image:
      "https://images.unsplash.com/photo-1760616172899-0681b97a2de3?auto=format&fit=crop&w=1600&q=88"
  },
  {
    slug: "sun-faded-cap",
    name: "Sun-Faded Six Panel",
    brand: "No label",
    description:
      "An unstructured cotton cap with a naturally faded crown and adjustable brass closure. Clean sweatband and soft, worn-in shape.",
    priceCents: 2400,
    size: "One size",
    category: "Accessories",
    condition: "Good",
    color: "Washed rust",
    material: "Cotton canvas",
    measurements: { fit: "Adjustable 21–24 in" },
    featured: false,
    image:
      "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1600&q=88"
  }
] as const;

async function main() {
  const count = await prisma.product.count();
  if (count > 0) {
    console.log(`Skipping seed: ${count} products already exist.`);
    return;
  }

  for (const sample of samples) {
    const { image, ...product } = sample;
    await prisma.product.create({
      data: {
        ...product,
        currency: process.env.NEXT_PUBLIC_CURRENCY ?? "usd",
        measurements: product.measurements,
        images: {
          create: [{ url: image, alt: product.name, order: 0 }]
        }
      }
    });
  }

  console.log(`Seeded ${samples.length} archive pieces.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
