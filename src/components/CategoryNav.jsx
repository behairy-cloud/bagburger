import { useEffect, useRef } from 'react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { CATEGORIES } from '../js/products';
import { premiumSpring } from '../js/motion';

export default function CategoryNav({ activeCategory }) {
  const prefersReduced = useReducedMotion();
  const navRef = useRef(null);

  useEffect(() => {
    const activeBtn = navRef.current?.querySelector(`[data-cat="${activeCategory}"]`);
    activeBtn?.scrollIntoView({
      behavior: prefersReduced ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [activeCategory, prefersReduced]);

  const handlePillClick = (key) => {
    document.getElementById(`cat-${key}`)?.scrollIntoView({
      behavior: prefersReduced ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  return (
    <nav className="cat-nav-wrap" aria-label="أقسام المنيو">
      <LayoutGroup id="category-nav">
        <div className="cat-nav" ref={navRef}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <motion.button
                key={cat.key}
                data-cat={cat.key}
                type="button"
                onClick={() => handlePillClick(cat.key)}
                className={`cat-pill${isActive ? ' active' : ''}`}
                whileHover={prefersReduced ? {} : { y: -1 }}
                whileTap={prefersReduced ? {} : { scale: 0.97 }}
                transition={prefersReduced ? { duration: 0 } : premiumSpring}
              >
                {cat.emoji && <span aria-hidden="true">{cat.emoji}</span>}
                <span>{cat.label}</span>
                <AnimatePresence>
                  {isActive && !prefersReduced && (
                    <motion.span
                      layoutId="cat-indicator"
                      className="cat-pill-indicator"
                      initial={false}
                      transition={premiumSpring}
                    />
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </LayoutGroup>
    </nav>
  );
}
