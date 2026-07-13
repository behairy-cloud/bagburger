import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Images,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { CATEGORIES, fmt } from '../js/products';
import {
  DEFAULT_MENU_ITEMS,
  deleteMenuItem,
  loadMenuItems,
  seedMenuItems,
  upsertMenuItem,
  uploadMenuImage,
} from '../js/menu-store';
import { resolveMenuImageSource } from '../js/menu-images';

const CATEGORY_OPTIONS = CATEGORIES;

const normalizeText = (value = '') => String(value ?? '').trim();

const createDraft = () => ({
  id: crypto.randomUUID(),
  categoryKey: CATEGORY_OPTIONS[0]?.key || 'special',
  name: '',
  note: '',
  price: '',
  imagePath: DEFAULT_MENU_ITEMS[0]?.imagePath || '',
  isVisible: true,
  sortOrder: 0,
});

const uniqueGalleryImages = (items = []) =>
  [...new Set(items.map((item) => item.imagePath).filter(Boolean))].slice(0, 16);

const toEditableItem = (item, sortOrder = 0) => ({
  id: item.id || crypto.randomUUID(),
  categoryKey: item.categoryKey || item.cat || CATEGORY_OPTIONS[0]?.key || 'special',
  name: normalizeText(item.name),
  note: normalizeText(item.note),
  price: String(item.price ?? ''),
  imagePath: normalizeText(item.imagePath),
  isVisible: item.isVisible !== false,
  sortOrder: Number(item.sortOrder ?? sortOrder ?? 0),
});

function MenuImagePicker({
  value,
  fallback,
  gallery = [],
  title = 'صورة الصنف',
  hint = 'اسحب صورة هنا أو اختر من المعرض',
  onFile,
  onPick,
  className = '',
  compact = false,
  busy = false,
}) {
  const prefersReduced = useReducedMotion();
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const openFileDialog = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFiles = useCallback(
    async (fileList) => {
      const file = fileList?.[0];
      if (!file) return;
      await onFile?.(file);
    },
    [onFile]
  );

  const onDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragging(true);
  };

  const onDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);
  };

  const onDrop = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);
    await handleFiles(event.dataTransfer.files);
  };

  return (
    <div className={`menu-image-picker${className ? ` ${className}` : ''}`}>
      <motion.div
        className={`menu-image-dropzone${dragging ? ' is-dragging' : ''}${compact ? ' is-compact' : ''}`}
        role="button"
        tabIndex={0}
        aria-label={title}
        onClick={openFileDialog}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openFileDialog();
          }
        }}
        onDragEnter={onDragOver}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        whileHover={prefersReduced ? {} : { y: -1 }}
        whileTap={prefersReduced ? {} : { scale: 0.99 }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={async (event) => {
            await handleFiles(event.target.files);
            event.target.value = '';
          }}
          hidden
        />

        <div className="menu-image-preview">
          {value ? (
            <img src={resolveMenuImageSource(value, fallback)} alt="" />
          ) : (
            <div className="menu-image-empty">
              <Images />
              <span>لا توجد صورة</span>
            </div>
          )}
        </div>

        <div className="menu-image-copy">
          <div className="menu-image-copy-top">
            <strong>{title}</strong>
            <span>{busy ? 'جاري رفع الصورة...' : hint}</span>
          </div>

          <div className="menu-image-actions">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                openFileDialog();
              }}
              disabled={busy}
            >
              <Upload data-icon="inline-start" />
              رفع
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="menu-image-gallery" aria-label="معرض الصور">
        {gallery.map((path, index) => {
          const selected = value === path;
          return (
            <button
              key={path}
              type="button"
              className={selected ? 'is-selected' : ''}
              onClick={(event) => {
                event.stopPropagation();
                onPick?.(path);
              }}
              title="اختيار الصورة"
              aria-label={`اختيار الصورة ${index + 1}${selected ? ' (محددة)' : ''}`}
            >
              <img src={resolveMenuImageSource(path, fallback)} alt="" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function MenuManager({ onChange }) {
  const prefersReduced = useReducedMotion();
  const [items, setItems] = useState([]);
  const [draft, setDraft] = useState(createDraft());
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const messageTimerRef = useRef(null);
  const removeTimerRef = useRef(null);
  const uploadTimerRef = useRef(null);

  useEffect(
    () => () => {
      window.clearTimeout(messageTimerRef.current);
      window.clearTimeout(removeTimerRef.current);
      window.clearTimeout(uploadTimerRef.current);
    },
    []
  );

  const galleryImages = useMemo(
    () => uniqueGalleryImages([...DEFAULT_MENU_ITEMS, ...items]),
    [items]
  );

  const syncParent = useCallback(
    (nextItems) => {
      // Defer past the current render cycle to avoid the React warning:
      // "Cannot update a component (App) while rendering a different component (MenuManager)".
      // This happens when App's useEffect and MenuManager's useEffect both call applyMenuItems
      // concurrently while AnimatePresence is in the middle of a render pass.
      Promise.resolve().then(() => onChange?.(nextItems));
    },
    [onChange]
  );

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const loaded = await loadMenuItems();
      const mapped = (loaded || []).map((item, index) => toEditableItem(item, index));
      setItems(mapped);
      setDraft((prev) => ({ ...prev, sortOrder: mapped.length }));
      syncParent(mapped);
    } catch (loadError) {
      setError('تعذر تحميل المنيو الآن. حاول مرة أخرى بعد قليل.');
      const fallback = DEFAULT_MENU_ITEMS.map((item, index) => toEditableItem(item, index));
      setItems(fallback);
      setDraft((prev) => ({ ...prev, sortOrder: fallback.length }));
      syncParent(fallback);
    } finally {
      setLoading(false);
    }
  }, [syncParent]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const updateItem = useCallback((id, updater) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const next = typeof updater === 'function' ? updater(item) : updater;
        return { ...item, ...next };
      })
    );
  }, []);

  const persistItem = useCallback(
    async (item, { quiet = false } = {}) => {
      setSavingId(item.id);
      setError('');
      try {
        const price = Number(item.price);
        const name = normalizeText(item.name);
        if (!name) {
          throw new Error('missing-name');
        }
        if (!Number.isFinite(price) || price <= 0) {
          throw new Error('missing-price');
        }

        const payload = {
          ...item,
          name,
          note: normalizeText(item.note),
          price,
          imagePath: normalizeText(item.imagePath),
          categoryKey: normalizeText(item.categoryKey) || CATEGORY_OPTIONS[0]?.key || 'special',
          isVisible: item.isVisible !== false,
          sortOrder: Number(item.sortOrder ?? 0),
        };

        await upsertMenuItem(payload);
        setItems((prev) => {
          const exists = prev.some((row) => row.id === item.id);
          const next = exists
            ? prev.map((row) => (row.id === item.id ? payload : row))
            : [...prev, payload].sort((a, b) => {
                if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
                return a.name.localeCompare(b.name, 'ar');
              });
          syncParent(next);
          return next;
        });
        if (!quiet) {
          setMessage('تم حفظ التحديث بنجاح.');
          window.clearTimeout(messageTimerRef.current);
          messageTimerRef.current = window.setTimeout(() => setMessage(''), 2200);
        }
        return true;
      } catch (saveError) {
        setError(
          saveError?.message === 'missing-name'
            ? 'أضف اسم الصنف أولاً.'
            : saveError?.message === 'missing-price'
              ? 'أدخل سعرًا صحيحًا أكبر من صفر.'
              : 'تعذر حفظ الصنف حالياً. تأكد من اتصال Supabase.'
        );
        return false;
      } finally {
        setSavingId('');
      }
    },
    [syncParent]
  );

  const handleUpload = useCallback(
    async (file, targetItem) => {
      const itemId = targetItem?.id || draft.id;
      setSavingId(itemId);
      setError('');
      try {
        const uploaded = await uploadMenuImage(file, itemId);
        if (targetItem) {
          const next = { ...targetItem, imagePath: uploaded.path };
          await persistItem(next, { quiet: true });
          setMessage('تم رفع الصورة وحفظها في Supabase.');
        } else {
          setDraft((prev) => ({ ...prev, imagePath: uploaded.path }));
          setMessage('تم رفع الصورة، اضغط حفظ لإضافة الصنف.');
        }
        window.clearTimeout(uploadTimerRef.current);
        uploadTimerRef.current = window.setTimeout(() => setMessage(''), 2200);
      } catch (uploadError) {
        setError('تعذر رفع الصورة. تأكد أن bucket menu-item-images موجود.');
      } finally {
        setSavingId('');
      }
    },
    [draft.id, persistItem]
  );

  const saveDraft = useCallback(async () => {
    if (!draft.name.trim()) {
      setError('أضف اسم الصنف أولاً.');
      return;
    }
    if (!Number(draft.price) || Number(draft.price) <= 0) {
      setError('أدخل سعرًا صحيحًا أكبر من صفر.');
      return;
    }
    const nextItem = {
      ...draft,
      price: Number(draft.price) || 0,
      sortOrder: items.length,
    };
    const saved = await persistItem(nextItem);
    if (saved !== false) {
      setDraft(createDraft());
    }
  }, [draft, items.length, persistItem]);

  const saveExisting = useCallback(
    async (item) => {
      await persistItem(item);
    },
    [persistItem]
  );

  const removeItem = useCallback(
    async (itemId) => {
      setSavingId(itemId);
      setError('');
      try {
        await deleteMenuItem(itemId);
        setItems((prev) => {
          const next = prev.filter((item) => item.id !== itemId);
          syncParent(next);
          return next;
        });
        setMessage('تم حذف الصنف.');
        window.clearTimeout(removeTimerRef.current);
        removeTimerRef.current = window.setTimeout(() => setMessage(''), 2200);
      } catch (removeError) {
        setError('تعذر حذف الصنف.');
      } finally {
        setSavingId('');
      }
    },
    [syncParent]
  );

  const toggleVisibility = useCallback(
    async (item) => {
      const next = { ...item, isVisible: !item.isVisible };
      updateItem(item.id, next);
      await persistItem(next, { quiet: true });
    },
    [persistItem, updateItem]
  );

  const reseedCatalog = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await seedMenuItems(DEFAULT_MENU_ITEMS);
      const refreshed = DEFAULT_MENU_ITEMS.map((item, index) => toEditableItem(item, index));
      setItems(refreshed);
      setDraft((prev) => ({ ...prev, sortOrder: refreshed.length }));
      syncParent(refreshed);
      setMessage('تمت إعادة تحميل كتالوج المنيو.');
    } catch (seedError) {
      setError('تعذر إعادة تحميل كتالوج المنيو.');
    } finally {
      setLoading(false);
    }
  }, [syncParent]);

  const setField = useCallback((id, key, value) => {
    updateItem(id, { [key]: value });
  }, [updateItem]);

  const onDraftField = useCallback((key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <section className="menu-admin">
      <div className="menu-admin-head">
        <div className="menu-admin-head-copy">
          <span className="menu-admin-kicker">إدارة المنيو</span>
          <h3>تحكم سريع في الأصناف، الصور، والإظهار من نفس الشاشة</h3>
          <p>
            اسحب الصورة أو اخترها من المعرض، واحفظ التغيير في Supabase مباشرة. كل صنف هنا
            قابل للتعديل أو الإخفاء أو الحذف بدون مغادرة لوحة الإدارة.
          </p>
        </div>

        <div className="menu-admin-actions">
          <Button type="button" variant="outline" size="sm" onClick={reseedCatalog} disabled={loading}>
            <RotateCcw data-icon="inline-start" />
            تحديث الكتالوج
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={loadItems} disabled={loading}>
            <RotateCcw data-icon="inline-start" />
            إعادة تحميل
          </Button>
        </div>
      </div>

      <AnimatePresence initial={false} mode="popLayout">
        {(message || error) && (
          <motion.div
            className={`menu-admin-banner${error ? ' is-error' : ' is-success'}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={prefersReduced ? { duration: 0 } : { duration: 0.22 }}
          >
            {error || message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="menu-create-card">
        <div className="menu-create-grid">
          <div className="field">
            <label htmlFor="menu-draft-name">اسم الصنف</label>
            <Input
              id="menu-draft-name"
              value={draft.name}
              onChange={(event) => onDraftField('name', event.target.value)}
              placeholder="مثال: فاهيتا فراخ"
            />
          </div>

          <div className="field">
            <label htmlFor="menu-draft-price">السعر</label>
            <Input
              id="menu-draft-price"
              type="number"
              min="0"
              value={draft.price}
              onChange={(event) => onDraftField('price', event.target.value)}
              placeholder="مثال: 230"
            />
          </div>

          <div className="field">
            <label htmlFor="menu-draft-category">القسم</label>
            <select
              id="menu-draft-category"
              className="admin-select"
              value={draft.categoryKey}
              onChange={(event) => onDraftField('categoryKey', event.target.value)}
            >
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category.key} value={category.key}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field menu-field-wide">
            <label htmlFor="menu-draft-note">ملاحظة قصيرة</label>
            <Input
              id="menu-draft-note"
              value={draft.note}
              onChange={(event) => onDraftField('note', event.target.value)}
              placeholder="مثال: 1 كيلو"
            />
          </div>

          <div className="menu-image-field">
            <MenuImagePicker
              value={draft.imagePath}
              fallback={draft}
              gallery={galleryImages}
              title="صورة الصنف الجديد"
              hint="اسحب صورة أو اختر من صور المنيو الحالية"
              busy={savingId === draft.id}
              onFile={(file) => handleUpload(file, null)}
              onPick={(path) => onDraftField('imagePath', path)}
            />
          </div>
        </div>

        <div className="menu-create-footer">
          <div className="menu-create-meta">
            <span>{fmt(Number(draft.price) || 0)}</span>
            <span>{draft.imagePath ? 'صورة جاهزة' : 'بدون صورة'}</span>
          </div>

          <Button type="button" onClick={saveDraft} disabled={savingId === draft.id || loading}>
            <Plus data-icon="inline-start" />
            إضافة الصنف
          </Button>
        </div>
      </div>

      <div className="menu-admin-list">
        <AnimatePresence initial={false}>
          {items.map((item, index) => (
            <motion.article
              key={item.id}
              className={`menu-admin-row${item.isVisible ? '' : ' is-hidden'}`}
              layout={!prefersReduced}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={prefersReduced ? { duration: 0 } : { duration: 0.22 }}
            >
              <div className="menu-admin-thumb">
                <MenuImagePicker
                  value={item.imagePath}
                  fallback={item}
                  gallery={galleryImages}
                  title={item.name || 'صورة الصنف'}
                  hint="اسحب أو اختر"
                  compact
                  busy={savingId === item.id}
                  onFile={(file) => handleUpload(file, item)}
                  onPick={(path) => {
                    const next = { ...item, imagePath: path };
                    updateItem(item.id, next);
                    void saveExisting(next);
                  }}
                />
              </div>

              <div className="menu-admin-fields">
                <div className="field">
                  <label htmlFor={`menu-name-${item.id}`}>الاسم</label>
                  <Input
                    id={`menu-name-${item.id}`}
                    value={item.name}
                    onChange={(event) => setField(item.id, 'name', event.target.value)}
                  />
                </div>

                <div className="field">
                  <label htmlFor={`menu-price-${item.id}`}>السعر</label>
                  <Input
                    id={`menu-price-${item.id}`}
                    type="number"
                    min="0"
                    value={item.price}
                    onChange={(event) => setField(item.id, 'price', event.target.value)}
                  />
                </div>

                <div className="field">
                  <label htmlFor={`menu-category-${item.id}`}>القسم</label>
                  <select
                    id={`menu-category-${item.id}`}
                    className="admin-select"
                    value={item.categoryKey}
                    onChange={(event) => setField(item.id, 'categoryKey', event.target.value)}
                  >
                    {CATEGORY_OPTIONS.map((category) => (
                      <option key={category.key} value={category.key}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field menu-field-wide">
                  <label htmlFor={`menu-note-${item.id}`}>الملاحظة</label>
                  <Input
                    id={`menu-note-${item.id}`}
                    value={item.note}
                    onChange={(event) => setField(item.id, 'note', event.target.value)}
                  />
                </div>

                <div className="menu-row-meta">
                  <span>#{index + 1}</span>
                  <span>{fmt(Number(item.price) || 0)}</span>
                </div>
              </div>

              <div className="menu-admin-actions-col">
                <button
                  type="button"
                  className={`menu-visibility${item.isVisible ? ' is-on' : ' is-off'}`}
                  onClick={() => toggleVisibility(item)}
                >
                  {item.isVisible ? <Eye data-icon="inline-start" /> : <EyeOff data-icon="inline-start" />}
                  {item.isVisible ? 'ظاهر' : 'مخفي'}
                </button>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => saveExisting(item)}
                  disabled={savingId === item.id}
                >
                  <Save data-icon="inline-start" />
                  حفظ
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => removeItem(item.id)}
                  disabled={savingId === item.id}
                >
                  <Trash2 data-icon="inline-start" />
                  حذف
                </Button>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>

      {!loading && items.length === 0 && (
        <div className="menu-admin-empty">لا توجد أصناف حالياً. أضف أول صنف من الأعلى.</div>
      )}
    </section>
  );
}
