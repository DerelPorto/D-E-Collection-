"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Check, Truck, RotateCcw, Shield, 
  Star, Heart, Share2, ChevronRight, Minus, Plus,
  Ruler, Info, ZoomIn
} from "lucide-react";
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
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [isZoomed, setIsZoomed] = useState(false);

  const sizes = ["XS", "S", "M", "L", "XL"];
  const tabs = [
    { id: "description", label: "Descripción" },
    { id: "details", label: "Detalles & Cuidados" },
    { id: "shipping", label: "Envío & Devoluciones" }
  ];

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: quantity,
    });
    
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb mejorado */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-900 transition-colors">
              Inicio
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href="/" className="text-gray-500 hover:text-gray-900 transition-colors">
              {product.category}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium truncate max-w-[200px]">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* GALERÍA - 1 de 2 columnas */}
          <div>
            <div className="sticky top-4 max-w-[500px] mx-auto">
              {/* Imagen principal con zoom */}
              <div className="relative mb-4">
                <motion.div
                  className="relative w-full aspect-[3/4] max-h-[500px] bg-gray-100 rounded-lg overflow-hidden group cursor-zoom-in"
                  onHoverStart={() => setIsZoomed(true)}
                  onHoverEnd={() => setIsZoomed(false)}
                >
                  <motion.img
                    src={mainImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    animate={{ scale: isZoomed ? 1.5 : 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                  
                  {/* Badges superiores */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    {product.tag && (
                      <span className="bg-black text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg">
                        {product.tag}
                      </span>
                    )}
                    <span className="bg-green-500 text-white text-xs px-3 py-1.5 rounded-full font-semibold flex items-center gap-1 shadow-lg">
                      <Check className="w-3 h-3" />
                      Envío Gratis
                    </span>
                  </div>

                  {/* Acciones flotantes */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsFavorite(!isFavorite)}
                      className="w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center transition-colors"
                    >
                      <Heart 
                        className={`w-5 h-5 transition-colors ${
                          isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
                        }`}
                      />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center"
                    >
                      <Share2 className="w-5 h-5 text-gray-600" />
                    </motion.button>
                  </div>

                  {/* Indicador de zoom */}
                  <AnimatePresence>
                    {isZoomed && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white text-xs px-4 py-2 rounded-full flex items-center gap-2"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                        Mueve el cursor para explorar
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Thumbnails mejorados */}
              {product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {product.images.map((img, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setMainImage(img)}
                      className={`relative w-20 h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        mainImage === img
                          ? "border-black ring-2 ring-black ring-offset-2"
                          : "border-gray-200 hover:border-gray-400 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img 
                        src={img} 
                        alt={`Vista ${index + 1}`}
                        className="w-full h-full object-cover" 
                      />
                      {mainImage === img && (
                        <div className="absolute inset-0 bg-black/10" />
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* INFORMACIÓN - 1 de 2 columnas */}
          <div>
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    {product.category}
                  </span>
                  <span className="text-xs text-gray-300">•</span>
                  <span className="text-xs text-gray-500">SKU: DE-{product.id}</span>
                </div>
                
                <h1 className="font-serif text-3xl md:text-4xl text-gray-900 mb-3 leading-tight">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="w-4 h-4 fill-yellow-400 text-yellow-400" 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    4.8 <span className="text-gray-400">(127 reseñas)</span>
                  </span>
                </div>

                {/* Precio */}
                <div className="flex items-baseline gap-3 mb-2">
                  <p className="text-4xl font-bold text-gray-900">
                    RD${product.price.toLocaleString()}
                  </p>
                  {product.tag === "sale" && (
                    <span className="text-xl text-gray-400 line-through">
                      RD${(product.price * 1.3).toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Ahorra hasta 30% en pre-orders
                </p>
              </div>

              <div className="border-t border-gray-200 my-6"></div>

              {/* Selector de Talla */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-900">
                    Talla: <span className="font-bold">{selectedSize}</span>
                  </label>
                  <button className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors underline">
                    <Ruler className="w-3.5 h-3.5" />
                    Guía de tallas
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {sizes.map(size => (
                    <motion.button
                      key={size}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 text-sm font-semibold rounded-lg border-2 transition-all ${
                        selectedSize === size
                          ? "border-black bg-black text-white shadow-md"
                          : "border-gray-200 hover:border-gray-400 text-gray-700"
                      }`}
                    >
                      {size}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Cantidad */}
              <div>
                <label className="text-sm font-semibold text-gray-900 mb-3 block">
                  Cantidad
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-gray-100 transition-colors active:bg-gray-200"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-6 font-semibold text-gray-900 min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 hover:bg-gray-100 transition-colors active:bg-gray-200"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-600">
                      Solo quedan <span className="font-bold text-orange-600">8 unidades</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-3 pt-2">
                <motion.button
                  onClick={handleAddToCart}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-4 rounded-lg text-sm font-bold tracking-wide transition-all flex items-center justify-center gap-2 ${
                    isAdded 
                      ? 'bg-green-600 text-white shadow-lg' 
                      : 'bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {isAdded ? (
                      <motion.div
                        key="added"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Check className="w-5 h-5" />
                        ¡Agregado a tu bolsa!
                      </motion.div>
                    ) : (
                      <motion.span 
                        key="add"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        Agregar a la Bolsa
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                <button className="w-full py-4 border-2 border-black text-black rounded-lg text-sm font-bold hover:bg-black hover:text-white transition-all">
                  Comprar Ahora
                </button>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-800">En stock y listo para enviar</p>
                  <p className="text-xs text-green-700">Procesa tu pedido hoy mismo</p>
                </div>
              </div>

              {/* Trust Signals */}
              <div className="bg-gray-50 rounded-lg p-5 space-y-4 border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Truck className="w-5 h-5 text-green-600" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-0.5">Envío Gratis</p>
                    <p className="text-sm text-gray-600">Entrega en 7-10 días laborables</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <RotateCcw className="w-5 h-5 text-blue-600" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-0.5">Devoluciones Gratis</p>
                    <p className="text-sm text-gray-600">15 días para cambios sin costo</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-purple-600" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-0.5">Compra Protegida</p>
                    <p className="text-sm text-gray-600">Pago 100% seguro vía WhatsApp</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABS CON INFORMACIÓN */}
        <div className="mt-16 border-t border-gray-200 pt-12">
          {/* Tab Headers */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="flex gap-8 -mb-px">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 text-sm font-semibold transition-colors relative whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-black"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl"
            >
              {activeTab === "description" && (
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 text-base leading-relaxed mb-4">
                    {product.description}
                  </p>
                  <p className="text-gray-700 text-base leading-relaxed">
                    Esta pieza forma parte de nuestra colección exclusiva, diseñada específicamente 
                    para el clima tropical del Caribe. Cada prenda es confeccionada con materiales 
                    de primera calidad que garantizan comodidad, durabilidad y un estilo atemporal 
                    que te acompañará en cualquier ocasión.
                  </p>
                </div>
              )}

              {activeTab === "details" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Info className="w-5 h-5" />
                      Características
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2 text-gray-700">
                        <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Tela transpirable ideal para clima cálido y húmedo</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700">
                        <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Corte moderno y favorecedor que estiliza la silueta</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700">
                        <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Costuras reforzadas de alta calidad y durabilidad</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700">
                        <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Resistente a múltiples lavados sin perder forma</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Cuidados</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-gray-400">•</span>
                        Lavar a máquina en agua fría (30°C)
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-400">•</span>
                        No usar blanqueador ni productos químicos fuertes
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-400">•</span>
                        Secar a temperatura baja o al aire libre
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-400">•</span>
                        Planchar a baja temperatura si es necesario
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-400">•</span>
                        No lavar en seco
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === "shipping" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Truck className="w-5 h-5" />
                      Información de Envío
                    </h3>
                    <p className="text-gray-700 mb-2">
                      Realizamos envíos a toda la República Dominicana de forma gratuita en todos los pre-orders.
                    </p>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-gray-400">•</span>
                        <span><strong>Tiempo de entrega:</strong> 7-10 días laborables</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-400">•</span>
                        <span><strong>Procesamiento:</strong> 1-2 días hábiles</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-400">•</span>
                        <span><strong>Tracking:</strong> Recibirás un código de seguimiento por WhatsApp</span>
                      </li>
                    </ul>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <RotateCcw className="w-5 h-5" />
                      Política de Devoluciones
                    </h3>
                    <p className="text-gray-700 mb-2">
                      Tienes 15 días desde la recepción del producto para realizar cambios o devoluciones sin costo adicional.
                    </p>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-gray-400">•</span>
                        <span>El producto debe estar sin usar y con etiquetas originales</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-400">•</span>
                        <span>Reembolso completo o cambio por otra talla/producto</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-400">•</span>
                        <span>Recogida gratuita en tu domicilio</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}