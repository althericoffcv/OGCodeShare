import React from "react";
import clsx from "clsx";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  maxLength?: number;
  currentLength?: number;
  hint?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  maxLength,
  currentLength,
  hint,
  className,
  value,
  id,
  rows = 3,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  const length = currentLength !== undefined ? currentLength : (typeof value === "string" ? value.length : 0);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <div className="flex justify-between items-center text-xs font-bold text-neutral-900 uppercase tracking-wider">
          <label htmlFor={inputId}>{label}</label>
          {maxLength !== undefined && (
            <span className={clsx("text-xs font-mono", length > maxLength ? "text-red-600 font-bold" : "text-neutral-500")}>
              {length}/{maxLength}
            </span>
          )}
        </div>
      )}
      <textarea
        id={inputId}
        rows={rows}
        value={value}
        maxLength={maxLength}
        className={clsx(
          "w-full px-3.5 py-2.5 text-sm font-medium text-neutral-900 bg-white rounded-lg resize-none",
          "border-[2.5px] border-black shadow-[3px_3px_0px_0px_#000000]",
          "focus:outline-none focus:shadow-[4px_4px_0px_0px_#000000] focus:-translate-y-0.5",
          "transition-all duration-150 placeholder:text-neutral-400",
          error && "border-red-600 shadow-[3px_3px_0px_0px_#DC2626]",
          className
        )}
        {...props}
      />
      {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}
      {error && <p className="text-xs font-bold text-red-600">{error}</p>}
    </div>
  );
};
