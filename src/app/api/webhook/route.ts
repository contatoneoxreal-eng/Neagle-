import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scanReceipt } from "@/lib/claude";
import { downloadImage, sendWhatsAppMessage } from "@/lib/twilio";
import { categoryLabels, formatCurrency } from "@/lib/utils";
import { Category } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const from = (formData.get("From") as string)?.replace("whatsapp:", "") || "";
    const numMedia = parseInt((formData.get("NumMedia") as string) || "0", 10);

    if (numMedia === 0) {
      await sendWhatsAppMessage(
        from,
        "📸 Envie uma foto da nota fiscal para registrar o gasto!"
      );
      return NextResponse.json({ success: true });
    }

    const mediaUrl = formData.get("MediaUrl0") as string;
    const mediaType = (formData.get("MediaContentType0") as string) || "image/jpeg";

    const imageBuffer = await downloadImage(mediaUrl);
    const imageBase64 = imageBuffer.toString("base64");

    const receiptData = await scanReceipt(
      imageBase64,
      mediaType as "image/jpeg" | "image/png" | "image/webp"
    );

    const category = Object.values(Category).includes(receiptData.category as Category)
      ? (receiptData.category as Category)
      : Category.OUTROS;

    const expense = await prisma.expense.create({
      data: {
        storeName: receiptData.storeName,
        total: receiptData.total,
        date: new Date(receiptData.date),
        category,
        imageUrl: mediaUrl,
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

    const categoryLabel = categoryLabels[expense.category] || expense.category;
    const message = [
      `✅ Gasto registrado!`,
      `🏪 ${expense.storeName}`,
      `💰 ${formatCurrency(expense.total)}`,
      `📂 ${categoryLabel}`,
      `📦 ${expense.items.length} item(ns)`,
    ].join("\n");

    await sendWhatsAppMessage(from, message);

    return NextResponse.json({ success: true, expenseId: expense.id });
  } catch (error) {
    console.error("Webhook error:", error);

    return NextResponse.json(
      { error: "Failed to process receipt" },
      { status: 500 }
    );
  }
}
