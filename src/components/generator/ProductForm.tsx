import React, { useRef } from "react";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { RotateCcw, Sparkles, Upload, Image as ImageIcon, X } from "lucide-react";
import { ProductOgInput } from "@/lib/types/og";

export const DEFAULT_PRODUCT_DATA: ProductOgInput = {
  name: "Raiden Ai V19",
  description: "Bot Whatsapp Raiden Ai Memiliki Banyak Fitur, Terdiri dari fitur Ai, Downloader, DLL",
  price: "Rp 45.000",
  image: "https://api.lumi-base.my.id/imgurl/lumi_1785927127089_c63f4979.jpg",
  buttonText: "Buy Now",
  backgroundColor: "#9700FF",
  imageFit: "cover",
};

interface ProductFormProps {
  data: ProductOgInput;
  onChange: (data: ProductOgInput) => void;
  errors?: Record<string, string>;
}

export const ProductForm: React.FC<ProductFormProps> = ({ data, onChange, errors = {} }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const updateField = <K extends keyof ProductOgInput>(key: K, value: ProductOgInput[K]) => {
    onChange({ ...data, [key]: value });
  };

  const handleReset = () => {
    onChange({
      name: "",
      description: "",
      price: "",
      image: "",
      buttonText: "Buy Now",
      backgroundColor: "#9700FF",
      imageFit: "cover",
    });
  };

  const handleLoadPreset = () => {
    onChange({ ...DEFAULT_PRODUCT_DATA });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file gambar maksimal 5 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateField("image", reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const isBase64 = data.image?.startsWith("data:image/") || (!data.image?.startsWith("http") && data.image?.length > 100);

  return (
    <div className="flex flex-col gap-4">
      {/* Preset & Reset Controls */}
      <div className="flex items-center justify-between gap-2 pb-1 border-b-2 border-neutral-200">
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
          Product Details
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadPreset}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#9700FF] hover:underline"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Reference</span>
          </button>
          <span className="text-neutral-300">|</span>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-xs font-bold text-neutral-600 hover:text-black"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Product Name */}
      <Input
        label="Product Name"
        placeholder="e.g. Raiden Ai V19"
        value={data.name}
        onChange={(e) => updateField("name", e.target.value)}
        maxLength={100}
        error={errors.name}
        required
      />

      {/* Description */}
      <Textarea
        label="Description"
        placeholder="Enter concise product features or details..."
        value={data.description}
        onChange={(e) => updateField("description", e.target.value)}
        maxLength={350}
        rows={3}
        error={errors.description}
        required
      />

      {/* Price */}
      <Input
        label="Price"
        placeholder="e.g. Rp 45.000"
        value={data.price}
        onChange={(e) => updateField("price", e.target.value)}
        maxLength={50}
        error={errors.price}
        required
      />

      {/* Product Image (URL or Base64 Upload) */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-xs font-bold text-neutral-900 uppercase tracking-wider">
          <label>Product Image (HTTPS URL or Base64)</label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1 text-xs font-bold text-black bg-[#FFC900] px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_0px_#000000] hover:bg-amber-400"
          >
            <Upload className="w-3 h-3" />
            <span>Upload Image</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {isBase64 ? (
          <div className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
            <img
              src={data.image}
              alt="Uploaded thumbnail"
              className="w-12 h-12 object-cover rounded border border-black shadow-[1px_1px_0px_0px_#000000]"
            />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-purple-900 block truncate">
                Base64 Image Attached ({Math.round(data.image.length / 1024)} KB)
              </span>
              <span className="text-[11px] text-neutral-600 block">
                Siap dikirim via POST API
              </span>
            </div>
            <button
              type="button"
              onClick={() => updateField("image", "")}
              className="p-1 rounded bg-white hover:bg-neutral-100 border border-black text-black"
              title="Remove Base64 Image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <Input
            placeholder="https://example.com/product.jpg atau data:image/..."
            value={data.image}
            onChange={(e) => updateField("image", e.target.value)}
            error={errors.image}
            hint="Dapat menggunakan URL HTTPS remote atau upload file lokal menjadi Base64."
            required
          />
        )}
      </div>

      {/* Advanced / Optional Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        <Input
          label="Button Text"
          placeholder="Buy Now"
          value={data.buttonText || ""}
          onChange={(e) => updateField("buttonText", e.target.value)}
          maxLength={30}
          error={errors.buttonText}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
            Background Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={data.backgroundColor?.startsWith("#") ? data.backgroundColor : "#9700FF"}
              onChange={(e) => updateField("backgroundColor", e.target.value)}
              className="w-10 h-10 rounded border-2 border-black cursor-pointer shadow-[2px_2px_0px_0px_#000000]"
            />
            <input
              type="text"
              value={data.backgroundColor || ""}
              onChange={(e) => updateField("backgroundColor", e.target.value)}
              placeholder="#9700FF"
              className="w-full px-3 py-2 text-sm font-mono font-bold text-neutral-900 bg-white rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
            />
          </div>
          {errors.backgroundColor && (
            <p className="text-xs font-bold text-red-600">{errors.backgroundColor}</p>
          )}
        </div>
      </div>
    </div>
  );
};
