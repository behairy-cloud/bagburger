import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, Copy, Upload, X, ChevronRight } from 'lucide-react';
import { fmt, WHATSAPP_NUMBER_DISPLAY, WHATSAPP_NUMBER_INTL } from '../js/products';
import { storage } from '../js/storage';
import { panelSpring, premiumEase, premiumSpring } from '../js/motion';

const stepLabel = {
  cart: 'العربة',
  checkout: 'إتمام الطلب',
  confirm: 'تم إرسال طلبك',
};

export default function CartDrawer({
  step,
  cartEntries,
  cartTotal,
  cartCount,
  onStepChange,
  onClose,
  onIncrement,
  onDecrement,
  onClearCart,
  lastOrder,
  onOrderSubmitted,
}) {
  const prefersReduced = useReducedMotion();
  const isRtl = typeof document !== 'undefined' ? document.documentElement.dir === 'rtl' : true;
  const forwardX = isRtl ? -36 : 36;
  const backwardX = -forwardX;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [flowDirection, setFlowDirection] = useState('forward');
  const [shakeTrigger, setShakeTrigger] = useState({ key: 0, field: null });

  useEffect(() => {
    if (step === 'confirm') return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [step, onClose]);

  useEffect(() => {
    if (!compressing) {
      setUploadProgress((current) => (current > 0 && current < 100 ? 100 : current));
      return undefined;
    }

    let mounted = true;
    let frame = 0;
    let value = 12;
    setUploadProgress(12);

    const tick = () => {
      if (!mounted) return;
      value = Math.min(value + 4, 90);
      setUploadProgress(value);
      if (value < 90) {
        frame = window.setTimeout(tick, 90);
      }
    };

    frame = window.setTimeout(tick, 100);

    return () => {
      mounted = false;
      window.clearTimeout(frame);
    };
  }, [compressing]);

  const generateOrderId = () =>
    `TB-${Date.now().toString(36).toUpperCase().slice(-5)}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

  const handleCopyNumber = async () => {
    try {
      await navigator.clipboard.writeText(WHATSAPP_NUMBER_DISPLAY);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const compressImage = (file) => {
    if (!file) return;
    setCompressing(true);
    setUploadProgress(10);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1280;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.76);
        setScreenshot(dataUrl);
        setUploadProgress(100);
        window.setTimeout(() => {
          setCompressing(false);
        }, 220);
      };
      img.onerror = () => {
        setCompressing(false);
        setUploadProgress(0);
        alert('تعذر تحميل الصورة، يرجى اختيار صورة أخرى.');
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      setCompressing(false);
      setUploadProgress(0);
      alert('تعذر قراءة الملف، يرجى المحاولة مرة أخرى.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (event) => {
    if (event.target.files?.[0]) {
      compressImage(event.target.files[0]);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    if (event.dataTransfer.files?.[0]) {
      compressImage(event.dataTransfer.files[0]);
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (!name.trim()) nextErrors.name = 'الرجاء إدخال الاسم بالكامل';
    if (!phone.trim()) nextErrors.phone = 'الرجاء إدخال رقم الموبايل';
    else if (!/^05\d{8}$/.test(phone.trim())) nextErrors.phone = 'رقم الموبايل غير صحيح (مثال: 0512345678)';
    if (!address.trim()) nextErrors.address = 'الرجاء إدخال عنوان التوصيل بالتفصيل';
    if (!screenshot) nextErrors.screenshot = 'الرجاء رفع لقطة شاشة لإتمام التحويل';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const firstField = Object.keys(nextErrors)[0];
      setShakeTrigger({ key: Date.now(), field: firstField });
      return false;
    }

    return true;
  };

  const handleSubmitOrder = async (event) => {
    event.preventDefault();
    if (submitting || !validate()) return;

    setSubmitting(true);
    const orderId = generateOrderId();
    const orderData = {
      id: orderId,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      notes: notes.trim(),
      screenshot,
      items: cartEntries.map((item) => ({
        id: item.id,
        name: item.name,
        qty: item.qty,
        price: item.price,
      })),
      total: cartTotal,
      status: 'جديد',
      createdAt: Date.now(),
    };

    try {
      await storage.set(`order:${orderId}`, JSON.stringify(orderData), true);
      onOrderSubmitted(orderData);
      setFlowDirection('forward');
      onStepChange('confirm');
    } catch (error) {
      alert('حدث خطأ أثناء حفظ الطلب، يرجى المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  const navigateToCheckout = () => {
    setFlowDirection('forward');
    onStepChange('checkout');
  };

  const navigateBackToCart = () => {
    setFlowDirection('backward');
    onStepChange('cart');
  };

  const handleWhatsAppSend = () => {
    if (!lastOrder) return;
    const itemsText = lastOrder.items
      .map((item) => `- ${item.name} (${item.qty} ×) = ${fmt(item.price * item.qty)}`)
      .join('\n');
    const message = `طلب جديد من SIDE BURGER\n\nرقم الطلب: ${lastOrder.id}\nالاسم: ${lastOrder.name}\nالموبايل: ${lastOrder.phone}\nالعنوان: ${lastOrder.address}\n\nالطلبات:\n${itemsText}\n\nإجمالي الحساب: ${fmt(lastOrder.total)}\n\nتم إرفاق صورة التحويل بالطلب.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER_INTL}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  const stepVariants = {
    initial: (direction) => ({
      x: prefersReduced ? 0 : (direction === 'forward' ? forwardX : backwardX),
      opacity: prefersReduced ? 1 : 0,
      scale: prefersReduced ? 1 : 0.985,
    }),
    animate: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: prefersReduced ? { duration: 0 } : { duration: 0.32, ease: premiumEase },
    },
    exit: (direction) => ({
      x: prefersReduced ? 0 : (direction === 'forward' ? backwardX : forwardX),
      opacity: prefersReduced ? 1 : 0,
      scale: prefersReduced ? 1 : 0.985,
      transition: prefersReduced ? { duration: 0 } : { duration: 0.26, ease: premiumEase },
    }),
  };

  const inputWrapMotion = (field) => ({
    animate:
      shakeTrigger.field === field
        ? { x: [0, -6, 5, -3, 0] }
        : { x: 0 },
    transition: prefersReduced ? { duration: 0 } : { duration: 0.34, ease: premiumEase },
  });

  return (
    <div className="overlay">
      <motion.div
        className="overlay-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={prefersReduced ? { duration: 0 } : { duration: 0.18, ease: premiumEase }}
        onClick={step === 'confirm' ? undefined : onClose}
      />

      <motion.div
        className="overlay-panel"
        role="dialog"
        aria-modal="true"
        aria-label={stepLabel[step]}
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={prefersReduced ? { duration: 0 } : panelSpring}
      >
        <header className="overlay-header">
          <div style={{ width: 36 }}>
            {step === 'checkout' && (
              <motion.button
                type="button"
                className="ghost-x"
                onClick={navigateBackToCart}
                aria-label="رجوع"
                whileTap={prefersReduced ? {} : { scale: 0.94 }}
              >
                <ChevronRight size={18} />
              </motion.button>
            )}
          </div>

          <h2>{stepLabel[step]}</h2>

          <div style={{ width: 36, display: 'flex', justifyContent: 'flex-end' }}>
            {step !== 'confirm' && (
              <motion.button
                type="button"
                className="ghost-x"
                onClick={onClose}
                aria-label="إغلاق"
                whileTap={prefersReduced ? {} : { scale: 0.94 }}
              >
                <X size={18} />
              </motion.button>
            )}
          </div>
        </header>

        <div className="overlay-body">
          <AnimatePresence mode="wait" initial={false} custom={flowDirection}>
            {step === 'cart' && (
              <motion.div
                key="cart"
                className="step-container"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                custom={flowDirection}
              >
                {cartEntries.length === 0 ? (
                  <div className="empty-state">
                    <motion.div
                      initial={{ scale: 0.88, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={prefersReduced ? { duration: 0 } : { duration: 0.28, ease: premiumEase }}
                    >
                      <Check size={26} />
                    </motion.div>
                    <p>العربة فاضية، يلا اختار من المنيو</p>
                    <motion.button
                      type="button"
                      className="btn btn-primary"
                      onClick={onClose}
                      whileHover={prefersReduced ? {} : { scale: 1.03 }}
                      whileTap={prefersReduced ? {} : { scale: 0.96 }}
                    >
                      تصفح المنيو
                    </motion.button>
                  </div>
                ) : (
                  <>
                    <div className="cart-items-list">
                      <AnimatePresence initial={false}>
                        {cartEntries.map((item) => (
                          <motion.div
                            key={item.id}
                            className="cart-row"
                            layout={!prefersReduced}
                            initial={{ opacity: 0, y: 10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: 8, height: 0 }}
                            transition={prefersReduced ? { duration: 0 } : { duration: 0.24, ease: premiumEase }}
                          >
                            <div className="cart-row-info">
                              <b>{item.name}</b>
                              <span>{item.note}</span>
                            </div>
                            <div className="cart-row-right">
                              <div className="stepper">
                                <motion.button
                                  type="button"
                                  onClick={() => onDecrement(item.id)}
                                  whileTap={prefersReduced ? {} : { scale: 0.88 }}
                                >
                                  <ChevronRight size={14} />
                                </motion.button>
                                <span>{item.qty}</span>
                                <motion.button
                                  type="button"
                                  onClick={() => onIncrement(item.id)}
                                  whileTap={prefersReduced ? {} : { scale: 0.88 }}
                                >
                                  <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} />
                                </motion.button>
                              </div>
                              <div className="cart-row-price">{fmt(item.price * item.qty)}</div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    <div className="summary-line total">
                      <span>إجمالي الحساب</span>
                      <span>{fmt(cartTotal)}</span>
                    </div>

                    <motion.button
                      type="button"
                      className="btn btn-primary btn-block"
                      onClick={navigateToCheckout}
                      whileHover={prefersReduced ? {} : { scale: 1.02 }}
                      whileTap={prefersReduced ? {} : { scale: 0.97 }}
                    >
                      متابعة لإتمام الطلب
                    </motion.button>
                  </>
                )}
              </motion.div>
            )}

            {step === 'checkout' && (
              <motion.div
                key="checkout"
                className="step-container"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                custom={flowDirection}
              >
                <form onSubmit={handleSubmitOrder}>
                  <motion.div className="field" {...inputWrapMotion('name')}>
                    <label htmlFor="checkout-name">الاسم بالكامل *</label>
                    <input
                      id="checkout-name"
                      type="text"
                      value={name}
                      onChange={(event) => {
                        setName(event.target.value);
                        if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                      }}
                      className={errors.name ? 'invalid' : ''}
                      placeholder="الاسم لتأكيد الأوردر"
                    />
                    <AnimatePresence initial={false}>
                      {errors.name && (
                        <motion.div
                          className="field-error"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                        >
                          {errors.name}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div className="field" {...inputWrapMotion('phone')}>
                    <label htmlFor="checkout-phone">رقم الموبايل *</label>
                    <input
                      id="checkout-phone"
                      type="text"
                      inputMode="numeric"
                      dir="ltr"
                      value={phone}
                      onChange={(event) => {
                        setPhone(event.target.value);
                        if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }));
                      }}
                      className={errors.phone ? 'invalid' : ''}
                      placeholder="05xxxxxxxx"
                    />
                    <AnimatePresence initial={false}>
                      {errors.phone && (
                        <motion.div
                          className="field-error"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                        >
                          {errors.phone}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div className="field" {...inputWrapMotion('address')}>
                    <label htmlFor="checkout-address">العنوان بالتفصيل *</label>
                    <textarea
                      id="checkout-address"
                      rows="2"
                      value={address}
                      onChange={(event) => {
                        setAddress(event.target.value);
                        if (errors.address) setErrors((prev) => ({ ...prev, address: null }));
                      }}
                      className={errors.address ? 'invalid' : ''}
                      placeholder="المنطقة، الشارع، رقم العمارة، الشقة، وعلامة مميزة"
                    />
                    <AnimatePresence initial={false}>
                      {errors.address && (
                        <motion.div
                          className="field-error"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                        >
                          {errors.address}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <div className="field">
                    <label htmlFor="checkout-notes">ملاحظات إضافية (اختياري)</label>
                    <input
                      id="checkout-notes"
                      type="text"
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="أي تعليمات خاصة بالتحضير أو التوصيل"
                    />
                  </div>

                  <div className="pay-box">
                    <h4>خطوات التحويل فودافون كاش / إنستا باي</h4>
                    <p>
                      قم بتحويل إجمالي المبلغ <strong>{fmt(cartTotal)}</strong> إلى الرقم التالي، ثم ارفع لقطة شاشة التحويل.
                    </p>
                    <div className="pay-number-row">
                      <b dir="ltr">{WHATSAPP_NUMBER_DISPLAY}</b>
                      <motion.button
                        type="button"
                        className="copy-btn"
                        onClick={handleCopyNumber}
                        whileTap={prefersReduced ? {} : { scale: 0.96 }}
                      >
                        {copied ? 'تم النسخ' : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <Copy size={13} />
                            نسخ الرقم
                          </span>
                        )}
                      </motion.button>
                    </div>
                  </div>

                  <div
                    className={`upload-box ${dragOver ? 'drag-over' : ''} ${screenshot ? 'has-file' : ''} ${errors.screenshot ? 'invalid' : ''}`}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={(event) => {
                      event.preventDefault();
                      setDragOver(false);
                    }}
                    onDrop={handleDrop}
                  >
                    <input id="screenshot-input" type="file" accept="image/*" onChange={handleFileChange} className="upload-input" aria-label="رفع لقطة شاشة التحويل" />

                    <AnimatePresence mode="wait" initial={false}>
                      {compressing ? (
                        <motion.div
                          key="processing"
                          className="upload-processing"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                        >
                          <motion.div
                            className="spinner"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          />
                          <span>جارٍ معالجة الصورة وتهيئتها...</span>
                        </motion.div>
                      ) : screenshot ? (
                        <motion.div
                          key="preview"
                          className="upload-preview"
                          initial={{ opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.98 }}
                          transition={prefersReduced ? { duration: 0 } : { duration: 0.26, ease: premiumEase }}
                        >
                          <img src={screenshot} alt="لقطة التحويل" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="placeholder"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                        >
                          <Upload size={30} />
                          <div className="ut">اسحب وأسقط لقطة التحويل هنا، أو انقر للاختيار</div>
                          <div className="ut" style={{ marginTop: 6, color: 'var(--cream-dimmer)', fontSize: 12 }}>
                            سيتم ضغط الصورة تلقائياً قبل الإرسال
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {compressing && (
                      <div style={{ marginTop: 14 }}>
                        <div className="skeleton skeleton-line w100" style={{ height: 8, marginBottom: 8 }} />
                        <div style={{ color: 'var(--cream-dimmer)', fontSize: 12 }}>{uploadProgress}%</div>
                      </div>
                    )}
                  </div>

                  <AnimatePresence initial={false}>
                    {errors.screenshot && (
                      <motion.div
                        className="field-error"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                      >
                        {errors.screenshot}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={submitting || compressing}
                    whileHover={prefersReduced ? {} : { scale: 1.02 }}
                    whileTap={prefersReduced ? {} : { scale: 0.97 }}
                  >
                    {submitting ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                        <motion.span
                          className="spinner"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                        جاري تسجيل طلبك...
                      </span>
                    ) : (
                      `تأكيد الطلب — ${fmt(cartTotal)}`
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {step === 'confirm' && (
              <motion.div
                key="confirm"
                className="confirm-wrap"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                custom={flowDirection}
              >
                <motion.div
                  className="confirm-check"
                  initial={{ scale: 0.72, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={prefersReduced ? { duration: 0 } : { duration: 0.3, ease: premiumEase }}
                >
                  <svg viewBox="0 0 52 52" aria-hidden="true">
                    <motion.path
                      d="M14 27l7 7 17-17"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={prefersReduced ? { duration: 0 } : { duration: 0.45, ease: premiumEase, delay: 0.1 }}
                    />
                  </svg>
                </motion.div>

                <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--cream)', fontSize: '28px', margin: '0 0 10px' }}>
                  تم تسجيل طلبك بنجاح!
                </h3>

                <div className="confirm-id">{lastOrder?.id}</div>

                <p>
                  الخطوة الأخيرة: اضغط على الزر بالأسفل لإرسال تفاصيل الطلب وإيصال الدفع إلى خدمة العملاء عبر واتساب.
                </p>

                <div style={{ display: 'grid', gap: 10, marginTop: 22 }}>
                  <motion.button
                    type="button"
                    className="btn btn-primary btn-block"
                    onClick={handleWhatsAppSend}
                    whileHover={prefersReduced ? {} : { scale: 1.02 }}
                    whileTap={prefersReduced ? {} : { scale: 0.97 }}
                  >
                    إرسال للواتساب وتأكيد الطلب
                  </motion.button>
                  <motion.button
                    type="button"
                    className="btn btn-outline btn-block"
                    onClick={() => {
                      onClearCart();
                      onClose();
                    }}
                    whileHover={prefersReduced ? {} : { scale: 1.01 }}
                    whileTap={prefersReduced ? {} : { scale: 0.97 }}
                  >
                    الرجوع للمنيو
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
