import { useMemo, useState, type KeyboardEvent } from 'react'
import { ArrowUpLeft, Award, CheckCircle2, Code2, FileUser, Github, GraduationCap, Linkedin, Search, ShieldCheck, SlidersHorizontal, Sparkles } from 'lucide-react'
import StudentGuide from './StudentGuide'
import { learningCourses, coursesVerifiedOn, type Credential, type CourseLevel, type LearningCourse } from './learning-paths-data'
import './learning-paths.css'

type Tab = 'roadmap' | 'courses'
const tabs: { id: Tab; label: string; Icon: typeof Code2 }[] = [
  { id: 'roadmap', label: 'خارطة Full Stack', Icon: Code2 },
  { id: 'courses', label: 'الدورات والشهادات', Icon: Award },
]
const fields = ['الكل', 'تطوير الويب', 'أساسيات البرمجة', 'قواعد البيانات', 'الأمن السيبراني', 'الشبكات', 'الذكاء الاصطناعي', 'الحوسبة السحابية'] as const
const credentialDetails: Record<Credential, string> = {
  'شهادة مجانية': 'الدورة والشهادة مجانًا بعد استيفاء المتطلبات',
  'شارة رقمية مجانية': 'دراسة مجانية مع شارة إلكترونية للأنشطة المؤهلة',
  'إنجاز تعليمي': 'تعلم مجاني مع إنجاز على ملف المنصة، وليس شهادة مهنية',
  'بدون شهادة': 'تعلم مجاني ومشاريع عملية دون شهادة إتمام',
  'شهادة مدفوعة أو دعم مالي': 'المعاينة مجانية؛ إكمال الدورة وشهادتها يتطلبان عادة دفعًا أو دعمًا ماليًا',
}
const platformLook: Record<LearningCourse['providerKey'], { name: string; tone: string; initials: string; domain: string }> = {
  freecodecamp: { name: 'freeCodeCamp', tone: 'mint', initials: 'fCC', domain: 'www.freecodecamp.org' },
  cs50: { name: 'Harvard CS50', tone: 'red', initials: 'CS50', domain: 'cs50.harvard.edu' },
  cisco: { name: 'Cisco', tone: 'cyan', initials: 'CISCO', domain: 'www.netacad.com' },
  ibm: { name: 'IBM SkillsBuild', tone: 'blue', initials: 'IBM', domain: 'skillsbuild.org' },
  aws: { name: 'AWS Educate', tone: 'orange', initials: 'AWS', domain: 'aws.amazon.com' },
  microsoft: { name: 'Microsoft Learn', tone: 'azure', initials: 'MS', domain: 'learn.microsoft.com' },
  odin: { name: 'The Odin Project', tone: 'gold', initials: 'ODIN', domain: 'www.theodinproject.com' },
  satr: { name: 'منصة سطر', tone: 'cyan', initials: 'SATR', domain: 'satr.tuwaiq.edu.sa' },
  udemy: { name: 'Udemy', tone: 'red', initials: 'U', domain: 'www.udemy.com' },
  coursera: { name: 'Coursera', tone: 'blue', initials: 'C', domain: 'www.coursera.org' },
}

function CourseTile({ course }: { course: LearningCourse }) {
  const brand = platformLook[course.providerKey]
  return <article className="te-learn-course">
    <div className={`te-learn-logo te-learn-logo--${brand.tone}`}>
      <div className="te-learn-logo-icon">
        <img src={`https://${brand.domain}/favicon.ico`} loading="lazy" alt="" onError={event => {
          const img = event.currentTarget
          img.onerror = null
          img.src = `/assets/learning-logos/${course.providerKey}.svg`
        }}/>
      </div>
      <span>{brand.name}</span>
    </div>
    <div className="te-learn-course-body">
      <div className="te-learn-course-overline">
        <span>{course.category}</span>
        <span className={`te-learn-status ${course.credential === 'شهادة مجانية' ? 'cert' : course.credential === 'شارة رقمية مجانية' ? 'badge' : 'neutral'}`}>{course.credential}</span>
      </div>
      <h3 dir="auto">{course.title}</h3>
      <p className="te-learn-desc">{course.description}</p>
      <div className="te-learn-meta"><span>{course.level}</span><span>{course.language}</span><span>{course.duration}</span></div>
      {course.accessNote && <p className="te-learn-access">{course.accessNote}</p>}
      <p className="te-learn-credential"><CheckCircle2 size={15}/>{course.credentialNote}</p>
      <div className="te-learn-practice"><Code2 size={15}/><span>{course.practice}</span></div>
      <a className="te-learn-start" href={course.url} target="_blank" rel="noopener noreferrer">اذهب للدورة الرسمية <ArrowUpLeft size={16}/></a>
    </div>
  </article>
}

function CoursesTab() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('الكل')
  const [level, setLevel] = useState<CourseLevel | 'الكل'>('الكل')
  const [credential, setCredential] = useState<Credential | 'الكل'>('الكل')
  const visible = useMemo(() => learningCourses.filter(course => {
    const input = search.trim().toLocaleLowerCase()
    const searchable = `${course.title} ${course.provider} ${course.category} ${course.description} ${course.language}`.toLocaleLowerCase()
    return (!input || searchable.includes(input)) && (category === 'الكل' || course.category === category) && (level === 'الكل' || course.level === level) && (credential === 'الكل' || course.credential === credential)
  }), [search, category, level, credential])
  function reset() { setSearch(''); setCategory('الكل'); setLevel('الكل'); setCredential('الكل') }
  return <div className="te-learn-courses" role="tabpanel" id="te-learn-panel-courses" aria-labelledby="te-learn-tab-courses">
    <section className="te-learn-career" aria-labelledby="te-learn-career-title">
      <div className="te-learn-career-main">
        <span className="te-learn-eyebrow"><Sparkles size={15}/> وصية Tech Elite لطلاب IT وCS</span>
        <h2 id="te-learn-career-title">لا تنتظر التخرج لتبدأ مستقبلك.</h2>
        <p>من المستوى الأول، أنشئ حسابك على LinkedIn وGitHub، وجهّز سيرتك الذاتية (CV). بعد كل دورة، طبّق ما تعلمته في مشروع صغير، وثّق المشروع، وأضف الشهادة أو الشارة التي حصلت عليها بالفعل.</p>
        <strong>الشهادات تدعم ملفك، والمشاريع تُظهر ما تستطيع إنجازه.</strong>
      </div>
      <div className="te-learn-career-steps" aria-label="خطوات بناء الملف المهني">
        <span><Linkedin size={18}/> LinkedIn</span>
        <span><Github size={18}/> GitHub</span>
        <span><FileUser size={18}/> CV</span>
        <small>تعلّم ← طبّق ← وثّق ← اعرض مهاراتك</small>
      </div>
    </section>
    <div className="te-learn-courses-heading">
      <div><span className="te-learn-eyebrow"><GraduationCap size={16}/> مصادر منتقاة بعناية</span><h2>اختر دورة تناسب مرحلتك</h2><p>موارد مفيدة من منصات معروفة؛ بعض الدورات مجانية بالكامل وبعضها معاينة مجانية فقط، ونوضح ذلك قبل التسجيل.</p></div>
      <div className="te-learn-count" aria-live="polite">{visible.length} من {learningCourses.length} دورة</div>
    </div>
    <div className="te-learn-filters">
      <label className="te-learn-search"><Search size={18}/><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="ابحث عن دورة أو منصة..." aria-label="البحث عن دورة"/></label>
      <label><SlidersHorizontal size={16}/><span className="sr-only">المستوى</span><select value={level} onChange={event => setLevel(event.target.value as CourseLevel | 'الكل')} aria-label="تصفية حسب المستوى"><option value="الكل">كل المستويات</option><option value="مبتدئ">مبتدئ</option><option value="متوسط">متوسط</option><option value="متقدم">متقدم</option></select></label>
      <label><Award size={16}/><span className="sr-only">نوع الشهادة</span><select value={credential} onChange={event => setCredential(event.target.value as Credential | 'الكل')} aria-label="تصفية حسب الشهادة"><option value="الكل">جميع الإثباتات</option>{Object.keys(credentialDetails).map(item => <option value={item} key={item}>{item}</option>)}</select></label>
    </div>
    <div className="te-learn-categories" role="group" aria-label="تصفية الدورات حسب المجال">
      {fields.map(field => <button type="button" key={field} aria-pressed={category === field} className={category === field ? 'active' : ''} onClick={() => setCategory(field)}>{field}</button>)}
    </div>
    <div className="te-learn-course-grid">
      {visible.map(course => <CourseTile key={course.id} course={course}/>)}
    </div>
    {!visible.length && <div className="te-learn-empty"><Search size={25}/><p>ما لقينا دورات تطابق هذه الفلاتر.</p><button type="button" onClick={reset}>مسح التصفية</button></div>}
    <div className="te-learn-trust"><ShieldCheck size={17}/><span>آخر مراجعة للمعلومات: {coursesVerifiedOn}. دورات Udemy المجانية لا تمنح شهادة إتمام، وCoursera قد توفر معاينة مجانية فقط؛ تحقّق من الأسعار والإتاحة حسب بلدك قبل التسجيل.</span></div>
  </div>
}

export default function LearningPathsPage() {
  const [active, setActive] = useState<Tab>('roadmap')
  function keyTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index
    if (event.key === 'ArrowLeft') next = (index + 1) % tabs.length
    else if (event.key === 'ArrowRight') next = (index - 1 + tabs.length) % tabs.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = tabs.length - 1
    else return
    event.preventDefault()
    setActive(tabs[next].id)
    document.getElementById(`te-learn-tab-${tabs[next].id}`)?.focus()
  }
  return <section className="te-learning-page" dir="rtl" aria-label="مسارات التعلم">
    <div className="container te-learning-container">
      <header className="te-learning-header">
        <span className="te-learn-eyebrow"><Sparkles size={15}/> رحلتك تبدأ من هنا</span>
        <h1>مسارات <span>التعلم</span></h1>
        <p>خارطة عملية لتتعلم وتطبق، ودورات موثوقة تعزز مشاريعك وخبرتك.</p>
      </header>
      <div className="te-learning-tabs" role="tablist" aria-label="أقسام مسارات التعلم">
        {tabs.map(({ id, label, Icon }, index) => <button type="button" key={id} id={`te-learn-tab-${id}`} role="tab" aria-selected={active === id} aria-controls={`te-learn-panel-${id}`} tabIndex={active === id ? 0 : -1} className={active === id ? 'active' : ''} onClick={() => setActive(id)} onKeyDown={event => keyTab(event, index)}><Icon size={17}/>{label}</button>)}
      </div>
    </div>
    {active === 'roadmap' && <div id="te-learn-panel-roadmap" role="tabpanel" aria-labelledby="te-learn-tab-roadmap" className="te-learning-original-guide"><StudentGuide/></div>}
    {active === 'courses' && <div className="container te-learning-container"><CoursesTab/></div>}
  </section>
}
