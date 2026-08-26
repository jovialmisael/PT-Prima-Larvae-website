import type { ShowcaseSlide, MetricItem } from './useLoginController';

interface LoginHeroCarouselProps {
  slides: ShowcaseSlide[];
  activeSlideIndex: number;
  activeSlide: ShowcaseSlide;
  onNext: () => void;
  onPrev: () => void;
  onGoTo: (idx: number) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function LoginHeroCarousel({
  slides,
  activeSlideIndex,
  activeSlide,
  onNext,
  onPrev,
  onGoTo,
  onMouseEnter,
  onMouseLeave,
}: LoginHeroCarouselProps) {
  return (
    <>
      {/* Mobile Hero Header */}
      <div className="mobile-ocean-header">
        <div className="visual-bg-pattern" />
        <svg className="visual-waves-svg" viewBox="0 0 500 500" preserveAspectRatio="none">
          <path d="M0,100 C150,200 350,0 500,100 L500,500 L0,500 Z" fill="rgba(255,255,255,0.06)" />
        </svg>

        <div className="mobile-brand-row">
          <div className="brand-wrapper">
            <div className="brand-icon-box" style={{ background: '#ffffff', color: '#2563eb' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div>
              <h1 className="brand-title" style={{ color: '#ffffff' }}>PT Prima Larvae</h1>
              <p className="brand-subtitle" style={{ color: 'rgba(255,255,255,0.8)' }}>Hatchery Operating System</p>
            </div>
          </div>

          <div className="server-status-pill" style={{ background: 'rgba(240, 253, 244, 0.95)' }}>
            <span className="status-dot" />
            ONLINE
          </div>
        </div>

        <div className="mobile-metrics-pill">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          <span>8,500,000 PL • 29.5°C • TCBS NEGATIF</span>
        </div>
      </div>

      {/* Desktop Visual Panel */}
      <div 
        className="login-visual-panel"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="visual-bg-pattern" />

        <svg className="visual-waves-svg" viewBox="0 0 500 500" preserveAspectRatio="none">
          <path d="M0,100 C150,200 350,0 500,100 L500,500 L0,500 Z" fill="rgba(255,255,255,0.05)" />
          <path d="M0,250 C200,150 300,350 500,200 L500,500 L0,500 Z" fill="rgba(255,255,255,0.08)" />
        </svg>

        <div className="floating-glass-card">
          <div className="glass-card-header">
            <div className="glass-card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              <span>{activeSlide.cardTitle}</span>
            </div>
            <span className="glass-card-badge">{activeSlide.cardBadge}</span>
          </div>

          <div className="glass-metrics-grid">
            {activeSlide.metrics.map((metric: MetricItem, idx: number) => (
              <div key={idx} className="metric-box">
                <div className="metric-label">{metric.label}</div>
                <div className="metric-value">{metric.value}</div>
                <div className="metric-status">{metric.status}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="visual-bottom-content">
          <div className="feature-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {activeSlide.featureTag}
          </div>

          <h3 className="visual-headline">{activeSlide.headline}</h3>
          <p className="visual-subtext">{activeSlide.subtext}</p>

          <div className="carousel-controls">
            <div className="carousel-indicators">
              {slides.map((_, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onGoTo(idx)}
                  className={`indicator-pill ${idx === activeSlideIndex ? 'active' : ''}`}
                  title={`Slide ${idx + 1}`}
                  style={{ border: 'none', cursor: 'pointer', padding: 0 }}
                />
              ))}
            </div>

            <div className="carousel-arrows">
              <button 
                type="button" 
                onClick={onPrev}
                className="btn-arrow" 
                title="Slide Sebelumnya"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
              <button 
                type="button" 
                onClick={onNext}
                className="btn-arrow" 
                title="Slide Selanjutnya"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
