const steps = [
  {
    number: '01',
    title: 'Claim MockUSDC',
    description: 'Get 1000 test USDC from the faucet. One claim per day. No gas required.',
    icon: '🪙',
  },
  {
    number: '02',
    title: 'Trade',
    description: 'Buy spot tokens or open a long/short position with up to 5x leverage.',
    icon: '📊',
  },
  {
    number: '03',
    title: 'Profit',
    description: 'Prices move, LP earns fees, traders earn gains. Withdraw anytime.',
    icon: '💰',
  },
]

export default function HowItWorks() {
  return (
    <section
      style={{
        background: 'var(--bg)',
        padding: '80px 24px',
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Section Title */}
        <h2
          className="pixel-font text-center mb-12"
          style={{
            fontSize: 'clamp(10px, 2vw, 18px)',
            color: 'var(--white)',
          }}
        >
          How It Works
        </h2>

        {/* Steps */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '32px',
            position: 'relative',
          }}
        >
          {steps.map(({ number, title, description, icon }, idx) => (
            <div
              key={number}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '16px',
              }}
            >
              {/* Step Number Circle */}
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  background: 'var(--card)',
                  border: '2px solid var(--gold)',
                  boxShadow: '0 -2px 0 0 var(--gold), 0 2px 0 0 var(--gold), -2px 0 0 0 var(--gold), 2px 0 0 0 var(--gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <span style={{ fontSize: '20px' }}>{icon}</span>
                <span
                  style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '7px',
                    color: 'var(--gold)',
                    lineHeight: 1,
                  }}
                >
                  {number}
                </span>
              </div>

              {/* Connector arrow (not last) */}
              {idx < steps.length - 1 && (
                <div
                  className="hidden md:block absolute"
                  style={{
                    // purely decorative, done via CSS grid gap
                  }}
                />
              )}

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
                  maxWidth: '240px',
                }}
              >
                {description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom pixel arrow row */}
        <div
          className="flex justify-center items-center gap-8 mt-12"
          style={{ color: 'var(--border)' }}
        >
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', color: 'var(--muted)' }}>
            STEP 1
          </span>
          <span style={{ color: 'var(--border)', fontSize: '16px' }}>▶▶</span>
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', color: 'var(--muted)' }}>
            STEP 2
          </span>
          <span style={{ color: 'var(--border)', fontSize: '16px' }}>▶▶</span>
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', color: 'var(--muted)' }}>
            STEP 3
          </span>
        </div>
      </div>
    </section>
  )
}
