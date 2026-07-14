import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Beef, Flame, Award, ChevronDown } from 'lucide-react';
import { premiumEase, premiumSpring } from '../js/motion';

const NAV_LINKS = [
  { label: 'HOME', href: '#top', active: true },
  { label: 'MENU', href: '#menuRoot' },
  { label: 'OUR STORY', href: '#ourStory' },
  { label: 'LOCATIONS', href: '#locations' },
  { label: 'CONTACT', href: '#contact' },
];

const TRUST_ITEMS = [
  { icon: Beef, label: ['PREMIUM', 'INGREDIENTS'] },
  { icon: Flame, label: ['FLAME', 'GRILLED'] },
  { icon: Award, label: ['QUALITY', 'GUARANTEED'] },
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
    <section className="hero-v2" id="top" dir="ltr" lang="en">
      <div className="hero-v2-bg" aria-hidden="true">
        <div className="hero-v2-gradient" />
        <div className="hero-v2-noise" />
      </div>

      <div className="hero-v2-image" aria-hidden="true">
        <img src="/Hero_.jpg" alt="" loading="eager" fetchpriority="high" />
      </div>

      <nav className="hero-v2-nav" aria-label="Primary">
        <a href="#top" className="hero-v2-logo" aria-label="Side Burger — home">
          <img src="/logo-crop-alpha.png" alt="Side Burger — Your Right Side" />
        </a>

        <ul className="hero-v2-links">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <a href={link.href} className={link.active ? 'is-active' : ''}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a href="#menuRoot" className="hero-v2-order-btn">
          ORDER NOW
        </a>
      </nav>

      <div className="hero-v2-content">
        <motion.div initial="initial" animate="animate">
          <motion.h1 className="hero-v2-title" variants={fadeUp(0)} initial="initial" animate="animate">
            BY YOUR
            <br />
            SIDE
          </motion.h1>

          <motion.div className="hero-v2-rule" variants={fadeUp(0.1)} initial="initial" animate="animate" />

          <motion.p className="hero-v2-tagline" variants={fadeUp(0.15)} initial="initial" animate="animate">
            Bold flavors. Premium ingredients.
            <br />
            Made fresh, just for you.
          </motion.p>

          <motion.div className="hero-v2-ctas" variants={fadeUp(0.2)} initial="initial" animate="animate">
            <motion.a
              href="#menuRoot"
              className="hero-v2-btn hero-v2-btn-primary"
              whileHover={prefersReduced ? {} : { scale: 1.03 }}
              whileTap={prefersReduced ? {} : { scale: 0.97 }}
              transition={prefersReduced ? { duration: 0 } : premiumSpring}
            >
              ORDER NOW
              <ArrowRight size={18} strokeWidth={2.5} />
            </motion.a>
            <motion.a
              href="#menuRoot"
              className="hero-v2-btn hero-v2-btn-secondary"
              whileHover={prefersReduced ? {} : { scale: 1.03 }}
              whileTap={prefersReduced ? {} : { scale: 0.97 }}
              transition={prefersReduced ? { duration: 0 } : premiumSpring}
            >
              VIEW MENU
            </motion.a>
          </motion.div>

          <motion.div className="hero-v2-trust" variants={fadeUp(0.25)} initial="initial" animate="animate">
            {TRUST_ITEMS.map(({ icon: Icon, label }) => (
              <div className="hero-v2-trust-item" key={label.join(' ')}>
                <Icon size={26} strokeWidth={1.5} />
                <span>
                  {label[0]}
                  <br />
                  {label[1]}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {!prefersReduced ? (
        <motion.a
          href="#menuRoot"
          className="hero-v2-scroll"
          aria-label="Scroll down"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="hero-v2-scroll-mouse">
            <span />
          </span>
          <span className="hero-v2-scroll-label">SCROLL DOWN</span>
          <ChevronDown size={14} />
        </motion.a>
      ) : (
        <a href="#menuRoot" className="hero-v2-scroll" aria-label="Scroll down">
          <span className="hero-v2-scroll-mouse">
            <span />
          </span>
          <span className="hero-v2-scroll-label">SCROLL DOWN</span>
          <ChevronDown size={14} />
        </a>
      )}
    </section>
  );
}
