import React, { useState, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import * as siteData from './data';
import './contribute-widget.css';

interface CourseOption {
  id: string;
  name: string;
  major: string;
  level: number;
  semesterLabel: string;
}

function normalizeSemester(raw: unknown, idHint: string, keyHint: string): string {
  const combined = `${String(raw ?? '')} ${idHint} ${keyHint}`.toLowerCase();
  if (
    combined.includes('ثاني') ||
    combined.includes('second') ||
    combined.includes('sem2') ||
    combined.includes('s2') ||
    combined.includes('t2') ||
    /[-_]2[-_]/.test(idHint)
  ) {
    return 'الفصل الثاني';
  }
  if (
    combined.includes('أول') ||
    combined.includes('اول') ||
    combined.includes('first') ||
    combined.includes('sem1') ||
    combined.includes('s1') ||
    combined.includes('t1') ||
    /[-_]1[-_]/.test(idHint)
  ) {
    return 'الفصل الأول';
  }
  return '';
}

function extractCourses(): CourseOption[] {
  const list: CourseOption[] = [];
  const seen = new Set<string>();

  const walk = (obj: unknown, majorHint = '', levelHint = 0, semHint = '') => {
    if (!obj || typeof obj !== 'object') return;
    if (Array.isArray(obj)) {
      obj.forEach((item) => walk(item, majorHint, levelHint, semHint));
      return;
    }

    const rec = obj as Record<string, unknown>;

    // تحديد التخصص من الحقول المحتملة
    const rawMajor = String(rec.major ?? rec.track ?? rec.department ?? rec.specialization ?? majorHint).toUpperCase();
    const detectedMajor = rawMajor.includes('CS') ? 'CS' : rawMajor.includes('IT') ? 'IT' : majorHint;

    // تحديد المستوى من الحقول المحتملة
    const rawLevel = rec.level ?? rec.year ?? rec.stage ?? levelHint;
    const numLevel = typeof rawLevel === 'number' ? rawLevel : Number(String(rawLevel).match(/[1-4]/)?.[0] || 0);
    const detectedLevel = numLevel >= 1 && numLevel <= 4 ? numLevel : levelHint;

    // تحديد الفصل الدراسي من الحقول المحتملة
    const rawSem = rec.semester ?? rec.term ?? rec.period ?? semHint;
    const detectedSem = normalizeSemester(rawSem, typeof rec.id === 'string' ? rec.id : '', '');

    if (typeof rec.id === 'string' && typeof rec.name === 'string') {
      const idUpper = rec.id.toUpperCase();
      const finalMajor = detectedMajor || (idUpper.includes('CS') ? 'CS' : idUpper.includes('IT') ? 'IT' : 'IT');
      const idLvl = Number(rec.id.match(/(?:it|cs|level|lvl|y)[-_]?([1-4])/i)?.[1] || 0);
      const finalLevel = detectedLevel || (idLvl >= 1 && idLvl <= 4 ? idLvl : 1);
      const finalSem = detectedSem || normalizeSemester('', rec.id, '');
      const uniqueKey = `${finalMajor}_${finalLevel}_${rec.id}`;

      if (!seen.has(uniqueKey)) {
        seen.add(uniqueKey);
        list.push({
          id: rec.id,
          name: rec.name.trim(),
          major: finalMajor,
          level: finalLevel,
          semesterLabel: finalSem,
        });
      }
    }

    Object.entries(rec).forEach(([k, v]) => {
      const kUpper = k.toUpperCase();
      const nextMajor = kUpper === 'CS' || kUpper.startsWith('CS_') || kUpper.endsWith('_CS')
        ? 'CS'
        : kUpper === 'IT' || kUpper.startsWith('IT_') || kUpper.endsWith('_IT')
        ? 'IT'
        : detectedMajor;

      const kLvl = Number(k.match(/(?:level|lvl|year|y|مستوى)[-_]?([1-4])/i)?.[1] || 0);
      const nextLevel = kLvl >= 1 && kLvl <= 4 ? kLvl : detectedLevel;
      const nextSem = normalizeSemester(k, '', k) || detectedSem;

      walk(v, nextMajor, nextLevel, nextSem);
    });
  };

  walk(siteData);
  return list;
}

const KINDS = ['ملزمة نظري', 'ملزمة عملي', 'ملخص', 'نموذج', 'ملزمة مترجمة'];

const ContributeWidget: React.FC = () => {
  const allCourses = useMemo(() => extractCourses(), []);
  const [isLibrary, setIsLibrary] = useState(() => window.location.hash.includes('library'));
  const [open, setOpen] = useState(false);
  const [major, setMajor] = useState<'IT' | 'CS'>('IT');
  const [level, setLevel] = useState<number>(1);
  const [courseId, setCourseId] = useState<string>('');
  const [kind, setKind] = useState<string>(KINDS[0]);
  const [teacher, setTeacher] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    const onHash = () => setIsLibrary(window.location.hash.includes('library'));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const filtered = useMemo(() => {
    return allCourses.filter((c) => c.major === major && c.level === level);
  }, [allCourses, major, level]);

  const activeCourse = filtered.find((c) => c.id === courseId) || filtered[0];

  if (!isLibrary) return null;

  const handleSendToBot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCourse || !teacher.trim() || !reason.trim()) return;
    const botUrl = `https://t.me/TechEliteHUBot?start=add_${encodeURIComponent(activeCourse.id)}`;
    window.open(botUrl, '_blank', 'noopener,noreferrer');
    setOpen(false);
  };

  return (
    <>
      <div className="te-contrib-banner" style={{ maxWidth: 1120, margin: '16px auto 20px' }}>
        <div className="te-contrib-info">
          <h4>🌱 ساهم في استمرار هذا المرجع للأجيال القادمة</h4>
          <p>لديك ملزمة محدثة، ملخص، أو نموذج اختبار جديد؟ أرسله ليُراجع ويُضاف باسمك للدفعات القادمة.</p>
        </div>
        <button type="button" className="te-contrib-btn" onClick={() => setOpen(true)}>
          📤 ساهم تحديث الملازم
        </button>
      </div>

      {open && (
        <div className="te-contrib-overlay" onClick={() => setOpen(false)}>
          <form className="te-contrib-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSendToBot}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <strong style={{ fontSize: '1rem' }}>📤 ساهم تحديث الملازم</strong>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'inherit' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="te-contrib-field">
                <label>التخصص</label>
                <select value={major} onChange={(e) => { setMajor(e.target.value as 'IT' | 'CS'); setCourseId(''); }}>
                  <option value="IT">تقنية المعلومات (IT)</option>
                  <option value="CS">علوم الحاسوب (CS)</option>
                </select>
              </div>
              <div className="te-contrib-field">
                <label>المستوى الدراسي</label>
                <select value={level} onChange={(e) => { setLevel(Number(e.target.value)); setCourseId(''); }}>
                  <option value={1}>المستوى الأول</option>
                  <option value={2}>المستوى الثاني</option>
                  <option value={3}>المستوى الثالث</option>
                  <option value={4}>المستوى الرابع</option>
                </select>
              </div>
            </div>

            <div className="te-contrib-field">
              <label>اختر المادة</label>
              <select value={activeCourse?.id || ''} onChange={(e) => setCourseId(e.target.value)}>
                {filtered.length === 0 ? (
                  <option value="">لا توجد مواد مطابقة</option>
                ) : (
                  filtered.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.semesterLabel ? `${c.name} - ${c.semesterLabel}` : c.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="te-contrib-field">
              <label>نوع الملفات</label>
              <select value={kind} onChange={(e) => setKind(e.target.value)}>
                {KINDS.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>

            <div className="te-contrib-field">
              <label>اسم مدرس / دكتور المادة *</label>
              <input
                type="text"
                required
                placeholder="مثال: د. عبدالله باوزير"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
              />
            </div>

            <div className="te-contrib-field">
              <label>سبب الإضافة أو التحديث *</label>
              <input
                type="text"
                required
                placeholder="مثال: تحديث منهج الدفعة 8 / نموذج فاينل جديد"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="te-contrib-btn"
              style={{ width: '100%', padding: '11px', marginTop: 6, textAlign: 'center' }}
            >
              متابعة ورفع الملفات في بوت الدفعة ✈️
            </button>
          </form>
        </div>
      )}
    </>
  );
};

function mountContributeWidget() {
  if (typeof document === 'undefined') return;
  const tryMount = () => {
    if (document.getElementById('te-contrib-root')) return;
    const container = document.querySelector('#library, [id*="library"], main');
    if (!container) return;
    const host = document.createElement('div');
    host.id = 'te-contrib-root';
    const firstCardOrGrid = container.querySelector('section, [class*="card"], [class*="grid"]');
    if (firstCardOrGrid && firstCardOrGrid.parentElement === container) {
      container.insertBefore(host, firstCardOrGrid);
    } else {
      container.prepend(host);
    }
    createRoot(host).render(<ContributeWidget />);
  };
  setTimeout(tryMount, 300);
  const obs = new MutationObserver(() => tryMount());
  obs.observe(document.body, { childList: true, subtree: true });
}

mountContributeWidget();
