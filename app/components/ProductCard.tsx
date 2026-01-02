// components/ProductCard.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  tag?: string;
}

export const ProductCard = ({ id, name, price, image, category, tag }: ProductCardProps) => {

  const handleBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const phoneNumber = "8098647062";
    const message = `Hola D&E, estoy interesado en reservar el PRE-ORDER de: *${name}* (RD$${price}).`;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group relative mb-6 break-inside-avoid"
    >
      {/* Link simplificado - usa directamente el id */}
      <Link href={`/products/${id}`} className="block relative overflow-hidden bg-gray-100">
        <motion.img
          src={image}
          alt={name}
          className="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Etiqueta Superior */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          <span className="bg-brand-black text-brand-cream text-[10px] font-sans px-2 py-1 tracking-widest uppercase shadow-sm">
            Pre-Order
          </span>
          {tag === 'sale' && (
            <span className="bg-red-800 text-white text-[10px] font-sans px-2 py-1 tracking-widest uppercase shadow-sm">
              Sale
            </span>
          )}
        </div>

        {/* Overlay con Botón */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-brand-black/10">
          <button
            onClick={handleBuy}
            className="bg-brand-cream/90 backdrop-blur-sm border border-brand-black text-white font-sans text-xs font-medium tracking-widest px-6 py-3 uppercase hover:bg-brand-black hover:text-brand-cream transition-colors shadow-lg transform translate-y-4 group-hover:translate-y-0 duration-300"
          >
            Reservar Ahora
          </button>
        </div>
      </Link>

      {/* Información del Producto */}
      <div className="mt-4 px-1">
        <div className="flex justify-between items-start mb-1">
          <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {category}
          </span>
          <span className="text-[10px] text-green-700 font-sans bg-green-50 px-2 py-0.5 rounded-full">
            Envío: 7-10 días
          </span>
        </div>

        {/* Link simplificado aquí también */}
        <Link href={`/products/${id}`}>
          <h4 className="mb-1 font-serif text-lg text-brand-black group-hover:underline decoration-1 underline-offset-4">
            {name}
          </h4>
        </Link>

        <p className="font-sans text-sm font-medium text-brand-black">
          RD${price.toLocaleString()}
        </p>
      </div>
    </motion.div>
  );
};