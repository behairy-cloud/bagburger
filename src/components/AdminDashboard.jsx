import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import {
  RefreshCcw,
  LogOut,
  Image as ImageIcon,
  X,
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  Search,
  Users,
} from 'lucide-react';
import {
  ORDER_STATUSES,
  STATUS_COLORS,
  fmt,
  productById,
  CATEGORIES,
  WHATSAPP_NUMBER_DISPLAY,
} from '../js/products';
import { supabase } from '../js/supabase';
import { adminSignIn, adminSignOut, getAdminSession, supabaseAuth } from '../js/supabase-auth';
import { syncSupabaseAuthSession } from '../js/supabase';
import { storage } from '../js/storage';
import { premiumEase, premiumSpring } from '../js/motion';
import { Dashboard } from './dashboard';
import { DashboardSkeleton } from './dashboard-skeleton';
import MenuManager from './MenuManager';
import StaffManager from './StaffManager';
import { LogoIcon } from './logo';

const statusOptions = ['الكل', ...ORDER_STATUSES];

/* ─── Luxury Tab Bar ─────────────────────────────────────────── */
const TABS = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { id: 'menu',      label: 'إدارة المنيو', icon: UtensilsCrossed },
  { id: 'staff',     label: 'فريق العمل',  icon: Users },
  { id: 'orders',    label: 'الطلبات',      icon: ClipboardList },
];

function AdminTabBar({ active, onSelect, freshCount, prefersReduced }) {
  return (
    <div className="admin-tab-bar-wrap">
      <div className="admin-tab-bar">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          const showBadge = tab.id === 'orders' && freshCount > 0;
          return (
            <motion.button
              key={tab.id}
              type="button"
              className={`admin-tab-btn${isActive ? ' is-active' : ''}`}
              onClick={() => onSelect(tab.id)}
              whileTap={prefersReduced ? {} : { scale: 0.97 }}
              layout
            >
              <span className="admin-tab-icon">
                <Icon size={16} />
              </span>
              <span className="admin-tab-label">{tab.label}</span>
              {showBadge && (
                <span className={`admin-tab-badge${isActive ? '' : ' is-alert'}`}>
                  {freshCount}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Order screenshot thumbnail (isolates its own load-error state) ─ */
function OrderScreenshotThumb({ src, onOpen }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="order-shot order-shot-empty">
        <ImageIcon size={26} />
        <span>{failed ? 'تعذر تحميل صورة الإيصال.' : 'لا توجد صورة مرفقة'}</span>
      </div>
    );
  }

  return (
    <button type="button" className="order-shot" onClick={onOpen}>
      <img src={src} alt="إيصال التحويل" onError={() => setFailed(true)} />
    </button>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function AdminDashboard({ onBack, onMenuChange }) {
  const prefersReduced = useReducedMotion();
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [filter, setFilter] = useState('الكل');
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [lightboxError, setLightboxError] = useState('');
  const [editingStatuses, setEditingStatuses] = useState({});
  const [visibleCount, setVisibleCount] = useState(12);
  const [activeTab, setActiveTab] = useState(
    () => sessionStorage.getItem('admin-active-tab') || 'dashboard'
  );
  const [searchTerm, setSearchTerm] = useState('');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const result = await storage.list('order:', true);
      if (result.orders && result.orders.length > 0) {
        result.orders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setOrders(result.orders);
      } else {
        const loaded = [];
        for (const key of result?.keys || []) {
          const orderData = await storage.get(key, true);
          if (!orderData?.value) continue;
          try { loaded.push(JSON.parse(orderData.value)); } catch { /* skip */ }
        }
        loaded.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setOrders(loaded);
      }
      setVisibleCount(12);
    } catch {
      setLoadError('تعذر تحميل الطلبات حالياً. تأكد من التخزين أو أعد المحاولة.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Restore session on mount (page refresh persistence)
  useEffect(() => {
    getAdminSession().then((session) => {
      if (session) setAuthed(true);
      setSessionChecked(true);
    });
  }, []);

  // Keep the data client (supabase.js) authenticated as the current admin —
  // it's a separate GoTrueClient instance from supabaseAuth and won't pick up
  // the session on its own, which RLS otherwise silently blocks all admin
  // reads/writes on.
  useEffect(() => {
    const { data: subscription } = supabaseAuth.auth.onAuthStateChange((_event, session) => {
      syncSupabaseAuthSession(session).then(() => {
        if (session) loadOrders();
      });
    });
    return () => subscription.subscription.unsubscribe();
  }, [loadOrders]);

  useEffect(() => { if (authed) loadOrders(); }, [authed, loadOrders]);

  useEffect(() => { sessionStorage.setItem('admin-active-tab', activeTab); }, [activeTab]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (!event.key || event.key.startsWith('order:')) loadOrders();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [loadOrders]);

  useEffect(() => {
    if (!authed || !supabase) return;
    const channel = supabase.channel('admin-orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        loadOrders();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [authed, loadOrders]);

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!email.trim() || !password) return;
    setLoginLoading(true);
    setLoginError('');
    const { session, error } = await adminSignIn(email.trim(), password);
    setLoginLoading(false);
    if (error) {
      setLoginError(error);
      return;
    }
    if (session) {
      setAuthed(true);
      setLoginError('');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    const order = orders.find((item) => item.id === orderId);
    if (!order) return;
    setUpdateError('');
    try {
      const updatedOrder = { ...order, status: newStatus };
      await storage.set(`order:${orderId}`, JSON.stringify(updatedOrder), true);
      setOrders((prev) => prev.map((item) => (item.id === orderId ? updatedOrder : item)));
      setEditingStatuses((prev) => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
    } catch {
      setUpdateError('فشل حفظ الحالة. لم يتم تطبيق التغيير.');
    }
  };

  const filteredOrders = useMemo(() => {
    const normalizeText = (text) => {
      if (!text) return '';
      return text
        .toString()
        .toLowerCase()
        // Unify Alef variations
        .replace(/[أإآا]/g, 'ا')
        // Unify Taa Marbouta and Haa
        .replace(/[ةه]/g, 'ه')
        // Unify Yaa and Alef Maksoura
        .replace(/[يى]/g, 'ي')
        // Remove Tashkeel (diacritics)
        .replace(/[ًٌٍَُِّْ]/g, '');
    };

    return orders.filter((order) => {
      const matchesStatus = filter === 'الكل' || order.status === filter;
      if (!matchesStatus) return false;
      
      if (!searchTerm.trim()) return true;

      const searchWords = normalizeText(searchTerm).split(/\s+/).filter(Boolean);
      if (searchWords.length === 0) return true;

      const searchableData = [
        order.name,
        order.phone,
        order.address,
        order.id,
        order.notes,
        ...(order.items || []).map(item => `${item.name || ''} ${item.categoryKey || ''}`)
      ].map(normalizeText).join(' ');

      // Multi-word exact match logic: Every typed word must exist somewhere in the data
      return searchWords.every(word => searchableData.includes(word));
    });
  }, [orders, filter, searchTerm]);
  const visibleOrders = useMemo(
    () => filteredOrders.slice(0, visibleCount),
    [filteredOrders, visibleCount]
  );
  const statusCounts = useMemo(
    () => ({
      الكل: orders.length,
      جديد: orders.filter((o) => o.status === 'جديد').length,
      'تم التأكيد': orders.filter((o) => o.status === 'تم التأكيد').length,
      'جاري التحضير': orders.filter((o) => o.status === 'جاري التحضير').length,
      'تم التوصيل': orders.filter((o) => o.status === 'تم التوصيل').length,
      ملغي: orders.filter((o) => o.status === 'ملغي').length,
    }),
    [orders]
  );
  const counts = useMemo(
    () => ({ total: orders.length, fresh: orders.filter((o) => o.status === 'جديد').length }),
    [orders]
  );

  const analytics = useMemo(() => {
    const dayMs = 24 * 60 * 60 * 1000;
    const startOfDay = (v) => { const d = new Date(v); d.setHours(0, 0, 0, 0); return d.getTime(); };
    const dayKey = (v) => new Date(startOfDay(v)).toISOString().slice(0, 10);
    const displayDay = (v) => new Intl.DateTimeFormat('ar-EG', { weekday: 'short' }).format(new Date(v));

    const revenueByDay = new Map();
    const flowByDay = new Map();
    const categoryCounts = new Map();
    const itemCounts = new Map();

    const series = Array.from({ length: 30 }, (_, index) => {
      const day = new Date(Date.now() - (29 - index) * dayMs);
      const key = dayKey(day);
      revenueByDay.set(key, 0);
      if (index >= 23) flowByDay.set(key, { incoming: 0, active: 0, day: displayDay(day) });
      return { key, fullDate: new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium' }).format(day) };
    });

    const statusGroups = {
      incoming: new Set(['جديد']),
      active: new Set(['تم التأكيد', 'جاري التحضير']),
    };

    const countByWindow = (startOffset, endOffset) => {
      const start = Date.now() - startOffset * dayMs;
      const end = Date.now() - endOffset * dayMs;
      return orders.filter((o) => { const v = o.createdAt || 0; return v >= start && v < end; });
    };

    orders.forEach((order) => {
      const createdAt = order.createdAt || Date.now();
      const key = dayKey(createdAt);
      if (revenueByDay.has(key)) revenueByDay.set(key, revenueByDay.get(key) + (order.total || 0));
      if (flowByDay.has(key)) {
        const current = flowByDay.get(key);
        const status = order.status || 'جديد';
        if (statusGroups.incoming.has(status)) current.incoming += 1;
        if (statusGroups.active.has(status)) current.active += 1;
        flowByDay.set(key, current);
      }
      (order.items || []).forEach((item) => {
        const catalogItem = productById(item.id);
        const categoryKey = catalogItem?.cat || 'special';
        const categoryLabel = CATEGORIES.find((c) => c.key === categoryKey)?.label || 'أخرى';
        categoryCounts.set(categoryLabel, (categoryCounts.get(categoryLabel) || 0) + (item.qty || 0));

        if (!itemCounts.has(item.id)) {
          const fallbackImage = catalogItem?.image_path || catalogItem?.imagePath || null;
          itemCounts.set(item.id, {
            id: item.id,
            name: item.name,
            qty: 0,
            revenue: 0,
            imagePath: fallbackImage
          });
        }
        const currentItem = itemCounts.get(item.id);
        currentItem.qty += (item.qty || 0);
        currentItem.revenue += ((item.qty || 0) * (item.price || 0));
      });
    });

    const toPct = (cur, prev) => (!prev ? (cur > 0 ? 100 : 0) : ((cur - prev) / prev) * 100);
    const last7 = countByWindow(7, 0);
    const prev7 = countByWindow(14, 7);
    const todayStart = startOfDay(Date.now());
    const yesterdayStart = todayStart - dayMs;
    const todayOrders = orders.filter((o) => (o.createdAt || 0) >= todayStart).length;
    const yesterdayOrders = orders.filter((o) => { const v = o.createdAt || 0; return v >= yesterdayStart && v < todayStart; }).length;
    const revenueTotal = orders.reduce((s, o) => s + (o.total || 0), 0);
    const last7Revenue = last7.reduce((s, o) => s + (o.total || 0), 0);
    const prev7Revenue = prev7.reduce((s, o) => s + (o.total || 0), 0);

    const summary = {
      totalOrders: orders.length,
      totalOrdersDelta: toPct(last7.length, prev7.length),
      todayOrders,
      todayOrdersDelta: toPct(todayOrders, yesterdayOrders),
      revenue: revenueTotal,
      revenueDelta: toPct(last7Revenue, prev7Revenue),
      averageOrderValue: orders.length ? revenueTotal / orders.length : 0,
      averageOrderValueDelta: toPct(
        last7.length ? last7Revenue / last7.length : 0,
        prev7.length ? prev7Revenue / prev7.length : 0
      ),
    };

    const revenueRows = series.map((row) => ({ date: row.key, fullDate: row.fullDate, revenue: revenueByDay.get(row.key) || 0 }));
    const flowRows = Array.from(flowByDay.entries()).map(([key, v]) => ({ date: key, day: v.day, incoming: v.incoming, active: v.active }));
    const categoryRows = [...categoryCounts.entries()].map(([category, share]) => ({ category, share })).sort((a, b) => b.share - a.share);
    const topItemsRows = [...itemCounts.values()].sort((a, b) => b.qty - a.qty);

    return { summary, revenueRows, flowRows, categoryRows, topItemsRows };
  }, [orders]);

  const filterVariant = {
    initial: { opacity: 0, y: 12 },
    animate: (index) => ({
      opacity: 1, y: 0,
      transition: { duration: prefersReduced ? 0 : 0.28, delay: prefersReduced ? 0 : index * 0.04, ease: premiumEase },
    }),
    exit: { opacity: 0, y: prefersReduced ? 0 : 12, transition: prefersReduced ? { duration: 0 } : { duration: 0.2, ease: premiumEase } },
  };

  const exitAdmin = async () => {
    setAuthed(false);
    setEmail('');
    setPassword('');
    setLoginError('');
    setLoadError('');
    setUpdateError('');
    setLightboxSrc(null);
    setEditingStatuses({});
    await adminSignOut();
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    onBack?.();
  };

  const copyWhatsappNumber = async () => {
    try { await navigator.clipboard.writeText(WHATSAPP_NUMBER_DISPLAY); } catch { /* ignore */ }
  };
  const openMenu = () => { window.location.hash = '#menu'; };
  const scrollToOrders = () => { setActiveTab('orders'); };

  /* ── Loading / session check ─── */
  if (!sessionChecked) {
    return (
      <div className="admin-login">
        <div style={{ color: 'var(--text-dimmer)', fontSize: 14 }}>جاري التحقق من الجلسة…</div>
      </div>
    );
  }

  /* ── Login screen ─── */
  if (!authed) {
    return (
      <div className="admin-login">
        <motion.div
          className="admin-login-box"
          initial={{ opacity: 0, scale: prefersReduced ? 1 : 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={prefersReduced ? { duration: 0 } : { duration: 0.34, ease: premiumEase }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <LogoIcon width={40} height={40} style={{ borderRadius: 10, boxShadow: '0 4px 16px rgba(60,42,0,.18)' }} />
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: 2, color: 'var(--fire-dim)', lineHeight: 1 }}>BAG BURGER</div>
              <div style={{ fontSize: 11, color: 'var(--text-dimmer)', letterSpacing: 1 }}>ADMIN PANEL</div>
            </div>
          </div>
          <p style={{ color: 'var(--text-dimmer)', fontSize: 14, marginBottom: 20 }}>أدخل بيانات الدخول لإدارة الطلبات والمنيو.</p>

          <form onSubmit={handleLogin}>
            <div className="field">
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (loginError) setLoginError(''); }}
                className={loginError ? 'invalid' : ''}
                autoFocus
                autoComplete="email"
                required
              />
            </div>
            <div className="field">
              <input
                type="password"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (loginError) setLoginError(''); }}
                className={loginError ? 'invalid' : ''}
                autoComplete="current-password"
                required
              />
            </div>
            <AnimatePresence initial={false}>
              {loginError && (
                <motion.div className="field-error" role="alert" aria-live="assertive" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                  {loginError}
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loginLoading}
              whileTap={prefersReduced ? {} : { scale: 0.97 }}
            >
              {loginLoading ? <span className="spinner" /> : null}
              {loginLoading ? 'جاري التحقق…' : 'دخول اللوحة'}
            </motion.button>
          </form>

          <motion.button type="button" onClick={exitAdmin} className="btn btn-outline btn-block" style={{ marginTop: 12 }} whileTap={prefersReduced ? {} : { scale: 0.97 }}>
            رجوع للموقع
          </motion.button>
        </motion.div>
      </div>
    );
  }

  /* ── Authenticated view ─── */
  return (
    <div className="admin-view">
      {/* ── Sticky global header ── */}
      <header className="admin-header">
        <div className="wrap admin-header-inner">
          <div className="header-meta">
            <h2>BAG BURGER — لوحة الإدارة</h2>
            <div className="admin-stats">
              <span>إجمالي الطلبات: {counts.total}</span>
              <span className="dot-divider" />
              <span>الطلبات الجديدة: {counts.fresh}</span>
            </div>
          </div>
          <div className="header-actions">
            <motion.button type="button" onClick={loadOrders} className="btn btn-outline" whileTap={prefersReduced ? {} : { scale: 0.96 }}>
              <RefreshCcw size={14} />
              تحديث
            </motion.button>
            <motion.button type="button" onClick={exitAdmin} className="btn btn-outline" whileTap={prefersReduced ? {} : { scale: 0.96 }}>
              <LogOut size={14} />
              خروج
            </motion.button>
          </div>
        </div>
      </header>

      {/* ── Luxury Tab Bar ── */}
      <AdminTabBar
        active={activeTab}
        onSelect={setActiveTab}
        freshCount={counts.fresh}
        prefersReduced={prefersReduced}
      />

      {/* ── Tab content ── */}
      <main className="wrap admin-body">

        {/* ════ DASHBOARD TAB ════ */}
        <AnimatePresence mode="wait" initial={false}>
          {activeTab === 'dashboard' && (
            <motion.div
              key="tab-dashboard"
              className="admin-tab-panel admin-tab-panel-dashboard"
              initial={prefersReduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReduced ? {} : { opacity: 0, y: -6 }}
              transition={{ duration: prefersReduced ? 0 : 0.26, ease: premiumEase }}
            >
              <div style={{ paddingTop: 24 }}>
                {loadError && (
                  <div className="admin-empty-state" style={{ marginBottom: 16, textAlign: 'right' }}>
                    <p>{loadError}</p>
                    <motion.button type="button" className="btn btn-outline btn-sm" onClick={loadOrders} whileTap={prefersReduced ? {} : { scale: 0.97 }}>
                      إعادة المحاولة
                    </motion.button>
                  </div>
                )}
                {loading ? (
                  <DashboardSkeleton />
                ) : (
                  <Dashboard
                    summary={analytics.summary}
                    revenueRows={analytics.revenueRows}
                    categoryRows={analytics.categoryRows}
                    flowRows={analytics.flowRows}
                    topItemsRows={analytics.topItemsRows}
                    onRefresh={loadOrders}
                    onCopyWhatsapp={copyWhatsappNumber}
                    onOpenMenu={openMenu}
                    onScrollOrders={scrollToOrders}
                  />
                )}
              </div>
            </motion.div>
          )}

          {/* ════ MENU TAB ════ */}
          {activeTab === 'menu' && (
            <motion.div
              key="tab-menu"
              className="admin-tab-panel"
              initial={prefersReduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReduced ? {} : { opacity: 0, y: -6 }}
              transition={{ duration: prefersReduced ? 0 : 0.26, ease: premiumEase }}
            >
              <MenuManager onChange={onMenuChange} />
            </motion.div>
          )}

          {/* ════ STAFF TAB ════ */}
          {activeTab === 'staff' && (
            <motion.div
              key="tab-staff"
              className="admin-tab-panel"
              initial={prefersReduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReduced ? {} : { opacity: 0, y: -6 }}
              transition={{ duration: prefersReduced ? 0 : 0.26, ease: premiumEase }}
            >
              <StaffManager />
            </motion.div>
          )}

          {/* ════ ORDERS TAB ════ */}
          {activeTab === 'orders' && (
            <motion.div
              key="tab-orders"
              className="admin-tab-panel"
              initial={prefersReduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReduced ? {} : { opacity: 0, y: -6 }}
              transition={{ duration: prefersReduced ? 0 : 0.26, ease: premiumEase }}
            >
              <div style={{ paddingTop: 24 }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                  <div className="search-box">
                    <Search size={18} className="search-box-icon" aria-hidden="true" />
                    <input
                      type="text"
                      className="search-box-input"
                      aria-label="بحث في الطلبات"
                      placeholder="ابحث بالاسم، رقم التليفون، العنوان، أو رقم الطلب..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <LayoutGroup id="admin-filters">
                  <div className="filter-row">
                    {statusOptions.map((status, index) => {
                      const active = filter === status;
                      return (
                        <motion.button
                          key={status}
                          className={`filter-pill${active ? ' active' : ''}`}
                          type="button"
                          onClick={() => setFilter(status)}
                          custom={index}
                          variants={filterVariant}
                          initial="initial"
                          animate="animate"
                          whileTap={prefersReduced ? {} : { scale: 0.98 }}
                        >
                          <span className="filter-pill-label">{status}</span>
                          <span className="filter-pill-count">{statusCounts[status] ?? 0}</span>
                          <AnimatePresence>
                            {active && !prefersReduced && (
                              <motion.span layoutId="admin-filter-indicator" className="filter-pill-bg" transition={premiumSpring} />
                            )}
                          </AnimatePresence>
                        </motion.button>
                      );
                    })}
                  </div>
                </LayoutGroup>

                {loadError && (
                  <div className="admin-empty-state" style={{ marginBottom: 16, textAlign: 'right' }}>
                    <p>{loadError}</p>
                    <motion.button type="button" className="btn btn-outline btn-sm" onClick={loadOrders} whileTap={prefersReduced ? {} : { scale: 0.97 }}>
                      إعادة المحاولة
                    </motion.button>
                  </div>
                )}

                {updateError && (
                  <div className="admin-empty-state" style={{ marginBottom: 16, textAlign: 'right' }}>
                    <p>{updateError}</p>
                  </div>
                )}

                {loading ? (
                  <motion.div className="admin-orders-grid" initial="initial" animate="animate">
                    {[1, 2, 3].map((index) => (
                      <motion.div key={index} className="skeleton-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
                        <motion.div className="skeleton skeleton-line h20 w60" animate={{ backgroundPositionX: ['200%', '-200%'] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }} />
                        <motion.div className="skeleton skeleton-line w40"    animate={{ backgroundPositionX: ['200%', '-200%'] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'linear', delay: 0.05 }} />
                        <motion.div className="skeleton skeleton-line w80"    animate={{ backgroundPositionX: ['200%', '-200%'] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'linear', delay: 0.08 }} />
                        <motion.div className="skeleton skeleton-line h80 w100" animate={{ backgroundPositionX: ['200%', '-200%'] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'linear', delay: 0.12 }} />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : filteredOrders.length === 0 ? (
                  <div className="admin-empty-state">
                    <p>لا يوجد طلبات تحت هذا التصنيف حالياً.</p>
                  </div>
                ) : (
                  <motion.div id="orders-panel" className="admin-orders-grid" layout={!prefersReduced}>
                    <AnimatePresence mode="popLayout" initial={false}>
                      {visibleOrders.map((order, index) => {
                        const statusColor = STATUS_COLORS[order.status] || { bg: 'rgba(32,32,32,0.08)', fg: 'var(--text-dim)' };
                        const formattedDate = new Date(order.createdAt || Date.now()).toLocaleString('ar-EG', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        });
                        const currentStatus = editingStatuses[order.id] || order.status;
                        return (
                          <motion.article
                            key={order.id}
                            className="order-card"
                            layout={!prefersReduced}
                            variants={filterVariant}
                            custom={index}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            whileHover={prefersReduced ? {} : { y: -2 }}
                            transition={prefersReduced ? { duration: 0 } : { duration: 0.24, ease: premiumEase }}
                          >
                            <div className="order-card-top">
                              <div>
                                <div className="order-id">{order.id}</div>
                                <div className="order-time">{formattedDate}</div>
                              </div>
                              <motion.div
                                className="status-badge"
                                animate={{ backgroundColor: statusColor.bg, color: statusColor.fg }}
                                transition={prefersReduced ? { duration: 0 } : { duration: 0.22, ease: premiumEase }}
                              >
                                {order.status}
                              </motion.div>
                            </div>

                            <div className="order-grid">
                              <div className="order-copy-panel">
                                <div className="order-detail-grid">
                                  <div className="order-detail">
                                    <span>الاسم</span>
                                    <strong>{order.name || '—'}</strong>
                                  </div>
                                  <div className="order-detail">
                                    <span>الموبايل</span>
                                    <a href={`tel:${order.phone}`} className="phone-link" dir="ltr">
                                      {order.phone || '—'}
                                    </a>
                                  </div>
                                  <div className="order-detail order-detail-wide">
                                    <span>العنوان</span>
                                    <strong>{order.address || '—'}</strong>
                                  </div>
                                </div>

                                {order.notes && (
                                  <div className="order-notes">
                                    <span>ملاحظات</span>
                                    <p>{order.notes}</p>
                                  </div>
                                )}

                                <div className="order-items">
                                  <div className="order-items-head">
                                    <span>العناصر</span>
                                    <span>السعر</span>
                                  </div>
                                  {order.items?.length ? (
                                    order.items.map((item) => (
                                      <div key={item.id} className="order-item-row">
                                        <span>{item.qty} x {item.name}</span>
                                        <span>{fmt(item.price * item.qty)}</span>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="order-item-row">
                                      <span>لا توجد عناصر</span>
                                    </div>
                                  )}
                                  <div className="order-total-line">
                                    <span>الإجمالي</span>
                                    <span>{fmt(order.total)}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="order-media-panel">
                                <OrderScreenshotThumb
                                  src={order.screenshot}
                                  onOpen={() => { setLightboxError(''); setLightboxSrc(order.screenshot); }}
                                />

                                <div className="order-actions">
                                  <select
                                    className="order-status-select"
                                    value={currentStatus}
                                    onChange={(event) =>
                                      setEditingStatuses((prev) => ({ ...prev, [order.id]: event.target.value }))
                                    }
                                  >
                                    {ORDER_STATUSES.map((s) => (
                                      <option key={s} value={s}>{s}</option>
                                    ))}
                                  </select>
                                  <motion.button
                                    type="button"
                                    className="btn btn-primary btn-sm order-save-btn"
                                    disabled={currentStatus === order.status}
                                    onClick={() => handleUpdateStatus(order.id, currentStatus)}
                                    whileTap={prefersReduced ? {} : { scale: 0.97 }}
                                  >
                                    حفظ الحالة
                                  </motion.button>
                                </div>
                              </div>
                            </div>
                          </motion.article>
                        );
                      })}
                    </AnimatePresence>
                  </motion.div>
                )}

                {!loading && visibleCount < filteredOrders.length && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
                    <motion.button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setVisibleCount((c) => c + 12)}
                      whileTap={prefersReduced ? {} : { scale: 0.97 }}
                    >
                      تحميل المزيد
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {(lightboxSrc || lightboxError) && (
          <motion.div
            className="lightbox"
            style={{ position: 'fixed', inset: 0, zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setLightboxSrc(null); setLightboxError(''); }}
          >
            <motion.div
              style={{ position: 'relative' }}
              initial={{ scale: prefersReduced ? 1 : 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: prefersReduced ? 1 : 0.94, opacity: 0 }}
              transition={prefersReduced ? { duration: 0 } : { duration: 0.28, ease: premiumEase }}
              onClick={(e) => e.stopPropagation()}
            >
              {lightboxSrc ? (
                <img src={lightboxSrc} alt="إيصال التحويل بالحجم الكامل" />
              ) : (
                <div className="lightbox-error">{lightboxError}</div>
              )}
              <motion.button
                type="button"
                className="lightbox-close"
                style={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => { setLightboxSrc(null); setLightboxError(''); }}
                whileTap={prefersReduced ? {} : { scale: 0.96 }}
              >
                <X size={18} />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
