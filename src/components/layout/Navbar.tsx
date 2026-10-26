"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

export const Navbar: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<"ok" | "checking" | "error">("checking");

  useEffect(() => {
    fetch("/api/health")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data.status === "ok") {
          setHealthStatus("ok");
        } else {
          setHealthStatus("error");
        }
      })
      .catch(() => setHealthStatus("error"));
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b-[3px] border-black shadow-[0_4px_0_0_#000000]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-lg overflow-hidden border-2 border-black shadow-[2px_2px_0px_0px_#000000] group-hover:scale-105 transition-transform">
            <Image
              src="/assets/favicon-c.jpg"
              alt="Code Share Zone Favicon C"
              width={36}
              height={36}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-black">
              Code Share Zone
            </span>
            <span className="hidden sm:inline-block bg-[#FFC900] text-black text-xs font-black uppercase px-2 py-0.5 rounded border border-black shadow-[1.5px_1.5px_0px_0px_#000000]">
              OG Generator
            </span>
          </div>
        </Link>

        {/* Navigation & Status */}
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-black bg-neutral-50 text-xs font-mono font-medium">
            {healthStatus === "ok" ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-700 font-bold">API Online</span>
              </>
            ) : healthStatus === "checking" ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-neutral-600">Connecting...</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-red-700 font-bold">API Offline</span>
              </>
            )}
          </div>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-neutral-800 hover:text-black px-3 py-1.5 rounded-lg border-2 border-transparent hover:border-black hover:bg-neutral-100 transition-all"
          >
            <Sparkles className="w-4 h-4 text-[#9700FF]" />
            <span>Generator</span>
          </Link>

          <Link
            href="/docs"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-black px-3.5 py-1.5 rounded-lg border-2 border-black bg-[#FFC900] shadow-[2px_2px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000000] active:translate-x-0 active:translate-y-0 transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>API Docs</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
