// components/CartSidebar.tsx
"use client";

import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ShoppingBag, Plus, Minus } from "lucide-react";

export default function CartSidebar() {
  const { isCartOpen, toggleCart, items, removeFromCart, updateQuantity, total } = useCart();

  // Comprobar si hay artículos inválidos en el carrito (no disponibles o superan stock real)
  const hasInvalidItems = items.some(
    (item) =>
      item.isAvailable === false ||
      (item.availableStock !== undefined && item.availableStock === 0) ||
      (item.availableStock !== undefined && item.quantity > item.availableStock)
  );

  const handleCheckout = () => {
    if (hasInvalidItems) return;
    const phoneNumber = "18098647062";
    // Excluir artículos no disponibles o sin stock del mensaje de pedido por seguridad
    const validItems = items.filter(
      (item) =>
        item.isAvailable !== false &&
        (item.availableStock === undefined || item.availableStock > 0)
    );

    const productList = validItems
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
                      className={`flex gap-4 p-4 rounded-lg transition-colors bg-gray-50 hover:bg-gray-100 ${
                        item.isAvailable === false ? "opacity-60 border border-red-100" : ""
                      }`}
                    >
                      {/* Imagen más pequeña y con aspect ratio correcto */}
                      <div className="relative w-20 h-28 bg-white rounded overflow-hidden flex-shrink-0 shadow-sm">
                        <img
                          src={item.image}
                          alt={item.name}
                          className={`w-full h-full object-cover ${
                            item.isAvailable === false ? "grayscale opacity-50" : ""
                          }`}
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <h3 className={`font-serif text-base mb-1 truncate ${item.isAvailable === false ? 'text-gray-400' : 'text-brand-black'}`}>
                            {item.name}
                          </h3>
                          <div className="flex flex-col gap-1">
                            <p className={`text-sm font-medium ${item.isAvailable === false ? 'text-gray-400 line-through' : 'text-brand-black'}`}>
                              RD${item.price.toLocaleString()}
                            </p>
                            {item.isAvailable === false ? (
                              <span className="inline-flex items-center text-[10px] font-bold text-red-500 uppercase tracking-wider">
                                ⚠️ No disponible
                              </span>
                            ) : item.availableStock !== undefined && item.availableStock === 0 ? (
                              <span className="inline-flex items-center text-[10px] font-bold text-red-500 uppercase tracking-wider">
                                ⚠️ Agotado
                              </span>
                            ) : item.availableStock !== undefined && item.quantity > item.availableStock ? (
                              <span className="inline-flex items-center text-[10px] font-semibold text-amber-600 uppercase tracking-wider">
                                ⚠️ Límite stock: {item.availableStock} ud.
                              </span>
                            ) : null}
                          </div>
                        </div>

                        {/* Controles de cantidad */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              disabled={item.isAvailable === false}
                              className={`p-1.5 transition-colors ${
                                item.isAvailable === false ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"
                              }`}
                              aria-label="Disminuir cantidad"
                            >
                              <Minus className="w-3.5 h-3.5 text-gray-600" />
                            </button>
                            <span className={`text-sm font-medium min-w-[24px] text-center ${item.isAvailable === false ? "opacity-40" : ""}`}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={
                                item.isAvailable === false ||
                                (item.availableStock !== undefined && item.quantity >= item.availableStock)
                              }
                              className={`p-1.5 transition-colors ${
                                item.isAvailable === false ||
                                (item.availableStock !== undefined && item.quantity >= item.availableStock)
                                  ? "opacity-40 cursor-not-allowed"
                                  : "hover:bg-gray-100"
                              }`}
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

                {/* Alerta de productos no disponibles */}
                {hasInvalidItems && (
                  <div className="p-3 mb-2 rounded bg-red-50 border border-red-200 text-red-700 text-xs flex flex-col gap-1">
                    <span className="font-bold flex items-center gap-1">⚠️ Bolsa no válida</span>
                    <span>Algunos artículos de tu bolsa ya no están disponibles o superan el stock real. Por favor, elimínalos o reduce sus unidades.</span>
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={hasInvalidItems}
                  className={`w-full py-4 uppercase tracking-widest text-sm font-medium transition-all shadow-lg border-2 active:scale-[0.98] ${
                    hasInvalidItems
                      ? "bg-gray-200 border-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                      : "bg-brand-black text-black border-black hover:bg-gray-400 hover:border-brand-black hover:shadow-xl"
                  }`}
                >
                  Confirmar Pedido
                </button>

                <button
                  onClick={toggleCart}
                  className="w-full border-2 border-gray-300 text-gray-700 py-3 uppercase tracking-wider text-sm font-medium hover:bg-gray-100 transition-colors hover:border-brand-black hover:text-brand-black"
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