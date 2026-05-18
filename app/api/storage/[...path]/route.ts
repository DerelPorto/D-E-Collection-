import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const storagePath = path.join('/');

    if (!storagePath) {
      return NextResponse.json({ error: 'Ruta de almacenamiento requerida' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kitfydqzfsrfunqlwmyu.supabase.co';
    const targetUrl = `${supabaseUrl}/storage/v1/object/public/${storagePath}`;

    // Realizar fetch en el servidor, que ignora TLS inseguro gracias a NODE_TLS_REJECT_UNAUTHORIZED=0
    const res = await fetch(targetUrl);

    if (!res.ok) {
      console.error(`❌ Error al descargar imagen de Supabase Storage: ${res.statusText}`);
      return NextResponse.json({ error: 'No se pudo descargar la imagen' }, { status: res.status });
    }

    const contentType = res.headers.get('Content-Type') || 'image/jpeg';
    const buffer = await res.arrayBuffer();

    return new Response(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error('❌ Error crítico en proxy de almacenamiento:', err);
    return NextResponse.json({ error: 'Error interno de almacenamiento' }, { status: 500 });
  }
}
