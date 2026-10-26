import { ProductOgInput, SnippetOgInput, OgRenderResult } from "@/lib/types/og";
import { renderProductOg } from "./templates/product";
import { renderSnippetOg } from "./templates/snippet";
import { OG_WIDTH, OG_HEIGHT } from "./templates/common";

export async function renderOgImage(
  type: "product" | "snippet",
  data: ProductOgInput | SnippetOgInput
): Promise<OgRenderResult> {
  let buffer: Buffer;

  if (type === "product") {
    buffer = await renderProductOg(data as ProductOgInput);
  } else if (type === "snippet") {
    buffer = await renderSnippetOg(data as SnippetOgInput);
  } else {
    throw new Error(`Unsupported OG type: ${type}`);
  }

  return {
    buffer,
    mimeType: "image/png",
    width: OG_WIDTH,
    height: OG_HEIGHT,
  };
}
