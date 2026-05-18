import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { mapSupabaseProduct, SupabaseProduct } from '@/app/lib/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = Number(id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'ID de producto inválido' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('Products')
      .select('*, Categories(name), Images(image_url)')
      .eq('id', productId)
      .single();

    if (error) {
      console.error(`❌ Error de Supabase al buscar producto ${id} en el servidor:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    const mapped = mapSupabaseProduct(data as SupabaseProduct);
    return NextResponse.json(mapped);
  } catch (err) {
    console.error(`❌ Error crítico en GET /api/products/id:`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
