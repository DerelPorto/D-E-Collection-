import { products } from "@/data/products";
import { ProductCard } from "@/app/components/ProductCard"; // Asegúrate que esta ruta es correcta
import Link from "next/link";

export async function generateStaticParams() {
  return [
    { category: "hombre" },
    { category: "mujer" },
    { category: "rebajas" },
    { category: "all" },
  ];
}

// OJO: Definimos params como Promise para compatibilidad con Next.js 15
export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {

  // 1. Esperamos a que los params estén listos (Fix para Next.js 15)
  const resolvedParams = await params;

  // 2. Decodificamos de forma segura (si es undefined, usamos string vacío)
  const rawCategory = resolvedParams?.category || "";
  const category = decodeURIComponent(rawCategory);

  console.log("Categoria buscada:", category); // Mira esto en tu terminal

  const filteredProducts = products.filter((product) => {
    // BLINDAJE: Si el producto no tiene datos, lo saltamos
    if (!product || !product.category) return false;

    // Normalizamos a minúsculas para comparar sin errores
    const prodCat = product.category.toLowerCase();
    const searchCat = category.toLowerCase();

    if (searchCat === "all" || searchCat === "coleccion") return true;
    if (searchCat === "rebajas") return product.tag === "sale";

    return prodCat === searchCat;
  });

  return (
    <div className="min-h-screen bg-cream pt-32 px-6 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-sm font-sans text-deep-black/60">
          <Link href="/">Inicio</Link> / <span className="capitalize text-deep-black">{category}</span>
        </div>

        <h1 className="font-serif text-5xl mb-12 capitalize text-deep-black">
          {category === 'all' ? 'Colección Completa' : category}
        </h1>

        {filteredProducts.length > 0 ? (
          // <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} {...p} image={p.images[0]} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-xl">No hay productos en la categoría: <strong>{category}</strong></p>
            <p className="text-sm text-gray-400 mt-2">Revisa que en data/products.ts la categoría sea idéntica (ej: "hombre")</p>
          </div>
        )}
      </div>
    </div>
  );
}