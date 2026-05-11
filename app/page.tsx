"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Search, ShoppingBag, Menu, X, AlertCircle } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { ProductCard } from "@/app/components/ProductCard";
import { LiveBadge } from "@/app/components/ui/LiveBadge";
import { JarvisToast } from "@/app/components/ui/JarvisToast";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/app/hooks/useProducts";
import Link from "next/link";

/** Skeleton de carga para una tarjeta de producto */
function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 aspect-[3/4] w-full rounded-sm" />
      <div className="mt-4 space-y-2 px-1">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/4" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const { toggleCart, cartCount } = useCart();
  const { products, isLoading, error, isLive, lastEvent } = useProducts();

  // Animaciones del Hero
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 1.1]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-cream">

      {/* Toast de notificación de J.A.R.V.I.S. */}
      <JarvisToast event={lastEvent} />

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-cream/95 backdrop-blur-sm shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex-shrink-0"
            >
              <Link href="/">
                <h1 className="font-serif text-2xl font-light tracking-wider text-deep-black cursor-pointer">
                  D&E
                </h1>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="hidden items-center gap-8 md:flex"
            >
              {[
                { name: "Colección", href: "/shop/all" },
                { name: "Hombre", href: "/shop/hombre" },
                { name: "Mujer", href: "/shop/mujer" },
                { name: "Rebajas", href: "/shop/rebajas" },
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="font-sans text-sm font-light tracking-wide text-deep-black transition-opacity hover:opacity-60"
                >
                  {item.name}
                </Link>
              ))}
            </motion.div>

            {/* Right Icons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-4"
            >
              <button className="text-deep-black transition-opacity hover:opacity-60">
                <Search className="h-5 w-5" />
              </button>

              <button
                onClick={toggleCart}
                className="relative text-deep-black transition-opacity hover:opacity-60"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-800 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Badge de estado en vivo — solo visible en desktop */}
              <div className="hidden md:block">
                <LiveBadge isLive={isLive} />
              </div>

              <button
                className="text-deep-black md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </motion.div>
          </div>
        </div>

        {/* Menú Móvil */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-deep-black/10 bg-cream md:hidden"
          >
            <div className="space-y-4 px-6 py-6">
              {[
                { name: "Colección", href: "/shop/all" },
                { name: "Hombre", href: "/shop/hombre" },
                { name: "Mujer", href: "/shop/mujer" },
                { name: "Rebajas", href: "/shop/rebajas" },
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block font-sans text-base font-light text-deep-black"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="absolute inset-0"
        >
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&fit=crop"
            alt="D&E Collection Hero"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-deep-black/20" />
        </motion.div>

        <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <h2 className="mb-4 font-serif text-6xl font-light tracking-wider text-cream md:text-8xl">
              D&E Collection
            </h2>
            <p className="mb-8 font-sans text-lg font-light tracking-wide text-cream/90 md:text-xl">
              Elegancia Atemporal
            </p>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-cream bg-transparent font-sans text-sm font-light tracking-widest text-cream transition-all hover:bg-cream hover:text-deep-black"
            >
              SHOP NOW
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Product Grid Section */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h3 className="mb-4 font-serif text-5xl font-light tracking-wide text-deep-black">
            Nueva Colección
          </h3>
          <p className="font-sans text-base font-light text-deep-black/70">
            Descubre la esencia del lujo discreto
          </p>
        </motion.div>

        {/* Estado de error */}
        {error && (
          <div className="flex items-center justify-center gap-3 py-12 text-red-600">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="font-sans text-sm">
              No se pudo cargar el catálogo. {error}
            </p>
          </div>
        )}

        {/* Grid de Productos — Skeleton mientras carga */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
            : products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  image={product.image}
                  category={product.category}
                  tag={product.tag}
                />
              ))}
        </div>

        {/* Estado vacío */}
        {!isLoading && !error && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="font-serif text-2xl font-light text-deep-black/40 mb-2">
              El catálogo está en preparación
            </p>
            <p className="font-sans text-sm text-deep-black/30">
              J.A.R.V.I.S. pronto publicará los primeros artículos.
            </p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-deep-black/10 bg-cream py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <p className="font-sans text-xs font-light text-deep-black/50">
              © 2025 D&E Collection. Santo Domingo, RD.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}