const questKeyframes = `
@keyframes check-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(123,198,122,0.4); }
  50% { box-shadow: 0 0 0 6px rgba(123,198,122,0); }
}
@keyframes arrow-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
`

const steps = [
  {
    sprite: '/sprites/well.png',
    spriteW: 48,
    spriteH: 56,
    number: '01',
    questTitle: 'VISIT THE WELL',
    description: 'Claim 1000 USDC from the village well. Once per day. No gas required.',
    objective: 'Collect MockUSDC from faucet',
    done: false,
  },
  {
    sprite: '/sprites/market-stall.png',
    spriteW: 96,
    spriteH: 96,
    number: '02',
    questTitle: 'TRADE AT MARKET',
    description: 'Buy crop tokens at the market stall or open a leveraged position at the barn.',
    objective: 'Make your first trade',
    done: false,
  },
  {
    sprite: '/sprites/treasure-chest.png',
    spriteW: 48,
    spriteH: 48,
    number: '03',
    questTitle: 'COLLECT REWARDS',
    description: 'Watch your USDC grow as the market moves. Withdraw your earnings anytime.',
    objective: 'Earn your first profit',
    done: false,
  },
]

export default function HowItWorks() {
  return (
    <section
      style={{
        background: 'var(--surface)',
        padding: '80px 24px',
        borderTop: '4px solid var(--border)',
        borderBottom: '4px solid var(--border)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{questKeyframes}</style>

      {/* Background texture lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(74,124,89,0.06) 31px, rgba(74,124,89,0.06) 32px)',
          backgroundSize: '100% 32px',
        }}
      />

      <div className="max-w-4xl mx-auto relative">
        {/* Section header with signpost */}
        <div className="flex flex-col items-center mb-16">
          <img
            src="/sprites/signpost.png"
            alt="signpost"
            width={48}
            height={64}
            style={{ imageRendering: 'pixelated', marginBottom: '12px' }}
          />
          <h2
            className="pixel-font text-center"
            style={{
              fontSize: 'clamp(10px, 2vw, 16px)',
              color: 'var(--white)',
              textShadow: '2px 2px 0px #0a120a',
            }}
          >
            YOUR QUEST
          </h2>
          <p
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: '18px',
              color: 'var(--muted)',
              marginTop: '8px',
            }}
          >
            Complete these objectives to become a master trader
          </p>
        </div>

        {/* Quest journal / log */}
        <div
          style={{
            background: '#1a2a14',
            border: '4px solid #3a5a30',
            boxShadow: '0 -4px 0 0 #3a5a30, 0 4px 0 0 #0a1208, -4px 0 0 0 #3a5a30, 4px 0 0 0 #0a1208, inset 0 0 40px rgba(0,0,0,0.3)',
            padding: '32px',
            position: 'relative',
          }}
        >
          {/* Journal header */}
          <div
            style={{
              borderBottom: '2px solid var(--border)',
              paddingBottom: '16px',
              marginBottom: '28px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', color: 'var(--accent)' }}>
              📋 QUEST LOG
            </span>
            <div style={{ flex: 1, height: '2px', background: 'var(--border)', opacity: 0.4 }} />
            <span style={{ fontFamily: "'VT323', monospace", fontSize: '16px', color: 'var(--muted)' }}>
              0/3 complete
            </span>
          </div>

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {steps.map(({ sprite, spriteW, spriteH, number, questTitle, description, objective, done }, idx) => (
              <div key={number}>
                {/* Step row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '20px',
                    padding: '20px 0',
                  }}
                >
                  {/* Checkbox + number column */}
                  <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    {/* Checkbox */}
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        border: '2px solid var(--accent)',
                        background: done ? 'var(--accent)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: done ? 'none' : 'check-pulse 2s ease-in-out infinite',
                        flexShrink: 0,
                      }}
                    >
                      {done && (
                        <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '10px', color: 'var(--bg)' }}>✓</span>
                      )}
                    </div>
                    {/* Step number */}
                    <span
                      style={{
                        fontFamily: "'Press Start 2P', monospace",
                        fontSize: '6px',
                        color: 'var(--muted)',
                      }}
                    >
                      {number}
                    </span>
                  </div>

                  {/* Sprite */}
                  <div
                    style={{
                      flexShrink: 0,
                      width: '64px',
                      height: '64px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(0,0,0,0.3)',
                      border: '2px solid var(--border)',
                    }}
                  >
                    <img
                      src={sprite}
                      alt={questTitle}
                      width={Math.min(spriteW, 48)}
                      height={Math.min(spriteH, 48)}
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1 }}>
                    <h3
                      className="pixel-font"
                      style={{
                        fontSize: '8px',
                        color: 'var(--accent)',
                        lineHeight: '2.2',
                        margin: '0 0 6px',
                      }}
                    >
                      {questTitle}
                    </h3>
                    <p
                      style={{
                        fontFamily: "'VT323', monospace",
                        fontSize: '18px',
                        color: 'var(--muted)',
                        lineHeight: '1.4',
                        margin: '0 0 8px',
                      }}
                    >
                      {description}
                    </p>
                    {/* Objective line */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontFamily: "'VT323', monospace",
                        fontSize: '15px',
                        color: 'var(--gold)',
                      }}
                    >
                      <span style={{ color: 'var(--gold)' }}>▸</span>
                      <span>{objective}</span>
                    </div>
                  </div>
                </div>

                {/* Connector arrow between steps */}
                {idx < steps.length - 1 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '14px',
                      gap: '8px',
                      paddingBottom: '4px',
                    }}
                  >
                    <div style={{ width: '2px', height: '24px', background: 'var(--border)', marginLeft: '13px' }} />
                    <span
                      style={{
                        fontFamily: "'Press Start 2P', monospace",
                        fontSize: '8px',
                        color: 'var(--border)',
                        animation: 'arrow-blink 1.5s ease-in-out infinite',
                        marginLeft: '-4px',
                      }}
                    >
                      ▼
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Journal footer */}
          <div
            style={{
              borderTop: '2px solid var(--border)',
              paddingTop: '16px',
              marginTop: '12px',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                fontFamily: "'VT323', monospace",
                fontSize: '16px',
                color: 'var(--muted)',
              }}
            >
              ★ Complete all quests to unlock master farmer status ★
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
