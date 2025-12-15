const benefits = [
  "Rotate chores automatically",
  "Split expenses fairly",
  "Chat where work happens",
];

function LandingPage({ onGetStarted }) {
  return (
    <div className="landing-shell">
      <div className="hero">
        <div className="landing-glow hero-glow-1" aria-hidden="true" />
        <div className="landing-glow hero-glow-2" aria-hidden="true" />
        <div className="hero-copy">
          <div className="hero-pill">Household OS</div>
          <h1 className="hero-title">Keep your home in flow</h1>
          <p className="hero-subtitle">Chores, expenses, and chat in one calm place.</p>
          <div className="hero-actions">
            <button className="btn btn-primary hero-cta" onClick={onGetStarted}>Get started</button>
          </div>
          <ul className="benefits-list">
            {benefits.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>

        <div className="hero-panel" aria-hidden="true">
          <div className="panel-header">
            <span className="panel-dot" />
            <span className="panel-dot" />
            <span className="panel-dot" />
            <span className="panel-title">Live household snapshot</span>
          </div>
          <div className="panel-body">
            <div className="panel-card">
              <div className="chip chip-green">Chores</div>
              <div className="panel-row">
                <span>Kitchen reset</span>
                <span className="status">Due today</span>
              </div>
              <div className="panel-row subtle">Auto rotates to Alex next week</div>
            </div>
            <div className="panel-card">
              <div className="chip chip-blue">Expenses</div>
              <div className="panel-row">
                <span>Groceries</span>
                <span className="status">$86.40 split</span>
              </div>
              <div className="panel-row subtle">Everyone is even</div>
            </div>
            <div className="panel-card">
              <div className="chip chip-pink">Chat</div>
              <div className="panel-row">
                <span>“Can we swap Sunday?”</span>
                <span className="status">New</span>
              </div>
              <div className="panel-row subtle">Reply with a quick reaction</div>
            </div>
          </div>
          <div className="panel-footer">Sync runs automatically.</div>
        </div>
      </div>

    </div>
  );
}

export default LandingPage;
