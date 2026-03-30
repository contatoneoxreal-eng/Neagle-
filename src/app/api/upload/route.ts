import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scanReceipt } from "@/lib/claude";
import { Category } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const imageBase64 = buffer.toString("base64");

    const mediaType = file.type as "image/jpeg" | "image/png" | "image/webp";

    const receiptData = await scanReceipt(imageBase64, mediaType);

    const category = Object.values(Category).includes(receiptData.category as Category)
      ? (receiptData.category as Category)
      : Category.OUTROS;

    const expense = await prisma.expense.create({
      data: {
        storeName: receiptData.storeName,
        total: receiptData.total,
        date: new Date(receiptData.date),
        category,
        items: {
          create: receiptData.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ success: true, expense });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Falha ao processar nota fiscal" },
      { status: 500 }
    );
  }
}
