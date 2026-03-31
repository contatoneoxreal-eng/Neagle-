"use client";

import { useState, useRef } from "react";
import { formatCurrency } from "@/lib/utils";
import { categoryLabels } from "@/lib/utils";

interface UploadResult {
  storeName: string;
  total: number;
  category: string;
  items: { name: string; quantity: number; totalPrice: number }[];
}

async function safeUpload(file: File): Promise<{ success: boolean; expense?: UploadResult; error?: string }> {
  const formData = new FormData();
  formData.append("file", file);

  let res: Response;
  try {
    res = await fetch("/api/upload", { method: "POST", body: formData });
  } catch {
    return { success: false, error: "Erro de conexão. Tente novamente." };
  }

  let text: string;
  try {
    text = await res.text();
  } catch {
    return { success: false, error: "Erro ao ler resposta do servidor." };
  }

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(text);
  } catch {
    return { success: false, error: "Erro no servidor. Verifique se o banco de dados e a API key estão configurados na Vercel." };
  }

  if (!res.ok) {
    return { success: false, error: (data.error as string) || "Erro ao processar nota fiscal." };
  }

  const expense = data.expense as Record<string, unknown> | undefined;
  if (!expense) {
    return { success: false, error: "Resposta inválida do servidor." };
  }

  return {
    success: true,
    expense: {
      storeName: String(expense.storeName || "Loja não identificada"),
      total: Number(expense.total) || 0,
      category: String(expense.category || "OUTROS"),
      items: Array.isArray(expense.items) ? expense.items : [],
    },
  };
}

export default function UploadReceipt({ onSuccess }: { onSuccess: () => void }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    const isImage = file.type.startsWith("image/") ||
      /\.(jpg|jpeg|png|webp|heic|heif|gif|bmp|tiff)$/i.test(file.name || "");

    if (!isImage) {
      setError("Envie apenas imagens (JPG, PNG, WebP, HEIC)");
      return;
    }

    // Set preview safely
    try {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } catch {
      setPreview(null);
    }

    setResult(null);
    setError(null);
    setUploading(true);

    const response = await safeUpload(file);

    if (response.success && response.expense) {
      setResult(response.expense);
      onSuccess();
    } else {
      setError(response.error || "Erro desconhecido");
    }

    setUploading(false);
  }

  function reset() {
    if (preview) {
      try { URL.revokeObjectURL(preview); } catch { /* ignore */ }
    }
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function openFilePicker() {
    if (fileRef.current) {
      fileRef.current.click();
    }
  }

  return (
    <div className="glass-card glow-cyan p-6 animate-fade-in">
      <h2 className="text-lg font-semibold mb-4 text-gray-200">
        Adicionar Nota Fiscal
      </h2>

      {/* Single file input — no capture attribute for Safari compatibility */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {!preview && !uploading ? (
        <div className="space-y-4">
          {/* Drag and drop area — desktop */}
          <div
            className={"relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer " + (
              dragging
                ? "border-neon-cyan bg-neon-cyan/5"
                : "border-dark-500 hover:border-neon-cyan/40"
            )}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const file = e.dataTransfer.files[0];
              if (file) handleFile(file);
            }}
            onClick={openFilePicker}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-dark-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neon-cyan">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
              <div>
                <p className="text-gray-300 font-medium">
                  Toque para tirar foto ou escolher arquivo
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Aceita JPG, PNG, WebP e HEIC
                </p>
              </div>
            </div>
          </div>

          {/* Error in initial state */}
          {error && (
            <div className="rounded-xl p-4 border border-red-500/30 bg-red-500/5">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Image preview */}
          <div className="relative rounded-xl overflow-hidden bg-dark-700 flex items-center justify-center min-h-[200px]">
            {preview && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={preview}
                alt="Preview da nota fiscal"
                className="max-h-64 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            {!preview && (
              <p className="text-gray-500 text-sm">Processando imagem...</p>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-dark-900/80 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
                <p className="text-neon-cyan text-sm font-medium">
                  IA analisando nota fiscal...
                </p>
              </div>
            )}
          </div>

          {/* Result */}
          {result && (
            <div className="glass-card glow-cyan p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-neon-cyan text-lg">&#10003;</span>
                <span className="text-gray-200 font-semibold">Gasto registrado!</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Loja</span>
                  <p className="text-gray-200">{result.storeName}</p>
                </div>
                <div>
                  <span className="text-gray-500">Total</span>
                  <p className="text-neon-cyan font-bold font-[family-name:var(--font-geist-mono)]">
                    {formatCurrency(result.total)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Categoria</span>
                  <p className="text-gray-200">{categoryLabels[result.category] || result.category}</p>
                </div>
                <div>
                  <span className="text-gray-500">Itens</span>
                  <p className="text-gray-200">{result.items.length} item(ns)</p>
                </div>
              </div>
              {result.items.length > 0 && (
                <div className="border-t border-dark-500 pt-2 mt-2">
                  <p className="text-gray-500 text-xs mb-1">Itens detectados:</p>
                  <div className="space-y-1">
                    {result.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-gray-400">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="text-gray-300 font-[family-name:var(--font-geist-mono)]">
                          {formatCurrency(item.totalPrice)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl p-4 border border-red-500/30 bg-red-500/5">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Reset button */}
          {!uploading && (
            <button
              onClick={reset}
              className="w-full py-3 rounded-xl bg-dark-600 hover:bg-dark-500 text-gray-300 hover:text-neon-cyan transition-all text-sm font-medium"
            >
              {result ? "Enviar outra nota" : "Tentar novamente"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
