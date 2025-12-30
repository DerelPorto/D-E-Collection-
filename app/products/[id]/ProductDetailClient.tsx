"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Truck, RotateCcw, Shield } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

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
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: 1,
    });
    
    // Animación de feedback
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white pt-24 px-4 sm:px-6 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <Link
          href="/"
          className="inline-flex items-center text-sm font-sans text-gray-500 hover:text-brand-black mb-8 group transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Volver a la tienda
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* GALERÍA - Más compacta y profesional */}
          <div className="flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails a la izquierda en desktop */}
            {product.images.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto pb-2 md:pb-0 md:max-h-[600px]">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setMainImage(img)}
                    className={`relative w-20 h-24 md:w-16 md:h-20 flex-shrink-0 border-2 rounded-sm overflow-hidden transition-all ${
                      mainImage === img
                        ? "border-brand-black ring-2 ring-brand-black ring-offset-2"
                        : "border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`Vista ${index + 1}`}
                      className="w-full h-full object-cover" 
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Imagen principal - más pequeña y con mejor aspect ratio */}
            <div className="flex-1">
              <motion.div
                key={mainImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="relative aspect-[3/4] max-h-[600px] overflow-hidden bg-gray-50 rounded-sm"
              >
                <img
                  src={mainImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.tag && (
                  <span className="absolute top-4 right-4 bg-brand-black text-white text-xs px-3 py-1.5 uppercase tracking-widest font-medium">
                    {product.tag}
                  </span>
                )}
              </motion.div>
            </div>
          </div>

          {/* INFORMACIÓN DEL PRODUCTO */}
          <div className="flex flex-col lg:sticky lg:top-24 lg:h-fit">
            <div className="mb-6">
              <span className="text-xs tracking-[0.2em] uppercase text-gray-400 font-semibold mb-3 block">
                {product.category}
              </span>
              <h1 className="font-serif text-3xl md:text-4xl text-brand-black mb-4 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3 mb-6">
                <p className="font-sans text-3xl text-brand-black font-semibold">
                  RD${product.price.toLocaleString()}
                </p>
                <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-full font-medium">
                  <Check className="w-3 h-3" />
                  Envío Gratis
                </span>
              </div>
            </div>

            {/* Descripción */}
            <div className="prose prose-sm max-w-none text-gray-600 mb-8 space-y-3">
              <p className="leading-relaxed">{product.description}</p>
              <p className="leading-relaxed text-sm">
                Esta pieza forma parte de nuestra colección exclusiva, confeccionada 
                con materiales de primera calidad pensados para el clima tropical.
              </p>
            </div>

            {/* CTA */}
            <div className="space-y-3 mb-8">
              <motion.button
                onClick={handleAddToCart}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-4 text-sm tracking-widest uppercase font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
                  isAdded 
                    ? 'bg-green-600 text-white' 
                    : 'bg-brand-black text-white hover:bg-gray-800'
                }`}
              >
                <AnimatePresence mode="wait">
                  {isAdded ? (
                    <motion.div
                      key="added"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      Agregado a la Bolsa
                    </motion.div>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Agregar a la Bolsa
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
              
              <p className="text-center text-xs text-gray-400">
                Puedes seguir agregando productos antes de confirmar tu pedido
              </p>
            </div>

            {/* Features / Beneficios */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-medium text-brand-black">Envío Gratis</p>
                  <p className="text-xs text-gray-500">Entrega en 7-10 días laborables</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <RotateCcw className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-medium text-brand-black">Devoluciones</p>
                  <p className="text-xs text-gray-500">15 días para cambios o devoluciones</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-medium text-brand-black">Compra Segura</p>
                  <p className="text-xs text-gray-500">Pago 100% seguro vía WhatsApp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}