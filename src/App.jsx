import { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'framer-motion';
import { CATEGORIES, PRODUCTS, fmt, productById } from './js/products';
import { storage } from './js/storage';
import { DEFAULT_MENU_ITEMS, loadMenuItems } from './js/menu-store';
import { setMenuProducts } from './js/products';
import Topbar from './components/Topbar';
import Hero from './components/Hero';
import CategoryNav from './components/CategoryNav';
import MenuSection from './components/MenuSection';
import CartDrawer from './components/CartDrawer';

const AdminDashboard = lazy(() => import('./components/AdminDashboard'));

export default function App() {
  const [cart, setCart] = useState({});
  const [overlayStep, setOverlayStep] = useState(null);
  const [lastOrder, setLastOrder] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].key);
  const [cartBounce, setCartBounce] = useState(0);
  const [menuItems, setMenuItems] = useState(DEFAULT_MENU_ITEMS);
  const [menuLoading, setMenuLoading] = useState(true);
  const prefersReduced = useReducedMotion();

  const applyMenuItems = useCallback((items) => {
    setMenuItems(items);
    setMenuProducts(items);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await storage.get('cart', false);
        if (res?.value) setCart(JSON.parse(res.value));
      } catch {}
    })();
  }, []);

  useEffect(() => {
    storage.set('cart', JSON.stringify(cart), false).catch(() => {});
  }, [cart]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setMenuLoading(true);
      const items = await loadMenuItems();
      if (!alive) return;
      applyMenuItems(items);
      setMenuLoading(false);
    })();
    return () => { alive = false; };
  }, [applyMenuItems]);

  useEffect(() => {
    const check = () => setShowAdmin(location.hash.startsWith('#admin-7x9q2p'));
    check();
    window.addEventListener('hashchange', check);
    return () => window.removeEventListener('hashchange', check);
  }, []);

  useEffect(() => {
    if (overlayStep) document.body.classList.add('overlay-open');
    else document.body.classList.remove('overlay-open');
    return () => document.body.classList.remove('overlay-open');
  }, [overlayStep]);

  const addToCart = useCallback((productId) => {
    setCart(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
    setCartBounce(n => n + 1);
  }, []);

  const incrementItem = useCallback((productId) => {
    setCart(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
  }, []);

  const decrementItem = useCallback((productId) => {
    setCart(prev => {
      const next = { ...prev };
      next[productId] = Math.max(0, (next[productId] || 0) - 1);
      if (next[productId] === 0) delete next[productId];
      return next;
    });
  }, []);

  const clearCart = useCallback(() => setCart({}), []);

  const cartEntries = useMemo(() =>
    Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => ({ ...(productById(id) || {}), qty }))
      .filter((entry) => entry.id),
    [cart]
  );
  const cartTotal = useMemo(() => cartEntries.reduce((s, it) => s + it.price * it.qty, 0), [cartEntries]);
  const cartCount = useMemo(() => cartEntries.reduce((s, it) => s + it.qty, 0), [cartEntries]);
  const visibleMenuItems = useMemo(
    () => menuItems.filter((item) => item.isVisible !== false),
    [menuItems]
  );

  if (showAdmin) {
    return (
      <Suspense fallback={null}>
        <AdminDashboard
          onMenuChange={applyMenuItems}
          onBack={() => { setShowAdmin(false); history.replaceState(null, '', location.pathname + location.search); }}
        />
      </Suspense>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <>
        <Topbar
          cartCount={cartCount}
          cartBounce={cartBounce}
          onCartClick={() => setOverlayStep('cart')}
        />
        <Hero />
        <CategoryNav activeCategory={activeCategory} />

        <main>
          <div className="wrap" id="menuRoot">
            {CATEGORIES.map((cat, catIndex) => (
              <MenuSection
                key={cat.key}
                category={cat}
                products={visibleMenuItems.filter((p) => p.cat === cat.key)}
                cart={cart}
                onAdd={addToCart}
                onIncrement={incrementItem}
                onDecrement={decrementItem}
                onBecomeVisible={() => setActiveCategory(cat.key)}
                catIndex={catIndex}
              />
            ))}
          </div>
        </main>

        {/* Sticky cart bar */}
        <AnimatePresence>
          {cartCount > 0 && (
            <motion.div
              className="sticky-cart"
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={prefersReduced ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 30 }}
            >
              <div className="sticky-cart-inner">
                <span className="count">
                  <span className="count-num">{cartCount}</span>
                  <span className="count-label">{cartCount === 1 ? 'صنف' : 'أصناف'}</span>
                </span>
                <button onClick={() => setOverlayStep('cart')}>
                  <span>🛒</span> عرض السلة
                </button>
                <span className="total">{fmt(cartTotal)}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cart Drawer */}
        <AnimatePresence>
          {overlayStep && (
            <CartDrawer
              step={overlayStep}
              cartEntries={cartEntries}
              cartTotal={cartTotal}
              cartCount={cartCount}
              onStepChange={setOverlayStep}
              onClose={() => {
                if (overlayStep === 'confirm') clearCart();
                setOverlayStep(null);
              }}
              onIncrement={incrementItem}
              onDecrement={decrementItem}
              onClearCart={clearCart}
              lastOrder={lastOrder}
              onOrderSubmitted={setLastOrder}
            />
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="site-footer">
          <div className="wrap footer-wrap">
            {/* Brand block */}
            <div className="footer-brand">
              <div className="footer-logo">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="SIDE BURGER" width="48" height="48">
                  <rect width="48" height="48" rx="12" fill="url(#footer-logo-grad)"/>
                  <defs>
                    <linearGradient id="footer-logo-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FF6B35"/>
                      <stop offset="1" stopColor="#FF4500"/>
                    </linearGradient>
                  </defs>
                  <rect x="10" y="15" width="28" height="4.5" rx="2.25" fill="white"/>
                  <rect x="10" y="22" width="28" height="4.5" rx="2.25" fill="white" opacity="0.7"/>
                  <rect x="10" y="29" width="28" height="4.5" rx="2.25" fill="white" opacity="0.4"/>
                </svg>
                <div className="footer-logo-text">
                  <span className="footer-logo-side">SIDE</span>
                  <span className="footer-logo-burger">BURGER</span>
                </div>
              </div>
              <p className="footer-tagline">برجر بنكهة لا تُنسى — جودة فاخرة في كل قضمة</p>
            </div>

            {/* Menu links */}
            <div className="footer-col">
              <h3 className="footer-col-title">المنيو</h3>
              {CATEGORIES.slice(0, 4).map(cat => (
                <a key={cat.key} href={`#cat-${cat.key}`} className="footer-link">
                  {cat.emoji} {cat.label}
                </a>
              ))}
            </div>

            {/* Contact */}
            <div className="footer-col">
              <h3 className="footer-col-title">تواصل معنا</h3>
              <a href="https://wa.me/966500000000" target="_blank" rel="noopener" className="footer-link">
                📱 واتساب
              </a>
              <a href="https://instagram.com/sideburger" target="_blank" rel="noopener" className="footer-link">
                📸 انستقرام
              </a>
              <a href="https://twitter.com/sideburger" target="_blank" rel="noopener" className="footer-link">
                🐦 تويتر
              </a>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="footer-bottom">
            <div className="wrap footer-bottom-inner">
              <span>© {new Date().getFullYear()} SIDE BURGER — جميع الحقوق محفوظة</span>
              <span className="footer-fire">🔥 Made with passion</span>
            </div>
          </div>
        </footer>
      </>
    </MotionConfig>
  );
}
