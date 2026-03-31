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
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/") && !file.name.match(/\.(heic|heif)$/i)) {
      setError("Envie apenas imagens (JPG, PNG, WebP, HEIC)");
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
    if (cameraRef.current) cameraRef.current.value = "";
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="glass-card glow-cyan p-6 animate-fade-in">
      <h2 className="text-lg font-semibold mb-4 text-gray-200">
        Adicionar Nota Fiscal
      </h2>

      {/* Inputs escondidos */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*,.heic,.heif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {!preview ? (
        <div className="space-y-4">
          {/* Drag and drop area */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
              dragging
                ? "border-neon-cyan bg-neon-cyan/5"
                : "border-dark-500"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const file = e.dataTransfer.files[0];
              if (file) handleFile(file);
            }}
          >
            <div className="flex flex-col items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <p className="text-gray-400 text-sm">
                Arraste uma imagem aqui
              </p>
              <div className="flex gap-2 mt-1">
                <span className="px-2 py-0.5 rounded bg-dark-600 text-gray-500 text-xs">JPG</span>
                <span className="px-2 py-0.5 rounded bg-dark-600 text-gray-500 text-xs">PNG</span>
                <span className="px-2 py-0.5 rounded bg-dark-600 text-gray-500 text-xs">WebP</span>
              </div>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => cameraRef.current?.click()}
              className="flex flex-col items-center gap-2 p-5 rounded-xl border border-dark-500 hover:border-neon-magenta/50 hover:bg-neon-magenta/5 transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-dark-600 group-hover:bg-neon-magenta/10 flex items-center justify-center transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-neon-magenta transition-all">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
              <span className="text-gray-300 group-hover:text-neon-magenta text-sm font-medium transition-all">
                Tirar Foto
              </span>
              <span className="text-gray-500 text-xs">
                Abrir câmera
              </span>
            </button>

            <button
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center gap-2 p-5 rounded-xl border border-dark-500 hover:border-neon-cyan/50 hover:bg-neon-cyan/5 transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-dark-600 group-hover:bg-neon-cyan/10 flex items-center justify-center transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-neon-cyan transition-all">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                  <polyline points="13 2 13 9 20 9"/>
                </svg>
              </div>
              <span className="text-gray-300 group-hover:text-neon-cyan text-sm font-medium transition-all">
                Enviar Arquivo
              </span>
              <span className="text-gray-500 text-xs">
                Galeria ou arquivos
              </span>
            </button>
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
