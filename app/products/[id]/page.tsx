import { supabase, SupabaseProduct, getProxyImageUrl } from "@/app/lib/supabase";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";

export default async function ProductPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  try {
    const { data: p, error } = await supabase
      .from('Products')
      .select('*, Categories(name), Images(image_url)')
      .eq('id', Number(id))
      .single();

    if (error || !p) {
      console.error("Error fetching product from Supabase:", error);
      notFound();
    }

    const supabaseProduct = p as any; // Usar any temporalmente para depuración

    console.log("Product data fetched:", JSON.stringify(supabaseProduct, null, 2));

    // Adaptar los datos al formato que espera el componente cliente
    const mappedProduct = {
      id: supabaseProduct.id,
      name: supabaseProduct.title,
      price: supabaseProduct.price,
      category: supabaseProduct.Categories?.name || 'Colección',
      description: supabaseProduct.description || '',
      // Mapear el array de objetos de imágenes a un array de strings de URLs
      images: Array.isArray(supabaseProduct.Images) && supabaseProduct.Images.length > 0 
        ? supabaseProduct.Images.map((img: any) => getProxyImageUrl(img.image_url))
        : ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&fit=crop'],
      tag: supabaseProduct.stock <= 3 ? 'Pocas unidades' : undefined
    };

    return <ProductDetailClient product={mappedProduct} />;
  } catch (err) {
    console.error("Critical error in ProductPage:", err);
    throw err; // Esto provocará el 500 pero al menos lo veremos en consola
  }
}
