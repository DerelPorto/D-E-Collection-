"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, Truck, RotateCcw, Shield, 
  Star, Heart, Share2, ChevronRight, Minus, Plus,
  Ruler, Info, ZoomIn, X, ShoppingBag, ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/app/lib/supabase";

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  images: string[];
  tag?: string;
  stock?: number;
}

const NAV_LINKS = [
  { name: "Colección", href: "/shop/all" },
  { name: "Hombre", href: "/shop/hombre" },
  { name: "Mujer", href: "/shop/mujer" },
  { name: "Rebajas", href: "/shop/rebajas" },
];

export default function ProductDetailClient({ product }: { product: Product }) {
  const { addToCart, toggleCart, cartCount } = useCart();
  const [mainImage, setMainImage] = useState(product.images[0]);
  const [isAdded, setIsAdded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [isZoomed, setIsZoomed] = useState(false);
  const [adminPhone, setAdminPhone] = useState("18098647062");

  useEffect(() => {
    async function loadTenantPhone() {
      try {
        const { data } = await supabase
          .from("Tenants")
          .select("admin_phone")
          .eq("is_active", true)
          .limit(1)
          .single();
        if (data && data.admin_phone) {
          setAdminPhone(data.admin_phone.replace(/\D/g, ""));
        }
      } catch (err) {
        console.error("Error loading tenant phone:", err);
      }
    }
    loadTenantPhone();
  }, []);

  const handleBuyNow = () => {
    const productList = `- ${product.name} (x${quantity}) [Talla: ${selectedSize}] - RD$${(product.price * quantity).toLocaleString()}`;
    const payload = {
      items: [{ id: product.id, qty: quantity }]
    };
    const message = `Hola D&E, quiero comprar este artículo directamente desde la web:\n\n${productList}\n\n*TOTAL: RD$${(product.price * quantity).toLocaleString()}*\n\nQuedo atento para coordinar el pago y envío.\n\n[ORDEN_WEB:${JSON.stringify(payload)}]`;
    const url = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

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
    <div className="min-h-screen relative overflow-hidden" style={{ background: "var(--bg-primary)", color: "var(--white)" }}>
      {/* Glow ambiental */}
      <div className="bg-glow" />

      {/* ═══ MENÚ DE NAVEGACIÓN PREMIUM ════════════════════════════════════════ */}
      <nav 
        className="fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300"
        style={{
          background: "rgba(8,8,15,0.85)",
          backdropFilter: "blur(24px)",
          borderColor: "rgba(201,168,76,0.12)"
        }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 group">
              <div className="flex items-baseline gap-0.5">
                <span className="font-serif text-2xl font-light tracking-wider text-white">
                  D&E
                </span>
                <span className="font-sans text-[9px] tracking-luxury ml-2 mb-1" style={{ color: "var(--gold)" }}>
                  COLLECTION
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden items-center gap-8 md:flex">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="relative font-sans text-xs uppercase tracking-luxury group text-white-60"
                  style={{ color: "var(--white-60)" }}
                >
                  <span className="transition-colors duration-300 hover:text-white">
                    {item.name}
                  </span>
                  <span
                    className="absolute -bottom-1 left-0 h-px w-0 group-hover:w-full transition-all duration-300"
                    style={{ background: "var(--gold)" }}
                  />
                </Link>
              ))}
            </div>

            {/* Botón Carrito */}
            <div className="flex items-center gap-5">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleCart}
                className="relative p-2.5 rounded-full border border-white/5 bg-white/5 text-white/80 hover:text-white hover:border-gold/30 hover:bg-gold/5 transition-all duration-300"
              >
                <ShoppingBag className="h-4.5 w-4.5" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full text-[9px] font-bold text-neutral-950"
                    style={{ background: "var(--gold)" }}
                  >
                    {cartCount}
                  </motion.span>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenedor Principal (pt-28 para espaciar el nav fijo) */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-20 relative z-10">
        
        {/* Breadcrumb premium */}
        <div className="mb-8 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-white-60">
            <Link href="/" className="hover:text-white transition-colors">
              Inicio
            </Link>
            <ChevronRight className="w-3.5 h-3.5" style={{ color: "var(--gold)" }} />
            <Link href={`/shop/${product.category.toLowerCase()}`} className="hover:text-white transition-colors">
              {product.category}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" style={{ color: "var(--gold)" }} />
            <span className="font-semibold text-white truncate max-w-[150px]">
              {product.name}
            </span>
          </nav>

          <Link href="/shop/all" className="text-xs uppercase tracking-luxury flex items-center gap-1.5 hover:text-white transition-colors text-white-60">
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver a la Tienda
          </Link>
        </div>

        {/* Retícula del detalle */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* GALERÍA - 5/12 columnas */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="sticky top-28 w-full max-w-[450px]">
              {/* Contenedor Imagen Principal con marco de lujo */}
              <div className="relative mb-5 rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-2xl group">
                <motion.div
                  className="relative w-full aspect-[3/4] cursor-zoom-in overflow-hidden"
                  onHoverStart={() => setIsZoomed(true)}
                  onHoverEnd={() => setIsZoomed(false)}
                >
                  <motion.img
                    src={mainImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    animate={{ scale: isZoomed ? 1.4 : 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                  
                  {/* Badges superiores */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    {product.tag && (
                      <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-950 text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full shadow-lg shadow-amber-500/10">
                        {product.tag}
                      </span>
                    )}
                    <span className="glass bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                      <Check className="w-3 h-3 text-emerald-400" />
                      Envío Gratis
                    </span>
                  </div>

                  {/* Acciones flotantes premium (glassmorphism) */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2.5 z-10">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsFavorite(!isFavorite)}
                      className="w-10 h-10 glass rounded-full flex items-center justify-center hover:border-gold/40 hover:text-gold transition-all duration-300"
                    >
                      <Heart 
                        className={`w-4.5 h-4.5 transition-colors ${
                          isFavorite ? 'fill-red-500 text-red-500' : 'text-white/80'
                        }`}
                      />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-10 h-10 glass rounded-full flex items-center justify-center hover:border-gold/40 hover:text-gold transition-all duration-300"
                    >
                      <Share2 className="w-4.5 h-4.5 text-white/80" />
                    </motion.button>
                  </div>

                  {/* Indicador de zoom */}
                  <AnimatePresence>
                    {isZoomed && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white/85 text-[10px] uppercase tracking-luxury px-4 py-2 rounded-full border border-white/5 flex items-center gap-2"
                      >
                        <ZoomIn className="w-3.5 h-3.5" style={{ color: "var(--gold)" }} />
                        Explorar Detalles
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Miniaturas */}
              {product.images.length > 1 && (
                <div className="flex gap-3 justify-center overflow-x-auto pb-2 scrollbar-hide">
                  {product.images.map((img, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setMainImage(img)}
                      className={`relative w-16 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        mainImage === img
                          ? "borderColor: var(--gold) border-[#c9a84c] ring-2 ring-[#c9a84c]/20"
                          : "border-white/5 hover:border-white/20 opacity-50 hover:opacity-100 bg-[#0f0f1a]"
                      }`}
                      style={{
                        borderColor: mainImage === img ? "var(--gold)" : "rgba(255,255,255,0.05)"
                      }}
                    >
                      <img 
                        src={img} 
                        alt={`Vista ${index + 1}`}
                        className="w-full h-full object-cover" 
                      />
                      {mainImage === img && (
                        <div className="absolute inset-0 bg-[#c9a84c]/10" />
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* INFORMACIÓN - 7/12 columnas */}
          <div className="lg:col-span-7 flex flex-col justify-start">
            <div className="space-y-7 max-w-2xl">
              
              {/* Categoría, SKU y Título */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-xs uppercase tracking-luxury font-bold" style={{ color: "var(--gold)" }}>
                    {product.category}
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="text-xs text-white-400 font-mono tracking-wider" style={{ color: "var(--white-60)" }}>
                    SKU: DE-{product.id}
                  </span>
                </div>
                
                <h1 className="font-serif text-3.5xl md:text-5xl text-white mb-4 leading-tight tracking-wide font-light">
                  {product.name}
                </h1>

                {/* Reseñas */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="w-3.5 h-3.5 fill-[#c9a84c] text-[#c9a84c]" 
                      />
                    ))}
                  </div>
                  <span className="text-xs text-white-60" style={{ color: "var(--white-60)" }}>
                    <strong className="text-white">4.8</strong> (127 reseñas verificadas)
                  </span>
                </div>
              </div>

              {/* Bloque Precio y Oferta */}
              <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-3">
                    <p className="text-3.5xl font-bold text-white font-mono">
                      RD${product.price.toLocaleString()}
                    </p>
                    {product.tag === "sale" && (
                      <span className="text-lg text-white-30 line-through font-mono" style={{ color: "var(--white-30)" }}>
                        RD${(product.price * 1.3).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Disponible para envío express
                  </p>
                </div>
                
                <div className="glass px-3.5 py-2 rounded-xl text-right">
                  <span className="text-[10px] uppercase tracking-luxury block text-white-60" style={{ color: "var(--white-60)" }}>
                    Beneficio Pre-Order
                  </span>
                  <span className="text-xs font-bold text-gold" style={{ color: "var(--gold)" }}>
                    Ahorra hasta 30%
                  </span>
                </div>
              </div>

              <div className="divider-gold"></div>

              {/* Selector de Talla */}
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <label className="text-xs uppercase tracking-luxury font-bold text-white-60" style={{ color: "var(--white-60)" }}>
                    Seleccione Talla: <span className="text-white font-bold ml-1">{selectedSize}</span>
                  </label>
                  <button className="text-xs text-gold hover:text-white flex items-center gap-1 transition-colors underline" style={{ color: "var(--gold)" }}>
                    <Ruler className="w-3.5 h-3.5" />
                    Guía de tallas
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {sizes.map(size => (
                    <motion.button
                      key={size}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedSize(size)}
                      className="py-3 text-xs font-bold rounded-lg border transition-all duration-300"
                      style={{
                        background: selectedSize === size ? "var(--grad-gold)" : "rgba(255,255,255,0.03)",
                        borderColor: selectedSize === size ? "transparent" : "rgba(255,255,255,0.08)",
                        color: selectedSize === size ? "var(--bg-primary)" : "var(--white-60)",
                        boxShadow: selectedSize === size ? "var(--shadow-gold)" : "none"
                      }}
                    >
                      {size}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Cantidad y Stock Status */}
              <div>
                <label className="text-xs uppercase tracking-luxury font-bold text-white-60 mb-3 block" style={{ color: "var(--white-60)" }}>
                  Cantidad
                </label>
                <div className="flex flex-wrap items-center gap-5">
                  {/* Selector Capsule */}
                  <div className="flex items-center border border-white/10 rounded-full bg-white/5 overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={product.stock === 0}
                      className="p-2.5 px-4 text-white/60 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-20"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-5 font-mono font-bold text-sm text-white min-w-[2.5rem] text-center">
                      {product.stock === 0 ? 0 : quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={product.stock === 0 || (product.stock !== undefined && quantity >= product.stock)}
                      className="p-2.5 px-4 text-white/60 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-20"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Estado Stock Badge */}
                  <div>
                    {product.stock === 0 ? (
                      <span className="glass bg-rose-500/5 text-rose-400 border border-rose-500/20 px-4 py-2 rounded-full text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                        Agotado
                      </span>
                    ) : product.stock !== undefined && product.stock <= 5 ? (
                      <span className="glass bg-orange-500/5 text-orange-400 border border-orange-500/20 px-4 py-2 rounded-full text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5 animate-pulse">
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                        ¡Solo quedan {product.stock} unidades!
                      </span>
                    ) : (
                      <span className="glass bg-emerald-500/5 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-full text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                        Disponible en stock
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botones de Acción (CTAs de Lujo) */}
              <div className="space-y-3.5 pt-4">
                <motion.button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  whileTap={product.stock === 0 ? {} : { scale: 0.98 }}
                  className="w-full py-4 rounded-lg text-xs font-bold tracking-luxury uppercase transition-all duration-300 flex items-center justify-center gap-2 border border-transparent shadow-lg"
                  style={{
                    background: product.stock === 0 ? "rgba(255,255,255,0.05)" : isAdded ? "var(--grad-gold)" : "var(--grad-gold)",
                    color: product.stock === 0 ? "var(--white-30)" : "var(--bg-primary)",
                    boxShadow: product.stock === 0 ? "none" : "var(--shadow-gold)",
                    opacity: product.stock === 0 ? 0.5 : 1,
                    cursor: product.stock === 0 ? "not-allowed" : "pointer"
                  }}
                >
                  <AnimatePresence mode="wait">
                    {product.stock === 0 ? (
                      <span key="outofstock">Sin Existencias</span>
                    ) : isAdded ? (
                      <motion.div
                        key="added"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Check className="w-4 h-4 text-neutral-950 stroke-[3]" />
                        ¡Agregado a la Bolsa!
                      </motion.div>
                    ) : (
                      <motion.span 
                        key="add"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Agregar a la Bolsa
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                <motion.button 
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  whileHover={product.stock === 0 ? {} : { scale: 1.01 }}
                  whileTap={product.stock === 0 ? {} : { scale: 0.98 }}
                  className="w-full py-4 border rounded-lg text-xs font-bold tracking-luxury uppercase transition-all duration-300 flex items-center justify-center gap-2"
                  style={{
                    borderColor: product.stock === 0 ? "rgba(255,255,255,0.05)" : "var(--gold)",
                    background: "transparent",
                    color: product.stock === 0 ? "var(--white-30)" : "var(--gold)",
                    opacity: product.stock === 0 ? 0.5 : 1,
                    cursor: product.stock === 0 ? "not-allowed" : "pointer"
                  }}
                  onMouseEnter={e => {
                    if (product.stock !== 0) {
                      e.currentTarget.style.background = "var(--gold-dim)";
                      e.currentTarget.style.color = "var(--white)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (product.stock !== 0) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--gold)";
                    }
                  }}
                >
                  Comprar Ahora por WhatsApp
                </motion.button>
              </div>

              {/* Alert status box */}
              {product.stock !== 0 && (
                <div className="flex items-center gap-3 bg-emerald-950/15 border border-emerald-500/20 rounded-xl p-4">
                  <div className="w-9 h-9 bg-emerald-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Listo para despachar</p>
                    <p className="text-xs text-white-60" style={{ color: "var(--white-60)" }}>Procesamiento express con J.A.R.V.I.S y entrega garantizada.</p>
                  </div>
                </div>
              )}

              {/* Trust Signals (Garantías) */}
              <div className="glass p-5 rounded-2xl border border-white/5 space-y-4 bg-gradient-to-b from-white/[0.01] to-transparent">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(201,168,76,0.1)", color: "var(--gold)" }}>
                    <Truck className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-xs uppercase tracking-luxury mb-0.5">Envío Sin Costo</p>
                    <p className="text-xs text-white-60" style={{ color: "var(--white-60)" }}>Entrega preferente en toda Rep. Dominicana en 7-10 días.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(201,168,76,0.1)", color: "var(--gold)" }}>
                    <RotateCcw className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-xs uppercase tracking-luxury mb-0.5">Devolución Asegurada</p>
                    <p className="text-xs text-white-60" style={{ color: "var(--white-60)" }}>Garantía de cambio sin cargos dentro de los primeros 15 días.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(201,168,76,0.1)", color: "var(--gold)" }}>
                    <Shield className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-xs uppercase tracking-luxury mb-0.5 font-bold">Transacción Protegida</p>
                    <p className="text-xs text-white-60" style={{ color: "var(--white-60)" }}>Coordinación y pago 100% verificado y seguro a través de WhatsApp.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* PESTAÑAS DETALLES TÉCNICOS */}
        <div className="mt-20 border-t border-white/5 pt-16">
          {/* Cabecera Pestañas */}
          <div className="border-b border-white/5 mb-10">
            <nav className="flex gap-8 -mb-px">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="pb-4 text-xs uppercase tracking-luxury font-bold transition-colors relative whitespace-nowrap"
                  style={{
                    color: activeTab === tab.id ? "var(--gold)" : "var(--white-60)"
                  }}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabDetails"
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ background: "var(--gold)" }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Contenido Pestañas */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="max-w-4xl text-sm"
              style={{ color: "var(--white-60)" }}
            >
              {activeTab === "description" && (
                <div className="space-y-4 leading-relaxed font-light">
                  <p className="text-white/80 text-base">
                    {product.description}
                  </p>
                  <p>
                    Esta pieza forma parte de nuestra colección de alta costura, concebida bajo los 
                    más altos estándares de diseño contemporáneo y comodidad sofisticada. Su corte y textura 
                    se fusionan para moldear un estilo distinguido y elegante en cualquier tipo de ocasión.
                  </p>
                </div>
              )}

              {activeTab === "details" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <h3 className="font-semibold text-white text-xs uppercase tracking-luxury mb-5 flex items-center gap-2">
                      <Info className="w-4 h-4 text-gold" style={{ color: "var(--gold)" }} />
                      Características Clave
                    </h3>
                    <ul className="space-y-3.5">
                      <li className="flex items-start gap-2.5 text-white/85">
                        <Check className="w-4.5 h-4.5 text-gold mt-0.5 flex-shrink-0" style={{ color: "var(--gold)" }} />
                        <span>Tejido premium transpirable de fibra fina natural</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-white/85">
                        <Check className="w-4.5 h-4.5 text-gold mt-0.5 flex-shrink-0" style={{ color: "var(--gold)" }} />
                        <span>Ajuste anatómico de precisión para caída elegante</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-white/85">
                        <Check className="w-4.5 h-4.5 text-gold mt-0.5 flex-shrink-0" style={{ color: "var(--gold)" }} />
                        <span>Acabados y costuras invisibles reforzadas</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-xs uppercase tracking-luxury mb-5">Instrucciones de Cuidado</h3>
                    <ul className="space-y-2.5">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gold rounded-full" style={{ background: "var(--gold)" }}></span>
                        Lavar a máquina a mano o programa delicado (30°C)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gold rounded-full" style={{ background: "var(--gold)" }}></span>
                        Evitar lejías y detergentes abrasivos
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gold rounded-full" style={{ background: "var(--gold)" }}></span>
                        Planchar del revés a baja temperatura
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === "shipping" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <h3 className="font-semibold text-white text-xs uppercase tracking-luxury mb-4 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-gold" style={{ color: "var(--gold)" }} />
                      Envíos de Pedidos
                    </h3>
                    <p className="mb-4">
                      Realizamos distribución directa y certificada a todo el territorio nacional sin coste adicional.
                    </p>
                    <ul className="space-y-2 font-mono text-xs">
                      <li>• PROCESAMIENTO: 24-48 horas laborables</li>
                      <li>• TIEMPO DE ENTREGA: 7-10 días hábiles</li>
                      <li>• SEGUIMIENTO: Notificación en tiempo real por WhatsApp</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white text-xs uppercase tracking-luxury mb-4 flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-gold" style={{ color: "var(--gold)" }} />
                      Cambios & Devoluciones
                    </h3>
                    <p className="mb-3">
                      Si el tallaje no es el correcto, dispones de una ventana de 15 días naturales para coordinar una devolución gratuita.
                    </p>
                    <ul className="space-y-2">
                      <li>• El artículo debe conservar sellos y empaque original.</li>
                      <li>• Coordinación automatizada a través de J.A.R.V.I.S.</li>
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