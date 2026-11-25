import { useEffect, useState } from 'react'
import {
  BookOpen, BookText, Bot, ClipboardCheck, Code2,
  ExternalLink, FileText, GraduationCap, Languages, Lightbulb, Send,
} from 'lucide-react'
import { siteConfig } from './data'
import type { Course, Resource } from './data'
import { getCourseAllMaterialsBotUrl, getCourseBotUrl, getMaterialBotUrl } from './telegram-links'
import { archiveMessageId, getAllCourseResources } from './telegram-materials'

type TabKey = 'theoryNotes' | 'practicalNotes' | 'translatedNotes' | 'notes' | 'exams' | 'summaries' | 'learning' | 'bot'

const tabs: {
  id: TabKey
  label: string
  kinds: Resource['kind'][]
  Icon: typeof BookOpen
}[] = [
  { id: 'theoryNotes', label: 'ملازم نظري', kinds: ['ملزمة نظري'], Icon: BookText },
  { id: 'practicalNotes', label: 'ملازم عملي', kinds: ['ملزمة عملي'], Icon: Code2 },
  { id: 'notes', label: 'ملازم غير مصنفة', kinds: ['ملزمة PDF'], Icon: BookOpen },
  { id: 'exams', label: 'نماذج الاختبارات', kinds: ['اختبار'], Icon: ClipboardCheck },
  { id: 'summaries', label: 'الملخصات', kinds: ['ملخص'], Icon: FileText },
  { id: 'translatedNotes', label: 'ملازم مترجمة', kinds: ['ملزمة مترجمة'], Icon: Languages },
  { id: 'learning', label: 'مصادر التعلم', kinds: ['مسار تعلم', 'مرجع إضافي', 'توثيق رسمي', 'وصف رسمي للمقرر'], Icon: BookOpen },
  { id: 'bot', label: 'بوت الدفعة', kinds: [], Icon: Bot },
]

const emptyText: Record<Exclude<TabKey, 'bot'>, string> = {
  theoryNotes: 'لم تُضف ملازم نظري لهذه المادة بعد.',
  practicalNotes: 'لم تُضف ملازم عملي لهذه المادة بعد.',
  notes: 'لا توجد ملازم قديمة غير مصنفة لهذه المادة.',
  exams: 'لم تُضف نماذج اختبارات لهذه المادة بعد. ستظهر هنا بعد ربطها برسائل تيليجرام.',
  summaries: 'لم تُضف ملخصات لهذه المادة بعد.',
  translatedNotes: 'لم تُضف ملازم مترجمة لهذه المادة بعد.',
  learning: 'لا توجد مصادر تعلم مضافة لهذه المادة حتى الآن.',
}

function telegramLink(url: string): boolean {
  try { return new URL(url).hostname === 't.me' } catch { return false }
}

export default function CourseResourceTabs({ course }: { course: Course }) {
  const [, setCloudTick] = useState(0)
  useEffect(() => { const h = () => setCloudTick((t) => t + 1); window.addEventListener('te-materials-updated', h); return () => window.removeEventListener('te-materials-updated', h) }, [])

const [selected, setSelected] = useState<TabKey>(
  course.hasTheory === false
    ? (course.hasPractical === false ? 'learning' : 'practicalNotes')
    : 'theoryNotes'
)
  const botLink = getCourseBotUrl(siteConfig.telegramBotUsername, course.id)
  const all = getAllCourseResources(course)
  // Keep the old generic handouts tab only when it has actual content.

const visibleTabs = tabs.filter(item =>
  (item.id !== 'theoryNotes' || course.hasTheory !== false) &&
  (item.id !== 'practicalNotes' || course.hasPractical !== false) &&
  (item.id !== 'notes' ||
    all.some(resource => resource.kind === 'ملزمة PDF'))
)
  const tab = tabs.find(item => item.id === selected)!
  const visible = all.filter(resource => tab.kinds.includes(resource.kind))

  return <section className="course-resources" aria-label="مكتبة المقرر">
    <div className="course-resources-header">
      <div>
        <span className="course-resources-eyebrow"><GraduationCap size={15} /> مكتبة المادة</span>
        <h3>محتوى مرتب، وصول أسرع <small>{all.length} مصدر</small></h3>
        <p>اختر القسم الذي تحتاجه، وافتح المصدر مباشرة دون البحث وسط بقية الملفات.</p>
      </div>
    </div>

    <div className="resource-tab-scroller" aria-label="تصنيفات المصادر">
      <div className="resource-tabs" role="tablist" aria-label="أنواع مصادر المادة">
        {visibleTabs.map(({ id, label, kinds, Icon }) => <button
          key={id}
          type="button"
          id={`tab-${id}`}
          role="tab"
          aria-selected={selected === id}
          aria-controls={`panel-${id}`}
          className={`resource-tab ${selected === id ? 'is-active' : ''}`}
          onClick={() => setSelected(id)}
        >
          <Icon size={16} aria-hidden="true" />
          <span>{label}</span>
          {id === 'bot' ? <span className="tab-count">{botLink ? 'متاح' : 'غير مربوط'}</span> : <span className="tab-count">{all.filter(resource => kinds.includes(resource.kind)).length}</span>}
        </button>)}
      </div>
    </div>

    <div className="resource-tab-panel" id={`panel-${selected}`} role="tabpanel" aria-labelledby={`tab-${selected}`}>
      {selected === 'bot' ? <div className="telegram-bot-pending">
        <div className="telegram-pending-icon"><Bot size={32} /></div>
        <h4>بوت Tech_Elite7 | الدفعة السابعة</h4>
        <p>انتقل إلى البوت مباشرة لعرض مصادر هذه المادة واختيار الملازم والنماذج والملخصات من القوائم.</p>
        {botLink ? <a className="course-bot-link" href={botLink} target="_blank" rel="noopener noreferrer"><Bot size={18}/> زيارة البوت لهذه المادة <ExternalLink size={16}/></a> : <span><Lightbulb size={16}/> البوت منشأ بالفعل، لكن يجب إضافة اسم المستخدم الحقيقي في src/data.ts لتفعيل الرابط.</span>}
        <span><Lightbulb size={16} /> ملفات الملازم مرتبطة برسائل تيليجرام بصورة مستقلة عن البوت.</span>
      </div> : visible.length === 0 ? <div className="resource-empty">
        <div className="resource-empty-icon"><tab.Icon size={26}/></div>
        <h4>لا توجد ملفات في «{tab.label}» حاليًا</h4>
        <p>{emptyText[selected]}</p>
      </div> : <div className="resource-list resource-list-tabbed">
        {visible.map((res, index) => {
          const messageId = archiveMessageId(res.url)
          const isArchiveFile = messageId !== null
          const destination = messageId !== null
            ? getMaterialBotUrl(siteConfig.telegramBotUsername, course.id, messageId)
            : res.url
          return destination ? <a href={destination} target="_blank" rel="noopener noreferrer"
          key={`${course.id}-${res.kind}-${res.url}-${index}`}>
          <span className="resource-icon">{telegramLink(res.url) ? <Send size={21} /> : selected === 'translatedNotes' ? <Languages size={21} /> : selected === 'exams' ? <ClipboardCheck size={21} /> : <FileText size={21} />}</span>
          <span className="resource-item-body"><strong>{res.title}</strong><small>{res.kind}{res.description ? ` · ${res.description}` : ''}</small></span>
          <span className="resource-open-label">{isArchiveFile ? 'استلام PDF من البوت' : telegramLink(res.url) ? 'فتح في تيليجرام' : 'فتح المصدر'} <ExternalLink size={15}/></span>
        </a> : <div key={`${course.id}-${index}`} className="resource-empty">البوت غير مربوط حاليًا لاستلام هذا الملف.</div>
        })}
        {(() => {
          const tabKey = tab.id === 'theoryNotes' ? 'h' : tab.id === 'practicalNotes' ? 'a' : tab.id === 'translatedNotes' ? 't' : tab.id === 'notes' ? 'n' : tab.id === 'exams' ? 'x' : tab.id === 'summaries' ? 'u' : undefined
          const tabHasArchive = visible.some(res => archiveMessageId(res.url) !== null)
          const tabAllUrl = tabKey && tabHasArchive ? getCourseAllMaterialsBotUrl(siteConfig.telegramBotUsername, course.id, tabKey) : null
          return tabAllUrl && visible.length > 1 ? <a href={tabAllUrl} target="_blank" rel="noopener noreferrer" className="resource-send-all">
            <span className="resource-icon"><Send size={21} /></span>
            <span className="resource-item-body"><strong>إرسال جميع {tab.label}</strong><small>يرسل البوت جميع ملفات هذا القسم دفعة واحدة في تيليجرام</small></span>
            <span className="resource-open-label">إرسال الكل <ExternalLink size={15}/></span>
          </a> : null
        })()}
      </div>}
    </div>
    <p className="resource-safety-note"><Lightbulb size={16}/> الملازم والنماذج تُربط برسائل الملفات المنشورة بإذن أصحابها. المصادر التعليمية الخارجية مستقلة عن المقررات الرسمية للجامعة.</p>
  </section>
}


