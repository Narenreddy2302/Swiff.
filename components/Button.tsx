import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseClasses = "px-6 py-3 font-medium rounded-md transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary: "bg-tesla-black text-tesla-white hover:bg-tesla-gray",
    secondary: "border-2 border-tesla-black text-tesla-black hover:bg-tesla-black hover:text-tesla-white",
    danger: "bg-tesla-red text-tesla-white hover:bg-opacity-90",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
