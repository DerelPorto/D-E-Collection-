"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Menu, X, AlertCircle, ChevronDown, Sparkles, ArrowRight } from "lucide-react";
import { ProductCard } from "@/app/components/ProductCard";
import { LiveBadge } from "@/app/components/ui/LiveBadge";
import { JarvisToast } from "@/app/components/ui/JarvisToast";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/app/hooks/useProducts";
import Link from "next/link";

const NAV_LINKS = [
  { name: "Colección", href: "/shop/all" },
  { name: "Hombre", href: "/shop/hombre" },
  { name: "Mujer", href: "/shop/mujer" },
  { name: "Rebajas", href: "/shop/rebajas" },
];

const CATEGORIES = ["Todos", "Hombre", "Mujer", "Relojes", "Accesorios"];

/** Skeleton de carga premium */
function ProductSkeleton() {
  return (
    <div className="group relative overflow-hidden rounded-sm" style={{ background: "var(--bg-card)" }}>
      <div className="skeleton aspect-[3/4] w-full" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-2 rounded w-1/3" />
        <div className="skeleton h-4 rounded w-3/4" />
        <div className="skeleton h-3 rounded w-1/4" />
      </div>
    </div>
  );
}

/** Contador de números animado */
function CountUp({ end, label }: { end: number; label: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const step = end / 60;
    const timer = setInterval(() => {
      setCount(c => {
        if (c + step >= end) { clearInterval(timer); return end; }
        return c + step;
      });
    }, 16);
    return () => clearInterval(timer);
  }, [end]);

  return (
    <div className="text-center">
      <div className="font-serif text-3xl md:text-4xl" style={{ color: "var(--gold)" }}>
        {Math.floor(count)}+
      </div>
      <div className="font-sans text-xs tracking-luxury mt-1" style={{ color: "var(--white-60)" }}>
        {label}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [searchOpen, setSearchOpen] = useState(false);
  const { scrollY } = useScroll();
  const { toggleCart, cartCount } = useCart();
  const { products, isLoading, error, isLive, lastEvent } = useProducts();
  const heroRef = useRef<HTMLElement>(null);

  // Parallax del hero
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroY = useTransform(scrollY, [0, 400], [0, 80]);
  const heroTextY = useTransform(scrollY, [0, 300], [0, -60]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredProducts = activeCategory === "Todos"
    ? products
    : products.filter(p => p.category?.toLowerCase().includes(activeCategory.toLowerCase()));

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>

      {/* Ambient glow background */}
      <div className="bg-glow" />

      {/* Toast J.A.R.V.I.S. */}
      <JarvisToast event={lastEvent} />

      {/* ═══ NAVIGATION ═══════════════════════════════════════════════════ */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? "rgba(8,8,15,0.85)" : "transparent",
          backdropFilter: scrolled ? "blur(24px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(201,168,76,0.12)" : "none",
        }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">

            {/* Logo */}
            <Link href="/" className="flex-shrink-0 group">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-baseline gap-0.5"
              >
                <span
                  className="font-serif text-2xl font-light tracking-wider"
                  style={{ color: "var(--white)" }}
                >
                  D&E
                </span>
                <span
                  className="font-sans text-[9px] tracking-luxury ml-2 mb-1"
                  style={{ color: "var(--gold)" }}
                >
                  COLLECTION
                </span>
              </motion.div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden items-center gap-8 md:flex">
              {NAV_LINKS.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i + 0.3 }}
                >
                  <Link
                    href={item.href}
                    className="relative font-sans text-sm tracking-wide group"
                    style={{ color: "var(--white-60)" }}
                  >
                    <span className="transition-colors duration-300 hover:text-white group-hover:text-white">
                      {item.name}
                    </span>
                    {/* Underline dorada */}
                    <span
                      className="absolute -bottom-1 left-0 h-px w-0 group-hover:w-full transition-all duration-300"
                      style={{ background: "var(--gold)" }}
                    />
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-5">
              {/* Search */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSearchOpen(s => !s)}
                className="transition-colors duration-200"
                style={{ color: "var(--white-60)" }}
              >
                <Search className="h-5 w-5 hover:text-white transition-colors" />
              </motion.button>

              {/* Cart */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleCart}
                className="relative transition-colors duration-200"
                style={{ color: "var(--white-60)" }}
              >
                <ShoppingBag className="h-5 w-5 hover:text-white transition-colors" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-2 -right-2 text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold"
                      style={{ background: "var(--gold)", color: "var(--bg-primary)" }}
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Live badge */}
              <div className="hidden md:block">
                <LiveBadge isLive={isLive} />
              </div>

              {/* Mobile menu button */}
              <button
                className="md:hidden transition-colors"
                style={{ color: "var(--white-60)" }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Search bar expandible */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden glass border-t"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="mx-auto max-w-2xl px-6 py-4">
                <input
                  autoFocus
                  placeholder="Buscar en la colección..."
                  className="w-full bg-transparent font-sans text-base outline-none placeholder:text-white/30"
                  style={{ color: "var(--white)" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass border-t md:hidden"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="space-y-1 px-6 py-6">
                {NAV_LINKS.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block font-sans text-base py-2 transition-colors"
                    style={{ color: "var(--white-60)" }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ═══ HERO SECTION ═══════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative h-screen overflow-hidden flex items-center justify-center">

        {/* Imagen con parallax */}
        <motion.div
          style={{ y: heroY, scale: 1.08 }}
          className="absolute inset-0"
        >
          <img
            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1974&fit=crop"
            alt="D&E Collection — Luxury Fashion"
            className="h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ background: "var(--grad-hero)" }}
          />
        </motion.div>

        {/* Decorative lines */}
        <div
          className="absolute left-8 top-1/2 -translate-y-1/2 w-px h-40 hidden lg:block animate-fade-in delay-700"
          style={{ background: "linear-gradient(to bottom, transparent, var(--gold), transparent)", opacity: 0.5 }}
        />
        <div
          className="absolute right-8 top-1/2 -translate-y-1/2 w-px h-40 hidden lg:block animate-fade-in delay-700"
          style={{ background: "linear-gradient(to bottom, transparent, var(--gold), transparent)", opacity: 0.5 }}
        />

        {/* Hero content */}
        <motion.div
          style={{ y: heroTextY, opacity: heroOpacity }}
          className="relative z-10 flex flex-col items-center text-center px-6"
        >
          {/* Pre-title badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="flex items-center gap-2 mb-6 glass-gold px-4 py-1.5 rounded-full"
          >
            <Sparkles className="h-3 w-3" style={{ color: "var(--gold)" }} />
            <span
              className="font-sans text-[10px] tracking-luxury uppercase"
              style={{ color: "var(--gold)" }}
            >
              Nueva Colección 2026
            </span>
          </motion.div>

          {/* Main title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.9 }}
            className="font-serif font-light tracking-ultra mb-3"
            style={{ color: "var(--white)", fontSize: "clamp(3rem, 8vw, 7rem)", lineHeight: 1.05 }}
          >
            D&E
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.7 }}
            className="font-sans text-sm md:text-base tracking-ultra uppercase mb-3"
            style={{ color: "var(--gold)", letterSpacing: "0.6em" }}
          >
            Collection
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.7 }}
            className="font-serif italic text-lg md:text-2xl mb-10 font-light"
            style={{ color: "var(--white-60)" }}
          >
            Elegancia Atemporal
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05, duration: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 items-center"
          >
            <Link
              href="/shop/all"
              className="group flex items-center gap-3 px-8 py-3.5 font-sans text-xs tracking-luxury uppercase transition-all duration-300 glow-hover"
              style={{
                background: "var(--gold)",
                color: "var(--bg-primary)",
              }}
            >
              <span>Explorar Colección</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/shop/all"
              className="flex items-center gap-3 px-8 py-3.5 font-sans text-xs tracking-luxury uppercase transition-all duration-300"
              style={{
                border: "1px solid rgba(201,168,76,0.5)",
                color: "var(--white-60)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--gold)";
                (e.currentTarget as HTMLElement).style.color = "var(--gold)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.5)";
                (e.currentTarget as HTMLElement).style.color = "var(--white-60)";
              }}
            >
              <span>Ver Lookbook</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float"
        >
          <span
            className="font-sans text-[9px] tracking-luxury uppercase"
            style={{ color: "var(--white-30)" }}
          >
            Scroll
          </span>
          <ChevronDown className="h-4 w-4" style={{ color: "var(--white-30)" }} />
        </motion.div>
      </section>

      {/* ═══ STATS BAR ═══════════════════════════════════════════════════════ */}
      <section
        className="py-12 border-y"
        style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
      >
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid grid-cols-3 gap-8 divide-x"
            style={{ borderColor: "var(--border)" }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <CountUp end={200} label="Productos" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <CountUp end={1500} label="Clientes" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <CountUp end={98} label="% Satisfacción" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ PRODUCTS SECTION ═══════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-16 text-center"
        >
          <p
            className="font-sans text-[10px] tracking-luxury uppercase mb-3"
            style={{ color: "var(--gold)" }}
          >
            Catálogo Exclusivo
          </p>
          <h2
            className="font-serif text-4xl md:text-6xl font-light mb-4"
            style={{ color: "var(--white)" }}
          >
            Nueva Colección
          </h2>
          <div className="divider-gold mx-auto w-24 mb-4" />
          <p className="font-sans text-sm" style={{ color: "var(--white-60)" }}>
            Cada pieza, una obra maestra de la elegancia contemporánea
          </p>
        </motion.div>

        {/* Category filters */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-14">
          {CATEGORIES.map(cat => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveCategory(cat)}
              className="font-sans text-xs tracking-wide px-5 py-2 transition-all duration-300"
              style={{
                background: activeCategory === cat ? "var(--gold)" : "transparent",
                color: activeCategory === cat ? "var(--bg-primary)" : "var(--white-60)",
                border: activeCategory === cat ? "1px solid var(--gold)" : "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Error state */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-3 py-12 rounded-sm"
            style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <p className="font-sans text-sm text-red-400">
              No se pudo cargar el catálogo. {error}
            </p>
          </motion.div>
        )}

        {/* Product grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
            : filteredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <ProductCard
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  image={product.image}
                  category={product.category}
                  tag={product.tag}
                />
              </motion.div>
            ))}
        </div>

        {/* Empty state */}
        {!isLoading && !error && products.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-6 animate-pulse-gold"
              style={{ background: "var(--gold-dim)", border: "1px solid rgba(201,168,76,0.3)" }}
            >
              <Sparkles className="h-6 w-6" style={{ color: "var(--gold)" }} />
            </div>
            <p
              className="font-serif text-2xl font-light mb-2"
              style={{ color: "rgba(248,246,242,0.3)" }}
            >
              El catálogo está en preparación
            </p>
            <p className="font-sans text-sm" style={{ color: "rgba(248,246,242,0.2)" }}>
              J.A.R.V.I.S. pronto publicará los primeros artículos.
            </p>
          </motion.div>
        )}
      </section>

      {/* ═══ BRAND STATEMENT ════════════════════════════════════════════════ */}
      <section
        className="py-24 border-t"
        style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
      >
        <div className="mx-auto max-w-3xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p
              className="font-sans text-[10px] tracking-luxury uppercase mb-6"
              style={{ color: "var(--gold)" }}
            >
              Nuestra Filosofía
            </p>
            <blockquote
              className="font-serif text-2xl md:text-3xl font-light italic leading-relaxed mb-8"
              style={{ color: "var(--white-60)" }}
            >
              "La verdadera elegancia no se muestra, se&nbsp;
              <span style={{ color: "var(--white)" }}>percibe.</span>"
            </blockquote>
            <div className="divider-gold mx-auto w-16" />
          </motion.div>
        </div>
      </section>

      {/* ═══ FOOTER ════════════════════════════════════════════════════════ */}
      <footer
        className="py-10 border-t"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-baseline gap-2">
              <span
                className="font-serif text-lg font-light tracking-wider"
                style={{ color: "var(--white)" }}
              >
                D&E
              </span>
              <span
                className="font-sans text-[8px] tracking-luxury"
                style={{ color: "var(--gold)" }}
              >
                COLLECTION
              </span>
            </div>

            {/* Copyright */}
            <p className="font-sans text-[11px]" style={{ color: "var(--white-30)" }}>
              © 2026 D&E Collection · Santo Domingo, República Dominicana
            </p>

            {/* Social links */}
            <div className="flex items-center gap-6">
              {["Instagram", "WhatsApp", "TikTok"].map(s => (
                <span
                  key={s}
                  className="font-sans text-[11px] tracking-wide cursor-pointer transition-colors hover:text-white"
                  style={{ color: "var(--white-30)" }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}