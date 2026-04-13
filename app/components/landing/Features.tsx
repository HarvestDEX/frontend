const features = [
  {
    sprite: '/sprites/market-stall.png',
    spriteW: 96,
    spriteH: 96,
    tag: 'QUEST',
    title: 'MARKET STALL',
    description: 'Buy & sell crops at live oracle prices with instant settlement on HashKey Chain.',
    tagColor: '#7bc67a',
  },
  {
    sprite: '/sprites/barn.png',
    spriteW: 96,
    spriteH: 96,
    tag: 'QUEST',
    title: 'THE BARN',
    description: 'Store leveraged positions up to 5x on crop prices. Long or short the harvest.',
    tagColor: '#e05050',
  },
  {
    sprite: '/sprites/treasure-chest.png',
    spriteW: 48,
    spriteH: 48,
    tag: 'REWARD',
    title: 'TREASURE POOL',
    description: 'Deposit USDC, earn 0.3% fees from all trades automatically.',
    tagColor: '#f0c060',
  },
  {
    sprite: '/sprites/usdc-coin.png',
    spriteW: 32,
    spriteH: 32,
    tag: 'INFO',
    title: 'CRYSTAL BALL',
    description: 'Real prices from global markets via commodities-api.com, updated every 10 minutes.',
    tagColor: '#5090e0',
  },
]

export default function Features() {
  return (
    <section
      style={{
        background: 'var(--bg)',
        padding: '80px 24px',
        borderTop: '4px solid var(--border)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative crate corners */}
      <div className="absolute top-6 left-6 pointer-events-none hidden md:block">
        <img src="/sprites/crate.png" alt="" width={32} height={32} style={{ imageRendering: 'pixelated', opacity: 0.5 }} />
      </div>
      <div className="absolute top-6 right-6 pointer-events-none hidden md:block">
        <img src="/sprites/crate.png" alt="" width={32} height={32} style={{ imageRendering: 'pixelated', opacity: 0.5 }} />
      </div>
      <div className="absolute bottom-6 left-6 pointer-events-none hidden md:block">
        <img src="/sprites/crate.png" alt="" width={32} height={32} style={{ imageRendering: 'pixelated', opacity: 0.5 }} />
      </div>
      <div className="absolute bottom-6 right-6 pointer-events-none hidden md:block">
        <img src="/sprites/crate.png" alt="" width={32} height={32} style={{ imageRendering: 'pixelated', opacity: 0.5 }} />
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Bulletin board header */}
        <div
          className="text-center mb-12"
          style={{ position: 'relative' }}
        >
          {/* Board title plank */}
          <div
            style={{
              display: 'inline-block',
              background: '#3a2010',
              border: '4px solid #6b4020',
              boxShadow:
                '0 -4px 0 0 #6b4020, 0 4px 0 0 #2a1808, -4px 0 0 0 #6b4020, 4px 0 0 0 #2a1808, inset 0 0 20px rgba(0,0,0,0.4)',
              padding: '16px 40px',
              position: 'relative',
            }}
          >
            {/* Nail dots */}
            <div style={{
              position: 'absolute', top: '6px', left: '10px',
              width: '6px', height: '6px', background: '#8b6030', borderRadius: '0',
            }} />
            <div style={{
              position: 'absolute', top: '6px', right: '10px',
              width: '6px', height: '6px', background: '#8b6030', borderRadius: '0',
            }} />
            <h2
              className="pixel-font"
              style={{
                fontSize: 'clamp(10px, 2vw, 16px)',
                color: '#f0c060',
                textShadow: '2px 2px 0px #6b4000',
                margin: 0,
              }}
            >
              BULLETIN BOARD
            </h2>
          </div>
          <p
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: '18px',
              color: 'var(--muted)',
              marginTop: '12px',
            }}
          >
            Village notices · Check here for available quests
          </p>
        </div>

        {/* Feature cards — quest notices */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
          }}
        >
          {features.map(({ sprite, spriteW, spriteH, tag, title, description, tagColor }) => (
            <div
              key={title}
              style={{
                background: '#2a1c0e',
                border: '2px solid #6b4020',
                boxShadow:
                  '0 -2px 0 0 #6b4020, 0 2px 0 0 #1a0c04, -2px 0 0 0 #6b4020, 2px 0 0 0 #1a0c04',
                padding: '20px',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: '16px',
                position: 'relative',
              }}
            >
              {/* Corner pin */}
              <div style={{
                position: 'absolute', top: '8px', right: '10px',
                width: '8px', height: '8px', background: '#e05050',
                boxShadow: '0 0 4px rgba(224,80,80,0.6)',
              }} />

              {/* Sprite */}
              <div
                style={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '72px',
                  height: '72px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '2px solid #6b4020',
                }}
              >
                <img
                  src={sprite}
                  alt={title}
                  width={Math.min(spriteW, 56)}
                  height={Math.min(spriteH, 56)}
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>

              {/* Text */}
              <div style={{ flex: 1 }}>
                {/* Quest tag */}
                <div
                  style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '6px',
                    color: tagColor,
                    border: `1px solid ${tagColor}`,
                    display: 'inline-block',
                    padding: '2px 6px',
                    marginBottom: '8px',
                    opacity: 0.9,
                  }}
                >
                  {tag}
                </div>

                {/* Title */}
                <h3
                  className="pixel-font"
                  style={{
                    fontSize: '8px',
                    color: '#e8d8a0',
                    lineHeight: '2',
                    margin: '0 0 8px',
                  }}
                >
                  {title}
                </h3>

                {/* Description */}
                <p
                  style={{
                    fontFamily: "'VT323', monospace",
                    fontSize: '17px',
                    color: '#a09070',
                    lineHeight: '1.4',
                    margin: 0,
                  }}
                >
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
