import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Beef, Truck, Sparkles, ChevronDown } from 'lucide-react';
import { premiumEase, premiumSpring } from '../js/motion';
import { LogoIcon } from './logo';

const NAV_LINKS = [
  { label: 'HOME', href: '#top', active: true },
  { label: 'MENU', href: '#menuRoot' },
  { label: 'OUR STORY', href: '#ourStory' },
  { label: 'LOCATIONS', href: '#locations' },
  { label: 'CONTACT', href: '#contact' },
];

const FEATURE_ITEMS = [
  { icon: Beef, label: ['PREMIUM', 'INGREDIENTS'] },
  { icon: Truck, label: ['FAST', 'DELIVERY'] },
  { icon: Sparkles, label: ['FRESH', 'EVERYDAY'] },
];

export default function Hero() {
  const prefersReduced = useReducedMotion();

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: prefersReduced ? 0 : 22 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReduced ? 0 : 0.6, delay, ease: premiumEase },
    },
  });

  return (
    <section className="hero" id="top" dir="ltr" lang="en">
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
        <div className="hero-blob hero-blob-3" />
        <div className="hero-lines" />
      </div>

      <nav className="hero-nav" aria-label="Primary">
        <a href="#top" className="hero-logo" aria-label="Bag Burger — home">
          <LogoIcon width={48} height={48} aria-hidden="true" />
          <span className="hero-logo-text">BAG BURGER</span>
        </a>

        <ul className="hero-links">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <a href={link.href} className={link.active ? 'is-active' : ''}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a href="#menuRoot" className="hero-order-btn">
          ORDER NOW
        </a>
      </nav>

      <div className="hero-content">
        <motion.div className="hero-left" initial="initial" animate="animate">
          <motion.span className="hero-badge" variants={fadeUp(0)} initial="initial" animate="animate">
            🔥 Fresh. Bold. Fast.
          </motion.span>

          <motion.h1 className="hero-title" variants={fadeUp(0.05)} initial="initial" animate="animate">
            Big Flavor,<br />
            In Every <span>Bag</span>
          </motion.h1>

          <motion.p className="hero-tagline" variants={fadeUp(0.15)} initial="initial" animate="animate">
            Bold flavors, premium ingredients, made fresh just for you —
            the Bag Burger experience, delivered.
          </motion.p>

          <motion.div className="hero-ctas" variants={fadeUp(0.2)} initial="initial" animate="animate">
            <motion.a
              href="#menuRoot"
              className="hero-btn hero-btn-primary"
              whileHover={prefersReduced ? {} : { scale: 1.03 }}
              whileTap={prefersReduced ? {} : { scale: 0.97 }}
              transition={prefersReduced ? { duration: 0 } : premiumSpring}
            >
              ORDER NOW
              <ArrowRight size={18} strokeWidth={2.5} />
            </motion.a>
            <motion.a
              href="#menuRoot"
              className="hero-btn hero-btn-secondary"
              whileHover={prefersReduced ? {} : { scale: 1.03 }}
              whileTap={prefersReduced ? {} : { scale: 0.97 }}
              transition={prefersReduced ? { duration: 0 } : premiumSpring}
            >
              VIEW MENU
            </motion.a>
          </motion.div>

          <motion.div className="hero-features" variants={fadeUp(0.25)} initial="initial" animate="animate">
            {FEATURE_ITEMS.map(({ icon: Icon, label }) => (
              <div className="hero-feature-item" key={label.join(' ')}>
                <span className="hero-feature-icon">
                  <Icon size={20} strokeWidth={2} />
                </span>
                <span>
                  {label[0]}
                  <br />
                  {label[1]}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="hero-right"
          initial={{ opacity: 0, scale: prefersReduced ? 1 : 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={prefersReduced ? { duration: 0 } : { duration: 0.7, ease: premiumEase, delay: 0.1 }}
        >
          <picture>
            <source srcSet="/hero.webp" type="image/webp" />
            <img src="/hero.png" alt="Bag Burger — signature burger" loading="eager" fetchpriority="high" />
          </picture>
        </motion.div>
      </div>

      {!prefersReduced ? (
        <motion.a
          href="#menuRoot"
          className="hero-scroll"
          aria-label="Scroll down"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="hero-scroll-mouse">
            <span />
          </span>
          <span className="hero-scroll-label">SCROLL DOWN</span>
          <ChevronDown size={14} />
        </motion.a>
      ) : (
        <a href="#menuRoot" className="hero-scroll" aria-label="Scroll down">
          <span className="hero-scroll-mouse">
            <span />
          </span>
          <span className="hero-scroll-label">SCROLL DOWN</span>
          <ChevronDown size={14} />
        </a>
      )}
    </section>
  );
}
