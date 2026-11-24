import React, { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import * as siteData from './data';
import './contribute-widget.css';

interface CourseOption {
  id: string;
  name: string;
  major: string;
  level: number;
}

function extractCourses(): CourseOption[] {
  const list: CourseOption[] = [];
  const seen = new Set<string>();
  const walk = (obj: unknown, majorHint = 'IT', levelHint = 1) => {
    if (!obj || typeof obj !== 'object') return;
    if (Array.isArray(obj)) {
      obj.forEach((item) => walk(item, majorHint, levelHint));
      return;
    }
    const rec = obj as Record<string, unknown>;
    const nextMajor = typeof rec.major === 'string' ? rec.major : majorHint;
    const nextLevel = typeof rec.level === 'number' ? rec.level : levelHint;
    if (typeof rec.id === 'string' && typeof rec.name === 'string' && !seen.has(rec.id)) {
      seen.add(rec.id);
      list.push({ id: rec.id, name: rec.name, major: nextMajor, level: nextLevel });
    }
    Object.entries(rec).forEach(([k, v]) => {
      const m = k.toUpperCase().includes('CS') ? 'CS' : k.toUpperCase().includes('IT') ? 'IT' : nextMajor;
      const lvlMatch = k.match(/[1-4]/);
      const l = lvlMatch ? Number(lvlMatch[0]) : nextLevel;
      walk(v, m, l);
    });
  };
  walk(siteData);
  return list;
}

const KINDS = ['ملزمة نظري', 'ملزمة عملي', 'ملخص', 'نموذج', 'ملزمة مترجمة'];

const ContributeWidget: React.FC = () => {
  const allCourses = useMemo(() => extractCourses(), []);
  const [open, setOpen] = useState(false);
  const [major, setMajor] = useState<'IT' | 'CS'>('IT');
  const [level, setLevel] = useState<number>(1);
  const [courseId, setCourseId] = useState<string>('');
  const [kind, setKind] = useState<string>(KINDS[0]);
  const [teacher, setTeacher] = useState('');
  const [reason, setReason] = useState('');

  const filtered = useMemo(() => {
    const sub = allCourses.filter((c) => c.major.toUpperCase().includes(major) && c.level === level);
    return sub.length > 0 ? sub : allCourses;
  }, [allCourses, major, level]);

  const activeCourse = filtered.find((c) => c.id === courseId) || filtered[0];

  const handleSendToBot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCourse || !teacher.trim() || !reason.trim()) return;
    const botUrl = `https://t.me/TechEliteHUBot?start=add_${encodeURIComponent(activeCourse.id)}`;
    window.open(botUrl, '_blank', 'noopener,noreferrer');
    setOpen(false);
  };

  return (
    <>
      <div className="te-contrib-banner">
        <div className="te-contrib-info">
          <h4>🌱 ساهم في استمرار هذا المرجع للأجيال القادمة</h4>
          <p>لديك ملزمة محدثة، ملخص، أو نموذج اختبار جديد؟ أرسله ليُراجع ويُضاف باسمك للدفعات القادمة.</p>
        </div>
        <button type="button" className="te-contrib-btn" onClick={() => setOpen(true)}>
          📤 ساهم بملزمة
        </button>
      </div>

      {open && (
        <div className="te-contrib-overlay" onClick={() => setOpen(false)}>
          <form className="te-contrib-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSendToBot}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <strong style={{ fontSize: '1rem' }}>📤 إرسال مساهمة جديدة للمكتبة</strong>
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
              <label>اختر المادة (مربوطة تلقائياً بالخطة)</label>
              <select value={activeCourse?.id || ''} onChange={(e) => setCourseId(e.target.value)}>
                {filtered.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id})
                  </option>
                ))}
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
    const libSection = document.querySelector('#library, [id*="library"], main');
    if (!libSection) return;
    const host = document.createElement('div');
    host.id = 'te-contrib-root';
    libSection.appendChild(host);
    createRoot(host).render(<ContributeWidget />);
  };
  setTimeout(tryMount, 400);
  const obs = new MutationObserver(() => tryMount());
  obs.observe(document.body, { childList: true, subtree: true });
}

mountContributeWidget();
