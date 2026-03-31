import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scanReceipt } from "@/lib/claude";
import { Category } from "@prisma/client";
import sharp from "sharp";

const SUPPORTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

async function convertToJpeg(buffer: Buffer): Promise<{ base64: string; mediaType: "image/jpeg" }> {
  const jpegBuffer = await sharp(buffer)
    .jpeg({ quality: 85 })
    .toBuffer();
  return {
    base64: jpegBuffer.toString("base64"),
    mediaType: "image/jpeg",
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let imageBase64: string;
    let mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";

    if (SUPPORTED_TYPES.includes(file.type)) {
      imageBase64 = buffer.toString("base64");
      mediaType = file.type as typeof mediaType;
    } else {
      // HEIC, HEIF, or unknown formats → convert to JPEG
      const converted = await convertToJpeg(buffer);
      imageBase64 = converted.base64;
      mediaType = converted.mediaType;
    }

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
    const message = error instanceof Error ? error.message : "Falha ao processar nota fiscal";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
