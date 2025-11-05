import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Swiff - Split Expenses Effortlessly",
  description: "Modern expense sharing and bill splitting application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-tesla-white text-tesla-black">
        {children}
      </body>
    </html>
  );
}
