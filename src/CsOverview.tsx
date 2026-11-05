import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

import {
  ArrowLeft, Braces, BrainCircuit, Code2, Cpu, Database, ExternalLink,
  Globe2, Heart, ShieldCheck, Sigma, Workflow,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const studyAreas: { title: string; description: string; icon: LucideIcon }[] = [
  { title: 'الخوارزميات وهياكل البيانات', description: 'تعلّم التفكير الخوارزمي وتحليل التعقيد وبناء حلول فعّالة.', icon: Sigma },
  { title: 'هندسة البرمجيات', description: 'تصميم الأنظمة البرمجية وتنفيذها واختبارها وصيانتها.', icon: Workflow },
  { title: 'الذكاء الاصطناعي', description: 'مبادئ الذكاء الاصطناعي وتطبيقاته في حل المشكلات.', icon: BrainCircuit },
  { title: 'علم البيانات وقواعد البيانات', description: 'تنظيم البيانات وتحليلها واستنتاج معلومات مفيدة.', icon: Database },
  { title: 'نظم التشغيل ومعمارية الحاسب', description: 'فهم المكونات والذاكرة والعمليات وكيف تعمل أنظمة الحاسوب.', icon: Cpu },
  { title: 'أمن الحاسوب والشبكات', description: 'فهم مبادئ أمن الأنظمة والاتصال وحماية المعلومات.', icon: ShieldCheck },
]

const details: Record<string, { detail: string; example: string }> = {
  'الخوارزميات وهياكل البيانات': { detail: 'تتعلم تنظيم البيانات بطرق مثل المصفوفات والقوائم والأشجار، وتحليل الوقت والذاكرة التي تحتاجها الخوارزميات، واختيار الحل المناسب للمشكلة بدل الاكتفاء بأن البرنامج يعمل.', example: 'قارن بين طريقتين للبحث والترتيب، وقِس أداء كل منهما.' },
  'هندسة البرمجيات': { detail: 'ستتعرف إلى جمع المتطلبات والتصميم المعماري والتحكم بالإصدارات واختبار البرمجيات والعمل الجماعي والصيانة. الفكرة هي بناء نظام قابل للتطوير لا مجرد تسليم كود.', example: 'طوّر تطبيقًا صغيرًا ضمن فريق مع خطة واختبارات ومراجعة للكود.' },
  'الذكاء الاصطناعي': { detail: 'تتعرف إلى تمثيل المعرفة والبحث والتعلم من البيانات، ومفاهيم النماذج والتقييم والانحياز. تعلّم الأساس الرياضي والبرمجي مهم لفهم النتائج بدل استخدام الأدوات بلا تمحيص.', example: 'درّب نموذج تصنيف بسيطًا، ثم جرّبه على بيانات لم يرها من قبل.' },
  'علم البيانات وقواعد البيانات': { detail: 'ستدرس نمذجة البيانات والاستعلامات وتنظيف البيانات وتحليلها وإخراج نتائج قابلة للتفسير، مع ربط ذلك بالإحصاء والبرمجة حسب مقررات البرنامج.', example: 'حلل مجموعة بيانات صغيرة وأنشئ تقريرًا يشرح النتائج وحدودها.' },
  'نظم التشغيل ومعمارية الحاسب': { detail: 'ستفهم كيف ينفّذ المعالج التعليمات، وكيف تُدار الذاكرة والعمليات والملفات والتزامن، وما الذي يحدث بين البرنامج ونظام التشغيل والعتاد.', example: 'راقب استهلاك الذاكرة والعمليات وقارن أثر تشغيل مهام متزامنة.' },
  'أمن الحاسوب والشبكات': { detail: 'ستتعرف إلى مبادئ بروتوكولات الاتصال ومخاطر الأنظمة والتشفير والمصادقة والصلاحيات، وكيفية التفكير في التهديدات وتصميم أنظمة أكثر أمانًا.', example: 'اختبر تطبيقًا تدريبيًا في بيئة مصرح بها وحدد أخطاء إدارة الصلاحيات.' },
}

/** Uses the same visual sections and CSS classes as the existing IT page. */
export default function CsOverview({ onPlan }: { onPlan: () => void }) {
  const [expandedStudyArea, setExpandedStudyArea] = useState<string | null>(null)
  return <div dir="rtl">
    <div className="page-heading">
      <div className="page-heading-glow" />
      <div className="container">
        <span className="page-eyebrow"><Globe2 size={18}/> تخصص المستقبل يبدأ بالفهم</span>
        <h1>ما هو تخصص <span>علوم الحاسوب CS؟</span></h1>
        <p>دليل مبسط لكل طالب جديد أو مهتم بدراسة علوم الحاسوب في جامعة حضرموت.</p>
        <div className="page-head-decoration"><span/><span/><span/></div>
      </div>
    </div>

    <section className="section"><div className="container">
      <div className="about-intro">
        <div>
          <span className="kicker">ABOUT COMPUTER SCIENCE</span>
          <h2>الحوسبة ليست كتابة كود فقط.<br/><span>بل فهم وتصميم للحلول.</span></h2>
          <p>علوم الحاسوب (Computer Science) تخصص يهتم بأسس الحوسبة، والخوارزميات، وهياكل البيانات، والأنظمة، وبناء البرمجيات. ويدرس الطالب كيفية تمثيل المشكلات وحلّها باستخدام الحاسوب.</p>
          <p>يقدّم قسم علوم الحاسوب بجامعة حضرموت برنامج بكالوريوس مدته أربع سنوات، يجمع أساسيات البرمجة والرياضيات والحوسبة مع مجالات تطبيقية وبحثية.</p>
        </div>
        <div className="about-visual">
          <div className="about-grid-cell"><Code2/><span>Algorithms</span></div>
          <div className="about-grid-cell"><Cpu/><span>Systems</span></div>
          <div className="about-grid-cell"><BrainCircuit/><span>AI</span></div>
          <div className="about-grid-cell"><Database/><span>Data</span></div>
          <div className="about-grid-center">CS</div>
        </div>
      </div>
    </div></section>

    <section className="section track-section"><div className="container">
      <div className="section-head">
        <span className="kicker"><span className="kicker-line"/>تخصصات ومهارات</span>
        <h2>ماذا ستتعلم <span>خلال البكالوريوس؟</span></h2>
        <p>ستة مجالات معرفية مرتبطة بـCS، وليست مسارات جامعية مستقلة. يمكنك مراجعة المقررات الفعلية في الخطة الرسمية.</p>
      </div>
      <div className="tracks-grid about-tracks">
        {studyAreas.map(t => { const Icon = t.icon; return <div className="track-card" key={t.title}>
          <div className="track-icon"><Icon size={23}/></div>
          <strong>{t.title}</strong><p>{t.description}</p>
          <button type="button" className="major-detail-toggle" aria-expanded={expandedStudyArea === t.title} onClick={() => setExpandedStudyArea(v => v === t.title ? null : t.title)}>{expandedStudyArea === t.title ? 'إخفاء الشرح' : 'شرح أكثر'} <ChevronDown size={16}/></button>
          {expandedStudyArea === t.title && <div className="major-detail-content"><p>{details[t.title].detail}</p><p><b>مثال للتطبيق:</b> {details[t.title].example}</p></div>}
        </div> })}
      </div>
    </div></section>

    <section className="section"><div className="container">
      <div className="section-head">
        <span className="kicker"><span className="kicker-line"/>اختيار التخصص</span>
        <h2>IT وCS، <span>ما الفرق بينهما؟</span></h2>
        <p>بينهما تداخل في أساسيات البرمجة والحوسبة، لكن تركيز كل برنامج قد يختلف بحسب خطة الجامعة.</p>
      </div>
      <div className="compare-grid">
        <div className="compare-card"><span className="compare-short">IT</span><h3>تقنية المعلومات</h3><p>يركز غالبًا على تطبيق التقنيات وإدارة الأنظمة والشبكات والبيانات والخدمات لتلبية احتياجات المؤسسات.</p></div>
        <div className="compare-card"><span className="compare-short compare-purple">CS</span><h3>علوم الحاسوب</h3><p>يركز غالبًا على الأسس النظرية للحوسبة والخوارزميات وهياكل البيانات وطرق تصميم البرمجيات.</p></div>
      </div>
      <p className="source-note">المعلومات الأكاديمية عن القسم من <a href="https://hu.edu.ye/compfac/cs/" target="_blank" rel="noopener noreferrer">جامعة حضرموت <ExternalLink size={13}/></a>، وللتوسع في الإطار العلمي: <a href="https://csed.acm.org/knowledge-areas/" target="_blank" rel="noopener noreferrer">CS2023 من ACM <ExternalLink size={13}/></a>.</p>
    </div></section>

    <section className="section cta-section"><div className="container">
      <div className="legacy-cta"><div>
        <span className="kicker light"><Heart size={16}/> من Tech Elite للأجيال القادمة</span>
        <h2>جاهز تبدأ رحلتك في CS؟</h2>
        <p>استعرض مقررات علوم الحاسوب حسب المستوى والفصل، واكتشف مصادرها الدراسية.</p>
        <button className="btn btn-white" onClick={onPlan}>استعرض الخطة <ArrowLeft size={18}/></button>
      </div><div className="cta-visual"><span className="cta-symbol"><Braces size={75}/></span><strong>LEAVE A<br/><em>LEGACY.</em></strong></div></div>
    </div></section>
  </div>
}
