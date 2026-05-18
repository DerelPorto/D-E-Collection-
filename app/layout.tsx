import type React from "react";
import type { Metadata } from "next";
import { CartProvider } from "@/context/CartContext";
import CartSidebar from "@/app/components/CartSidebar";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "D&E Collection - Elegancia Atemporal",
  description:
    "Tienda de ropa de alta gama con un estilo minimalista y sofisticado. Descubre la esencia del lujo discreto.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className={`font-sans antialiased`}>
        <CartProvider>
          {children}
          <CartSidebar />
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
