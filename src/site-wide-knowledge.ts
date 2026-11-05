/**
 * Tech Elite site knowledge. Uses the same in-repository public data as the UI.
 * Not a PDF reader and not a live web search. No hallucinated curricula or files.
 */
import { siteConfig, learningTracks, courses } from './data'
import { csAllCourses, csProgram } from './cs-plan-data'
import { cohortMembers } from './cohort-members-data'
import { fullstackStages } from './fullstack-guide-data'
import { laptopTiers } from './laptop-buying-data'
import { normalizeAcademic, buildAcademicContext, siteIdentityContext } from './site-assistant-knowledge'

type Destination = 'about' | 'cs' | 'plan' | 'library' | 'guide'
export type SiteAnswer = { text: string; destination?: Destination; button?: string; followups?: string[]; links?: {title:string; url:string}[] }
const norm = (s:string) => normalizeAcademic(s).replace(/[٠-٩]/g, x=>String(x.charCodeAt(0)-0x660))
const isMaterials = (s:string) => /ملزم|ملازم|محاضر|محاضره|pdf|نموذج|امتحان|اختبار|ملخص|سلايد|ملف|تحميل|تنزيل|ارسل/.test(s)
const hasAny = (s:string,p:RegExp) => p.test(s)
const programs = `${courses.length} مقررًا مدرجًا في بيانات IT و${csAllCourses.length} سجلًا دراسيًا في بيانات CS (وقد تتضمن اختيارات؛ ليست جميعها مقررات إلزامية).`

/** Only return deterministic answers for well identified SITE questions. Other questions go to AI. */
export function findWholeSiteAnswer(raw:string): SiteAnswer|null {
  const q=norm(raw)
  // Do not steal requests to fetch specific PDFs or course resources from academic search.
  if (isMaterials(q)) return null
  const mentionsFullStack = hasAny(q, /full\s*stack|فل\s*ستاك|فول\s*ستاك|خارطه|خارطة|مسار\s*(?:الويب|التعلم|البرمجه)/)
  const mentionsLaptop = hasAny(q,/لابتوب|لاب\s*توب|ابتوب|لابتاب|حاسوب\s*محمول|كمبيوتر\s*محمول|مواصفات\s*الجهاز|اشتري\s*جهاز/)
  const wantsLaptopAdvice = hasAny(q,/مواصفات|متطلبات|شراء|اشتري|اختار|اختيار|تنصح|انسب|افضل|رام|ram|جيل|نصيحه|اجهزه|احتاج|كم/)
  const wantsRoadmap = hasAny(q,/مراحل|خطوات|خارطه|خارطة|ترتيب|مسار|خطة|الخطه|وين.*(?:دليل|خارطه)|ماذا.*(?:مراحل|خارطه)/)

  if (mentionsLaptop && wantsLaptopAdvice) {
    const tiers = laptopTiers.map(t=>`${t.label}: ${t.specs.map(s=>`${s.label}: ${s.value}`).slice(0,4).join('، ')}`).join('\n')
    return {
      text:`مواصفات اللابتوب في دليل Tech Elite هي توصيات، وليست شروطًا إلزامية:\n${tiers}\n\nمهم: فئة المعالج، جيله الحقيقي، RAM، حالة البطارية وإمكانية الترقية أهم من اسم i5 أو i7 وحده.`,
      destination:'guide',button:'فتح دليل Full Stack',followups:['أشرح لي الفرق بين i5 وi7','كم RAM أحتاج لتعلم Flutter؟']
    }
  }
  if (mentionsFullStack && wantsRoadmap) {
    const stages=fullstackStages.map((s,i)=>`${i+1}. ${s.title}`).join('\n')
    return {text:`هذه مراحل Full Stack المدرجة حاليًا في موقع Tech Elite:\n${stages}\n\nاختر مرحلة لأشرحها لك بمثال عملي، أو افتح خارطة Full Stack لعرض مصادرها الرسمية.`,destination:'guide',button:'فتح خارطة Full Stack',followups:['اشرح لي مرحلة Backend','كيف أبدأ React؟']}
  }
  if (/من\s*(?:مندوب|ممثل)|مين\s*(?:مندوب|ممثل)|اسم\s*(?:المندوب|ممثل)/.test(q)) {
    const names=cohortMembers.representatives.map(x=>x.name).filter(Boolean)
    return {text:names.length?`المندوبون المُدرجون في صفحة «دفعتنا»: ${names.join('، ')}.`:'لم يسجل الموقع مندوبًا بعد.'}
  }
  if (/(?:مين|من)\s*(?:المطور|طور|برمج|صمم)|مطورين|مطوري\s*الموقع|فريق\s*تطوير/.test(q)) {
    const names=cohortMembers.developers.map(x=>x.name).filter(Boolean)
    return {text:names.length?`المطورون المُدرجون في صفحة «دفعتنا»: ${names.join('، ')}.`:'لم تُسجل أسماء مطوري الموقع ضمن بياناته بعد.'}
  }
  if (/(?:اسماء|اسامي|قائمه|قائمة|عدد|كم)\s*(?:الطلاب|طلاب|دفعتنا)/.test(q) || /مين\s*طلاب\s*الدفعه/.test(q)) {
    const names=cohortMembers.students.map(x=>x.name).filter(Boolean)
    if (/عدد|كم/.test(q)) return {text:`الأسماء المنشورة حاليًا في قسم الطلاب: ${names.length} اسمًا. هذا عدد المدرجين بالموقع وليس بالضرورة العدد الفعلي لأفراد الدفعة.`}
    return {text:names.length?`أسماء الطلاب المنشورة في Tech Elite (أول ${Math.min(12,names.length)}):\n${names.slice(0,12).map(x=>'• '+x).join('\n')}${names.length>12?'\nبقية الأسماء موجودة في صفحة «دفعتنا».':''}`:'لم تُسجّل أسماء الطلاب بعد.'}
  }
  if (/(?:عدد|كم)\s*(?:المواد|المقررات)|كم\s*ماده/.test(q) && /(?:الخطة|الخطه|الموقع|it|cs|التخصص)/.test(q) && !/مستوي|مستوى|فصل|ترم/.test(q)) {
    return {text:`${programs}\nلعدد مواد فصل أو مستوى محدد، اكتب المستوى والفصل والتخصص؛ حتى لا نخلط المقررات الاختيارية والإلزامية.`,destination:'plan',button:'الخطة الدراسية'}
  }
  if (/الساعات\s*(?:المعتمده|الدراسيه)|كم\s*ساعه/.test(q) && /(it|cs|التخصص|علوم|تقنيه)/.test(q) && !/ماده|مقرر/.test(q)) {
    return {text:`الساعات المعلنة في بيانات موقع Tech Elite: IT = ${siteConfig.announcedCreditHours} ساعة، CS = ${csProgram.announcedHours} ساعة (منها ${csProgram.electiveHours} ساعة اختيارية وفق بيانات الخطة). راجع الموقع الرسمي للجامعة للتأكد من أي تحديث.`,destination:'plan',button:'الخطة الدراسية'}
  }
  if (/(?:ماذا|ما|ايش|وش)\s*(?:في|يوجد|يحتوي|اقسام)\s*(?:الموقع|موقعكم)|اقسام\s*الموقع|وين\s*اجيب\s*الخطة/.test(q)) {
    return {text:'أقسام Tech Elite: الرئيسية، عن IT، عن CS، الخطة الدراسية، مكتبة الملازم والمصادر، خارطة Full Stack ومواصفات الأجهزة، صفحة دفعتنا، والمساعد الأكاديمي. للمقررات افتح الخطة، وللملفات افتح المكتبة.',destination:'plan',button:'فتح الخطة الدراسية'}
  }
  return null
}

// Keywords and factual content are deliberately sourced from the currently bundled site data.
// Question variations are NOT enumerated here: the language model handles paraphrases and spelling.
function siteSections() {
  return [
    { words:'دفعة دفعتنا دفعه جماعتنا موقعكم من انتم tech elite الموقع اهداف', text:siteIdentityContext() },
    { words:'خطة منهج جدول مقرر مواد تخصص تخصصات it cs جامعة حضرموت', text:`خطط IT وCS مأخوذة من بيانات المقررات في الموقع؛ اسأل عن المستوى والفصل ورمز المقرر. ${programs}` },
    { words:'ملزمة ملازم ملف pdf محاضرة سلايد ملخص نموذج اختبار مكتبة مصادر', text:'المكتبة تعرض الموارد المرتبطة بكل مقرر. أسماء الملفات وروابطها من src/telegram-materials.ts ومن موارد المقرر في الخطة. لا تقرأ محتوى PDF. لا تخترع روابط. ملف PDF من أرشيف تيليجرام الخاص قد يحتاج البوت لاستلامه.' },
    { words:'full stack فول ستاك ويب فرونت باك رياكت javascript typescript html css api تعلم برمجة مرحلة', text:`خارطة Full Stack: ${fullstackStages.map((s,i)=>`${i+1} ${s.title}: ${s.goal}`).join(' | ')}` },
    { words:'لابتوب لاب توب ابتوب اشتري شراء جهاز معالج جيل ram ذاكرة ssd محاكي', text:`إرشادات اللابتوب (توصيات فقط): ${laptopTiers.map(t=>`${t.label}: ${t.specs.map(s=>`${s.label}=${s.value}`).slice(0,3).join('; ')}`).join(' | ')}` },
    { words:'طلاب طالب دفعتنا مندوب ممثل مطور مطورين الفريق اشخاص', text:`بيانات صفحة دفعتنا العامة: المندوبون ${cohortMembers.representatives.map(x=>x.name).join('، ')||'غير محدد'}؛ المطورون ${cohortMembers.developers.map(x=>x.name).join('، ')||'غير محدد'}؛ عدد الأسماء المنشورة للطلاب ${cohortMembers.students.length}. لا تدّع معرفة بيانات شخصية أخرى.` },
    { words:'cs علوم الحاسوب اختيار تخصص ساعه خطة اختيارية اختياري', text:`علوم الحاسوب CS: ${csProgram.announcedHours} ساعة معلنة ومنها ${csProgram.electiveHours} اختيارية بحسب بيانات الموقع. لا تخلط مقررًا اختياريًا بمتطلب إلزامي.` },
    { words:'it تقنية المعلومات اختيار تخصص شبكات برمجيات المسارات تخصصي', text:`تقنية المعلومات IT: ${siteConfig.announcedCreditHours} ساعة معلنة؛ مسارات التعلم العامة في الموقع: ${learningTracks.map(t=>t.title).join('، ')}. مفاهيم المسارات للتعلم وليست ضمانًا لتوزيع الجامعة.` },
    { words:'مشروع تخرج تخرج مشاريع الدفعة ملفات مشاريع', text:'الموقع يحتوي قسمًا لمشاريع التخرج، وقد تكون بعض تفاصيل المشاريع أو ملفاتها غير مضافة بعد. لا تخترع أسماء مشاريع أو ملفات أو فرق.' },
    { words:'بوت تيليجرام تليجرام تلجرام قناة ملف استلام محاضره', text:`بوت الدفعة المسجل في إعدادات الموقع: ${siteConfig.telegramBotUsername}. ملازم قناة الأرشيف الخاصة قد تُرسل عبر البوت فقط عند نجاح تكامل الأرشيف.` },
  ]
}
const smallStopwords=new Set(['انت','اني','انا','عندي','كم','مين','بغيت','ابغي','ابي','ابغا','عطني','اعطني','اريد','كيف','ايش','اش','وش','ليش','ما','هل','اللي','حق','عندكم','في','من','عن','الى','موقعكم','موقع','Tech','Elite'])
function words(s:string){return norm(s).split(/\s+/).filter(w=>w.length>=3&&!smallStopwords.has(w))}
export function buildWholeSiteContext(question:string):string {
  const query=words(question)
  const sections=siteSections().map(section=>{
    const ws=words(section.words)
    const hit=query.reduce((score,word)=>score+ws.reduce((s,tag)=>s+(word===tag?4:word.length>=5&&tag.includes(word)?2:0),0),0)
    return {...section,hit}
  }).sort((a,b)=>b.hit-a.hit)
  const relevant=sections.filter(s=>s.hit>0).slice(0,2)
  // Site-specific question context always comes from actual data imports, never from a generated guess.
  const academic=buildAcademicContext(question).replace(siteIdentityContext(),'').trim()
  const pieces=[siteIdentityContext(),...relevant.map(s=>s.text),academic]
  return [...new Set(pieces.filter(Boolean))].join('\n').slice(0,2200)
}
