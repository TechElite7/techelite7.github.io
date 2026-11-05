import { ArrowLeft, BrainCircuit, Cloud, Code2, Database, Network, ShieldCheck, MonitorSmartphone, Cpu, Sigma, ChartNoAxesCombined, Workflow, GraduationCap, ExternalLink } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { learningTracks } from './data'

const icons: Record<string, LucideIcon> = { code: Code2, network: Network, database: Database, security: ShieldCheck, mobile: MonitorSmartphone, cloud: Cloud }

const extraIt = { title:'الحوسبة السحابية وDevOps', english:'Cloud & DevOps', description:'أتمتة بناء الأنظمة ونشرها ومراقبتها وإدارة البنية السحابية.', icon:'cloud', tags:['Cloud', 'Linux', 'CI/CD'] }
const csTracks = [
  { title:'الذكاء الاصطناعي وتعلم الآلة', english:'Artificial Intelligence', description:'بناء نماذج تتعلم من البيانات وتحل مشكلات معقدة.', icon:BrainCircuit, tags:['Python','ML','Neural Networks'] },
  { title:'الخوارزميات وهياكل البيانات', english:'Algorithms & Data Structures', description:'تصميم حلول صحيحة وفعالة وتحليل التعقيد والأداء.', icon:Sigma, tags:['Algorithms','Complexity','Problem Solving'] },
  { title:'هندسة البرمجيات', english:'Software Engineering', description:'تصميم وتطوير واختبار وصيانة الأنظمة البرمجية الكبيرة.', icon:Workflow, tags:['Design','Testing','Architecture'] },
  { title:'علم البيانات', english:'Data Science', description:'تحليل البيانات وإعدادها واستخراج أنماط ومعرفة منها.', icon:ChartNoAxesCombined, tags:['Python','Statistics','Data'] },
  { title:'الأنظمة ونظم التشغيل', english:'Computer Systems', description:'فهم عمل الأنظمة من المعالجات والذاكرة إلى البرمجيات منخفضة المستوى.', icon:Cpu, tags:['OS','C/C++','Systems'] },
  { title:'الأمن والحوسبة الآمنة', english:'Computer Security', description:'دراسة أمن البرمجيات والبروتوكولات والتشفير وأساليب الحماية.', icon:ShieldCheck, tags:['Cryptography','Networks','Security'] },
]

function TrackCard({title, english, description, icon:Icon, tags}:{title:string;english:string;description:string;icon:LucideIcon;tags:readonly string[]}) {
  return <div className="track-card te-six-card"><div className="track-icon"><Icon size={23}/></div><strong>{title}</strong><span className="track-en" dir="ltr">{english}</span><p>{description}</p><div className="tags">{tags.map(t=><small key={t}>{t}</small>)}</div></div>
}

export default function TrackCollections({onGuide, onCs}:{onGuide:()=>void;onCs:()=>void}) {
  return <div className="te-track-collections">
    <div className="tracks-grid te-six-grid">
      {[...learningTracks,extraIt].map(t => {const Icon=icons[t.icon] || Code2;return <TrackCard key={t.title} title={t.title} english={t.english} description={t.description} icon={Icon} tags={t.tags}/>})}
    </div>
    <button className="te-track-guide-cta" onClick={onGuide}><Code2 size={22}/><span><strong>تريد أن تصبح Full Stack Developer؟</strong><small>خارطة تفصيلية من الصفر إلى النشر مع مصادر وروابط الأدوات</small></span><ArrowLeft size={20}/></button>
    <div className="te-cs-track-heading"><span className="te-cs-label"><GraduationCap size={19}/> COMPUTER SCIENCE</span><h3>علوم الحاسوب CS، <em>اكتشف مسارك</em></h3><p>ستة مجالات مهنية ومعرفية من عالم علوم الحاسوب. هذه مجالات للتعلم وليست مسارات رسمية معلنة في خطة جامعتكم.</p></div>
    <div className="tracks-grid te-six-grid te-cs-six-grid">{csTracks.map(t=><TrackCard key={t.title} {...t}/>)}</div>
    <button className="te-cs-more" onClick={onCs}>تعرّف على تخصص علوم الحاسوب <ArrowLeft size={18}/></button>
    <p className="te-track-reference">للتوسع في توصيف مجالات علوم الحاسوب: <a href="https://csed.acm.org/knowledge-areas/" target="_blank" rel="noopener noreferrer">CS2023 من ACM <ExternalLink size={13}/></a></p>
  </div>
}
