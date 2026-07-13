import { motion, useReducedMotion } from 'framer-motion';
import { ShoppingBag, Phone } from 'lucide-react';
import { premiumEase, premiumSpring } from '../js/motion';
import { WHATSAPP_NUMBER_INTL } from '../js/products';

export default function Topbar({ cartCount, cartBounce, onCartClick }) {
  const prefersReduced = useReducedMotion();

  return (
    <header className="topbar">
      <div className="wrap topbar-inner">
        {/* Brand Logo */}
        <a href="#top" className="brand-mini" aria-label="SIDE BURGER - العودة للأعلى">
          <motion.div
            className="brand-mini-logo"
            whileHover={prefersReduced ? {} : { scale: 1.06, rotate: -2 }}
            whileTap={prefersReduced ? {} : { scale: 0.95 }}
            transition={prefersReduced ? { duration: 0 } : premiumSpring}
          >
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect width="40" height="40" rx="10" fill="#FF4500"/>
              <rect width="40" height="40" rx="10" fill="url(#topbar-logo-grad)"/>
              <defs>
                <linearGradient id="topbar-logo-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FF6B35"/>
                  <stop offset="1" stopColor="#FF4500"/>
                </linearGradient>
              </defs>
              {/* Burger icon paths */}
              <rect x="9" y="13" width="22" height="3.5" rx="1.75" fill="white"/>
              <rect x="9" y="18.5" width="22" height="3.5" rx="1.75" fill="white" opacity="0.7"/>
              <rect x="9" y="24" width="22" height="3.5" rx="1.75" fill="white" opacity="0.4"/>
            </svg>
          </motion.div>
          <div className="brand-mini-text">
            <span className="brand-mini-name">SIDE</span>
            <span className="brand-mini-sub">BURGER</span>
          </div>
        </a>

        {/* Actions */}
        <div className="topbar-actions">
          <motion.a
            href={`https://wa.me/${WHATSAPP_NUMBER_INTL}`}
            target="_blank"
            rel="noopener noreferrer"
            className="icon-btn"
            title="تواصل معنا"
            whileHover={prefersReduced ? {} : { scale: 1.05, y: -1 }}
            whileTap={prefersReduced ? {} : { scale: 0.94 }}
            transition={prefersReduced ? { duration: 0 } : { duration: 0.18, ease: premiumEase }}
          >
            <Phone size={18} />
          </motion.a>

          <motion.button
            type="button"
            onClick={onCartClick}
            className="icon-btn cart-btn"
            title="فتح عربة التسوق"
            whileHover={prefersReduced ? {} : { scale: 1.05, y: -1 }}
            whileTap={prefersReduced ? {} : { scale: 0.94 }}
            transition={prefersReduced ? { duration: 0 } : { duration: 0.18, ease: premiumEase }}
          >
            <motion.span
              key={cartBounce}
              animate={
                prefersReduced || cartBounce === 0
                  ? {}
                  : { scale: [1, 1.3, 1], rotate: [0, -8, 0] }
              }
              transition={prefersReduced ? { duration: 0 } : { duration: 0.36, ease: premiumEase }}
              style={{ display: 'inline-flex' }}
            >
              <ShoppingBag size={20} />
            </motion.span>
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </motion.button>
        </div>
      </div>
    </header>
  );
}
