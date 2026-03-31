import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scanReceipt } from "@/lib/claude";
import { Category } from "@prisma/client";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: "Arquivo muito grande (max 20MB)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const imageBase64 = buffer.toString("base64");

    // Default to jpeg — Claude handles most formats
    let mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif" = "image/jpeg";
    if (file.type === "image/png") mediaType = "image/png";
    else if (file.type === "image/webp") mediaType = "image/webp";
    else if (file.type === "image/gif") mediaType = "image/gif";

    const receiptData = await scanReceipt(imageBase64, mediaType);

    const category = Object.values(Category).includes(receiptData.category as Category)
      ? (receiptData.category as Category)
      : Category.OUTROS;

    const expense = await prisma.expense.create({
      data: {
        storeName: receiptData.storeName || "Loja não identificada",
        total: receiptData.total || 0,
        date: new Date(receiptData.date || new Date().toISOString()),
        category,
        items: {
          create: (receiptData.items || []).map((item) => ({
            name: item.name || "Item",
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || 0,
            totalPrice: item.totalPrice || 0,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ success: true, expense });
  } catch (error) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "Falha ao processar nota fiscal";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
