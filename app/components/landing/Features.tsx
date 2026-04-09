const features = [
  {
    icon: '🌾',
    title: 'SPOT TRADING',
    description: 'Buy/sell RICE, COFFEE, CORN, CPO at live oracle prices with instant settlement.',
  },
  {
    icon: '📈',
    title: 'LONG / SHORT',
    description: 'Open leveraged perp positions (up to 5x) on commodity prices. No expiry.',
  },
  {
    icon: '💧',
    title: 'LP POOL',
    description: 'Deposit USDC, earn 0.3% fees from all spot and perp trades automatically.',
  },
  {
    icon: '🔮',
    title: 'LIVE ORACLE',
    description: 'Real prices from global markets via commodities-api.com, updated every 10 minutes.',
  },
]

export default function Features() {
  return (
    <section
      style={{
        background: 'var(--surface)',
        padding: '80px 24px',
        borderTop: '2px solid var(--border)',
        borderBottom: '2px solid var(--border)',
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Section Title */}
        <h2
          className="pixel-font text-center mb-12"
          style={{
            fontSize: 'clamp(12px, 2.5vw, 20px)',
            color: 'var(--white)',
          }}
        >
          Features
        </h2>

        {/* Feature Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px',
          }}
        >
          {features.map(({ icon, title, description }) => (
            <div
              key={title}
              className="pixel-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '24px',
              }}
            >
              {/* Icon */}
              <div style={{ fontSize: '40px' }}>{icon}</div>

              {/* Title */}
              <h3
                className="pixel-font"
                style={{
                  fontSize: '9px',
                  color: 'var(--accent)',
                  lineHeight: '2',
                }}
              >
                {title}
              </h3>

              {/* Description */}
              <p
                style={{
                  fontFamily: "'VT323', monospace",
                  fontSize: '18px',
                  color: 'var(--muted)',
                  lineHeight: '1.5',
                  margin: 0,
                }}
              >
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
