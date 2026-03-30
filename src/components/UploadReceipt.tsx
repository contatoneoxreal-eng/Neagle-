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

export default function UploadReceipt({ onSuccess }: { onSuccess: () => void }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Envie apenas imagens (JPG, PNG, WebP)");
      return;
    }

    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao processar");
      }

      const data = await res.json();
      setResult({
        storeName: data.expense.storeName,
        total: data.expense.total,
        category: data.expense.category,
        items: data.expense.items,
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar nota fiscal");
    } finally {
      setUploading(false);
    }
  }

  function reset() {
    setPreview(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="glass-card glow-cyan p-6 animate-fade-in">
      <h2 className="text-lg font-semibold mb-4 text-gray-200">
        Adicionar Nota Fiscal
      </h2>

      {!preview ? (
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            dragging
              ? "border-neon-cyan bg-neon-cyan/5"
              : "border-dark-500 hover:border-neon-cyan/50 hover:bg-dark-700/50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-dark-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neon-cyan">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <div>
              <p className="text-gray-300 font-medium">
                Toque para tirar foto ou enviar arquivo
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Arraste uma imagem aqui ou clique para selecionar
              </p>
            </div>
            <div className="flex gap-2 mt-2">
              <span className="px-2 py-1 rounded bg-dark-600 text-gray-400 text-xs">JPG</span>
              <span className="px-2 py-1 rounded bg-dark-600 text-gray-400 text-xs">PNG</span>
              <span className="px-2 py-1 rounded bg-dark-600 text-gray-400 text-xs">WebP</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview da imagem */}
          <div className="relative rounded-xl overflow-hidden bg-dark-700 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview da nota fiscal"
              className="max-h-64 object-contain"
            />
            {uploading && (
              <div className="absolute inset-0 bg-dark-900/80 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
                <p className="text-neon-cyan text-sm font-medium">
                  IA analisando nota fiscal...
                </p>
              </div>
            )}
          </div>

          {/* Resultado */}
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

          {/* Erro */}
          {error && (
            <div className="glass-card p-4 border border-red-500/30 bg-red-500/5">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Botão nova nota */}
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
