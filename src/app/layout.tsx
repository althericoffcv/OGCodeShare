import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Code Share Zone — OG Image Generator + Public API",
  description:
    "Generate pixel-perfect Neo-Brutalist Open Graph images for products and code snippets automatically with our high-performance API.",
  icons: {
    icon: "/assets/favicon-c.jpg",
  },
  openGraph: {
    title: "Code Share Zone — OG Image Generator + Public API",
    description: "Automatic Open Graph generator for products & code snippets.",
    url: "https://codeshare.zone.id",
    siteName: "Code Share Zone",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col justify-between selection:bg-[#FFC900] selection:text-black">
        <div>
          <Navbar />
          <main>{children}</main>
        </div>
        <Footer />
      </body>
    </html>
  );
}
