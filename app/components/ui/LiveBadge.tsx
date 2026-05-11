'use client';

interface LiveBadgeProps {
  isLive: boolean;
}

/**
 * Indicador visual de que la tienda está sincronizada con J.A.R.V.I.S. en tiempo real.
 * Punto verde pulsante = conectado | Punto gris = modo polling/desconectado
 */

export function LiveBadge({ isLive }: LiveBadgeProps) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-sans font-medium tracking-wide transition-all duration-500"
      style={{
        background: isLive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(156, 163, 175, 0.1)',
        border: `1px solid ${isLive ? 'rgba(16, 185, 129, 0.25)' : 'rgba(156, 163, 175, 0.2)'}`,
        color: isLive ? '#059669' : '#9ca3af',
      }}
      title={isLive ? 'Sincronizado con J.A.R.V.I.S. en tiempo real' : 'Modo de actualización periódica'}
    >
      <span
        className="relative flex h-2 w-2"
        aria-hidden="true"
      >
        {isLive && (
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ background: '#10b981' }}
          />
        )}
        <span
          className="relative inline-flex rounded-full h-2 w-2"
          style={{ background: isLive ? '#10b981' : '#9ca3af' }}
        />
      </span>
      {isLive ? 'En vivo' : 'Conectando...'}
    </div>
  );
}
