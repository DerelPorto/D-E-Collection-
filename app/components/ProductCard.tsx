// components/ProductCard.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ShoppingBag, Eye, Heart } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  tag?: string;
  stock?: number;
}

export const ProductCard = ({ id, name, price, image, category, tag, stock = 1 }: ProductCardProps) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const phoneNumber = "8098647062";
    const message = `Hola D&E, estoy interesado en reservar: *${name}* (RD$${price.toLocaleString()}).`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div
      className="group relative overflow-hidden rounded-sm"
      style={{ background: "var(--bg-card)" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image container */}
      <Link href={`/products/${id}`} className="block relative overflow-hidden">
        {/* Aspect ratio box */}
        <div className="aspect-[3/4] overflow-hidden relative">
          <motion.img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
            animate={{ scale: hovered ? 1.06 : 1 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          />

          {/* Gradient overlay */}
          <div
            className="absolute inset-0 transition-opacity duration-400"
            style={{
              background: "var(--grad-card)",
              opacity: hovered ? 1 : 0.3,
            }}
          />

          {/* Tags */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {stock === 0 ? (
              <span
                className="font-sans text-[9px] tracking-luxury uppercase px-2.5 py-1 font-bold"
                style={{ background: "#7f8c8d", color: "#fff" }}
              >
                Agotado
              </span>
            ) : (
              <>
                {tag === "sale" && (
                  <span
                    className="font-sans text-[9px] tracking-luxury uppercase px-2.5 py-1"
                    style={{ background: "#c0392b", color: "#fff" }}
                  >
                    Sale
                  </span>
                )}
                <span
                  className="font-sans text-[9px] tracking-luxury uppercase px-2.5 py-1"
                  style={{ background: "var(--gold)", color: "var(--bg-primary)" }}
                >
                  Pre-Order
                </span>
              </>
            )}
          </div>

          {/* Wishlist button */}
          <motion.button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsWishlisted(w => !w); }}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full glass transition-all"
            animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.8 }}
            transition={{ duration: 0.25 }}
          >
            <Heart
              className="h-4 w-4 transition-colors"
              fill={isWishlisted ? "var(--gold)" : "none"}
              style={{ color: isWishlisted ? "var(--gold)" : "var(--white-60)" }}
            />
          </motion.button>

          {/* Action buttons overlay */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.25 }}
                className="absolute bottom-4 left-4 right-4 flex gap-2"
              >
                {/* Quick view */}
                <Link
                  href={`/products/${id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 glass font-sans text-[10px] tracking-wide uppercase transition-all hover:bg-white/10"
                  style={{ color: "var(--white)" }}
                  onClick={e => e.stopPropagation()}
                >
                  <Eye className="h-3 w-3" />
                  <span>Ver</span>
                </Link>

                {/* Buy via WhatsApp */}
                {stock === 0 ? (
                  <button
                    disabled
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 font-sans text-[10px] tracking-wide uppercase transition-all opacity-50 cursor-not-allowed"
                    style={{
                      background: "#2c3e50",
                      color: "var(--white)",
                    }}
                  >
                    <ShoppingBag className="h-3 w-3" />
                    <span>Sin Stock</span>
                  </button>
                ) : (
                  <button
                    onClick={handleBuy}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 font-sans text-[10px] tracking-wide uppercase transition-all hover:brightness-110 active:scale-[0.98]"
                    style={{
                      background: "var(--gold)",
                      color: "var(--bg-primary)",
                    }}
                  >
                    <ShoppingBag className="h-3 w-3" />
                    <span>Reservar</span>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Link>

      {/* Product info */}
      <div className="p-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="flex justify-between items-center mb-1.5">
          <span
            className="font-sans text-[9px] tracking-luxury uppercase"
            style={{ color: "var(--gold)" }}
          >
            {category}
          </span>
          <span
            className="font-sans text-[9px]"
            style={{ color: "rgba(248,246,242,0.25)" }}
          >
            7-10 días
          </span>
        </div>

        <Link href={`/products/${id}`}>
          <h3
            className="font-serif text-base font-light mb-2 leading-snug hover:underline decoration-1 underline-offset-4 transition-all"
            style={{ color: "var(--white)" }}
          >
            {name}
          </h3>
        </Link>

        <div className="flex items-center justify-between">
          <p className="font-sans text-sm font-medium" style={{ color: "var(--white-60)" }}>
            RD${price.toLocaleString()}
          </p>
          <div
            className="w-5 h-px"
            style={{ background: "var(--gold)", opacity: hovered ? 1 : 0, transition: "opacity 0.3s" }}
          />
        </div>
      </div>
    </div>
  );
};