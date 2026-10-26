"use client";

import React, { useState, useEffect, useRef } from "react";
import { Download, Copy, Check, Terminal, ExternalLink, RefreshCw, AlertCircle } from "lucide-react";
import { OgType, ProductOgInput, SnippetOgInput } from "@/lib/types/og";
import { Button } from "../ui/Button";

interface LivePreviewProps {
  type: OgType;
  data: ProductOgInput | SnippetOgInput;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ type, data }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Generate PNG preview from server API
  const generatePreview = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const endpoint = type === "product" ? "/api/og/product" : "/api/og/snippet";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => null);
        throw new Error(
          errorJson?.error?.message || `HTTP ${response.status}: Failed to generate preview`
        );
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      setImageSrc(objectUrl);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setErrorMessage(err.message || "Failed to render OG Image");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced auto-refresh when data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      // Basic check if required fields have content
      if (data.name && (type === "snippet" || (data as ProductOgInput).image)) {
        generatePreview();
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [type, JSON.stringify(data)]);

  // Download real server-generated PNG
  const handleDownload = async () => {
    try {
      setIsLoading(true);
      const endpoint = type === "product" ? "/api/og/product" : "/api/og/snippet";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error?.message || "Failed to generate PNG for download");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `codeshare-zone-${type}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(`Error downloading image: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Copy cURL command
  const handleCopyCurl = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://codeshare.zone.id";
    const endpoint = type === "product" ? `${origin}/api/og/product` : `${origin}/api/og/snippet`;
    const curlCommand = `curl -X POST "${endpoint}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(data, null, 2)}' \\
  --output og-${type}.png`;

    navigator.clipboard.writeText(curlCommand);
    setCopiedType("curl");
    setTimeout(() => setCopiedType(null), 2500);
  };

  // Copy JS Fetch code
  const handleCopyFetch = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://codeshare.zone.id";
    const endpoint = type === "product" ? `${origin}/api/og/product` : `${origin}/api/og/snippet`;
    const fetchCode = `const response = await fetch("${endpoint}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(${JSON.stringify(data, null, 2)})
});

if (!response.ok) {
  throw new Error("Failed to generate OG image");
}

const imageBlob = await response.blob();
const imageUrl = URL.createObjectURL(imageBlob);`;

    navigator.clipboard.writeText(fetchCode);
    setCopiedType("fetch");
    setTimeout(() => setCopiedType(null), 2500);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Header bar of Preview */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-black bg-white px-2 py-0.5 rounded border border-black shadow-[1.5px_1.5px_0px_0px_#000000]">
            Live Preview (1200 × 630)
          </span>
          {isLoading && (
            <span className="flex items-center gap-1 text-xs font-bold text-neutral-600 animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin text-[#9700FF]" />
              Rendering...
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={generatePreview}
          disabled={isLoading}
          className="inline-flex items-center gap-1 text-xs font-bold text-neutral-800 hover:text-black hover:underline disabled:opacity-50"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Scaled Responsive Container for 1200x630 (1.905:1 ratio) */}
      <div className="relative w-full aspect-[1200/630] bg-neutral-100 rounded-2xl border-[3.5px] border-black shadow-[6px_6px_0px_0px_#000000] overflow-hidden flex items-center justify-center">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt="Generated Code Share Zone OG Image Preview"
            className="w-full h-full object-contain select-none"
          />
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="w-10 h-10 border-4 border-black border-t-[#9700FF] rounded-full animate-spin" />
            <p className="text-sm font-bold text-black">Generating canvas preview with @napi-rs/canvas...</p>
          </div>
        ) : errorMessage ? (
          <div className="flex flex-col items-center justify-center gap-2 p-6 text-center max-w-md">
            <AlertCircle className="w-10 h-10 text-red-500" />
            <p className="text-sm font-bold text-red-600">{errorMessage}</p>
            <Button size="sm" variant="secondary" onClick={generatePreview}>
              Try Again
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
            <p className="text-sm font-bold text-neutral-500">
              Fill in the form to generate the OG Image preview.
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons Toolbar */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button
          onClick={handleDownload}
          isLoading={isLoading}
          variant="primary"
          size="md"
          className="flex-1 sm:flex-initial"
        >
          <Download className="w-4 h-4 mr-2" />
          Download PNG
        </Button>

        <Button
          onClick={handleCopyCurl}
          variant="secondary"
          size="md"
          className="flex-1 sm:flex-initial"
        >
          {copiedType === "curl" ? (
            <>
              <Check className="w-4 h-4 mr-1.5 text-emerald-600" />
              Copied cURL!
            </>
          ) : (
            <>
              <Terminal className="w-4 h-4 mr-1.5" />
              Copy cURL
            </>
          )}
        </Button>

        <Button
          onClick={handleCopyFetch}
          variant="secondary"
          size="md"
          className="flex-1 sm:flex-initial"
        >
          {copiedType === "fetch" ? (
            <>
              <Check className="w-4 h-4 mr-1.5 text-emerald-600" />
              Copied Fetch!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-1.5" />
              Copy JS Fetch
            </>
          )}
        </Button>
      </div>

      {/* Storage & Public URL Note (Section 9 Requirement) */}
      <div className="p-3 bg-amber-50 rounded-xl border-2 border-black text-xs text-neutral-800 shadow-[2px_2px_0px_0px_#000000] flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Public URL Info: </span>
          Direct binary API (<code className="font-mono font-bold bg-white px-1 py-0.5 rounded border border-neutral-300">POST /api/og/{type}</code>) is recommended for production OG tags and pipelines. Persistent cloud storage (Vercel Blob / S3) is unconfigured, so temporary direct generation is used.
        </div>
      </div>
    </div>
  );
};
