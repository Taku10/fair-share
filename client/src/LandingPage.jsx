import { useEffect, useState } from "react";

const features = [
  {
    icon: "🔄",
    title: "Smart Rotation",
    desc: "Chores auto-assign to the next person. No spreadsheets, no confusion.",
  },
  {
    icon: "💰",
    title: "Fair Splits",
    desc: "Track shared expenses and see who owes what in real-time.",
  },
  {
    icon: "💬",
    title: "Context Chat",
    desc: "Keep conversations next to tasks. Decisions stick where they matter.",
  },
  {
    icon: "📊",
    title: "Live Dashboard",
    desc: "Everyone sees the same truth: what's due, who's paid, what's next.",
  },
  {
    icon: "🔔",
    title: "Auto Reminders",
    desc: "Gentle nudges keep things moving without you playing house manager.",
  },
  {
    icon: "🎯",
    title: "Zero Setup",
    desc: "Invite roommates, add tasks, done. No calls, no learning curve.",
  },
];

const testimonials = [
  {
    quote: "Finally, no more awkward 'who owes what' conversations.",
    name: "Sarah Chen",
    role: "Berkeley Student Housing",
  },
  {
    quote: "We set it up in 10 minutes. Haven't argued about chores since.",
    name: "Marcus Rodriguez",
    role: "Brooklyn Apartment",
  },
  {
    quote: "It's like having a house manager, but free and actually helpful.",
    name: "Priya Patel",
    role: "Seattle Shared House",
  },
];

function LandingPage({ onGetStarted }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation after mount
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="landing-shell">
      {/* Brand Header */}
      <div className={`brand-header ${isVisible ? "brand-visible" : ""}`}>
        <h1 className="brand-name">
          <span className="brand-letter">F</span>
          <span className="brand-letter">a</span>
          <span className="brand-letter">i</span>
          <span className="brand-letter">r</span>
          <span className="brand-letter">S</span>
          <span className="brand-letter">h</span>
          <span className="brand-letter">a</span>
          <span className="brand-letter">r</span>
          <span className="brand-letter">e</span>
        </h1>
      </div>

      {/* Hero Section */}
      <div className={`hero ${isVisible ? "hero-visible" : ""}`}>
        <div className="landing-glow hero-glow-1" aria-hidden="true" />
        <div className="landing-glow hero-glow-2" aria-hidden="true" />
        <div className="hero-copy">
          <div className="hero-pill">
            <span className="pill-dot" />
            Household OS
          </div>
          <h1 className="hero-title">
            Keep your home
            <br />
            <span className="gradient-text">in flow</span>
          </h1>
          <p className="hero-subtitle">
            Chores, expenses, and chat in one calm place.
            <br />
            <span className="subtitle-accent">Built for roommates who want peace, not drama.</span>
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary hero-cta" onClick={onGetStarted}>
              Get started free
              <span className="cta-arrow">→</span>
            </button>
            <div className="hero-trust">
              <div className="trust-avatars">
                <div className="avatar">👤</div>
                <div className="avatar">👤</div>
                <div className="avatar">👤</div>
              </div>
              <span className="trust-text">Join 500+ happy households</span>
            </div>
          </div>
        </div>

        <div className="hero-panel" aria-hidden="true">
          <div className="panel-header">
            <span className="panel-dot" />
            <span className="panel-dot" />
            <span className="panel-dot" />
            <span className="panel-title">Live household snapshot</span>
          </div>
          <div className="panel-body">
            <div className="panel-card panel-card-animated">
              <div className="chip chip-green">Chores</div>
              <div className="panel-row">
                <span>Kitchen reset</span>
                <span className="status">Due today</span>
              </div>
              <div className="panel-row subtle">Auto rotates to Alex next week</div>
            </div>
            <div className="panel-card panel-card-animated" style={{ animationDelay: "0.1s" }}>
              <div className="chip chip-blue">Expenses</div>
              <div className="panel-row">
                <span>Groceries</span>
                <span className="status">$86.40 split</span>
              </div>
              <div className="panel-row subtle">Everyone is even</div>
            </div>
            <div className="panel-card panel-card-animated" style={{ animationDelay: "0.2s" }}>
              <div className="chip chip-pink">Chat</div>
              <div className="panel-row">
                <span>"Can we swap Sunday?"</span>
                <span className="status">New</span>
              </div>
              <div className="panel-row subtle">Reply with a quick reaction</div>
            </div>
          </div>
          <div className="panel-footer">
            <span className="footer-pulse" />
            Sync runs automatically
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <span className="section-label">Everything you need</span>
          <h2 className="section-title">Built for modern households</h2>
          <p className="section-desc">
            All the tools to keep your home organized, fair, and drama-free.
          </p>
        </div>
        <div className="features-grid">
          {features.map((feature, idx) => (
            <div
              className="feature-card"
              key={feature.title}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section">
        <div className="section-header">
          <span className="section-label">Simple setup</span>
          <h2 className="section-title">Launch in 3 steps</h2>
        </div>
        <div className="steps-container">
          <div className="step-item">
            <div className="step-number">01</div>
            <div className="step-content">
              <h3>Create your space</h3>
              <p>Sign up and name your household. Takes 30 seconds.</p>
            </div>
          </div>
          <div className="step-connector" />
          <div className="step-item">
            <div className="step-number">02</div>
            <div className="step-content">
              <h3>Invite roommates</h3>
              <p>Share one link. Everyone joins instantly.</p>
            </div>
          </div>
          <div className="step-connector" />
          <div className="step-item">
            <div className="step-number">03</div>
            <div className="step-content">
              <h3>Add tasks & costs</h3>
              <p>Drop in chores and expenses. We handle the rest.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="testimonials-section">
        <div className="section-header">
          <span className="section-label">Loved by roommates</span>
          <h2 className="section-title">Real feedback from real households</h2>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, idx) => (
            <div
              className="testimonial-card"
              key={testimonial.name}
              style={{ animationDelay: `${idx * 0.15}s` }}
            >
              <div className="testimonial-quote">&ldquo;{testimonial.quote}&rdquo;</div>
              <div className="testimonial-author">
                <div className="author-avatar">
                  {testimonial.name.charAt(0)}
                </div>
                <div className="author-info">
                  <div className="author-name">{testimonial.name}</div>
                  <div className="author-role">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="cta-section">
        <div className="cta-card">
          <div className="cta-content">
            <h2 className="cta-title">Ready to bring calm to your home?</h2>
            <p className="cta-desc">
              No credit card. No setup calls. Just a better way to live together.
            </p>
          </div>
          <button className="btn btn-primary cta-button" onClick={onGetStarted}>
            Start now — it's free
            <span className="cta-arrow">→</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">Fair Share</div>
            <p className="footer-tagline">Your household OS</p>
          </div>
          <div className="footer-note">
            Built with care for roommates everywhere. © 2025
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
