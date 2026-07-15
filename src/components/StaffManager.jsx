import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Images,
  Plus,
  RotateCcw,
  Save,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  deleteStaffImage,
  deleteStaffMember,
  loadStaff,
  upsertStaffMember,
  uploadStaffImage,
} from '../js/staff-store';
import { resolveMenuImageSource } from '../js/menu-images';

const createDraft = () => ({
  id: crypto.randomUUID(),
  name: '',
  role: '',
  imagePath: '',
  isVisible: true,
  sortOrder: 0,
});

const normalizeText = (value = '') => String(value ?? '').trim();

const normalizeSearchText = (value = '') =>
  String(value ?? '').toLowerCase()
    .replace(/[أإآا]/g, 'ا')
    .replace(/[ةه]/g, 'ه')
    .replace(/[يى]/g, 'ي')
    .replace(/[ًٌٍَُِّْ]/g, '');

function StaffImagePicker({ value, title, hint, onFile, onRemove, compact = false, busy = false }) {
  const prefersReduced = useReducedMotion();
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const openFileDialog = useCallback(() => inputRef.current?.click(), []);
  const handleFiles = useCallback(async (fileList) => {
    const file = fileList?.[0];
    if (!file) return;
    await onFile?.(file);
  }, [onFile]);

  return (
    <div className="staff-image-picker">
      <motion.div
        className={`staff-image-dropzone${dragging ? ' is-dragging' : ''}${compact ? ' is-compact' : ''}`}
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
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
        onDrop={async (e) => {
          e.preventDefault();
          setDragging(false);
          await handleFiles(e.dataTransfer.files);
        }}
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

        <div className="staff-image-preview">
          {value ? (
            <>
              <img src={resolveMenuImageSource(value)} alt="" />
              {onRemove && (
                <button
                  type="button"
                  className="staff-image-remove"
                  title="حذف الصورة"
                  aria-label="حذف الصورة"
                  disabled={busy}
                  onClick={(event) => {
                    event.stopPropagation();
                    onRemove();
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </>
          ) : (
            <div className="staff-image-empty">
              <Images />
              <span>بدون صورة</span>
            </div>
          )}
        </div>

        <div className="staff-image-copy">
          <strong>{title}</strong>
          <span>{busy ? 'جاري الرفع...' : hint}</span>
          <div className="staff-image-actions">
            <Button type="button" variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); openFileDialog(); }} disabled={busy}>
              <Upload data-icon="inline-start" />
              رفع
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function StaffManager() {
  const prefersReduced = useReducedMotion();
  const [members, setMembers] = useState([]);
  const [draft, setDraft] = useState(createDraft());
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [removeConfirmTarget, setRemoveConfirmTarget] = useState(null);
  const messageTimerRef = useRef(null);
  const uploadTimerRef = useRef(null);

  useEffect(() => () => {
    window.clearTimeout(messageTimerRef.current);
    window.clearTimeout(uploadTimerRef.current);
  }, []);

  const filteredMembers = useMemo(() => {
    const query = normalizeSearchText(searchTerm).trim();
    const words = query.split(/\s+/).filter(Boolean);
    return members.filter((m) => {
      if (visibilityFilter === 'visible' && !m.isVisible) return false;
      if (visibilityFilter === 'hidden' && m.isVisible) return false;
      if (words.length === 0) return true;
      const haystack = normalizeSearchText(`${m.name} ${m.role}`);
      return words.every((w) => haystack.includes(w));
    });
  }, [members, searchTerm, visibilityFilter]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await loadStaff();
      setMembers(data || []);
      setDraft((prev) => ({ ...prev, sortOrder: (data || []).length }));
    } catch {
      setError('تعذر تحميل فريق العمل.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const showMessage = useCallback((text, duration = 2200) => {
    setMessage(text);
    window.clearTimeout(messageTimerRef.current);
    messageTimerRef.current = window.setTimeout(() => setMessage(''), duration);
  }, []);

  const persistMember = useCallback(async (member) => {
    setSavingId(member.id);
    setError('');
    try {
      const name = normalizeText(member.name);
      if (!name) throw new Error('missing-name');
      await upsertStaffMember({ ...member, name, role: normalizeText(member.role) });
      setMembers((prev) => {
        const exists = prev.some((r) => r.id === member.id);
        return exists
          ? prev.map((r) => (r.id === member.id ? { ...member, name, role: normalizeText(member.role) } : r))
          : [...prev, { ...member, name, role: normalizeText(member.role) }].sort((a, b) => a.sortOrder - b.sortOrder);
      });
      showMessage('تم الحفظ.');
      return true;
    } catch (saveError) {
      setError(saveError?.message === 'missing-name' ? 'أدخل الاسم أولاً.' : 'تعذر الحفظ. تأكد من الاتصال.');
      return false;
    } finally {
      setSavingId('');
    }
  }, [showMessage]);

  const handleUpload = useCallback(async (file, targetMember) => {
    const memberId = targetMember?.id || draft.id;
    setSavingId(memberId);
    setError('');
    try {
      const uploaded = await uploadStaffImage(file, memberId);
      if (targetMember) {
        const next = { ...targetMember, imagePath: uploaded.path };
        await persistMember(next);
        showMessage('تم رفع الصورة وحفظها.');
      } else {
        setDraft((prev) => ({ ...prev, imagePath: uploaded.path }));
        showMessage('تم رفع الصورة، اضغط حفظ لإضافة العضو.');
      }
    } catch {
      setError('تعذر رفع الصورة. تأكد من وجود bucket staff-images.');
    } finally {
      setSavingId('');
    }
  }, [draft.id, persistMember, showMessage]);

  const requestRemoveImage = useCallback((targetMember) => {
    const currentPath = targetMember ? targetMember.imagePath : draft.imagePath;
    if (!currentPath) return;
    setRemoveConfirmTarget(targetMember || { isDraft: true });
  }, [draft.imagePath]);

  const handleRemoveImage = useCallback(async (targetMember) => {
    const isDraft = !targetMember || targetMember.isDraft;
    const resolved = isDraft ? null : targetMember;
    const memberId = resolved?.id || draft.id;
    const currentPath = resolved ? resolved.imagePath : draft.imagePath;
    if (!currentPath) return;

    setSavingId(memberId);
    setError('');
    try {
      await deleteStaffImage(currentPath);
      if (resolved) {
        const next = { ...resolved, imagePath: '' };
        await persistMember(next);
      } else {
        setDraft((prev) => ({ ...prev, imagePath: '' }));
      }
      showMessage('تم حذف الصورة.');
    } catch {
      setError('تعذر حذف الصورة.');
    } finally {
      setSavingId('');
      setRemoveConfirmTarget(null);
    }
  }, [draft.id, draft.imagePath, persistMember, showMessage]);

  const saveDraft = useCallback(async () => {
    if (!draft.name.trim()) {
      setError('أدخل الاسم أولاً.');
      return;
    }
    const next = { ...draft, sortOrder: members.length };
    const saved = await persistMember(next);
    if (saved !== false) setDraft(createDraft());
  }, [draft, members.length, persistMember]);

  const saveExisting = useCallback(async (member) => {
    await persistMember(member);
  }, [persistMember]);

  const removeMember = useCallback(async (memberId) => {
    setSavingId(memberId);
    setError('');
    try {
      const member = members.find((m) => m.id === memberId);
      if (member?.imagePath) await deleteStaffImage(member.imagePath).catch(() => {});
      await deleteStaffMember(memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      showMessage('تم حذف العضو.');
    } catch {
      setError('تعذر حذف العضو.');
    } finally {
      setSavingId('');
    }
  }, [members, showMessage]);

  const toggleVisibility = useCallback(async (member) => {
    const next = { ...member, isVisible: !member.isVisible };
    const saved = await persistMember(next);
    if (saved === false) setError('تعذر تحديث الظهور.');
  }, [persistMember]);

  const VISIBILITY_FILTERS = [
    { key: 'all', label: 'الكل' },
    { key: 'visible', label: 'ظاهر' },
    { key: 'hidden', label: 'مخفي' },
  ];

  return (
    <section className="staff-admin">
      <div className="staff-admin-head">
        <div className="staff-admin-head-copy">
          <span className="staff-admin-kicker">فريق العمل</span>
          <h3>إدارة أعضاء الفريق والصور</h3>
          <p>أضف وعدّل ورتب أعضاء فريق BAG BURGER.</p>
        </div>
        <div className="staff-admin-actions">
          <Button type="button" variant="outline" size="sm" onClick={loadAll} disabled={loading}>
            <RotateCcw data-icon="inline-start" />
            إعادة تحميل
          </Button>
        </div>
      </div>

      <AnimatePresence initial={false} mode="popLayout">
        {(message || error) && (
          <motion.div
            className={`staff-admin-banner${error ? ' is-error' : ' is-success'}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={prefersReduced ? { duration: 0 } : { duration: 0.22 }}
          >
            {error || message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="staff-create-card">
        <div className="staff-create-grid">
          <div className="field">
            <label htmlFor="staff-draft-name">الاسم</label>
            <Input
              id="staff-draft-name"
              value={draft.name}
              onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
              placeholder="مثال: أحمد"
            />
          </div>
          <div className="field">
            <label htmlFor="staff-draft-role">المسمى</label>
            <Input
              id="staff-draft-role"
              value={draft.role}
              onChange={(e) => setDraft((p) => ({ ...p, role: e.target.value }))}
              placeholder="مثال: شيف"
            />
          </div>
          <div className="staff-image-field">
            <StaffImagePicker
              value={draft.imagePath}
              title="صورة العضو"
              hint="اسحب أو ارفع صورة"
              busy={savingId === draft.id}
              onFile={(file) => handleUpload(file, null)}
              onRemove={draft.imagePath ? () => requestRemoveImage(null) : undefined}
            />
          </div>
        </div>
        <div className="staff-create-footer">
          <span />
          <Button type="button" onClick={saveDraft} disabled={savingId === draft.id || loading}>
            <Plus data-icon="inline-start" />
            إضافة عضو
          </Button>
        </div>
      </div>

      <div className="staff-filter-bar">
        <div className="search-box">
          <Search size={18} className="search-box-icon" aria-hidden="true" />
          <input
            type="text"
            className="search-box-input"
            aria-label="بحث في أعضاء الفريق"
            placeholder="ابحث بالاسم أو المسمى..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-row">
          {VISIBILITY_FILTERS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              className={`filter-pill${visibilityFilter === opt.key ? ' active' : ''}`}
              onClick={() => setVisibilityFilter(opt.key)}
            >
              <span className="filter-pill-label">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="staff-admin-list">
        <AnimatePresence initial={false}>
          {filteredMembers.map((member, index) => (
            <motion.article
              key={member.id}
              className={`staff-admin-row${member.isVisible ? '' : ' is-hidden'}`}
              layout={!prefersReduced}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={prefersReduced ? { duration: 0 } : { duration: 0.22 }}
            >
              <div className="staff-admin-thumb">
                <StaffImagePicker
                  value={member.imagePath}
                  title={member.name || 'صورة العضو'}
                  hint="اسحب أو ارفع صورة"
                  compact
                  busy={savingId === member.id}
                  onFile={(file) => handleUpload(file, member)}
                  onRemove={member.imagePath ? () => requestRemoveImage(member) : undefined}
                />
              </div>

              <div className="staff-admin-fields">
                <div className="field">
                  <label htmlFor={`staff-name-${member.id}`}>الاسم</label>
                  <Input
                    id={`staff-name-${member.id}`}
                    value={member.name}
                    onChange={(e) => setMembers((prev) => prev.map((m) => m.id === member.id ? { ...m, name: e.target.value } : m))}
                  />
                </div>
                <div className="field">
                  <label htmlFor={`staff-role-${member.id}`}>المسمى</label>
                  <Input
                    id={`staff-role-${member.id}`}
                    value={member.role}
                    onChange={(e) => setMembers((prev) => prev.map((m) => m.id === member.id ? { ...m, role: e.target.value } : m))}
                  />
                </div>
                <div className="staff-row-meta">
                  <span>#{index + 1}</span>
                </div>
              </div>

              <div className="staff-admin-actions-col">
                <button
                  type="button"
                  className={`staff-visibility${member.isVisible ? ' is-on' : ' is-off'}`}
                  onClick={() => toggleVisibility(member)}
                >
                  {member.isVisible ? <Eye data-icon="inline-start" /> : <EyeOff data-icon="inline-start" />}
                  {member.isVisible ? 'ظاهر' : 'مخفي'}
                </button>
                <Button type="button" size="sm" onClick={() => saveExisting(member)} disabled={savingId === member.id}>
                  <Save data-icon="inline-start" />
                  حفظ
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => removeMember(member.id)} disabled={savingId === member.id}>
                  <Trash2 data-icon="inline-start" />
                  حذف
                </Button>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>

      {!loading && members.length === 0 && (
        <div className="staff-admin-empty">لا يوجد أعضاء حالياً. أضف أول عضو من الأعلى.</div>
      )}
      {!loading && members.length > 0 && filteredMembers.length === 0 && (
        <div className="staff-admin-empty">
          لا يوجد أعضاء مطابقين لهذا البحث.
          <br />
          <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: 12 }} onClick={() => { setSearchTerm(''); setVisibilityFilter('all'); }}>
            إعادة ضبط الفلاتر
          </button>
        </div>
      )}

      <AnimatePresence>
        {removeConfirmTarget && (
          <motion.div
            className="lightbox"
            style={{ position: 'fixed', inset: 0, zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setRemoveConfirmTarget(null)}
          >
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-label="تأكيد حذف الصورة"
              className="staff-create-card"
              style={{ maxWidth: 360, textAlign: 'center' }}
              initial={{ scale: prefersReduced ? 1 : 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: prefersReduced ? 1 : 0.94, opacity: 0 }}
              transition={prefersReduced ? { duration: 0 } : { duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <p style={{ marginBottom: 20 }}>هل تريد حذف هذه الصورة؟</p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <Button type="button" variant="outline" onClick={() => setRemoveConfirmTarget(null)}>إلغاء</Button>
                <Button type="button" onClick={() => handleRemoveImage(removeConfirmTarget)}>
                  <Trash2 data-icon="inline-start" />
                  حذف
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
