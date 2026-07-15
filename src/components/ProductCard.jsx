import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Plus, Minus, Flame, Star, Sparkles, ImageOff } from 'lucide-react';
import { fmt } from '../js/products';
import { resolveMenuImageSource } from '../js/menu-images';
import { hoverSpring, premiumSpring } from '../js/motion';

const LABEL_CONFIG = {
  'best-seller': { icon: <Star size={10} />, text: 'الأكثر مبيعاً', className: 'label-best-seller' },
  'spicy':       { icon: <Flame size={10} />, text: 'حار', className: 'label-spicy' },
  'new':         { icon: <Sparkles size={10} />, text: 'جديد', className: 'label-new' },
  'combo':       { icon: null, text: 'كومبو', className: 'label-combo' },
};

export default function ProductCard({ product, qty = 0, onAdd, onIncrement, onDecrement }) {
  const prefersReduced = useReducedMotion();
  const imageSrc = resolveMenuImageSource(product.imagePath);
  const labels = product.labels || [];
  const priceParts = fmt(product.price).split(' ');

  return (
    <motion.article
      className="card menu-card-split"
      layout={!prefersReduced}
      whileHover={
        prefersReduced
          ? {}
          : {
              y: -4,
              scale: 1.015,
              boxShadow: '0 28px 52px -16px rgba(60,42,0,.22), 0 0 0 1.5px rgba(244,177,40,.3), 0 0 40px -12px rgba(244,177,40,.35)',
            }
      }
      whileTap={prefersReduced ? {} : { scale: 0.986 }}
      transition={prefersReduced ? { duration: 0 } : hoverSpring}
    >
      {/* Product image / visual */}
      <div className="menu-card-media" aria-hidden="true">
        {imageSrc ? (
          <img src={imageSrc} alt="" loading="lazy" decoding="async" />
        ) : (
          <div className="menu-card-media-empty">
            <ImageOff size={26} />
          </div>
        )}
        <div className="card-media-overlay" />
        {/* Labels */}
        {labels.length > 0 && (
          <div className="card-labels">
            {labels.map((label) => {
              const config = LABEL_CONFIG[label];
              if (!config) return null;
              return (
                <span key={label} className={`card-label ${config.className}`}>
                  {config.icon}
                  {config.text}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Gold info block */}
      <div className="menu-card-info">
        <div className="menu-card-price-badge" aria-hidden="true">
          <span className="menu-card-price-num">{priceParts[0]}</span>
          <span className="menu-card-price-cur">{priceParts[1]}</span>
        </div>

        <div className="menu-card-info-top">
          <h3 className="card-name">{product.name}</h3>
          {product.note && <p className="card-note">{product.note}</p>}
        </div>

        <div className="menu-card-info-bottom">
          <AnimatePresence mode="wait" initial={false}>
            {qty === 0 ? (
              <motion.button
                key="add"
                type="button"
                className="btn-add"
                onClick={() => onAdd(product.id)}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileTap={prefersReduced ? {} : { scale: 0.95 }}
                transition={prefersReduced ? { duration: 0 } : premiumSpring}
                layoutId={`action-${product.id}`}
              >
                <Plus size={15} />
                <span>أضف للسلة</span>
              </motion.button>
            ) : (
              <motion.div
                key="stepper"
                className="stepper"
                layoutId={`action-${product.id}`}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={prefersReduced ? { duration: 0 } : premiumSpring}
              >
                <motion.button
                  type="button"
                  aria-label={`تقليل ${product.name}`}
                  onClick={() => onDecrement(product.id)}
                  whileTap={prefersReduced ? {} : { scale: 0.84 }}
                  className="stepper-btn stepper-dec"
                >
                  <Minus size={13} />
                </motion.button>
                <span className="stepper-count">{qty}</span>
                <motion.button
                  type="button"
                  aria-label={`زيادة ${product.name}`}
                  onClick={() => onIncrement(product.id)}
                  whileTap={prefersReduced ? {} : { scale: 0.84 }}
                  className="stepper-btn stepper-inc"
                >
                  <Plus size={13} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  );
}
