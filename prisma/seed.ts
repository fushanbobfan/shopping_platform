import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.product.count();
  if (count > 0) {
    console.log(`Skipping seed, ${count} products already exist.`);
    return;
  }

  const samples = [
    {
      name: "米色针织开衫",
      description: "奶茶色羊毛混纺，版型偏宽松，适合春秋叠穿。八成新，无瑕疵。",
      priceCents: 3800,
      size: "M",
      category: "top",
      condition: "like-new",
      image: "https://picsum.photos/seed/knit/800/1000"
    },
    {
      name: "深蓝水洗牛仔裤",
      description: "高腰直筒，舒适不紧绷。仅穿过两次。",
      priceCents: 4500,
      size: "27",
      category: "bottom",
      condition: "like-new",
      image: "https://picsum.photos/seed/jeans/800/1000"
    },
    {
      name: "印花连衣裙",
      description: "法式小碎花雪纺连衣裙，适合约会或拍照。",
      priceCents: 5200,
      size: "S",
      category: "dress",
      condition: "good",
      image: "https://picsum.photos/seed/dress/800/1000"
    }
  ];

  for (const s of samples) {
    await prisma.product.create({
      data: {
        name: s.name,
        description: s.description,
        priceCents: s.priceCents,
        currency: process.env.NEXT_PUBLIC_CURRENCY ?? "usd",
        size: s.size,
        category: s.category,
        condition: s.condition,
        images: { create: [{ url: s.image, order: 0 }] }
      }
    });
  }

  console.log(`Seeded ${samples.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
