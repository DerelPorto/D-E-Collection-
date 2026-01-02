// components/CartSidebar.tsx
"use client";

import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ShoppingBag, Plus, Minus } from "lucide-react";

export default function CartSidebar() {
  const { isCartOpen, toggleCart, items, removeFromCart, updateQuantity, total } = useCart();

  const handleCheckout = () => {
    const phoneNumber = "8098647062";
    const productList = items
      .map((item) => `- ${item.name} (x${item.quantity}) - RD$${(item.price * item.quantity).toLocaleString()}`)
      .join("\n");

    const message = `Hola D&E, quiero confirmar este pedido de la web:\n\n${productList}\n\n*TOTAL: RD$${total.toLocaleString()}*\n\nQuedo atento para el pago y envío.`;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          />

          {/* Panel Lateral */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[440px] bg-white shadow-2xl z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="font-serif text-2xl text-brand-black flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6" strokeWidth={1.5} />
                  Tu Bolsa
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {items.length} {items.length === 1 ? 'artículo' : 'artículos'}
                </p>
              </div>
              <button
                onClick={toggleCart}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Cerrar carrito"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Lista de Productos */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-gray-300" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-serif text-xl text-gray-900 mb-2">Tu bolsa está vacía</p>
                    <p className="text-sm text-gray-500">Agrega productos para comenzar tu orden</p>
                  </div>
                  <button
                    onClick={toggleCart}
                    className="mt-4 px-6 py-2 bg-brand-black text-white text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors"
                  >
                    Explorar productos
                  </button>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      className="flex gap-4 bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {/* Imagen más pequeña y con aspect ratio correcto */}
                      <div className="relative w-20 h-28 bg-white rounded overflow-hidden flex-shrink-0 shadow-sm">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <h3 className="font-serif text-brand-black text-base mb-1 truncate">
                            {item.name}
                          </h3>
                          <p className="text-sm font-medium text-brand-black">
                            RD${item.price.toLocaleString()}
                          </p>
                        </div>

                        {/* Controles de cantidad */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="p-1.5 hover:bg-gray-100 transition-colors"
                              aria-label="Disminuir cantidad"
                            >
                              <Minus className="w-3.5 h-3.5 text-gray-600" />
                            </button>
                            <span className="text-sm font-medium min-w-[24px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1.5 hover:bg-gray-100 transition-colors"
                              aria-label="Aumentar cantidad"
                            >
                              <Plus className="w-3.5 h-3.5 text-gray-600" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded"
                            aria-label="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer / Checkout */}
            {items.length > 0 && (
              <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="p-6 bg-gray-50 border-t border-gray-200 space-y-4"
              >
                {/* Resumen */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>RD${total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-700 font-medium">
                    <span>Envío</span>
                    <span>Gratis</span>
                  </div>
                  <div className="h-px bg-gray-200 my-3"></div>
                  <div className="flex justify-between items-center text-lg font-serif">
                    <span className="text-brand-black">Total</span>
                    <span className="text-brand-black font-semibold">
                      RD${total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-400 text-center">
                  Los impuestos se calculan al confirmar la orden
                </p>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-brand-black text-white py-4 uppercase tracking-widest text-sm font-medium hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                >
                  Confirmar Pedido
                </button>

                <button
                  onClick={toggleCart}
                  className="w-full border-2 border-gray-300 text-gray-700 py-3 uppercase tracking-wider text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Continuar Comprando
                </button>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}