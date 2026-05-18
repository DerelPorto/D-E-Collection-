import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos que reflejan la tabla Products en Supabase
export interface SupabaseProduct {
  id: number;
  title: string;
  price: number;
  stock: number;
  description: string | null;
  is_active: boolean;
  category_id: number | null;
  min_stock: number;
  created_at?: string;
  updated_at?: string;
  // join con Categories
  Categories?: { name: string } | null;
  // join con Images
  Images?: { image_url: string }[] | null;
}

// Tipo normalizado para usar en el frontend (compatible con ProductCard)
export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  tag?: string;
  stock: number;
  description: string;
  isNew?: boolean;
}

/** Convierte URLs de Supabase Storage a nuestra ruta de proxy local si es necesario */
export function getProxyImageUrl(url: string | null | undefined): string {
  if (!url) return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&fit=crop';
  const matchStr = '/storage/v1/object/public/';
  if (url.includes(matchStr)) {
    const parts = url.split(matchStr);
    return `/api/storage/${parts[1]}`;
  }
  return url;
}

/** Convierte un producto de Supabase al formato que usa el frontend */
export function mapSupabaseProduct(p: SupabaseProduct): Product {
  // Tomar la primera imagen del arreglo si existe, de lo contrario usar placeholder
  const firstImage = p.Images && p.Images.length > 0 ? p.Images[0].image_url : null;

  return {
    id: p.id,
    name: p.title,
    price: p.price,
    image: getProxyImageUrl(firstImage),
    category: p.Categories?.name?.toLowerCase() || 'colección',
    stock: p.stock,
    description: p.description || '',
    tag: p.stock <= 3 ? 'sale' : undefined,
    isNew: p.created_at
      ? Date.now() - new Date(p.created_at).getTime() < 7 * 24 * 60 * 60 * 1000
      : false,
  };
}
