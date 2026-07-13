import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { premiumEase, premiumSpring } from '../js/motion';
import { WHATSAPP_NUMBER_INTL } from '../js/products';

const FireParticle = ({ x, delay, size, duration }) => {
  const [driftX] = useState(() => [0, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 80]);
  return (
    <motion.div
      className="fire-particle"
      style={{ left: `${x}%`, width: size, height: size }}
      animate={{
        y: [0, -120, -200],
        opacity: [0, 0.8, 0],
        scale: [0.6, 1, 0.3],
        x: driftX,
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeOut',
      }}
    />
  );
};

export default function Hero() {
  const prefersReduced = useReducedMotion();
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const handlePointerMove = (event) => {
    if (prefersReduced || event.pointerType !== 'mouse') return;
    const { innerWidth, innerHeight } = window;
    const x = ((event.clientX - innerWidth / 2) / innerWidth) * 14;
    const y = ((event.clientY - innerHeight / 2) / innerHeight) * 8;
    setParallax({ x, y });
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: prefersReduced ? 0 : 0.1,
        delayChildren: prefersReduced ? 0 : 0.15,
      },
    },
  };

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: prefersReduced ? 0 : 24 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReduced ? 0 : 0.5, delay, ease: premiumEase },
    },
  });

  const fireParticles = prefersReduced ? [] : [
    { x: 15, delay: 0,    size: 8,  duration: 2.4 },
    { x: 30, delay: 0.6,  size: 12, duration: 3.0 },
    { x: 50, delay: 0.2,  size: 10, duration: 2.7 },
    { x: 68, delay: 0.9,  size: 7,  duration: 2.2 },
    { x: 82, delay: 0.4,  size: 14, duration: 3.2 },
    { x: 45, delay: 1.2,  size: 9,  duration: 2.8 },
    { x: 25, delay: 1.6,  size: 6,  duration: 2.0 },
    { x: 75, delay: 0.7,  size: 11, duration: 3.5 },
  ];

  return (
    <section
      className="hero"
      id="top"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setParallax({ x: 0, y: 0 })}
    >
      {/* Dark cinematic background */}
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-bg-gradient" />
        <div className="hero-bg-noise" />
      </div>

      {/* Fire particles */}
      <div className="fire-particles-wrap" aria-hidden="true">
        {fireParticles.map((p, i) => (
          <FireParticle key={i} {...p} />
        ))}
      </div>

      {/* Animated glow orbs */}
      {!prefersReduced && (
        <div className="hero-orbs" aria-hidden="true">
          <motion.div
            className="hero-orb hero-orb-1"
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="hero-orb hero-orb-2"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
        </div>
      )}

      <div className="wrap hero-content">
        {/* Main burger visual */}
        <motion.div
          className="hero-visual"
          animate={
            prefersReduced
              ? {}
              : {
                  y: [0, -10, 0],
                  rotate: [0, 0.5, -0.5, 0],
                }
          }
          transition={
            prefersReduced ? { duration: 0 } : { duration: 5, repeat: Infinity, ease: 'easeInOut' }
          }
          style={prefersReduced ? {} : { transform: `translate(${parallax.x * 0.4}px, ${parallax.y * 0.3}px)` }}
        >
          <div className="hero-burger-icon" aria-hidden="true">
            <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="burger-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FF4500" stopOpacity="0.6"/>
                  <stop offset="100%" stopColor="#FF4500" stopOpacity="0"/>
                </radialGradient>
                <linearGradient id="bun-top" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C8730A"/>
                  <stop offset="100%" stopColor="#A05A08"/>
                </linearGradient>
                <linearGradient id="bun-bot" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4850F"/>
                  <stop offset="100%" stopColor="#B06510"/>
                </linearGradient>
                <linearGradient id="patty-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5C2D00"/>
                  <stop offset="100%" stopColor="#3D1E00"/>
                </linearGradient>
                <filter id="drop-shadow">
                  <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#FF4500" floodOpacity="0.4"/>
                </filter>
              </defs>

              {/* Glow */}
              <ellipse cx="120" cy="200" rx="80" ry="20" fill="url(#burger-glow)" />

              {/* Top bun */}
              <ellipse cx="120" cy="72" rx="75" ry="35" fill="url(#bun-top)" filter="url(#drop-shadow)"/>
              <ellipse cx="120" cy="62" rx="65" ry="22" fill="#D4850F" opacity="0.5"/>
              {/* Sesame seeds */}
              <ellipse cx="100" cy="58" rx="5" ry="3" fill="#E8A020" opacity="0.7"/>
              <ellipse cx="120" cy="52" rx="5" ry="3" fill="#E8A020" opacity="0.7"/>
              <ellipse cx="140" cy="57" rx="5" ry="3" fill="#E8A020" opacity="0.7"/>
              <ellipse cx="110" cy="66" rx="4" ry="2.5" fill="#E8A020" opacity="0.7"/>
              <ellipse cx="130" cy="65" rx="4" ry="2.5" fill="#E8A020" opacity="0.7"/>

              {/* Lettuce */}
              <path d="M50 108 Q80 98 120 104 Q160 98 190 108 Q160 118 120 114 Q80 118 50 108Z" fill="#2D7A2D"/>
              <path d="M55 106 Q85 95 120 102 Q155 95 185 106" stroke="#1A5C1A" strokeWidth="2" fill="none"/>

              {/* Cheese */}
              <path d="M58 120 L182 120 L188 132 L182 144 L58 144 L52 132Z" fill="#FFB800"/>
              <path d="M58 120 L182 120 L188 132" stroke="#E0A000" strokeWidth="1" fill="none" opacity="0.6"/>

              {/* Beef patty */}
              <rect x="55" y="148" width="130" height="24" rx="6" fill="url(#patty-grad)"/>
              <rect x="55" y="148" width="130" height="8" rx="6" fill="#6B3300" opacity="0.5"/>
              {/* Grill marks */}
              <line x1="80" y1="150" x2="75" y2="168" stroke="#FF6B35" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
              <line x1="100" y1="150" x2="95" y2="168" stroke="#FF6B35" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
              <line x1="120" y1="150" x2="115" y2="168" stroke="#FF6B35" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
              <line x1="140" y1="150" x2="135" y2="168" stroke="#FF6B35" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>

              {/* Tomato */}
              <path d="M58 176 Q120 168 182 176 Q160 186 120 184 Q80 186 58 176Z" fill="#CC2200"/>

              {/* Bottom bun */}
              <rect x="50" y="190" width="140" height="22" rx="11" fill="url(#bun-bot)"/>
              <rect x="50" y="202" width="140" height="10" rx="5" fill="#8B5000" opacity="0.3"/>
            </svg>
          </div>
        </motion.div>

        {/* Copy */}
        <motion.div
          className="hero-copy"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.span className="hero-eyebrow" variants={fadeUp(0)}>
            🔥 برجر بنكهة لا تُنسى
          </motion.span>

          <motion.h1 className="hero-title" variants={fadeUp(0.05)}>
            <span className="hero-title-side">SIDE</span>
            <span className="hero-title-burger">BURGER</span>
          </motion.h1>

          <motion.p className="hero-tagline" variants={fadeUp(0.1)}>
            تجربة برجر فاخرة بنكهات جريئة وجودة لا تتنازل عنها.
            <br />
            سماش برجر، كريسبي تشيكن، وأكثر — اطلب الآن.
          </motion.p>

          <motion.div className="hero-ctas" variants={fadeUp(0.15)}>
            <motion.a
              href="#menuRoot"
              className="btn btn-fire"
              whileHover={prefersReduced ? {} : { scale: 1.04, y: -2 }}
              whileTap={prefersReduced ? {} : { scale: 0.96 }}
              transition={prefersReduced ? { duration: 0 } : premiumSpring}
            >
              <span>🍔 اطلب الآن</span>
            </motion.a>
            <motion.a
              href={`https://wa.me/${WHATSAPP_NUMBER_INTL}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
              whileHover={prefersReduced ? {} : { scale: 1.04, y: -2 }}
              whileTap={prefersReduced ? {} : { scale: 0.96 }}
              transition={prefersReduced ? { duration: 0 } : premiumSpring}
            >
              تواصل معنا
            </motion.a>
          </motion.div>

          <motion.div className="hero-stats" variants={fadeUp(0.2)}>
            <div className="hero-stat">
              <span className="hero-stat-num">+50</span>
              <span className="hero-stat-label">صنف شهي</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">100%</span>
              <span className="hero-stat-label">لحم طازج</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">⭐ 4.9</span>
              <span className="hero-stat-label">تقييم العملاء</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      {!prefersReduced && (
        <motion.div
          className="hero-scroll-indicator"
          animate={{ y: [0, 8, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          ↓
        </motion.div>
      )}
    </section>
  );
}
