'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JarvisEvent } from '@/app/hooks/useProducts';

interface JarvisToastProps {
  event: JarvisEvent | null;
}

const ACTION_LABELS: Record<JarvisEvent['type'], string> = {
  INSERT: '📦 J.A.R.V.I.S. ha publicado',
  UPDATE: '✏️ J.A.R.V.I.S. ha actualizado',
  DELETE: '🗑️ J.A.R.V.I.S. ha eliminado',
};

/**
 * Notificación elegante que aparece en la esquina inferior derecha cuando
 * J.A.R.V.I.S. realiza una operación en la base de datos.
 * Se auto-oculta después de 5 segundos.
 */
export function JarvisToast({ event }: JarvisToastProps) {
  const [visible, setVisible] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<JarvisEvent | null>(null);

  useEffect(() => {
    if (!event) return;

    setCurrentEvent(event);
    setVisible(true);

    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, [event]);

  return (
    <AnimatePresence>
      {visible && currentEvent && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-6 right-6 z-50 max-w-xs"
        >
          <div
            className="relative overflow-hidden rounded-lg shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* Barra de progreso animada */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 5, ease: 'linear' }}
              className="absolute top-0 left-0 right-0 h-0.5 origin-left"
              style={{ background: 'linear-gradient(90deg, #10b981, #059669)' }}
            />

            <div className="p-4">
              {/* Header con ícono de J.A.R.V.I.S. */}
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                >
                  J
                </div>
                <span className="text-xs font-sans font-medium tracking-wider" style={{ color: '#10b981' }}>
                  J.A.R.V.I.S.
                </span>
              </div>

              {/* Acción realizada */}
              <p className="text-xs font-sans text-gray-400 mb-1">
                {ACTION_LABELS[currentEvent.type]}
              </p>
              <p className="font-serif text-white text-sm leading-snug">
                {currentEvent.product.name}
              </p>

              {/* Precio si aplica */}
              {currentEvent.type !== 'DELETE' && (
                <p className="text-xs font-sans mt-1" style={{ color: '#10b981' }}>
                  RD${currentEvent.product.price.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
