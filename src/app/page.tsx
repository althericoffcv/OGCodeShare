"use client";

import React, { useState } from "react";
import { GeneratorTabs } from "@/components/generator/GeneratorTabs";
import { ProductForm, DEFAULT_PRODUCT_DATA } from "@/components/generator/ProductForm";
import { SnippetForm, DEFAULT_SNIPPET_DATA } from "@/components/generator/SnippetForm";
import { LivePreview } from "@/components/preview/LivePreview";
import { OgType, ProductOgInput, SnippetOgInput } from "@/lib/types/og";
import { Sparkles, Terminal, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const [activeType, setActiveType] = useState<OgType>("product");
  const [productData, setProductData] = useState<ProductOgInput>(DEFAULT_PRODUCT_DATA);
  const [snippetData, setSnippetData] = useState<SnippetOgInput>(DEFAULT_SNIPPET_DATA);

  const activeData = activeType === "product" ? productData : snippetData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Intro Hero Section */}
      <div className="mb-8 sm:mb-10 text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-black bg-[#FFC900] text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>High-Fidelity Neo-Brutalist Engine</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-black tracking-tight">
          Code Share Zone OG Generator
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 font-medium max-w-2xl mx-auto">
          Create pixel-perfect Open Graph (OG) images for products and code snippets automatically with our production-ready canvas renderer and public API.
        </p>

        {/* Quick Highlights */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-bold text-neutral-700">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 1200 × 630 PNG
          </span>
          <span className="text-neutral-300">•</span>
          <span className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-amber-500" /> @napi-rs/canvas Skia
          </span>
          <span className="text-neutral-300">•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-indigo-600" /> SSRF Protected
          </span>
        </div>
      </div>

      {/* Main Two-Column Layout (Desktop: Form Left, Preview Right; Mobile: Stacked) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form & Controls (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5 bg-white p-5 sm:p-6 rounded-2xl border-[3.5px] border-black shadow-[6px_6px_0px_0px_#000000]">
          {/* Segmented Control / Tabs */}
          <GeneratorTabs activeType={activeType} onChange={setActiveType} />

          {/* Form */}
          {activeType === "product" ? (
            <ProductForm data={productData} onChange={setProductData} />
          ) : (
            <SnippetForm data={snippetData} onChange={setSnippetData} />
          )}
        </div>

        {/* Right Column: Live Scaled Preview & Output (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4 bg-white p-5 sm:p-6 rounded-2xl border-[3.5px] border-black shadow-[6px_6px_0px_0px_#000000] sticky top-24">
          <LivePreview type={activeType} data={activeData} />
        </div>
      </div>

      {/* API Quick Reference Banner at bottom */}
      <div className="mt-16 p-6 sm:p-8 bg-neutral-900 text-white rounded-2xl border-[3.5px] border-black shadow-[8px_8px_0px_0px_#000000] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Terminal className="w-5 h-5 text-[#FFC900]" />
            <h3 className="text-lg font-black tracking-tight">Need to automate this in your app?</h3>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">
            Integrate our high-speed Public API directly into your backend or CI/CD pipeline using simple POST requests.
          </p>
        </div>

        <Link
          href="/docs"
          className="inline-flex items-center gap-2 bg-[#FFC900] text-black font-extrabold text-sm px-6 py-3 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#FFFFFF] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all shrink-0"
        >
          <span>Explore Public API Docs</span>
        </Link>
      </div>
    </div>
  );
}
