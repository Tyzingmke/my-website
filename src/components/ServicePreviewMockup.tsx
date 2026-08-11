"use client";

type ServicePreviewMockupProps = {
  kind: "portfolio" | "business" | "commerce";
  label: string;
};

export function ServicePreviewMockup({ kind, label }: ServicePreviewMockupProps) {
  return (
    <div className={`service-ui service-ui-${kind}`} aria-hidden="true">
      <div className="service-ui-blur service-ui-blur-a" />
      <div className="service-ui-blur service-ui-blur-b" />
      <div className="service-ui-board">
        <div className="service-ui-window">
          <div className="service-ui-window-bar">
            <i />
            <i />
            <i />
            <span>{label}</span>
          </div>
          {kind === "portfolio" ? (
            <div className="service-ui-portfolio">
              <div className="service-ui-hero-card">
                <strong>Portfolio</strong>
                <span>Identity, story and selected work.</span>
              </div>
              <div className="service-ui-thumb-row">
                <b />
                <b />
                <b />
              </div>
              <div className="service-ui-copy-stack">
                <span />
                <span />
                <span />
              </div>
            </div>
          ) : null}
          {kind === "business" ? (
            <div className="service-ui-business">
              <div className="service-ui-side-nav">
                <b />
                <b />
                <b />
              </div>
              <div className="service-ui-dashboard">
                <div className="service-ui-stat-row">
                  <strong>SEO</strong>
                  <strong>Login</strong>
                  <strong>Leads</strong>
                </div>
                <div className="service-ui-panel-row">
                  <span />
                  <span />
                </div>
                <div className="service-ui-panel-wide" />
              </div>
            </div>
          ) : null}
          {kind === "commerce" ? (
            <div className="service-ui-commerce">
              <div className="service-ui-product-row">
                <b />
                <b />
                <b />
              </div>
              <div className="service-ui-checkout">
                <div className="service-ui-payment-pills">
                  <span>M-Pesa</span>
                  <span>Card</span>
                  <span>GPay</span>
                </div>
                <div className="service-ui-price-line">
                  <strong>Store</strong>
                  <em>Ready</em>
                </div>
                <div className="service-ui-copy-stack">
                  <span />
                  <span />
                </div>
              </div>
            </div>
          ) : null}
        </div>
        <div className="service-ui-floating service-ui-floating-main">
          <small>UI direction</small>
          <strong>{label}</strong>
        </div>
        <div className="service-ui-floating service-ui-floating-side">
          <small>Theme ready</small>
          <strong>Light / Dark</strong>
        </div>
      </div>
    </div>
  );
}
