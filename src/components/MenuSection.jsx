import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import ProductCard from './ProductCard';
import { premiumEase } from '../js/motion';

export default function MenuSection({
  category,
  products,
  cart,
  onAdd,
  onIncrement,
  onDecrement,
  onBecomeVisible,
  catIndex,
}) {
  const sectionRef = useRef(null);
  const prefersReduced = useReducedMotion();
  const onBecomeVisibleRef = useRef(onBecomeVisible);

  useEffect(() => {
    onBecomeVisibleRef.current = onBecomeVisible;
  }, [onBecomeVisible]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onBecomeVisibleRef.current();
        }
      },
      {
        rootMargin: '-140px 0px -50% 0px',
        threshold: 0.15,
      }
    );
    const current = sectionRef.current;
    if (current) observer.observe(current);
    return () => {
      if (current) observer.unobserve(current);
      observer.disconnect();
    };
  }, []);

  const sectionVariants = {
    initial: { opacity: 0, y: prefersReduced ? 0 : 18 },
    animate: {
      opacity: 1, y: 0,
      transition: {
        duration: prefersReduced ? 0 : 0.35,
        delay: prefersReduced ? 0 : Math.min(catIndex * 0.04, 0.18),
        ease: premiumEase,
      },
    },
  };

  const gridVariants = {
    animate: {
      transition: { staggerChildren: prefersReduced ? 0 : 0.06 },
    },
  };

  if (products.length === 0) return null;

  return (
    <motion.section
      ref={sectionRef}
      id={`cat-${category.key}`}
      className="cat-section"
      variants={sectionVariants}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, amount: 0.28 }}
    >
      <header className="cat-head">
        <div className="cat-head-left">
          <h2>
            {category.emoji && <em className="cat-emoji" aria-hidden="true">{category.emoji}</em>}
            {category.label}
          </h2>
          {category.desc && <p>{category.desc}</p>}
        </div>
        <div className="cat-head-line" aria-hidden="true" />
      </header>

      <motion.div
        className="products-grid"
        variants={gridVariants}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.18 }}
      >
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: prefersReduced ? 0 : 20 }}
            whileInView={{
              opacity: 1, y: 0,
              transition: {
                duration: prefersReduced ? 0 : 0.32,
                delay: prefersReduced ? 0 : index * 0.04,
                ease: premiumEase,
              },
            }}
            viewport={{ once: true, amount: 0.15 }}
          >
            <ProductCard
              product={product}
              qty={cart[product.id] || 0}
              onAdd={onAdd}
              onIncrement={onIncrement}
              onDecrement={onDecrement}
            />
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
