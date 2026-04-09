'use client'

interface PixelCardProps {
  children: React.ReactNode
  className?: string
  title?: string
}

export default function PixelCard({ children, className = '', title }: PixelCardProps) {
  return (
    <div className={`pixel-card ${className}`}>
      {title && (
        <h3 className="pixel-font text-[10px] text-gold mb-3">{title}</h3>
      )}
      {children}
    </div>
  )
}
