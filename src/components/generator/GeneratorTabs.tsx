import React from "react";
import clsx from "clsx";
import { ShoppingBag, Code2 } from "lucide-react";
import { OgType } from "@/lib/types/og";

interface GeneratorTabsProps {
  activeType: OgType;
  onChange: (type: OgType) => void;
}

export const GeneratorTabs: React.FC<GeneratorTabsProps> = ({ activeType, onChange }) => {
  return (
    <div className="flex items-center gap-2 p-1.5 bg-neutral-100 rounded-xl border-[2.5px] border-black shadow-[3px_3px_0px_0px_#000000]">
      <button
        type="button"
        onClick={() => onChange("product")}
        className={clsx(
          "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-extrabold text-sm transition-all select-none",
          activeType === "product"
            ? "bg-[#9700FF] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
            : "text-neutral-700 hover:text-black hover:bg-neutral-200 border-2 border-transparent"
        )}
      >
        <ShoppingBag className="w-4 h-4" />
        <span>Product OG</span>
      </button>

      <button
        type="button"
        onClick={() => onChange("snippet")}
        className={clsx(
          "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-extrabold text-sm transition-all select-none",
          activeType === "snippet"
            ? "bg-[#FFC900] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
            : "text-neutral-700 hover:text-black hover:bg-neutral-200 border-2 border-transparent"
        )}
      >
        <Code2 className="w-4 h-4" />
        <span>Snippet OG</span>
      </button>
    </div>
  );
};
