import { z } from "zod";

const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

export const hexColorSchema = z
  .string()
  .regex(hexColorRegex, "Invalid HEX color format. Example: #9700FF or #FFF")
  .optional();

export const imageSourceSchema = z
  .string({ required_error: "Image is required" })
  .trim()
  .min(1, "Image cannot be empty")
  .refine(
    (val) => {
      // HTTPS remote URL
      if (val.startsWith("https://")) return true;
      // Base64 Data URL (e.g. data:image/png;base64,... or data:image/jpeg;base64,...)
      if (val.startsWith("data:image/")) return true;
      // Raw base64 string
      const sanitized = val.replace(/\s+/g, "");
      if (sanitized.length >= 20 && /^[A-Za-z0-9+/=]+$/.test(sanitized)) {
        return true;
      }
      return false;
    },
    {
      message: "Image must be a valid secure HTTPS URL or Base64 Data URL (data:image/...;base64,...)",
    }
  );

export const productOgSchema = z.object({
  name: z
    .string({ required_error: "Product name is required" })
    .trim()
    .min(1, "Product name cannot be empty")
    .max(100, "Product name cannot exceed 100 characters"),
  description: z
    .string({ required_error: "Description is required" })
    .trim()
    .min(1, "Description cannot be empty")
    .max(350, "Description cannot exceed 350 characters"),
  price: z
    .string({ required_error: "Price is required" })
    .trim()
    .min(1, "Price cannot be empty")
    .max(50, "Price cannot exceed 50 characters"),
  image: imageSourceSchema,
  buttonText: z
    .string()
    .trim()
    .max(30, "Button text cannot exceed 30 characters")
    .default("Buy Now"),
  backgroundColor: z
    .string()
    .regex(hexColorRegex, "Invalid HEX color format. Example: #9700FF or #FFF")
    .default("#9700FF"),
  imageFit: z.enum(["cover", "contain"]).default("cover"),
});

export const snippetOgSchema = z.object({
  name: z
    .string({ required_error: "Snippet name is required" })
    .trim()
    .min(1, "Snippet name cannot be empty")
    .max(100, "Snippet name cannot exceed 100 characters"),
  description: z
    .string({ required_error: "Description is required" })
    .trim()
    .min(1, "Description cannot be empty")
    .max(350, "Description cannot exceed 350 characters"),
  author: z
    .string({ required_error: "Author name is required" })
    .trim()
    .min(1, "Author name cannot be empty")
    .max(80, "Author name cannot exceed 80 characters"),
  authorImage: imageSourceSchema.optional().or(z.literal("")),
  buttonText: z
    .string()
    .trim()
    .max(30, "Button text cannot exceed 30 characters")
    .default("Get Snippet"),
  backgroundColor: z
    .string()
    .regex(hexColorRegex, "Invalid HEX color format. Example: #9700FF or #FFF")
    .default("#FFC900"),
  imageFit: z.enum(["cover", "contain"]).default("cover"),
});

export const generateOgSchema = z.object({
  type: z.enum(["product", "snippet"], {
    required_error: "Type is required ('product' or 'snippet')",
  }),
  data: z.record(z.any(), { required_error: "Data object is required" }),
  responseType: z.enum(["binary", "base64"]).default("binary").optional(),
});
