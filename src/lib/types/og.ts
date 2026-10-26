export type OgType = "product" | "snippet";

export type ImageFit = "cover" | "contain";

export interface ProductOgInput {
  name: string;
  description: string;
  price: string;
  image: string;
  buttonText?: string;
  backgroundColor?: string;
  imageFit?: ImageFit;
}

export interface SnippetOgInput {
  name: string;
  description: string;
  author: string;
  authorImage?: string;
  buttonText?: string;
  backgroundColor?: string;
  imageFit?: ImageFit;
}

export interface GenerateOgRequest {
  type: OgType;
  data: ProductOgInput | SnippetOgInput;
  responseType?: "binary" | "base64";
}

export interface OgRenderResult {
  buffer: Buffer;
  mimeType: string;
  width: number;
  height: number;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface ApiSuccessBase64Response {
  success: true;
  mimeType: string;
  width: number;
  height: number;
  image: string;
}
