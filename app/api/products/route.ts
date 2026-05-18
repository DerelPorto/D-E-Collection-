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

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('Products')
      .select('*, Categories(name), Images(image_url)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error de Supabase al listar productos en el servidor:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const mapped = (data as SupabaseProduct[]).map(mapSupabaseProduct);
    return NextResponse.json(mapped);
  } catch (err) {
    console.error('❌ Error crítico en GET /api/products:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
