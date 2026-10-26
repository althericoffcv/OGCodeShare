import React from "react";
import clsx from "clsx";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "purple" | "yellow" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  className,
  disabled,
  ...props
}) => {
  const variantStyles = {
    primary: "bg-black text-white hover:bg-neutral-800",
    secondary: "bg-white text-black hover:bg-neutral-100",
    purple: "bg-[#9700FF] text-white hover:bg-[#8300E0]",
    yellow: "bg-[#FFC900] text-black hover:bg-[#EBB800]",
    outline: "bg-transparent text-black hover:bg-neutral-100",
  }[variant];

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs font-bold",
    md: "px-5 py-2.5 text-sm font-bold",
    lg: "px-6 py-3.5 text-base font-bold",
  }[size];

  return (
    <button
      disabled={disabled || isLoading}
      className={clsx(
        "inline-flex items-center justify-center font-bold tracking-tight rounded-xl select-none",
        "border-[3px] border-black shadow-[4px_4px_0px_0px_#000000]",
        "transition-all duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#000000]",
        "hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_0px_#000000]",
        "disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-[2px_2px_0px_0px_#000000]",
        variantStyles,
        sizeStyles,
        className
      )}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
