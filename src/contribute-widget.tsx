import React, { useState, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { courses as itCourses } from './data';
import { csPlanCourses } from './cs-plan-data';
import './contribute-widget.css';

const BOT_API_BASE = 'https://tech-elite-telegram-bot.husseinthebetter.workers.dev';

interface CourseOption {
  id: string;
  name: string;
  major: 'IT' | 'CS';
  level: number;
  semesterLabel: string;
}

interface ApprovedItem {
  title: string;
  kind: string;
  url: string;
  teacher?: string;
  reason?: string;
  contributor?: string;
  approvedAt?: string;
}

function buildCourseOptions(): CourseOption[] {
  const rawAll = [
    ...(Array.isArray(itCourses) ? itCourses.map((c) => ({ ...c, _major: 'IT' as const })) : []),
    ...(Array.isArray(csPlanCourses) ? csPlanCourses.map((c) => ({ ...c, _major: 'CS' as const })) : []),
  ];

  return rawAll.map((c: Record<string, unknown>) => {
    const id = String(c.id || '');
    const name = String(c.name || '').trim();
    const major: 'IT' | 'CS' = id.startsWith('hu-cs-') || c._major === 'CS' ? 'CS' : 'IT';
    const level = Number(c.level || c.year || 1);
    const semRaw = String(c.semester ?? c.term ?? '');
    const semesterLabel =
      semRaw === '2' || semRaw.includes('ثاني') || semRaw.toLowerCase().includes('second')
        ? 'الفصل الثاني'
        : semRaw === '1' || semRaw.includes('أول') || semRaw.includes('اول') || semRaw.toLowerCase().includes('first')
        ? 'الفصل الأول'
        : '';

    return { id, name, major, level, semesterLabel };
  });
}

const KINDS = ['ملزمة نظري', 'ملزمة عملي', 'ملخص', 'نموذج', 'ملزمة مترجمة'];

const ContributeWidget: React.FC = () => {
  const allCourses = useMemo(() => buildCourseOptions(), []);
  const [isLibrary, setIsLibrary] = useState(() => window.location.hash.includes('library'));
  const [open, setOpen] = useState(false);
  const [major, setMajor] = useState<'IT' | 'CS'>('IT');
  const [level, setLevel] = useState<number>(1);
  const [courseId, setCourseId] = useState<string>('');
  const [kind, setKind] = useState<string>(KINDS[0]);
  const [teacher, setTeacher] = useState('');
  const [reason, setReason] = useState('');
  const [approvedMap, setApprovedMap] = useState<Record<string, ApprovedItem[]>>({});

  useEffect(() => {
    const onHash = () => setIsLibrary(window.location.hash.includes('library'));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    let active = true;
    fetch(`${BOT_API_BASE}/api/materials`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && data?.ok && data.materials && typeof data.materials === 'object') {
          setApprovedMap(data.materials);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return allCourses.filter((c) => c.major === major && c.level === level);
  }, [allCourses, major, level]);

  const activeCourse = filtered.find((c) => c.id === courseId) || filtered[0];

  const recentApproved = useMemo(() => {
    const entries: Array<{ courseName: string; courseId: string; item: ApprovedItem }> = [];
    Object.entries(approvedMap).forEach(([cId, items]) => {
      if (!Array.isArray(items)) return;
      const cName = allCourses.find((c) => c.id === cId)?.name || cId;
      items.forEach((item) => entries.push({ courseName: cName, courseId: cId, item }));
    });
    return entries.reverse();
  }, [approvedMap, allCourses]);

  if (!isLibrary) return null;

  const handleSendToBot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCourse || !teacher.trim() || !reason.trim()) return;

    const rawJson = JSON.stringify({
      c: activeCourse.id,
      k: kind,
      t: teacher.trim(),
      r: reason.trim(),
    });
    const bytes = new TextEncoder().encode(rawJson);
    let bin = '';
    bytes.forEach((b) => (bin += String.fromCharCode(b)));
    const b64url = btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const startParam = b64url.length <= 60 ? `c_${b64url}` : `add_${activeCourse.id}`;
    window.open(`https://t.me/TechEliteHUBot?start=${startParam}`, '_blank', 'noopener,noreferrer');
    setOpen(false);
  };

  return (
    <>
      <div className="te-contrib-banner" style={{ maxWidth: 1120, margin: '16px auto 14px' }}>
        <div className="te-contrib-info">
          <h4>🌱 ساهم في استمرار هذا المرجع للأجيال القادمة</h4>
          <p>لديك ملزمة محدثة، ملخص، أو نموذج اختبار جديد؟ أرسله ليُراجع ويُضاف باسمك للدفعات القادمة.</p>
        </div>
        <button type="button" className="te-contrib-btn" onClick={() => setOpen(true)}>
          📤 ساهم تحديث الملازم
        </button>
      </div>

      {recentApproved.length > 0 && (
        <div
          style={{
            maxWidth: 1120,
            margin: '0 auto 20px',
            padding: '14px 18px',
            borderRadius: 14,
            border: '1px solid rgba(139, 92, 246, 0.25)',
            background: 'rgba(139, 92, 246, 0.05)',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 10 }}>
            ✨ أحدث الملازم والنماذج المعتمدة من مساهمات الطلاب ({recentApproved.length})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
            {recentApproved.map(({ courseName, item }, idx) => (
              <a
                key={`${item.url}-${idx}`}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  textDecoration: 'none',
                  color: 'inherit',
                  background: 'rgba(255,255,255,0.03)',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{courseName}</div>
                <div style={{ fontSize: '0.82rem', opacity: 0.9, marginTop: 3 }}>{item.title}</div>
                {item.reason && (
                  <div style={{ fontSize: '0.76rem', opacity: 0.72, marginTop: 3 }}>📝 {item.reason}</div>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

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
                {filtered.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.semesterLabel ? `${c.name} - ${c.semesterLabel}` : c.name}
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
