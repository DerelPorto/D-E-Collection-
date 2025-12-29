// components/CartSidebar.tsx
"use client";

import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";

export default function CartSidebar() {
  const { isCartOpen, toggleCart, items, removeFromCart, total } = useCart();

  // Lógica Maestra: Generar mensaje de WhatsApp con TODO el pedido
  const handleCheckout = () => {
    const phoneNumber = "8098647062";

    // Construimos la lista de productos en texto
    const productList = items
      .map((item) => `- ${item.name} (x${item.quantity}) - RD$${item.price * item.quantity}`)
      .join("\n");

    const message = `Hola D&E, quiero confirmar este pedido de la web:\n\n${productList}\n\n*TOTAL: RD$${total.toLocaleString()}*\n\nQuedo atento para el pago y envío.`;

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Fondo oscuro (Backdrop) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />

          {/* El Panel Lateral */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full md:w-[400px] bg-brand-cream border-l border-brand-black/10 shadow-2xl z-[70] flex flex-col"
          >
            {/* Cabecera */}
            <div className="p-6 border-b border-brand-black/10 flex justify-between items-center bg-white">
              <h2 className="font-serif text-2xl text-brand-black flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" /> Tu Bolsa
              </h2>
              <button onClick={toggleCart} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-brand-black" />
              </button>
            </div>

            {/* Lista de Productos */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-4">
                  <ShoppingBag className="w-16 h-16 opacity-20" />
                  <p className="font-sans">Tu bolsa está vacía.</p>
                  <button onClick={toggleCart} className="text-brand-black underline font-medium">
                    Volver a la tienda
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-20 h-24 bg-gray-100 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif text-brand-black">{item.name}</h3>
                        <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-brand-black">RD${item.price.toLocaleString()}</span>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-400 hover:text-red-600 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / Checkout */}
            {items.length > 0 && (
              <div className="p-6 bg-white border-t border-brand-black/10 space-y-4">
                <div className="flex justify-between items-center text-lg font-serif">
                  <span>Subtotal</span>
                  <span>RD${total.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-400 text-center">
                  El envío y los impuestos se calculan al confirmar.
                </p>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-brand-black text-brand-cream py-4 uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors shadow-lg"
                >
                  Confirmar Pedido por WhatsApp
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}