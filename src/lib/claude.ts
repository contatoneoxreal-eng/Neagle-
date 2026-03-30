import Anthropic from "@anthropic-ai/sdk";
import { ReceiptData } from "@/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function scanReceipt(
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp" = "image/jpeg"
): Promise<ReceiptData> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: `Analise esta nota fiscal/recibo e extraia as informações em JSON.

Responda APENAS com o JSON, sem markdown ou texto adicional.

Formato esperado:
{
  "storeName": "Nome da loja/estabelecimento",
  "date": "YYYY-MM-DD",
  "category": "ALIMENTACAO|TRANSPORTE|SAUDE|LAZER|CASA|EDUCACAO|OUTROS",
  "total": 99.99,
  "items": [
    {
      "name": "Nome do item",
      "quantity": 1,
      "unitPrice": 9.99,
      "totalPrice": 9.99
    }
  ]
}

Regras:
- Use a categoria mais adequada baseada no tipo de estabelecimento
- Se não conseguir ler algum item, use "Item não identificado"
- Se não conseguir ler a data, use a data de hoje
- Valores monetários em número (sem R$)
- Se não houver itens detalhados, crie um único item com o total`,
          },
        ],
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const data: ReceiptData = JSON.parse(cleaned);

  return data;
}
