import { products } from "@/data/products";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";

export default async function ProductPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // Await params en Next.js 15+
  const { id } = await params;
  
  const product = products.find((p) => p.id === Number(id));

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
