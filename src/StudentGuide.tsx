import { useEffect, useState, type CSSProperties } from 'react'
import {
  ArrowDown, ArrowLeft, ArrowUpLeft, BookOpen, Check, CheckCircle2,
  ChevronDown, ChevronUp, ClipboardCheck, Code2, Database,
  Download, ExternalLink, FileCode2, GitBranch, GraduationCap,
  Laptop, Layers3, Link2, ListChecks, Monitor, MonitorSmartphone,
  Rocket, Route, Server, ShieldCheck, Sparkles, Wrench, Zap,
  type LucideIcon,
} from 'lucide-react'
import { fullstackStages } from './fullstack-guide-data'
import { laptopTiers, laptopChecks, laptopReferences, type LaptopTier } from './laptop-buying-data'
import './student-guide-redesign.css'

const STORE = 'tech-elite-fullstack-completed-v1'
const STAGE_ICONS: Record<string, LucideIcon> = {
  foundations: Monitor, 'html-css': FileCode2, javascript: Code2, git: GitBranch,
  frontend: Layers3, backend: Server, database: Database, security: ShieldCheck,
  integration: MonitorSmartphone, deployment: Rocket,
}

const TOOLS = [
  { name: 'VS Code', url: 'https://code.visualstudio.com/download', icon: Code2 },
  { name: 'Git', url: 'https://git-scm.com/downloads', icon: GitBranch },
  { name: 'Node.js', url: 'https://nodejs.org/en/download', icon: Zap },
  { name: '.NET', url: 'https://dotnet.microsoft.com/en-us/download', icon: Server },
] as const

function ValidLink({ title, url, download = false }: { title: string; url: string; download?: boolean }) {
  // Link sources are editable by the batch. Accept only safe HTTP(S) links.
  if (!/^https?:\/\//i.test(url)) return <span className="te2-link te2-link-disabled">{title}</span>
  return <a className="te2-link" href={url} target="_blank" rel="noopener noreferrer">
    <span>{download ? <Download size={16} /> : <BookOpen size={16} />}{title}</span><ExternalLink size={15} aria-hidden="true" />
  </a>
}

function loadFinished(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORE) || '[]')
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch { return [] }
}

function LaptopSpec({ tier }: { tier: LaptopTier }) {
  return <div className="te2-spec-panel">
    <div className="te2-spec-title"><strong>{tier.label}</strong><span>{tier.chip}</span></div>
    <p>{tier.bestFor}</p>
    <div className="te2-spec-grid">{tier.specs.map(spec => <div key={spec.label}><b>{spec.label}</b><span>{spec.value}</span></div>)}</div>
    <div className="te2-spec-notice"><CheckCircle2 size={17} />{tier.advice}</div>
  </div>
}

export default function StudentGuide() {
  const [finished, setFinished] = useState<string[]>(loadFinished)
  const [expanded, setExpanded] = useState<string[]>(['foundations'])
  const [tier, setTier] = useState<LaptopTier['id']>('balanced')
  const [showChecks, setShowChecks] = useState(false)
  const [activeStep, setActiveStep] = useState('preparation')
  const doneCount = fullstackStages.filter(stage => finished.includes(stage.id)).length
  const completionPct = Math.round((doneCount / fullstackStages.length) * 100)

  useEffect(() => {
    try { localStorage.setItem(STORE, JSON.stringify(finished)) } catch { /* private browsing */ }
  }, [finished])

  function scrollToPart(id: string) {
    if (id !== 'preparation') setExpanded(prev => prev.includes(id) ? prev : [...prev, id])
    setActiveStep(id)
    // Never change window.location.hash: Tech Elite uses #guide as its page router.
    document.getElementById(`te2-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function toggleDone(id: string) {
    setFinished(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  return <div className="te2-road" dir="rtl">
    <div className="te2-container te2-layout">
      <aside className="te2-sidebar" aria-label="التنقل في خارطة Full Stack">
        <section className="te2-side-panel te2-side-progress">
          <div className="te2-aside-label"><Route size={17} /> تقدمك في الخريطة</div>
          <div className="te2-progress-ring" role="img" aria-label={`التقدم ${completionPct} بالمئة`} style={{ '--te2-percent': `${completionPct}%` } as CSSProperties}>
            <div><strong>{completionPct}%</strong><span>مكتمل</span></div>
          </div>
          <p>أنجزت <b>{doneCount}</b> من {fullstackStages.length} مراحل تقنية</p>
          <small>يتذكر الموقع ما أنجزته على هذا المتصفح فقط، دون تسجيل دخول.</small>
        </section>
        <section className="te2-side-panel te2-side-steps">
          <div className="te2-aside-label"><ListChecks size={17}/> محطات الرحلة</div>
          <button className={`te2-side-step ${activeStep==='preparation'?'selected':''}`} onClick={() => scrollToPart('preparation')}><span>00</span>اختيار اللابتوب والبداية</button>
          {fullstackStages.map((stage, idx) => <button key={stage.id} onClick={() => scrollToPart(stage.id)} className={`te2-side-step ${activeStep===stage.id?'selected':''}`}>
            <span>{String(idx+1).padStart(2,'0')}</span><span className="te2-side-step-text">{stage.title}</span>{finished.includes(stage.id) && <Check size={14} aria-label="مكتملة" />}
          </button>)}
        </section>
        <section className="te2-side-panel te2-side-tools">
          <div className="te2-aside-label"><Wrench size={17}/> أدوات المطور</div>
          <div className="te2-essentials">{TOOLS.map(({name,url,icon:Icon}) => <a key={name} href={url} target="_blank" rel="noopener noreferrer" title={`تحميل ${name} من المصدر الرسمي`}><Icon size={23}/><span>{name}</span></a>)}</div>
          <p>أدوات أساسية وروابط تنزيلها الرسمية.</p>
        </section>
      </aside>

      <main className="te2-content">
        <section className="te2-hero" aria-labelledby="te2-guide-heading">
          <div className="te2-hero-copy">
            <span className="te2-eyebrow"><GraduationCap size={16}/> TECH ELITE · STUDENT GUIDE</span>
            <h1 id="te2-guide-heading">خارطة طريقك لتصبح <span>Full Stack Developer</span></h1>
            <p>رحلة عملية من أول خطوة إلى بناء تطبيق متكامل ونشره. ستجد في كل مرحلة ما تحتاج تعلّمه، ومشروعًا للتطبيق، ومصادر موثوقة، وأدوات بروابط تنزيلها.</p>
            <div className="te2-hero-tags"><span><GraduationCap size={15}/> مناسب للمبتدئين</span><span><Link2 size={15}/> مصادر واضحة</span><span><Download size={15}/> أدوات رسمية</span></div>
            <button type="button" className="te2-cta" onClick={() => scrollToPart('preparation')}><ArrowDown size={19}/> ابدأ الرحلة <span>الآن</span></button>
            <small className="te2-hero-hint">سينقلك مباشرة إلى الخطوة الأولى: اختيار جهازك والاستعداد للتعلم.</small>
          </div>
          <div className="te2-hero-visual" role="img" aria-label="مكتب برمجة يحتوي على شاشة أكواد وكتب وملاحظات تعلّم Full Stack">
            <img className="te2-photo-light" src="/assets/guide-desk-light.webp" alt="" loading="eager" /><img className="te2-photo-dark" src="/assets/guide-desk-dark.webp" alt="" loading="eager" />
            <div className="te2-hero-visual-caption"><Sparkles size={17}/> Learn · Build · Inspire</div>
          </div>
        </section>

        <nav className="te2-jump-menu" aria-label="روابط سريعة داخل خارطة التعلم">
          <button onClick={() => scrollToPart('preparation')}><Laptop size={16}/> نصائح قبل البدء</button>
          <button onClick={() => scrollToPart('foundations')}><Route size={16}/> مراحل الخريطة</button>
          <button onClick={() => scrollToPart('tools')}><Wrench size={16}/> أدوات المطور</button>
          <button onClick={() => scrollToPart('frequently-asked')}><BookOpen size={16}/> أسئلة شائعة</button>
        </nav>

        <section id="te2-preparation" className="te2-section te2-laptop" aria-labelledby="te2-laptop-title">
          <div className="te2-timeline-spine"><span className="te2-timeline-dot">00</span></div>
          <div className="te2-laptop-body te2-card">
            <div className="te2-card-intro">
              <span className="te2-phase">قبل البداية</span><h2 id="te2-laptop-title">اختيار اللابتوب المناسب للبرمجة</h2>
              <p>لا تحتاج أغلى جهاز لتصبح مبرمجًا. اختر المواصفات حسب الأدوات التي ستشغلها، لا حسب الرقم المكتوب على ملصق المعالج.</p>
            </div>
            <div className="te2-laptop-banner"><div className="te2-laptop-illustration"><Laptop size={68}/><span>IT / CS</span></div><div><strong>جهاز عملي اليوم، وقابل للتطوير غدًا.</strong><p>هذه مستويات إرشادية تساعدك على مقارنة الخيارات قبل الشراء.</p></div></div>
            <div className="te2-tier-tabs" role="group" aria-label="اختر نوع استخدام اللابتوب">{laptopTiers.map(item => <button key={item.id} className={tier===item.id?'active':''} aria-pressed={tier===item.id} onClick={() => setTier(item.id)}>{item.chip}</button>)}</div>
            <LaptopSpec tier={laptopTiers.find(item => item.id===tier) ?? laptopTiers[1]}/>
            <button type="button" className="te2-check-toggle" aria-expanded={showChecks} onClick={() => setShowChecks(!showChecks)}><ClipboardCheck size={18}/> فحوصات مهمة قبل شراء لابتوب مستعمل {showChecks?<ChevronUp size={18}/>:<ChevronDown size={18}/>}</button>
            {showChecks && <div className="te2-check-grid">{laptopChecks.map(check => <div key={check.title}><CheckCircle2 size={18}/><div><strong>{check.title}</strong><p>{check.text}</p></div></div>)}</div>}
            <div className="te2-reference-strip"><strong>راجع المتطلبات الرسمية:</strong>{laptopReferences.map(ref => <ValidLink key={ref.url} {...ref}/>)}</div>
          </div>
        </section>

        <section className="te2-stage-area" aria-labelledby="te2-steps-heading">
          <header className="te2-road-heading"><div><span className="te2-eyebrow"><Route size={16}/> خارطتك خطوة بخطوة</span><h2 id="te2-steps-heading">من الأساسيات إلى <span>أول مشروع متكامل</span></h2><p>اضغط «عرض التفاصيل» في أي مرحلة لرؤية المهارات والتطبيقات والمصادر وروابط البرامج.</p></div><div className="te2-mini-progress"><span>أنجزت {doneCount} من {fullstackStages.length}</span><div><i style={{width:`${completionPct}%`}}/></div></div></header>
          {fullstackStages.map((stage,idx) => {
            const Icon = STAGE_ICONS[stage.id] || Code2
            const open = expanded.includes(stage.id)
            const done = finished.includes(stage.id)
            return <article className={`te2-stage te2-section ${open?'te2-expanded':''} ${done?'te2-completed':''}`} key={stage.id} id={`te2-${stage.id}`}>
              <div className="te2-timeline-spine"><span className="te2-timeline-dot">{String(idx+1).padStart(2,'0')}</span></div>
              <div className="te2-card te2-stage-body">
                <div className="te2-stage-summary">
                  <div className="te2-stage-text"><span className="te2-phase">المرحلة {idx+1} <span dir="ltr">{stage.english}</span></span><h3>{stage.title}</h3><p>{stage.goal}</p><div className="te2-stage-bottom"><span><BookOpen size={15}/> {stage.resources.length} مصادر للتعلم</span><span><Wrench size={15}/> {stage.tools.length} أدوات</span>{done && <span className="te2-completed-label"><CheckCircle2 size={15}/> مكتملة</span>}</div></div>
                  <div className={`te2-stage-icon te2-stage-icon-${idx%5}`}><Icon size={51} strokeWidth={1.8}/><span>{String(idx+1).padStart(2,'0')}</span></div>
                </div>
                <div className="te2-stage-actions"><button onClick={() => setExpanded(prev=>open ? prev.filter(x=>x!==stage.id):[...prev,stage.id])} aria-expanded={open} aria-controls={`te2-content-${stage.id}`}>{open?'إخفاء التفاصيل':'عرض التفاصيل'}{open?<ChevronUp size={16}/>:<ArrowLeft size={16}/>}</button><button className={`te2-done-btn ${done?'checked':''}`} onClick={() => toggleDone(stage.id)} aria-pressed={done}>{done?<CheckCircle2 size={16}/>:<Check size={16}/>} {done?'تم الإنجاز':'أنجزت المرحلة'}</button></div>
                {open && <div id={`te2-content-${stage.id}`} className="te2-stage-details">
                  <div className="te2-skill-box"><h4><ListChecks size={18}/> المهارات التي ستتعلمها</h4><div>{stage.skills.map(skill=><span key={skill}><Check size={13}/>{skill}</span>)}</div></div>
                  <div className="te2-practice"><Code2 size={19}/><div><strong>تطبيق عملي بعد هذه المرحلة</strong><p>{stage.practice}</p></div></div>
                  <div className="te2-resources"><div><h4><BookOpen size={18}/> مصادر التعلم</h4>{stage.resources.length?stage.resources.map(item=><ValidLink key={item.url} {...item}/>):<p>ستُضاف مصادر التعلم قريبًا.</p>}</div><div><h4><Download size={18}/> الأدوات والتحميل</h4>{stage.tools.length?stage.tools.map(item=><ValidLink key={item.url} {...item} download/>):<p>لا تحتاج تثبيت برامج إضافية لهذه المرحلة.</p>}</div></div>
                  <p className="te2-edit-help"><Link2 size={14}/> لإضافة روابط جديدة لهذه المرحلة عدّل `resources` أو `tools` في `src/fullstack-guide-data.ts`.</p>
                </div>}
              </div>
            </article>
          })}
        </section>

        <section className="te2-bottom-panel" id="te2-tools"><h2><Wrench size={23}/> أدوات تبدأ بها اليوم</h2><p>ثبت ما تحتاجه فقط، ولا تملأ الجهاز ببرامج لا تستخدمها.</p><div className="te2-main-tools">{TOOLS.map(({name,url,icon:Icon})=><a key={name} href={url} target="_blank" rel="noopener noreferrer"><Icon size={29}/><strong>{name}</strong><span>زيارة الموقع الرسمي <ExternalLink size={13}/></span></a>)}</div></section>
        <section className="te2-bottom-panel te2-faq" id="te2-frequently-asked"><h2><BookOpen size={23}/> أسئلة شائعة قبل أن تبدأ</h2><details><summary>هل أحتاج تعلم جميع أدوات Full Stack؟</summary><p>لا. ابدأ بلغة وتقنيات أساسية واحدة للواجهة والخلفية وقاعدة البيانات، ثم وسع معرفتك تدريجيًا.</p></details><details><summary>هل يمكن أن أبدأ بلابتوب 8GB RAM؟</summary><p>نعم للتعلم الخفيف. لكن مع قواعد بيانات ومحاكيات وIDE ثقيل ستستفيد من 16GB أو أكثر، وفق متطلبات أدواتك.</p></details><details><summary>هل أتعلم React قبل JavaScript؟</summary><p>الأفضل أن تفهم JavaScript والأساسيات أولًا، ثم انتقل إلى React لتفهم المكونات والحالة والتعامل مع البيانات.</p></details></section>
        <div className="te2-end-note"><Rocket size={28}/><div><strong>لا تجعل جمع الدورات بديلًا عن بناء المشاريع.</strong><p>اختر مشروعًا واقعيًا، وابدأ صغيرًا، وحسّنه مرحلة بعد مرحلة.</p></div><a href="https://roadmap.sh/full-stack" target="_blank" rel="noopener noreferrer">خارطة إضافية على roadmap.sh <ArrowUpLeft size={17}/></a></div>
      </main>
    </div>
  </div>
}
