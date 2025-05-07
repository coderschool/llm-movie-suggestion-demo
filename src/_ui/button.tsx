import React from "react";
import { Card } from "./card";

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  isSelected?: boolean;
  variant?: "primary" | "secondary" | "outline" | "card";
  size?: "small" | "medium" | "large";
  className?: string;
}

export const Button = ({
  children,
  onClick,
  disabled,
  isSelected = false,
  variant = "primary",
  size = "medium",
  className,
}: ButtonProps) => {
  let buttonClass = "";
  let sizeClass = "";

  if (variant !== "card") {
    const variantClasses = {
      primary:
        "bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-lg",
      secondary:
        "bg-white hover:bg-gray-100 text-gray-700 font-semibold shadow-lg",
      outline:
        "border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold shadow-lg",
    };
    buttonClass = variantClasses[variant] || variantClasses.primary;

    sizeClass = `rounded-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer ${
      size === "small"
        ? "py-1 px-3 text-sm"
        : size === "large"
        ? "py-3 px-8 text-lg"
        : "py-2 px-6 text-base"
    }`;
  }

  if (variant === "card") {
    const cardButtonBaseStyle =
      "relative w-full text-left focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 rounded-lg";
    const selectedStyle = isSelected ? "ring-1 ring-orange-500" : "";

    const cardSizeClass =
      size === "small"
        ? "p-2 text-sm"
        : size === "large"
        ? "p-6 text-lg"
        : "p-4 text-base";

    return (
      <button
        className={`${cardButtonBaseStyle} ${selectedStyle} ${
          className || ""
        }`.trim()}
        onClick={onClick}
        disabled={disabled}
      >
        <Card className={`h-full ${cardSizeClass}`}>
          {children}
          <div
            className={`absolute bottom-2 right-2 w-3 h-3 rounded-full ${
              isSelected ? "bg-orange-500" : "border border-gray-400"
            }`}
            aria-hidden="true"
          />
        </Card>
      </button>
    );
  }

  return (
    <button
      className={`${buttonClass} ${sizeClass} ${className || ""}`.trim()}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
