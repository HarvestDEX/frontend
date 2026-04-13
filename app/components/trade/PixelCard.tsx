'use client'

interface PixelCardProps {
  children: React.ReactNode
  className?: string
  title?: string
  icon?: string       // path to sprite image, e.g. "/sprites/market-stall.png"
  iconSize?: number   // px, default 32
}

export default function PixelCard({
  children,
  className = '',
  title,
  icon,
  iconSize = 32,
}: PixelCardProps) {
  return (
    <div
      className={`pixel-card rpg-card ${className}`}
      style={{
        position: 'relative',
        transition: 'transform 0.1s ease, box-shadow 0.1s ease',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.transform = 'translateY(-1px)'
        el.style.boxShadow = `0 0 12px 1px rgba(123,198,122,0.15), 0 -2px 0 0 var(--border), 0 2px 0 0 var(--border), -2px 0 0 0 var(--border), 2px 0 0 0 var(--border)`
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = `0 -2px 0 0 var(--border), 0 2px 0 0 var(--border), -2px 0 0 0 var(--border), 2px 0 0 0 var(--border)`
      }}
    >
      {(title || icon) && (
        <div className="flex items-center gap-2 mb-3">
          {icon && (
            <img
              src={icon}
              alt=""
              width={iconSize}
              height={iconSize}
              style={{ imageRendering: 'pixelated', flexShrink: 0 }}
            />
          )}
          {title && (
            <h3 className="pixel-font text-[10px]" style={{ color: 'var(--gold)', margin: 0 }}>
              {title}
            </h3>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
