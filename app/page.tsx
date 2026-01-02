"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { products } from "@/data/products";
import { ProductCard } from "@/app/components/ProductCard";
// Borré el import de CartSidebar porque ya está en layout.tsx y aquí no se usa
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  const { toggleCart, cartCount } = useCart();

  // Animaciones del Hero
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 1.1]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        // header="fixed"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-cream/95 backdrop-blur-sm shadow-sm" : "bg-transparent"
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
              className="flex items-center gap-6"
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

              <button
                className="text-deep-black md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </motion.div>
          </div>
        </div>

        {/* 3. CORRECCIÓN: Agregué de vuelta el Menú Móvil que faltaba */}
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

        {/* Grid de Productos */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              image={
                product.images?.[0] ?? "https://via.placeholder.com/400x600"
              }
            />
          ))}
        </div>
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