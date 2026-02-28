/**
 * LandingPageDemo – a realistic landing page that uses the pure-CSS
 * <LiquidGlass> component for every glass-styled element.
 *
 * Navigate to  /#/demo  to view this page.
 */

import { LiquidGlass } from './LiquidGlass';
import styles from './LandingPageDemo.module.scss';
import bgImage from '@/assets/bg-tahoe-light.webp';

export function LandingPageDemo() {
  return (
    <div className={styles.page}>
      {/* ── Background ── */}
      <div className={styles.heroBg}>
        <img
          className={styles.heroBgImage}
          src={bgImage}
          alt=""
          aria-hidden="true"
        />
      </div>

      <div className={styles.content}>
        {/* ── Navbar ── */}
        <LiquidGlass
          variant="dark"
          blur={32}
          borderRadius={20}
          className={styles.navbar}
        >
          <div className={styles.navBrand}>
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" opacity="0.6" />
              <circle cx="12" cy="12" r="5" fill="white" opacity="0.3" />
            </svg>
            Liquid Glass
          </div>
          <ul className={styles.navLinks}>
            <li><a href="#features">Features</a></li>
            <li><a href="#showcase">Showcase</a></li>
            <li><a href="#pricing">Pricing</a></li>
          </ul>
          <a href="#" className={styles.navCta}>Get Started</a>
        </LiquidGlass>

        {/* ── Hero ── */}
        <section className={styles.hero}>
          <LiquidGlass variant="tinted" borderRadius={100} className={styles.heroBadge}>
            ✨ Pure CSS · No Canvas Required
          </LiquidGlass>

          <h1 className={styles.heroTitle}>
            Glass UI for the<br />Real&nbsp;Web
          </h1>
          <p className={styles.heroDesc}>
            A production-ready CSS component that brings Apple's Liquid Glass
            aesthetic to any website — using <code>backdrop-filter</code>,
            layered gradients, and zero JavaScript rendering overhead.
          </p>
          <div className={styles.heroActions}>
            <a href="#showcase" className={styles.btnPrimary}>See in Action</a>
            <LiquidGlass variant="default" borderRadius={16} className={styles.btnSecondary}>
              Documentation →
            </LiquidGlass>
          </div>
        </section>

        {/* ── Variant Showcase ── */}
        <section id="showcase" className={styles.showcase}>
          <span className={styles.showcaseTitle}>Component Variants</span>
          <div className={styles.variantGrid}>
            {([
              ['default', 'Default', 'Subtle transparent glass with soft blur and gentle highlight.'],
              ['tinted', 'Tinted', 'A cool-blue tinted glass suitable for info panels and badges.'],
              ['frosted', 'Frosted', 'Heavily blurred frosted pane — perfect for modal overlays.'],
              ['dark', 'Dark', 'Deep-tinted glass for dark-mode navigation bars and sidebars.'],
              ['vibrant', 'Vibrant', 'Saturated glass with a multi-colour gradient shimmer.'],
            ] as const).map(([variant, name, desc]) => (
              <LiquidGlass
                key={variant}
                variant={variant}
                borderRadius={20}
                className={styles.variantCard}
              >
                <span className={styles.variantName}>{name}</span>
                <span className={styles.variantDesc}>{desc}</span>
              </LiquidGlass>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className={styles.features}>
          <div className={styles.featuresHeading}>
            <h2>Why CSS Liquid Glass?</h2>
            <p>All the beauty, none of the canvas overhead.</p>
          </div>
          <div className={styles.featureGrid}>
            {[
              ['🚀', 'Zero Canvas', 'Works on any HTML element — divs, navbars, cards, modals. No WebGL context needed.'],
              ['🎨', 'Themeable', 'Five built-in variants plus full CSS-variable control for blur, tint, and radius.'],
              ['⚡', 'Performant', 'Leverages GPU-accelerated backdrop-filter — 60 fps on modern browsers.'],
              ['📱', 'Responsive', 'Fully fluid — adapts to any viewport without resize listeners or canvas scaling.'],
              ['♿', 'Accessible', 'Proper semantic HTML, keyboard navigable, screen-reader friendly.'],
              ['🧩', 'Composable', 'Drop-in React component. Wrap any content and pick a variant.'],
            ].map(([icon, title, desc]) => (
              <LiquidGlass
                key={title}
                variant="default"
                borderRadius={20}
                className={styles.featureCard}
              >
                <div className={styles.featureIcon}>{icon}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </LiquidGlass>
            ))}
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className={styles.pricing}>
          <h2>Simple Pricing</h2>
          <div className={styles.pricingGrid}>
            <LiquidGlass variant="default" borderRadius={24} className={styles.pricingCard}>
              <span className={styles.pricingPlan}>Free</span>
              <span className={styles.pricingPrice}>$0 <span>/ mo</span></span>
              <ul className={styles.pricingFeatures}>
                <li>5 glass components</li>
                <li>Default variant</li>
                <li>Community support</li>
              </ul>
              <button className={styles.pricingBtn}>Get Started</button>
            </LiquidGlass>

            <LiquidGlass variant="vibrant" borderRadius={24} className={`${styles.pricingCard} ${styles.featured}`}>
              <span className={styles.pricingPlan}>Pro</span>
              <span className={styles.pricingPrice}>$12 <span>/ mo</span></span>
              <ul className={styles.pricingFeatures}>
                <li>Unlimited components</li>
                <li>All 5 variants</li>
                <li>Priority support</li>
                <li>Custom theme builder</li>
              </ul>
              <button className={styles.pricingBtnFeatured}>Upgrade to Pro</button>
            </LiquidGlass>

            <LiquidGlass variant="dark" borderRadius={24} className={styles.pricingCard}>
              <span className={styles.pricingPlan}>Enterprise</span>
              <span className={styles.pricingPrice}>Custom</span>
              <ul className={styles.pricingFeatures}>
                <li>Everything in Pro</li>
                <li>SSR support</li>
                <li>Dedicated engineer</li>
                <li>SLA guarantee</li>
              </ul>
              <button className={styles.pricingBtn}>Contact Sales</button>
            </LiquidGlass>
          </div>
        </section>

        {/* ── Footer ── */}
        <LiquidGlass variant="dark" borderRadius={0} className={styles.footer}>
          <div className={styles.footerInner}>
            © 2025 Liquid Glass Studio · Built with pure CSS + React
          </div>
        </LiquidGlass>

        {/* ── Back to editor ── */}
        <LiquidGlass variant="tinted" borderRadius={14} className={styles.backLink}>
          <a href="#/" style={{ color: '#fff', textDecoration: 'none' }}>
            ← Back to Editor
          </a>
        </LiquidGlass>
      </div>
    </div>
  );
}
