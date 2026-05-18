'use client';

interface LiveBadgeProps {
  isLive: boolean;
}

/**
 * Indicador visual de sincronización con J.A.R.V.I.S. en tiempo real.
 * Punto dorado pulsante = conectado | Punto gris = desconectado
 */
export function LiveBadge({ isLive }: LiveBadgeProps) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-sans tracking-wide transition-all duration-500"
      style={{
        background: isLive ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isLive ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.08)'}`,
        color: isLive ? '#c9a84c' : 'rgba(248,246,242,0.3)',
      }}
      title={isLive ? 'Sincronizado con J.A.R.V.I.S. en tiempo real' : 'Modo de actualización periódica'}
    >
      <span className="relative flex h-2 w-2" aria-hidden="true">
        {isLive && (
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
            style={{ background: '#c9a84c' }}
          />
        )}
        <span
          className="relative inline-flex rounded-full h-2 w-2"
          style={{ background: isLive ? '#c9a84c' : 'rgba(248,246,242,0.2)' }}
        />
      </span>
      {isLive ? 'J.A.R.V.I.S. Live' : 'Conectando...'}
    </div>
  );
}
