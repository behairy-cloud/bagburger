import { motion, useReducedMotion } from 'framer-motion';
import { ShoppingBag, Phone } from 'lucide-react';
import { premiumEase, premiumSpring } from '../js/motion';
import { WHATSAPP_NUMBER_INTL } from '../js/products';
import { LogoIcon } from './logo';

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
            <LogoIcon width={40} height={40} aria-hidden="true" />
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
