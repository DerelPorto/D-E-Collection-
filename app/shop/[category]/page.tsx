import { supabase, SupabaseProduct, mapSupabaseProduct } from "@/app/lib/supabase";
import { ProductCard } from "@/app/components/ProductCard";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return [
    { category: "hombre" },
    { category: "mujer" },
    { category: "rebajas" },
    { category: "all" },
  ];
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params;
  const rawCategory = resolvedParams?.category || "";
  const category = decodeURIComponent(rawCategory);

  console.log("Categoria buscada:", category);

  // Consultar productos en tiempo real desde Supabase
  let dbProducts: any[] = [];
  try {
    const { data, error } = await supabase
      .from('Products')
      .select('*, Categories(name), Images(image_url)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error de Supabase al listar productos en la página de categorías:', error);
    } else if (data) {
      dbProducts = (data as SupabaseProduct[]).map(mapSupabaseProduct);
    }
  } catch (err) {
    console.error('❌ Error crítico al consultar productos:', err);
  }

  const filteredProducts = dbProducts.filter((product) => {
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
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-xl">No hay productos en la categoría: <strong>{category}</strong></p>
            <p className="text-sm text-gray-400 mt-2">Añade productos con esta categoría en la base de datos o consola de J.A.R.V.I.S.</p>
          </div>
        )}
      </div>
    </div>
  );
}