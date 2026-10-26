import fs from "fs";
import path from "path";
import { GlobalFonts } from "@napi-rs/canvas";

let fontsRegistered = false;

export function ensureFontsRegistered(): void {
  if (fontsRegistered) return;

  const fontDir = path.join(process.cwd(), "public/fonts");

  const fontFiles = [
    { file: "Inter-Bold.woff", name: "Inter" },
    { file: "Inter-SemiBold.woff", name: "Inter" },
    { file: "Inter-Regular.woff", name: "Inter" },
    { file: "Inter-ExtraBold.woff", name: "Inter" },
  ];

  for (const { file, name } of fontFiles) {
    const fullPath = path.join(fontDir, file);
    if (fs.existsSync(fullPath)) {
      try {
        GlobalFonts.registerFromPath(fullPath, name);
      } catch (err) {
        console.warn(`Could not register font ${file}:`, err);
      }
    }
  }

  fontsRegistered = true;
}
