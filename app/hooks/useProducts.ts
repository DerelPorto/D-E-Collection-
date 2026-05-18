'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, mapSupabaseProduct, Product, SupabaseProduct } from '@/app/lib/supabase';

export interface JarvisEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  product: Product;
  timestamp: Date;
}

interface UseProductsReturn {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  isLive: boolean;
  lastEvent: JarvisEvent | null;
}

const POLLING_INTERVAL_MS = 30_000; // fallback cada 30s

async function fetchActiveProducts(): Promise<Product[]> {
  const response = await fetch('/api/products');
  if (!response.ok) {
    const errData = await response.json().catch(() => ({ error: 'Error al consultar la API de productos' }));
    throw new Error(errData.error || 'Failed to fetch products from API');
  }
  return response.json();
}

/**
 * Hook que:
 * 1. Carga productos activos desde Supabase al montar
 * 2. Se suscribe al canal Realtime de la tabla Products
 * 3. Actualiza el estado localmente sin recargar la página
 * 4. Expone el último evento de J.A.R.V.I.S. para mostrarlo en la UI
 * 5. Tiene fallback con polling si Realtime no está disponible
 */
export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [lastEvent, setLastEvent] = useState<JarvisEvent | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const disconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      const data = await fetchActiveProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error('❌ Error cargando productos:', err);
      setError(err instanceof Error ? err.message : 'Error de conexión con el catálogo');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Carga inicial
    loadProducts();

    // Suscripción Realtime
    const channel = supabase
      .channel('jarvis-products-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Products' },
        async (payload) => {
          const eventType = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE';
          
          if (eventType === 'DELETE') {
            const deletedId = (payload.old as { id: number }).id;
            setProducts((prev) => prev.filter((p) => p.id !== deletedId));
            return;
          }

          const rawProduct = payload.new as SupabaseProduct;

          // Si el producto fue desactivado, quitarlo de la vista
          if (!rawProduct.is_active) {
            setProducts((prev) => prev.filter((p) => p.id !== rawProduct.id));
            return;
          }

          // Pequeña pausa para asegurar que J.A.R.V.I.S haya terminado de insertar la imagen en la tabla relacionada
          await new Promise((resolve) => setTimeout(resolve, 800));

          // Enriquecer con join de categoría y de imágenes llamando a nuestra API Proxy local
          const response = await fetch(`/api/products/${rawProduct.id}`);
          if (!response.ok) {
            console.error('❌ Error al enriquecer producto mediante API local:', response.statusText);
            return;
          }
          const mapped = await response.json() as Product;

          setProducts((prev) => {
            const exists = prev.some((p) => p.id === mapped.id);
            if (exists) {
              return prev.map((p) => (p.id === mapped.id ? mapped : p));
            }
            return [mapped, ...prev]; // Nuevo producto al principio
          });

          // Emitir evento para el JarvisToast
          setLastEvent({ type: eventType, product: mapped, timestamp: new Date() });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          if (disconnectTimerRef.current) {
            clearTimeout(disconnectTimerRef.current);
            disconnectTimerRef.current = null;
          }
          setIsLive(true);
          // Si Realtime está disponible, limpiar el polling si existía
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          // Debounce para evitar parpadeos visuales por reconexiones rápidas
          if (!disconnectTimerRef.current) {
            disconnectTimerRef.current = setTimeout(() => {
              setIsLive(false);
              // Activar fallback de polling
              if (!pollingRef.current) {
                pollingRef.current = setInterval(loadProducts, POLLING_INTERVAL_MS);
              }
            }, 3000); // 3 segundos de gracia antes de mostrar "Conectando..."
          }
        }
      });

    return () => {
      supabase.removeChannel(channel);
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      if (disconnectTimerRef.current) {
        clearTimeout(disconnectTimerRef.current);
      }
    };
  }, [loadProducts]);

  return { products, isLoading, error, isLive, lastEvent };
}
