import React from "react";
import Link from "next/link";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t-[3px] border-black bg-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base text-black">Code Share Zone</span>
            <span className="text-xs bg-black text-white px-2 py-0.5 rounded font-mono font-bold">
              v1.0.0
            </span>
          </div>
          <p className="text-xs text-neutral-600 font-medium">
            Open Graph (OG) Image Generator & Public API Engine
          </p>
          <a
            href="https://codeshare.zone.id"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono font-bold text-[#9700FF] hover:underline"
          >
            codeshare.zone.id
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-neutral-700">
          <Link href="/" className="hover:text-black hover:underline">
            Generator
          </Link>
          <Link href="/docs" className="hover:text-black hover:underline">
            API Documentation
          </Link>
          <Link href="/api/health" className="hover:text-black hover:underline">
            Health Check
          </Link>
          <Link href="/api/docs" className="hover:text-black hover:underline">
            API JSON Spec
          </Link>
        </div>
      </div>
    </footer>
  );
};
