"use client"

import { useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Search, ShoppingBag, User, Menu, X } from "lucide-react"
import { Button } from "@/app/components/ui/button"

// Sample product data
const products = [
  { id: 1, name: "Silk Evening Dress", price: 890, category: "Women", image: "/elegant-silk-evening-dress-luxury-fashion.jpg" },
  { id: 2, name: "Cashmere Overcoat", price: 1250, category: "Men", image: "/cashmere-overcoat-menswear-luxury.jpg" },
  { id: 3, name: "Tailored Blazer", price: 720, category: "Women", image: "/tailored-blazer-womens-fashion.jpg" },
  { id: 4, name: "Leather Loafers", price: 450, category: "Men", image: "/luxury-leather-loafers-shoes.jpg" },
  { id: 5, name: "Wool Trench Coat", price: 980, category: "Women", image: "/wool-trench-coat-elegant.jpg" },
  { id: 6, name: "Linen Summer Shirt", price: 320, category: "Men", image: "/linen-summer-shirt-menswear.jpg" },
  { id: 7, name: "Pleated Midi Skirt", price: 420, category: "Women", image: "/pleated-midi-skirt-luxury.jpg" },
  { id: 8, name: "Merino Wool Sweater", price: 380, category: "Men", image: "/merino-wool-sweater-menswear.jpg" },
]

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])
  const heroScale = useTransform(scrollY, [0, 300], [1, 1.1])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-cream">
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
              <h1 className="font-serif text-2xl font-light tracking-wider text-deep-black">D&E</h1>
            </motion.div>

            {/* Desktop Navigation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="hidden items-center gap-8 md:flex"
            >
              {["Colección", "Hombre", "Mujer", "Rebajas"].map((item, i) => (
                <a
                  key={item}
                  href="#"
                  className="font-sans text-sm font-light tracking-wide text-deep-black transition-opacity hover:opacity-60"
                >
                  {item}
                </a>
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
              <button className="text-deep-black transition-opacity hover:opacity-60">
                <ShoppingBag className="h-5 w-5" />
              </button>
              <button className="hidden text-deep-black transition-opacity hover:opacity-60 md:block">
                <User className="h-5 w-5" />
              </button>
              <button className="text-deep-black md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </motion.div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-deep-black/10 bg-cream md:hidden"
          >
            <div className="space-y-4 px-6 py-6">
              {["Colección", "Hombre", "Mujer", "Rebajas"].map((item) => (
                <a key={item} href="#" className="block font-sans text-base font-light text-deep-black">
                  {item}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="absolute inset-0">
          <img src="/luxury-fashion-boutique-elegant-interior.jpg" alt="D&E Collection Hero" className="h-full w-full object-cover" />
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
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-cream bg-transparent font-sans text-sm font-light tracking-widest text-cream transition-all hover:bg-cream hover:text-deep-black"
              >
                SHOP NOW
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Products Grid Section */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h3 className="mb-4 font-serif text-5xl font-light tracking-wide text-deep-black">Nueva Colección</h3>
          <p className="font-sans text-base font-light text-deep-black/70">Descubre la esencia del lujo discreto</p>
        </motion.div>

        {/* Masonry Grid */}
        <div className="columns-1 gap-6 md:columns-2 lg:columns-3">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group relative mb-6 break-inside-avoid overflow-hidden"
            >
              <div className="relative overflow-hidden bg-muted">
                <motion.img
                  src={product.image}
                  alt={product.name}
                  className="w-full transition-transform duration-500 group-hover:scale-110"
                />

                {/* Hover Overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-deep-black/40 transition-opacity"
                >
                  <Button
                    size="sm"
                    className="border border-cream bg-transparent font-sans text-xs font-light tracking-widest text-cream transition-all hover:bg-cream hover:text-deep-black"
                  >
                    AÑADIR AL CARRITO
                  </Button>
                </motion.div>
              </div>

              {/* Product Info */}
              <div className="mt-4 px-2">
                <p className="mb-1 font-sans text-xs font-light uppercase tracking-widest text-deep-black/50">
                  {product.category}
                </p>
                <h4 className="mb-2 font-serif text-lg font-light text-deep-black">{product.name}</h4>
                <p className="font-sans text-base font-light text-deep-black">${product.price}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-deep-black py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl px-6 text-center"
        >
          <h3 className="mb-6 font-serif text-4xl font-light tracking-wide text-cream md:text-5xl">
            Únete a la Familia D&E
          </h3>
          <p className="mb-8 font-sans text-base font-light leading-relaxed text-cream/80">
            Recibe acceso exclusivo a nuevas colecciones, eventos privados y ofertas especiales.
          </p>
          <Button
            size="lg"
            className="border-2 border-cream bg-transparent font-sans text-sm font-light tracking-widest text-cream transition-all hover:bg-cream hover:text-deep-black"
          >
            SUSCRÍBETE
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-deep-black/10 bg-cream py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h5 className="mb-4 font-serif text-xl font-light text-deep-black">D&E</h5>
              <p className="font-sans text-sm font-light leading-relaxed text-deep-black/70">
                Elegancia que trasciende el tiempo.
              </p>
            </div>
            <div>
              <h6 className="mb-4 font-sans text-sm font-light uppercase tracking-widest text-deep-black">Comprar</h6>
              <ul className="space-y-2 font-sans text-sm font-light text-deep-black/70">
                <li>
                  <a href="#" className="hover:text-deep-black">
                    Hombre
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-deep-black">
                    Mujer
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-deep-black">
                    Rebajas
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h6 className="mb-4 font-sans text-sm font-light uppercase tracking-widest text-deep-black">Ayuda</h6>
              <ul className="space-y-2 font-sans text-sm font-light text-deep-black/70">
                <li>
                  <a href="#" className="hover:text-deep-black">
                    Contacto
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-deep-black">
                    Envíos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-deep-black">
                    Devoluciones
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h6 className="mb-4 font-sans text-sm font-light uppercase tracking-widest text-deep-black">Síguenos</h6>
              <ul className="space-y-2 font-sans text-sm font-light text-deep-black/70">
                <li>
                  <a href="#" className="hover:text-deep-black">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-deep-black">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-deep-black">
                    Pinterest
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-deep-black/10 pt-8 text-center">
            <p className="font-sans text-xs font-light text-deep-black/50">
              © 2025 D&E Collection. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
