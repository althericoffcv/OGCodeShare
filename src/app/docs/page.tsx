import React from "react";
import Link from "next/link";
import { ArrowLeft, Terminal, ShieldAlert, Sparkles, Copy, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "API Documentation — Code Share Zone OG Generator",
  description: "Public API specifications and usage guide for generating high-fidelity Open Graph images.",
};

export default function DocsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Back button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-black bg-white px-3.5 py-1.5 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000000] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Generator</span>
        </Link>
      </div>

      {/* Hero Header */}
      <div className="border-[3px] border-black rounded-2xl p-6 sm:p-8 bg-[#9700FF] text-white shadow-[6px_6px_0px_0px_#000000]">
        <div className="inline-block bg-black text-[#FFC900] text-xs font-black uppercase px-2.5 py-1 rounded border border-black mb-3">
          Developer Documentation
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Code Share Zone OG Generator API
        </h1>
        <p className="mt-2 text-sm sm:text-base text-purple-100 max-w-2xl font-medium">
          Production-ready REST API for generating pixel-perfect 1200×630 Neo-Brutalist Open Graph images for products and code snippets.
        </p>
      </div>

      {/* Quick Overview */}
      <section className="space-y-4">
        <h2 className="text-2xl font-extrabold text-black">Base URL & Endpoints</h2>
        <div className="border-[2.5px] border-black rounded-xl p-4 bg-white shadow-[4px_4px_0px_0px_#000000]">
          <p className="text-xs font-mono font-bold text-neutral-500 uppercase">Base URL</p>
          <code className="text-base font-mono font-bold text-neutral-900 block mt-1">
            https://og-codeshare.vercel.app
          </code>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border-[2.5px] border-black bg-white rounded-xl shadow-[4px_4px_0px_0px_#000000]">
            <thead>
              <tr className="bg-neutral-100 border-b-2 border-black text-xs font-black uppercase">
                <th className="p-3">Method</th>
                <th className="p-3">Endpoint</th>
                <th className="p-3">Description</th>
                <th className="p-3">Response</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium divide-y divide-neutral-200">
              <tr>
                <td className="p-3 font-mono font-bold text-purple-700">POST / GET</td>
                <td className="p-3 font-mono font-bold">/api/og/product</td>
                <td className="p-3">Generates 1200×630 PNG for product items (supports HTTPS URL & Base64)</td>
                <td className="p-3 font-mono text-xs">image/png (200)</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-purple-700">POST / GET</td>
                <td className="p-3 font-mono font-bold">/api/og/snippet</td>
                <td className="p-3">Generates 1200×630 PNG for code snippets (supports HTTPS URL & Base64)</td>
                <td className="p-3 font-mono text-xs">image/png (200)</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-purple-700">POST</td>
                <td className="p-3 font-mono font-bold">/api/og/generate</td>
                <td className="p-3">Universal generator supporting base64 or binary</td>
                <td className="p-3 font-mono text-xs">JSON or image/png</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-emerald-700">GET</td>
                <td className="p-3 font-mono font-bold">/api/health</td>
                <td className="p-3">Service health status check</td>
                <td className="p-3 font-mono text-xs">application/json</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Endpoint 1: Product OG */}
      <section className="space-y-4 border-[3px] border-black rounded-2xl p-6 bg-white shadow-[6px_6px_0px_0px_#000000]">
        <div className="flex items-center gap-3">
          <span className="bg-[#9700FF] text-white px-3 py-1 rounded-md text-xs font-black uppercase border border-black shadow-[1.5px_1.5px_0px_0px_#000000]">
            POST
          </span>
          <h2 className="text-xl font-extrabold text-black font-mono">/api/og/product</h2>
        </div>
        <p className="text-sm text-neutral-600 font-medium">
          Renders the official purple Code Share Zone Product OG image.
        </p>

        <h3 className="text-sm font-bold text-black uppercase tracking-wider">Request Body Parameters</h3>
        <ul className="text-sm space-y-1.5 list-disc pl-5">
          <li><code className="font-bold">name</code> (string, required): Product title (1–100 chars).</li>
          <li><code className="font-bold">description</code> (string, required): Product description (1–350 chars).</li>
          <li><code className="font-bold">price</code> (string, required): Price label (e.g. &quot;Rp 45.000&quot;).</li>
          <li><code className="font-bold">image</code> (string, required): HTTPS image URL. Verified against SSRF.</li>
          <li><code className="font-bold">buttonText</code> (string, optional): Button text (default: &quot;Buy Now&quot;).</li>
          <li><code className="font-bold">backgroundColor</code> (string, optional): Hex color (default: &quot;#9700FF&quot;).</li>
        </ul>

        {/* cURL Example */}
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-extrabold uppercase text-neutral-700">cURL Example</h4>
          <pre className="p-4 bg-neutral-900 text-neutral-100 rounded-xl text-xs font-mono overflow-x-auto border-2 border-black">
{`curl -X POST "https://og-codeshare.vercel.app/api/og/product" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Raiden Ai V19",
    "description": "Bot Whatsapp Raiden Ai Memiliki Banyak Fitur, Terdiri dari fitur Ai, Downloader, DLL",
    "price": "Rp 45.000",
    "image": "https://api.lumi-base.my.id/imgurl/lumi_1785927127089_c63f4979.jpg"
  }' \\
  --output product-og.png`}
          </pre>
        </div>
      </section>

      {/* Endpoint 2: Snippet OG */}
      <section className="space-y-4 border-[3px] border-black rounded-2xl p-6 bg-white shadow-[6px_6px_0px_0px_#000000]">
        <div className="flex items-center gap-3">
          <span className="bg-[#FFC900] text-black px-3 py-1 rounded-md text-xs font-black uppercase border border-black shadow-[1.5px_1.5px_0px_0px_#000000]">
            POST
          </span>
          <h2 className="text-xl font-extrabold text-black font-mono">/api/og/snippet</h2>
        </div>
        <p className="text-sm text-neutral-600 font-medium">
          Renders the official yellow Code Share Zone Snippet OG image.
        </p>

        <h3 className="text-sm font-bold text-black uppercase tracking-wider">Request Body Parameters</h3>
        <ul className="text-sm space-y-1.5 list-disc pl-5">
          <li><code className="font-bold">name</code> (string, required): Snippet title (1–100 chars).</li>
          <li><code className="font-bold">description</code> (string, required): Snippet description (1–350 chars).</li>
          <li><code className="font-bold">author</code> (string, required): Author name (1–80 chars).</li>
          <li><code className="font-bold">authorImage</code> (string, optional): HTTPS image URL. If omitted, a clean code editor visual graphic is rendered.</li>
          <li><code className="font-bold">buttonText</code> (string, optional): Button text (default: &quot;Get Snippet&quot;).</li>
          <li><code className="font-bold">backgroundColor</code> (string, optional): Hex color (default: &quot;#FFC900&quot;).</li>
        </ul>

        {/* JavaScript fetch example */}
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-extrabold uppercase text-neutral-700">JavaScript / TypeScript Fetch Example</h4>
          <pre className="p-4 bg-neutral-900 text-neutral-100 rounded-xl text-xs font-mono overflow-x-auto border-2 border-black">
{`const response = await fetch("https://og-codeshare.vercel.app/api/og/snippet", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "All In One Downloader",
    description: "All in one is....",
    author: "Bayu Official"
  })
});

if (!response.ok) {
  const error = await response.json();
  throw new Error(error.error.message);
}

const blob = await response.blob();
const imageUrl = URL.createObjectURL(blob);`}
          </pre>
        </div>
      </section>

      {/* Endpoint 3: Universal Generate */}
      <section className="space-y-4 border-[3px] border-black rounded-2xl p-6 bg-white shadow-[6px_6px_0px_0px_#000000]">
        <div className="flex items-center gap-3">
          <span className="bg-black text-white px-3 py-1 rounded-md text-xs font-black uppercase border border-black shadow-[1.5px_1.5px_0px_0px_#000000]">
            POST
          </span>
          <h2 className="text-xl font-extrabold text-black font-mono">/api/og/generate</h2>
        </div>
        <p className="text-sm text-neutral-600 font-medium">
          Universal generation endpoint supporting both direct binary PNG and JSON Base64 response formats.
        </p>

        <h4 className="text-xs font-extrabold uppercase text-neutral-700">Base64 JSON Request</h4>
        <pre className="p-4 bg-neutral-900 text-neutral-100 rounded-xl text-xs font-mono overflow-x-auto border-2 border-black">
{`{
  "type": "product",
  "data": {
    "name": "Raiden Ai V19",
    "description": "Bot WhatsApp",
    "price": "Rp 45.000",
    "image": "https://example.com/product.jpg"
  },
  "responseType": "base64"
}`}
        </pre>

        <h4 className="text-xs font-extrabold uppercase text-neutral-700">Base64 JSON Response</h4>
        <pre className="p-4 bg-neutral-900 text-neutral-100 rounded-xl text-xs font-mono overflow-x-auto border-2 border-black">
{`{
  "success": true,
  "mimeType": "image/png",
  "width": 1200,
  "height": 630,
  "image": "iVBORw0KGgoAAAANSUhEUgAABLAAAAJ6CAYAA..."
}`}
        </pre>
      </section>

      {/* Error Codes & Security */}
      <section className="space-y-4 border-[3px] border-black rounded-2xl p-6 bg-white shadow-[6px_6px_0px_0px_#000000]">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-600" />
          <h2 className="text-xl font-extrabold text-black">Error Handling & Security</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border-2 border-black rounded-xl">
            <thead>
              <tr className="bg-neutral-100 border-b border-black text-xs font-bold uppercase">
                <th className="p-2.5">HTTP Status</th>
                <th className="p-2.5">Error Code</th>
                <th className="p-2.5">Condition</th>
              </tr>
            </thead>
            <tbody className="text-xs font-mono divide-y divide-neutral-200">
              <tr>
                <td className="p-2.5 font-bold">400</td>
                <td className="p-2.5 text-red-700">INVALID_INPUT</td>
                <td className="p-2.5 font-sans">Schema validation failed or empty required fields</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">413</td>
                <td className="p-2.5 text-red-700">PAYLOAD_TOO_LARGE</td>
                <td className="p-2.5 font-sans">Request payload exceeds allowed threshold</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">422</td>
                <td className="p-2.5 text-red-700">RENDERING_ERROR</td>
                <td className="p-2.5 font-sans">SSRF blocked, private IP resolution, or invalid image format</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">429</td>
                <td className="p-2.5 text-red-700">RATE_LIMIT_EXCEEDED</td>
                <td className="p-2.5 font-sans">More than 60 requests in 1 minute per IP</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">500</td>
                <td className="p-2.5 text-red-700">RENDERING_ERROR</td>
                <td className="p-2.5 font-sans">Internal canvas rendering failure</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}