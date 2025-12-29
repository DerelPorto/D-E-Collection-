// app/product/[id]/ProductDetailClient.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

// Definimos la forma de tu producto para TypeScript
interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  images: string[];
  tag?: string;
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [mainImage, setMainImage] = useState(product.images[0]);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: 1,
    });
  };

  return (
    <div className="min-h-screen bg-cream pt-28 px-6 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Botón Volver */}
        <Link
          href="/"
          className="inline-flex items-center text-sm font-sans text-deep-black/60 hover:text-deep-black mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Volver a la tienda
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* GALERÍA */}
          <div className="flex flex-col gap-4">
            <motion.div
              key={mainImage}
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              className="aspect-[3/4] overflow-hidden bg-gray-100 relative rounded-sm"
            >
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.tag && (
                <span className="absolute top-4 right-4 bg-deep-black text-cream text-xs px-3 py-1 uppercase tracking-widest">
                  {product.tag}
                </span>
              )}
            </motion.div>

            {product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setMainImage(img)}
                    className={`w-20 h-24 flex-shrink-0 border transition-all ${
                      mainImage === img
                        ? "border-deep-black opacity-100"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFORMACIÓN */}
          <div className="flex flex-col justify-center sticky top-32 h-fit">
            <span className="text-sm tracking-[0.2em] uppercase text-gray-500 mb-4">
              {product.category}
            </span>
            <h1 className="font-serif text-4xl md:text-5xl text-deep-black mb-6">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-8">
              <p className="font-sans text-2xl text-deep-black">
                RD${product.price.toLocaleString()}
              </p>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                Envío Gratis
              </span>
            </div>

            <div className="prose prose-sm font-sans text-gray-600 mb-10 leading-relaxed">
              <p>{product.description}</p>
              <p>
                Esta pieza forma parte de nuestra colección exclusiva.
                Confeccionada con materiales de primera calidad pensados para el
                clima tropical.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={handleAddToCart}
                className="w-full bg-deep-black text-cream hover:bg-gray-800 py-4 text-sm tracking-widest uppercase transition-all shadow-lg hover:shadow-xl flex justify-center items-center gap-2"
              >
                Agregar a la Bolsa
              </button>
              <p className="text-center text-xs text-gray-400 mt-2">
                *Puedes seguir agregando productos o finalizar tu pedido en la
                bolsa.
              </p>
            </div>

            <div className="mt-12 border-t border-gray-200 pt-8 space-y-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Entrega estimada:</span>
                <span className="text-deep-black font-medium">
                  7-10 días laborables
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Política de devolución:</span>
                <span className="text-deep-black font-medium">15 días</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
